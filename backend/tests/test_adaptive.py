from app.services.adaptive_engine import calculate_next_difficulty

def test_adaptive_difficulty_escalation():
    # Right answer on easy question -> escalate to medium
    next_diff, reason = calculate_next_difficulty("easy", is_correct=True)
    assert next_diff == "medium"

    # Right answer on medium question -> escalate to hard
    next_diff, reason = calculate_next_difficulty("medium", is_correct=True)
    assert next_diff == "hard"

    # Right answer on hard question -> retain hard
    next_diff, reason = calculate_next_difficulty("hard", is_correct=True)
    assert next_diff == "hard"

def test_adaptive_difficulty_deescalation():
    # Wrong answer on hard question -> de-escalate to medium
    next_diff, reason = calculate_next_difficulty("hard", is_correct=False)
    assert next_diff == "medium"

    # Wrong answer on medium question -> de-escalate to easy
    next_diff, reason = calculate_next_difficulty("medium", is_correct=False)
    assert next_diff == "easy"

    # Wrong answer on easy question -> retain easy
    next_diff, reason = calculate_next_difficulty("easy", is_correct=False)
    assert next_diff == "easy"
