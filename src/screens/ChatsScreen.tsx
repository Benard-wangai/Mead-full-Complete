// src/screens/ChatsScreen.tsx
// Professional Chats Screen for Mead - The Global Luxury Super App
// Real-time Supabase integration, luxury design, and smooth UX

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { tap } from '../utils/haptics';
import supabase from '../utils/supabaseClient';

interface ChatItem {
  id: string;
  conversation_id: string;
  participant_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  avatar_url?: string | null;
  is_online?: boolean;
}

const ChatsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations from Supabase
  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please log in to view chats');
      }

      const { data, error: fetchError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations (
            id,
            name,
            type,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .order('conversations(updated_at)', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const formattedChats: ChatItem[] = (data || []).map((item: any) => ({
        id: item.conversation_id,
        conversation_id: item.conversation_id,
        participant_name: item.conversations?.name || 'Unknown Chat',
        last_message: 'Tap to open conversation',
        last_message_time: item.conversations?.updated_at
          ? new Date(item.conversations.updated_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        unread_count: 0,
        avatar_url: null,
        is_online: false,
      }));

      setChats(formattedChats);
      setFilteredChats(formattedChats);
      meadLogger.info(`Loaded ${formattedChats.length} conversations`);

    } catch (err: any) {
      console.error('Failed to fetch chats:', err);
      setChats([]);
      setFilteredChats([]);
      meadLogger.warn('Chats fetch failed — showing empty state', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Search filter
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredChats(chats);
      return;
    }

    const searchLower = searchText.toLowerCase().trim();
    const result = chats.filter(chat =>
      chat.participant_name.toLowerCase().includes(searchLower) ||
      chat.last_message.toLowerCase().includes(searchLower)
    );

    setFilteredChats(result);
  }, [searchText, chats]);

  const openChat = (chat: ChatItem) => {
    tap();
    navigation.navigate('ChatThread', { 
      conversationId: chat.conversation_id,
      participantName: chat.participant_name 
    });
  };

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => openChat(item)}>
      <View style={styles.avatarContainer}>
        <Image 
          source={item.avatar_url ? { uri: item.avatar_url } : require('../assets/default-avatar.png')} 
          style={styles.avatar} 
        />
        {item.is_online && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.participant_name}</Text>
          <Text style={styles.time}>{item.last_message_time}</Text>
        </View>
        
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.last_message}
        </Text>
      </View>

      {item.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{item.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.black }]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Loading your conversations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.black }]}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchChats}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity onPress={() => Alert.alert('New Chat', 'New conversation feature coming soon')}>
          <Ionicons name="add-circle" size={28} color={colors.gold} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.conversation_id}
        renderItem={renderChatItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={70} color="#444" />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation with someone</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    margin: 16,
    borderRadius: 25,
    paddingHorizontal: 16,
  },
  searchIcon: { marginRight: 12 },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
  },
  listContent: { paddingBottom: 100 },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFD70033',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#000',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  time: {
    fontSize: 13,
    color: '#666',
  },
  lastMessage: {
    fontSize: 15,
    color: '#AAAAAA',
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FFD700',
    borderRadius: 25,
  },
  retryText: {
    color: '#000',
    fontWeight: '600',
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
    marginTop: 16,
  },
  emptySubtext: {
    color: '#555',
    fontSize: 14,
    marginTop: 8,
  },
});

export default ChatsScreen;