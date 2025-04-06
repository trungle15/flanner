import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { theme } from '../theme/theme';
import FormContainer from '../components/FormContainer';
import FormButton from '../components/FormButton';
import MultiSelect from '../components/MultiSelect';
import { useUserData } from '../context/UserDataContext';
import FormInput from '../components/FormInput';
import { Chip } from 'react-native-paper';

type Props = NativeStackScreenProps<RootStackParamList, 'DietaryPreferences'>;

const DietaryPreferencesScreen = ({ navigation }: Props) => {
  const { userData, updateUserData } = useUserData();
  const [customAllergy, setCustomAllergy] = useState('');

  const dietTypeOptions = [
    { id: 'no_restriction', label: 'No restriction' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'pescatarian', label: 'Pescatarian' },
    { id: 'halal', label: 'Halal' },
    { id: 'kosher', label: 'Kosher' },
  ];

  const allergyOptions = [
    { id: 'lactose', label: 'Lactose intolerance' },
    { id: 'gluten', label: 'Gluten intolerance' },
    { id: 'nuts', label: 'Nut allergy' },
    { id: 'shellfish', label: 'Shellfish allergy' },
    { id: 'eggs', label: 'Egg allergy' },
    { id: 'soy', label: 'Soy allergy' },
  ];

  const cuisineOptions = [
    { id: 'american', label: 'American' },
    { id: 'italian', label: 'Italian' },
    { id: 'mexican', label: 'Mexican' },
    { id: 'asian', label: 'Asian' },
    { id: 'mediterranean', label: 'Mediterranean' },
    { id: 'indian', label: 'Indian' },
  ];

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !userData.customAllergies.includes(customAllergy.trim())) {
      updateUserData({
        customAllergies: [...userData.customAllergies, customAllergy.trim()],
      });
      setCustomAllergy('');
    }
  };

  const removeCustomAllergy = (allergy: string) => {
    updateUserData({
      customAllergies: userData.customAllergies.filter(item => item !== allergy),
    });
  };

  const handleContinue = () => {
    navigation.navigate('MealPlan');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <FormContainer>
      <Text style={styles.sectionTitle}>Dietary Preferences</Text>
      <Text style={styles.sectionDescription}>
        Tell us about your dietary preferences and restrictions.
      </Text>

      <MultiSelect
        label="Diet Type (Select all that apply)"
        options={dietTypeOptions}
        selectedValues={userData.dietTypes}
        onSelect={(values) => updateUserData({ dietTypes: values })}
      />

      <MultiSelect
        label="Food Allergies/Restrictions"
        options={allergyOptions}
        selectedValues={userData.allergies}
        onSelect={(values) => updateUserData({ allergies: values })}
      />

      <View style={styles.customAllergyContainer}>
        <Text style={styles.label}>Custom Allergies/Restrictions</Text>
        <View style={styles.customAllergyInputRow}>
          <View style={styles.customAllergyInput}>
            <FormInput
              label=""
              value={customAllergy}
              onChangeText={setCustomAllergy}
              placeholder="Enter custom allergy"
            />
          </View>
          <FormButton
            title="Add"
            onPress={addCustomAllergy}
            mode="contained"
            style={styles.addButton}
            disabled={!customAllergy.trim()}
          />
        </View>

        {userData.customAllergies.length > 0 && (
          <View style={styles.customAllergiesList}>
            {userData.customAllergies.map((allergy, index) => (
              <Chip
                key={index}
                onClose={() => removeCustomAllergy(allergy)}
                style={styles.allergyChip}
                mode="outlined"
              >
                {allergy}
              </Chip>
            ))}
          </View>
        )}
      </View>

      <MultiSelect
        label="Preferred Cuisine (Optional)"
        options={cuisineOptions}
        selectedValues={userData.preferredCuisine}
        onSelect={(values) => updateUserData({ preferredCuisine: values })}
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
  label: {
    fontSize: 16,
    marginBottom: theme.spacing.s,
    color: theme.colors.text,
    fontWeight: '500',
  },
  customAllergyContainer: {
    marginBottom: theme.spacing.m,
  },
  customAllergyInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  customAllergyInput: {
    flex: 1,
    marginRight: theme.spacing.s,
  },
  addButton: {
    marginVertical: 0,
    height: 50,
    justifyContent: 'center',
    width: 80,
  },
  customAllergiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.s,
  },
  allergyChip: {
    margin: 4,
    backgroundColor: theme.colors.surface,
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

export default DietaryPreferencesScreen;
