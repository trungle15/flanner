import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, Dimensions, TouchableOpacity, FlatList, Image } from 'react-native';
import { theme } from '../theme/theme';
import { useUserData } from '../context/UserDataContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Chip, Button, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { getFontFamily } from '../theme/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MealPlanScreen = () => {
  const { userData } = useUserData();
  const [activeDay, setActiveDay] = useState('Today');
  const [activeMealTime, setActiveMealTime] = useState('Breakfast');
  const scrollViewRef = useRef<ScrollView>(null);

  // Sample meal data
  const mealData = {
    Breakfast: [
      {
        id: 'b1',
        name: 'Protein Oatmeal Bowl',
        location: 'Main Dining Hall',
        // image: require('../../assets/breakfast1.png'),
        calories: 350,
        protein: 15,
        carbs: 45,
        fat: 10,
        tags: ['High Protein', 'Vegetarian'],
        ingredients: ['Oats', 'Milk', 'Protein powder', 'Berries', 'Nuts']
      },
      {
        id: 'b2',
        name: 'Avocado Toast with Eggs',
        location: 'North Campus Dining',
        // image: require('../../assets/breakfast2.png'),
        calories: 420,
        protein: 18,
        carbs: 35,
        fat: 22,
        tags: ['High Protein', 'Vegetarian'],
        ingredients: ['Whole grain bread', 'Avocado', 'Eggs', 'Cherry tomatoes', 'Microgreens']
      },
      {
        id: 'b3',
        name: 'Greek Yogurt Parfait',
        location: 'East Campus Dining',
        // image: require('../../assets/breakfast3.png'),
        calories: 280,
        protein: 20,
        carbs: 30,
        fat: 8,
        tags: ['Low Fat', 'Vegetarian'],
        ingredients: ['Greek yogurt', 'Granola', 'Honey', 'Mixed berries', 'Chia seeds']
      }
    ],
    Lunch: [
      {
        id: 'l1',
        name: 'Grilled Chicken Salad',
        location: 'Main Dining Hall',
        // image: require('../../assets/lunch1.png'),
        calories: 380,
        protein: 28,
        carbs: 20,
        fat: 18,
        tags: ['High Protein', 'Low Carb'],
        ingredients: ['Grilled chicken', 'Mixed greens', 'Cherry tomatoes', 'Cucumber', 'Olive oil dressing']
      },
      {
        id: 'l2',
        name: 'Quinoa Bowl with Roasted Vegetables',
        location: 'West Campus Dining',
        // image: require('../../assets/lunch2.png'),
        calories: 420,
        protein: 12,
        carbs: 65,
        fat: 14,
        tags: ['Vegan', 'High Fiber'],
        ingredients: ['Quinoa', 'Roasted sweet potato', 'Broccoli', 'Chickpeas', 'Tahini dressing']
      },
      {
        id: 'l3',
        name: 'Turkey and Avocado Wrap',
        location: 'South Campus Dining',
        // image: require('../../assets/lunch3.png'),
        calories: 450,
        protein: 25,
        carbs: 40,
        fat: 20,
        tags: ['High Protein', 'Balanced'],
        ingredients: ['Whole wheat wrap', 'Turkey breast', 'Avocado', 'Lettuce', 'Tomato']
      }
    ],
    Dinner: [
      {
        id: 'd1',
        name: 'Grilled Salmon with Vegetables',
        location: 'Main Dining Hall',
        // image: require('../../assets/dinner1.png'),
        calories: 480,
        protein: 32,
        carbs: 25,
        fat: 24,
        tags: ['High Protein', 'Omega-3'],
        ingredients: ['Salmon fillet', 'Asparagus', 'Brown rice', 'Lemon', 'Olive oil']
      },
      {
        id: 'd2',
        name: 'Vegetable Stir Fry with Tofu',
        location: 'East Campus Dining',
        // image: require('../../assets/dinner2.png'),
        calories: 380,
        protein: 18,
        carbs: 45,
        fat: 12,
        tags: ['Vegetarian', 'High Fiber'],
        ingredients: ['Tofu', 'Mixed vegetables', 'Brown rice', 'Soy sauce', 'Ginger']
      },
      {
        id: 'd3',
        name: 'Lean Beef Chili',
        location: 'North Campus Dining',
        // image: require('../../assets/dinner3.png'),
        calories: 420,
        protein: 30,
        carbs: 35,
        fat: 15,
        tags: ['High Protein', 'High Fiber'],
        ingredients: ['Lean ground beef', 'Kidney beans', 'Tomatoes', 'Bell peppers', 'Onions']
      }
    ]
  };

  const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  const mealTimes = ['Breakfast', 'Lunch', 'Dinner'];

  const handleMealTimeChange = (mealTime: string) => {
    setActiveMealTime(mealTime);
    // Scroll to the selected meal time
    const index = mealTimes.indexOf(mealTime);
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (index >= 0 && index < mealTimes.length) {
      setActiveMealTime(mealTimes[index]);
    }
  };

  const renderMealItem = ({ item }: any) => (
    <Card style={styles.mealCard}>
      {/* <Card.Cover source={item.image} style={styles.mealImage} /> */}
      <Card.Content>
        <Text style={styles.mealName}>{item.name}</Text>
        <Text style={styles.mealLocation}>{item.location}</Text>
        
        <View style={styles.nutritionContainer}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{item.calories}</Text>
            <Text style={styles.nutritionLabel}>calories</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{item.protein}g</Text>
            <Text style={styles.nutritionLabel}>protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{item.carbs}g</Text>
            <Text style={styles.nutritionLabel}>carbs</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{item.fat}g</Text>
            <Text style={styles.nutritionLabel}>fat</Text>
          </View>
        </View>
        
        <View style={styles.tagsContainer}>
          {item.tags.map((tag: string, index: number) => (
            <Chip key={index} style={styles.tagChip} textStyle={styles.tagChipText}>
              {tag}
            </Chip>
          ))}
        </View>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button mode="contained" style={styles.selectButton}>Select Meal</Button>
        <IconButton 
          icon="heart-outline" 
          size={24} 
          iconColor={theme.colors.primary}
          style={styles.favoriteButton}
        />
      </Card.Actions>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Daily Meal Plan</Text>
      </View>
      
      <View style={styles.daySelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {days.map((day, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.dayItem, activeDay === day && styles.activeDayItem]}
              onPress={() => setActiveDay(day)}
            >
              <Text style={[styles.dayText, activeDay === day && styles.activeDayText]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.mealTimeSelector}>
        {mealTimes.map((mealTime, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.mealTimeItem, activeMealTime === mealTime && styles.activeMealTimeItem]}
            onPress={() => handleMealTimeChange(mealTime)}
          >
            <Text style={[styles.mealTimeText, activeMealTime === mealTime && styles.activeMealTimeText]}>
              {mealTime}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.mealScrollView}
      >
        {mealTimes.map((mealTime, index) => (
          <View key={index} style={[styles.mealTimeSection, { width: SCREEN_WIDTH }]}>
            <FlatList
              data={mealData[mealTime as keyof typeof mealData]}
              renderItem={renderMealItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.mealList}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
  },
  screenTitle: {
    fontSize: 22,
    fontFamily: getFontFamily('semiBold', 'heading'),
    color: theme.colors.primary,
  },
  daySelector: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
  },
  dayItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceVariant,
  },
  activeDayItem: {
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    fontSize: 14,
    fontFamily: getFontFamily('medium', 'body'),
    color: theme.colors.textSecondary,
  },
  activeDayText: {
    color: theme.colors.textInverse,
  },
  mealTimeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
  },
  mealTimeItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeMealTimeItem: {
    backgroundColor: theme.colors.primaryLight,
  },
  mealTimeText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium', 'body'),
    color: theme.colors.textSecondary,
  },
  activeMealTimeText: {
    color: theme.colors.primary,
    fontFamily: getFontFamily('semiBold', 'body'),
  },
  mealScrollView: {
    flex: 1,
  },
  mealTimeSection: {
    flex: 1,
  },
  mealList: {
    padding: 16,
    paddingBottom: 24,
  },
  mealCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  mealImage: {
    height: 160,
  },
  mealName: {
    fontSize: 18,
    fontFamily: getFontFamily('semiBold', 'heading'),
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  mealLocation: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontFamily: getFontFamily('bold', 'heading'),
    color: theme.colors.text,
  },
  nutritionLabel: {
    fontSize: 12,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: theme.colors.primaryLight,
    marginRight: 8,
    marginBottom: 8,
  },
  tagChipText: {
    color: theme.colors.primary,
    fontSize: 12,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  selectButton: {
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    margin: 0,
  },
});

export default MealPlanScreen;
