'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MealPlan, mealPlanApi } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';

function MealPlanDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMealPlan = async () => {
      setLoading(true);
      try {
        const mealPlanId = Number(params.id);
        if (isNaN(mealPlanId)) {
          throw new Error('Invalid meal plan ID');
        }
        
        const data = await mealPlanApi.getMealPlanById(mealPlanId);
        setMealPlan(data);
      } catch (err: any) {
        console.error('Error fetching meal plan:', err);
        setError(err?.message || 'Failed to load meal plan details');
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlan();
  }, [params.id]);

  // Group menu items by meal type
  const groupedItems = mealPlan?.menu_items.reduce((groups, item) => {
    const mealType = item.meal_type || 'Other';
    if (!groups[mealType]) {
      groups[mealType] = [];
    }
    groups[mealType].push(item);
    return groups;
  }, {} as Record<string, typeof mealPlan.menu_items>) || {};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meal plan details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link 
            href="/mealplans"
            className="inline-block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Back to Meal Plans
          </Link>
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Meal Plan Not Found</h2>
          <p className="text-gray-700 mb-6">The meal plan you're looking for could not be found.</p>
          <Link 
            href="/mealplans"
            className="inline-block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Back to Meal Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{mealPlan.name}</h1>
            <Link 
              href="/mealplans"
              className="mt-2 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Back to Meal Plans
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Meal Plan Overview */}
          <div className="px-4 py-5 sm:p-6">
            {mealPlan.description && (
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900">Description</h2>
                <p className="mt-2 text-gray-600">{mealPlan.description}</p>
              </div>
            )}

            {/* Nutritional Summary */}
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Nutritional Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Total Calories</p>
                  <p className="text-2xl font-bold text-gray-900">{mealPlan.total_calories}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Protein</p>
                  <p className="text-2xl font-bold text-gray-900">{mealPlan.total_protein}g</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Carbs</p>
                  <p className="text-2xl font-bold text-gray-900">{mealPlan.total_carbs}g</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fat</p>
                  <p className="text-2xl font-bold text-gray-900">{mealPlan.total_fat}g</p>
                </div>
              </div>
            </div>

            {/* Menu Items by Meal Type */}
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Menu Items</h2>
            {Object.keys(groupedItems).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(groupedItems).map(([mealType, items]) => (
                  <div key={mealType} className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <h3 className="font-medium text-gray-800 capitalize">{mealType.toLowerCase().replace('_', ' ')}</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {items.map(item => (
                        <li key={item.id} className="p-4 hover:bg-gray-50">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                            <div className="mb-2 md:mb-0">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <div className="text-sm text-gray-500 space-y-1">
                                <div>
                                  <span className="capitalize">{item.category?.toLowerCase()}</span>
                                  {item.serving_size && (
                                    <span className="ml-2 text-gray-400">({item.serving_size})</span>
                                  )}
                                </div>
                                <div className="font-medium text-blue-600">
                                  {item.servings} {item.servings === 1 ? 'serving' : 'servings'}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                {item.calories} cal
                              </span>
                              {item.nutrients?.protein && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                                  {parseFloat(item.nutrients.protein).toFixed(1)}g protein
                                </span>
                              )}
                              {item.nutrients?.carbohydrates && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                                  {parseFloat(item.nutrients.carbohydrates).toFixed(1)}g carbs
                                </span>
                              )}
                              {item.nutrients?.fat && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
                                  {parseFloat(item.nutrients.fat).toFixed(1)}g fat
                                </span>
                              )}
                            </div>
                          </div>
                          {item.allergens && item.allergens.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">
                                <span className="font-medium">Allergens:</span> {item.allergens.join(', ')}
                              </p>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 py-4">No menu items in this meal plan.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MealPlanDetailsPage() {
  return (
    <ProtectedRoute>
      <MealPlanDetailsContent />
    </ProtectedRoute>
  );
}
