from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
import uvicorn
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

from backend.database import get_db, engine, Base
from backend.models import Transaction, User
from backend.schemas import TransactionCreate, TransactionUpdate, TransactionResponse, MetricsResponse, UserCreate, UserLogin, TokenResponse
from backend.services.transaction_service import TransactionService
from backend.services.analytics_service import AnalyticsService
import plaid
from plaid.api import plaid_api
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_sync_request import TransactionsSyncRequest
import pandas as pd

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Personal Finance Tracker API",
    description="Advanced financial analytics and transaction management",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Initialize services
transaction_service = TransactionService()
analytics_service = AnalyticsService()

PLAID_CLIENT_ID = os.getenv('PLAID_CLIENT_ID')
PLAID_SECRET = os.getenv('PLAID_SECRET')
PLAID_ENV = os.getenv('PLAID_ENV', 'sandbox')
PLAID_PRODUCTS = os.getenv('PLAID_PRODUCTS', 'transactions').split(',')
PLAID_COUNTRY_CODES = os.getenv('PLAID_COUNTRY_CODES', 'US').split(',')
PLAID_REDIRECT_URI = os.getenv('PLAID_REDIRECT_URI') or None

host = plaid.Environment.Sandbox if PLAID_ENV == 'sandbox' else plaid.Environment.Production
configuration = plaid.Configuration(
    host=host,
    api_key={
        'clientId': PLAID_CLIENT_ID,
        'secret': PLAID_SECRET,
        'plaidVersion': '2020-09-14'
    }
)
api_client = plaid.ApiClient(configuration)
plaid_client = plaid_api.PlaidApi(api_client)
plaid_products = [Products(p) for p in PLAID_PRODUCTS]

@app.on_event("startup")
def seed_db_on_startup():
    try:
        from sqlalchemy import select, func
        with next(get_db()) as db:
            # Create a demo user if none exists
            demo_user = db.query(User).filter(User.email == "demo@example.com").first()
            if not demo_user:
                demo_user = User(email="demo@example.com", password_hash=hash_password("demo123"))
                db.add(demo_user)
                db.commit()
                db.refresh(demo_user)
            
            # Seed transactions for demo user
            count = db.execute(select(func.count()).select_from(Transaction).where(Transaction.user_id == demo_user.id)).scalar() or 0
            if count == 0:
                csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'transactions.csv')
                if os.path.exists(csv_path):
                    df = pd.read_csv(csv_path)
                    # Handle both lowercase and capitalized column names
                    df.columns = df.columns.str.lower()
                    required_cols = {'date', 'category', 'amount'}
                    if required_cols.issubset(set(df.columns)):
                        rows = []
                        for _, row in df.iterrows():
                            try:
                                # Handle different date formats
                                date_str = str(row['date'])
                                if '/' in date_str:
                                    date_obj = datetime.strptime(date_str, "%Y/%m/%d").date()
                                else:
                                    date_obj = datetime.strptime(date_str[:10], "%Y-%m-%d").date()
                                
                                rows.append(Transaction(
                                    user_id=demo_user.id,
                                    date=date_obj,
                                    category=str(row['category']) if pd.notna(row['category']) else 'Uncategorized',
                                    amount=float(row['amount']),
                                    description=str(row['description']) if 'description' in df.columns and pd.notna(row.get('description')) else None
                                ))
                            except Exception as e:
                                print(f"Error processing row: {e}")
                                continue
                        if rows:
                            db.add_all(rows)
                            db.commit()
    except Exception:
        pass

@app.get("/")
async def root():
    return {"message": "Personal Finance Tracker API", "status": "running"}
# Simple in-file auth helpers (hashing + JWT)
from passlib.context import CryptContext
from jose import jwt

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
JWT_ALG = "HS256"

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)

