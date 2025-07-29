"""
분석 결과 API 엔드포인트
"""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.models.analysis import Analysis
from app.schemas.analysis import (
    AnalysisResponse,
    AnalysisList,
    AnalysisStats,
    AnalysisRequest,
    AnalysisOptions,
    TextAnalysisRequest,
    TextAnalysisResponse,
    AnalysisSummary
)
from app.services.text_cleaner import TextCleaner
from app.services.ai_analyzer import AIAnalyzer

router = APIRouter()

# 서비스 인스턴스
text_cleaner = TextCleaner()
ai_analyzer = AIAnalyzer()


@router.get("/", response_model=AnalysisList)
async def get_analyses(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    language: Optional[str] = None,
    ai_model: Optional[str] = None,
    min_confidence: Optional[float] = Query(None, ge=0, le=1),
    sort_by: str = Query("created_at", regex="^(created_at|confidence_score|processing_time)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    사용자의 분석 결과 목록 조회
    """
    # 사용자의 문서에 대한 분석만 조회
    query = db.query(Analysis).join(Document).filter(Document.user_id == current_user.id)
    
    # 필터 적용
    if language:
        query = query.filter(Analysis.language == language)
    if ai_model:
        query = query.filter(Analysis.ai_model == ai_model)
    if min_confidence is not None:
        query = query.filter(Analysis.confidence_score >= min_confidence)
    
    # 정렬
    order_func = desc if sort_order == "desc" else asc
    if sort_by == "created_at":
        query = query.order_by(order_func(Analysis.created_at))
    elif sort_by == "confidence_score":
        query = query.order_by(order_func(Analysis.confidence_score))
    elif sort_by == "processing_time":
        query = query.order_by(order_func(Analysis.processing_time))
    
    # 페이지네이션
    total = query.count()
    analyses = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "items": analyses,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    특정 분석 결과 조회
    """
    analysis = db.query(Analysis).join(Document).filter(
        Analysis.id == analysis_id,
        Document.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="분석 결과를 찾을 수 없습니다"
        )
    
    return analysis


@router.get("/document/{document_id}", response_model=AnalysisResponse)
async def get_analysis_by_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    문서의 최신 분석 결과 조회
    """
    # 문서 소유권 확인
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="문서를 찾을 수 없습니다"
        )
    
    # 최신 분석 결과 조회
    analysis = db.query(Analysis).filter(
        Analysis.document_id == document_id
    ).order_by(desc(Analysis.created_at)).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="분석 결과가 없습니다. 문서 처리가 완료되지 않았을 수 있습니다"
        )
    
    return analysis


@router.post("/analyze-text", response_model=TextAnalysisResponse)
async def analyze_text_directly(
    request: TextAnalysisRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    텍스트 직접 분석 (파일 업로드 없이)
    """
    try:
        # 텍스트 정제
        clean_result = text_cleaner.clean_text(
            request.text, 
            options={
                "spell_check": request.options.spell_check if request.options else False
            }
        )
        
        # AI 분석
        analysis_result = await ai_analyzer.analyze_document(
            clean_result["cleaned_text"],
            language=request.language,
            is_premium=current_user.is_premium
        )
        
        return {
            "summary": analysis_result["summary"],
            "keywords": analysis_result["keywords"],
            "qa_pairs": analysis_result["qa_pairs"],
            "important_sentences": analysis_result["important_sentences"],
            "statistics": clean_result["statistics"],
            "processing_time": analysis_result["processing_time"],
            "confidence_score": analysis_result["confidence_score"]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"텍스트 분석 중 오류가 발생했습니다: {str(e)}"
        )


@router.post("/document/{document_id}/reanalyze")
async def reanalyze_document(
    document_id: uuid.UUID,
    options: Optional[AnalysisOptions] = None,
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    문서 재분석 (새로운 옵션으로)
    """
    # 문서 소유권 확인
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="문서를 찾을 수 없습니다"
        )
    
    if document.status != DocumentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="완료된 문서만 재분석할 수 있습니다"
        )
    
    # 기존 분석 결과가 있는지 확인
    existing_analysis = db.query(Analysis).filter(
        Analysis.document_id == document_id
    ).first()
    
    if not existing_analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="기존 분석 결과가 없습니다"
        )
    
    try:
        # 새로운 분석 수행
        analysis_result = await ai_analyzer.analyze_document(
            existing_analysis.cleaned_text,
            language=existing_analysis.language,
            model=options.use_premium_model if options and options.use_premium_model and current_user.is_premium else None,
            is_premium=current_user.is_premium
        )
        
        # 새로운 분석 결과 생성
        new_analysis = Analysis(
            document_id=document.id,
            raw_text=existing_analysis.raw_text,
            cleaned_text=existing_analysis.cleaned_text,
            summary=analysis_result["summary"],
            keywords=analysis_result["keywords"],
            qa_pairs=analysis_result["qa_pairs"],
            important_sentences=analysis_result["important_sentences"],
            ai_model=analysis_result["ai_model"],
            language=analysis_result["language"],
            processing_time=analysis_result["processing_time"],
            confidence_score=analysis_result["confidence_score"],
            total_pages=existing_analysis.total_pages,
            total_words=existing_analysis.total_words,
            total_sentences=existing_analysis.total_sentences,
            total_paragraphs=existing_analysis.total_paragraphs
        )
        
        db.add(new_analysis)
        db.commit()
        db.refresh(new_analysis)
        
        return {
            "message": "문서 재분석이 완료되었습니다",
            "analysis_id": new_analysis.id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"재분석 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/{analysis_id}/summary", response_model=AnalysisSummary)
async def get_analysis_summary(
    analysis_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    분석 결과 요약 정보 조회
    """
    analysis = db.query(Analysis).join(Document).filter(
        Analysis.id == analysis_id,
        Document.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="분석 결과를 찾을 수 없습니다"
        )
    
    return {
        "id": analysis.id,
        "document_id": analysis.document_id,
        "summary": analysis.summary,
        "keyword_count": len(analysis.keywords) if analysis.keywords else 0,
        "qa_count": len(analysis.qa_pairs) if analysis.qa_pairs else 0,
        "sentence_count": len(analysis.important_sentences) if analysis.important_sentences else 0,
        "confidence_score": analysis.confidence_score,
        "processing_time": analysis.processing_time,
        "created_at": analysis.created_at
    }


@router.get("/{analysis_id}/markdown")
async def get_analysis_markdown(
    analysis_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    분석 결과를 마크다운 형식으로 반환
    """
    analysis = db.query(Analysis).join(Document).filter(
        Analysis.id == analysis_id,
        Document.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="분석 결과를 찾을 수 없습니다"
        )
    
    markdown_content = analysis.to_markdown()
    
    return {
        "content": markdown_content,
        "filename": f"analysis_{analysis.id}.md"
    }


@router.delete("/{analysis_id}")
async def delete_analysis(
    analysis_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    분석 결과 삭제
    """
    analysis = db.query(Analysis).join(Document).filter(
        Analysis.id == analysis_id,
        Document.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="분석 결과를 찾을 수 없습니다"
        )
    
    db.delete(analysis)
    db.commit()
    
    return {"message": "분석 결과가 성공적으로 삭제되었습니다"}


@router.get("/stats/overview", response_model=AnalysisStats)
async def get_analysis_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    사용자의 분석 통계 조회
    """
    from sqlalchemy import func
    
    # 사용자의 분석 결과만 조회
    base_query = db.query(Analysis).join(Document).filter(Document.user_id == current_user.id)
    
    # 기본 통계
    total_analyses = base_query.count()
    
    # 평균 처리 시간
    avg_processing_time = base_query.filter(
        Analysis.processing_time.isnot(None)
    ).with_entities(func.avg(Analysis.processing_time)).scalar()
    
    # 평균 신뢰도 점수
    avg_confidence_score = base_query.filter(
        Analysis.confidence_score.isnot(None)
    ).with_entities(func.avg(Analysis.confidence_score)).scalar()
    
    # 언어별 분포
    language_stats = db.query(
        Analysis.language,
        func.count(Analysis.id)
    ).join(Document).filter(
        Document.user_id == current_user.id
    ).group_by(Analysis.language).all()
    
    language_distribution = {lang: count for lang, count in language_stats}
    
    # 모델별 사용량
    model_stats = db.query(
        Analysis.ai_model,
        func.count(Analysis.id)
    ).join(Document).filter(
        Document.user_id == current_user.id
    ).group_by(Analysis.ai_model).all()
    
    model_usage = {model: count for model, count in model_stats if model}
    
    return {
        "total_analyses": total_analyses,
        "average_processing_time": float(avg_processing_time) if avg_processing_time else None,
        "average_confidence_score": float(avg_confidence_score) if avg_confidence_score else None,
        "language_distribution": language_distribution,
        "model_usage": model_usage
    }

