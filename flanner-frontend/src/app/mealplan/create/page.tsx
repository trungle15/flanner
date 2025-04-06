'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MenuItem, mealPlanApi, menuApi } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';

function CreateMealPlanContent() {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MenuItem[]>([]);
  interface SelectedItem extends Omit<MenuItem, 'nutrients' | 'allergens'> {
    servings: number;
    serving_size?: string;
    nutrients: Record<string, string>;
    allergens: string[];
  }
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Calculate nutritional totals
  const calculateTotals = () => {
    return {
      calories: selectedItems.reduce((total, item) => total + (item.calories || 0) * item.servings, 0),
      protein: selectedItems.reduce((total, item) => {
        const proteinValue = item.nutrients?.protein ? parseFloat(item.nutrients.protein) * item.servings : 0;
        return total + proteinValue;
      }, 0).toFixed(1),
      carbs: selectedItems.reduce((total, item) => {
        const carbsValue = item.nutrients?.carbohydrates ? parseFloat(item.nutrients.carbohydrates) * item.servings : 0;
        return total + carbsValue;
      }, 0).toFixed(1),
      fat: selectedItems.reduce((total, item) => {
        const fatValue = item.nutrients?.fat ? parseFloat(item.nutrients.fat) * item.servings : 0;
        return total + fatValue;
      }, 0).toFixed(1),
    };
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      const results = await menuApi.searchMenuItems(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching menu items:', err);
      setError('Failed to search for menu items. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddItem = (item: MenuItem) => {
    if (!selectedItems.some(selected => selected.id === item.id)) {
      setSelectedItems([...selectedItems, { ...item, servings: 1 }]);
      // Clear search results after adding
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  const handleRemoveItem = (itemId: number) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a name for your meal plan');
      return;
    }

    if (selectedItems.length === 0) {
      setError('Please add at least one menu item to your meal plan');
      return;
    }

    setIsLoading(true);

    try {
      const totals = calculateTotals();
      
      const mealPlan = {
        name,
        description,
        menu_items: selectedItems.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          meal_type: item.meal_type,
          serving_size: item.serving_size,
          calories: item.calories,
          nutrients: item.nutrients,
          allergens: item.allergens,
          servings: item.servings,
        })),
      };

      const response = await mealPlanApi.createMealPlan(mealPlan);
      
      // Navigate to the newly created meal plan
      router.push(`/mealplan/${response.id}`);
    } catch (err: any) {
      console.error('Error creating meal plan:', err);
      setError(err?.response?.data?.detail || 'Failed to create meal plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Create Meal Plan</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 border-b border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Meal Plan Details</h2>
              
              <div className="space-y-4">
                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter meal plan name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    id="description"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your meal plan"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Add Menu Items</h2>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search menu items..."
                      className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white ${
                        isSearching || !searchQuery.trim() ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      }`}
                    >
                      {isSearching ? (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        'Search'
                      )}
                    </button>
                  </div>
                  
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-4 max-h-80 overflow-y-auto border border-gray-200 rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {searchResults.map(item => (
                          <li key={item.id} className="p-3 hover:bg-gray-50">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.calories} calories</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddItem(item)}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                Add
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Items */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Selected Items</h2>
              
              {selectedItems.length > 0 ? (
                <div>
                  <ul className="divide-y divide-gray-200 mb-6 max-h-80 overflow-y-auto border border-gray-200 rounded-md">
                    {selectedItems.map(item => (
                      <li key={item.id} className="p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{item.name}</h4>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <span>{(item.calories || 0) * item.servings} cal</span>
                              <span className="mx-2">•</span>
                              <span>{item.category}</span>
                            </div>
                            <div className="mt-2 flex items-center">
                              <label htmlFor={`servings-${item.id}`} className="text-sm text-gray-600 mr-2">
                                Servings:
                              </label>
                              <input
                                type="number"
                                id={`servings-${item.id}`}
                                min="0.5"
                                max="10"
                                step="0.5"
                                value={item.servings}
                                onChange={(e) => {
                                  const newServings = parseFloat(e.target.value);
                                  if (newServings >= 0.5 && newServings <= 10) {
                                    setSelectedItems(items =>
                                      items.map(i =>
                                        i.id === item.id ? { ...i, servings: newServings } : i
                                      )
                                    );
                                  }
                                }}
                                className="w-20 px-2 py-1 border rounded-md"
                              />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <div className="flex space-x-4 text-sm text-gray-500">
                              {item.nutrients?.protein && <span>{parseFloat(item.nutrients.protein).toFixed(1)}g protein</span>}
                              {item.nutrients?.carbohydrates && <span>{parseFloat(item.nutrients.carbohydrates).toFixed(1)}g carbs</span>}
                              {item.nutrients?.fat && <span>{parseFloat(item.nutrients.fat).toFixed(1)}g fat</span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Nutritional Summary */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">Nutritional Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Calories</p>
                        <p className="font-medium">{calculateTotals().calories}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Protein</p>
                        <p className="font-medium">{calculateTotals().protein}g</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Carbs</p>
                        <p className="font-medium">{calculateTotals().carbs}g</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fat</p>
                        <p className="font-medium">{calculateTotals().fat}g</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No items selected yet. Use the search above to add menu items.</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="p-6 flex items-center justify-between">
              <Link
                href="/mealplans"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading || selectedItems.length === 0 || !name.trim()}
                className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  isLoading || selectedItems.length === 0 || !name.trim() 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Meal Plan'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CreateMealPlanPage() {
  return (
    <ProtectedRoute>
      <CreateMealPlanContent />
    </ProtectedRoute>
  );
}
