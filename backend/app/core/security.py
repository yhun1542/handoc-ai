"""
보안 및 인증 관련 유틸리티
"""

from datetime import datetime, timedelta
from typing import Any, Union, Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

# 비밀번호 해싱 컨텍스트
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 토큰 스키마
security = HTTPBearer()


def create_access_token(
    subject: Union[str, Any], 
    expires_delta: timedelta = None
) -> str:
    """
    JWT 액세스 토큰 생성
    
    Args:
        subject: 토큰 주체 (보통 사용자 ID)
        expires_delta: 만료 시간
        
    Returns:
        JWT 토큰 문자열
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str) -> Optional[str]:
    """
    JWT 토큰 검증
    
    Args:
        token: JWT 토큰
        
    Returns:
        토큰에서 추출한 사용자 ID 또는 None
    """
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    비밀번호 검증
    
    Args:
        plain_password: 평문 비밀번호
        hashed_password: 해시된 비밀번호
        
    Returns:
        비밀번호 일치 여부
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    비밀번호 해싱
    
    Args:
        password: 평문 비밀번호
        
    Returns:
        해시된 비밀번호
    """
    return pwd_context.hash(password)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    현재 인증된 사용자 조회
    
    Args:
        credentials: HTTP 인증 자격증명
        db: 데이터베이스 세션
        
    Returns:
        현재 사용자 객체
        
    Raises:
        HTTPException: 인증 실패 시
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        user_id = verify_token(token)
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    현재 활성 사용자 조회
    
    Args:
        current_user: 현재 사용자
        
    Returns:
        활성 사용자 객체
        
    Raises:
        HTTPException: 비활성 사용자인 경우
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user


def get_current_premium_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    현재 프리미엄 사용자 조회
    
    Args:
        current_user: 현재 활성 사용자
        
    Returns:
        프리미엄 사용자 객체
        
    Raises:
        HTTPException: 프리미엄 사용자가 아닌 경우
    """
    if not current_user.is_premium:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium subscription required"
        )
    return current_user


def create_refresh_token(user_id: str) -> str:
    """
    리프레시 토큰 생성
    
    Args:
        user_id: 사용자 ID
        
    Returns:
        리프레시 토큰
    """
    expire = datetime.utcnow() + timedelta(days=30)  # 30일
    to_encode = {"exp": expire, "sub": str(user_id), "type": "refresh"}
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_refresh_token(token: str) -> Optional[str]:
    """
    리프레시 토큰 검증
    
    Args:
        token: 리프레시 토큰
        
    Returns:
        사용자 ID 또는 None
    """
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id is None or token_type != "refresh":
            return None
        return user_id
    except JWTError:
        return None


def generate_password_reset_token(email: str) -> str:
    """
    비밀번호 재설정 토큰 생성
    
    Args:
        email: 사용자 이메일
        
    Returns:
        비밀번호 재설정 토큰
    """
    expire = datetime.utcnow() + timedelta(hours=1)  # 1시간
    to_encode = {"exp": expire, "sub": email, "type": "password_reset"}
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> Optional[str]:
    """
    비밀번호 재설정 토큰 검증
    
    Args:
        token: 비밀번호 재설정 토큰
        
    Returns:
        이메일 또는 None
    """
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if email is None or token_type != "password_reset":
            return None
        return email
    except JWTError:
        return None

