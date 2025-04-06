'use client';

import { useState, useEffect } from 'react';
import { MealPlan, mealPlanApi, MenuItem } from '@/lib/api';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useTheme } from '@/contexts/ThemeContext';

function MealPlansContent() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchMealPlans = async () => {
      setLoading(true);
      try {
        const data = await mealPlanApi.getMealPlans();
        setMealPlans(data);
      } catch (error) {
        console.error('Error fetching meal plans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMealPlans();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.colors.primary }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h1 className="text-3xl font-bold" style={{ color: theme.colors.text.primary }}>My Meal Plans</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <Link 
            href="/mealplan/create"
            className="text-white px-6 py-3 rounded-md transition-colors text-center font-medium shadow-sm flex items-center justify-center"
            style={{ 
              backgroundColor: theme.colors.primary,
              transition: 'all 0.2s ease'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Meal Plan
          </Link>
          <Link 
            href="/mealplan/generate"
            className="text-white px-6 py-3 rounded-md transition-colors text-center font-medium shadow-sm flex items-center justify-center"
            style={{ 
              backgroundColor: theme.colors.accent,
              transition: 'all 0.2s ease'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate with AI
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 mx-auto" style={{ borderColor: theme.colors.primary }}></div>
            <p className="mt-2 flex items-center justify-center" style={{ color: theme.colors.text.secondary }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Loading your meal plans...
            </p>
          </div>
        ) : mealPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans.map((mealPlan) => (
              <div key={mealPlan.id} className="bg-white rounded-lg overflow-hidden transition-shadow" 
                style={{ 
                  boxShadow: theme.shadows.md,
                  borderRadius: theme.borderRadius.md,
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.colors.primary }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h18v18H3zM3 9h18M9 21V9" />
                    </svg>
                    <h2 className="text-xl font-semibold" style={{ color: theme.colors.text.primary }}>{mealPlan.name}</h2>
                  </div>
                  <p className="mb-4 line-clamp-2 pl-7" style={{ color: theme.colors.text.secondary }}>{mealPlan.description || 'No description provided'}</p>
                  
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.colors.accent }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium" style={{ color: theme.colors.text.secondary }}>Included Items:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-6">
                      {mealPlan.menu_items.slice(0, 3).map(item => (
                        <span key={item.id} className="text-xs px-2 py-1 rounded flex items-center" 
                          style={{ 
                            backgroundColor: `${theme.colors.primary}15`, // 15% opacity
                            color: theme.colors.primary
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {item.servings > 1 ? `${item.servings}x ` : ''}{item.name}
                        </span>
                      ))}
                      {mealPlan.menu_items.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded flex items-center"
                          style={{ 
                            backgroundColor: `${theme.colors.secondary}15`, // 15% opacity
                            color: theme.colors.secondary
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          +{mealPlan.menu_items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4" style={{ borderColor: theme.colors.border }}>
                    <div className="flex items-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.colors.text.secondary }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-xs font-medium" style={{ color: theme.colors.text.secondary }}>Nutrition Summary</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                      <div className="flex flex-col items-center p-2 rounded" style={{ backgroundColor: `${theme.colors.primary}10` }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.colors.primary }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="font-bold" style={{ color: theme.colors.primary }}>{mealPlan.total_calories}</span>
                        <span className="text-xs" style={{ color: theme.colors.text.light }}>calories</span>
                      </div>
                      
                      <div className="flex flex-col items-center p-2 rounded" style={{ backgroundColor: `${theme.colors.accent}10` }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.colors.accent }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                        <span className="font-bold" style={{ color: theme.colors.accent }}>{mealPlan.total_protein}g</span>
                        <span className="text-xs" style={{ color: theme.colors.text.light }}>protein</span>
                      </div>
                      
                      <div className="flex flex-col items-center p-2 rounded" style={{ backgroundColor: `${theme.colors.secondary}10` }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.colors.secondary }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-bold" style={{ color: theme.colors.secondary }}>{mealPlan.menu_items.length}</span>
                        <span className="text-xs" style={{ color: theme.colors.text.light }}>items</span>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/mealplan/${mealPlan.id}`}
                      className="font-medium flex items-center justify-center w-full py-2 rounded-md"
                      style={{ 
                        color: theme.colors.primary,
                        backgroundColor: `${theme.colors.primary}10`,
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg" style={{ boxShadow: theme.shadows.md }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.colors.secondary }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-medium mb-2" style={{ color: theme.colors.text.primary }}>No meal plans yet</h3>
            <p className="mb-6" style={{ color: theme.colors.text.light }}>Create your first meal plan to get started!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/mealplan/create"
                className="text-white px-6 py-3 rounded-md transition-colors text-center font-medium shadow-sm flex items-center justify-center"
                style={{ 
                  backgroundColor: theme.colors.primary,
                  transition: 'all 0.2s ease'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Create Manually
              </Link>
              <Link 
                href="/mealplan/generate"
                className="text-white px-6 py-3 rounded-md transition-colors text-center font-medium shadow-sm flex items-center justify-center"
                style={{ 
                  backgroundColor: theme.colors.accent,
                  transition: 'all 0.2s ease'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate with AI
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function MealPlansPage() {
  return (
    <ProtectedRoute>
      <MealPlansContent />
    </ProtectedRoute>
  );
}
