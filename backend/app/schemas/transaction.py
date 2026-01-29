"""
Transaction schemas
"""

from datetime import datetime

from pydantic import BaseModel, Field


class TransactionBase(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=255)
    amount: int = Field(..., gt=0)
    category: str | None = Field(None, max_length=100)
    note: str | None = Field(None, max_length=500)


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    item_name: str | None = Field(None, min_length=1, max_length=255)
    amount: int | None = Field(None, gt=0)
    category: str | None = Field(None, max_length=100)
    note: str | None = Field(None, max_length=500)


class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
