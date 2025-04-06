BASE_URL = "http://netnutrition.union.ku.edu/NetNutrition/7"

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
}

# Available meal types
MEAL_TYPES = [
    "BREAKFAST",
    "LIGHT BREAKFAST",
    "LUNCH",
    "LIGHT LUNCH",
    "DINNER",
    "DAILY OFFERINGS"
]

# Default unit OID (dining hall)
DEFAULT_UNIT_OID = "1"

# API endpoints
ENDPOINTS = {
    "select_unit": "/Unit/SelectUnitFromTree",
    "select_menu": "/Menu/SelectMenu",
    "nutrition_label": "/NutritionDetail/ShowItemNutritionLabel"
}

# Log settings
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Output settings
OUTPUT_DIR = "output"