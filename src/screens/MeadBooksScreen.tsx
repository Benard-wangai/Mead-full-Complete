/* eslint-disable no-undef */
// src/screens/MeadBooksScreen.tsx
// Mead Books - Digital Library & Audiobooks for Mead - The Global Luxury Super App
// Fixed: Ionicons name typing + complete styles

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { tap, successTap } from '../utils/haptics';
import MeadWatermark from '../components/MeadWatermark';

const { width } = Dimensions.get('window');

interface Book {
  id: string;
  title: string;
  author: string;
  coverArt: any;
  category: string;
  isDownloaded: boolean;
  progress?: number;
  format: 'ebook' | 'audiobook';
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const MeadBooksScreen = () => {
  const { colors } = useTheme();

  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories: Category[] = [
    { id: '1', name: 'Fiction', icon: 'book', color: '#FFD700' },
    { id: '2', name: 'Business', icon: 'briefcase', color: '#00C853' },
    { id: '3', name: 'Self-Help', icon: 'bulb', color: '#6A0DAD' },
    { id: '4', name: 'Biography', icon: 'person', color: '#FF9800' },
    { id: '5', name: 'Mystery', icon: 'eye', color: '#E91E63' },
  ];

  const sampleBooks: Book[] = [
    {
      id: 'b1',
      title: "The Luxury Code",
      author: "Mead Collective",
      coverArt: require('../assets/books/luxurycode.jpg'),
      category: 'Business',
      isDownloaded: true,
      progress: 65,
      format: 'ebook',
    },
    {
      id: 'b2',
      title: "Empire of the Mind",
      author: "Dr. Amani Kenya",
      coverArt: require('../assets/books/empire.jpg'),
      category: 'Self-Help',
      isDownloaded: false,
      progress: 12,
      format: 'audiobook',
    },
    {
      id: 'b3',
      title: "Shadows of Nairobi",
      author: "Wanjiku Mwangi",
      coverArt: require('../assets/books/shadows.jpg'),
      category: 'Fiction',
      isDownloaded: true,
      progress: 100,
      format: 'ebook',
    },
    {
      id: 'b4',
      title: "The Silent Investor",
      author: "Zuberi Al-Mansour",
      coverArt: require('../assets/books/investor.jpg'),
      category: 'Business',
      isDownloaded: false,
      format: 'audiobook',
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setBooks(sampleBooks);
      setLoading(false);
      meadLogger.info('Mead Books library loaded');
    }, 700);
  }, []);

  const filteredBooks = activeCategory === 'All' 
    ? books 
    : books.filter(book => book.category === activeCategory);

  const handleOpenBook = (book: Book) => {
    tap();
    successTap();
    Alert.alert(
      "Opening Book",
      `${book.title} by ${book.author}\n\n${book.format === 'audiobook' ? '🎧 Audiobook Mode' : '📖 Reading Mode'}`
    );
  };

  const toggleDownload = (book: Book) => {
    tap();
    Alert.alert(
      book.isDownloaded ? "Remove Download" : "Download Book",
      book.isDownloaded 
        ? "Remove from offline library?" 
        : `Download ${book.format === 'audiobook' ? 'audiobook' : 'ebook'} for offline reading?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: book.isDownloaded ? "Remove" : "Download", 
          onPress: () => meadLogger.info(`${book.isDownloaded ? 'Removed' : 'Downloaded'} ${book.title}`) 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.black }]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Opening the Grand Library...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      <View style={styles.header}>
        <Text style={styles.title}>MEAD BOOKS</Text>
        <Text style={styles.subtitle}>Read • Listen • Grow in Luxury</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={22} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search books, authors..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {[{ id: 'All', name: 'All', icon: 'library' }, ...categories].map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              activeCategory === cat.name && styles.categoryChipActive,
            ]}
            onPress={() => {
              tap();
              setActiveCategory(cat.name);
            }}
          >
            <Ionicons 
              name={cat.icon as any} 
              size={20} 
              color={activeCategory === cat.name ? '#000' : colors.gold} 
            />
            <Text style={[
              styles.categoryText,
              activeCategory === cat.name && styles.categoryTextActive,
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Continue Reading</Text>
        
        <FlatList
          data={filteredBooks}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleOpenBook(item)} style={styles.bookCard}>
              <Image source={item.coverArt} style={styles.bookCover} />
              <MeadWatermark style={styles.bookWatermark} size="small" opacity={0.65} />

              {item.progress !== undefined && (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
                </View>
              )}

              <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>

              <TouchableOpacity 
                style={styles.downloadIcon}
                onPress={() => toggleDownload(item)}
              >
                <Ionicons 
                  name={item.isDownloaded ? "cloud-download" : "download-outline"} 
                  size={22} 
                  color={colors.gold} 
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      <MeadWatermark style={styles.floatingWatermark} opacity={0.12} size="large" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 34, fontWeight: '700', color: '#FFD700', letterSpacing: 2 },
  subtitle: { fontSize: 16, color: '#AAAAAA', marginTop: 4 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { 
    flex: 1, 
    color: '#FFFFFF', 
    fontSize: 16 
  },

  categoriesScroll: { paddingVertical: 8, paddingHorizontal: 16 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1F1F1F',
    borderRadius: 30,
    marginRight: 12,
  },
  categoryChipActive: { backgroundColor: '#FFD700' },
  categoryText: { color: '#FFFFFF', fontWeight: '600', marginLeft: 8 },
  categoryTextActive: { color: '#000000' },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },

  horizontalList: { paddingLeft: 20, paddingRight: 8 },
  bookCard: { width: width * 0.38, marginRight: 16, marginBottom: 20 },
  bookCover: { width: '100%', height: 220, borderRadius: 16 },
  bookWatermark: { bottom: 18, right: 14 },
  bookTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginTop: 12, marginBottom: 4 },
  bookAuthor: { fontSize: 14, color: '#888' },
  downloadIcon: { position: 'absolute', top: 12, right: 12 },

  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#333',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
  },

  floatingWatermark: { bottom: 90, right: 30, opacity: 0.1 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFD700', marginTop: 20, fontSize: 17 },
});

export default MeadBooksScreen;