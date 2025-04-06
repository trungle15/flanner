import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle JSON parsing of nutrients
api.interceptors.response.use((response) => {
  // Only process array responses from menu items endpoints
  if (Array.isArray(response.data) && 
      (response.config.url?.includes('/items') || response.config.url?.includes('/mealplans'))) {
    
    response.data.forEach((item: any) => {
      // Process nutrients if it's a string
      if (item._nutrients && typeof item._nutrients === 'string') {
        try {
          item.nutrients = JSON.parse(item._nutrients);
        } catch (e) {
          console.error('Error parsing nutrients:', e);
          item.nutrients = {};
        }
      }
      // If nutrients is empty but _nutrients exists as a string, try to use that
      else if ((!item.nutrients || Object.keys(item.nutrients).length === 0) && 
               item._nutrients && typeof item._nutrients === 'string') {
        try {
          item.nutrients = JSON.parse(item._nutrients);
        } catch (e) {
          console.error('Error parsing _nutrients:', e);
          item.nutrients = {};
        }
      }
    });
  }
  return response;
});

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export enum MainGoal {
  LOSE_WEIGHT = 'lose_weight',
  GAIN_WEIGHT = 'gain_weight',
  MAINTAIN = 'maintain',
  IMPROVE_PERFORMANCE = 'improve_performance',
  GENERAL_WELLNESS = 'general_wellness'
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHTLY_ACTIVE = 'lightly_active',
  MODERATELY_ACTIVE = 'moderately_active',
  VERY_ACTIVE = 'very_active',
  ATHLETE = 'athlete'
}

export enum WorkoutType {
  CARDIO = 'cardio',
  STRENGTH = 'strength',
  SPORTS = 'sports',
  MIXED = 'mixed'
}

export enum MealPlanType {
  UNLIMITED = 'unlimited',
  FIXED_SWIPES = 'fixed_swipes',
  POINTS_ONLY = 'points_only',
  COMBINATION = 'combination'
}

export enum CookingAvailability {
  NONE = 'none',
  MICROWAVE = 'microwave',
  LIMITED = 'limited',
  FULL = 'full'
}

export interface Allergy {
  id: number;
  name: string;
  description?: string;
}

export interface DietType {
  id: number;
  name: string;
  description?: string;
}

export interface DiningHall {
  id: number;
  name: string;
  location?: string;
  unit_oid: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  age: number;
  gender: Gender;
  height: number;
  current_weight: number;
  goal_weight?: number;
  main_goal: MainGoal;
  activity_level: ActivityLevel;
  workout_frequency: number;
  workout_type?: WorkoutType;
  campus_name: string;
  meal_plan_type: MealPlanType;
  cooking_availability: CookingAvailability;
  preferred_cuisine?: string;
  allergies: Allergy[];
  diet_types: DietType[];
  dining_halls: DiningHall[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const userApi = {
  getAllergies: async () => {
    const { data } = await api.get<Allergy[]>('/users/allergies');
    return data;
  },

  getDietTypes: async () => {
    const { data } = await api.get<DietType[]>('/users/diet-types');
    return data;
  },

  getDiningHalls: async () => {
    const { data } = await api.get<DiningHall[]>('/users/dining-halls');
    return data;
  },

  updateProfile: async (userData: Partial<User>) => {
    const { data } = await api.put<User>('/users/me', userData);
    return data;
  },
};

export const authApi = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    name?: string;
    age: number;
    gender: Gender;
    height: number;
    current_weight: number;
    goal_weight?: number;
    main_goal: MainGoal;
    activity_level: ActivityLevel;
    workout_frequency: number;
    workout_type?: WorkoutType;
    campus_name: string;
    meal_plan_type: MealPlanType;
    cooking_availability: CookingAvailability;
    preferred_cuisine?: string;
    allergies?: number[];
    diet_types?: number[];
    dining_halls?: number[];
  }) => {
    const response = await api.post<User>('/users/register', data);
    return response.data;
  },

  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post<LoginResponse>('/users/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },
};

export interface MenuItem {
  id: number;
  name: string;
  dining_hall_id: number;
  date: string;
  meal_type: string;
  category: string;
  calories: number;
  nutrients: Record<string, string>;
  allergens: string[];
}

export interface MealPlanItem {
  id: number;
  name: string;
  category: string;
  meal_type: string;
  serving_size?: string;
  calories?: number;
  nutrients?: Record<string, any>;
  allergens?: string[];
}

export interface MealPlanMenuItemWithServings extends Omit<MealPlanItem, 'id'> {
  id: number;
  servings: number;
}

export interface CreateMealPlanRequest {
  name: string;
  description: string;
  menu_items: MealPlanMenuItemWithServings[];
}

export interface MealPlan {
  id: number;
  user_id: number;
  date: string;
  name?: string;
  description?: string;
  menu_items: MealPlanMenuItemWithServings[];
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  ai_prompt?: string;
  ai_response?: string;
}

export const menuApi = {
  getMenuItems: async (params?: {
    dining_hall_id?: number;
    date?: string;
    meal_type?: string;
    category?: string;
  }) => {
    const { data } = await api.get<MenuItem[]>('/items', { params });
    // Force parse nutrients if it's available in raw form
    return data.map(item => {
      if (item.nutrients && Object.keys(item.nutrients).length === 0) {
        // Try to access raw nutrients property from the backend
        const rawItem = item as any;
        if (rawItem._nutrients && typeof rawItem._nutrients === 'string') {
          try {
            item.nutrients = JSON.parse(rawItem._nutrients);
          } catch (e) {
            console.warn('Failed to parse nutrients:', e);
          }
        }
      }
      return item;
    });
  },

  getMealTypes: async () => {
    const { data } = await api.get<string[]>('/items/meal-types');
    return data;
  },

  getCategories: async () => {
    const { data } = await api.get<string[]>('/items/categories');
    return data;
  },

  searchMenuItems: async (query: string) => {
    const { data } = await api.get<MenuItem[]>(`/items/search?query=${query}`);
    // Force parse nutrients if it's available in raw form
    return data.map(item => {
      if (item.nutrients && Object.keys(item.nutrients).length === 0) {
        // Try to access raw nutrients property from the backend
        const rawItem = item as any;
        if (rawItem._nutrients && typeof rawItem._nutrients === 'string') {
          try {
            item.nutrients = JSON.parse(rawItem._nutrients);
          } catch (e) {
            console.warn('Failed to parse nutrients:', e);
          }
        }
      }
      return item;
    });
  },
};

export const mealPlanApi = {
  getMealPlans: async (params?: {
    start_date?: string;
    end_date?: string;
  }) => {
    const { data } = await api.get<MealPlan[]>('/mealplans', { params });
    return data;
  },

  getMealPlanById: async (id: number) => {
    const { data } = await api.get<MealPlan>(`/mealplans/${id}`);
    return data;
  },

  getWeeklyMealPlan: async (start_date?: string) => {
    const { data } = await api.get<MealPlan>('/mealplans/weekly', {
      params: { start_date },
    });
    return data;
  },

  createMealPlan: async (mealPlan: CreateMealPlanRequest) => {
    const { data } = await api.post<MealPlan>('/mealplans', mealPlan);
    return data;
  },

  generateMealPlan: async (request: {
    date?: string;
    meal_types?: string[];
    max_calories?: number;
    preferences?: string; // Updated type to string (comma-separated) to match backend expectations
    additional_instructions?: string;
  }) => {
    const { data } = await api.post<MealPlan>('/mealplans/generate', request);
    return data;
  },
};
