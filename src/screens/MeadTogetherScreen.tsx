// src/screens/MeadTogetherScreen.tsx
// MeadTogether Screen for Mead - The Global Luxury Super App
// Production-ready collaborative experiences (Watch, Listen, Play) with realtime RSVPs

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { useToast } from '../components/Toast';
import { supabase } from '../utils/supabaseClient';
import Button from '../components/Button';
import Card from '../components/Card';

interface TogetherRoom {
  id: string;
  title: string;
  host_name: string;
  activity: 'movie' | 'music' | 'game' | 'book' | 'luxury_talk';
  participants: number;
  max_participants: number;
  is_live: boolean;
  thumbnail_url?: string;
  description?: string;
}

const MeadTogetherScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [rooms, setRooms] = useState<TogetherRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<TogetherRoom | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('mead_together_rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRooms(data || []);
    } catch (error: any) {
      meadLogger.error('Failed to fetch MeadTogether rooms', error);
      showToast('Failed to load experiences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = (room: TogetherRoom) => {
    if (room.participants >= room.max_participants) {
      showToast('This room is currently full', 'error');
      return;
    }

    setSelectedRoom(room);
    setShowJoinModal(true);
  };

  const confirmJoin = async () => {
    if (!selectedRoom) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('Please log in to join', 'error');
        return;
      }

      // Record participation
      await supabase
        .from('mead_together_participants')
        .insert({
          room_id: selectedRoom.id,
          user_id: user.id,
        });

      showToast(`Joined "${selectedRoom.title}" successfully!`, 'success');
      setShowJoinModal(false);
    } catch (error: any) {
      showToast('Failed to join room. Please try again.', 'error');
    }
  };

  const renderRoom = ({ item }: { item: TogetherRoom }) => {
    const isFull = item.participants >= item.max_participants;

    return (
      <Card style={styles.roomCard}>
        {item.thumbnail_url && (
          <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
        )}

        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{item.title}</Text>
            {item.is_live && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>

          <Text style={styles.host}>Hosted by {item.host_name}</Text>
          <Text style={styles.activity}>
            {item.activity === 'movie' && '🎥 Movie Night'}
            {item.activity === 'music' && '🎵 Music Session'}
            {item.activity === 'game' && '🎮 Gaming'}
            {item.activity === 'book' && '📖 Book Club'}
            {item.activity === 'luxury_talk' && '💎 Luxury Talk'}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.participants}>
              {item.participants}/{item.max_participants} joined
            </Text>

            <Button
              title={isFull ? "Room Full" : "Join Room"}
              onPress={() => joinRoom(item)}
              disabled={isFull}
              style={isFull ? styles.fullButton : undefined}
            />
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mead Together</Text>
        <Text style={styles.headerSubtitle}>Watch • Listen • Play • Connect</Text>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => showToast('Create experience — coming soon', 'info')}
      >
        <Ionicons name="add-circle" size={24} color="#000" />
        <Text style={styles.createText}>Create New Experience</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={renderRoom}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={80} color="#444" />
              <Text style={styles.emptyText}>No active rooms right now</Text>
              <Text style={styles.emptySubtext}>Be the first to host an experience</Text>
            </View>
          )}
        />
      )}

      {/* Join Confirmation Modal */}
      <Modal visible={showJoinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Experience</Text>
            <Text style={styles.modalRoomTitle}>{selectedRoom?.title}</Text>
            <Text style={styles.modalDesc}>
              Hosted by {selectedRoom?.host_name} • {selectedRoom?.participants} others attending
            </Text>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowJoinModal(false)}
                variant="secondary"
                style={styles.modalCancel}
              />
              <Button
                title="Join Now"
                onPress={confirmJoin}
                variant="primary"
                style={styles.modalJoin}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFD700',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 6,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  createText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 17,
    marginLeft: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  roomCard: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 200,
  },
  info: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  liveBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  host: {
    color: '#FFD700',
    marginTop: 6,
    fontSize: 15,
  },
  activity: {
    color: '#AAAAAA',
    marginTop: 8,
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  participants: {
    color: '#FFD700',
    fontWeight: '600',
  },
  fullButton: {
    backgroundColor: '#333',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 120,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 20,
    marginTop: 24,
  },
  emptySubtext: {
    color: '#666',
    marginTop: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '88%',
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 12,
  },
  modalRoomTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDesc: {
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 32,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancel: { flex: 1 },
  modalJoin: { flex: 1 },
});

export default MeadTogetherScreen;