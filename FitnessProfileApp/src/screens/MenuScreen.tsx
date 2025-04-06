import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Card, Avatar, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserData } from '../context/UserDataContext';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { getFontFamily } from '../theme/fonts';
import { useNavigation } from '@react-navigation/native';

const MenuScreen = () => {
  const { userData } = useUserData();
  const navigation = useNavigation();

  const menuItems = [
    {
      title: 'Profile Information',
      icon: 'person-outline',
      screen: 'ProfileInfo',
      description: 'Update your personal details, height, weight, and goals'
    },
    {
      title: 'Fitness Goals',
      icon: 'fitness-outline',
      screen: 'FitnessGoals',
      description: 'Modify your fitness objectives and activity levels'
    },
    {
      title: 'Dietary Preferences',
      icon: 'nutrition-outline',
      screen: 'DietaryPreferences',
      description: 'Update your diet type, restrictions, and food preferences'
    },
    {
      title: 'Meal Plan Settings',
      icon: 'restaurant-outline',
      screen: 'MealPlan',
      description: 'Configure your meal plan options and dining preferences'
    },
    {
      title: 'App Settings',
      icon: 'settings-outline',
      screen: 'Settings',
      description: 'Customize app appearance and notifications'
    },
    {
      title: 'Help & Support',
      icon: 'help-circle-outline',
      screen: 'Help',
      description: 'Get assistance and view tutorials'
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileCardContent}>
            <Avatar.Text 
              size={80} 
              label={(userData.name?.substring(0, 2) || 'U').toUpperCase()} 
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.nameText}>{userData.name || 'User'}</Text>
              <Text style={styles.profileText}>
                {userData.gender || ''} • {userData.age || '--'} years
              </Text>
              <Button 
                mode="contained" 
                compact 
                style={styles.editButton}
                onPress={() => navigation.navigate('ProfileInfo' as never)}
              >
                Edit Profile
              </Button>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Content>
              <Text style={styles.statsTitle}>Current Weight</Text>
              <Text style={styles.statsValue}>
                {userData.currentWeight || '--'} {userData.currentWeightUnit || 'lbs'}
              </Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statsCard}>
            <Card.Content>
              <Text style={styles.statsTitle}>Goal Weight</Text>
              <Text style={styles.statsValue}>
                {userData.goalWeight || '--'} {userData.currentWeightUnit || 'lbs'}
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen as never)}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon as any} size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </View>
              {index < menuItems.length - 1 && <Divider style={styles.divider} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: theme.colors.surface,
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    backgroundColor: theme.colors.primaryLight,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  nameText: {
    fontSize: 20,
    fontFamily: getFontFamily('semiBold', 'heading'),
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileText: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  editButton: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    height: 36,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsCard: {
    width: '48%',
    borderRadius: 12,
    elevation: 1,
    backgroundColor: theme.colors.surface,
  },
  statsTitle: {
    fontSize: 14,
    fontFamily: getFontFamily('medium', 'body'),
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 18,
    fontFamily: getFontFamily('bold', 'heading'),
    color: theme.colors.text,
  },
  menuContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  menuItem: {
    width: '100%',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: getFontFamily('medium', 'heading'),
    color: theme.colors.text,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    fontFamily: getFontFamily('regular', 'body'),
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surfaceVariant,
    marginLeft: 72,
  },
});

export default MenuScreen;
