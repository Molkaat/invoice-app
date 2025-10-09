from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
import bcrypt
import secrets
import hashlib
from app.db.database import db_manager
from app.db.models import User, Company
from app.config import SECRET_KEY

router = APIRouter(prefix="/auth", tags=["authentication"])

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: Optional[str] = None

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    user: dict
    token: str

def get_db():
    db = db_manager.get_session()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_simple_token(user_id: int, email: str) -> str:
    """Create a simple token for the user (temporary solution)"""
    # Create a simple token using user data and secret
    data = f"{user_id}:{email}:{datetime.utcnow().timestamp()}"
    token_hash = hashlib.sha256(f"{data}:{SECRET_KEY}".encode()).hexdigest()
    return f"{user_id}.{token_hash}"

def get_email_domain(email: str) -> str:
    """Extract domain from email"""
    return email.split('@')[1]

@router.post("/signup", response_model=AuthResponse)
async def sign_up(request: SignUpRequest, db: Session = Depends(get_db)):
    """Register a new user and company"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Extract domain for company
    domain = get_email_domain(request.email)
    
    # Check if company exists by domain
    company = db.query(Company).filter(Company.email_domain == domain).first()
    
    if not company:
        # Create new company
        company_name = request.company_name or f"{domain.split('.')[0].title()} Company"
        company = Company(
            name=company_name,
            email_domain=domain,
            subscription_plan="starter",
            monthly_invoice_limit=100,
            ai_credits_limit=1000
        )
        db.add(company)
        db.flush()  # Get the company ID
    
    # Create user
    hashed_password = hash_password(request.password)
    user = User(
        company_id=company.id,
        email=request.email,
        full_name=request.full_name,
        password_hash=hashed_password,
        role="admin" if not company.users else "user"  # First user is admin
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create simple token
    token = create_simple_token(user.id, user.email)
    
    # Return user data (without password)
    user_data = {
        "id": user.id,
        "email": user.email,
        "name": user.full_name,
        "role": user.role,
        "company_id": user.company_id,
        "company_name": company.name
    }
    
    return AuthResponse(user=user_data, token=token)

@router.post("/signin", response_model=AuthResponse)
async def sign_in(request: SignInRequest, db: Session = Depends(get_db)):
    """Authenticate user and return token"""
    
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is disabled"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Get company info
    company = db.query(Company).filter(Company.id == user.company_id).first()
    
    # Create simple token
    token = create_simple_token(user.id, user.email)
    
    # Return user data
    user_data = {
        "id": user.id,
        "email": user.email,
        "name": user.full_name,
        "role": user.role,
        "company_id": user.company_id,
        "company_name": company.name if company else None
    }
    
    return AuthResponse(user=user_data, token=token)

@router.post("/signout")
async def sign_out():
    """Sign out user (client-side token removal)"""
    return {"message": "Signed out successfully"}