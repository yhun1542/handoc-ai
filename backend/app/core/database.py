"""
데이터베이스 연결 및 세션 관리
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from typing import Generator

from app.core.config import settings

# SQLAlchemy 엔진 생성
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite용 설정
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.DATABASE_ECHO
    )
else:
    # PostgreSQL용 설정
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=settings.DATABASE_ECHO
    )

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 클래스 생성
Base = declarative_base()


def get_db() -> Generator:
    """
    데이터베이스 세션 의존성
    
    Yields:
        데이터베이스 세션
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """모든 테이블 생성"""
    Base.metadata.create_all(bind=engine)


def drop_tables():
    """모든 테이블 삭제 (테스트용)"""
    Base.metadata.drop_all(bind=engine)

