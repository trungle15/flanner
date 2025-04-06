"""Module for scraping menu items from the KU nutrition website."""

import logging
import traceback
from typing import List, Optional
from bs4 import BeautifulSoup

from backend.scraper.session_manager import SessionManager
from backend.config.config import ENDPOINTS
from backend.models.item import MenuItem

logger = logging.getLogger(__name__)

class ItemScraper:
    """Scrapes menu items for a specific menu."""
    
    def __init__(self, session_manager: Optional[SessionManager] = None):
        """Initialize the item scraper with a session manager."""
        self.session_manager = session_manager or SessionManager()
    
    def get_items(self, menu_oid: str) -> List[MenuItem]:
        """Get all menu items for a specific menu."""
        menu_data = self.session_manager.post(
            ENDPOINTS["select_menu"],
            {"menuOid": menu_oid}
        )
        
        if not menu_data:
            logger.error(f"Failed to get menu data for menu {menu_oid}")
            return []
        
        try:
            item_grid_html = next(panel["html"] for panel in menu_data["panels"] if panel["id"] == "itemPanel")
            soup = BeautifulSoup(item_grid_html, "html.parser")
            
            items = []
            current_category = "Unknown"
            item_table = soup.find("table", class_="table")
            
            # Use table directly if tbody might be missing; find_all handles this
            for tr in item_table.find_all("tr", recursive=False):
                if "cbo_nn_itemGroupRow" in tr.get("class", []):
                    category_td = tr.find("td")
                    if category_td:
                        category_div = category_td.find("div")
                        if category_div:
                            current_category = category_div.get_text(strip=True)
                else:
                    # Item row
                    item_a = tr.find("a", class_="cbo_nn_itemHover")
                    if item_a:
                        try:
                            # Assumes '...getItemNutritionLabel(NUMBER)...' structure
                            item_id_attr = item_a.get("id", "")
                            oid = item_id_attr.split("_")[1] if "_" in item_id_attr else None
                            name = item_a.get_text(strip=True)
                            items.append(MenuItem(oid, name, current_category))
                        except (AttributeError, IndexError, TypeError):
                            # Log minimally if a specific item row fails
                            logger.warning(f"Skipping malformed item row in category '{current_category}'")

            # logger.info(f"Extracted {len(items)} items for menu {menu_oid}") # Optional logging
            return items
        except (StopIteration, AttributeError, Exception) as e:
            # Catch failure to find 'itemPanel', 'cbo_nn_itemGridTable', or other parsing errors
            logger.error(f"Failed to parse items structure for menu {menu_oid}: {e}")
            traceback.print_exc()
            return []