# Flanner Backend - KU Food Planner API & Scraper

This is the backend component for the Flanner AI-assisted food planner application for University of Kansas students. It provides a RESTful API and automated menu scraping functionality to power the mobile application.

## Architecture

The backend follows a layered architecture with the following components:

- **FastAPI Application**: The core server that handles HTTP requests and exposes REST endpoints
- **Automated Scraper**: Collects and processes dining data on a schedule
- **Database Layer**: Stores menu items, user data, and meal plans
- **Service Layer**: Contains business logic including AI meal planning
- **Model Layer**: Defines data structures and validation rules

## Directory Structure

```
backend/
├── api/                  # API endpoints and route definitions
│   ├── dependencies.py   # Shared dependencies like auth
│   └── endpoints/        # Endpoint modules (users, items, mealplans)
├── config/               # Configuration settings
├── database/             # Database connection and ORM models
├── models/               # Pydantic models for validation
├── scraper/              # Menu scraping components
│   ├── session_manager.py
│   ├── menu_scraper.py
│   ├── item_scraper.py
│   └── nutrition_scraper.py
├── services/             # Business logic services
│   ├── ai_service.py     # AI meal plan generation
│   └── nutrition.py      # Nutrition calculations
├── utils/                # Utility functions
├── logs/                 # Application logs
├── output/               # Scraped menu data
├── main.py               # Application entry point
└── requirements.txt      # Dependencies
```

## Key Features

- **Automated Menu Scraping**: Scrapes dining hall menus and nutrition information on a regular schedule
- **User Management**: Registration, authentication, and profile management
- **Meal Planning**: AI-assisted meal plan generation based on user preferences
- **Nutrition Analysis**: Tracking and analyzing nutritional content of meals
- **REST API**: Complete API for mobile app integration

## Technologies

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **Pydantic**: Data validation and settings management
- **BeautifulSoup4**: Web scraping library
- **JWT**: Token-based authentication
- **OpenAI**: AI integration for meal recommendations

## Setup and Installation

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
pip install -r requirements.txt
```

### Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```
DATABASE_URL=sqlite:///./flanner.db
SECRET_KEY=your_secret_key_here
OPENAI_API_KEY=your_openai_api_key
```

## Running the Application

To start the server, run:

```bash
python -m backend.main
```

This will:
- Start the FastAPI server on `http://0.0.0.0:8000`
- Initialize the database (creating tables if they don't exist)
- Start the background scraper to fetch menu data

## API Documentation

Once the server is running, you can access the interactive API documentation at:

```
http://localhost:8000/docs
```

### Key Endpoints

- `/users/*`: User registration, authentication, and profile management
- `/items/*`: Access to menu items and nutrition information
- `/mealplans/*`: Creating, retrieving, and managing meal plans

## Scraper Functionality

The scraper automatically runs when the application starts and then every 24 hours. It scrapes:

- Available menu dates
- Meals for each date (breakfast, lunch, dinner)
- Menu items for each meal
- Detailed nutrition information for each item

Scraped data is stored both as JSON files in the `output/` directory and in the database for quick access by the API.

## Database Schema

The application uses SQLAlchemy ORM with the following main models:

- **User**: User accounts and preferences
- **MenuItem**: Menu items with nutrition data
- **MealPlan**: User-created meal plans
- **DiningHall**: Information about dining locations
- **Allergy**: Common food allergens
- **DietType**: Dietary preference types

## Troubleshooting

If you encounter any issues:

1. Check the log files in the `logs/` directory
2. Verify that the database connection is working
3. Ensure the scraper has proper network access to the dining service
