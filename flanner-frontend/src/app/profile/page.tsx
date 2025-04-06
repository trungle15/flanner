"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  authApi, 
  userApi, 
  Gender, 
  MainGoal, 
  ActivityLevel, 
  WorkoutType, 
  MealPlanType, 
  CookingAvailability 
} from "@/lib/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function ProfileContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allergies, setAllergies] = useState<{ id: number; name: string }[]>([]);
  const [dietTypes, setDietTypes] = useState<{ id: number; name: string }[]>([]);
  const [diningHalls, setDiningHalls] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: 0,
    gender: Gender.PREFER_NOT_TO_SAY,
    height: 0,
    current_weight: 0,
    goal_weight: 0,
    main_goal: MainGoal.GENERAL_WELLNESS,
    activity_level: ActivityLevel.LIGHTLY_ACTIVE,
    workout_frequency: 0,
    workout_type: WorkoutType.MIXED,
    campus_name: "",
    meal_plan_type: MealPlanType.UNLIMITED,
    cooking_availability: CookingAvailability.LIMITED,
    preferred_cuisine: "",
    allergies: [],
    diet_types: [],
    dining_halls: []
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [userData, allergiesData, dietTypesData, diningHallsData] = await Promise.all([
          authApi.getCurrentUser(),
          userApi.getAllergies(),
          userApi.getDietTypes(),
          userApi.getDiningHalls()
        ]);
        
        setUser(userData);
        setAllergies(allergiesData);
        setDietTypes(dietTypesData);
        setDiningHalls(diningHallsData);
        
        // Initialize form data with user data
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          age: userData.age || 0,
          gender: userData.gender || Gender.PREFER_NOT_TO_SAY,
          height: userData.height || 0,
          current_weight: userData.current_weight || 0,
          goal_weight: userData.goal_weight || 0,
          main_goal: userData.main_goal || MainGoal.GENERAL_WELLNESS,
          activity_level: userData.activity_level || ActivityLevel.LIGHTLY_ACTIVE,
          workout_frequency: userData.workout_frequency || 0,
          workout_type: userData.workout_type || WorkoutType.MIXED,
          campus_name: userData.campus_name || "",
          meal_plan_type: userData.meal_plan_type || MealPlanType.UNLIMITED,
          cooking_availability: userData.cooking_availability || CookingAvailability.LIMITED,
          preferred_cuisine: userData.preferred_cuisine || "",
          allergies: userData.allergies?.map(a => a.id) || [],
          diet_types: userData.diet_types?.map(d => d.id) || [],
          dining_halls: userData.dining_halls?.map(d => d.id) || []
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>, field: string) => {
    const options = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
    setFormData({
      ...formData,
      [field]: options
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update profile via API
      const updatedUser = await userApi.updateProfile(formData);
      setUser(updatedUser);
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err?.response?.data?.detail || "Failed to update profile. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {Object.entries(Gender).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  name="current_weight"
                  value={formData.current_weight}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Goal Weight (kg)
                </label>
                <input
                  type="number"
                  name="goal_weight"
                  value={formData.goal_weight}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Main Goal
                </label>
                <select
                  name="main_goal"
                  value={formData.main_goal}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {Object.entries(MainGoal).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Activity Level
                </label>
                <select
                  name="activity_level"
                  value={formData.activity_level}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {Object.entries(ActivityLevel).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Workout Frequency (per week)
                </label>
                <input
                  type="number"
                  name="workout_frequency"
                  value={formData.workout_frequency}
                  onChange={handleInputChange}
                  min="0"
                  max="7"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Workout Type
                </label>
                <select
                  name="workout_type"
                  value={formData.workout_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {Object.entries(WorkoutType).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Campus Name
                </label>
                <input
                  type="text"
                  name="campus_name"
                  value={formData.campus_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meal Plan Type
                </label>
                <select
                  name="meal_plan_type"
                  value={formData.meal_plan_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {Object.entries(MealPlanType).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cooking Availability
                </label>
                <select
                  name="cooking_availability"
                  value={formData.cooking_availability}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {Object.entries(CookingAvailability).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Cuisine
                </label>
                <input
                  type="text"
                  name="preferred_cuisine"
                  value={formData.preferred_cuisine}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Allergies
                </label>
                <select
                  multiple
                  size={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  onChange={(e) => handleMultiSelect(e, 'allergies')}
                  value={formData.allergies.map(String)}
                >
                  {allergies.map((allergy) => (
                    <option key={allergy.id} value={allergy.id}>
                      {allergy.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Diet Types
                </label>
                <select
                  multiple
                  size={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  onChange={(e) => handleMultiSelect(e, 'diet_types')}
                  value={formData.diet_types.map(String)}
                >
                  {dietTypes.map((dietType) => (
                    <option key={dietType.id} value={dietType.id}>
                      {dietType.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dining Halls
                </label>
                <select
                  multiple
                  size={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  onChange={(e) => handleMultiSelect(e, 'dining_halls')}
                  value={formData.dining_halls.map(String)}
                >
                  {diningHalls.map((diningHall) => (
                    <option key={diningHall.id} value={diningHall.id}>
                      {diningHall.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
