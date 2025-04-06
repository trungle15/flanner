import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { theme } from '../theme/theme';
import FormContainer from '../components/FormContainer';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import FormDropdown from '../components/FormDropdown';
import { useUserData } from '../context/UserDataContext';
import { RadioButton } from 'react-native-paper';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileInfo'>;

const ProfileInfoScreen = ({ navigation }: Props) => {
  const { userData, updateUserData } = useUserData();
  const [heightUnit, setHeightUnit] = useState<'imperial' | 'metric'>(
    userData.heightCm ? 'metric' : 'imperial'
  );

  const genderOptions = [
    { key: 'male', value: 'Male' },
    { key: 'female', value: 'Female' },
    { key: 'other', value: 'Other' },
    { key: 'prefer_not_to_say', value: 'Prefer not to say' },
  ];

  const handleContinue = () => {
    navigation.navigate('FitnessGoals');
  };

  const toggleWeightUnit = (field: 'currentWeightUnit' | 'goalWeightUnit') => {
    updateUserData({
      [field]: userData[field] === 'lbs' ? 'kg' : 'lbs',
    });
  };

  return (
    <FormContainer>
      <Text style={styles.sectionTitle}>Profile Information</Text>
      <Text style={styles.sectionDescription}>
        Let's get to know you better to create your personalized plan.
      </Text>

      <FormInput
        label="Name"
        value={userData.name}
        onChangeText={(text) => updateUserData({ name: text })}
        placeholder="Enter your name"
        required
      />

      <FormInput
        label="Age"
        value={userData.age}
        onChangeText={(text) => updateUserData({ age: text })}
        placeholder="Enter your age"
        keyboardType="numeric"
        required
      />

      <FormDropdown
        label="Gender"
        options={genderOptions}
        selectedValue={userData.gender}
        onSelect={(value) => updateUserData({ gender: value })}
        placeholder="Select your gender"
        required
      />

      <Text style={styles.label}>Height</Text>
      <View style={styles.radioGroup}>
        <RadioButton.Group
          onValueChange={(value) => setHeightUnit(value as 'imperial' | 'metric')}
          value={heightUnit}
        >
          <View style={styles.radioOption}>
            <RadioButton value="imperial" color={theme.colors.primary} />
            <Text style={styles.radioLabel}>ft/in</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="metric" color={theme.colors.primary} />
            <Text style={styles.radioLabel}>cm</Text>
          </View>
        </RadioButton.Group>
      </View>

      {heightUnit === 'imperial' ? (
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <FormInput
              label="Feet"
              value={userData.heightFeet}
              onChangeText={(text) => updateUserData({ heightFeet: text })}
              placeholder="ft"
              keyboardType="numeric"
              required
            />
          </View>
          <View style={styles.halfInput}>
            <FormInput
              label="Inches"
              value={userData.heightInches}
              onChangeText={(text) => updateUserData({ heightInches: text })}
              placeholder="in"
              keyboardType="numeric"
              required
            />
          </View>
        </View>
      ) : (
        <FormInput
          label="Height (cm)"
          value={userData.heightCm}
          onChangeText={(text) => updateUserData({ heightCm: text })}
          placeholder="Enter height in cm"
          keyboardType="numeric"
          required
        />
      )}

      <View style={styles.weightContainer}>
        <Text style={styles.label}>Current Weight</Text>
        <View style={styles.weightInputRow}>
          <View style={styles.weightInput}>
            <FormInput
              label=""
              value={userData.currentWeight}
              onChangeText={(text) => updateUserData({ currentWeight: text })}
              placeholder="Enter weight"
              keyboardType="numeric"
              required
            />
          </View>
          <View style={styles.unitToggle}>
            <FormButton
              title={userData.currentWeightUnit}
              onPress={() => toggleWeightUnit('currentWeightUnit')}
              mode="outlined"
              style={styles.unitButton}
            />
          </View>
        </View>
      </View>

      <View style={styles.weightContainer}>
        <Text style={styles.label}>Goal Weight (Optional)</Text>
        <View style={styles.weightInputRow}>
          <View style={styles.weightInput}>
            <FormInput
              label=""
              value={userData.goalWeight}
              onChangeText={(text) => updateUserData({ goalWeight: text })}
              placeholder="Enter goal weight"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.unitToggle}>
            <FormButton
              title={userData.goalWeightUnit}
              onPress={() => toggleWeightUnit('goalWeightUnit')}
              mode="outlined"
              style={styles.unitButton}
            />
          </View>
        </View>
      </View>

      <FormButton
        title="Continue"
        onPress={handleContinue}
        style={styles.continueButton}
      />
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
  radioGroup: {
    flexDirection: 'row',
    marginBottom: theme.spacing.m,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.l,
  },
  radioLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  weightContainer: {
    marginBottom: theme.spacing.m,
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  weightInput: {
    flex: 1,
    marginRight: theme.spacing.s,
  },
  unitToggle: {
    width: 70,
  },
  unitButton: {
    marginVertical: 0,
    height: 50,
    justifyContent: 'center',
  },
  continueButton: {
    marginTop: theme.spacing.l,
  },
});

export default ProfileInfoScreen;
