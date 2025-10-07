from sqlalchemy.orm import Session
from sqlalchemy import and_, func, distinct
from datetime import datetime, date
from typing import List, Optional
import pandas as pd

from ..models import Transaction
from ..schemas import TransactionCreate, TransactionUpdate, TransactionResponse

class TransactionService:
    async def get_transactions(
        self, 
        db: Session, 
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        categories: Optional[List[str]] = None,
        user_id: Optional[int] = None
    ) -> List[TransactionResponse]:
        """Get transactions with optional filtering"""
        query = db.query(Transaction)
        
        # Scope to user
        if user_id is not None:
            query = query.filter(Transaction.user_id == user_id)

        # Apply date filters
        if start_date:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date >= start_date_obj)
        
        if end_date:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date <= end_date_obj)
        
        # Apply category filters
        if categories:
            query = query.filter(Transaction.category.in_(categories))
        
        transactions = query.order_by(Transaction.date.desc()).all()
        return [TransactionResponse.from_orm(t) for t in transactions]

    async def get_transaction_by_id(self, db: Session, transaction_id: int) -> Optional[TransactionResponse]:
        """Get a specific transaction by ID"""
        transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if transaction:
            return TransactionResponse.from_orm(transaction)
        return None

    async def create_transaction(self, db: Session, transaction: TransactionCreate) -> TransactionResponse:
        """Create a new transaction"""
        db_transaction = Transaction(
            date=transaction.date,
            category=transaction.category,
            amount=transaction.amount,
            description=transaction.description
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return TransactionResponse.from_orm(db_transaction)

    async def update_transaction(
        self, 
        db: Session, 
        transaction_id: int, 
        transaction: TransactionUpdate
    ) -> Optional[TransactionResponse]:
        """Update an existing transaction"""
        db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not db_transaction:
            return None
        
        update_data = transaction.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_transaction, field, value)
        
        db.commit()
        db.refresh(db_transaction)
        return TransactionResponse.from_orm(db_transaction)

    async def delete_transaction(self, db: Session, transaction_id: int) -> bool:
        """Delete a transaction"""
        db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not db_transaction:
            return False
        
        db.delete(db_transaction)
        db.commit()
        return True

    async def get_categories(self, db: Session) -> List[str]:
        """Get unique categories"""
        categories = db.query(distinct(Transaction.category)).all()
        return [cat[0] for cat in categories]
