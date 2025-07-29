"""
사용자 모델
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    """사용자 모델"""
    
    __tablename__ = "users"
    
    # 기본 필드
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        index=True
    )
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # 상태 필드
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    
    # 프로필 정보
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    
    # 설정
    language = Column(String(10), default="ko")
    timezone = Column(String(50), default="Asia/Seoul")
    
    # 소셜 로그인
    google_id = Column(String(255), nullable=True, unique=True)
    github_id = Column(String(255), nullable=True, unique=True)
    
    # 구독 정보
    subscription_type = Column(String(50), default="free")  # free, premium, enterprise
    subscription_expires_at = Column(DateTime, nullable=True)
    
    # 사용량 추적
    monthly_uploads = Column(Integer, default=0)
    total_uploads = Column(Integer, default=0)
    last_upload_at = Column(DateTime, nullable=True)
    
    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)
    
    # 관계
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, username={self.username})>"
    
    @property
    def is_premium_active(self) -> bool:
        """프리미엄 구독이 활성 상태인지 확인"""
        if not self.is_premium:
            return False
        if self.subscription_expires_at is None:
            return True
        return self.subscription_expires_at > datetime.utcnow()
    
    def can_upload_file(self) -> bool:
        """파일 업로드 가능 여부 확인"""
        if not self.is_active:
            return False
        
        # 프리미엄 사용자는 제한 없음
        if self.is_premium_active:
            return True
        
        # 일반 사용자는 월 50개 제한
        return self.monthly_uploads < 50
    
    def increment_upload_count(self):
        """업로드 카운트 증가"""
        self.monthly_uploads += 1
        self.total_uploads += 1
        self.last_upload_at = datetime.utcnow()
    
    def reset_monthly_uploads(self):
        """월별 업로드 카운트 리셋"""
        self.monthly_uploads = 0

