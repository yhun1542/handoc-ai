"""
HanDoc AI Backend Configuration
"""

import os
from typing import List, Optional, Union
from pydantic import AnyHttpUrl, BaseSettings, validator


class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # 기본 설정
    PROJECT_NAME: str = "HanDoc AI"
    PROJECT_DESCRIPTION: str = "문서를 이해하는 가장 빠른 방법"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # 환경 설정
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    
    # 보안 설정
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24시간
    
    # 서버 설정
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS 설정
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8080",
        "https://handoc.ai",
        "https://www.handoc.ai"
    ]
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # 데이터베이스 설정
    DATABASE_URL: str = "postgresql://handoc_user:handoc_password@localhost:5432/handoc_ai"
    DATABASE_ECHO: bool = False
    
    # Redis 설정
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL: int = 3600  # 1시간
    
    # 파일 스토리지 설정
    S3_ENDPOINT: Optional[str] = "http://localhost:9000"
    S3_ACCESS_KEY: Optional[str] = "handoc_minio"
    S3_SECRET_KEY: Optional[str] = "handoc_minio_password"
    S3_BUCKET_NAME: str = "handoc-files"
    S3_REGION: str = "us-east-1"
    
    # 파일 업로드 설정
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = ["application/pdf"]
    UPLOAD_DIR: str = "./uploads"
    
    # OpenAI 설정
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL_DEFAULT: str = "gpt-3.5-turbo"
    OPENAI_MODEL_PREMIUM: str = "gpt-4"
    OPENAI_MAX_TOKENS: int = 4000
    OPENAI_TEMPERATURE: float = 0.7
    
    # Google Drive 설정
    GDRIVE_SERVICE_JSON: Optional[str] = None
    
    # Rate Limiting 설정
    RATE_LIMIT_REQUESTS_PER_HOUR: int = 100
    RATE_LIMIT_PREMIUM_REQUESTS_PER_HOUR: int = 500
    RATE_LIMIT_UPLOADS_PER_DAY: int = 50
    RATE_LIMIT_PREMIUM_UPLOADS_PER_DAY: int = 200
    
    # 이메일 설정
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_TLS: bool = True
    EMAIL_FROM: str = "noreply@handoc.ai"
    EMAIL_FROM_NAME: str = "HanDoc AI"
    
    # 모니터링 설정
    SENTRY_DSN: Optional[str] = None
    
    # Celery 설정
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # 로깅 설정
    LOG_FILE_PATH: str = "./logs/app.log"
    LOG_MAX_SIZE: str = "10MB"
    LOG_BACKUP_COUNT: int = 5
    
    # 소셜 로그인 설정
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    
    # 결제 설정
    STRIPE_PUBLIC_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # 프론트엔드 URL
    FRONTEND_URL: str = "http://localhost:3000"
    
    # 백업 설정
    BACKUP_ENABLED: bool = False
    BACKUP_SCHEDULE: str = "0 2 * * *"  # 매일 오전 2시
    BACKUP_RETENTION_DAYS: int = 30
    BACKUP_S3_BUCKET: Optional[str] = None
    
    # 알림 설정
    SLACK_WEBHOOK_URL: Optional[str] = None
    DISCORD_WEBHOOK_URL: Optional[str] = None
    
    # 캐시 설정
    CACHE_TTL_DEFAULT: int = 3600
    CACHE_TTL_USER_DATA: int = 1800
    CACHE_TTL_ANALYSIS_RESULT: int = 86400
    
    # 개발 설정
    RELOAD: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


class DevelopmentSettings(Settings):
    """개발 환경 설정"""
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"
    DATABASE_ECHO: bool = True
    RELOAD: bool = True


class ProductionSettings(Settings):
    """프로덕션 환경 설정"""
    DEBUG: bool = False
    LOG_LEVEL: str = "WARNING"
    DATABASE_ECHO: bool = False
    RELOAD: bool = False
    
    # 보안 강화
    SECRET_KEY: str  # 환경 변수에서 필수로 가져와야 함
    
    # HTTPS 강제
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "https://handoc.ai",
        "https://www.handoc.ai"
    ]


class TestSettings(Settings):
    """테스트 환경 설정"""
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"
    DATABASE_URL: str = "postgresql://handoc_user:handoc_password@localhost:5432/handoc_ai_test"
    REDIS_URL: str = "redis://localhost:6379/15"  # 테스트용 DB
    
    # 테스트용 설정
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 5  # 짧은 만료 시간
    RATE_LIMIT_REQUESTS_PER_HOUR: int = 1000  # 테스트용 높은 제한


def get_settings() -> Settings:
    """환경에 따른 설정 반환"""
    environment = os.getenv("ENVIRONMENT", "development").lower()
    
    if environment == "production":
        return ProductionSettings()
    elif environment == "test":
        return TestSettings()
    else:
        return DevelopmentSettings()


# 전역 설정 인스턴스
settings = get_settings()

