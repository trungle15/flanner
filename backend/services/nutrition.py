"""Nutrition-related utility functions for calculating nutritional needs."""

from typing import Dict, Any
from backend.database.db import User


def calculate_bmr(user: User) -> float:
    """
    Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation.
    
    Args:
        user: User object with height (cm), weight (kg), age, and gender
        
    Returns:
        BMR in calories per day
    """
    # Mifflin-St Jeor Equation
    if user.gender.lower() == 'male':
        bmr = 10 * user.current_weight + 6.25 * user.height - 5 * user.age + 5
    else:
        bmr = 10 * user.current_weight + 6.25 * user.height - 5 * user.age - 161
    
    return bmr


def calculate_tdee(user: User) -> int:
    """
    Calculate Total Daily Energy Expenditure (TDEE) based on BMR and activity level.
    
    Args:
        user: User object with BMR and activity level
        
    Returns:
        TDEE in calories per day
    """
    # Calculate BMR
    bmr = calculate_bmr(user)
    
    # Activity multipliers
    activity_multipliers = {
        'sedentary': 1.2,  # Little or no exercise
        'lightly_active': 1.375,  # Light exercise 1-3 days/week
        'moderately_active': 1.55,  # Moderate exercise 3-5 days/week
        'very_active': 1.725,  # Hard exercise 6-7 days/week
        'athlete': 1.9  # Very hard exercise, physical job, or training twice/day
    }
    
    # Get activity multiplier
    multiplier = activity_multipliers.get(user.activity_level.lower(), 1.2)
    
    # Calculate TDEE
    tdee = bmr * multiplier
    
    # Adjust based on goal
    if user.main_goal == 'lose_weight':
        tdee = tdee * 0.85  # 15% deficit
    elif user.main_goal == 'gain_weight':
        tdee = tdee * 1.15  # 15% surplus
    
    return int(tdee)


def calculate_macros(user: User, target_calories: int) -> Dict[str, int]:
    """
    Calculate recommended macronutrient distribution based on user's goals.
    
    Args:
        user: User object with main goal
        target_calories: Target calorie intake
        
    Returns:
        Dictionary with protein, carbs, and fat in grams
    """
    # Default macro ratios (protein/carbs/fat)
    macro_ratios = {
        'lose_weight': (0.30, 0.40, 0.30),  # Higher protein for satiety and muscle preservation
        'gain_weight': (0.25, 0.50, 0.25),  # Higher carbs for energy and muscle building
        'maintain': (0.20, 0.50, 0.30),  # Balanced approach
        'improve_performance': (0.25, 0.55, 0.20),  # Higher carbs for athletic performance
        'general_wellness': (0.20, 0.50, 0.30)  # Balanced approach
    }
    
    # Get macro ratio based on goal
    protein_ratio, carb_ratio, fat_ratio = macro_ratios.get(user.main_goal, (0.20, 0.50, 0.30))
    
    # Calculate macros in grams
    # Protein: 4 calories per gram
    # Carbs: 4 calories per gram
    # Fat: 9 calories per gram
    protein = int((target_calories * protein_ratio) / 4)
    carbs = int((target_calories * carb_ratio) / 4)
    fat = int((target_calories * fat_ratio) / 9)
    
    return {
        'protein': protein,
        'carbs': carbs,
        'fat': fat
    }


def calculate_nutrient_needs(user: User) -> Dict[str, Any]:
    """
    Calculate comprehensive nutrient needs based on user profile.
    
    Args:
        user: User object
        
    Returns:
        Dictionary with all nutrient recommendations
    """
    # Calculate TDEE and macros
    tdee = calculate_tdee(user)
    macros = calculate_macros(user, tdee)
    
    # Calculate other nutrient needs
    # These are general recommendations and may need adjustment based on specific conditions
    
    # Water (in liters) - 0.033 liters per kg of body weight
    water = round(0.033 * user.current_weight, 1)
    
    # Fiber (in grams) - 14g per 1000 calories
    fiber = int(14 * (tdee / 1000))
    
    # Micronutrients (general adult RDAs)
    micronutrients = {
        'vitamin_a': '900 mcg',
        'vitamin_c': '90 mg',
        'vitamin_d': '15 mcg',
        'vitamin_e': '15 mg',
        'vitamin_k': '120 mcg',
        'thiamin': '1.2 mg',
        'riboflavin': '1.3 mg',
        'niacin': '16 mg',
        'vitamin_b6': '1.3 mg',
        'folate': '400 mcg',
        'vitamin_b12': '2.4 mcg',
        'calcium': '1000 mg',
        'iron': '8 mg',
        'magnesium': '400 mg',
        'zinc': '11 mg',
        'selenium': '55 mcg',
        'potassium': '3500 mg',
        'sodium': '2300 mg'
    }
    
    # Adjust iron needs for women (higher)
    if user.gender.lower() == 'female' and user.age <= 50:
        micronutrients['iron'] = '18 mg'
    
    return {
        'calories': tdee,
        'protein': macros['protein'],
        'carbs': macros['carbs'],
        'fat': macros['fat'],
        'water': water,
        'fiber': fiber,
        'micronutrients': micronutrients
    }
