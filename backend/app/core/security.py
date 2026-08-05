import hmac
import hashlib
import json
import base64
from datetime import datetime, timedelta
from typing import Optional
from app.config import settings

# Native bcrypt or hashlib password hashing (avoids passlib legacy bcrypt 4.x bug)
try:
    import bcrypt
    def get_password_hash(password: str) -> str:
        pwd_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception:
            return False
except ImportError:
    def get_password_hash(password: str) -> str:
        return hashlib.sha256((password + settings.SECRET_KEY).encode('utf-8')).hexdigest()
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return get_password_hash(plain_password) == hashed_password

# JWT handling with native fallback
try:
    from jose import jwt, JWTError
except ImportError:
    try:
        import jwt
        JWTError = jwt.PyJWTError
    except ImportError:
        jwt = None
        JWTError = Exception

def _custom_b64encode(s: bytes) -> str:
    return base64.urlsafe_b64encode(s).decode('utf-8').rstrip('=')

def _custom_b64decode(s: str) -> bytes:
    padding = '=' * (4 - (len(s) % 4))
    return base64.urlsafe_b64decode(s + padding)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp()), "type": "access"})

    if jwt is not None:
        try:
            return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        except Exception:
            pass

    header = _custom_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode('utf-8'))
    payload = _custom_b64encode(json.dumps(to_encode).encode('utf-8'))
    signature_raw = hmac.new(settings.SECRET_KEY.encode('utf-8'), f"{header}.{payload}".encode('utf-8'), hashlib.sha256).digest()
    signature = _custom_b64encode(signature_raw)
    return f"{header}.{payload}.{signature}"

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": int(expire.timestamp()), "type": "refresh"})

    if jwt is not None:
        try:
            return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        except Exception:
            pass

    header = _custom_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode('utf-8'))
    payload = _custom_b64encode(json.dumps(to_encode).encode('utf-8'))
    signature_raw = hmac.new(settings.SECRET_KEY.encode('utf-8'), f"{header}.{payload}".encode('utf-8'), hashlib.sha256).digest()
    signature = _custom_b64encode(signature_raw)
    return f"{header}.{payload}.{signature}"

def decode_token(token: str) -> Optional[dict]:
    if jwt is not None:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except Exception:
            pass

    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        expected_sig_raw = hmac.new(settings.SECRET_KEY.encode('utf-8'), f"{header_b64}.{payload_b64}".encode('utf-8'), hashlib.sha256).digest()
        expected_sig = _custom_b64encode(expected_sig_raw)
        if not hmac.compare_digest(sig_b64, expected_sig):
            return None
        payload_bytes = _custom_b64decode(payload_b64)
        payload = json.loads(payload_bytes.decode('utf-8'))
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            return None
        return payload
    except Exception:
        return None
