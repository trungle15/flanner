import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { theme } from '../theme/theme';

type FormButtonProps = {
  title: string;
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained';
  disabled?: boolean;
  loading?: boolean;
  style?: object;
};

const FormButton = ({
  title,
  onPress,
  mode = 'contained',
  disabled = false,
  loading = false,
  style = {},
}: FormButtonProps) => {
  return (
    <Button
      mode={mode}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      style={[styles.button, style]}
      contentStyle={styles.buttonContent}
      labelStyle={styles.buttonLabel}
    >
      {title}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: theme.spacing.m,
    borderRadius: theme.roundness,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FormButton;
