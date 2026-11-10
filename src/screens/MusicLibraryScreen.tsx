/* eslint-disable no-undef */
// src/screens/MusicLibraryScreen.tsx
// Music Library Screen for Mead - The Global Luxury Super App
// Spotify-like experience with offline downloads, luxury UI, and seamless integration

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { tap, successTap, heavyTap } from '../utils/haptics';
import Button from '../components/Button';
import Card from '../components/Card';
import MeadWatermark from '../components/MeadWatermark';

const { width } = Dimensions.get('window');

interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: any;
  duration: string;
  isDownloaded: boolean;
}

interface Playlist {
  id: string;
  name: string;
  coverArt: any;
  trackCount: number;
  description: string;
}

// eslint-disable-next-line no-empty-pattern
const MusicLibraryScreen = ({ }: any) => {
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'forYou' | 'playlists' | 'charts'>('forYou');
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);

  // Sample Data - In production: fetch from Supabase 'tracks' and 'playlists' tables
  const forYouTracks: Track[] = [
    { id: 't1', title: "Golden Hour", artist: "Mead Collective", albumArt: require('../assets/music/goldenhour.jpg'), duration: "3:45", isDownloaded: true },
    { id: 't2', title: "Nairobi Nights", artist: "Sauti Supreme", albumArt: require('../assets/music/nairobi.jpg'), duration: "4:12", isDownloaded: false },
    { id: 't3', title: "Luxury Dreams", artist: "Diamond Vibes", albumArt: require('../assets/music/luxury.jpg'), duration: "3:28", isDownloaded: true },
  ];

  const playlists: Playlist[] = [
    { id: 'p1', name: "Mead Luxury Hits", coverArt: require('../assets/music/playlist1.jpg'), trackCount: 42, description: "Curated luxury anthems" },
    { id: 'p2', name: "East African Gold", coverArt: require('../assets/music/playlist2.jpg'), trackCount: 28, description: "Swahili & Afrobeat" },
    { id: 'p3', name: "Midnight Lounge", coverArt: require('../assets/music/playlist3.jpg'), trackCount: 35, description: "Smooth & sensual" },
  ];

  const handlePlayTrack = (track: Track) => {
    tap();
    setNowPlaying(track);
    successTap();
    meadLogger.info(`Now playing: ${track.title} by ${track.artist}`);
    // In production: Open full MediaPlayer or Mini Player
    Alert.alert("Now Playing", `${track.title} — ${track.artist}`);
  };

  const toggleDownload = (track: Track) => {
    heavyTap();
    Alert.alert(
      track.isDownloaded ? "Remove Download" : "Download Track",
      track.isDownloaded 
        ? "Remove from offline library?" 
        : "Download for offline listening?",
      [
        { text: "Cancel", style: "cancel" },
        { text: track.isDownloaded ? "Remove" : "Download", onPress: () => {
          meadLogger.info(`${track.isDownloaded ? 'Removed' : 'Downloaded'} ${track.title}`);
        }}
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MUSIC</Text>
        <Text style={styles.subtitle}>Luxury Soundscape</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={22} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs, artists, albums..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['forYou', 'playlists', 'charts'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              tap();
              setActiveTab(tab);
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'forYou' ? 'For You' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* For You Section */}
        {activeTab === 'forYou' && (
          <>
            <Text style={styles.sectionTitle}>Made for You</Text>
            <FlatList
              data={forYouTracks}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handlePlayTrack(item)} style={styles.trackCard}>
                  <Image source={item.albumArt} style={styles.albumArt} />
                  <MeadWatermark style={styles.smallWatermark} size="small" opacity={0.6} />
                  <Text style={styles.trackTitle}>{item.title}</Text>
                  <Text style={styles.trackArtist}>{item.artist}</Text>
                  <TouchableOpacity onPress={() => toggleDownload(item)} style={styles.downloadBtn}>
                    <Ionicons 
                      name={item.isDownloaded ? "cloud-download" : "download-outline"} 
                      size={20} 
                      color={colors.gold} 
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {/* Playlists Section */}
        {activeTab === 'playlists' && (
          <>
            <Text style={styles.sectionTitle}>Curated Playlists</Text>
            <FlatList
              data={playlists}
              numColumns={2}
              contentContainerStyle={styles.playlistsGrid}
              renderItem={({ item }) => (
                <Card style={styles.playlistCard}>
                  <Image source={item.coverArt} style={styles.playlistArt} />
                  <Text style={styles.playlistName}>{item.name}</Text>
                  <Text style={styles.playlistInfo}>{item.trackCount} songs • {item.description}</Text>
                  <Button 
                    title="Play" 
                    onPress={() => { tap(); Alert.alert("Playing Playlist", item.name); }} 
                    style={styles.playPlaylistBtn}
                  />
                </Card>
              )}
            />
          </>
        )}

        {/* Charts Section */}
        {activeTab === 'charts' && (
          <View style={styles.centerContent}>
            <Text style={styles.comingSoon}>🌍 Global Charts</Text>
            <Text style={styles.comingSoonSub}>Trending in Kenya • UAE • Nigeria • USA</Text>
            <Button title="Explore Global Charts" onPress={() => Alert.alert("Coming Soon", "Global music charts are loading...")} />
          </View>
        )}
      </ScrollView>

      {/* Mini Player */}
      {nowPlaying && (
        <View style={styles.miniPlayer}>
          <Image source={nowPlaying.albumArt} style={styles.miniArt} />
          <View style={styles.miniInfo}>
            <Text style={styles.miniTitle}>{nowPlaying.title}</Text>
            <Text style={styles.miniArtist}>{nowPlaying.artist}</Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert("Full Player", "Opening full music player...")}>
            <Ionicons name="play-circle" size={42} color={colors.gold} />
          </TouchableOpacity>
        </View>
      )}

      <MeadWatermark style={styles.floatingWatermark} opacity={0.15} size="large" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 34, fontWeight: '700', color: '#FFD700', letterSpacing: 2 },
  subtitle: { fontSize: 16, color: '#AAAAAA', marginTop: 4 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 30,
    paddingHorizontal: 16,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 16, paddingVertical: 14 },

  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginRight: 12,
    borderRadius: 30,
    backgroundColor: '#1F1F1F',
  },
  tabActive: { backgroundColor: '#FFD700' },
  tabText: { color: '#FFFFFF', fontWeight: '600' },
  tabTextActive: { color: '#000000' },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginVertical: 16,
  },

  horizontalList: { paddingLeft: 20, paddingRight: 8 },
  trackCard: { width: width * 0.42, marginRight: 16, marginBottom: 20 },
  albumArt: { width: '100%', height: 160, borderRadius: 16 },
  smallWatermark: { bottom: 12, right: 12, opacity: 0.7 },
  trackTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginTop: 12 },
  trackArtist: { fontSize: 14, color: '#888' },
  downloadBtn: { position: 'absolute', top: 12, right: 12 },

  playlistsGrid: { paddingHorizontal: 20 },
  playlistCard: { width: (width - 56) / 2, margin: 8 },
  playlistArt: { width: '100%', height: 160, borderRadius: 16 },
  playlistName: { fontSize: 17, fontWeight: '700', marginTop: 12 },
  playlistInfo: { fontSize: 13, color: '#888', marginTop: 4 },

  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  comingSoon: { fontSize: 26, color: '#FFD700', textAlign: 'center', marginBottom: 12 },
  comingSoonSub: { fontSize: 16, color: '#666', textAlign: 'center' },

  miniPlayer: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    right: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFD70033',
  },
  miniArt: { width: 52, height: 52, borderRadius: 8 },
  miniInfo: { flex: 1, marginLeft: 12 },
  miniTitle: { color: '#FFFFFF', fontWeight: '600' },
  miniArtist: { color: '#888', fontSize: 13 },

  floatingWatermark: { bottom: 100, right: 30, opacity: 0.12 },

  playPlaylistBtn: { marginTop: 12 },
});

export default MusicLibraryScreen;