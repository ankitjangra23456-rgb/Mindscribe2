from app.services.ledger_service import compute_record_hash, GENESIS_HASH

def test_paper_ledger_hash_integrity():
    prev_hash = GENESIS_HASH
    event_type = "PAPER_ACCESS"
    exam_id = 101
    actor_id = 5
    payload = "Exam paper requested by student session"
    ts = "2026-08-03T22:00:00.000000"

    hash1 = compute_record_hash(prev_hash, event_type, exam_id, actor_id, payload, ts)
    assert len(hash1) == 64  # Valid SHA-256 string

    # Re-computing with identical inputs produces matching hash
    hash2 = compute_record_hash(prev_hash, event_type, exam_id, actor_id, payload, ts)
    assert hash1 == hash2

    # Corrupting payload changes hash
    corrupted_hash = compute_record_hash(prev_hash, event_type, exam_id, actor_id, "TAMPERED PAYLOAD", ts)
    assert hash1 != corrupted_hash
