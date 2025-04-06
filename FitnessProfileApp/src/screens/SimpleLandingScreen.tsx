import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { getFontFamily } from '../theme/fonts';
import { Button } from 'react-native-paper';

const SimpleLandingScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Fitness Profile App</Text>
        <Text style={styles.subtitle}>Your personal fitness companion</Text>
        <Text style={styles.instructions}>Click the button below to access your fitness dashboard with goals and meal planning</Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            style={styles.button}
            onPress={() => navigation.navigate('MainTabs' as never)}
            labelStyle={styles.buttonLabel}
          >
            ENTER DASHBOARD
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: getFontFamily('bold', 'heading'),
    color: theme.colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginBottom: 16,
    borderRadius: 8,
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontFamily: getFontFamily('bold', 'heading'),
    letterSpacing: 1,
  },
});

export default SimpleLandingScreen;
