"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Gender,
  MainGoal,
  ActivityLevel,
  WorkoutType,
  MealPlanType,
  CookingAvailability,
  userApi,
  Allergy,
  DietType,
  DiningHall,
} from "@/lib/api";

export default function Home() {
  const { login, register } = useAuth();
  const { theme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [dietTypes, setDietTypes] = useState<DietType[]>([]);
  const [diningHalls, setDiningHalls] = useState<DiningHall[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allergiesData, dietTypesData, diningHallsData] =
          await Promise.all([
            userApi.getAllergies(),
            userApi.getDietTypes(),
            userApi.getDiningHalls(),
          ]);
        setAllergies(allergiesData);
        setDietTypes(dietTypesData);
        setDiningHalls(diningHallsData);
      } catch (err) {
        console.error("Error fetching form data:", err);
      }
    };

    if (!isLogin) {
      fetchData();
    }
  }, [isLogin]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    age: 18,
    gender: Gender.PREFER_NOT_TO_SAY,
    height: 170,
    current_weight: 70,
    goal_weight: 70,
    main_goal: MainGoal.GENERAL_WELLNESS,
    activity_level: ActivityLevel.SEDENTARY,
    workout_frequency: 3,
    workout_type: WorkoutType.MIXED,
    campus_name: "University of Kansas",
    meal_plan_type: MealPlanType.UNLIMITED,
    cooking_availability: CookingAvailability.NONE,
    preferred_cuisine: "",
    allergies: [] as number[],
    diet_types: [] as number[],
    dining_halls: [] as number[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.username, formData.password);
      } else {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          height: formData.height,
          current_weight: formData.current_weight,
          goal_weight: formData.goal_weight,
          main_goal: formData.main_goal,
          activity_level: formData.activity_level,
          workout_frequency: formData.workout_frequency,
          workout_type: formData.workout_type,
          campus_name: formData.campus_name,
          meal_plan_type: formData.meal_plan_type,
          cooking_availability: formData.cooking_availability,
          preferred_cuisine: formData.preferred_cuisine,
          allergies: formData.allergies,
          diet_types: formData.diet_types,
          dining_halls: formData.dining_halls,
        });
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border" style={{ borderColor: theme.colors.border }}>
        <div className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.colors.primary }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h1 className="text-2xl font-bold mb-1" style={{ color: theme.colors.text.primary }}>Flanner</h1>
          <h2 className="text-xl font-medium" style={{ color: theme.colors.primary }}>
            {isLogin ? "Sign in to your account" : "Create your account"}
          </h2>
        </div>

        <div className="mt-8 w-full">
          <div className="bg-white py-6 px-4">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-900"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="age"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Age
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      min="13"
                      max="100"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          age: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value as Gender,
                        })
                      }
                    >
                      {Object.values(Gender).map((gender) => (
                        <option key={gender} value={gender}>
                          {gender.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="height"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Height (cm)
                    </label>
                    <input
                      id="height"
                      name="height"
                      type="number"
                      min="50"
                      max="250"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      value={formData.height}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          height: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="current_weight"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Current Weight (kg)
                    </label>
                    <input
                      id="current_weight"
                      name="current_weight"
                      type="number"
                      min="30"
                      max="300"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      value={formData.current_weight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          current_weight: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="goal_weight"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Goal Weight (kg)
                    </label>
                    <input
                      id="goal_weight"
                      name="goal_weight"
                      type="number"
                      min="30"
                      max="300"
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      value={formData.goal_weight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          goal_weight: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="main_goal"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Main Goal
                    </label>
                    <select
                      id="main_goal"
                      name="main_goal"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      value={formData.main_goal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          main_goal: e.target.value as MainGoal,
                        })
                      }
                    >
                      {Object.values(MainGoal).map((goal) => (
                        <option key={goal} value={goal}>
                          {goal.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="activity_level"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Activity Level
                    </label>
                    <select
                      id="activity_level"
                      name="activity_level"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      value={formData.activity_level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          activity_level: e.target.value as ActivityLevel,
                        })
                      }
                    >
                      {Object.values(ActivityLevel).map((level) => (
                        <option key={level} value={level}>
                          {level.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="workout_frequency"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Workout Frequency (days per week)
                    </label>
                    <input
                      id="workout_frequency"
                      name="workout_frequency"
                      type="number"
                      min="0"
                      max="7"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      value={formData.workout_frequency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workout_frequency: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="workout_type"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Workout Type
                    </label>
                    <select
                      id="workout_type"
                      name="workout_type"
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      value={formData.workout_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workout_type: e.target.value as WorkoutType,
                        })
                      }
                    >
                      {Object.values(WorkoutType).map((type) => (
                        <option key={type} value={type}>
                          {type.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="meal_plan_type"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Meal Plan Type
                    </label>
                    <select
                      id="meal_plan_type"
                      name="meal_plan_type"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      value={formData.meal_plan_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meal_plan_type: e.target.value as MealPlanType,
                        })
                      }
                    >
                      {Object.values(MealPlanType).map((type) => (
                        <option key={type} value={type}>
                          {type.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="cooking_availability"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Cooking Availability
                    </label>
                    <select
                      id="cooking_availability"
                      name="cooking_availability"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      value={formData.cooking_availability}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cooking_availability: e.target
                            .value as CookingAvailability,
                        })
                      }
                    >
                      {Object.values(CookingAvailability).map(
                        (availability) => (
                          <option key={availability} value={availability}>
                            {availability.replace("_", " ")}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="preferred_cuisine"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Preferred Cuisine (optional)
                    </label>
                    <input
                      id="preferred_cuisine"
                      name="preferred_cuisine"
                      type="text"
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      value={formData.preferred_cuisine}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferred_cuisine: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="allergies"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Allergies
                    </label>
                    <select
                      id="allergies"
                      name="allergies"
                      multiple
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200 min-h-[100px]"
                      value={formData.allergies.map(String)}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions
                        );
                        const selectedIds = selectedOptions.map((option) =>
                          parseInt(option.value)
                        );
                        setFormData({ ...formData, allergies: selectedIds });
                      }}
                    >
                      {allergies.map((allergy) => (
                        <option key={allergy.id} value={allergy.id}>
                          {allergy.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="diet_types"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Diet Types
                    </label>
                    <select
                      id="diet_types"
                      name="diet_types"
                      multiple
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200 min-h-[100px]"
                      value={formData.diet_types.map(String)}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions
                        );
                        const selectedIds = selectedOptions.map((option) =>
                          parseInt(option.value)
                        );
                        setFormData({ ...formData, diet_types: selectedIds });
                      }}
                    >
                      {dietTypes.map((dietType) => (
                        <option key={dietType.id} value={dietType.id}>
                          {dietType.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="dining_halls"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Dining Halls
                    </label>
                    <select
                      id="dining_halls"
                      name="dining_halls"
                      multiple
                      className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200 min-h-[100px]"
                      value={formData.dining_halls.map(String)}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions
                        );
                        const selectedIds = selectedOptions.map((option) =>
                          parseInt(option.value)
                        );
                        setFormData({ ...formData, dining_halls: selectedIds });
                      }}
                    >
                      {diningHalls.map((hall) => (
                        <option key={hall.id} value={hall.id}>
                          {hall.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.colors.primary }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Password
                  </div>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full rounded-md border px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  style={{ 
                    borderColor: theme.colors.border,
                    backgroundColor: 'white',
                    color: theme.colors.text.primary,
                    boxShadow: theme.shadows.sm
                  }}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              {error && (
                <div className="p-4 my-4 rounded flex items-start" style={{ backgroundColor: `${theme.colors.danger}15`, borderColor: theme.colors.danger }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.colors.danger }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm" style={{ color: theme.colors.danger }}>{error}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                  style={{ 
                    backgroundColor: theme.colors.primary,
                    boxShadow: theme.shadows.md
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      {isLogin ? "Sign In" : "Sign Up"}
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-medium flex items-center transition-colors duration-200"
                style={{ color: theme.colors.primary }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isLogin ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  )}
                </svg>
                {isLogin
                  ? "Need an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
