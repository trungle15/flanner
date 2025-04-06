from dataclasses import dataclass
from typing import Optional

@dataclass
class MenuItem:
    """Represents a menu item from the website."""
    item_oid: str
    name: str
    category: str
    nutrition_info: Optional['NutritionInfo'] = None