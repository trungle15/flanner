import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { theme } from '../theme/theme';
import FormButton from '../components/FormButton';
import { useUserData } from '../context/UserDataContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Summary'>;

const SummaryScreen = ({ navigation }: Props) => {
  const { userData } = useUserData();

  const renderSummaryItem = (label: string, value: string | string[]) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return null;
    }

    return (
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>
          {Array.isArray(value) ? value.join(', ') : value}
        </Text>
      </View>
    );
  };

  const getHeightDisplay = () => {
    if (userData.heightCm) {
      return `${userData.heightCm} cm`;
    } else if (userData.heightFeet && userData.heightInches) {
      return `${userData.heightFeet}' ${userData.heightInches}"`;
    }
    return '';
  };

  const handleEdit = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  const handleSubmit = () => {
    // Here you would typically submit the data to your backend
    // For now, we'll navigate to the landing screen
    alert('Profile created successfully!');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Landing' }],
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.sectionDescription}>
          Review your information before submitting.
        </Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Profile Information</Text>
            <FormButton
              title="Edit"
              onPress={() => handleEdit('ProfileInfo')}
              mode="text"
              style={styles.editButton}
            />
          </View>
          {renderSummaryItem('Name', userData.name)}
          {renderSummaryItem('Age', userData.age)}
          {renderSummaryItem('Gender', userData.gender)}
          {renderSummaryItem('Height', getHeightDisplay())}
          {renderSummaryItem('Current Weight', `${userData.currentWeight} ${userData.currentWeightUnit}`)}
          {userData.goalWeight && renderSummaryItem('Goal Weight', `${userData.goalWeight} ${userData.goalWeightUnit}`)}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Fitness Goals</Text>
            <FormButton
              title="Edit"
              onPress={() => handleEdit('FitnessGoals')}
              mode="text"
              style={styles.editButton}
            />
          </View>
          {renderSummaryItem('Main Goal', userData.mainGoal)}
          {renderSummaryItem('Activity Level', userData.activityLevel)}
          {renderSummaryItem('Weekly Workout Frequency', userData.workoutFrequency)}
          {userData.workoutTypes.length > 0 && renderSummaryItem('Workout Types', userData.workoutTypes)}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Dietary Preferences</Text>
            <FormButton
              title="Edit"
              onPress={() => handleEdit('DietaryPreferences')}
              mode="text"
              style={styles.editButton}
            />
          </View>
          {userData.dietTypes.length > 0 && renderSummaryItem('Diet Types', userData.dietTypes)}
          
          {(userData.allergies.length > 0 || userData.customAllergies.length > 0) && 
            renderSummaryItem('Allergies/Restrictions', [...userData.allergies, ...userData.customAllergies])}
          
          {userData.preferredCuisine.length > 0 && renderSummaryItem('Preferred Cuisine', userData.preferredCuisine)}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Meal Plan Details</Text>
            <FormButton
              title="Edit"
              onPress={() => handleEdit('MealPlan')}
              mode="text"
              style={styles.editButton}
            />
          </View>
          {renderSummaryItem('Meal Plan Type', userData.mealPlanType)}
          {userData.diningHallPreferences.length > 0 && renderSummaryItem('Dining Hall Preferences', userData.diningHallPreferences)}
          {renderSummaryItem('Cooking Availability', userData.cookingAvailability)}
        </View>

        <FormButton
          title="Submit Profile"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.m,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    padding: theme.spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  sectionDescription: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.l,
  },
  section: {
    marginBottom: theme.spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  editButton: {
    marginVertical: 0,
    padding: 0,
  },
  summaryItem: {
    marginBottom: theme.spacing.s,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.primaryLight,
    marginVertical: theme.spacing.m,
  },
  submitButton: {
    marginTop: theme.spacing.l,
  },
});

export default SummaryScreen;
