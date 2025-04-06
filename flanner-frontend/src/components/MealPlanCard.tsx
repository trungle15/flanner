import { MealPlan } from '@/lib/api';
import { MenuItem } from './MenuItem';

interface MealPlanCardProps {
  mealPlan: MealPlan;
}

export function MealPlanCard({ mealPlan }: MealPlanCardProps) {
  return (
    <div className="p-6 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold">{mealPlan.name}</h2>
      {mealPlan.description && (
        <p className="mt-2 text-gray-600">{mealPlan.description}</p>
      )}
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Calories:</span> {mealPlan.total_calories}
        </div>
        <div>
          <span className="font-medium">Protein:</span> {mealPlan.total_protein}g
        </div>
        <div>
          <span className="font-medium">Carbs:</span> {mealPlan.total_carbs}g
        </div>
        <div>
          <span className="font-medium">Fat:</span> {mealPlan.total_fat}g
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Menu Items</h3>
        <div className="space-y-3">
          {mealPlan.menu_items.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
