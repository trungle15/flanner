import React, { useEffect, useRef } from 'react';
import { StyleSheet, ViewStyle, TextStyle, Animated, Easing } from 'react-native';
import * as Animatable from 'react-native-animatable';

// Predefined animations for consistent use throughout the app
export const animations = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeInUp: {
    from: { opacity: 0, translateY: 20 },
    to: { opacity: 1, translateY: 0 },
  },
  fadeInDown: {
    from: { opacity: 0, translateY: -20 },
    to: { opacity: 1, translateY: 0 },
  },
  zoomIn: {
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1 },
  },
  slideInRight: {
    from: { translateX: 100 },
    to: { translateX: 0 },
  },
  slideInLeft: {
    from: { translateX: -100 },
    to: { translateX: 0 },
  },
  pulse: {
    0: { scale: 1 },
    0.5: { scale: 1.05 },
    1: { scale: 1 },
  },
};

// Staggered animation for lists
export const staggeredFadeInUp = (index: number, duration = 500, delay = 100) => ({
  animation: 'fadeInUp',
  duration,
  delay: index * delay,
});

// Animated components with default animations
export const AnimatedView = Animatable.View;
export const AnimatedText = Animatable.Text;
export const AnimatedImage = Animatable.Image;

// Pulsing component for attention-grabbing elements
export const PulseView: React.FC<{
  style?: ViewStyle;
  children: React.ReactNode;
  intensity?: number;
  duration?: number;
}> = ({ style, children, intensity = 1.05, duration = 1500 }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: intensity,
        duration: duration / 2,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();

    return () => {
      scaleAnim.stopAnimation();
    };
  }, [scaleAnim, intensity, duration]);

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      {children}
    </Animated.View>
  );
};

// Shimmer effect for loading states
export const ShimmerView: React.FC<{
  style?: ViewStyle;
  width?: number | `${number}%`;
  height?: number;
}> = ({ style, width = 100, height = 80 }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    shimmer.start();

    return () => {
      shimmerAnim.stopAnimation();
    };
  }, [shimmerAnim]);

  const shimmerInterpolation = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-100%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.shimmerContainer,
        style,
        { width: typeof width === 'number' ? width : width, height },
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX: shimmerInterpolation }],
          },
        ]}
      />
    </Animated.View>
  );
};

// Progress bar with animation
export const AnimatedProgressBar: React.FC<{
  progress: number;
  style?: ViewStyle;
  barColor?: string;
  backgroundColor?: string;
  height?: number;
}> = ({ progress, style, barColor = '#2196F3', backgroundColor = '#E0E0E0', height = 8 }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.progressContainer, { height, backgroundColor }, style]}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            width,
            backgroundColor: barColor,
            height,
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shimmerContainer: {
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  progressContainer: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});
