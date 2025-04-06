import { useState } from "react";
import { MenuItem as MenuItemType } from "@/lib/api";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useAuth } from "@/contexts/AuthContext";

interface MenuItemProps {
  item: MenuItemType;
  onSelect?: (item: MenuItemType) => void;
  compact?: boolean;
}

// Helper function to extract nutrient value
const extractNutrient = (
  nutrients: any,
  key: string,
  fallback: string = "0g"
): string => {
  if (!nutrients) return fallback;

  // Try direct key first
  if (nutrients[key]) return nutrients[key];

  // Try looking for exact key matches with any casing
  const lcKey = key.toLowerCase();
  for (const nKey in nutrients) {
    // For keys like "Total Fat", "Protein", etc.
    if (nKey.toLowerCase() === lcKey || nKey.toLowerCase().includes(lcKey)) {
      return nutrients[nKey];
    }
  }

  // Special handling for calorie values which might be prefixed with "Calories"
  if (lcKey === "calories") {
    for (const nKey in nutrients) {
      if (nKey.toLowerCase().startsWith("calories")) {
        return nutrients[nKey];
      }
    }
  }

  return fallback;
};

export function MenuItem({ item, onSelect, compact = false }: MenuItemProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { addToCart, isInCart } = useMealPlan();
  const { user } = useAuth();

  // For debugging - check if nutrients exist
  console.log("MenuItem nutrients for:", item.name, item.nutrients);

  // Get raw item to check if _nutrients exists but isn't parsed
  const rawItem = item as any;
  if (
    (!item.nutrients || Object.keys(item.nutrients).length === 0) &&
    rawItem._nutrients
  ) {
    try {
      item.nutrients =
        typeof rawItem._nutrients === "string"
          ? JSON.parse(rawItem._nutrients)
          : rawItem._nutrients;
      console.log("Parsed raw nutrients:", item.nutrients);
    } catch (e) {
      console.error("Failed to parse raw nutrients", e);
    }
  }

  // Log nutrients format for debugging
  if (item.nutrients) {
    console.log(
      "Nutrient keys for",
      item.name,
      ":",
      Object.keys(item.nutrients)
    );
  }

  // Extract key nutrients
  const protein = extractNutrient(item.nutrients, "Protein");
  const carbs = extractNutrient(item.nutrients, "Carbohydrate", "0g");
  const fat = extractNutrient(item.nutrients, "Fat", "0g");

  const handleClick = () => {
    setShowDetails(!showDetails);
    if (onSelect) onSelect(item);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the handleClick
    addToCart(item);
  };

  if (compact) {
    // Compact view for category grouping
    return (
      <div
        className="p-2 border rounded-md shadow-sm hover:shadow-md transition-shadow bg-white mb-2 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">{item.name}</h3>
          <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
            {item.calories} cal
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleClick}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.category}</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-blue-600">
              {item.calories}
            </span>
            <p className="text-xs text-gray-500">calories</p>
          </div>
        </div>

        <div className="mt-3 flex justify-between text-sm">
          <div className="text-center px-2">
            <p className="font-semibold">{protein}</p>
            <p className="text-xs text-gray-500">Protein</p>
          </div>
          <div className="text-center px-2 border-x border-gray-200">
            <p className="font-semibold">{carbs}</p>
            <p className="text-xs text-gray-500">Carbs</p>
          </div>
          <div className="text-center px-2">
            <p className="font-semibold">{fat}</p>
            <p className="text-xs text-gray-500">Fat</p>
          </div>
        </div>

        {user && (
          <div className="mt-3 text-right">
            <button
              onClick={handleAddToCart}
              disabled={isInCart(item.id)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${isInCart(item.id) ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
            >
              {isInCart(item.id) ? "✓ Added to Plan" : "Add to Meal Plan"}
            </button>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="p-4 bg-gray-50 border-t">
          <h4 className="font-medium mb-2">Nutrition Facts</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(item.nutrients || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize">{key}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>

          {item.allergens && item.allergens.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-amber-600">
                Allergens: {item.allergens.join(", ")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
