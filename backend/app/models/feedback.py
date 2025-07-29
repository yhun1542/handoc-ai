"""
피드백 모델
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class FeedbackType(str, enum.Enum):
    """피드백 타입"""
    QUALITY = "quality"        # 분석 품질
    SPEED = "speed"           # 처리 속도
    ACCURACY = "accuracy"     # 정확도
    UI = "ui"                # 사용자 인터페이스
    FEATURE = "feature"       # 기능 요청
    BUG = "bug"              # 버그 신고
    GENERAL = "general"       # 일반 피드백


class Feedback(Base):
    """피드백 모델"""
    
    __tablename__ = "feedback"
    
    # 기본 필드
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        index=True
    )
    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    analysis_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("analyses.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # 피드백 내용
    rating = Column(Integer, nullable=True)  # 1-5 점수
    comment = Column(Text, nullable=True)
    feedback_type = Column(
        Enum(FeedbackType),
        default=FeedbackType.GENERAL,
        nullable=False,
        index=True
    )
    
    # 추가 정보
    user_agent = Column(String(500), nullable=True)
    ip_address = Column(String(45), nullable=True)
    page_url = Column(String(500), nullable=True)
    
    # 처리 상태
    is_resolved = Column(Boolean, default=False)
    admin_response = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(255), nullable=True)
    
    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계
    user = relationship("User", back_populates="feedback")
    analysis = relationship("Analysis", back_populates="feedback")
    
    def __repr__(self):
        return f"<Feedback(id={self.id}, type={self.feedback_type}, rating={self.rating})>"
    
    @property
    def is_positive(self) -> bool:
        """긍정적 피드백인지 확인 (4점 이상)"""
        return self.rating is not None and self.rating >= 4
    
    @property
    def is_negative(self) -> bool:
        """부정적 피드백인지 확인 (2점 이하)"""
        return self.rating is not None and self.rating <= 2
    
    @property
    def severity_level(self) -> str:
        """심각도 레벨 반환"""
        if self.feedback_type == FeedbackType.BUG:
            if self.rating and self.rating <= 2:
                return "critical"
            elif self.rating and self.rating <= 3:
                return "high"
            else:
                return "medium"
        elif self.feedback_type == FeedbackType.FEATURE:
            return "enhancement"
        elif self.is_negative:
            return "high"
        else:
            return "low"
    
    def resolve(self, admin_response: str = None, resolved_by: str = None):
        """피드백 해결 처리"""
        self.is_resolved = True
        self.resolved_at = datetime.utcnow()
        if admin_response:
            self.admin_response = admin_response
        if resolved_by:
            self.resolved_by = resolved_by
    
    def get_summary(self) -> dict:
        """피드백 요약 정보 반환"""
        return {
            "id": str(self.id),
            "type": self.feedback_type,
            "rating": self.rating,
            "comment_preview": self.comment[:100] + "..." if self.comment and len(self.comment) > 100 else self.comment,
            "severity": self.severity_level,
            "is_resolved": self.is_resolved,
            "created_at": self.created_at.isoformat(),
            "user_id": str(self.user_id) if self.user_id else None,
            "analysis_id": str(self.analysis_id) if self.analysis_id else None
        }

