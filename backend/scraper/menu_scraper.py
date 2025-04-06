import logging
from typing import List, Optional
from bs4 import BeautifulSoup
from datetime import datetime

from backend.scraper.session_manager import SessionManager
from backend.models.menu import MenuDate, Menu
from backend.config.config import ENDPOINTS, DEFAULT_UNIT_OID

logger = logging.getLogger(__name__)

class MenuScraper:
    """Scrapes available menu dates and meal types."""
    
    def __init__(self, session_manager: Optional[SessionManager] = None):
        """Initialize the menu scraper with a session manager."""
        self.session_manager = session_manager or SessionManager()
    
    def get_menu_dates(self) -> List[MenuDate]:
        """Get available menu dates."""
        unit_data = self.session_manager.post(
            ENDPOINTS["select_unit"],
            {"unitOid": DEFAULT_UNIT_OID}
        )
        
        if not unit_data:
            logger.error("Failed to get unit data")
            return []
        
        try:
            menu_list_html = next(panel["html"] for panel in unit_data["panels"] if panel["id"] == "menuPanel")
            soup = BeautifulSoup(menu_list_html, "html.parser")
            
            menu_dates = []
            for header in soup.select("header.card-title.h4"):
                date_str = header.get_text(strip=True)
                try:
                    date_obj = datetime.strptime(date_str, "%A, %B %d, %Y")
                    menu_dates.append(MenuDate(raw_text=date_str, date=date_obj))
                except ValueError as e:
                    logger.warning(f"Failed to parse date '{date_str}': {e}")
            
            logger.info(f"Found {len(menu_dates)} menu dates")
            return menu_dates
        except (StopIteration, AttributeError) as e:
            logger.error(f"Error getting menu dates: {e}")
            return []
    
    def get_available_meals(self, date_str: str) -> List[Menu]:
        """Get all available meal types for a specific date."""
        unit_data = self.session_manager.post(
            ENDPOINTS["select_unit"],
            {"unitOid": DEFAULT_UNIT_OID}
        )
        
        if not unit_data:
            logger.error("Failed to get unit data")
            return []
        
        try:
            menu_list_html = next(panel["html"] for panel in unit_data["panels"] if panel["id"] == "menuPanel")
            soup = BeautifulSoup(menu_list_html, "html.parser")
            
            menus = []
            for block in soup.select("div.card-block"):
                header = block.find("header")
                if header and header.get_text(strip=True) == date_str:
                    # Find all meal links in this row
                    for meal_link in block.find_all("a", class_="cbo_nn_menuLink"):
                        meal_type = meal_link.get_text(strip=True)
                        if "onclick" in meal_link.attrs:
                            onclick = meal_link["onclick"]
                            menu_oid = onclick.split("menuListSelectMenu(")[1].split(")")[0]
                            
                            menus.append(Menu(
                                date=date_str,
                                meal_type=meal_type,
                                menu_oid=menu_oid
                            ))
            
            logger.info(f"Found {len(menus)} available meals for {date_str}")
            return menus
        except (StopIteration, AttributeError) as e:
            logger.error(f"Error finding meals for {date_str}: {e}")
            return []