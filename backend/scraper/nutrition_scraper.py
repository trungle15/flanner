"""Module for scraping nutrition information from the Grinnell nutrition website."""

import logging
from typing import Optional
from bs4 import BeautifulSoup
import re

from backend.scraper.session_manager import SessionManager
from backend.config.config import ENDPOINTS
from backend.models.nutrition import NutritionInfo

logger = logging.getLogger(__name__)

class NutritionScraper:
    """Scrapes nutrition information for menu items."""
    
    def __init__(self, session_manager: Optional[SessionManager] = None):
        """Initialize the nutrition scraper with a session manager."""
        self.session_manager = session_manager or SessionManager()
    
    def get_nutrition_info(self, item_oid: str) -> Optional[NutritionInfo]:
        """Get nutrition information for a specific menu item."""
        nutrition_data = self.session_manager.post(
            ENDPOINTS["nutrition_label"],
            {"detailOid": item_oid}
        )
        
        if not nutrition_data:
            logger.error(f"Failed to get nutrition data for item {item_oid}")
            return None
        
        try:
            soup = BeautifulSoup(nutrition_data["nutritionLabel"], "html.parser")
            
            # Extract item name
            item_name_td = soup.find("td", class_="cbo_nn_LabelHeader")
            item_name = item_name_td.get_text(strip=True) if item_name_td else "Unknown"
            
            # Extract serving size
            serving_size_td = soup.find("td", class_="cbo_nn_LabelBottomBorderLabel")
            serving_size_match = re.search(r"Serving Size:\s*(.*)", serving_size_td.get_text(strip=True)) if serving_size_td else None
            serving_size = serving_size_match.group(1) if serving_size_match else "Unknown"
            
            # Extract calories
            calorie_span = soup.find("span", string=re.compile(r"Calories", re.I))
            if calorie_span:
                calories_container = calorie_span.find_next("span", class_="cbo_nn_SecondaryNutrient")
                calories = int(calories_container.get_text(strip=True)) if calories_container else 0
            else:
                calories = 0
            
            # Extract nutrients
            nutrients = {}
            nutrient_tables = soup.find_all("td", class_="cbo_nn_LabelBorderedSubHeader")
            for td in nutrient_tables:
                inner_table = td.find("table")
                if not inner_table:
                    continue
                rows = inner_table.find_all("tr")
                for row in rows:
                    cols = row.find_all("td")
                    if len(cols) >= 2:
                        nutrient_name = cols[0].get_text(strip=True).replace(":", "")
                        value_span = cols[1].find("span", class_="cbo_nn_SecondaryNutrient")
                        if value_span:
                            nutrient_value = value_span.get_text(strip=True)
                            nutrients[nutrient_name] = nutrient_value

            # Also extract secondary table nutrients (Vitamin A, Calcium, etc.)
            secondary_table = soup.find("table", class_="cbo_nn_LabelSecondaryTable")
            if secondary_table:
                for row in secondary_table.find_all("tr"):
                    cols = row.find_all("td")
                    if len(cols) == 2:
                        nutrient_name = cols[0].get_text(strip=True)
                        nutrient_value = cols[1].get_text(strip=True)
                        if nutrient_name and nutrient_value:
                            nutrients[nutrient_name] = nutrient_value

            # Additional nutrients (Vitamin D etc.)
            additional_nutrients = soup.find("div", class_="cbo_nn_AdditonalNutrientLabel")
            if additional_nutrients:
                for row in additional_nutrients.find_all("tr"):
                    cols = row.find_all("td")
                    if len(cols) == 2:
                        nutrient_name = cols[0].get_text(strip=True)
                        nutrient_value = cols[1].get_text(strip=True)
                        if nutrient_name:
                            nutrients[nutrient_name] = nutrient_value

            # Extract allergens
            allergens_span = soup.find("span", class_="cbo_nn_LabelAllergens")
            allergens = allergens_span.get_text(strip=True).replace("\xa0", " ") if allergens_span else "None"
            
            # Create and return NutritionInfo object
            return NutritionInfo(
                item_oid=item_oid,
                item_name=item_name,
                serving_size=serving_size,
                calories=calories,
                nutrients=nutrients,
                allergens=allergens
            )
            
        except Exception as e:
            logger.error(f"Error parsing nutrition data for item {item_oid}: {e}")
            return None
