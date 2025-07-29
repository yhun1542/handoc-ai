"""
내보내기 모델
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class ExportType(str, enum.Enum):
    """내보내기 타입"""
    MARKDOWN = "markdown"
    PDF = "pdf"
    TXT = "txt"
    JSON = "json"
    DOCX = "docx"
    GDRIVE = "gdrive"
    NOTION = "notion"
    CHATGPT = "chatgpt"


class ExportStatus(str, enum.Enum):
    """내보내기 상태"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Export(Base):
    """내보내기 모델"""
    
    __tablename__ = "exports"
    
    # 기본 필드
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        index=True
    )
    analysis_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("analyses.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # 내보내기 정보
    export_type = Column(
        Enum(ExportType),
        nullable=False,
        index=True
    )
    status = Column(
        Enum(ExportStatus),
        default=ExportStatus.PENDING,
        nullable=False,
        index=True
    )
    
    # 파일 정보
    filename = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)
    file_size = Column(Integer, nullable=True)
    
    # 외부 서비스 정보
    external_url = Column(String(500), nullable=True)  # Google Drive, Notion 등의 URL
    external_id = Column(String(255), nullable=True)   # 외부 서비스의 ID
    
    # 설정
    include_metadata = Column(Boolean, default=False)
    template_name = Column(String(100), nullable=True)
    
    # 처리 정보
    processing_started_at = Column(DateTime, nullable=True)
    processing_completed_at = Column(DateTime, nullable=True)
    processing_time = Column(Integer, nullable=True)  # 초 단위
    error_message = Column(Text, nullable=True)
    
    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계
    analysis = relationship("Analysis", back_populates="exports")
    
    def __repr__(self):
        return f"<Export(id={self.id}, type={self.export_type}, status={self.status})>"
    
    @property
    def is_completed(self) -> bool:
        """완료되었는지 확인"""
        return self.status == ExportStatus.COMPLETED
    
    @property
    def is_failed(self) -> bool:
        """실패했는지 확인"""
        return self.status == ExportStatus.FAILED
    
    @property
    def is_processing(self) -> bool:
        """처리 중인지 확인"""
        return self.status == ExportStatus.PROCESSING
    
    @property
    def file_size_mb(self) -> float:
        """파일 크기를 MB 단위로 반환"""
        if not self.file_size:
            return 0.0
        return self.file_size / (1024 * 1024)
    
    def start_processing(self):
        """처리 시작"""
        self.status = ExportStatus.PROCESSING
        self.processing_started_at = datetime.utcnow()
        self.error_message = None
    
    def complete_processing(self, file_path: str = None, external_url: str = None):
        """처리 완료"""
        self.status = ExportStatus.COMPLETED
        self.processing_completed_at = datetime.utcnow()
        
        if file_path:
            self.file_path = file_path
        if external_url:
            self.external_url = external_url
        
        if self.processing_started_at:
            delta = self.processing_completed_at - self.processing_started_at
            self.processing_time = int(delta.total_seconds())
    
    def fail_processing(self, error_message: str):
        """처리 실패"""
        self.status = ExportStatus.FAILED
        self.error_message = error_message
        self.processing_completed_at = datetime.utcnow()
        
        if self.processing_started_at:
            delta = self.processing_completed_at - self.processing_started_at
            self.processing_time = int(delta.total_seconds())
    
    def get_download_url(self, base_url: str = "") -> str:
        """다운로드 URL 생성"""
        if self.external_url:
            return self.external_url
        
        if self.file_path and base_url:
            return f"{base_url}/api/v1/exports/{self.id}/download"
        
        return ""
    
    def get_file_extension(self) -> str:
        """파일 확장자 반환"""
        extension_map = {
            ExportType.MARKDOWN: ".md",
            ExportType.PDF: ".pdf",
            ExportType.TXT: ".txt",
            ExportType.JSON: ".json",
            ExportType.DOCX: ".docx",
        }
        return extension_map.get(self.export_type, "")
    
    def generate_filename(self, base_name: str = "analysis") -> str:
        """파일명 생성"""
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        extension = self.get_file_extension()
        return f"{base_name}_{timestamp}{extension}"

