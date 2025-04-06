'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, authApi, Gender, MainGoal, ActivityLevel, WorkoutType, MealPlanType, CookingAvailability } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
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
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi
        .getCurrentUser()
        .then((user) => {
          setUser(user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    await authApi.login(username, password);
    const user = await authApi.getCurrentUser();
    setUser(user);
    router.push('/menu');
  };

  const register = async (data: {
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
    await authApi.register(data);
    await login(data.username, data.password);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
