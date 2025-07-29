"""
인증 관련 API 엔드포인트
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token, 
    verify_password, 
    get_password_hash,
    verify_password_reset_token,
    generate_password_reset_token
)
from app.models.user import User
from app.schemas.user import (
    UserCreate, 
    UserResponse, 
    UserLogin, 
    Token, 
    PasswordReset,
    PasswordResetConfirm,
    TokenRefresh
)

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    새 사용자 등록
    """
    # 이메일 중복 확인
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 등록된 이메일입니다"
        )
    
    # 사용자명 중복 확인
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 사용자명입니다"
        )
    
    # 새 사용자 생성
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        language=user_data.language,
        timezone=user_data.timezone
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    사용자 로그인
    """
    # 사용자 확인
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 비활성 사용자 확인
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="비활성화된 계정입니다"
        )
    
    # 액세스 토큰 생성
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id), 
        expires_delta=access_token_expires
    )
    
    # 로그인 시간 업데이트
    from datetime import datetime
    user.last_login_at = datetime.utcnow()
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user
    }


@router.post("/login/oauth", response_model=Token)
async def oauth_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    OAuth2 호환 로그인 (Swagger UI용)
    """
    # 사용자 확인
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 비활성 사용자 확인
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="비활성화된 계정입니다"
        )
    
    # 액세스 토큰 생성
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id), 
        expires_delta=access_token_expires
    )
    
    # 로그인 시간 업데이트
    from datetime import datetime
    user.last_login_at = datetime.utcnow()
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user
    }


@router.post("/password-reset")
async def request_password_reset(reset_data: PasswordReset, db: Session = Depends(get_db)):
    """
    비밀번호 재설정 요청
    """
    user = db.query(User).filter(User.email == reset_data.email).first()
    if not user:
        # 보안상 사용자 존재 여부를 알려주지 않음
        return {"message": "비밀번호 재설정 링크가 이메일로 전송되었습니다"}
    
    # 재설정 토큰 생성
    reset_token = generate_password_reset_token(user.email)
    
    # TODO: 이메일 발송 로직 구현
    # send_password_reset_email(user.email, reset_token)
    
    return {"message": "비밀번호 재설정 링크가 이메일로 전송되었습니다"}


@router.post("/password-reset/confirm")
async def confirm_password_reset(reset_data: PasswordResetConfirm, db: Session = Depends(get_db)):
    """
    비밀번호 재설정 확인
    """
    email = verify_password_reset_token(reset_data.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="유효하지 않거나 만료된 토큰입니다"
        )
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    
    # 새 비밀번호 설정
    user.hashed_password = get_password_hash(reset_data.new_password)
    db.commit()
    
    return {"message": "비밀번호가 성공적으로 변경되었습니다"}


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_data: TokenRefresh, db: Session = Depends(get_db)):
    """
    토큰 갱신
    """
    from app.core.security import verify_refresh_token
    
    user_id = verify_refresh_token(refresh_data.refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 리프레시 토큰입니다"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자를 찾을 수 없거나 비활성 상태입니다"
        )
    
    # 새 액세스 토큰 생성
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id), 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user
    }


@router.post("/logout")
async def logout():
    """
    로그아웃 (클라이언트에서 토큰 삭제)
    """
    # JWT는 stateless이므로 서버에서 할 일이 없음
    # 클라이언트에서 토큰을 삭제하면 됨
    return {"message": "성공적으로 로그아웃되었습니다"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    현재 사용자 정보 조회
    """
    return current_user


@router.get("/verify-token")
async def verify_token_endpoint(current_user: User = Depends(get_current_active_user)):
    """
    토큰 유효성 검증
    """
    return {
        "valid": True,
        "user_id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username
    }

