"""Endpoints for generating and retrieving meal plans."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta

from backend.database.db import get_db, MealPlan, MenuItem, User
from backend.models.mealplan import MealPlan as MealPlanModel, MealPlanCreate, MealPlanUpdate, MealPlanRequest, WeeklyMealPlan
from backend.api.dependencies import get_current_active_user
from backend.services.ai_service import generate_meal_plan

router = APIRouter(
    prefix="/mealplans",
    tags=["mealplans"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=MealPlanModel)
def create_meal_plan(
    meal_plan: MealPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new meal plan manually."""
    # Verify user
    if meal_plan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create meal plan for another user")
    
    # Verify menu items exist
    menu_items = db.query(MenuItem).filter(MenuItem.id.in_(meal_plan.menu_items)).all()
    if len(menu_items) != len(meal_plan.menu_items):
        raise HTTPException(status_code=400, detail="One or more menu items not found")
    
    # Calculate nutritional totals
    total_calories = sum(item.calories or 0 for item in menu_items)
    
    def extract_numeric_value(nutrient_str):
        if not nutrient_str:
            return 0
        # Remove 'g' or other units and convert to float
        try:
            return float(''.join(c for c in nutrient_str if c.isdigit() or c == '.'))
        except ValueError:
            return 0
    
    total_protein = sum(
        extract_numeric_value(item.nutrients.get("Protein", "0g")) if item.nutrients else 0 
        for item in menu_items
    )
    total_carbs = sum(
        extract_numeric_value(item.nutrients.get("Total Carbohydrate", "0g")) if item.nutrients else 0 
        for item in menu_items
    )
    total_fat = sum(
        extract_numeric_value(item.nutrients.get("Total Fat", "0g")) if item.nutrients else 0 
        for item in menu_items
    )
    
    # Create meal plan
    db_meal_plan = MealPlan(
        user_id=current_user.id,
        name=meal_plan.name,
        description=meal_plan.description,
        total_calories=total_calories,
        total_protein=total_protein,
        total_carbs=total_carbs,
        total_fat=total_fat,
        ai_prompt=meal_plan.ai_prompt,
        ai_response=meal_plan.ai_response,
        menu_items=menu_items
    )
    
    db.add(db_meal_plan)
    db.commit()
    db.refresh(db_meal_plan)
    return db_meal_plan


