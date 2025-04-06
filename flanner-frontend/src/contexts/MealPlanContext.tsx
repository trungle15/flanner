"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MenuItem } from "@/lib/api";

interface MealPlanContextType {
  cartItems: MenuItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  isInCart: (itemId: number) => boolean;
  cartCount: number;
  calculateTotals: () => {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export const useMealPlan = (): MealPlanContextType => {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error("useMealPlan must be used within a MealPlanProvider");
  }
  return context;
};

interface MealPlanProviderProps {
  children: ReactNode;
}

export const MealPlanProvider = ({ children }: MealPlanProviderProps) => {
  const [cartItems, setCartItems] = useState<MenuItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("mealPlanCart");
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
        setInitialized(true);
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
        setInitialized(true);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (initialized && typeof window !== "undefined") {
      try {
        localStorage.setItem("mealPlanCart", JSON.stringify(cartItems));
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
      }
    }
  }, [cartItems, initialized]);

  const addToCart = (item: MenuItem) => {
    setCartItems((prevItems) => {
      // Only add if not already in cart
      if (!prevItems.some((i) => i.id === item.id)) {
        return [...prevItems, item];
      }
      return prevItems;
    });
  };

  const removeFromCart = (itemId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (itemId: number) => {
    return cartItems.some((item) => item.id === itemId);
  };

  // Extract nutrient values (e.g., "10g" -> 10)
  const extractNutrientValue = (value: string | undefined): number => {
    if (!value) return 0;
    const match = /(\d+)g/.exec(value);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Calculate total nutrients
  const calculateTotals = () => {
    return cartItems.reduce(
      (acc, item) => {
        acc.calories += item.calories || 0;
        
        if (item.nutrients) {
          acc.protein += extractNutrientValue(item.nutrients["Protein"]);
          acc.carbs += extractNutrientValue(item.nutrients["Total Carbohydrate"]);
          acc.fat += extractNutrientValue(item.nutrients["Total Fat"]);
        }
        
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  return (
    <MealPlanContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        cartCount: cartItems.length,
        calculateTotals
      }}
    >
      {children}
    </MealPlanContext.Provider>
  );
};
