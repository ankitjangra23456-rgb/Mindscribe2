from app.core.security import get_password_hash, verify_password, create_access_token, decode_token

def test_password_hashing():
    pwd = "SecretPassword123"
    hashed = get_password_hash(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) == True
    assert verify_password("WrongPassword", hashed) == False

def test_jwt_token_generation():
    data = {"sub": "student@university.edu", "roles": ["Student"]}
    token = create_access_token(data)
    assert token is not None

    decoded = decode_token(token)
    assert decoded is not None
    assert decoded["sub"] == "student@university.edu"
    assert "Student" in decoded["roles"]
