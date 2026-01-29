"""
AI Advisor Service - OpenAI API を使用した財務アドバイス
"""

from openai import OpenAI
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.transaction import Transaction

# OpenAI クライアント初期化
client = OpenAI(api_key=settings.OPENAI_API_KEY)


async def get_financial_advice(user_id: int, db: AsyncSession) -> dict:
    """
    ユーザーの取引データを分析してAIアドバイスを生成
    """
    # 今月の取引データ集計
    result = await db.execute(
        select(
            func.sum(Transaction.amount).label("total"),
            func.count(Transaction.id).label("count"),
        ).where(Transaction.user_id == user_id)
    )
    stats = result.one()

    total_amount = stats.total or 0
    transaction_count = stats.count or 0

    # カテゴリ別集計
    category_result = await db.execute(
        select(
            Transaction.category,
            func.sum(Transaction.amount).label("amount"),
        )
        .where(Transaction.user_id == user_id)
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(5)
    )
    top_categories = [
        {"category": row.category or "未分類", "amount": row.amount}
        for row in category_result.all()
    ]

    # AIプロンプト作成
    prompt = f"""
あなたはファイナンシャルプランナーです。
以下のユーザーの支出データを分析し、アドバイスを提供してください。

今月の支出総額: {total_amount:,}円
取引回数: {transaction_count}回
主な支出カテゴリ（TOP5）:
{chr(10).join([f"- {cat['category']}: {cat['amount']:,}円" for cat in top_categories])}

以下のJSON形式で回答してください（JSON以外の文字は含めないでください）:
{{
    "status": "safe" または "warning" または "danger",
    "message": "短い励ましの言葉（50文字以内）",
    "advice": "具体的なアドバイス（150文字以内）",
    "action_items": ["アクション1", "アクション2", "アクション3"]
}}
"""

    try:
        # OpenAI API 呼び出し
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "あなたは親切なファイナンシャルプランナーです。",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=settings.OPENAI_MAX_TOKENS,
            temperature=0.7,
        )

        # レスポンス解析
        import json

        advice_text = response.choices[0].message.content
        advice_data = json.loads(advice_text)

        return {
            "total_amount": total_amount,
            "transaction_count": transaction_count,
            "top_categories": top_categories,
            "ai_advice": advice_data,
        }

    except Exception as e:
        # エラー時のフォールバック
        return {
            "total_amount": total_amount,
            "transaction_count": transaction_count,
            "top_categories": top_categories,
            "ai_advice": {
                "status": "safe",
                "message": "データを分析中です",
                "advice": "AIアドバイスの生成中にエラーが発生しました。しばらくしてから再度お試しください。",
                "action_items": ["データを確認する", "カテゴリを整理する"],
            },
            "error": str(e),
        }
