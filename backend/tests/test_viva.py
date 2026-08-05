from app.services.viva_scorer import calculate_semantic_consistency
from app.services.viva_ai import generate_viva_followup

def test_viva_followup_generation_fallback():
    prompt = "Explain object-oriented polymorphism."
    answer = "Polymorphism allows objects of different classes to respond to the same method call."
    followup = generate_viva_followup(prompt, answer)
    assert followup is not None
    assert len(followup) > 10

def test_semantic_consistency_scoring():
    # Consistent pair -> High score
    original = "Database normalization reduces data redundancy and improves data integrity by organizing tables."
    consistent_reply = "Normalization minimizes redundant data storage and prevents insertion and update anomalies in relational databases."
    high_score = calculate_semantic_consistency(original, consistent_reply)
    assert high_score > 0.20

    # Inconsistent / Irrelevant pair -> Lower score
    inconsistent_reply = "The weather today is very sunny and hot outside."
    low_score = calculate_semantic_consistency(original, inconsistent_reply)
    assert low_score < high_score
