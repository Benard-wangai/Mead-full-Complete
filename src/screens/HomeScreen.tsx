// src/screens/HomeScreen.tsx
// Home Screen for Mead - The Global Luxury Super App
// Luxury dashboard with personalized greeting, quick actions, and trending content

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, shadows } from '../utils/theme';
import Card from '../components/Card';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [userName] = useState('Luxury Member');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const quickActions = [
    {
      id: 'brew',
      title: 'Create Brew',
      icon: 'earth-outline' as const,
      color: '#FFD700',
      onPress: () => navigation.navigate('BrewCreate'),
    },
    {
      id: 'live',
      title: 'Go Live',
      icon: 'radio-outline' as const,
      color: '#FF3B30',
      onPress: () => navigation.navigate('Live'),
    },
    {
      id: 'reel',
      title: 'Create Reel',
      icon: 'videocam-outline' as const,
      color: '#00C853',
      onPress: () => navigation.navigate('Reels'),
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      icon: 'cart-outline' as const,
      color: '#FFD700',
      onPress: () => navigation.navigate('Marketplace'),
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.black }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: '#FFFFFF' }]}>
            {greeting},
          </Text>
          <Text style={[styles.userName, { color: colors.gold }]}>
            {userName}
          </Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <View style={styles.notificationContainer}>
            <Ionicons name="notifications-outline" size={28} color="#FFFFFF" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Luxury Banner */}
      <LinearGradient
        colors={['#1A1400', '#2D2200', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.banner, shadows.goldGlow]}
      >
        <Text style={styles.bannerTitle}>Welcome to Mead</Text>
        <Text style={styles.bannerSubtitle}>
          The World`s Most Luxurious Social Experience
        </Text>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={action.onPress}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: action.color + '22' }]}>
                <Ionicons name={action.icon} size={32} color={action.color} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Trending Reels */}
      <View style={styles.trendingSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>Trending Reels</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Reels')}>
            <Text style={[styles.seeAll, { color: colors.gold }]}>See All →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3].map((i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.trendingCard}
              onPress={() => navigation.navigate('Reels')}
            >
              <Image 
                source={{ uri: `https://picsum.photos/id/${60 + i}/300/400` }} 
                style={styles.trendingImage} 
              />
              <View style={styles.trendingOverlay}>
                <Text style={styles.trendingText}>Luxury Moments</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Discover More */}
      <View style={styles.exploreSection}>
        <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>Discover More</Text>
        
        <Card style={styles.exploreCard}>
          <TouchableOpacity 
            style={styles.exploreItem}
            onPress={() => navigation.navigate('Marketplace')}
          >
            <Ionicons name="cart" size={28} color={colors.gold} />
            <Text style={styles.exploreItemText}>Marketplace</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.exploreItem}
            onPress={() => navigation.navigate('MeadAI')}
          >
            <Ionicons name="sparkles" size={28} color={colors.gold} />
            <Text style={styles.exploreItemText}>Talk to Mead AI</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 18,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  banner: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFD70044',
    overflow: 'hidden',
  },
  bannerTitle: {
    color: '#FFD700',
    fontSize: 26,
    fontFamily: 'Imperial-Bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  bannerSubtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    lineHeight: 24,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  trendingSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 16,
    fontWeight: '600',
  },
  trendingCard: {
    width: width * 0.7,
    height: 220,
    marginLeft: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 16,
  },
  trendingText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  exploreSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  exploreCard: {
    padding: 4,
  },
  exploreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  exploreItemText: {
    color: '#FFFFFF',
    fontSize: 17,
    marginLeft: 16,
  },
});

export default HomeScreen;