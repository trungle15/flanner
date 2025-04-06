"""Pydantic models for meal plan data validation and serialization."""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class MenuItemBase(BaseModel):
    item_oid: str
    name: str
    category: str
    meal_type: str
    
    # Nutrition information
    serving_size: Optional[str] = None
    calories: Optional[int] = None
    nutrients: Optional[Dict[str, Any]] = None
    allergens: Optional[List[str]] = None


class MenuItemCreate(MenuItemBase):
    date: datetime
    dining_hall_id: int


class MenuItem(MenuItemBase):
    id: int
    date: datetime
    dining_hall_id: int

    class Config:
        orm_mode = True


class MealPlanBase(BaseModel):
    user_id: int
    name: Optional[str] = None
    description: Optional[str] = None
    
    # Nutritional totals
    total_calories: Optional[int] = None
    total_protein: Optional[float] = None
    total_carbs: Optional[float] = None
    total_fat: Optional[float] = None


class MealPlanItem(BaseModel):
    """Model for menu items in a meal plan, including servings."""
    id: int
    name: str
    category: str
    meal_type: str
    serving_size: Optional[str] = None
    calories: Optional[int] = None
    nutrients: Optional[Dict[str, Any]] = None
    allergens: Optional[List[str]] = None
    servings: float = Field(default=1.0, ge=0.0, description="Number of servings of this item")
    
    class Config:
        orm_mode = True


class MealPlanCreate(MealPlanBase):
    menu_items: List[MealPlanItem]
    ai_prompt: Optional[str] = None
    ai_response: Optional[str] = None


class MealPlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    menu_items: Optional[List[MealPlanItem]] = None


class MealPlan(MealPlanBase):
    id: int
    date: datetime
    menu_items: List[MealPlanItem]
    ai_prompt: Optional[str] = None
    ai_response: Optional[str] = None

    class Config:
        orm_mode = True


class MealPlanRequest(BaseModel):
    """Request model for generating a meal plan."""
    date: Optional[datetime] = None
    meal_types: List[str] = Field(..., description="List of meal types to include in the plan")
    max_calories: Optional[int] = None
    preferences: Optional[str] = None
    additional_instructions: Optional[str] = None


class DailyNutrition(BaseModel):
    """Daily nutrition summary."""
    total_calories: int
    total_protein: float
    total_carbs: float
    total_fat: float
    meals: Dict[str, List[MenuItem]]


class WeeklyMealPlan(BaseModel):
    """Weekly meal plan response."""
    user_id: int
    start_date: datetime
    end_date: datetime
    daily_plans: Dict[str, DailyNutrition]
    recommendations: Optional[str] = None
