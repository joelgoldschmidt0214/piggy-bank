"""
Database configuration with SQLAlchemy Async
"""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# 非同期エンジン作成
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
)

# セッションファクトリー
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """SQLAlchemy Base Model"""

    pass


async def get_db() -> AsyncSession:
    """
    データベースセッション依存性注入
    FastAPI の Depends で使用
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
