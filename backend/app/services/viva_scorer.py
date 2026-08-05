import difflib
import math

_model = None

def _get_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"Notice: sentence-transformers model not initialized ({e}). Using vector term similarity fallback.")
            _model = False
    return _model

def calculate_semantic_consistency(original_answer: str, viva_reply: str) -> float:
    """
    Computes semantic consistency score in range [0.0, 1.0] between the student's original answer
    and their follow-up viva response.
    """
    if not original_answer.strip() or not viva_reply.strip():
        return 0.0

    model = _get_model()
    if model:
        try:
            from sentence_transformers import util
            emb1 = model.encode(original_answer, convert_to_tensor=True)
            emb2 = model.encode(viva_reply, convert_to_tensor=True)
            similarity = util.cos_sim(emb1, emb2).item()
            return round(max(0.0, min(1.0, float(similarity))), 4)
        except Exception as e:
            print(f"Embedding scoring error: {e}")

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
