import json
import logging
from app.config import settings

try:
    import requests
except ImportError:
    requests = None

logger = logging.getLogger("mindscribe.viva_ai")

def generate_viva_followup(question_prompt: str, student_answer: str) -> str:
    """
    Generates 1-2 targeted AI Viva follow-up questions from a student's subjective answer.
    Retries once on API timeout or failure before falling back gracefully to heuristic generation
    without raising an unhandled exception.
    """
    system_prompt = (
        "You are an expert oral examiner conducting an AI Viva. "
        "Given an exam question and a student's subjective answer, generate 1-2 concise, "
        "probing follow-up oral questions to verify the student's deep conceptual understanding."
    )

    user_prompt = (
        f"Original Exam Question: {question_prompt}\n"
        f"Student's Submitted Answer: {student_answer}\n\n"
        "Generate 1-2 targeted follow-up viva questions:"
    )

    if settings.LLM_API_KEY and requests is not None:
        max_retries = 2
        for attempt in range(1, max_retries + 1):
            try:
                headers = {
                    "Authorization": f"Bearer {settings.LLM_API_KEY}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": settings.LLM_MODEL_NAME,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 150
                }
                response = requests.post(settings.LLM_API_URL, json=payload, headers=headers, timeout=4)
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    logger.warning(f"LLM API returned status {response.status_code} on attempt {attempt}")
            except Exception as exc:
                logger.warning(f"LLM API call attempt {attempt}/{max_retries} failed: {exc}")

    # Fallback heuristic prompt generator guarantees exam session continuity
    words = student_answer.strip().split() if student_answer else []
    first_few = " ".join(words[:6]) if len(words) >= 6 else (student_answer or "your answer")
    return (
        f"In your response, you stated: '{first_few}...'. "
        f"Could you elaborate on the core underlying mechanism behind this concept and provide a real-world example?"
    )
