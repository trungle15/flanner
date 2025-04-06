import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define types for our user data
export type UserData = {
  // Profile Information
  name: string;
  age: string;
  gender: string;
  heightFeet: string;
  heightInches: string;
  heightCm: string;
  currentWeight: string;
  currentWeightUnit: 'lbs' | 'kg';
  goalWeight: string;
  goalWeightUnit: 'lbs' | 'kg';
  
  // Fitness Goals
  mainGoal: string;
  activityLevel: string;
  workoutFrequency: string;
  workoutTypes: string[];
  
  // Dietary Preferences
  dietTypes: string[];
  allergies: string[];
  customAllergies: string[];
  preferredCuisine: string[];
  
  // Meal Plan Details
  mealPlanType: string;
  diningHallPreferences: string[];
  cookingAvailability: string;
};

// Initial state with empty values
const initialUserData: UserData = {
  name: '',
  age: '',
  gender: '',
  heightFeet: '',
  heightInches: '',
  heightCm: '',
  currentWeight: '',
  currentWeightUnit: 'lbs',
  goalWeight: '',
  goalWeightUnit: 'lbs',
  
  mainGoal: '',
  activityLevel: '',
  workoutFrequency: '',
  workoutTypes: [],
  
  dietTypes: [],
  allergies: [],
  customAllergies: [],
  preferredCuisine: [],
  
  mealPlanType: '',
  diningHallPreferences: [],
  cookingAvailability: '',
};

// Create the context
type UserDataContextType = {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

// Provider component
export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData>(initialUserData);

  const updateUserData = (data: Partial<UserData>) => {
    setUserData(prevData => ({
      ...prevData,
      ...data,
    }));
  };

  return (
    <UserDataContext.Provider value={{ userData, updateUserData }}>
      {children}
    </UserDataContext.Provider>
  );
};

// Custom hook to use the context
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
