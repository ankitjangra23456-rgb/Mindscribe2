import json
import logging
import difflib
from app.config import settings

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

logger = logging.getLogger("mindscribe.viva_scorer")

def calculate_semantic_consistency(original_answer: str, viva_reply: str) -> float:
    """
    Computes semantic consistency score in range [0.0, 1.0] between the student's original answer
    and their follow-up viva response using Google Gemini API structured JSON output mode.
    Falls back gracefully to term vector ratio if Gemini API is unreachable or key is missing.
    """
    if not original_answer.strip() or not viva_reply.strip():
        return 0.0

    api_key = settings.GEMINI_API_KEY or settings.LLM_API_KEY
    if GENAI_AVAILABLE and api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name=settings.GEMINI_MODEL_NAME,
                generation_config={"response_mime_type": "application/json"}
            )
            prompt = (
                "Evaluate the semantic consistency and conceptual alignment between the student's written exam answer "
                "and their oral viva follow-up reply.\n\n"
                f"Original Written Answer: {original_answer}\n"
                f"Viva Follow-Up Reply: {viva_reply}\n\n"
                "Return a JSON object with two fields:\n"
                '{"consistency_score": <float between 0.0 and 1.0>, "explanation": "<brief rationale>"}'
            )
            response = model.generate_content(prompt)
            if response and response.text:
                data = json.loads(response.text)
                score = float(data.get("consistency_score", 0.0))
                return round(max(0.0, min(1.0, score)), 4)
        except Exception as exc:
            logger.warning(f"Gemini consistency scoring failed: {exc}. Using fallback matcher.")

    # High-accuracy fallback: Jaccard & Sequence similarity vector blend
    words_a = set(original_answer.lower().split())
    words_b = set(viva_reply.lower().split())
    
    intersection = len(words_a.intersection(words_b))
    union = len(words_a.union(words_b))
    jaccard = intersection / union if union > 0 else 0.0

    seq_matcher = difflib.SequenceMatcher(None, original_answer.lower(), viva_reply.lower())
    ratio = seq_matcher.ratio()

    combined_score = (0.5 * jaccard) + (0.5 * ratio)
    return round(max(0.0, min(1.0, float(combined_score))), 4)
