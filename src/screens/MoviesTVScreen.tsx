/* eslint-disable no-undef */
// src/screens/MoviesTVScreen.tsx
// Movies & TV Screen for Mead - The Global Luxury Super App
// Beautiful movie and TV show library with trailers, categories, and premium viewing experience

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { tap } from '../utils/haptics';
import { meadLogger } from '../utils/logger';

const { width } = Dimensions.get('window');

interface ContentItem {
  id: string;
  title: string;
  type: 'movie' | 'tv';
  genre: string;
  image: any;
  rating: number;
  year: number;
  isNew?: boolean;
}

const MoviesTVScreen = () => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'tv'>('all');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const genres = ['All', 'Action', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Sci-Fi'];

  const content: ContentItem[] = [
    {
      id: '1',
      title: 'Empire of Gold',
      type: 'movie',
      genre: 'Drama',
      image: require('../assets/entertainment/movie1.jpg'),
      rating: 8.7,
      year: 2025,
      isNew: true,
    },
    {
      id: '2',
      title: 'Sahara Shadows',
      type: 'movie',
      genre: 'Thriller',
      image: require('../assets/entertainment/movie2.jpg'),
      rating: 8.2,
      year: 2024,
    },
    {
      id: '3',
      title: 'The Last Dynasty',
      type: 'tv',
      genre: 'Drama',
      image: require('../assets/entertainment/movie3.jpg'),
      rating: 9.1,
      year: 2025,
    },
    {
      id: '4',
      title: 'Luxury Heist',
      type: 'movie',
      genre: 'Action',
      image: require('../assets/entertainment/movie4.jpg'),
      rating: 7.9,
      year: 2024,
    },
  ];

  const filteredContent = content.filter(item => {
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'movies' && item.type === 'movie') ||
                      (activeTab === 'tv' && item.type === 'tv');
    
    const matchesGenre = selectedGenre === 'All' || item.genre === selectedGenre;
    
    return matchesTab && matchesGenre;
  });

  const playContent = (item: ContentItem) => {
    tap();
    meadLogger.info('Playing content', { title: item.title, type: item.type });
    
    Alert.alert(
      'Now Playing',
      `${item.title} (${item.year})\n\nPremium streaming in 4K with gold watermark.\n\n(Full video player coming soon)`,
      [{ text: 'OK' }]
    );
  };

  const renderContent = ({ item }: { item: ContentItem }) => (
    <TouchableOpacity 
      style={styles.contentCard} 
      onPress={() => playContent(item)}
    >
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.contentImage} />
        
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>NEW</Text>
          </View>
        )}
      </View>

      <View style={styles.contentInfo}>
        <Text style={styles.contentTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.contentMeta}>
          {item.year} • {item.genre} • ★ {item.rating}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Movies & TV</Text>
        <Text style={styles.headerSubtitle}>Premium Entertainment • Ad-Free</Text>
      </View>

      {/* Genre Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.genreScroll}
        contentContainerStyle={styles.genreContent}
      >
        {genres.map((genre) => (
          <TouchableOpacity
            key={genre}
            style={[
              styles.genreButton,
              selectedGenre === genre && styles.genreButtonActive,
            ]}
            onPress={() => setSelectedGenre(genre)}
          >
            <Text style={[
              styles.genreText,
              selectedGenre === genre && styles.genreTextActive,
            ]}>
              {genre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Tabs: All / Movies / TV */}
      <View style={styles.mainTabs}>
        {(['all', 'movies', 'tv'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.mainTab,
              activeTab === tab && styles.mainTabActive,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.mainTabText,
              activeTab === tab && styles.mainTabTextActive,
            ]}>
              {tab === 'all' ? 'All' : tab === 'movies' ? 'Movies' : 'TV Shows'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content Grid */}
      <FlatList
        data={filteredContent}
        keyExtractor={(item) => item.id}
        renderItem={renderContent}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="film-outline" size={80} color="#444" />
            <Text style={styles.emptyText}>No content found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 20 
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: '#FFD700',
    letterSpacing: 1 
  },
  headerSubtitle: { 
    fontSize: 16, 
    color: '#AAAAAA', 
    marginTop: 6 
  },
  genreScroll: { maxHeight: 50 },
  genreContent: { paddingHorizontal: 20, paddingVertical: 8 },
  genreButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginRight: 10,
  },
  genreButtonActive: {
    backgroundColor: '#FFD700',
  },
  genreText: { color: '#FFFFFF', fontWeight: '600' },
  genreTextActive: { color: '#000000', fontWeight: '700' },
  mainTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mainTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  mainTabActive: {
    borderBottomColor: '#FFD700',
  },
  mainTabText: {
    fontSize: 16,
    color: '#AAAAAA',
    fontWeight: '600',
  },
  mainTabTextActive: {
    color: '#FFD700',
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  contentCard: {
    width: (width - 52) / 2,
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  contentImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  contentInfo: {
    padding: 12,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contentMeta: {
    fontSize: 13,
    color: '#AAAAAA',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
});

export default MoviesTVScreen;