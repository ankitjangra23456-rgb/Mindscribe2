from app.services.sci_engine import compute_raw_sci

def test_sci_formula_computation():
    # Ep = 0.8, Vp = 0.9, Alpha = 0.4, Beta = 0.4, Gamma = 0.2
    # Delta = |0.8 - 0.9| = 0.1
    # Expected SCI = (0.4 * 0.8) + (0.4 * 0.9) - (0.2 * 0.1)
    # Expected SCI = 0.32 + 0.36 - 0.02 = 0.66
    ep = 0.8
    vp = 0.9
    alpha = 0.4
    beta = 0.4
    gamma = 0.2

    delta, sci = compute_raw_sci(ep, vp, alpha, beta, gamma)
    assert delta == 0.1
    assert sci == 0.66
