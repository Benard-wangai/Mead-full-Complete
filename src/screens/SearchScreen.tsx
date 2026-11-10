/* eslint-disable no-undef */
// src/screens/SearchScreen.tsx
// Global Search Screen for Mead - The Global Luxury Super App
// Unified search across Users, Groups, Marketplace, Brews, Music, Movies, and more

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { tap } from '../utils/haptics';
import { meadLogger } from '../utils/logger';

interface SearchResult {
  id: string;
  type: 'user' | 'group' | 'product' | 'brew' | 'music' | 'movie';
  title: string;
  subtitle: string;
  image?: any;
  verified?: boolean;
}

const SearchScreen = () => {
  const { colors } = useTheme();

  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sample data for demo (in real app this would come from Supabase)
  const allData: SearchResult[] = [
    { id: 'u1', type: 'user', title: 'Aisha Khan', subtitle: '@aishakhan • Luxury Entrepreneur', image: require('../assets/default-avatar.png'), verified: true },
    { id: 'g1', type: 'group', title: 'Luxury Kenya Entrepreneurs', subtitle: '12,450 members', image: require('../assets/entertainment/group1.jpg'), verified: true },
    { id: 'p1', type: 'product', title: 'Gold-Plated Luxury Watch', subtitle: 'KES 1,250 • Elite Timepieces', image: require('../assets/products/watch.jpg') },
    { id: 'b1', type: 'brew', title: 'Why Kenya Needs More Luxury Brands', subtitle: 'Posted by LuxuryKenya • 2.3K views', image: require('../assets/entertainment/brew1.jpg') },
    { id: 'm1', type: 'music', title: 'Midnight in Nairobi', subtitle: 'Sauti Sol', image: require('../assets/entertainment/music1.jpg') },
    { id: 'mov1', type: 'movie', title: 'Empire of Gold', subtitle: 'Drama • 2025', image: require('../assets/entertainment/movie1.jpg') },
  ];

  // Live search
  useEffect(() => {
    if (searchText.length === 0) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    const filtered = allData.filter(item =>
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchText.toLowerCase())
    );

    // Simulate search delay
    const timer = setTimeout(() => {
      setResults(filtered);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  const openResult = (item: SearchResult) => {
    tap();
    meadLogger.info('Search result opened', { type: item.type, title: item.title });

    if (item.type === 'user') {
      Alert.alert('User Profile', `Opening profile of ${item.title}`);
    } else if (item.type === 'group') {
      Alert.alert('Group', `Opening ${item.title}`);
    } else if (item.type === 'product') {
      Alert.alert('Marketplace', `Opening listing: ${item.title}`);
    } else if (item.type === 'brew') {
      Alert.alert('Brew', `Opening geo-targeted Brew`);
    } else if (item.type === 'music') {
      Alert.alert('Music', `Playing ${item.title}`);
    } else if (item.type === 'movie') {
      Alert.alert('Movies & TV', `Opening ${item.title}`);
    }
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.resultCard} onPress={() => openResult(item)}>
      <View style={styles.resultImageContainer}>
        {item.image ? (
          <Image source={item.image} style={styles.resultImage} />
        ) : (
          <View style={styles.defaultIcon}>
            <Ionicons name="search" size={28} color={colors.gold} />
          </View>
        )}
      </View>

      <View style={styles.resultInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.resultTitle}>{item.title}</Text>
          {item.verified && (
            <Ionicons name="checkmark-circle" size={16} color={colors.gold} style={styles.verifiedIcon} />
          )}
        </View>
        <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      {/* Search Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users, groups, products, music..."
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={22} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchText.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={80} color="#444" />
          <Text style={styles.emptyTitle}>Search Mead</Text>
          <Text style={styles.emptySubtitle}>
            Find people, groups, products, Brews, music, movies and more
          </Text>
        </View>
      ) : isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderResult}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
        />
      ) : (
        <View style={styles.noResults}>
          <Ionicons name="search-outline" size={60} color="#555" />
          <Text style={styles.noResultsText}>No results found for &quot;{searchText}&quot;</Text>
          <Text style={styles.noResultsSub}>Try different keywords</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: { marginRight: 12 },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFD700',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#AAAAAA',
    marginTop: 16,
    fontSize: 16,
  },
  resultsList: {
    padding: 20,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  resultImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  defaultIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  verifiedIcon: { marginLeft: 8 },
  resultSubtitle: {
    fontSize: 15,
    color: '#AAAAAA',
    marginTop: 4,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noResultsText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFD700',
    marginTop: 24,
    textAlign: 'center',
  },
  noResultsSub: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default SearchScreen;