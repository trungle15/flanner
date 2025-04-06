import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Image, ScrollView, TouchableOpacity, Animated, Easing, Platform, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { theme } from '../theme/theme';
import { useUserData } from '../context/UserDataContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, IconButton, Avatar, Button, Chip, ProgressBar as PaperProgressBar } from 'react-native-paper';
import FormButton from '../components/FormButton';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedView, AnimatedText, PulseView, AnimatedProgressBar } from '../animations/AnimatedComponents';
import { getFontFamily } from '../theme/fonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

const LandingScreen = ({ navigation }: Props) => {
  const { userData } = useUserData();
  const scrollY = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerHeight = useRef(new Animated.Value(SCREEN_HEIGHT * 0.28)).current;
  
  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
    
    // Start Lottie animation
    if (lottieRef.current) {
      setTimeout(() => {
        lottieRef.current?.play();
      }, 300);
    }
  }, [fadeAnim, scaleAnim]);
  
  // Animated header interactions
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );
  
  useEffect(() => {
    // Set up scroll listener for header animation
    const listenerId = scrollY.addListener(({ value }) => {
      const newHeight = Math.max(
        SCREEN_HEIGHT * 0.15, 
        SCREEN_HEIGHT * 0.28 - value
      );
      headerHeight.setValue(newHeight);
    });
    
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, []);
  
  // Calculate BMI if we have the data
  const calculateBMI = () => {
    if (!userData.currentWeight || (!userData.heightCm && (!userData.heightFeet || !userData.heightInches))) {
      return null;
    }
    
    let heightInMeters;
    if (userData.heightCm) {
      heightInMeters = parseFloat(userData.heightCm) / 100;
    } else {
      const totalInches = (parseFloat(userData.heightFeet) * 12) + parseFloat(userData.heightInches);
      heightInMeters = totalInches * 0.0254;
    }
    
    const weightInKg = userData.currentWeightUnit === 'kg' 
      ? parseFloat(userData.currentWeight) 
      : parseFloat(userData.currentWeight) * 0.453592;
    
    if (isNaN(weightInKg) || isNaN(heightInMeters) || heightInMeters === 0) {
      return null;
    }
    
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
  };
  
  // Calculate progress towards goal weight
  const calculateWeightProgress = () => {
    if (!userData.currentWeight || !userData.goalWeight) return null;
    
    const current = parseFloat(userData.currentWeight);
    const goal = parseFloat(userData.goalWeight);
    
    if (isNaN(current) || isNaN(goal)) return null;
    
    // If goal is less than current (weight loss goal)
    if (goal < current) {
      // Assume starting weight was 20% higher than current for demo purposes
      const startWeight = current * 1.2;
      return 1 - ((current - goal) / (startWeight - goal));
    } else if (goal > current) {
      // Weight gain goal - assume starting weight was 20% lower
      const startWeight = current * 0.8;
      return (current - startWeight) / (goal - startWeight);
    }
    
    return 1; // Goal reached
  };
  
  const bmi = calculateBMI();
  const weightProgress = calculateWeightProgress();
  
  const getBMICategoryColor = (category: string): string => {
    switch (category) {
      case 'Underweight':
        return theme.colors.info; // Blue
      case 'Normal':
        return theme.colors.success; // Green
      case 'Overweight':
        return theme.colors.warning; // Amber
      case 'Obese':
        return theme.colors.error; // Red
      default:
        return theme.colors.textSecondary;
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: getBMICategoryColor('Underweight') };
    if (bmi < 25) return { category: 'Normal', color: getBMICategoryColor('Normal') };
    if (bmi < 30) return { category: 'Overweight', color: getBMICategoryColor('Overweight') };
    return { category: 'Obese', color: getBMICategoryColor('Obese') };
  };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Create animated header styles based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp',
  });
  
  const nameScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });
  
  const contentTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header with Running Animation */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={[
            theme.colors.primaryGradientStart,
            theme.colors.primaryGradientEnd,
          ]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View 
            style={[styles.headerContent, { opacity: headerOpacity }]}
          >
            {Platform.OS !== 'web' ? (
              <LottieView
                ref={lottieRef}
                source={require('../animations/running-animation.json')}
                style={styles.headerAnimation}
                autoPlay
                loop
              />
            ) : (
              <Animatable.Image 
                source={{uri: 'https://cdn-icons-png.flaticon.com/512/2936/2936886.png'}}
                style={styles.headerAnimation}
                animation="pulse"
                iterationCount="infinite"
                duration={3000}
              />
            )}
          </Animated.View>
          
          <Animated.View style={[styles.profileSection, { transform: [{ scale: nameScale }] }]}>
            <View>
              <AnimatedText 
                animation="fadeInLeft" 
                duration={800} 
                delay={300}
                style={styles.greeting}
              >
                {getGreeting()},
              </AnimatedText>
              <AnimatedText 
                animation="fadeInLeft" 
                duration={800} 
                delay={400}
                style={styles.userName}
              >
                {userData.name || 'KU Student'}
              </AnimatedText>
            </View>
            
            <PulseView style={styles.profileImageContainer} intensity={1.03} duration={3000}>
              <Avatar.Icon 
                size={50}
                icon="account"
                style={styles.profileImage}
                color={theme.colors.textInverse}
              />
            </PulseView>
          </Animated.View>
          
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'todaysMeal' && styles.activeTab]}
              onPress={() => setActiveTab('todaysMeal')}
            >
              <Text style={[styles.tabText, activeTab === 'todaysMeal' && styles.activeTabText]}>Today's Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'diningHalls' && styles.activeTab]}
              onPress={() => setActiveTab('diningHalls')}
            >
              <Text style={[styles.tabText, activeTab === 'diningHalls' && styles.activeTabText]}>Dining Halls</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Main Content */}
      <Animated.ScrollView 
        contentContainerStyle={[styles.scrollContent, { transform: [{ translateY: contentTranslateY }] }]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View style={styles.statsContainer}>
          {/* Weight Card */}
          <AnimatedView 
            animation="fadeInUp" 
            duration={800} 
            delay={300}
            style={styles.cardWrapper}
          >
            <Card style={styles.card} mode="elevated">
              <Card.Title 
                title="Weight" 
                titleStyle={styles.cardTitle}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="weight"
                    iconColor={theme.colors.primary}
                    onPress={() => {}}
                  />
                )}
              />
              <Card.Content>
                <View style={styles.weightContainer}>
                  <Text style={styles.currentWeight}>
                    {userData.currentWeight ? `${userData.currentWeight} ${userData.currentWeightUnit}` : 'Not set'}
                  </Text>
                  <Text style={styles.goalWeight}>
                    Goal: {userData.goalWeight ? `${userData.goalWeight} ${userData.goalWeightUnit}` : 'Not set'}
                  </Text>
                </View>
                
                {weightProgress !== null && (
                  <View style={styles.progressContainer}>
                    <LinearGradient
                      colors={[theme.colors.secondary, theme.colors.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBar, { width: `${weightProgress * 100}%` }]}
                    />
                    <Text style={styles.progressText}>
                      {Math.round(weightProgress * 100)}% to goal
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </AnimatedView>
          
          {/* BMI Card */}
          <AnimatedView 
            animation="fadeInUp" 
            duration={800} 
            delay={400}
            style={styles.cardWrapper}
          >
            <Card style={styles.card} mode="elevated">
              <Card.Title 
                title="BMI" 
                titleStyle={styles.cardTitle}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="chart-bar"
                    iconColor={theme.colors.primary}
                    onPress={() => {}}
                  />
                )}
              />
              <Card.Content>
                {bmi ? (
                  <>
                    <PulseView style={styles.bmiContainer} intensity={1.02} duration={3000}>
                      <Text style={styles.bmiValue}>{bmi}</Text>
                      <Text style={[styles.bmiCategory, { color: getBMICategory(parseFloat(bmi)).color }]}>
                        {getBMICategory(parseFloat(bmi)).category}
                      </Text>
                    </PulseView>
                  </>
                ) : (
                  <Text style={styles.noDataText}>Complete your profile to see BMI</Text>
                )}
              </Card.Content>
            </Card>
          </AnimatedView>
          
          {/* Fitness Goals Card */}
          <AnimatedView 
            animation="fadeInUp" 
            duration={800} 
            delay={500}
            style={styles.cardWrapper}
          >
            <Card style={styles.card} mode="elevated">
              <Card.Title 
                title="Fitness Goal" 
                titleStyle={styles.cardTitle}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="target"
                    iconColor={theme.colors.primary}
                    onPress={() => {}}
                  />
                )}
              />
              <Card.Content>
                <Text style={styles.goalText}>
                  {userData.mainGoal || 'Not set'}
                </Text>
                <Text style={styles.activityText}>
                  Activity level: {userData.activityLevel || 'Not set'}
                </Text>
                <Text style={styles.workoutText}>
                  Workout frequency: {userData.workoutFrequency || 'Not set'}
                </Text>
              </Card.Content>
            </Card>
          </AnimatedView>
          
          {/* Diet Preferences Card */}
          <AnimatedView 
            animation="fadeInUp" 
            duration={800} 
            delay={600}
            style={styles.cardWrapper}
          >
            <Card style={styles.card} mode="elevated">
              <Card.Title 
                title="Diet Preferences" 
                titleStyle={styles.cardTitle}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="food-apple"
                    iconColor={theme.colors.primary}
                    onPress={() => {}}
                  />
                )}
              />
              <Card.Content>
                {userData.dietTypes && userData.dietTypes.length > 0 ? (
                  <View style={styles.dietTypesContainer}>
                    {userData.dietTypes.map((diet, index) => (
                      <Animatable.View 
                        key={index} 
                        style={styles.dietTag}
                        animation="zoomIn"
                        duration={500}
                        delay={700 + (index * 100)}
                      >
                        <Text style={styles.dietTagText}>{diet}</Text>
                      </Animatable.View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noDataText}>No diet preferences set</Text>
                )}
              </Card.Content>
            </Card>
          </AnimatedView>
        </View>
        
        {/* Action Buttons with animations */}
        {activeTab === 'overview' && (
          <AnimatedView 
            animation="fadeInUp" 
            duration={800} 
            delay={700}
            style={styles.actionButtons}
          >
            <Button
              mode="contained"
              style={styles.actionButton}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.textInverse}
              onPress={() => navigation.navigate('ProfileInfo')}
            >
              Edit Profile
            </Button>
            <Button
              mode="outlined"
              style={styles.actionButton}
              textColor={theme.colors.primary}
              onPress={() => navigation.navigate('MealPlan')}
            >
              Meal Preferences
            </Button>
          </AnimatedView>
        )}
        
        {/* Today's Meal Recommendations */}
        {activeTab === 'todaysMeal' && (
          <View style={styles.statsContainer}>
            <AnimatedView 
              animation="fadeInUp" 
              duration={800} 
              delay={200}
              style={styles.cardWrapper}
            >
              <Card style={styles.card} mode="elevated">
                <Card.Title 
                  title="Today's Recommended Meals" 
                  titleStyle={styles.cardTitle}
                  right={(props) => (
                    <IconButton
                      {...props}
                      icon="food"
                      iconColor={theme.colors.primary}
                      onPress={() => {}}
                    />
                  )}
                />
                <Card.Content>
                  <Text style={styles.mealTimeTitle}>Breakfast</Text>
                  <View style={styles.mealItem}>
                    <Text style={styles.mealName}>Oatmeal with Fresh Fruit</Text>
                    <Text style={styles.mealLocation}>Available at: Mrs. E's Dining Center</Text>
                    <Chip style={styles.mealChip} textStyle={styles.mealChipText}>Healthy Choice</Chip>
                  </View>
                  
                  <Text style={styles.mealTimeTitle}>Lunch</Text>
                  <View style={styles.mealItem}>
                    <Text style={styles.mealName}>Grilled Chicken Sandwich</Text>
                    <Text style={styles.mealLocation}>Available at: The Market</Text>
                    <Chip style={styles.mealChip} textStyle={styles.mealChipText}>Protein Rich</Chip>
                  </View>
                  
                  <Text style={styles.mealTimeTitle}>Dinner</Text>
                  <View style={styles.mealItem}>
                    <Text style={styles.mealName}>Vegetable Stir Fry with Tofu</Text>
                    <Text style={styles.mealLocation}>Available at: South Dining Commons</Text>
                    <Chip style={styles.mealChip} textStyle={styles.mealChipText}>Vegetarian</Chip>
                  </View>
                </Card.Content>
              </Card>
            </AnimatedView>
            
            <AnimatedView 
              animation="fadeInUp" 
              duration={800} 
              delay={300}
              style={styles.cardWrapper}
            >
              <Card style={styles.card} mode="elevated">
                <Card.Title 
                  title="Special Events Today" 
                  titleStyle={styles.cardTitle}
                  right={(props) => (
                    <IconButton
                      {...props}
                      icon="calendar"
                      iconColor={theme.colors.primary}
                      onPress={() => {}}
                    />
                  )}
                />
                <Card.Content>
                  <View style={styles.eventItem}>
                    <Text style={styles.eventTitle}>International Food Festival</Text>
                    <Text style={styles.eventLocation}>Mrs. E's Dining Center</Text>
                    <Text style={styles.eventTime}>5:00 PM - 8:00 PM</Text>
                    <Text style={styles.eventDescription}>Sample cuisines from around the world!</Text>
                  </View>
                </Card.Content>
              </Card>
            </AnimatedView>
          </View>
        )}
        
        {/* KU Dining Halls */}
        {activeTab === 'diningHalls' && (
          <View style={styles.statsContainer}>
            <AnimatedView 
              animation="fadeInUp" 
              duration={800} 
              delay={200}
              style={styles.cardWrapper}
            >
              <Card style={styles.card} mode="elevated">
                <Card.Title 
                  title="Mrs. E's Dining Center" 
                  titleStyle={styles.cardTitle}
                  right={(props) => (
                    <IconButton
                      {...props}
                      icon="silverware-fork-knife"
                      iconColor={theme.colors.primary}
                      onPress={() => {}}
                    />
                  )}
                />
                <Card.Content>
                  <Text style={styles.diningHallLocation}>Lewis Hall</Text>
                  <Text style={styles.diningHallHours}>Hours: 7:00 AM - 7:30 PM</Text>
                  <Text style={styles.diningHallDescription}>All-you-care-to-eat dining facility offering a variety of options.</Text>
                  
                  <Text style={styles.menuSectionTitle}>Today's Highlights:</Text>
                  <View style={styles.menuItemContainer}>
                    <Text style={styles.menuItem}>• Breakfast Burritos</Text>
                    <Text style={styles.menuItem}>• Fresh Salad Bar</Text>
                    <Text style={styles.menuItem}>• Pasta Station</Text>
                    <Text style={styles.menuItem}>• Grilled Chicken</Text>
                  </View>
                </Card.Content>
              </Card>
            </AnimatedView>
            
            <AnimatedView 
              animation="fadeInUp" 
              duration={800} 
              delay={300}
              style={styles.cardWrapper}
            >
              <Card style={styles.card} mode="elevated">
                <Card.Title 
                  title="The Market" 
                  titleStyle={styles.cardTitle}
                  right={(props) => (
                    <IconButton
                      {...props}
                      icon="silverware-fork-knife"
                      iconColor={theme.colors.primary}
                      onPress={() => {}}
                    />
                  )}
                />
                <Card.Content>
                  <Text style={styles.diningHallLocation}>Kansas Union</Text>
                  <Text style={styles.diningHallHours}>Hours: 7:30 AM - 3:00 PM</Text>
                  <Text style={styles.diningHallDescription}>Food court style dining with multiple options.</Text>
                  
                  <Text style={styles.menuSectionTitle}>Today's Highlights:</Text>
                  <View style={styles.menuItemContainer}>
                    <Text style={styles.menuItem}>• Chick-fil-A</Text>
                    <Text style={styles.menuItem}>• Subway</Text>
                    <Text style={styles.menuItem}>• Starbucks Coffee</Text>
                    <Text style={styles.menuItem}>• Grab and Go Options</Text>
                  </View>
                </Card.Content>
              </Card>
            </AnimatedView>
            
            <AnimatedView 
              animation="fadeInUp" 
              duration={800} 
              delay={400}
              style={styles.cardWrapper}
            >
              <Card style={styles.card} mode="elevated">
                <Card.Title 
                  title="South Dining Commons" 
                  titleStyle={styles.cardTitle}
                  right={(props) => (
                    <IconButton
                      {...props}
                      icon="silverware-fork-knife"
                      iconColor={theme.colors.primary}
                      onPress={() => {}}
                    />
                  )}
                />
                <Card.Content>
                  <Text style={styles.diningHallLocation}>Oliver Hall</Text>
                  <Text style={styles.diningHallHours}>Hours: 10:30 AM - 8:00 PM</Text>
                  <Text style={styles.diningHallDescription}>Modern dining facility with diverse food options.</Text>
                  
                  <Text style={styles.menuSectionTitle}>Today's Highlights:</Text>
                  <View style={styles.menuItemContainer}>
                    <Text style={styles.menuItem}>• Build-Your-Own Stir Fry</Text>
                    <Text style={styles.menuItem}>• Pizza Station</Text>
                    <Text style={styles.menuItem}>• Deli Sandwiches</Text>
                    <Text style={styles.menuItem}>• Dessert Bar</Text>
                  </View>
                </Card.Content>
              </Card>
            </AnimatedView>
          </View>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default LandingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingTop: SCREEN_HEIGHT * 0.3, // Add space for the fixed header
  },
  header: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerGradient: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  headerAnimation: {
    width: 120,
    height: 120,
    alignSelf: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 15,
  },
  greeting: {
    color: theme.colors.textInverse,
    fontSize: 16,
    fontFamily: getFontFamily('medium', 'body'),
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  userName: {
    color: theme.colors.textInverse,
    fontSize: 24,
    fontFamily: getFontFamily('bold', 'heading'),
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  profileImageContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.textInverse,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  profileImage: {
    backgroundColor: theme.colors.primaryLight,
  },
  // Tab navigation styles
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 5,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: getFontFamily('medium', 'body'),
    fontSize: 14,
  },
  activeTabText: {
    color: theme.colors.textInverse,
    fontWeight: '600',
  },
  // Card styles
  statsContainer: {
    padding: 15,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  card: {
    borderRadius: theme.roundness,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: getFontFamily('semiBold', 'heading'),
    color: theme.colors.primary,
  },
  weightContainer: {
    marginBottom: 10,
  },
  currentWeight: {
    fontSize: 28,
    fontFamily: getFontFamily('bold', 'heading'),
    color: theme.colors.text,
  },
  goalWeight: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  progressContainer: {
    marginTop: 15,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: getFontFamily('medium', 'body'),
    color: theme.colors.textSecondary,
    marginTop: 5,
    textAlign: 'right',
  },
  bmiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  bmiValue: {
    fontSize: 42,
    fontFamily: getFontFamily('bold', 'heading'),
    color: theme.colors.text,
    textAlign: 'center',
  },
  bmiCategory: {
    fontSize: 16,
    fontFamily: getFontFamily('medium', 'body'),
    textAlign: 'center',
    marginTop: 5,
  },
  goalText: {
    fontSize: 18,
    fontFamily: getFontFamily('semiBold', 'heading'),
    color: theme.colors.text,
    marginBottom: 10,
  },
  activityText: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.textSecondary,
    marginBottom: 5,
  },
  workoutText: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.textSecondary,
  },
  dietTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  dietTag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  dietTagText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontFamily: getFontFamily('medium', 'body'),
  },
  noDataText: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  actionButtons: {
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 12,
  },
  // Meal recommendation styles
  mealTimeTitle: {
    fontSize: 18,
    fontFamily: getFontFamily('semiBold', 'heading'),
    color: theme.colors.primary,
    marginTop: 15,
    marginBottom: 8,
  },
  mealItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
  },
  mealName: {
    fontSize: 16,
    fontFamily: getFontFamily('medium', 'body'),
    color: theme.colors.text,
    marginBottom: 4,
  },
  mealLocation: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  mealChip: {
    backgroundColor: theme.colors.primaryLight,
    alignSelf: 'flex-start',
  },
  mealChipText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontFamily: getFontFamily('medium', 'body'),
  },
  // Event styles
  eventItem: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: getFontFamily('semiBold', 'heading'),
    color: theme.colors.text,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    fontFamily: getFontFamily('medium', 'body'),
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    fontFamily: getFontFamily('medium', 'body'),
    color: theme.colors.secondary,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.text,
  },
  // Dining hall styles
  diningHallLocation: {
    fontSize: 15,
    fontFamily: getFontFamily('medium', 'body'),
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  diningHallHours: {
    fontSize: 14,
    fontFamily: getFontFamily('medium', 'body'),
    color: theme.colors.secondary,
    marginBottom: 8,
  },
  diningHallDescription: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.text,
    marginBottom: 15,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontFamily: getFontFamily('semiBold', 'heading'),
    color: theme.colors.primary,
    marginBottom: 8,
  },
  menuItemContainer: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    padding: 10,
  },
  menuItem: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.text,
    marginBottom: 6,
  },
});
