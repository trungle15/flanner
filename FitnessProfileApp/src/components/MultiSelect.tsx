import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Chip } from 'react-native-paper';
import { theme } from '../theme/theme';

type Option = {
  id: string;
  label: string;
};

type MultiSelectProps = {
  options: Option[];
  selectedValues: string[];
  onSelect: (values: string[]) => void;
  label: string;
};

const MultiSelect = ({ options, selectedValues, onSelect, label }: MultiSelectProps) => {
  const toggleOption = (id: string) => {
    if (selectedValues.includes(id)) {
      onSelect(selectedValues.filter(value => value !== id));
    } else {
      onSelect([...selectedValues, id]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map(option => (
          <Chip
            key={option.id}
            selected={selectedValues.includes(option.id)}
            onPress={() => toggleOption(option.id)}
            style={[
              styles.chip,
              selectedValues.includes(option.id) ? styles.selectedChip : {}
            ]}
            textStyle={selectedValues.includes(option.id) ? styles.selectedChipText : {}}
            mode="outlined"
          >
            {option.label}
          </Chip>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.m,
  },
  label: {
    fontSize: 16,
    marginBottom: theme.spacing.s,
    color: theme.colors.text,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
  },
  chip: {
    margin: 4,
    backgroundColor: theme.colors.surface,
  },
  selectedChip: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  selectedChipText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});

export default MultiSelect;
