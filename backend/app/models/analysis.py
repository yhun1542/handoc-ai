"""
분석 결과 모델
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from typing import List, Dict, Any

from app.core.database import Base


class Analysis(Base):
    """분석 결과 모델"""
    
    __tablename__ = "analyses"
    
    # 기본 필드
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        index=True
    )
    document_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # 텍스트 데이터
    raw_text = Column(Text, nullable=True)
    cleaned_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    
    # JSON 데이터
    keywords = Column(JSON, nullable=True)  # [{"keyword": str, "frequency": int, "importance": float}]
    qa_pairs = Column(JSON, nullable=True)  # [{"question": str, "answer": str, "confidence": float}]
    important_sentences = Column(JSON, nullable=True)  # [{"sentence": str, "importance": float, "page": int}]
    metadata = Column(JSON, nullable=True)  # 추가 메타데이터
    
    # 분석 정보
    ai_model = Column(String(50), nullable=True)  # gpt-4, gpt-3.5-turbo 등
    language = Column(String(10), default="ko")
    processing_time = Column(Integer, nullable=True)  # 초 단위
    
    # 품질 메트릭
    confidence_score = Column(Float, nullable=True)  # 0.0 ~ 1.0
    readability_score = Column(Float, nullable=True)  # 가독성 점수
    
    # 통계
    total_pages = Column(Integer, nullable=True)
    total_words = Column(Integer, nullable=True)
    total_sentences = Column(Integer, nullable=True)
    total_paragraphs = Column(Integer, nullable=True)
    
    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계
    document = relationship("Document", back_populates="analyses")
    exports = relationship("Export", back_populates="analysis", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="analysis", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Analysis(id={self.id}, document_id={self.document_id}, ai_model={self.ai_model})>"
    
    @property
    def keyword_list(self) -> List[str]:
        """키워드 목록 반환"""
        if not self.keywords:
            return []
        return [item.get("keyword", "") for item in self.keywords if item.get("keyword")]
    
    @property
    def top_keywords(self, limit: int = 10) -> List[Dict[str, Any]]:
        """상위 키워드 반환"""
        if not self.keywords:
            return []
        
        # 중요도 순으로 정렬
        sorted_keywords = sorted(
            self.keywords, 
            key=lambda x: x.get("importance", 0), 
            reverse=True
        )
        return sorted_keywords[:limit]
    
    @property
    def question_list(self) -> List[str]:
        """질문 목록 반환"""
        if not self.qa_pairs:
            return []
        return [item.get("question", "") for item in self.qa_pairs if item.get("question")]
    
    @property
    def high_confidence_qa(self, threshold: float = 0.7) -> List[Dict[str, Any]]:
        """높은 신뢰도의 Q&A 반환"""
        if not self.qa_pairs:
            return []
        
        return [
            qa for qa in self.qa_pairs 
            if qa.get("confidence", 0) >= threshold
        ]
    
    @property
    def key_sentences(self, limit: int = 5) -> List[str]:
        """핵심 문장 반환"""
        if not self.important_sentences:
            return []
        
        # 중요도 순으로 정렬
        sorted_sentences = sorted(
            self.important_sentences,
            key=lambda x: x.get("importance", 0),
            reverse=True
        )
        return [
            sentence.get("sentence", "") 
            for sentence in sorted_sentences[:limit]
            if sentence.get("sentence")
        ]
    
    def add_keyword(self, keyword: str, frequency: int = 1, importance: float = 0.5):
        """키워드 추가"""
        if not self.keywords:
            self.keywords = []
        
        self.keywords.append({
            "keyword": keyword,
            "frequency": frequency,
            "importance": importance
        })
    
    def add_qa_pair(self, question: str, answer: str, confidence: float = 0.8):
        """Q&A 쌍 추가"""
        if not self.qa_pairs:
            self.qa_pairs = []
        
        self.qa_pairs.append({
            "question": question,
            "answer": answer,
            "confidence": confidence
        })
    
    def add_important_sentence(self, sentence: str, importance: float = 0.8, page: int = 1):
        """중요 문장 추가"""
        if not self.important_sentences:
            self.important_sentences = []
        
        self.important_sentences.append({
            "sentence": sentence,
            "importance": importance,
            "page": page
        })
    
    def get_summary_stats(self) -> Dict[str, Any]:
        """분석 요약 통계 반환"""
        return {
            "total_pages": self.total_pages or 0,
            "total_words": self.total_words or 0,
            "total_sentences": self.total_sentences or 0,
            "total_paragraphs": self.total_paragraphs or 0,
            "keyword_count": len(self.keywords) if self.keywords else 0,
            "qa_count": len(self.qa_pairs) if self.qa_pairs else 0,
            "important_sentence_count": len(self.important_sentences) if self.important_sentences else 0,
            "processing_time": self.processing_time,
            "confidence_score": self.confidence_score,
            "ai_model": self.ai_model,
            "language": self.language
        }
    
    def to_markdown(self) -> str:
        """마크다운 형식으로 변환"""
        lines = []
        
        # 제목
        lines.append(f"# 문서 분석 결과")
        lines.append("")
        
        # 요약
        if self.summary:
            lines.append("## 📋 요약")
            lines.append(self.summary)
            lines.append("")
        
        # 키워드
        if self.keywords:
            lines.append("## 🔑 주요 키워드")
            for keyword in self.top_keywords:
                lines.append(f"- **{keyword['keyword']}** (중요도: {keyword.get('importance', 0):.2f})")
            lines.append("")
        
        # Q&A
        if self.qa_pairs:
            lines.append("## ❓ 질문과 답변")
            for i, qa in enumerate(self.qa_pairs, 1):
                lines.append(f"### Q{i}: {qa['question']}")
                lines.append(f"**A**: {qa['answer']}")
                lines.append("")
        
        # 중요 문장
        if self.important_sentences:
            lines.append("## 💡 핵심 문장")
            for sentence in self.key_sentences:
                lines.append(f"- {sentence}")
            lines.append("")
        
        # 통계
        stats = self.get_summary_stats()
        lines.append("## 📊 분석 통계")
        lines.append(f"- 총 페이지 수: {stats['total_pages']}")
        lines.append(f"- 총 단어 수: {stats['total_words']}")
        lines.append(f"- 처리 시간: {stats['processing_time']}초")
        lines.append(f"- AI 모델: {stats['ai_model']}")
        lines.append("")
        
        return "\n".join(lines)

