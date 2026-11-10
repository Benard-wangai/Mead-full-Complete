// src/screens/EntertainmentHubScreen.tsx
// Entertainment Hub for Mead - The Global Luxury Super App
// Music, Movies, Books, Podcasts, Audiobooks, Live Events & More

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../utils/theme';
import { useToast } from '../components/Toast';
import Button from '../components/Button';
import Card from '../components/Card';
import MeadWatermark from '../components/MeadWatermark';

const { width } = Dimensions.get('window');

const EntertainmentHubScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const categories = [
    {
      id: 'music',
      title: 'Music',
      subtitle: 'Curated luxury playlists',
      icon: 'musical-notes',
      color: '#FF3B30',
      screen: 'MusicLibrary',
    },
    {
      id: 'movies',
      title: 'Movies',
      subtitle: 'Premium cinema & premieres',
      icon: 'film',
      color: '#FFD700',
      screen: 'MoviesTV',
    },
    {
      id: 'books',
      title: 'Books',
      subtitle: 'Luxury reads & audiobooks',
      icon: 'book',
      color: '#4CAF50',
      screen: 'MeadBooks',
    },
    {
      id: 'podcasts',
      title: 'Podcasts',
      subtitle: 'Thought leaders & stories',
      icon: 'mic',
      color: '#9C27B0',
      screen: 'MeadBooks',
    },
    {
      id: 'audiobooks',
      title: 'Audiobooks',
      subtitle: 'Immersive storytelling',
      icon: 'headset',
      color: '#00BCD4',
      screen: 'MeadBooks',
    },
    {
      id: 'live',
      title: 'Live Events',
      subtitle: 'MeadTogether experiences',
      icon: 'people',
      color: '#FF9800',
      screen: 'MeadTogether',
    },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.black }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Entertainment</Text>
        <Text style={styles.subtitle}>Curated Luxury Experiences</Text>
      </View>

      {/* Hero Banner */}
      <TouchableOpacity 
        style={styles.hero}
        onPress={() => navigation.navigate('MeadTogether')}
      >
        <Image 
          // eslint-disable-next-line no-undef
          source={require('../assets/entertainment/hero-entertainment.jpg')} 
          style={styles.heroImage} 
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroBadge}>EXCLUSIVE</Text>
          <Text style={styles.heroTitle}>Tonight&apos;s Luxury Live</Text>
          <Text style={styles.heroSubtitle}>Private Jazz Night • Monaco</Text>
          <Button 
            title="Join Live Experience" 
            onPress={() => navigation.navigate('MeadTogether')}
            style={styles.heroButton}
          />
        </View>
        <MeadWatermark style={styles.watermark} opacity={0.5} />
      </TouchableOpacity>

      {/* Categories Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discover</Text>
        <View style={styles.grid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => {
                if (category.screen) {
                  navigation.navigate(category.screen);
                } else {
                  showToast(`${category.title} Hub coming soon`, 'info');
                }
              }}
            >
              <View style={[styles.iconCircle, { backgroundColor: category.color + '22' }]}>
                <Ionicons name={category.icon as any} size={32} color={category.color} />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Trending This Week */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending This Week</Text>
        <Card style={styles.trendingCard}>
          <Text style={styles.trendingTitle}>“The Last Empire” - New Audiobook Release</Text>
          <Text style={styles.trendingMeta}>Narrated by Idris Elba • 12h 45m</Text>
          <Button 
            title="Start Listening" 
            onPress={() => navigation.navigate('MeadBooks')}
            style={styles.trendingButton}
          />
        </Card>
      </View>

      <Text style={styles.footer}>More luxury content added daily</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFD700',
  },
  subtitle: {
    fontSize: 17,
    color: '#AAAAAA',
    marginTop: 6,
  },
  hero: {
    height: 240,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 20,
  },
  heroBadge: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '700',
    alignSelf: 'flex-start',
    backgroundColor: '#FFD70022',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    color: '#CCCCCC',
    marginTop: 4,
    fontSize: 16,
  },
  heroButton: {
    marginTop: 16,
  },
  watermark: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 64) / 2,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categorySubtitle: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 4,
  },
  trendingCard: {
    padding: 20,
  },
  trendingTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trendingMeta: {
    color: '#FFD700',
    marginTop: 8,
    marginBottom: 20,
  },
  trendingButton: {
    backgroundColor: '#FFD700',
  },
  footer: {
    textAlign: 'center',
    color: '#555',
    marginBottom: 40,
  },
});

export default EntertainmentHubScreen;