"""User registration, login, and profile endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
import bcrypt

from backend.database.db import get_db, User, Allergy as AllergyDB, DietType as DietTypeDB, DiningHall as DiningHallDB
from backend.models.user import UserCreate, User as UserModel, UserUpdate, Token, Allergy, DietType, DiningHall
from backend.api.dependencies import create_access_token, get_current_active_user, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)


@router.post("/register", response_model=UserModel)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if username already exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password
    try:
        hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error hashing password: {str(e)}"
        )
    
    # Create new user
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        name=user.name,
        age=user.age,
        gender=user.gender,
        height=user.height,
        current_weight=user.current_weight,
        goal_weight=user.goal_weight,
        main_goal=user.main_goal,
        activity_level=user.activity_level,
        workout_frequency=user.workout_frequency,
        workout_type=user.workout_type,
        campus_name=user.campus_name,
        meal_plan_type=user.meal_plan_type,
        cooking_availability=user.cooking_availability,
        preferred_cuisine=user.preferred_cuisine
    )
    
    # Add allergies
    if user.allergies:
        allergies = db.query(AllergyDB).filter(AllergyDB.id.in_(user.allergies)).all()
        db_user.allergies = allergies
    
    # Add diet types
    if user.diet_types:
        diet_types = db.query(DietTypeDB).filter(DietTypeDB.id.in_(user.diet_types)).all()
        db_user.diet_types = diet_types
    
    # Add dining halls
    if user.dining_halls:
        dining_halls = db.query(DiningHallDB).filter(DiningHallDB.id.in_(user.dining_halls)).all()
        db_user.dining_halls = dining_halls
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get access token."""
    # Find user by username
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not bcrypt.checkpw(form_data.password.encode('utf-8'), user.hashed_password.encode('utf-8')):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserModel)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user profile."""
    return current_user


@router.put("/me", response_model=UserModel)
def update_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user profile."""
    # Update user attributes
    for key, value in user_update.dict(exclude_unset=True).items():
        if key not in ["allergies", "diet_types", "dining_halls"] and value is not None:
            setattr(current_user, key, value)
    
    # Update allergies
    if user_update.allergies is not None:
        allergies = db.query(AllergyDB).filter(AllergyDB.id.in_(user_update.allergies)).all()
        current_user.allergies = allergies
    
    # Update diet types
    if user_update.diet_types is not None:
        diet_types = db.query(DietTypeDB).filter(DietTypeDB.id.in_(user_update.diet_types)).all()
        current_user.diet_types = diet_types
    
    # Update dining halls
    if user_update.dining_halls is not None:
        dining_halls = db.query(DiningHallDB).filter(DiningHallDB.id.in_(user_update.dining_halls)).all()
        current_user.dining_halls = dining_halls
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/allergies", response_model=List[Allergy])
def get_allergies(db: Session = Depends(get_db)):
    """Get all available allergies."""
    return db.query(AllergyDB).all()


@router.get("/diet-types", response_model=List[DietType])
def get_diet_types(db: Session = Depends(get_db)):
    """Get all available diet types."""
    return db.query(DietTypeDB).all()


@router.get("/dining-halls", response_model=List[DiningHall])
def get_dining_halls(db: Session = Depends(get_db)):
    """Get all available dining halls."""
    return db.query(DiningHallDB).all()
