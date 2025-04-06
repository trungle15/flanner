import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Card, ProgressBar, Button, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserData } from '../context/UserDataContext';
import { theme } from '../theme/theme';
import { getFontFamily } from '../theme/fonts';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const GoalsScreen = () => {
  const { userData } = useUserData();
  const navigation = useNavigation();

  // Calculate BMI if we have the data
  const calculateBMI = () => {
    if (!userData.currentWeight || (!userData.heightCm && (!userData.heightFeet || !userData.heightInches))) {
      return null;
    }
    
    let heightInMeters;
    if (userData.heightCm) {
      heightInMeters = parseFloat(userData.heightCm) / 100;
    } else {
      const totalInches = (parseFloat(userData.heightFeet) * 12) + parseFloat(userData.heightInches);
      heightInMeters = totalInches * 0.0254;
    }
    
    const weightInKg = userData.currentWeightUnit === 'kg' 
      ? parseFloat(userData.currentWeight) 
      : parseFloat(userData.currentWeight) * 0.453592;
    
    if (isNaN(weightInKg) || isNaN(heightInMeters) || heightInMeters === 0) {
      return null;
    }
    
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
  };
  
  // Calculate progress towards goal weight
  const calculateWeightProgress = () => {
    if (!userData.currentWeight || !userData.goalWeight) return null;
    
    const current = parseFloat(userData.currentWeight);
    const goal = parseFloat(userData.goalWeight);
    
    if (isNaN(current) || isNaN(goal)) return null;
    
    // If goal is less than current (weight loss goal)
    if (goal < current) {
      // Assume starting weight was 20% higher than current for demo purposes
      const startWeight = current * 1.2;
      return 1 - ((current - goal) / (startWeight - goal));
    } 
    // If goal is more than current (weight gain goal)
    else if (goal > current) {
      // Assume starting weight was 20% lower than current for demo purposes
      const startWeight = current * 0.8;
      return (current - startWeight) / (goal - startWeight);
    }
    
    // If current weight equals goal weight
    return 1;
  };

  // Get BMI category
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  // Get color for BMI category
  const getBMICategoryColor = (category: string): string => {
    switch (category) {
      case 'Underweight':
        return '#FFC107'; // Amber
      case 'Normal':
        return '#4CAF50'; // Green
      case 'Overweight':
        return '#FF9800'; // Orange
      case 'Obese':
        return '#F44336'; // Red
      default:
        return theme.colors.textSecondary;
    }
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;
  const weightProgress = calculateWeightProgress();

  const workoutTypes = userData.workoutTypes ? userData.workoutTypes.split(',') : [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Weight Goal Progress</Text>
            {userData.currentWeight && userData.goalWeight ? (
              <View>
                <View style={styles.weightContainer}>
                  <Text style={styles.currentWeight}>
                    {userData.currentWeight} {userData.currentWeightUnit || 'lbs'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={theme.colors.textSecondary} />
                  <Text style={styles.goalWeight}>
                    {userData.goalWeight} {userData.currentWeightUnit || 'lbs'}
                  </Text>
                </View>
                <ProgressBar
                  progress={weightProgress || 0}
                  color={theme.colors.primary}
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {weightProgress !== null 
                    ? `${Math.round(weightProgress * 100)}% to goal`
                    : 'Progress not available'}
                </Text>
              </View>
            ) : (
              <Text style={styles.noDataText}>No weight data available</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content style={styles.bmiContainer}>
            <Text style={styles.cardTitle}>Body Mass Index (BMI)</Text>
            {bmi ? (
              <>
                <Text style={styles.bmiValue}>{bmi}</Text>
                <Text style={[styles.bmiCategory, { color: getBMICategoryColor(bmiCategory || '') }]}>
                  {bmiCategory}
                </Text>
              </>
            ) : (
              <Text style={styles.noDataText}>BMI calculation requires height and weight data</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Fitness Goals</Text>
            {userData.mainGoal ? (
              <View>
                <Text style={styles.goalText}>{userData.mainGoal}</Text>
                <Text style={styles.activityText}>
                  Activity Level: {userData.activityLevel || 'Not specified'}
                </Text>
                <Text style={styles.workoutText}>
                  Workout Frequency: {userData.workoutFrequency || 'Not specified'}
                </Text>
                
                {workoutTypes.length > 0 && (
                  <View style={styles.workoutTypesContainer}>
                    <Text style={styles.workoutTypesLabel}>Preferred Workouts:</Text>
                    <View style={styles.chipContainer}>
                      {workoutTypes.map((type, index) => (
                        <Chip 
                          key={index} 
                          style={styles.chip}
                          textStyle={styles.chipText}
                        >
                          {type.trim()}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.noDataText}>No fitness goals specified</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Dietary Preferences</Text>
            {userData.dietType ? (
              <View>
                <Text style={styles.dietText}>Diet Type: {userData.dietType}</Text>
                
                {userData.allergies && (
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionLabel}>Allergies/Restrictions:</Text>
                    <View style={styles.chipContainer}>
                      {userData.allergies.split(',').map((allergy, index) => (
                        <Chip 
                          key={index} 
                          style={styles.allergyChip}
                          textStyle={styles.allergyChipText}
                        >
                          {allergy.trim()}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}
                
                {userData.cuisinePreferences && (
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionLabel}>Preferred Cuisines:</Text>
                    <View style={styles.chipContainer}>
                      {userData.cuisinePreferences.split(',').map((cuisine, index) => (
                        <Chip 
                          key={index} 
                          style={styles.cuisineChip}
                          textStyle={styles.cuisineChipText}
                        >
                          {cuisine.trim()}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.noDataText}>No dietary preferences specified</Text>
            )}
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            style={styles.updateButton}
            onPress={() => navigation.navigate('FitnessGoals' as never)}
          >
            Update Fitness Goals
          </Button>
          <Button 
            mode="outlined" 
            style={styles.updateButton}
            onPress={() => navigation.navigate('DietaryPreferences' as never)}
          >
            Update Dietary Preferences
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: theme.colors.surface,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: getFontFamily('semiBold', 'heading'),
    color: theme.colors.primary,
    marginBottom: 16,
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  currentWeight: {
    fontSize: 18,
    fontFamily: getFontFamily('medium', 'body'),
    color: theme.colors.text,
  },
  goalWeight: {
    fontSize: 18,
    fontFamily: getFontFamily('medium', 'body'),
    color: theme.colors.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.surfaceVariant,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  bmiContainer: {
    alignItems: 'center',
  },
  bmiValue: {
    fontSize: 42,
    fontFamily: getFontFamily('bold', 'heading'),
    color: theme.colors.text,
    marginTop: 8,
  },
  bmiCategory: {
    fontSize: 16,
    fontFamily: getFontFamily('medium', 'body'),
    marginTop: 8,
  },
  goalText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium', 'body'),
    color: theme.colors.text,
    marginBottom: 8,
  },
  activityText: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  workoutText: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  workoutTypesContainer: {
    marginTop: 8,
  },
  workoutTypesLabel: {
    fontSize: 14,
    fontFamily: getFontFamily('medium', 'body'),
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: theme.colors.primaryLight,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: theme.colors.primary,
    fontSize: 12,
  },
  dietText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium', 'body'),
    color: theme.colors.text,
    marginBottom: 12,
  },
  sectionContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: getFontFamily('medium', 'body'),
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  allergyChip: {
    backgroundColor: '#FFEBEE',
    marginRight: 8,
    marginBottom: 8,
  },
  allergyChipText: {
    color: '#D32F2F',
    fontSize: 12,
  },
  cuisineChip: {
    backgroundColor: '#E0F7FA',
    marginRight: 8,
    marginBottom: 8,
  },
  cuisineChipText: {
    color: '#0097A7',
    fontSize: 12,
  },
  noDataText: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  updateButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
});

export default GoalsScreen;
