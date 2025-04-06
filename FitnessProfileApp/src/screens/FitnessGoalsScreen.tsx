import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { theme } from '../theme/theme';
import FormContainer from '../components/FormContainer';
import FormButton from '../components/FormButton';
import FormDropdown from '../components/FormDropdown';
import MultiSelect from '../components/MultiSelect';
import { useUserData } from '../context/UserDataContext';

type Props = NativeStackScreenProps<RootStackParamList, 'FitnessGoals'>;

const FitnessGoalsScreen = ({ navigation }: Props) => {
  const { userData, updateUserData } = useUserData();

  const mainGoalOptions = [
    { key: 'lose_weight', value: 'Lose weight (calorie deficit)' },
    { key: 'gain_weight', value: 'Gain weight/muscle (calorie surplus)' },
    { key: 'maintain_weight', value: 'Maintain weight' },
    { key: 'improve_performance', value: 'Improve athletic performance' },
    { key: 'general_wellness', value: 'General wellness & balanced eating' },
  ];

  const activityLevelOptions = [
    { key: 'sedentary', value: 'Sedentary (little/no exercise)' },
    { key: 'lightly_active', value: 'Lightly Active (light exercise 1-3 days/week)' },
    { key: 'moderately_active', value: 'Moderately Active (moderate exercise 3-5 days/week)' },
    { key: 'very_active', value: 'Very Active (hard exercise 6-7 days/week)' },
    { key: 'athlete', value: 'Athlete (intense exercise daily, twice/day)' },
  ];

  const workoutFrequencyOptions = [
    { key: '0', value: '0 days per week' },
    { key: '1', value: '1 day per week' },
    { key: '2', value: '2 days per week' },
    { key: '3', value: '3 days per week' },
    { key: '4', value: '4 days per week' },
    { key: '5', value: '5 days per week' },
    { key: '6', value: '6 days per week' },
    { key: '7', value: '7 days per week' },
  ];

  const workoutTypeOptions = [
    { id: 'cardio', label: 'Cardio' },
    { id: 'strength', label: 'Strength Training' },
    { id: 'sports', label: 'Sports' },
    { id: 'yoga', label: 'Yoga/Pilates' },
    { id: 'hiit', label: 'HIIT' },
    { id: 'mixed', label: 'Mixed' },
  ];

  const handleContinue = () => {
    navigation.navigate('DietaryPreferences');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <FormContainer>
      <Text style={styles.sectionTitle}>Fitness Goals</Text>
      <Text style={styles.sectionDescription}>
        Tell us about your fitness goals and activity level so we can tailor your plan.
      </Text>

      <FormDropdown
        label="Main Goal"
        options={mainGoalOptions}
        selectedValue={userData.mainGoal}
        onSelect={(value) => updateUserData({ mainGoal: value })}
        placeholder="Select your main goal"
        required
      />

      <FormDropdown
        label="Activity Level"
        options={activityLevelOptions}
        selectedValue={userData.activityLevel}
        onSelect={(value) => updateUserData({ activityLevel: value })}
        placeholder="Select your activity level"
        required
      />

      <FormDropdown
        label="Weekly Workout Frequency"
        options={workoutFrequencyOptions}
        selectedValue={userData.workoutFrequency}
        onSelect={(value) => updateUserData({ workoutFrequency: value })}
        placeholder="Select workout frequency"
        required
      />

      <MultiSelect
        label="Type of Workouts (Optional)"
        options={workoutTypeOptions}
        selectedValues={userData.workoutTypes}
        onSelect={(values) => updateUserData({ workoutTypes: values })}
      />

      <View style={styles.buttonContainer}>
        <FormButton
          title="Back"
          onPress={handleBack}
          mode="outlined"
          style={styles.backButton}
        />
        <FormButton
          title="Continue"
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </View>
    </FormContainer>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  sectionDescription: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.l,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.l,
  },
  backButton: {
    flex: 1,
    marginRight: theme.spacing.s,
  },
  continueButton: {
    flex: 1,
    marginLeft: theme.spacing.s,
  },
});

export default FitnessGoalsScreen;
