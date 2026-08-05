try:
    from sqlalchemy.orm import Session
except ImportError:
    Session = None

from app.models.adaptive import AdaptiveStateLog

DIFFICULTY_LEVELS = ["easy", "medium", "hard"]

def calculate_next_difficulty(current_difficulty: str, is_correct: bool) -> tuple[str, str]:
    """
    Rule-based adaptive difficulty algorithm:
    - Correct answer -> escalation towards harder questions
    - Incorrect answer -> de-escalation towards easier questions
    """
    curr = current_difficulty.lower()
    if curr not in DIFFICULTY_LEVELS:
        curr = "medium"

    idx = DIFFICULTY_LEVELS.index(curr)

    if is_correct:
        if idx < len(DIFFICULTY_LEVELS) - 1:
            next_diff = DIFFICULTY_LEVELS[idx + 1]
            reason = f"Correct answer submitted on {curr} question -> escalated to {next_diff}"
        else:
            next_diff = curr
            reason = f"Correct answer submitted on max difficulty {curr} -> retained hard level"
    else:
        if idx > 0:
            next_diff = DIFFICULTY_LEVELS[idx - 1]
            reason = f"Incorrect answer submitted on {curr} question -> de-escalated to {next_diff}"
        else:
            next_diff = curr
            reason = f"Incorrect answer submitted on min difficulty {curr} -> retained easy level"

    return next_diff, reason

def log_adaptive_shift(
    db: Session,
    attempt_id: int,
    question_id: int,
    is_correct: bool,
    current_difficulty: str
) -> AdaptiveStateLog:
    next_diff, reason = calculate_next_difficulty(current_difficulty, is_correct)

    log_entry = AdaptiveStateLog(
        attempt_id=attempt_id,
        question_id=question_id,
        is_correct=is_correct,
        previous_difficulty=current_difficulty,
        next_difficulty=next_diff,
        shift_reason=reason
    )

    if db:
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
    return log_entry
