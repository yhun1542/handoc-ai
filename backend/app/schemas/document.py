"""
문서 관련 Pydantic 스키마
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, validator
import uuid

from app.models.document import DocumentStatus


class DocumentBase(BaseModel):
    """문서 기본 스키마"""
    original_filename: str
    language: Optional[str] = "ko"


class DocumentCreate(DocumentBase):
    """문서 생성 스키마"""
    pass


class DocumentUpdate(BaseModel):
    """문서 수정 스키마"""
    language: Optional[str] = None


class DocumentResponse(DocumentBase):
    """문서 응답 스키마"""
    id: uuid.UUID
    user_id: uuid.UUID
    filename: str
    file_size: int
    file_path: str
    mime_type: str
    file_hash: Optional[str] = None
    status: DocumentStatus
    error_message: Optional[str] = None
    page_count: Optional[int] = None
    word_count: Optional[int] = None
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    processing_time: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DocumentList(BaseModel):
    """문서 목록 스키마"""
    items: List[DocumentResponse]
    total: int
    page: int
    limit: int
    pages: int


class DocumentStats(BaseModel):
    """문서 통계 스키마"""
    total_documents: int
    completed_documents: int
    failed_documents: int
    processing_documents: int
    total_file_size: int
    average_processing_time: Optional[float] = None


class DocumentFilter(BaseModel):
    """문서 필터 스키마"""
    status: Optional[DocumentStatus] = None
    language: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    min_file_size: Optional[int] = None
    max_file_size: Optional[int] = None


class DocumentSearch(BaseModel):
    """문서 검색 스키마"""
    query: str
    filters: Optional[DocumentFilter] = None
    page: int = 1
    limit: int = 20
    
    @validator('limit')
    def validate_limit(cls, v):
        if v > 100:
            raise ValueError('한 번에 최대 100개까지만 조회 가능합니다')
        return v


class FileUploadResponse(BaseModel):
    """파일 업로드 응답 스키마"""
    message: str
    task_id: uuid.UUID
    document: DocumentResponse
    estimated_time: int  # 예상 처리 시간 (초)


class ProcessingStatus(BaseModel):
    """처리 상태 스키마"""
    task_id: uuid.UUID
    status: DocumentStatus
    progress: int  # 0-100
    current_step: Optional[str] = None
    estimated_remaining: Optional[int] = None  # 남은 시간 (초)
    error_message: Optional[str] = None


class DocumentMetadata(BaseModel):
    """문서 메타데이터 스키마"""
    title: Optional[str] = None
    author: Optional[str] = None
    subject: Optional[str] = None
    creator: Optional[str] = None
    producer: Optional[str] = None
    creation_date: Optional[str] = None
    modification_date: Optional[str] = None
    page_count: Optional[int] = None
    word_count: Optional[int] = None
    character_count: Optional[int] = None
    language: Optional[str] = None

