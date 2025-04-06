"""AI service for generating meal plans based on user preferences and dining hall options."""

import logging
import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from google import genai
from dotenv import load_dotenv

from backend.database.db import User, MenuItem, DiningHall
from backend.services.nutrition import calculate_tdee, calculate_macros

# Load environment variables
load_dotenv()

# Configure Google Gemini API
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

logger = logging.getLogger(__name__)


def generate_meal_plan(
    db: Session,
    user: User,
    date: date,
    meal_types: List[str],
    max_calories: Optional[int] = None,
    allergies: Optional[List[str]] = None,
    diet_types: Optional[List[str]] = None,
    dining_hall_ids: Optional[List[int]] = None,
    preferences: Optional[str] = None,
    additional_instructions: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate a meal plan using AI based on user preferences and available menu items.
    
    Args:
        db: Database session
        user: User object
        date: Target date for the meal plan
        meal_types: List of meal types to include (e.g., ["BREAKFAST", "LUNCH", "DINNER"])
        max_calories: Maximum calories for the day
        allergies: List of user allergies
        diet_types: List of user dietary preferences
        dining_hall_ids: List of preferred dining hall IDs
        preferences: Additional food preferences
        additional_instructions: Any additional instructions for the AI
        
    Returns:
        Dictionary containing the generated meal plan data
    """
    # Get available menu items for the specified date and meal types
    query = db.query(MenuItem).filter(
        MenuItem.date >= datetime.combine(date, datetime.min.time()),
        MenuItem.date < datetime.combine(date + timedelta(days=1), datetime.min.time()),
        MenuItem.meal_type.in_(meal_types)
    )
    
    # Filter by dining halls if specified
    if dining_hall_ids:
        query = query.filter(MenuItem.dining_hall_id.in_(dining_hall_ids))
    
    available_items = query.all()
    
    if not available_items:
        logger.warning(f"No menu items found for date {date} and meal types {meal_types}")
        return {
            "description": "No menu items available for the selected date and meal types.",
            "total_calories": 0,
            "total_protein": 0,
            "total_carbs": 0,
            "total_fat": 0,
            "menu_items": [],
            "ai_prompt": "",
            "ai_response": ""
        }
    
    # Calculate user's nutritional needs
    tdee = calculate_tdee(user)
    target_calories = max_calories if max_calories else tdee
    macros = calculate_macros(user, target_calories)
    
    # Prepare items data for AI
    items_data = []
    for item in available_items:
        # Get nutrients dictionary
        nutrients_dict = {}
        if item.nutrients:
            # The nutrients property already returns a dictionary
            nutrients_dict = item.nutrients
        
        # Get allergens list
        allergens_list = []
        if item.allergens:
            # The allergens property already returns a list
            allergens_list = item.allergens
        
        # Get dining hall name
        dining_hall = db.query(DiningHall).filter(DiningHall.id == item.dining_hall_id).first()
        dining_hall_name = dining_hall.name if dining_hall else "Unknown"
        
        items_data.append({
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "meal_type": item.meal_type,
            "dining_hall": dining_hall_name,
            "calories": item.calories,
            "serving_size": item.serving_size,
            "nutrients": nutrients_dict,
            "allergens": allergens_list
        })
    
    # Construct prompt for AI
    prompt = f"""
    Generate a personalized meal plan for a student at the University of Kansas with the following profile:
    
    User Profile:
    - Age: {user.age}
    - Gender: {user.gender}
    - Height: {user.height} cm
    - Current Weight: {user.current_weight} kg
    - Goal Weight: {user.goal_weight if user.goal_weight else 'Not specified'} kg
    - Main Goal: {user.main_goal}
    - Activity Level: {user.activity_level}
    - Workout Frequency: {user.workout_frequency} days per week
    - Workout Type: {user.workout_type if user.workout_type else 'Not specified'}
    
    Dietary Information:
    - Diet Types: {', '.join(diet_types) if diet_types else 'No restrictions'}
    - Allergies/Restrictions: {', '.join(allergies) if allergies else 'None'}
    - Preferred Cuisine: {user.preferred_cuisine if user.preferred_cuisine else 'Not specified'}
    - Additional Preferences: {preferences if preferences else 'None'}
    
    Nutritional Targets:
    - Target Calories: {target_calories} kcal
    - Target Protein: {macros['protein']} g
    - Target Carbs: {macros['carbs']} g
    - Target Fat: {macros['fat']} g
    
    Meal Types to Include: {', '.join(meal_types)}
    Date: {date.strftime('%A, %B %d, %Y')}
    
    Available Menu Items:
    ```
    {json.dumps(items_data, indent=2)}
    ```
    
    Additional Instructions: {additional_instructions if additional_instructions else 'None'}
    Target Calories for the day: {target_calories if target_calories else 'Not specified'}
    
    Please create a meal plan that:
    1. Selects appropriate items from the available menu for each meal type
    2. Meets or comes close to the nutritional targets
    3. Respects dietary restrictions and allergies
    4. Provides variety and balance
    5. Returns the selected menu item IDs and a brief explanation of why they were chosen
    
    Format your response as a JSON object with the following structure:
    {{
        "selected_items": [
            {{
                "id": item_id,
                "servings": number_of_servings
            }}
        ],
        "explanation": "Brief explanation of the meal plan and why these items were chosen, including serving sizes",
        "nutritional_summary": {{
            "total_calories": X,
            "total_protein": X,
            "total_carbs": X,
            "total_fat": X
        }}
    }}
    """
    
    # print("\n\nRAW AI PROMPT:")
    # print(prompt[:500])
    # print("\n\n")
        
    
    # Call Google Gemini API
    try:
        # Create system prompt and user prompt
        system_prompt = "You are a nutrition expert and meal planner for college students."
        full_prompt = f"{system_prompt}\n\n{prompt}"
        
        # Generate response using Gemini 2.0 Flash
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=full_prompt
        )
        
        # Extract response text
        ai_response = response.text.strip()
        
        # Print the raw AI response for debugging
        # print("\n\nRAW AI RESPONSE:")
        # print(ai_response)
        # print("\n\n")
        
        # Parse JSON response
        try:
            # Find JSON in the response (Gemini might wrap the JSON in markdown or explanatory text)
            json_start = ai_response.find('{')
            json_end = ai_response.rfind('}')
            
            if json_start >= 0 and json_end >= 0:
                json_str = ai_response[json_start:json_end+1]
                response_data = json.loads(json_str)
            else:
                # Try to parse the whole response as JSON
                response_data = json.loads(ai_response)
            
            # Get selected items
            selected_items_data = response_data.get("selected_items", [])
            # Extract menu item IDs and servings
            menu_item_map = {item["id"]: item["servings"] for item in selected_items_data}
            selected_items = db.query(MenuItem).filter(MenuItem.id.in_(menu_item_map.keys())).all()
            # Add servings to each menu item
            for item in selected_items:
                item.servings = menu_item_map[item.id]
            
            # Get nutritional summary
            nutritional_summary = response_data.get("nutritional_summary", {})
            
            return {
                "description": response_data.get("explanation", "AI-generated meal plan"),
                "total_calories": nutritional_summary.get("total_calories", 0),
                "total_protein": nutritional_summary.get("total_protein", 0),
                "total_carbs": nutritional_summary.get("total_carbs", 0),
                "total_fat": nutritional_summary.get("total_fat", 0),
                "menu_items": [{"id": item.id, "servings": item.servings} for item in selected_items],
                "ai_prompt": prompt,
                "ai_response": ai_response
            }
        except json.JSONDecodeError:
            logger.error(f"Failed to parse AI response as JSON: {ai_response}")
            # Fallback: return a simple meal plan with random items
            return fallback_meal_plan(available_items, prompt, ai_response)
    
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {str(e)}")
        # Fallback: return a simple meal plan with random items
        return fallback_meal_plan(available_items, prompt, str(e))


def fallback_meal_plan(available_items, prompt, error_response):
    """Create a fallback meal plan when AI generation fails."""
    import random
    
    # Group items by meal type
    meal_type_items = {}
    for item in available_items:
        if item.meal_type not in meal_type_items:
            meal_type_items[item.meal_type] = []
        meal_type_items[item.meal_type].append(item)
    
    # Select random items for each meal type (up to 3 per meal)
    selected_items = []
    for meal_type, items in meal_type_items.items():
        selected_items.extend(random.sample(items, min(3, len(items))))
    
    # Calculate nutritional totals
    total_calories = sum(item.calories or 0 for item in selected_items)
    
    # Extract protein, carbs, and fat from nutrients
    total_protein = 0
    total_carbs = 0
    total_fat = 0
    
    for item in selected_items:
        if item.nutrients:
            try:
                nutrients = eval(item.nutrients)
                total_protein += float(nutrients.get("Protein", "0").split()[0])
                total_carbs += float(nutrients.get("Total Carb.", "0").split()[0])
                total_fat += float(nutrients.get("Total Fat", "0").split()[0])
            except:
                pass
    
    return {
        "description": "Fallback meal plan (AI generation failed)",
        "total_calories": total_calories,
        "total_protein": total_protein,
        "total_carbs": total_carbs,
        "total_fat": total_fat,
        "menu_items": selected_items,
        "ai_prompt": prompt,
        "ai_response": error_response
    }
