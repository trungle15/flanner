import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { theme } from '../theme/theme';

type Option = {
  key: string;
  value: string;
};

type FormDropdownProps = {
  label: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

const FormDropdown = ({
  label,
  options,
  selectedValue,
  onSelect,
  placeholder = 'Select an option',
  required = false,
}: FormDropdownProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <SelectList
        setSelected={onSelect}
        data={options}
        save="key"
        defaultOption={options.find(option => option.key === selectedValue)}
        placeholder={placeholder}
        inputStyles={selectedValue ? styles.dropdownText : styles.placeholderStyle}
        boxStyles={styles.dropdown}

        dropdownStyles={styles.dropdownList}
        dropdownTextStyles={styles.dropdownItemText}
        search={false}
        arrowicon={
          <View style={styles.arrowIcon}>
            <Text style={styles.arrowIconText}>▼</Text>
          </View>
        }
      />
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
  required: {
    color: theme.colors.error,
  },
  dropdown: {
    borderColor: theme.colors.border,
    borderRadius: theme.roundness,
    height: 50,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    backgroundColor: theme.colors.surface,
  },
  dropdownText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  placeholderStyle: {
    color: theme.colors.placeholder,
    fontSize: 16,
  },
  dropdownList: {
    borderColor: theme.colors.border,
    borderRadius: theme.roundness,
    marginTop: 5,
    backgroundColor: theme.colors.surface,
  },
  dropdownItemText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  arrowIcon: {
    marginLeft: theme.spacing.s,
  },
  arrowIconText: {
    color: theme.colors.primary,
    fontSize: 12,
  },
});

export default FormDropdown;
