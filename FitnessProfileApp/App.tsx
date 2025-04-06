import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Navigation } from './src/navigation';
import { UserDataProvider } from './src/context/UserDataContext';
import { theme } from './src/theme/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import fixWebCompatibility from './web-build-fix';
import { loadFonts } from './src/theme/fonts';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = loadFonts();
  
  // Apply web compatibility fixes and load resources
  useEffect(() => {
    async function prepare() {
      try {
        // Apply web fixes
        if (Platform.OS === 'web') {
          fixWebCompatibility();
        }
        
        // Artificially delay for a smoother experience
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);
  
  // Handle loading complete
  useEffect(() => {
    if (appIsReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Fitness Profile App...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PaperProvider theme={{ ...MD3LightTheme, colors: theme.colors }}>
          <UserDataProvider>
            <StatusBar style="light" backgroundColor="transparent" translucent />
            <View style={styles.appContainer}>
              <Navigation />
            </View>
          </UserDataProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
    // Web-specific styling is handled in web-build-fix.js
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.primary,
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'Roboto',
    fontWeight: '500',
  },
});
