'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mealPlanApi, menuApi } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';

function GenerateMealPlanContent() {
  const router = useRouter();
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [date, setDate] = useState<string>('');
  const [maxCalories, setMaxCalories] = useState<string>('');
  const [preferences, setPreferences] = useState<string>('');
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch meal types on load
  useEffect(() => {
    const fetchMealTypes = async () => {
      try {
        const data = await menuApi.getMealTypes();
        setMealTypes(data);
      } catch (err) {
        console.error('Error fetching meal types:', err);
        setError('Failed to fetch meal types. Please try again later.');
      }
    };
    
    fetchMealTypes();
  }, []);

  // Handle meal type selection
  const handleMealTypeChange = (type: string) => {
    if (selectedMealTypes.includes(type)) {
      setSelectedMealTypes(selectedMealTypes.filter(t => t !== type));
    } else {
      setSelectedMealTypes([...selectedMealTypes, type]);
    }
  };

  // Set today's date as default
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDate(formattedDate);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (selectedMealTypes.length === 0) {
      setError('Please select at least one meal type');
      return;
    }

    setIsLoading(true);

    try {
      const mealPlanRequest = {
        date: date || undefined,
        meal_types: selectedMealTypes, // Always include meal types
        max_calories: maxCalories ? parseInt(maxCalories) : undefined,
        preferences: preferences || undefined,
        additional_instructions: additionalInstructions || undefined,
      };

      const response = await mealPlanApi.generateMealPlan(mealPlanRequest);
      
      // Navigate to the newly created meal plan
      router.push(`/mealplan/${response.id}`);
    } catch (err: any) {
      console.error('Error generating meal plan:', err);
      setError(err?.response?.data?.detail || 'Failed to generate meal plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Generate Meal Plan with AI</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Date selection */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Meal Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Types
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {mealTypes.map((type) => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`meal-type-${type}`}
                        checked={selectedMealTypes.includes(type)}
                        onChange={() => handleMealTypeChange(type)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label 
                        htmlFor={`meal-type-${type}`}
                        className="ml-2 block text-sm text-gray-700 capitalize"
                      >
                        {type.toLowerCase().replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Max Calories */}
              <div>
                <label htmlFor="max-calories" className="block text-sm font-medium text-gray-700">
                  Maximum Calories (optional)
                </label>
                <input
                  type="number"
                  id="max-calories"
                  value={maxCalories}
                  onChange={(e) => setMaxCalories(e.target.value)}
                  placeholder="Enter maximum calories"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Preferences */}
              <div>
                <label htmlFor="preferences" className="block text-sm font-medium text-gray-700">
                  Food Preferences (optional)
                </label>
                <input
                  type="text"
                  id="preferences"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="e.g., high protein, low carb, vegetarian"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Separate multiple preferences with commas
                </p>
              </div>

              {/* Additional Instructions */}
              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                  Additional Instructions (optional)
                </label>
                <textarea
                  id="instructions"
                  rows={3}
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="Any specific requirements or preferences for your meal plan"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <Link
                  href="/mealplans"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    'Generate with AI'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function GenerateMealPlanPage() {
  return (
    <ProtectedRoute>
      <GenerateMealPlanContent />
    </ProtectedRoute>
  );
}
