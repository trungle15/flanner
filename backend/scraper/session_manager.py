import requests
import logging
from typing import Dict, Optional, Any
import json
from backend.config.config import BASE_URL, ENDPOINTS, DEFAULT_HEADERS


logger = logging.getLogger(__name__)

class SessionManager:
    """Manages HTTP sessions and requests to the Grinnell nutrition website."""
    def __init__(self):
        self.session = requests.Session()
        self.headers = DEFAULT_HEADERS.copy()
        self.headers["Referer"] = BASE_URL
        self.headers["Origin"] = BASE_URL
        self.headers["X-Requested-With"] = "XMLHttpRequest"
        self.initialized = False
        
    def initialize(self) -> bool:
        """Initialize the session by loading the homepage."""
        if self.initialized:
            return True
        
        try:
            response = self.session.get(BASE_URL, headers=self.headers)
            response.raise_for_status()
            self.initialized = True
            logger.info("Session initialized successfully.")
            return True
        except requests.RequestException as e:
            logger.error(f"Failed to initialize session: {e}")
            return False
    
    def post(self, endpoint: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Send a POST request to the specified endpoint."""
        if not self.initialized and not self.initialize():
            return None
        
        url = f"{BASE_URL}{endpoint}"
        
        try:
            response = self.session.post(url, data=data, headers=self.headers)
            response.raise_for_status()
            
            # Special handling for nutrition label endpoint which returns HTML
            if endpoint == ENDPOINTS["nutrition_label"]:
                return {"nutritionLabel": response.text}
            
            # All other endpoints return JSON
            return response.json()
        except requests.RequestException as e:
            logger.error(f"POST request failed to {endpoint}: {e}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response from {endpoint}: {e}")
            return None
    
    def get_html(self, endpoint: str) -> Optional[str]:
        """Make a GET request to the specified endpoint and return the HTML response."""
        if not self.initialized and not self.initialize():
            return None
        
        url = f"{BASE_URL}{endpoint}"
        
        try:
            response = self.session.get(url, headers=self.headers)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            logger.error(f"GET request failed to {endpoint}: {e}")
            return None