import logging
from app.config import settings

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

logger = logging.getLogger("mindscribe.viva_ai")

def generate_viva_followup(question_prompt: str, student_answer: str) -> str:
    """
    Generates 1-2 targeted AI Viva follow-up questions from a student's subjective answer
    using the Google Gemini API (via google-generativeai SDK).
    Retries once on API timeout or failure before falling back gracefully to heuristic generation.
    """
    system_instruction = (
        "You are an expert oral examiner conducting an AI Viva. "
        "Given an exam question and a student's subjective answer, generate 1-2 concise, "
        "probing follow-up oral questions to verify the student's deep conceptual understanding."
    )

    user_prompt = (
        f"Original Exam Question: {question_prompt}\n"
        f"Student's Submitted Answer: {student_answer}\n\n"
        "Generate 1-2 targeted follow-up viva questions:"
    )

    api_key = settings.GEMINI_API_KEY or settings.LLM_API_KEY
    if GENAI_AVAILABLE and api_key:
        max_retries = 2
        for attempt in range(1, max_retries + 1):
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel(
                    model_name=settings.GEMINI_MODEL_NAME,
                    system_instruction=system_instruction
                )
                response = model.generate_content(user_prompt)
                if response and response.text:
                    return response.text.strip()
            except Exception as exc:
                logger.warning(f"Gemini API call attempt {attempt}/{max_retries} failed: {exc}")

    # Fallback heuristic prompt generator guarantees exam session continuity
    words = student_answer.strip().split() if student_answer else []
    first_few = " ".join(words[:6]) if len(words) >= 6 else (student_answer or "your answer")
    return (
        f"In your response, you stated: '{first_few}...'. "
        f"Could you elaborate on the core underlying mechanism behind this concept and provide a real-world example?"
    )
