"""
HanDoc AI Backend - FastAPI 메인 애플리케이션
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import time
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import create_tables
from app.api.v1 import auth, documents, analyses

# 로깅 설정
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시 실행
    logger.info("🚀 HanDoc AI Backend 시작")
    
    # 데이터베이스 테이블 생성
    try:
        create_tables()
        logger.info("✅ 데이터베이스 테이블 생성 완료")
    except Exception as e:
        logger.error(f"❌ 데이터베이스 초기화 실패: {e}")
    
    # 업로드 디렉토리 생성
    import os
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info(f"📁 업로드 디렉토리 생성: {settings.UPLOAD_DIR}")
    
    yield
    
    # 종료 시 실행
    logger.info("🛑 HanDoc AI Backend 종료")


# FastAPI 앱 생성
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 오리진 허용 (배포 시 수정 필요)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 신뢰할 수 있는 호스트 미들웨어 (프로덕션에서 활성화)
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["handoc.ai", "www.handoc.ai", "api.handoc.ai"]
    )


# 요청 처리 시간 미들웨어
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# 전역 예외 처리기
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"전역 예외 발생: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "내부 서버 오류가 발생했습니다",
            "error_type": type(exc).__name__
        }
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code
        }
    )


# 정적 파일 서빙 (업로드된 파일)
app.mount("/static", StaticFiles(directory=settings.UPLOAD_DIR), name="static")


# API 라우터 등록
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["인증"]
)

app.include_router(
    documents.router,
    prefix=f"{settings.API_V1_STR}/documents",
    tags=["문서 관리"]
)

app.include_router(
    analyses.router,
    prefix=f"{settings.API_V1_STR}/analyses",
    tags=["분석 결과"]
)


# 루트 엔드포인트
@app.get("/")
async def root():
    """API 루트 엔드포인트"""
    return {
        "message": "HanDoc AI Backend API",
        "description": "문서를 이해하는 가장 빠른 방법",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "api_v1": settings.API_V1_STR
    }


# 헬스체크 엔드포인트
@app.get("/health")
async def health_check():
    """서비스 상태 확인"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


# API 정보 엔드포인트
@app.get(f"{settings.API_V1_STR}/info")
async def api_info():
    """API 정보"""
    return {
        "name": settings.PROJECT_NAME,
        "description": settings.PROJECT_DESCRIPTION,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "features": {
            "pdf_processing": True,
            "ai_analysis": True,
            "text_cleaning": True,
            "export_formats": ["markdown", "pdf", "txt", "json"],
            "supported_languages": ["ko", "en"],
            "max_file_size_mb": settings.MAX_FILE_SIZE // (1024 * 1024),
            "supported_file_types": settings.ALLOWED_FILE_TYPES
        },
        "limits": {
            "free_monthly_uploads": 50,
            "premium_monthly_uploads": "unlimited",
            "max_file_size": settings.MAX_FILE_SIZE,
            "rate_limit_per_hour": settings.RATE_LIMIT_REQUESTS_PER_HOUR
        }
    }


# 개발용 엔드포인트 (디버그 모드에서만)
if settings.DEBUG:
    @app.get("/debug/config")
    async def debug_config():
        """설정 정보 (개발용)"""
        return {
            "environment": settings.ENVIRONMENT,
            "debug": settings.DEBUG,
            "database_url": settings.DATABASE_URL.replace(
                settings.DATABASE_URL.split("://")[1].split("@")[0], "***"
            ),
            "redis_url": settings.REDIS_URL,
            "upload_dir": settings.UPLOAD_DIR,
            "cors_origins": settings.BACKEND_CORS_ORIGINS
        }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level=settings.LOG_LEVEL.lower()
    )

