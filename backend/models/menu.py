"""Data models for menus and dates."""

from dataclasses import dataclass
from datetime import datetime

@dataclass
class MenuDate:
    """Represents a menu date from the website."""
    raw_text: str
    date: datetime

@dataclass
class Menu:
    """Represents a specific menu (date and meal type)."""
    date: str
    meal_type: str
    menu_oid: str