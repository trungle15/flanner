import { DefaultTheme } from 'react-native-paper';
import { Platform } from 'react-native';

// Define font configuration compatible with React Native Paper
const fontConfig = {
  fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    bold: '700',
  },
  letterSpacing: {
    normal: 0,
  },
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
  '3xl': 48,
};

// Dark mode color palette with a fitness focus
export const theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    // Primary brand colors
    primary: '#60A5FA', // Bright blue that pops in dark mode
    primaryDark: '#3B82F6', // Medium blue for depth
    primaryLight: '#93C5FD', // Light blue for accents
    
    // Gradient variations
    primaryGradientStart: '#60A5FA', // Bright blue start
    primaryGradientEnd: '#2563EB', // Deeper blue end
    secondaryGradientStart: '#38BDF8', // Bright cyan start
    secondaryGradientEnd: '#0284C7', // Deep cyan end
    accentGradientStart: '#F472B6', // Pink start
    accentGradientEnd: '#DB2777', // Deep pink end
    
    // Core UI colors
    secondary: '#38BDF8', // Bright cyan
    accent: '#F472B6', // Pink for accents and CTAs
    surface: '#1E293B', // Dark blue-gray for surfaces
    surfaceVariant: '#334155', // Slightly lighter blue-gray for card backgrounds
    background: '#0F172A', // Very dark blue background
    
    // Text colors
    text: '#F1F5F9', // Very light gray for primary text
    textSecondary: '#CBD5E1', // Light gray for secondary text
    textLight: '#94A3B8', // Medium gray for tertiary text
    textInverse: '#1E293B', // Dark text for light backgrounds
    
    // Utility colors
    border: '#334155',
    divider: '#475569',
    card: '#1E293B',
    cardAlt: '#334155',
    
    // Feedback colors
    success: '#10B981', // Green
    error: '#EF4444', // Red
    warning: '#F59E0B', // Amber
    info: '#3B82F6', // Blue
    
    // System colors
    disabled: '#94A3B8',
    placeholder: '#E2E8F0',
    highlight: '#1E40AF',
    notification: '#EC4899',
    scrim: 'rgba(15, 23, 42, 0.8)',
    backdrop: 'rgba(15, 23, 42, 0.6)',
    
    // Fitness specific colors
    energy: '#FBBF24', // Yellow/gold for energy metrics
    calories: '#F97316', // Orange for calorie metrics
    protein: '#A855F7', // Purple for protein metrics
    hydration: '#0EA5E9', // Blue for water/hydration
    sleep: '#8B5CF6', // Purple for sleep metrics
    steps: '#10B981', // Green for step counts
  },
  spacing,
  roundness: 16,
  animation: {
    scale: 1.0,
    defaultDuration: 250,
    defaultEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  fonts: {
    ...DefaultTheme.fonts,
    // Using San Francisco font (System font on iOS, Roboto on Android)
    bodyLarge: {
      ...DefaultTheme.fonts.bodyLarge,
      fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'Roboto',
      fontWeight: 'normal',
    },
    bodyMedium: {
      ...DefaultTheme.fonts.bodyMedium,
      fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'Roboto',
      fontWeight: 'normal',
    },
    bodySmall: {
      ...DefaultTheme.fonts.bodySmall,
      fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'Roboto',
      fontWeight: 'normal',
    },
    labelLarge: {
      ...DefaultTheme.fonts.labelLarge,
      fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'Roboto',
      fontWeight: 'bold',
    },
    labelMedium: {
      ...DefaultTheme.fonts.labelMedium,
      fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'Roboto',
      fontWeight: 'bold',
    },
    labelSmall: {
      ...DefaultTheme.fonts.labelSmall,
      fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'Roboto',
      fontWeight: 'bold',
    },
    titleLarge: {
      ...DefaultTheme.fonts.titleLarge,
      fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'Roboto',
      fontWeight: 'bold',
    },
    titleMedium: {
      ...DefaultTheme.fonts.titleMedium,
      fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'Roboto',
      fontWeight: 'bold',
    },
    titleSmall: {
      ...DefaultTheme.fonts.titleSmall,
      fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'Roboto',
      fontWeight: 'bold',
    },
    headlineLarge: {
      ...DefaultTheme.fonts.headlineLarge,
      fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'Roboto',
      fontWeight: 'bold',
    },
    headlineMedium: {
      ...DefaultTheme.fonts.headlineMedium,
      fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'Roboto',
      fontWeight: 'bold',
    },
    headlineSmall: {
      ...DefaultTheme.fonts.headlineSmall,
      fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'Roboto',
      fontWeight: 'bold',
    },
  },
  // iOS specific shadow properties
  ios: {
    shadow: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3.0,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 5.0,
      },
    },
  },
};

export type AppTheme = typeof theme;
