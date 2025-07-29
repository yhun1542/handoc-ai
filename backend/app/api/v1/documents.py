"""
문서 관리 API 엔드포인트
"""

import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.schemas.document import (
    DocumentResponse, 
    DocumentList, 
    DocumentStats,
    DocumentFilter,
    DocumentSearch,
    FileUploadResponse,
    ProcessingStatus
)
from app.services.pdf_processor import PDFProcessor
from app.services.text_cleaner import TextCleaner
from app.services.ai_analyzer import AIAnalyzer

router = APIRouter()

# 서비스 인스턴스
pdf_processor = PDFProcessor()
text_cleaner = TextCleaner()
ai_analyzer = AIAnalyzer()


@router.post("/upload", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    PDF 문서 업로드
    """
    # 파일 타입 확인
    if file.content_type not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PDF 파일만 업로드 가능합니다"
        )
    
    # 파일 크기 확인
    file_content = await file.read()
    if len(file_content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"파일 크기는 {settings.MAX_FILE_SIZE // (1024*1024)}MB를 초과할 수 없습니다"
        )
    
    # 업로드 제한 확인
    if not current_user.can_upload_file():
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="월 업로드 제한에 도달했습니다. 프리미엄으로 업그레이드하세요"
        )
    
    # 파일 저장
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{file_id}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # 파일 정보 추출
    try:
        file_info = pdf_processor.get_file_info(file_path)
        is_valid, error_msg = pdf_processor.validate_pdf(file_path)
        
        if not is_valid:
            os.remove(file_path)  # 잘못된 파일 삭제
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"유효하지 않은 PDF 파일입니다: {error_msg}"
            )
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"파일 처리 중 오류가 발생했습니다: {str(e)}"
        )
    
    # 데이터베이스에 문서 정보 저장
    document = Document(
        user_id=current_user.id,
        filename=filename,
        original_filename=file.filename,
        file_size=len(file_content),
        file_path=file_path,
        mime_type=file.content_type,
        file_hash=file_info["file_hash"],
        status=DocumentStatus.UPLOADED
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # 사용자 업로드 카운트 증가
    current_user.increment_upload_count()
    db.commit()
    
    # 백그라운드에서 문서 처리 시작
    task_id = uuid.uuid4()
    background_tasks.add_task(process_document_background, document.id, db)
    
    return {
        "message": "파일이 성공적으로 업로드되었습니다. 분석이 시작됩니다.",
        "task_id": task_id,
        "document": document,
        "estimated_time": 60  # 예상 처리 시간 (초)
    }


async def process_document_background(document_id: uuid.UUID, db: Session):
    """
    백그라운드에서 문서 처리
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        return
    
    try:
        # 처리 시작
        document.start_processing()
        db.commit()
        
        # PDF 텍스트 추출
        pdf_result = pdf_processor.extract_text(document.file_path)
        
        # 텍스트 정제
        clean_result = text_cleaner.clean_text(pdf_result["text"])
        
        # AI 분석
        user = db.query(User).filter(User.id == document.user_id).first()
        analysis_result = await ai_analyzer.analyze_document(
            clean_result["cleaned_text"],
            language=clean_result["language"],
            is_premium=user.is_premium if user else False
        )
        
        # 분석 결과 저장
        from app.models.analysis import Analysis
        analysis = Analysis(
            document_id=document.id,
            raw_text=pdf_result["text"],
            cleaned_text=clean_result["cleaned_text"],
            summary=analysis_result["summary"],
            keywords=analysis_result["keywords"],
            qa_pairs=analysis_result["qa_pairs"],
            important_sentences=analysis_result["important_sentences"],
            ai_model=analysis_result["ai_model"],
            language=analysis_result["language"],
            processing_time=analysis_result["processing_time"],
            confidence_score=analysis_result["confidence_score"],
            total_pages=pdf_result.get("page_count"),
            total_words=clean_result["statistics"]["word_count"],
            total_sentences=clean_result["statistics"]["sentence_count"],
            total_paragraphs=clean_result["statistics"]["paragraph_count"]
        )
        
        db.add(analysis)
        
        # 문서 정보 업데이트
        document.page_count = pdf_result.get("page_count")
        document.word_count = clean_result["statistics"]["word_count"]
        document.language = clean_result["language"]
        document.complete_processing()
        
        db.commit()
        
    except Exception as e:
        # 처리 실패
        document.fail_processing(str(e))
        db.commit()


@router.get("/", response_model=DocumentList)
async def get_documents(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[DocumentStatus] = None,
    language: Optional[str] = None,
    sort_by: str = Query("created_at", regex="^(created_at|updated_at|filename|file_size)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    사용자의 문서 목록 조회
    """
    query = db.query(Document).filter(Document.user_id == current_user.id)
    
    # 필터 적용
    if status:
        query = query.filter(Document.status == status)
    if language:
        query = query.filter(Document.language == language)
    
    # 정렬
    order_func = desc if sort_order == "desc" else asc
    if sort_by == "created_at":
        query = query.order_by(order_func(Document.created_at))
    elif sort_by == "updated_at":
        query = query.order_by(order_func(Document.updated_at))
    elif sort_by == "filename":
        query = query.order_by(order_func(Document.original_filename))
    elif sort_by == "file_size":
        query = query.order_by(order_func(Document.file_size))
    
    # 페이지네이션
    total = query.count()
    documents = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "items": documents,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    특정 문서 조회
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="문서를 찾을 수 없습니다"
        )
    
    return document


@router.delete("/{document_id}")
async def delete_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    문서 삭제
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="문서를 찾을 수 없습니다"
        )
    
    # 파일 삭제
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    # 데이터베이스에서 삭제 (CASCADE로 관련 데이터도 삭제됨)
    db.delete(document)
    db.commit()
    
    return {"message": "문서가 성공적으로 삭제되었습니다"}


@router.get("/{document_id}/status", response_model=ProcessingStatus)
async def get_processing_status(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    문서 처리 상태 조회
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="문서를 찾을 수 없습니다"
        )
    
    # 진행률 계산
    progress = 0
    current_step = "대기 중"
    
    if document.status == DocumentStatus.UPLOADED:
        progress = 10
        current_step = "업로드 완료"
    elif document.status == DocumentStatus.PROCESSING:
        progress = 50
        current_step = "AI 분석 중"
    elif document.status == DocumentStatus.COMPLETED:
        progress = 100
        current_step = "분석 완료"
    elif document.status == DocumentStatus.FAILED:
        progress = 0
        current_step = "처리 실패"
    
    return {
        "task_id": document.id,  # document_id를 task_id로 사용
        "status": document.status,
        "progress": progress,
        "current_step": current_step,
        "estimated_remaining": None,
        "error_message": document.error_message
    }


@router.post("/{document_id}/reprocess")
async def reprocess_document(
    document_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    문서 재처리
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="문서를 찾을 수 없습니다"
        )
    
    if document.status == DocumentStatus.PROCESSING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 처리 중인 문서입니다"
        )
    
    # 기존 분석 결과 삭제
    from app.models.analysis import Analysis
    db.query(Analysis).filter(Analysis.document_id == document.id).delete()
    
    # 문서 상태 초기화
    document.status = DocumentStatus.UPLOADED
    document.error_message = None
    document.processing_started_at = None
    document.processing_completed_at = None
    document.processing_time = None
    
    db.commit()
    
    # 백그라운드에서 재처리 시작
    background_tasks.add_task(process_document_background, document.id, db)
    
    return {"message": "문서 재처리가 시작되었습니다"}


@router.get("/stats/overview", response_model=DocumentStats)
async def get_document_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    사용자의 문서 통계 조회
    """
    from sqlalchemy import func
    
    # 기본 통계
    total_documents = db.query(Document).filter(Document.user_id == current_user.id).count()
    completed_documents = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.status == DocumentStatus.COMPLETED
    ).count()
    failed_documents = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.status == DocumentStatus.FAILED
    ).count()
    processing_documents = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.status == DocumentStatus.PROCESSING
    ).count()
    
    # 총 파일 크기
    total_file_size = db.query(func.sum(Document.file_size)).filter(
        Document.user_id == current_user.id
    ).scalar() or 0
    
    # 평균 처리 시간
    avg_processing_time = db.query(func.avg(Document.processing_time)).filter(
        Document.user_id == current_user.id,
        Document.processing_time.isnot(None)
    ).scalar()
    
    return {
        "total_documents": total_documents,
        "completed_documents": completed_documents,
        "failed_documents": failed_documents,
        "processing_documents": processing_documents,
        "total_file_size": total_file_size,
        "average_processing_time": float(avg_processing_time) if avg_processing_time else None
    }

