"""Endpoints to retrieve scraped menu items."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta

from backend.database.db import get_db, MenuItem, DiningHall
from backend.models.mealplan import MenuItem as MenuItemModel
from backend.api.dependencies import get_current_active_user

router = APIRouter(
    prefix="/items",
    tags=["items"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[MenuItemModel])
def get_menu_items(
    dining_hall_id: Optional[int] = None,
    date: Optional[date] = None,
    meal_type: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get menu items with optional filters."""
    query = db.query(MenuItem)
    
    # Apply filters
    if dining_hall_id:
        query = query.filter(MenuItem.dining_hall_id == dining_hall_id)
    
    if date:
        # Filter by date (ignoring time component)
        query = query.filter(MenuItem.date >= datetime.combine(date, datetime.min.time()))
        query = query.filter(MenuItem.date < datetime.combine(date + timedelta(days=1), datetime.min.time()))
    
    if meal_type:
        query = query.filter(MenuItem.meal_type == meal_type)
    
    if category:
        query = query.filter(MenuItem.category == category)
    
    # Get items and parse strings
    items = query.all()
    for item in items:
        if item.nutrients:
            try:
                # Handle nutrients as a JSON string
                import json
                item.nutrients = json.loads(item.nutrients)
            except:
                item.nutrients = None
        # Allergens are now handled by the model's property getter
    
    return items


@router.get("/dining-halls/{dining_hall_id}", response_model=List[MenuItemModel])
def get_items_by_dining_hall(
    dining_hall_id: int,
    date: Optional[date] = None,
    meal_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get menu items for a specific dining hall."""
    # Check if dining hall exists
    dining_hall = db.query(DiningHall).filter(DiningHall.id == dining_hall_id).first()
    if not dining_hall:
        raise HTTPException(status_code=404, detail="Dining hall not found")
    
    query = db.query(MenuItem).filter(MenuItem.dining_hall_id == dining_hall_id)
    
    # Apply filters
    if date:
        # Filter by date (ignoring time component)
        query = query.filter(MenuItem.date >= datetime.combine(date, datetime.min.time()))
        query = query.filter(MenuItem.date < datetime.combine(date + timedelta(days=1), datetime.min.time()))
    
    if meal_type:
        query = query.filter(MenuItem.meal_type == meal_type)
    
    # Get items and parse strings
    items = query.all()
    for item in items:
        if item.nutrients:
            try:
                # Handle nutrients as a JSON string
                import json
                item.nutrients = json.loads(item.nutrients)
            except:
                item.nutrients = None
        # Allergens are now handled by the model's property getter
    
    return items


@router.get("/meal-types", response_model=List[str])
def get_meal_types(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get all available meal types."""
    meal_types = db.query(MenuItem.meal_type).distinct().all()
    return [meal_type[0] for meal_type in meal_types]


@router.get("/categories", response_model=List[str])
def get_categories(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get all available food categories."""
    categories = db.query(MenuItem.category).distinct().all()
    return [category[0] for category in categories]


@router.get("/dates", response_model=List[date])
def get_available_dates(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get all dates for which menu items are available."""
    dates = db.query(MenuItem.date).distinct().all()
    return [date[0].date() for date in dates]


@router.get("/search", response_model=List[MenuItemModel])
def search_menu_items(
    query: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Search for menu items by name."""
    items = db.query(MenuItem).filter(MenuItem.name.ilike(f"%{query}%")).all()
    
    # Parse strings
    for item in items:
        if item.nutrients:
            try:
                # Handle nutrients as a JSON string
                import json
                item.nutrients = json.loads(item.nutrients)
            except:
                item.nutrients = None
        # Allergens are now handled by the model's property getter
    
    return items


@router.get("/{item_id}", response_model=MenuItemModel)
def get_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get a specific menu item by ID."""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    # Parse strings
    if item.nutrients:
        try:
            # Handle nutrients as a JSON string
            import json
            item.nutrients = json.loads(item.nutrients)
        except:
            item.nutrients = None
    # Allergens are now handled by the model's property getter
    
    return item
