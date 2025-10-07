from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List, Dict, Any

# Transaction schemas
class TransactionBase(BaseModel):
    user_id: Optional[int] = None
    date: date
    category: str = Field(..., max_length=100)
    amount: float = Field(..., gt=0)
    description: Optional[str] = Field(None, max_length=500)

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    date: Optional[date] = None
    category: Optional[str] = Field(None, max_length=100)
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, max_length=500)

class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Analytics schemas
class MetricsResponse(BaseModel):
    total_income: float
    total_expenses: float
    net_balance: float
    daily_average: float

class MonthlyStat(BaseModel):
    month: str
    income: float
    expenses: float
    net: float

class ChartData(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]]

# API Response schemas
class CategoriesResponse(BaseModel):
    categories: List[str]

class MessageResponse(BaseModel):
    message: str

# Auth schemas
class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
