"""
사용자 관련 Pydantic 스키마
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, validator
import uuid


class UserBase(BaseModel):
    """사용자 기본 스키마"""
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    language: str = "ko"
    timezone: str = "Asia/Seoul"


class UserCreate(UserBase):
    """사용자 생성 스키마"""
    password: str
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('비밀번호가 일치하지 않습니다')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('비밀번호는 최소 8자 이상이어야 합니다')
        if not any(c.isdigit() for c in v):
            raise ValueError('비밀번호에는 숫자가 포함되어야 합니다')
        if not any(c.isalpha() for c in v):
            raise ValueError('비밀번호에는 문자가 포함되어야 합니다')
        return v
    
    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('사용자명은 최소 3자 이상이어야 합니다')
        if len(v) > 20:
            raise ValueError('사용자명은 최대 20자까지 가능합니다')
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('사용자명은 영문, 숫자, _, - 만 사용 가능합니다')
        return v


class UserUpdate(BaseModel):
    """사용자 정보 수정 스키마"""
    username: Optional[str] = None
    full_name: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    bio: Optional[str] = None
    
    @validator('username')
    def validate_username(cls, v):
        if v is not None:
            if len(v) < 3:
                raise ValueError('사용자명은 최소 3자 이상이어야 합니다')
            if len(v) > 20:
                raise ValueError('사용자명은 최대 20자까지 가능합니다')
            if not v.replace('_', '').replace('-', '').isalnum():
                raise ValueError('사용자명은 영문, 숫자, _, - 만 사용 가능합니다')
        return v


class UserLogin(BaseModel):
    """로그인 스키마"""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """사용자 응답 스키마"""
    id: uuid.UUID
    is_active: bool
    is_premium: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    subscription_type: str
    monthly_uploads: int
    total_uploads: int
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserStats(BaseModel):
    """사용자 통계 스키마"""
    total_documents: int
    total_analyses: int
    total_exports: int
    monthly_uploads: int
    storage_used: int  # bytes
    last_activity: Optional[datetime] = None


class PasswordReset(BaseModel):
    """비밀번호 재설정 스키마"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """비밀번호 재설정 확인 스키마"""
    token: str
    new_password: str
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('비밀번호가 일치하지 않습니다')
        return v


class PasswordChange(BaseModel):
    """비밀번호 변경 스키마"""
    current_password: str
    new_password: str
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('비밀번호가 일치하지 않습니다')
        return v


class Token(BaseModel):
    """토큰 스키마"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class TokenRefresh(BaseModel):
    """토큰 갱신 스키마"""
    refresh_token: str


class SocialLogin(BaseModel):
    """소셜 로그인 스키마"""
    provider: str  # google, github
    access_token: str
    id_token: Optional[str] = None

