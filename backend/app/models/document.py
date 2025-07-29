"""
문서 모델
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class DocumentStatus(str, enum.Enum):
    """문서 처리 상태"""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    DELETED = "deleted"


class Document(Base):
    """문서 모델"""
    
    __tablename__ = "documents"
    
    # 기본 필드
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        index=True
    )
    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # 파일 정보
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_hash = Column(String(64), nullable=True)  # SHA-256 해시
    
    # 처리 상태
    status = Column(
        Enum(DocumentStatus),
        default=DocumentStatus.UPLOADED,
        nullable=False,
        index=True
    )
    error_message = Column(Text, nullable=True)
    
    # 문서 메타데이터
    page_count = Column(Integer, nullable=True)
    word_count = Column(Integer, nullable=True)
    language = Column(String(10), nullable=True)
    
    # 처리 정보
    processing_started_at = Column(DateTime, nullable=True)
    processing_completed_at = Column(DateTime, nullable=True)
    processing_time = Column(Integer, nullable=True)  # 초 단위
    
    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계
    user = relationship("User", back_populates="documents")
    analyses = relationship("Analysis", back_populates="document", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Document(id={self.id}, filename={self.filename}, status={self.status})>"
    
    @property
    def is_processing(self) -> bool:
        """처리 중인지 확인"""
        return self.status == DocumentStatus.PROCESSING
    
    @property
    def is_completed(self) -> bool:
        """처리 완료되었는지 확인"""
        return self.status == DocumentStatus.COMPLETED
    
    @property
    def is_failed(self) -> bool:
        """처리 실패했는지 확인"""
        return self.status == DocumentStatus.FAILED
    
    @property
    def file_size_mb(self) -> float:
        """파일 크기를 MB 단위로 반환"""
        return self.file_size / (1024 * 1024)
    
    def start_processing(self):
        """처리 시작"""
        self.status = DocumentStatus.PROCESSING
        self.processing_started_at = datetime.utcnow()
        self.error_message = None
    
    def complete_processing(self, processing_time: int = None):
        """처리 완료"""
        self.status = DocumentStatus.COMPLETED
        self.processing_completed_at = datetime.utcnow()
        
        if processing_time:
            self.processing_time = processing_time
        elif self.processing_started_at:
            delta = self.processing_completed_at - self.processing_started_at
            self.processing_time = int(delta.total_seconds())
    
    def fail_processing(self, error_message: str):
        """처리 실패"""
        self.status = DocumentStatus.FAILED
        self.error_message = error_message
        self.processing_completed_at = datetime.utcnow()
        
        if self.processing_started_at:
            delta = self.processing_completed_at - self.processing_started_at
            self.processing_time = int(delta.total_seconds())
    
    def get_latest_analysis(self):
        """최신 분석 결과 반환"""
        if self.analyses:
            return max(self.analyses, key=lambda x: x.created_at)
        return None

