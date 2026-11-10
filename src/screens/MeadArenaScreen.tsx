/* eslint-disable no-undef */
// src/screens/MeadArenaScreen.tsx
// Mead Arena - Gaming Hub for Mead - The Global Luxury Super App
// Multiplayer gaming rooms, collaborative play, tournaments, and luxury gaming experience

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { tap, successTap, heavyTap } from '../utils/haptics';
import Button from '../components/Button';
import Card from '../components/Card';
import MeadWatermark from '../components/MeadWatermark';

Dimensions.get('window');

interface GameRoom {
  id: string;
  gameName: string;
  gameIcon: string;
  host: string;
  players: number;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'full';
  thumbnail: any;
  isPremium: boolean;
}

const MeadArenaScreen = () => {
  const { colors } = useTheme();

  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Action', 'Battle Royale', 'Racing', 'Strategy', 'Sports', 'Party'];

  // Sample data - In production, fetch from Supabase 'game_rooms' table
  const sampleRooms: GameRoom[] = [
    {
      id: 'r1',
      gameName: 'Asphalt 9 Legends',
      gameIcon: 'car-sport',
      host: 'SpeedKing254',
      players: 8,
      maxPlayers: 12,
      status: 'waiting',
      thumbnail: require('../assets/games/asphalt.jpg'),
      isPremium: true,
    },
    {
      id: 'r2',
      gameName: 'Call of Duty Mobile',
      gameIcon: 'game-controller',
      host: 'EliteSniperKE',
      players: 45,
      maxPlayers: 100,
      status: 'playing',
      thumbnail: require('../assets/games/cod.jpg'),
      isPremium: false,
    },
    {
      id: 'r3',
      gameName: 'Among Us',
      gameIcon: 'people',
      host: 'CrewmateOnly',
      players: 6,
      maxPlayers: 15,
      status: 'waiting',
      thumbnail: require('../assets/games/amongus.jpg'),
      isPremium: false,
    },
    {
      id: 'r4',
      gameName: 'PUBG Mobile',
      gameIcon: 'trophy',
      host: 'ChickenDinnerKE',
      players: 92,
      maxPlayers: 100,
      status: 'playing',
      thumbnail: require('../assets/games/pubg.jpg'),
      isPremium: true,
    },
  ];

  useEffect(() => {
    // Simulate loading from Supabase
    setTimeout(() => {
      setRooms(sampleRooms);
      setLoading(false);
      meadLogger.info('Mead Arena rooms loaded');
    }, 800);
  }, []);

  const filteredRooms = rooms.filter(room => 
    selectedCategory === 'All' || room.gameName.toLowerCase().includes(selectedCategory.toLowerCase())
  );

  const handleJoinRoom = (room: GameRoom) => {
    tap();
    if (room.status === 'full') {
      Alert.alert("Room Full", "This room has reached maximum capacity.");
      return;
    }
    successTap();
    Alert.alert(
      "Joining Game",
      `Connecting you to ${room.gameName} hosted by ${room.host}...`,
      [{ text: "OK", onPress: () => meadLogger.info(`Joined room ${room.id}`) }]
    );
  };

  const createNewRoom = () => {
    heavyTap();
    Alert.alert(
      "Create Game Room",
      "Premium users can create private rooms with custom rules.\n\nThis feature is coming soon.",
      [{ text: "Got it" }]
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.black }]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Entering the Arena...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MEAD ARENA</Text>
        <Text style={styles.subtitle}>Play • Compete • Win in Luxury</Text>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              selectedCategory === cat && styles.categoryChipActive,
            ]}
            onPress={() => {
              tap();
              setSelectedCategory(cat);
            }}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === cat && styles.categoryTextActive,
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Create Room Button */}
      <TouchableOpacity style={styles.createRoomButton} onPress={createNewRoom}>
        <Ionicons name="add-circle" size={24} color="#000" />
        <Text style={styles.createRoomText}>Create Private Room</Text>
      </TouchableOpacity>

      {/* Live Rooms */}
      <FlatList
        data={filteredRooms}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.roomCard}>
            <Image source={item.thumbnail} style={styles.roomImage} />
            
            {item.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PREMIUM</Text>
              </View>
            )}

            <View style={styles.roomInfo}>
              <Text style={styles.gameName}>{item.gameName}</Text>
              <Text style={styles.host}>Hosted by {item.host}</Text>

              <View style={styles.playersRow}>
                <Ionicons name="people" size={18} color={colors.gold} />
                <Text style={styles.players}>
                  {item.players}/{item.maxPlayers}
                </Text>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: item.status === 'waiting' ? '#4CAF50' : '#FF9800' }
                ]} />
              </View>

              <Button
                title={item.status === 'waiting' ? "JOIN ROOM" : "SPECTATE"}
                onPress={() => handleJoinRoom(item)}
                style={styles.joinButton}
              />
            </View>

            <MeadWatermark style={styles.watermark} opacity={0.6} size="small" />
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No rooms available in this category</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 4,
  },
  categoriesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 30,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#FFD700',
  },
  categoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#000000',
  },
  createRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  createRoomText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 17,
    marginLeft: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  roomCard: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  roomImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  premiumBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  premiumText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  roomInfo: {
    padding: 16,
  },
  gameName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  host: {
    color: '#FFD700',
    fontSize: 15,
    marginTop: 4,
  },
  playersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  players: {
    color: '#CCCCCC',
    marginLeft: 8,
    fontSize: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 'auto',
  },
  joinButton: {
    marginTop: 8,
  },
  watermark: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFD700',
    marginTop: 20,
    fontSize: 17,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
  },
});

export default MeadArenaScreen;