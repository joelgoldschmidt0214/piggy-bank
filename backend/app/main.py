"""
FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import analysis, transactions, users
from app.core.config import settings
from app.core.database import engine
from app.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    アプリケーションのライフサイクル管理
    起動時と終了時の処理を定義
    """
    # 起動時
    print("🚀 Starting Piggy Bank API...")
    # データベーステーブル作成（開発環境のみ）
    if settings.DEBUG:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    yield

    # 終了時
    print("👋 Shutting down Piggy Bank API...")
    await engine.dispose()


# FastAPI アプリケーション初期化
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI分析機能付き家計簿アプリのバックエンドAPI",
    lifespan=lifespan,
)

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(transactions.router, prefix="/api/v1", tags=["transactions"])
app.include_router(users.router, prefix="/api/v1", tags=["users"])
app.include_router(analysis.router, prefix="/api/v1", tags=["analysis"])


@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {
        "message": "Piggy Bank API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy"}
