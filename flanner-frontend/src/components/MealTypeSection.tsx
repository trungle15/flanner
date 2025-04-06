import { MenuItem as MenuItemType } from '@/lib/api';
import { MenuItem } from './MenuItem';

// Helper function to extract nutrient values - keeping consistent with MenuItem component
const extractNutrient = (nutrients: Record<string, string> | undefined, key: string, fallback: string = '0g'): string => {
  if (!nutrients) return fallback;
  
  // Handle different possible key formats
  const possibleKeys = [
    key,
    key.toLowerCase(),
    key.toUpperCase(),
    // Common variations
    ...Object.keys(nutrients).filter(k => 
      k.toLowerCase().includes(key.toLowerCase())
    )
  ];
  
  // Find the first matching key
  for (const possibleKey of possibleKeys) {
    if (nutrients[possibleKey]) {
      return nutrients[possibleKey];
    }
  }
  
  return fallback;
};

interface CategoryGroupProps {
  title: string;
  items: MenuItemType[];
  onSelectItem?: (item: MenuItemType) => void;
}

function CategoryGroup({ title, items, onSelectItem }: CategoryGroupProps) {
  if (items.length === 0) return null;
  
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-500 mb-2">{title}</h4>
      <div className="space-y-2">
        {items.map((item) => (
          <MenuItem 
            key={item.id} 
            item={item} 
            onSelect={onSelectItem} 
            compact={true} 
          />
        ))}
      </div>
    </div>
  );
}

interface MealTypeSectionProps {
  title: string;
  items: MenuItemType[];
  onSelectItem?: (item: MenuItemType) => void;
}

export function MealTypeSection({ title, items, onSelectItem }: MealTypeSectionProps) {
  if (items.length === 0) return null;
  
  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItemType[]>);
  
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
          <CategoryGroup 
            key={category} 
            title={category} 
            items={categoryItems}
            onSelectItem={onSelectItem}
          />
        ))}
      </div>
    </div>
  );
}
