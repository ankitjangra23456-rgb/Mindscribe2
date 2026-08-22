from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status  # pyrefly: ignore [missing-import] # type: ignore
from sqlalchemy.orm import Session  # pyrefly: ignore [missing-import] # type: ignore

from app.database import get_db  # pyrefly: ignore [missing-import] # type: ignore
from app.models.user import User, Role, Permission, RefreshToken  # pyrefly: ignore [missing-import] # type: ignore
import random
from app.schemas.auth import UserRegister, UserLogin, Token, RefreshTokenRequest, UserResponse, SendOTPRequest, VerifyOTPRequest  # pyrefly: ignore [missing-import] # type: ignore
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token  # pyrefly: ignore [missing-import] # type: ignore
from app.core.dependencies import get_current_user, RoleChecker, require_permission
from app.config import settings  # pyrefly: ignore [missing-import] # type: ignore

router = APIRouter(prefix="/api/auth", tags=["Authentication & RBAC"])

# In-memory OTP storage for rapid testing & email delivery fallback
OTP_STORE = {}

from app.services.email_service import send_otp_email

@router.post("/send-otp")
def send_otp(otp_in: SendOTPRequest):
    code = f"{random.randint(100000, 999999)}"
    OTP_STORE[otp_in.email.lower()] = {
        "code": code,
        "created_at": datetime.utcnow()
    }
    print(f"\n==========================================")
    print(f"[OTP GENERATED] Email: {otp_in.email} | Code: {code}")
    print(f"==========================================\n")

    # Send real email via SMTP if configured
    email_sent, debug_info = send_otp_email(otp_in.email, code)

    return {
        "message": f"6-Digit OTP Code sent to {otp_in.email}",
        "email_sent": email_sent,
        "debug_info": debug_info,
        "otp_code": code
    }

@router.get("/test-smtp")
def test_smtp_debug(email: str = "ankit.jangra.23455@gmail.com"):
    code = f"{random.randint(100000, 999999)}"
    success, debug_msg = send_otp_email(email, code)
    return {
        "success": success,
        "debug_msg": debug_msg,
        "smtp_user": os.getenv("SMTP_USER", "")[:5] + "...",
        "smtp_host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
        "smtp_port": os.getenv("SMTP_PORT", "587")
    }
@router.post("/verify-otp")
def verify_otp(otp_in: VerifyOTPRequest):
    entry = OTP_STORE.get(otp_in.email.lower())
    if not entry:
        raise HTTPException(status_code=400, detail="OTP expired or not sent for this email. Please request a new code.")

    if entry["code"] != otp_in.otp_code:
        raise HTTPException(status_code=400, detail="Incorrect 6-digit OTP code. Please check your email.")

    # Clean up used OTP
    OTP_STORE.pop(otp_in.email.lower(), None)
    return {"valid": True, "message": "OTP verified successfully"}

@router.post("/login-with-otp", response_model=Token)
def login_with_otp(otp_in: VerifyOTPRequest, db: Session = Depends(get_db)):
    entry = OTP_STORE.get(otp_in.email.lower())
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired or not requested for this email"
        )
    
    if entry["code"] != otp_in.otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 6-digit OTP code"
        )

    if (datetime.utcnow() - entry["created_at"]).total_seconds() > 600:
        OTP_STORE.pop(otp_in.email.lower(), None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP code expired. Please request a new code."
        )

    OTP_STORE.pop(otp_in.email.lower(), None)

    user = db.query(User).filter(User.email == otp_in.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No registered user account found with this email"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    user_roles = [r.name for r in user.roles]
    token_data = {"sub": user.email, "roles": user_roles}

    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh_token = RefreshToken(
        token=refresh_token,
        user_id=user.id,
        expires_at=expires_at
    )
    db.add(db_refresh_token)
    log_audit_event(db, action="LOGIN_WITH_OTP_SUCCESS", user_id=user.id)
    db.commit()

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

def ensure_roles_and_permissions_exist(db: Session):
    default_roles = ["Admin", "Faculty", "Student"]
    permissions_list = [
        ("exam:create", "Create exams"),
        ("exam:publish", "Publish exams"),
        ("question:manage", "Manage question bank"),
        ("results:view_own", "View own exam results"),
        ("results:view_all", "View all exam results"),
        ("user:manage", "Manage system users"),
    ]

    permission_objs = {}
    for perm_name, desc in permissions_list:
        perm = db.query(Permission).filter(Permission.name == perm_name).first()
        if not perm:
            perm = Permission(name=perm_name, description=desc)
            db.add(perm)
            db.flush()
        permission_objs[perm_name] = perm

    role_permissions_map = {
        "Admin": ["exam:create", "exam:publish", "question:manage", "results:view_own", "results:view_all", "user:manage"],
        "Faculty": ["exam:create", "exam:publish", "question:manage", "results:view_own", "results:view_all"],
        "Student": ["results:view_own"],
    }

    for role_name in default_roles:
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role:
            role = Role(name=role_name, description=f"{role_name} Role")
            db.add(role)
            db.flush()

        target_perms = [permission_objs[p] for p in role_permissions_map[role_name] if p in permission_objs]
        for p in target_perms:
            if p not in role.permissions:
                role.permissions.append(p)

    db.commit()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    ensure_roles_and_permissions_exist(db)

    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )

    role_obj = db.query(Role).filter(Role.name == user_in.role).first()
    if not role_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {user_in.role}. Valid roles are Admin, Faculty, Student"
        )

    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_pwd,
        is_active=True
    )
    new_user.roles.append(role_obj)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    user_roles = [r.name for r in new_user.roles]
    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        is_active=new_user.is_active,
        roles=user_roles,
        created_at=new_user.created_at
    )

from app.core.audit import log_audit_event

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        log_audit_event(db, action="LOGIN_FAILED", user_id=user.id if user else None)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    user_roles = [r.name for r in user.roles]
    token_data = {"sub": user.email, "roles": user_roles}

    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh_token = RefreshToken(
        token=refresh_token,
        user_id=user.id,
        expires_at=expires_at
    )
    db.add(db_refresh_token)
    log_audit_event(db, action="LOGIN_SUCCESS", user_id=user.id)
    db.commit()

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

@router.post("/refresh", response_model=Token)
def refresh_token(token_in: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(token_in.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    db_token = db.query(RefreshToken).filter(RefreshToken.token == token_in.refresh_token).first()

    if not db_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token not found")

    if db_token.revoked:
        log_audit_event(db, action="REFRESH_TOKEN_REUSE_ATTEMPT", user_id=db_token.user_id)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token already revoked (reuse attempt detected)")

    if db_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    user = db.query(User).filter(User.id == db_token.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    # Rotate token: invalidate used token
    db_token.revoked = True

    user_roles = [r.name for r in user.roles]
    token_data = {"sub": user.email, "roles": user_roles}

    new_access_token = create_access_token(data=token_data)
    new_refresh_token = create_refresh_token(data=token_data)

    new_db_token = RefreshToken(
        token=new_refresh_token,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(new_db_token)
    log_audit_event(db, action="REFRESH_TOKEN_SUCCESS", user_id=user.id)
    db.commit()

    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer"
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    user_roles = [r.name for r in current_user.roles]
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        roles=user_roles,
        created_at=current_user.created_at
    )

@router.get("/admin-only")
def admin_only_route(current_user: User = Depends(require_permission("user:manage"))):
    return {"message": f"Hello Admin {current_user.full_name}, access granted."}

@router.get("/faculty-only")
def faculty_only_route(current_user: User = Depends(require_permission("question:manage"))):
    return {"message": f"Hello Faculty/Admin {current_user.full_name}, access granted."}
