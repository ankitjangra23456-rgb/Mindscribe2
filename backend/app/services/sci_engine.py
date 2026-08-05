try:
    from sqlalchemy.orm import Session
except ImportError:
    Session = None

from app.models.attempt import Attempt
from app.models.viva import VivaSession, VivaQuestion
from app.models.viva_scoring import VivaResponse
from app.models.sci import SkillConfidenceRecord

def compute_raw_sci(ep: float, vp: float, alpha: float, beta: float, gamma: float) -> tuple[float, float]:
    """
    Computes divergence gap Delta and final SCI score.
    Formula: SCI = alpha * Ep + beta * Vp - gamma * |Ep - Vp|
    """
    delta = abs(ep - vp)
    sci = (alpha * ep) + (beta * vp) - (gamma * delta)
    return round(delta, 4), round(sci, 4)

def calculate_sci_for_attempt(db: Session, attempt_id: int) -> SkillConfidenceRecord:
    if not db:
        return None

    attempt = db.query(Attempt).filter(Attempt.id == attempt_id).first()
    if not attempt:
        raise ValueError("Attempt not found")

    exam = attempt.exam
    alpha = exam.alpha
    beta = exam.beta
    gamma = exam.gamma

    ep_score = 0.0
    if attempt.total_objective_marks > 0:
        ep_score = max(0.0, min(1.0, attempt.objective_score / attempt.total_objective_marks))

    v_session = db.query(VivaSession).filter(VivaSession.attempt_id == attempt_id).first()
    vp_score = 0.0
    if v_session:
        responses = db.query(VivaResponse).join(VivaQuestion).filter(
            VivaQuestion.viva_session_id == v_session.id
        ).all()
        if responses:
            vp_score = sum(r.consistency_score for r in responses) / len(responses)
            vp_score = max(0.0, min(1.0, vp_score))
        else:
            vp_score = ep_score
    else:
        vp_score = ep_score

    delta_gap, sci_score = compute_raw_sci(ep_score, vp_score, alpha, beta, gamma)

    existing_record = db.query(SkillConfidenceRecord).filter(
        SkillConfidenceRecord.attempt_id == attempt_id
    ).first()

    if existing_record:
        existing_record.ep_score = ep_score
        existing_record.vp_score = vp_score
        existing_record.delta_gap = delta_gap
        existing_record.sci_score = sci_score
        existing_record.alpha = alpha
        existing_record.beta = beta
        existing_record.gamma = gamma
        db.commit()
        db.refresh(existing_record)
        return existing_record
    else:
        new_record = SkillConfidenceRecord(
            attempt_id=attempt.id,
            student_id=attempt.student_id,
            exam_id=exam.id,
            ep_score=ep_score,
            vp_score=vp_score,
            delta_gap=delta_gap,
            sci_score=sci_score,
            alpha=alpha,
            beta=beta,
            gamma=gamma
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return new_record