def create_access_token(user_id: int, email: str) -> str:
    payload = {"sub": str(user_id), "email": email, "exp": datetime.utcnow() + timedelta(hours=12)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Auth endpoints
@app.post("/api/auth/register", response_model=TokenResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = User(email=user.email, password_hash=hash_password(user.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    token = create_access_token(db_user.id, db_user.email)
    return TokenResponse(access_token=token)

@app.post("/api/auth/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)

# Alternative login endpoint for easier testing
@app.post("/api/auth/login-simple", response_model=TokenResponse)
def login_simple(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)

@app.get("/health")
async def health_check():
    return {"status": "OK", "timestamp": datetime.now().isoformat()}

# Transaction endpoints
@app.get("/api/transactions", response_model=List[TransactionResponse])
async def get_transactions(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    categories: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all transactions with optional filtering"""
    try:
        category_list = categories.split(',') if categories else None
        transactions = await transaction_service.get_transactions(
            db, start_date, end_date, category_list, current_user.id
        )
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Plaid endpoints
@app.post("/api/plaid/link-token")
async def create_link_token():
    req = LinkTokenCreateRequest(
        products=plaid_products,
        client_name="Personal Finance Manager",
        country_codes=[CountryCode(c) for c in PLAID_COUNTRY_CODES],
        language='en',
        user=LinkTokenCreateRequestUser(client_user_id=str(int(datetime.now().timestamp())))
    )
    if PLAID_REDIRECT_URI:
        req.redirect_uri = PLAID_REDIRECT_URI
    resp = plaid_client.link_token_create(req)
    return resp.to_dict()

@app.post("/api/plaid/exchange")
async def exchange_public_token(payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    public_token = payload.get("public_token")
    if not public_token:
        raise HTTPException(status_code=400, detail="public_token required")
    exchange_req = ItemPublicTokenExchangeRequest(public_token=public_token)
    exchange_resp = plaid_client.item_public_token_exchange(exchange_req).to_dict()
    access_token = exchange_resp.get("access_token")
    if access_token:
        user = db.query(User).filter(User.id == current_user.id).first()
        user.plaid_access_token = access_token
        db.commit()
    return {"item_id": exchange_resp.get("item_id")}

@app.post("/api/plaid/sync")
async def plaid_sync(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    access_token = current_user.plaid_access_token
    if not access_token:
        raise HTTPException(status_code=400, detail="No access token configured")
    cursor = ''
    added = []
    has_more = True
    while has_more:
        req = TransactionsSyncRequest(access_token=access_token, cursor=cursor)
        resp = plaid_client.transactions_sync(req).to_dict()
        cursor = resp['next_cursor']
        added.extend(resp['added'])
        has_more = resp['has_more']
        if cursor == '':
            break
    # Upsert latest transactions into DB
    for t in added:
        db_transaction = Transaction(
            user_id=current_user.id,
            date=datetime.strptime(t['date'], "%Y-%m-%d").date(),
            category=t['personal_finance_category']['detailed'] if t.get('personal_finance_category') else (t.get('category', ['Uncategorized'])[0] if t.get('category') else 'Uncategorized'),
            amount=abs(float(t['amount'])),
            description=t.get('name')
        )
        db.add(db_transaction)
    db.commit()
    return {"imported": len(added)}

@app.post("/api/seed-from-csv")
async def seed_from_csv(db: Session = Depends(get_db)):
    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'transactions.csv')
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail="transactions.csv not found in /data")
    try:
        df = pd.read_csv(csv_path)
        required_cols = {'date', 'category', 'amount'}
        if not required_cols.issubset(set(df.columns)):
            raise HTTPException(status_code=400, detail=f"CSV must include columns: {required_cols}")
        count = 0
        for _, row in df.iterrows():
            try:
                db_transaction = Transaction(
                    date=datetime.strptime(str(row['date'])[:10], "%Y-%m-%d").date(),
                    category=str(row['category']) if pd.notna(row['category']) else 'Uncategorized',
                    amount=float(row['amount']),
                    description=str(row['description']) if 'description' in df.columns and pd.notna(row.get('description')) else None
                )
                db.add(db_transaction)
                count += 1
            except Exception:
                continue
        db.commit()
        return {"imported": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    user_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        from io import StringIO
        df = pd.read_csv(StringIO(content.decode('utf-8')))
        required_cols = {'date', 'category', 'amount'}
        if not required_cols.issubset(set(df.columns)):
            raise HTTPException(status_code=400, detail=f"CSV must include columns: {required_cols}")
        rows = 0
        for _, row in df.iterrows():
            try:
                db.add(Transaction(
                    user_id=user_id,
                    date=datetime.strptime(str(row['date'])[:10], "%Y-%m-%d").date(),
                    category=str(row['category']) if pd.notna(row['category']) else 'Uncategorized',
                    amount=float(row['amount']),
                    description=str(row['description']) if 'description' in df.columns and pd.notna(row.get('description')) else None
                ))
                rows += 1
            except Exception:
                continue
        db.commit()
        return {"imported": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/transactions/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Get a specific transaction by ID"""
    transaction = await transaction_service.get_transaction_by_id(db, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@app.post("/api/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new transaction"""
    try:
        if transaction.user_id is None:
            transaction.user_id = current_user.id
        new_transaction = await transaction_service.create_transaction(db, transaction)
        return new_transaction
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/transactions/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int, 
    transaction: TransactionUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing transaction"""
    try:
        updated_transaction = await transaction_service.update_transaction(
            db, transaction_id, transaction
        )
        if not updated_transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return updated_transaction
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/transactions/{transaction_id}")
async def delete_transaction(transaction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a transaction"""
    success = await transaction_service.delete_transaction(db, transaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}

@app.get("/api/transactions/categories/list")
async def get_categories(db: Session = Depends(get_db)):
    """Get unique categories"""
    categories = await transaction_service.get_categories(db)
    return {"categories": categories}

# Analytics endpoints
@app.get("/api/analytics/metrics", response_model=MetricsResponse)
async def get_metrics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    categories: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get key financial metrics"""
    try:
        category_list = categories.split(',') if categories else None
        metrics = await analytics_service.get_key_metrics(
            db, start_date, end_date, category_list
        )
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/monthly-stats")
async def get_monthly_stats(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    categories: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get monthly statistics"""
    try:
        category_list = categories.split(',') if categories else None
        stats = await analytics_service.get_monthly_stats(
            db, start_date, end_date, category_list
        )
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/daily-averages")
async def get_daily_averages(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    categories: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get daily averages by category"""
    try:
        category_list = categories.split(',') if categories else None
        averages = await analytics_service.get_daily_averages(
            db, start_date, end_date, category_list
        )
        return averages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/percentage-changes")
async def get_percentage_changes(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    categories: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get month-over-month percentage changes"""
    try:
        category_list = categories.split(',') if categories else None
        changes = await analytics_service.get_percentage_changes(
            db, start_date, end_date, category_list
        )
        return changes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/trends")
async def get_trend_analysis(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    categories: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get trend analysis"""
    try:
        category_list = categories.split(',') if categories else None
        trends = await analytics_service.get_trend_analysis(
            db, start_date, end_date, category_list
        )
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/chart-data")
async def get_chart_data(
    chart_type: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    categories: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chart data for different chart types"""
    try:
        category_list = categories.split(',') if categories else None
        chart_data = await analytics_service.get_chart_data(
            db, chart_type, start_date, end_date, category_list
        )
        return chart_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
