import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

// Import tab screens
import GoalsTabScreen from '../screens/GoalsTabScreen';
import MealPlanScreen from '../screens/MealPlanScreen';

// Define the tab navigation parameter list
export type TabParamList = {
  Goals: undefined;
  MealPlan: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Goals') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'MealPlan') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else {
            iconName = 'help-circle';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceVariant,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.textInverse,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >

      <Tab.Screen 
        name="Goals" 
        component={GoalsTabScreen} 
        options={{ 
          title: 'Fitness Goals',
        }} 
      />
      <Tab.Screen 
        name="MealPlan" 
        component={MealPlanScreen} 
        options={{ 
          title: 'Meal Plan',
        }} 
      />
    </Tab.Navigator>
  );
};
