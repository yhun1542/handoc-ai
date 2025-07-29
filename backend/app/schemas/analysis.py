"""
분석 결과 관련 Pydantic 스키마
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, validator
import uuid


class KeywordItem(BaseModel):
    """키워드 아이템 스키마"""
    keyword: str
    frequency: int
    importance: float
    
    @validator('importance')
    def validate_importance(cls, v):
        if not 0 <= v <= 1:
            raise ValueError('중요도는 0과 1 사이의 값이어야 합니다')
        return v


class QAPair(BaseModel):
    """Q&A 쌍 스키마"""
    question: str
    answer: str
    confidence: float
    
    @validator('confidence')
    def validate_confidence(cls, v):
        if not 0 <= v <= 1:
            raise ValueError('신뢰도는 0과 1 사이의 값이어야 합니다')
        return v


class ImportantSentence(BaseModel):
    """중요 문장 스키마"""
    sentence: str
    importance: float
    page: int
    
    @validator('importance')
    def validate_importance(cls, v):
        if not 0 <= v <= 1:
            raise ValueError('중요도는 0과 1 사이의 값이어야 합니다')
        return v


class AnalysisBase(BaseModel):
    """분석 기본 스키마"""
    language: str = "ko"
    ai_model: Optional[str] = None


class AnalysisCreate(AnalysisBase):
    """분석 생성 스키마"""
    document_id: uuid.UUID


class AnalysisUpdate(BaseModel):
    """분석 수정 스키마"""
    summary: Optional[str] = None
    keywords: Optional[List[KeywordItem]] = None
    qa_pairs: Optional[List[QAPair]] = None
    important_sentences: Optional[List[ImportantSentence]] = None


class AnalysisResponse(AnalysisBase):
    """분석 응답 스키마"""
    id: uuid.UUID
    document_id: uuid.UUID
    raw_text: Optional[str] = None
    cleaned_text: Optional[str] = None
    summary: Optional[str] = None
    keywords: Optional[List[KeywordItem]] = None
    qa_pairs: Optional[List[QAPair]] = None
    important_sentences: Optional[List[ImportantSentence]] = None
    metadata: Optional[Dict[str, Any]] = None
    processing_time: Optional[int] = None
    confidence_score: Optional[float] = None
    readability_score: Optional[float] = None
    total_pages: Optional[int] = None
    total_words: Optional[int] = None
    total_sentences: Optional[int] = None
    total_paragraphs: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AnalysisList(BaseModel):
    """분석 목록 스키마"""
    items: List[AnalysisResponse]
    total: int
    page: int
    limit: int
    pages: int


class AnalysisStats(BaseModel):
    """분석 통계 스키마"""
    total_analyses: int
    average_processing_time: Optional[float] = None
    average_confidence_score: Optional[float] = None
    language_distribution: Dict[str, int]
    model_usage: Dict[str, int]


class AnalysisFilter(BaseModel):
    """분석 필터 스키마"""
    language: Optional[str] = None
    ai_model: Optional[str] = None
    min_confidence: Optional[float] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


class AnalysisSearch(BaseModel):
    """분석 검색 스키마"""
    query: str
    filters: Optional[AnalysisFilter] = None
    page: int = 1
    limit: int = 20
    
    @validator('limit')
    def validate_limit(cls, v):
        if v > 100:
            raise ValueError('한 번에 최대 100개까지만 조회 가능합니다')
        return v


class AnalysisRequest(BaseModel):
    """분석 요청 스키마"""
    document_id: uuid.UUID
    options: Optional[Dict[str, Any]] = None
    priority: str = "normal"  # low, normal, high
    
    @validator('priority')
    def validate_priority(cls, v):
        if v not in ['low', 'normal', 'high']:
            raise ValueError('우선순위는 low, normal, high 중 하나여야 합니다')
        return v


class AnalysisOptions(BaseModel):
    """분석 옵션 스키마"""
    include_raw_text: bool = True
    include_cleaned_text: bool = True
    generate_summary: bool = True
    generate_qa: bool = True
    generate_keywords: bool = True
    extract_sentences: bool = True
    max_keywords: int = 15
    max_qa_pairs: int = 5
    max_sentences: int = 8
    spell_check: bool = False
    use_premium_model: bool = False
    
    @validator('max_keywords')
    def validate_max_keywords(cls, v):
        if not 1 <= v <= 50:
            raise ValueError('키워드 수는 1-50 사이여야 합니다')
        return v
    
    @validator('max_qa_pairs')
    def validate_max_qa_pairs(cls, v):
        if not 1 <= v <= 20:
            raise ValueError('Q&A 쌍 수는 1-20 사이여야 합니다')
        return v
    
    @validator('max_sentences')
    def validate_max_sentences(cls, v):
        if not 1 <= v <= 30:
            raise ValueError('중요 문장 수는 1-30 사이여야 합니다')
        return v


class AnalysisSummary(BaseModel):
    """분석 요약 스키마"""
    id: uuid.UUID
    document_id: uuid.UUID
    summary: Optional[str] = None
    keyword_count: int
    qa_count: int
    sentence_count: int
    confidence_score: Optional[float] = None
    processing_time: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class TextAnalysisRequest(BaseModel):
    """텍스트 직접 분석 요청 스키마"""
    text: str
    language: str = "ko"
    options: Optional[AnalysisOptions] = None
    
    @validator('text')
    def validate_text(cls, v):
        if len(v.strip()) < 100:
            raise ValueError('분석할 텍스트는 최소 100자 이상이어야 합니다')
        if len(v) > 100000:
            raise ValueError('텍스트는 최대 100,000자까지 분석 가능합니다')
        return v


class TextAnalysisResponse(BaseModel):
    """텍스트 분석 응답 스키마"""
    summary: Optional[str] = None
    keywords: Optional[List[KeywordItem]] = None
    qa_pairs: Optional[List[QAPair]] = None
    important_sentences: Optional[List[ImportantSentence]] = None
    statistics: Dict[str, Any]
    processing_time: int
    confidence_score: float

