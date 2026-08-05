from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class RoleSchema(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: Optional[str] = "Student"  # Default role is Student, allowed: Admin, Faculty, Student, Recruiter

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenData(BaseModel):
    email: Optional[str] = None
    roles: List[str] = []

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    roles: List[str]
    created_at: datetime

    class Config:
        from_attributes = True
