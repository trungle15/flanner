import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme/theme';

// Import screens
import ProfileInfoScreen from '../screens/ProfileInfoScreen';
import FitnessGoalsScreen from '../screens/FitnessGoalsScreen';
import DietaryPreferencesScreen from '../screens/DietaryPreferencesScreen';
import MealPlanScreen from '../screens/MealPlanScreen';
import SummaryScreen from '../screens/SummaryScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LandingScreen from '../screens/SimpleLandingScreen';

// Import Tab Navigation
import { TabNavigation } from './TabNavigation';

// Define the navigation stack parameter list
export type RootStackParamList = {
  Welcome: undefined;
  ProfileInfo: undefined;
  FitnessGoals: undefined;
  DietaryPreferences: undefined;
  MealPlan: undefined;
  Summary: undefined;
  Landing: undefined;
  MainTabs: undefined;
  Settings: undefined;
  Help: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.secondary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen} 
          options={{ title: 'Welcome' }} 
        />
        <Stack.Screen 
          name="ProfileInfo" 
          component={ProfileInfoScreen} 
          options={{ title: 'Profile Information' }} 
        />
        <Stack.Screen 
          name="FitnessGoals" 
          component={FitnessGoalsScreen} 
          options={{ title: 'Fitness Goals' }} 
        />
        <Stack.Screen 
          name="DietaryPreferences" 
          component={DietaryPreferencesScreen} 
          options={{ title: 'Dietary Preferences' }} 
        />
        <Stack.Screen 
          name="MealPlan" 
          component={MealPlanScreen} 
          options={{ title: 'Meal Plan Details' }} 
        />
        <Stack.Screen 
          name="Summary" 
          component={SummaryScreen} 
          options={{ title: 'Summary' }} 
        />
        <Stack.Screen 
          name="Landing" 
          component={LandingScreen} 
          options={{ 
            title: 'Dashboard',
            headerLeft: () => null, // Remove back button
          }} 
        />
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigation} 
          options={{ 
            headerShown: false,
            headerLeft: () => null, // Remove back button
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
