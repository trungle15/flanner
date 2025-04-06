# Flanner - AI Meal Planner for College Students


Flanner is an AI-powered meal planning application specifically designed for college students on meal plans. It transforms campus dining from a source of nutritional uncertainty into an opportunity for personalized, health-conscious eating.

## Inspiration

College students face unique nutritional challenges while navigating campus dining options. Many students want to make healthier eating choices but struggle with limited meal plan options, nutritional awareness, and time constraints. As students ourselves, we recognized this gap and created Flanner to help students on meal plans make more conscious, personalized eating decisions without requiring extensive nutritional knowledge or time investment.

The motivation behind Flanner stems from our own experiences trying to maintain healthy eating habits while on university meal plans. We found that despite having access to dining halls, many students struggle to create balanced meals that align with their dietary needs and fitness goals. This challenge is particularly acute for students with specific dietary restrictions, allergies, or fitness objectives.

## What it does

Flanner offers a comprehensive solution for campus dining:

- **Personalized Meal Planning**: Creates custom meal plans based on individual preferences, dietary restrictions, fitness goals, and available campus dining options
- **AI-Generated Recommendations**: Leverages Google Gemini AI to suggest optimal meal combinations from available dining hall options
- **Nutrition Tracking**: Provides detailed nutritional information for all menu items and complete meal plans
- **Dining Hall Integration**: Automatically scrapes and integrates real-time menu data from campus dining facilities
- **User Profile Management**: Stores user preferences including allergies, dietary restrictions, and fitness goals

## How we built it

Flanner is built with a modern tech stack that combines robust backend services with a responsive frontend:

### Frontend
- **Next.js**: React framework for building the user interface with server-side rendering
- **TypeScript**: Type-safe code
- **Tailwind CSS**: Responsive, customizable styling
- **Axios**: For API communication with the backend

### Backend
- **FastAPI**: Python framework for building the API with automatic documentation
- **SQLAlchemy**: ORM for database interactions
- **BeautifulSoup4**: For web scraping dining hall menu data
- **Google Gemini API**: For AI-powered meal plan generation
- **JWT Authentication**: For secure user authentication

## Challenges we ran into

We faced a few technical challenges going into this project. First off, University dining systems lack public APIs, therefore we built our own custom web scrapers to handle inconsistent HTML structures and frequent DOM changes. Since this is our first hackathon ever, and our first full scale web application, we had very fun time exploring the frontend and backend and how to integrate them together. Using Gemini API is also a challenge since we need to make sure to parse them correctly to our app. Overall, there are still bugs to squash but we are happy to have tackled them.

## What's next for Flanner

- **Multi-Campus Support**: Since many universities and colleges rely on NetNutrition, we can maintain our scrapers to work with these websites
- **Comprehensive Analytics**: More detailed tracking of macros and health statistics
- **Social Features**: Plan sharing and collaborative planning with friends
- **Mobile Apps**: Native mobile applications for iOS and Android

## Repository Structure

- `/backend` - FastAPI backend with scraper and AI integration
- `/flanner-frontend` - Next.js frontend application

## Getting Started

See the README files in the `/backend` and `/flanner-frontend` directories for setup instructions.
