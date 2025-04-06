import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Image, Animated, Easing, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { theme } from '../theme/theme';
import FormButton from '../components/FormButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedView, AnimatedText, PulseView } from '../animations/AnimatedComponents';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen = ({ navigation }: Props) => {
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const lottieRef = useRef<LottieView>(null);
  
  // Screen dimensions for responsive design
  const { width } = Dimensions.get('window');
  
  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
    
    // Play Lottie animation
    if (lottieRef.current) {
      setTimeout(() => {
        lottieRef.current?.play();
      }, 500);
    }
  }, [fadeAnim, scaleAnim]);
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primaryLight, theme.colors.background]}
        style={styles.gradient}
      >
        <Animated.View 
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          {/* Animated logo */}
          <PulseView style={styles.logoContainer} intensity={1.05} duration={2000}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2936/2936886.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </PulseView>
          
          {/* Animated title */}
          <AnimatedText 
            animation="fadeInDown" 
            duration={1000} 
            delay={300}
            style={styles.title}
          >
            Welcome to FitLife
          </AnimatedText>
          
          <AnimatedText 
            animation="fadeInDown" 
            duration={1000} 
            delay={500}
            style={styles.subtitle}
          >
            Your personalized nutrition and fitness companion
          </AnimatedText>
          
          {/* Animation */}
          <AnimatedView 
            animation="fadeIn" 
            duration={1000} 
            delay={700}
            style={styles.animationContainer}
          >
            <LottieView
              ref={lottieRef}
              source={require('../animations/welcome-animation.json')}
              style={styles.animation}
              loop
              autoPlay
            />
          </AnimatedView>
          
          {/* Info container with staggered animations */}
          <AnimatedView 
            animation="fadeInUp" 
            duration={1000} 
            delay={900}
            style={styles.infoContainer}
          >
            <Text style={styles.infoText}>
              We'll help you create a personalized plan based on your goals, preferences, and lifestyle.
            </Text>
            
            <Text style={styles.infoText}>
              Let's get started by collecting some information about you.
            </Text>
          </AnimatedView>
          
          {/* Animated button */}
          <AnimatedView 
            animation="fadeInUp" 
            duration={1000} 
            delay={1100}
          >
            <FormButton
              title="Get Started"
              onPress={() => navigation.navigate('ProfileInfo')}
              style={styles.button}
            />
          </AnimatedView>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: theme.spacing.l,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  logo: {
    width: 80,
    height: 80,
    tintColor: theme.colors.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  animationContainer: {
    width: '100%',
    height: 150,
    marginBottom: theme.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.roundness * 2,
    marginBottom: theme.spacing.xl,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  infoText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    width: '100%',
    borderRadius: theme.roundness * 2,
    marginTop: theme.spacing.m,
  },
});

export default WelcomeScreen;
