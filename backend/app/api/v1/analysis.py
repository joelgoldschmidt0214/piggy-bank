"""
AI Analysis endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.ai_advisor import get_financial_advice

router = APIRouter()


@router.get("/analysis/")
async def get_analysis(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    AI分析結果取得
    ユーザーの取引データを分析してアドバイスを返す
    """
    advice = await get_financial_advice(current_user["id"], db)
    return advice
