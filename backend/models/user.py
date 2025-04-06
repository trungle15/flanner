"""Pydantic models for user data validation and serialization."""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional
from enum import Enum


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class MainGoal(str, Enum):
    LOSE_WEIGHT = "lose_weight"
    GAIN_WEIGHT = "gain_weight"
    MAINTAIN = "maintain"
    IMPROVE_PERFORMANCE = "improve_performance"
    GENERAL_WELLNESS = "general_wellness"


class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"
    LIGHTLY_ACTIVE = "lightly_active"
    MODERATELY_ACTIVE = "moderately_active"
    VERY_ACTIVE = "very_active"
    ATHLETE = "athlete"


class WorkoutType(str, Enum):
    CARDIO = "cardio"
    STRENGTH = "strength"
    SPORTS = "sports"
    MIXED = "mixed"


class MealPlanType(str, Enum):
    UNLIMITED = "unlimited"
    FIXED_SWIPES = "fixed_swipes"
    POINTS_ONLY = "points_only"
    COMBINATION = "combination"


class CookingAvailability(str, Enum):
    NONE = "none"
    MICROWAVE = "microwave"
    LIMITED = "limited"
    FULL = "full"


class AllergyBase(BaseModel):
    name: str
    description: Optional[str] = None


class AllergyCreate(AllergyBase):
    pass


class Allergy(AllergyBase):
    id: int

    class Config:
        orm_mode = True


class DietTypeBase(BaseModel):
    name: str
    description: Optional[str] = None


class DietTypeCreate(DietTypeBase):
    pass


class DietType(DietTypeBase):
    id: int

    class Config:
        orm_mode = True


class DiningHallBase(BaseModel):
    name: str
    location: Optional[str] = None
    unit_oid: str


class DiningHallCreate(DiningHallBase):
    pass


class DiningHall(DiningHallBase):
    id: int

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    username: str
    email: EmailStr
    name: str
    age: int = Field(..., ge=13, le=100)
    gender: Gender
    height: float = Field(..., ge=50, le=250)  # in cm
    current_weight: float = Field(..., ge=30, le=300)  # in kg
    goal_weight: Optional[float] = Field(None, ge=30, le=300)  # in kg
    
    # Fitness goals
    main_goal: MainGoal
    activity_level: ActivityLevel
    workout_frequency: int = Field(..., ge=0, le=7)
    workout_type: Optional[WorkoutType] = None
    
    # Meal plan details
    campus_name: str = "University of Kansas"
    meal_plan_type: MealPlanType
    cooking_availability: CookingAvailability
    
    # Preferred cuisine (optional)
    preferred_cuisine: Optional[str] = None


class UserCreate(UserBase):
    password: str
    allergies: List[int] = []
    diet_types: List[int] = []
    dining_halls: List[int] = []
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(None, ge=13, le=100)
    gender: Optional[Gender] = None
    height: Optional[float] = Field(None, ge=50, le=250)
    current_weight: Optional[float] = Field(None, ge=30, le=300)
    goal_weight: Optional[float] = Field(None, ge=30, le=300)
    main_goal: Optional[MainGoal] = None
    activity_level: Optional[ActivityLevel] = None
    workout_frequency: Optional[int] = Field(None, ge=0, le=7)
    workout_type: Optional[WorkoutType] = None
    meal_plan_type: Optional[MealPlanType] = None
    cooking_availability: Optional[CookingAvailability] = None
    preferred_cuisine: Optional[str] = None
    allergies: Optional[List[int]] = None
    diet_types: Optional[List[int]] = None
    dining_halls: Optional[List[int]] = None


class User(UserBase):
    id: int
    allergies: List[Allergy] = []
    diet_types: List[DietType] = []
    dining_halls: List[DiningHall] = []

    class Config:
        orm_mode = True


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
