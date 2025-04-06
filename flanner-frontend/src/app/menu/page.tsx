"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MenuItem as MenuItemType, menuApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import Link from "next/link";
import { MenuItem } from "@/components/MenuItem";
import { MealTypeSection } from "@/components/MealTypeSection";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Helper function to extract nutrient values
const extractNutrient = (
  nutrients: Record<string, string> | undefined,
  key: string,
  fallback: string = "0g"
): string => {
  if (!nutrients) return fallback;

  // Handle different possible key formats
  const possibleKeys = [
    key,
    key.toLowerCase(),
    key.toUpperCase(),
    // Common variations
    ...Object.keys(nutrients).filter((k) =>
      k.toLowerCase().includes(key.toLowerCase())
    ),
  ];

  // Find the first matching key
  for (const possibleKey of possibleKeys) {
    if (nutrients[possibleKey]) {
      return nutrients[possibleKey];
    }
  }

  return fallback;
};

function MenuContent() {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const { user } = useAuth();
  const { addToCart, isInCart, cartCount } = useMealPlan();
  const router = useRouter();
  const [filters, setFilters] = useState({
    meal_type: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [addedItem, setAddedItem] = useState<MenuItemType["id"] | null>(null);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [mealTypesData, categoriesData] = await Promise.all([
          menuApi.getMealTypes(),
          menuApi.getCategories(),
        ]);
        setMealTypes(mealTypesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        if (searchQuery) {
          const items = await menuApi.searchMenuItems(searchQuery);
          setMenuItems(items);
        } else {
          const items = await menuApi.getMenuItems(filters);
          setMenuItems(items);
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, [filters, searchQuery]);

  // Group menu items by meal type
  const groupMenuItemsByMealType = () => {
    const groupedByMealType: Record<string, MenuItemType[]> = {};

    if (searchQuery) {
      // When searching, group items by date first, then by meal type
      const groupedByDate: Record<string, Record<string, MenuItemType[]>> = {};

      menuItems.forEach((item) => {
        const date = item.date ? new Date(item.date).toLocaleDateString() : 'Unknown Date';
        const mealType = item.meal_type || 'Other';

        if (!groupedByDate[date]) {
          groupedByDate[date] = {};
        }

        if (!groupedByDate[date][mealType]) {
          groupedByDate[date][mealType] = [];
        }

        groupedByDate[date][mealType].push(item);
      });

      // Convert nested structure to flat structure with clear labels
      Object.entries(groupedByDate).forEach(([date, mealTypeGroups]) => {
        Object.entries(mealTypeGroups).forEach(([mealType, items]) => {
          const groupName = `${date} - ${mealType}`;
          groupedByMealType[groupName] = items;
        });
      });

      return groupedByMealType;
    }

    // If not searching, group by meal type as before
    menuItems.forEach((item) => {
      const mealType = item.meal_type || 'Other';
      if (!groupedByMealType[mealType]) {
        groupedByMealType[mealType] = [];
      }
      groupedByMealType[mealType].push(item);
    });

    return groupedByMealType;
  };

  const handleSelectItem = (item: MenuItemType) => {
    setSelectedItem(item);
  };

  const handleAddToMealPlan = (item: MenuItemType) => {
    // Use the MealPlanContext to add item to the cart
    addToCart(item);
    setAddedItem(item.id);
    
    // Visual feedback - temporary message
    setTimeout(() => {
      setAddedItem(null);
    }, 1500);
  };

  const groupedMenuItems = groupMenuItemsByMealType();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Menu</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filters.date
              ? new Date(filters.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : "Today's Menu"}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="relative">
              <input
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters({ ...filters, date: e.target.value })
                }
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <select
              value={filters.meal_type}
              onChange={(e) =>
                setFilters({ ...filters, meal_type: e.target.value })
              }
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Meal Types</option>
              {mealTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  onClick={() => setSearchQuery("")}
                >
                  <span className="sr-only">Clear search</span>
                  <span className="text-sm">✕</span>
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading menu...</span>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-lg text-gray-600">
                No menu items found for the selected filters.
              </p>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setFilters({
                    meal_type: "",
                    category: "",
                    date: new Date().toISOString().split("T")[0],
                  });
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedMenuItems).map(([mealType, items]) => (
                <MealTypeSection
                  key={mealType}
                  title={mealType}
                  items={items}
                  onSelectItem={handleSelectItem}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail View for Selected Item */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold">{selectedItem.name}</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedItem(null)}
              >
                &times;
              </button>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    {selectedItem.meal_type}
                  </span>
                  <span className="text-gray-600">{selectedItem.category}</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 text-center">
                  {selectedItem.calories} calories
                </div>
              </div>

              <div className="flex justify-between mb-6 text-center border-y py-3">
                <div className="px-2">
                  <p className="font-semibold">
                    {extractNutrient(selectedItem.nutrients, "Protein")}
                  </p>
                  <p className="text-xs text-gray-500">Protein</p>
                </div>
                <div className="px-2 border-x">
                  <p className="font-semibold">
                    {extractNutrient(selectedItem.nutrients, "Total Carbohydrate")}
                  </p>
                  <p className="text-xs text-gray-500">Carbs</p>
                </div>
                <div className="px-2">
                  <p className="font-semibold">
                    {extractNutrient(selectedItem.nutrients, "Total Fat")}
                  </p>
                  <p className="text-xs text-gray-500">Fat</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium mb-2">Nutrition Facts</h3>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    {Object.entries(selectedItem.nutrients || {})
                      .map(([key, value]) => {
                        // Skip keys that include 'calories' since we display that separately
                        if (key.toLowerCase().includes("calories")) return null;
                        return (
                          <div key={key} className="flex justify-between pr-4">
                            <span className="capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <span className="font-medium">{value}</span>
                          </div>
                        );
                      })
                      .filter(Boolean)}
                  </div>
                </div>
              </div>

              {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                <div className="mt-4 pt-3 border-t">
                  <h3 className="font-medium mb-2">Allergens</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.allergens.map((allergen) => (
                      <span
                        key={allergen}
                        className="px-2 py-1 bg-amber-50 text-amber-800 rounded-full text-xs"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  onClick={() => {
                    // Here you would add the item to a meal plan
                    console.log("Add to meal plan:", selectedItem);
                    // Later you can implement actual meal plan addition here
                    setSelectedItem(null);
                    // Redirect to meal plan page
                    window.location.href = '/mealplan';
                  }}
                >
                  Add to Meal Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function MenuPage() {
  const { user } = useAuth();
  const { cartCount } = useMealPlan();

  return (
    <ProtectedRoute>
      <MenuContent />
      {user && cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link 
            href="/mealplan/create" 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg"
          >
            <span>View Meal Plan Cart ({cartCount})</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path></svg>
          </Link>
        </div>
      )}
    </ProtectedRoute>
  );
}
