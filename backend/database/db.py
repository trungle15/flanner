"""Database connection setup and ORM models for the KU Food Planner app."""

from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Table, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from pathlib import Path

# Create the database directory if it doesn't exist
db_dir = Path(__file__).parent.parent.parent / "data"
db_dir.mkdir(exist_ok=True)

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_dir}/ku_food_planner.db")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Association tables for many-to-many relationships
user_allergy = Table(
    "user_allergy",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("allergy_id", Integer, ForeignKey("allergies.id")),
)

user_diet_type = Table(
    "user_diet_type",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("diet_type_id", Integer, ForeignKey("diet_types.id")),
)

user_dining_hall = Table(
    "user_dining_hall",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("dining_hall_id", Integer, ForeignKey("dining_halls.id")),
)

mealplan_item = Table(
    "mealplan_item",
    Base.metadata,
    Column("mealplan_id", Integer, ForeignKey("mealplans.id")),
    Column("menu_item_id", Integer, ForeignKey("menu_items.id")),
)


# ORM Models
class User(Base):
    """User model for storing user profile information."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    age = Column(Integer)
    gender = Column(String)
    height = Column(Float)  # in cm
    current_weight = Column(Float)  # in kg
    goal_weight = Column(Float, nullable=True)  # in kg
    
    # Fitness goals
    main_goal = Column(String)  # 'lose_weight', 'gain_weight', 'maintain', 'improve_performance', 'general_wellness'
    activity_level = Column(String)  # 'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'athlete'
    workout_frequency = Column(Integer)  # days per week
    workout_type = Column(String, nullable=True)  # 'cardio', 'strength', 'sports', 'mixed'
    
    # Meal plan details
    campus_name = Column(String, default="University of Kansas")
    meal_plan_type = Column(String)  # 'unlimited', 'fixed_swipes', 'points_only', 'combination'
    cooking_availability = Column(String)  # 'none', 'microwave', 'limited', 'full'
    
    # Preferred cuisine (optional)
    preferred_cuisine = Column(String, nullable=True)
    
    # Relationships
    allergies = relationship("Allergy", secondary=user_allergy, back_populates="users")
    diet_types = relationship("DietType", secondary=user_diet_type, back_populates="users")
    dining_halls = relationship("DiningHall", secondary=user_dining_hall, back_populates="users")
    meal_plans = relationship("MealPlan", back_populates="user")


class Allergy(Base):
    """Allergy model for storing food allergies and restrictions."""
    __tablename__ = "allergies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    
    # Relationships
    users = relationship("User", secondary=user_allergy, back_populates="allergies")


class DietType(Base):
    """Diet type model for storing dietary preferences."""
    __tablename__ = "diet_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    
    # Relationships
    users = relationship("User", secondary=user_diet_type, back_populates="diet_types")


class DiningHall(Base):
    """Dining hall model for storing dining hall information."""
    __tablename__ = "dining_halls"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    location = Column(String, nullable=True)
    unit_oid = Column(String, unique=True)  # OID from the scraper
    
    # Relationships
    users = relationship("User", secondary=user_dining_hall, back_populates="dining_halls")
    menu_items = relationship("MenuItem", back_populates="dining_hall")


class MenuItem(Base):
    """Menu item model for storing scraped menu items."""
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    item_oid = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    date = Column(DateTime, index=True)
    meal_type = Column(String, index=True)
    dining_hall_id = Column(Integer, ForeignKey("dining_halls.id"))
    
    # Nutrition information
    serving_size = Column(String, nullable=True)
    calories = Column(Integer, nullable=True)
    _nutrients = Column("nutrients", Text, nullable=True)  # JSON string
    _allergens = Column("allergens", Text, nullable=True)  # JSON string
    
    # Relationships
    dining_hall = relationship("DiningHall", back_populates="menu_items")
    meal_plans = relationship("MealPlan", secondary=mealplan_item, back_populates="menu_items")
    
    @property
    def nutrients(self):
        if not self._nutrients:
            return {}
        try:
            import json
            return json.loads(self._nutrients)
        except:
            return {}
    
    @nutrients.setter
    def nutrients(self, value):
        if value is None:
            self._nutrients = None
        else:
            try:
                if isinstance(value, str):
                    # Verify it's valid JSON
                    import json
                    json.loads(value)
                    self._nutrients = value
                else:
                    self._nutrients = json.dumps(value)
            except:
                self._nutrients = None
    
    @property
    def allergens(self):
        if not self._allergens:
            return []
        try:
            if isinstance(self._allergens, str):
                if ',' in self._allergens:
                    return [allergen.strip() for allergen in self._allergens.split(',') if allergen.strip()]
                elif self._allergens.strip():
                    # Handle single allergen without commas
                    try:
                        import json
                        parsed = json.loads(self._allergens)
                        if isinstance(parsed, list):
                            return parsed
                        else:
                            # If it's not a list after JSON parsing, treat as a single allergen
                            return [self._allergens.strip()]
                    except:
                        # If it's not valid JSON, treat as a single allergen
                        return [self._allergens.strip()]
                else:
                    return []
            elif isinstance(self._allergens, list):
                return self._allergens
            else:
                return []
        except:
            return []
    
    @allergens.setter
    def allergens(self, value):
        if value is None:
            self._allergens = None
        else:
            try:
                if isinstance(value, str):
                    if ',' in value:
                        self._allergens = value
                    else:
                        # Verify it's valid JSON
                        import json
                        json.loads(value)
                        self._allergens = value
                else:
                    if all(isinstance(x, str) for x in value):
                        self._allergens = ','.join(value)
                    else:
                        self._allergens = json.dumps(value)
            except:
                self._allergens = None


class MealPlan(Base):
    """Meal plan model for storing generated meal plans."""
    __tablename__ = "mealplans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime, default=datetime.utcnow)
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)
    
    # Nutritional totals
    total_calories = Column(Integer, nullable=True)
    total_protein = Column(Float, nullable=True)
    total_carbs = Column(Float, nullable=True)
    total_fat = Column(Float, nullable=True)
    
    # AI generation metadata
    ai_prompt = Column(Text, nullable=True)
    ai_response = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="meal_plans")
    menu_items = relationship("MenuItem", secondary=mealplan_item, back_populates="meal_plans")


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)


def seed_initial_data():
    """Seed initial data for reference tables."""
    db = SessionLocal()
    
    # Seed diet types
    diet_types = [
        {"name": "No restriction", "description": "No dietary restrictions"},
        {"name": "Vegetarian", "description": "No meat, but may include dairy and eggs"},
        {"name": "Vegan", "description": "No animal products"},
        {"name": "Pescatarian", "description": "No meat except fish"},
        {"name": "Halal", "description": "Follows Islamic dietary laws"},
        {"name": "Kosher", "description": "Follows Jewish dietary laws"}
    ]
    
    # Seed allergies
    allergies = [
        {"name": "Lactose intolerance", "description": "Intolerance to dairy products"},
        {"name": "Gluten intolerance", "description": "Intolerance to gluten"},
        {"name": "Nut allergy", "description": "Allergy to nuts"},
        {"name": "Shellfish allergy", "description": "Allergy to shellfish"},
        {"name": "Soy allergy", "description": "Allergy to soy products"},
        {"name": "Egg allergy", "description": "Allergy to eggs"}
    ]
    
    # Seed dining halls
    dining_halls = [
        {"name": "Mrs. E's", "location": "Lewis Hall", "unit_oid": "1"},
        {"name": "The Market", "location": "Kansas Union", "unit_oid": "2"},
        {"name": "South Dining Commons", "location": "Oliver Hall", "unit_oid": "3"}
    ]
    
    # Insert diet types if they don't exist
    for diet_type in diet_types:
        if not db.query(DietType).filter(DietType.name == diet_type["name"]).first():
            db.add(DietType(**diet_type))
    
    # Insert allergies if they don't exist
    for allergy in allergies:
        if not db.query(Allergy).filter(Allergy.name == allergy["name"]).first():
            db.add(Allergy(**allergy))
    
    # Insert dining halls if they don't exist
    for dining_hall in dining_halls:
        if not db.query(DiningHall).filter(DiningHall.name == dining_hall["name"]).first():
            db.add(DiningHall(**dining_hall))
    
    db.commit()
    db.close()
