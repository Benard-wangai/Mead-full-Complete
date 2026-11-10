/* eslint-disable no-undef */
// src/screens/DownloadsScreen.tsx
// Downloads Screen for Mead - The Global Luxury Super App
// Manage all downloaded music, videos, movies, books, and offline content

import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { tap, successTap } from '../utils/haptics';
import { meadLogger } from '../utils/logger';

interface DownloadedItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'music' | 'video' | 'movie' | 'book' | 'audiobook';
  size: string;
  downloadedDate: string;
  image: any;
  progress?: number; // for partially downloaded items
}

const DownloadsScreen = () => {
  const { colors } = useTheme();

  const [downloadedItems, setDownloadedItems] = useState<DownloadedItem[]>([
    {
      id: 'd1',
      title: 'Midnight in Nairobi',
      subtitle: 'Sauti Sol',
      type: 'music',
      size: '8.4 MB',
      downloadedDate: 'Today',
      image: require('../assets/entertainment/music1.jpg'),
    },
    {
      id: 'd2',
      title: 'Empire of Gold',
      subtitle: 'Movie • 2025',
      type: 'movie',
      size: '1.8 GB',
      downloadedDate: 'Yesterday',
      image: require('../assets/entertainment/movie1.jpg'),
    },
    {
      id: 'd3',
      title: 'The Art of Luxury Living',
      subtitle: 'Elena Voss • Audiobook',
      type: 'audiobook',
      size: '245 MB',
      downloadedDate: '2 days ago',
      // eslint-disable-next-line no-undef
      image: require('../assets/entertainment/book1.jpg'),
    },
    {
      id: 'd4',
      title: 'Golden Drift - Episode 5',
      subtitle: 'Racing Series',
      type: 'video',
      size: '456 MB',
      downloadedDate: '3 days ago',
      image: require('../assets/entertainment/game3.jpg'),
    },
  ]);

  const [storageUsed] = useState('2.6 GB');
  const [storageTotal] = useState('64 GB');

  const deleteItem = (id: string) => {
    tap();
    Alert.alert(
      "Delete Download",
      "Are you sure you want to remove this item from downloads?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            setDownloadedItems(prev => prev.filter(item => item.id !== id));
            successTap();
            meadLogger.info('Download deleted', { itemId: id });
          }
        }
      ]
    );
  };

  const deleteAll = () => {
    tap();
    Alert.alert(
      "Clear All Downloads",
      "This will remove all downloaded content from your device.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive",
          onPress: () => {
            setDownloadedItems([]);
            successTap();
            Alert.alert("Cleared", "All downloads have been removed.");
          }
        }
      ]
    );
  };

  const playItem = (item: DownloadedItem) => {
    tap();
    meadLogger.info('Playing downloaded item', { title: item.title });
    Alert.alert(
      "Playing Offline",
      `${item.title}\n\nPlaying from local storage (no internet required)`,
      [{ text: "OK" }]
    );
  };

  const renderDownload = ({ item }: { item: DownloadedItem }) => (
    <TouchableOpacity style={styles.downloadCard} onPress={() => playItem(item)}>
      <Image source={item.image} style={styles.thumbnail} />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.meta}>
          {item.size} • Downloaded {item.downloadedDate}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteItem(item.id)}
      >
        <Ionicons name="trash-outline" size={22} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Downloads</Text>
        <Text style={styles.storageInfo}>
          {storageUsed} of {storageTotal} used
        </Text>
      </View>

      {downloadedItems.length > 0 ? (
        <>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.clearButton} onPress={deleteAll}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.clearText}>Clear All Downloads</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={downloadedItems}
            keyExtractor={(item) => item.id}
            renderItem={renderDownload}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cloud-download-outline" size={90} color="#444" />
          <Text style={styles.emptyTitle}>No Downloads Yet</Text>
          <Text style={styles.emptySubtitle}>
            Download music, movies, books, and videos to enjoy them offline
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: '#FFD700',
    letterSpacing: 1 
  },
  storageInfo: { 
    fontSize: 15, 
    color: '#AAAAAA', 
    marginTop: 6 
  },
  actions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContent: { padding: 20, paddingBottom: 100 },
  downloadCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  info: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#CCCCCC',
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
    color: '#888888',
  },
  deleteButton: {
    padding: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFD700',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 40,
  },
});

export default DownloadsScreen;