@router.post("/generate", response_model=MealPlanModel)
def generate_ai_meal_plan(
    request: MealPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate a meal plan using AI based on user preferences."""
    # Use the target date or default to today
    target_date = request.date or datetime.now().date()
    
    # Get user's dietary preferences and restrictions
    allergies = [allergy.name for allergy in current_user.allergies]
    diet_types = [diet.name for diet in current_user.diet_types]
    dining_halls = [hall.id for hall in current_user.dining_halls]
    
    # Generate AI meal plan
    meal_plan_data = generate_meal_plan(
        db=db,
        user=current_user,
        date=target_date,
        meal_types=request.meal_types,
        max_calories=request.max_calories,
        allergies=allergies,
        diet_types=diet_types,
        dining_hall_ids=dining_halls,
        preferences=request.preferences,
        additional_instructions=request.additional_instructions
    )
    
    # Create meal plan in database
    db_meal_plan = MealPlan(
        user_id=current_user.id,
        name=f"Meal Plan for {target_date.strftime('%Y-%m-%d')}",
        description=meal_plan_data.get("description"),
        total_calories=meal_plan_data.get("total_calories"),
        total_protein=meal_plan_data.get("total_protein"),
        total_carbs=meal_plan_data.get("total_carbs"),
        total_fat=meal_plan_data.get("total_fat"),
        ai_prompt=meal_plan_data.get("ai_prompt"),
        ai_response=meal_plan_data.get("ai_response"),
        menu_items=meal_plan_data.get("menu_items")
    )
    
    db.add(db_meal_plan)
    db.commit()
    db.refresh(db_meal_plan)
    return db_meal_plan


@router.get("/", response_model=List[MealPlanModel])
def get_meal_plans(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all meal plans for the current user with optional date range filter."""
    query = db.query(MealPlan).filter(MealPlan.user_id == current_user.id)
    
    if start_date:
        query = query.filter(MealPlan.date >= datetime.combine(start_date, datetime.min.time()))
    
    if end_date:
        query = query.filter(MealPlan.date < datetime.combine(end_date + timedelta(days=1), datetime.min.time()))
    
    return query.order_by(MealPlan.date.desc()).all()


@router.get("/weekly", response_model=WeeklyMealPlan)
def get_weekly_meal_plan(
    start_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get or generate a weekly meal plan."""
    # Use the start date or default to the beginning of the current week
    today = datetime.now().date()
    if start_date is None:
        # Get the beginning of the current week (Monday)
        start_date = today - timedelta(days=today.weekday())
    
    # End date is 6 days after start date (Sunday)
    end_date = start_date + timedelta(days=6)
    
    # Get existing meal plans for the week
    meal_plans = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.date >= datetime.combine(start_date, datetime.min.time()),
        MealPlan.date < datetime.combine(end_date + timedelta(days=1), datetime.min.time())
    ).all()
    
    # Organize meal plans by day
    daily_plans = {}
    for i in range(7):
        day_date = start_date + timedelta(days=i)
        day_str = day_date.strftime("%Y-%m-%d")
        
        # Find meal plans for this day
        day_meal_plans = [mp for mp in meal_plans if mp.date.date() == day_date]
        
        if day_meal_plans:
            # Combine all meal plans for the day
            meals = {}
            total_calories = 0
            total_protein = 0
            total_carbs = 0
            total_fat = 0
            
            for mp in day_meal_plans:
                total_calories += mp.total_calories or 0
                total_protein += mp.total_protein or 0
                total_carbs += mp.total_carbs or 0
                total_fat += mp.total_fat or 0
                
                # Group items by meal type
                for item in mp.menu_items:
                    meal_type = item.meal_type
                    if meal_type not in meals:
                        meals[meal_type] = []
                    meals[meal_type].append(item)
            
            daily_plans[day_str] = {
                "total_calories": total_calories,
                "total_protein": total_protein,
                "total_carbs": total_carbs,
                "total_fat": total_fat,
                "meals": meals
            }
        else:
            # No meal plans for this day
            daily_plans[day_str] = {
                "total_calories": 0,
                "total_protein": 0,
                "total_carbs": 0,
                "total_fat": 0,
                "meals": {}
            }
    
    # Generate recommendations based on the week's nutrition
    recommendations = None
    if meal_plans:
        avg_calories = sum(mp.total_calories or 0 for mp in meal_plans) / len(meal_plans)
        avg_protein = sum(mp.total_protein or 0 for mp in meal_plans) / len(meal_plans)
        avg_carbs = sum(mp.total_carbs or 0 for mp in meal_plans) / len(meal_plans)
        avg_fat = sum(mp.total_fat or 0 for mp in meal_plans) / len(meal_plans)
        
        # Simple recommendations based on averages
        recommendations = f"Weekly average: {avg_calories:.0f} calories, {avg_protein:.1f}g protein, {avg_carbs:.1f}g carbs, {avg_fat:.1f}g fat."
        
        # Add recommendations based on user goals
        if current_user.main_goal == "lose_weight" and avg_calories > 2000:
            recommendations += " Consider reducing calorie intake to meet weight loss goals."
        elif current_user.main_goal == "gain_weight" and avg_calories < 2500:
            recommendations += " Consider increasing calorie intake to meet weight gain goals."
        
        if current_user.main_goal in ["gain_weight", "improve_performance"] and avg_protein < 100:
            recommendations += " Protein intake may be lower than optimal for your goals."
    
    return {
        "user_id": current_user.id,
        "start_date": start_date,
        "end_date": end_date,
        "daily_plans": daily_plans,
        "recommendations": recommendations
    }


@router.get("/{meal_plan_id}", response_model=MealPlanModel)
def get_meal_plan(
    meal_plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific meal plan by ID."""
    meal_plan = db.query(MealPlan).filter(MealPlan.id == meal_plan_id).first()
    if not meal_plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    
    # Check if the meal plan belongs to the current user
    if meal_plan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this meal plan")
    
    return meal_plan


@router.put("/{meal_plan_id}", response_model=MealPlanModel)
def update_meal_plan(
    meal_plan_id: int,
    meal_plan_update: MealPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a specific meal plan."""
    db_meal_plan = db.query(MealPlan).filter(MealPlan.id == meal_plan_id).first()
    if not db_meal_plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    
    # Check if the meal plan belongs to the current user
    if db_meal_plan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this meal plan")
    
    # Update meal plan attributes
    if meal_plan_update.name is not None:
        db_meal_plan.name = meal_plan_update.name
    
    if meal_plan_update.description is not None:
        db_meal_plan.description = meal_plan_update.description
    
    # Update menu items if provided
    if meal_plan_update.menu_items is not None:
        menu_items = db.query(MenuItem).filter(MenuItem.id.in_(meal_plan_update.menu_items)).all()
        if len(menu_items) != len(meal_plan_update.menu_items):
            raise HTTPException(status_code=400, detail="One or more menu items not found")
        
        # Update menu items
        db_meal_plan.menu_items = menu_items
        
        # Recalculate nutritional totals
        db_meal_plan.total_calories = sum(item.calories or 0 for item in menu_items)
        db_meal_plan.total_protein = sum(
            extract_numeric_value(parse_nutrients(item).get("Protein", "0g")) if item.nutrients else 0 
            for item in menu_items
        )
        db_meal_plan.total_carbs = sum(
            extract_numeric_value(parse_nutrients(item).get("Total Carbohydrate", "0g")) if item.nutrients else 0 
            for item in menu_items
        )
        db_meal_plan.total_fat = sum(
            extract_numeric_value(parse_nutrients(item).get("Total Fat", "0g")) if item.nutrients else 0 
            for item in menu_items
        )
        
        # Update menu items with parsed data for response, but serialize for database
        for item in menu_items:
            parsed_nutrients = parse_nutrients(item)
            parsed_allergens = parse_allergens(item)
            
            # Store parsed data for response
            item._nutrients = parsed_nutrients
            item._allergens = parsed_allergens
            
            # Serialize for database
            item.nutrients = serialize_nutrients(parsed_nutrients)
            item.allergens = serialize_allergens(parsed_allergens)
    
    db.commit()
    db.refresh(db_meal_plan)
    return db_meal_plan


@router.delete("/{meal_plan_id}", status_code=204)
def delete_meal_plan(
    meal_plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a specific meal plan."""
    db_meal_plan = db.query(MealPlan).filter(MealPlan.id == meal_plan_id).first()
    if not db_meal_plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    
    # Check if the meal plan belongs to the current user
    if db_meal_plan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this meal plan")
    
    db.delete(db_meal_plan)
    db.commit()
    return None
