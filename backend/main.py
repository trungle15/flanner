"""Entry point for the KU Food Planner API with automatic menu scraping."""

import logging
import json
import os
import sys
from typing import Dict
from datetime import datetime, timedelta
import threading
import traceback

# FastAPI imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn

# Scraper imports
from backend.scraper.session_manager import SessionManager
from backend.scraper.menu_scraper import MenuScraper
from backend.scraper.item_scraper import ItemScraper
from backend.scraper.nutrition_scraper import NutritionScraper
from backend.config.config import OUTPUT_DIR, LOG_LEVEL, LOG_FORMAT
from backend.models.menu import Menu
from backend.models.nutrition import NutritionInfo

# API imports
from backend.api.endpoints import users, items, mealplans
from backend.database.db import get_db, init_db, seed_initial_data, MenuItem, DiningHall

# Create FastAPI app
app = FastAPI(
    title="KU Food Planner API",
    description="API for KU Food Planner - AI-assisted meal planning for KU students",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(users.router)
app.include_router(items.router)
app.include_router(mealplans.router)

def setup_logging(log_dir: str = "logs") -> None:
    """Set up logging for the application."""
    # Create log directory if it doesn't exist
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # Set up logging to file
    current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = os.path.join(log_dir, f"ku_food_planner_{current_time}.log")
    
    # Configure logging
    log_level = getattr(logging, LOG_LEVEL.upper())
    logging.basicConfig(
        level=log_level,
        format=LOG_FORMAT,
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    logging.info(f"Logging initialized. Log file: {log_file}")


def serialize_nutrition_info(nutrition_info: NutritionInfo) -> Dict:
    """Serialize nutrition info for JSON output."""
    return {
        "item_oid": nutrition_info.item_oid,
        "item_name": nutrition_info.item_name,
        "serving_size": nutrition_info.serving_size,
        "calories": nutrition_info.calories,
        "nutrients": nutrition_info.nutrients,
        "allergens": nutrition_info.allergens
    }


def import_menu_to_db(menu_data: Dict, db: Session, dining_hall_id: int) -> None:
    """Import scraped menu data into the database."""
    logger = logging.getLogger(__name__)
    
    if not menu_data:
        logger.error("No menu data provided")
        return
    
    date_str = menu_data.get("date")
    if not date_str:
        logger.error("No date information in menu data")
        return
        
    meal_type = menu_data.get("meal_type")
    if not meal_type:
        logger.error("No meal type information in menu data")
        return
    
    try:
        # Parse date string to datetime
        menu_date = datetime.strptime(date_str, "%A, %B %d, %Y")
        
        # Process each menu item
        for item_data in menu_data.get("items", []):
            # Check if item already exists in database
            nutrition_data = item_data.get("nutrition", {})
            item_oid = nutrition_data.get("item_oid")
            
            existing_item = db.query(MenuItem).filter(
                MenuItem.item_oid == item_oid,
                MenuItem.date == menu_date,
                MenuItem.meal_type == meal_type
            ).first()
            
            if not existing_item:
                # Create new menu item
                menu_item = MenuItem(
                    item_oid=item_oid,
                    name=item_data.get("name"),
                    category=item_data.get("category"),
                    date=menu_date,
                    meal_type=meal_type,
                    dining_hall_id=dining_hall_id,
                    serving_size=nutrition_data.get("serving_size"),
                    calories=nutrition_data.get("calories"),
                    nutrients=json.dumps(nutrition_data.get("nutrients", {})),
                    allergens=json.dumps(nutrition_data.get("allergens", []))
                )
                db.add(menu_item)
                logger.info(f"Added menu item: {menu_item.name}")
        
        db.commit()
        logger.info(f"Imported menu data for {date_str}, {meal_type}")
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error importing menu data: {str(e)}")


def scrape_menu(menu: Menu, session_manager: SessionManager, db: Session, dining_hall_id: int) -> None:
    """Scrape a specific menu and save the results to file and database."""
    logger = logging.getLogger(__name__)
    logger.info(f"Scraping {menu.meal_type} for {menu.date}")
    
    # Create scrapers
    item_scraper = ItemScraper(session_manager)
    nutrition_scraper = NutritionScraper(session_manager)
    
    # Get menu items
    items = item_scraper.get_items(menu.menu_oid)
    logger.info(f"Found {len(items)} items for {menu.meal_type} on {menu.date}")
    
    # Get nutrition info for each item
    results = []
    for item in items:
        logger.info(f"Scraping nutrition info for {item.name}")
        nutrition_info = nutrition_scraper.get_nutrition_info(item.item_oid)
        if nutrition_info:
            results.append({
                "name": item.name,
                "category": item.category,
                "nutrition": serialize_nutrition_info(nutrition_info)
            })
    
    # Create output directory if it doesn't exist
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    
    # Save results to JSON file
    date_str = menu.date.replace(",", "").replace(" ", "_")
    meal_type = menu.meal_type.replace(" ", "_")
    output_file = os.path.join(OUTPUT_DIR, f"{date_str}_{meal_type}.json")
    
    menu_data = {
        "date": menu.date,
        "meal_type": menu.meal_type,
        "items": results
    }
    
    with open(output_file, "w") as f:
        json.dump(menu_data, f, indent=2)
    
    logger.info(f"Saved results to {output_file}")
    
    # Import into database
    import_menu_to_db(menu_data, db, dining_hall_id)


def run_scraper():
    """Run the scraper to get the latest menu data."""
    logger = logging.getLogger(__name__)
    logger.info("Starting menu scraper")
    
    # Get database session
    try:
        db = next(get_db())
    except Exception as e:
        logger.error(f"Error getting database session: {str(e)}")
        return
    
    # Create output directory if it doesn't exist
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    
    try:
        # Create session manager
        session_manager = SessionManager()
        if not session_manager.initialize():
            logger.error("Failed to initialize session")
            return
        
        # Create menu scraper
        menu_scraper = MenuScraper(session_manager)
        
        # Get dining halls from database
        dining_halls = db.query(DiningHall).all()
        
        # If no dining halls in database, use default unit OID
        if not dining_halls:
            # Get the next 7 days of menus
            today = datetime.now()
            menu_dates = []
            
            # Try to get menu dates from scraper
            scraper_dates = menu_scraper.get_menu_dates()
            if scraper_dates:
                menu_dates = scraper_dates[:7]  # Get first 7 dates
            else:
                # Fallback to generating dates
                for i in range(7):
                    date = today + timedelta(days=i)
                    date_str = date.strftime("%A, %B %d, %Y")
                    menu_dates.append(date_str)
            
            for date_item in menu_dates:
                try:
                    date_str = date_item.raw_text if hasattr(date_item, 'raw_text') else date_item
                    logger.info(f"Scraping menus for {date_str}")
                    
                    # Get available meals for the date
                    menus = menu_scraper.get_available_meals(date_str)
                    
                    # Scrape each menu
                    for menu in menus:
                        dining_hall_id = dining_hall.id if dining_hall else 1
                        scrape_menu(menu, session_manager, db, dining_hall_id)
                except Exception as e:
                    logger.error(f"Error processing menu date: {str(e)}")
        else:
            # Scrape menus for each dining hall
            for dining_hall in dining_halls:
                logger.info(f"Scraping menus for dining hall: {dining_hall.name}")
                
                # Get the next 7 days of menus
                today = datetime.now()
                menu_dates = []
                
                # Try to get menu dates from scraper
                scraper_dates = menu_scraper.get_menu_dates()
                if scraper_dates:
                    menu_dates = scraper_dates[:7]  # Get first 7 dates
                else:
                    # Fallback to generating dates
                    for i in range(7):
                        date = today + timedelta(days=i)
                        date_str = date.strftime("%A, %B %d, %Y")
                        menu_dates.append(date_str)
                
                for date_item in menu_dates:
                    try:
                        date_str = date_item.raw_text if hasattr(date_item, 'raw_text') else date_item
                        logger.info(f"Scraping menus for {date_str}")
                        
                        # Get available meals for the date
                        menus = menu_scraper.get_available_meals(date_str)
                        
                        # Scrape each menu
                        for menu in menus:
                            scrape_menu(menu, session_manager, db, dining_hall.id)
                    except Exception as e:
                        logger.error(f"Error processing menu date for {dining_hall.name}: {str(e)}")
        
        logger.info("Scraping completed successfully")
    
    except Exception as e:
        logger.error(f"Error running scraper: {str(e)}")
        traceback.print_exc()
    
    finally:
        db.close()


def schedule_scraper():
    """Schedule the scraper to run periodically."""
    try:
        run_scraper()
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error in scheduled scraper run: {str(e)}")
    
    # Schedule next run in 24 hours
    threading.Timer(24 * 60 * 60, schedule_scraper).start()


# Startup event
@app.on_event("startup")
def startup_event():
    """Initialize database, seed initial data, and start background scraper on startup."""
    setup_logging()
    logging.info("Application starting up")
    
    # Initialize database
    init_db()
    seed_initial_data()
    
    # Start scraper in a background thread
    # threading.Thread(target=schedule_scraper, daemon=True).start()
    
    logging.info("Application started successfully")


def main():
    """Main entry point for the application."""
    # Run the FastAPI app with uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()