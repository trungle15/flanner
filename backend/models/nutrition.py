from dataclasses import dataclass
from typing import Dict

@dataclass
class NutritionInfo:
    """Represents nutrition information for a menu item."""
    item_oid: str
    item_name: str
    serving_size: str
    calories: int
    nutrients: Dict[str, str]
    allergens: str