/* eslint-disable no-undef */
// src/screens/CallsScreen.tsx
// Calls Screen for Mead - The Global Luxury Super App
// Full call history with voice & video call support (demo mode)

import React, { useState } from 'react';
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
import { formatChatTimestamp } from '../utils/formatters';

interface CallItem {
  id: string;
  name: string;
  avatar?: any;
  type: 'voice' | 'video';
  status: 'outgoing' | 'incoming' | 'missed';
  duration?: string;
  timestamp: Date;
  isVerified?: boolean;
}

const CallsScreen = () => {
  const { colors } = useTheme();

  const [calls] = useState<CallItem[]>([
    {
      id: 'c1',
      name: 'Aisha Khan',
      avatar: require('../assets/default-avatar.png'),
      type: 'video',
      status: 'incoming',
      duration: '12:45',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      isVerified: true,
    },
    {
      id: 'c2',
      name: 'Marcus Okoro',
      avatar: require('../assets/default-avatar.png'),
      type: 'voice',
      status: 'outgoing',
      duration: '08:22',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
    },
    {
      id: 'c3',
      name: 'Fatima Al-Mansour',
      avatar: require('../assets/default-avatar.png'),
      type: 'video',
      status: 'missed',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      isVerified: true,
    },
    {
      id: 'c4',
      name: 'Luxury Nairobi',
      avatar: require('../assets/default-avatar.png'),
      type: 'voice',
      status: 'outgoing',
      duration: '03:12',
      timestamp: new Date(Date.now() - 1000 * 60 * 360),
    },
  ]);

  const makeCall = (contact: CallItem, callType: 'voice' | 'video') => {
    tap();
    meadLogger.info('Initiating call', { contact: contact.name, type: callType });

    Alert.alert(
      `${callType === 'video' ? 'Video' : 'Voice'} Call`,
      `Calling ${contact.name}...`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "End Call", 
          onPress: () => {
            successTap();
            Alert.alert("Call Ended", `Call with ${contact.name} ended.`);
          }
        }
      ]
    );
  };

  const renderCall = ({ item }: { item: CallItem }) => {
    const isMissed = item.status === 'missed';

    return (
      <TouchableOpacity 
        style={styles.callItem} 
        onPress={() => makeCall(item, item.type)}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={item.avatar || require('../assets/default-avatar.png')} 
            style={styles.avatar} 
          />
          {item.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.gold} />
            </View>
          )}
        </View>

        <View style={styles.callInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, isMissed && styles.missedName]}>
              {item.name}
            </Text>
            {item.type === 'video' && (
              <Ionicons name="videocam" size={18} color="#00FF88" style={styles.callTypeIcon} />
            )}
          </View>

          <View style={styles.statusRow}>
            <Ionicons 
              name={
                item.status === 'outgoing' ? 'arrow-up' :
                item.status === 'incoming' ? 'arrow-down' : 'close'
              } 
              size={16} 
              color={isMissed ? '#FF3B30' : '#00FF88'} 
            />
            <Text style={[styles.statusText, isMissed && styles.missedText]}>
              {item.status === 'outgoing' ? 'Outgoing' : 
               item.status === 'incoming' ? 'Incoming' : 'Missed'}
              {item.duration && ` • ${item.duration}`}
            </Text>
          </View>
        </View>

        <Text style={styles.timestamp}>
          {formatChatTimestamp(item.timestamp)}
        </Text>

        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => makeCall(item, item.type)}
        >
          <Ionicons 
            name={item.type === 'video' ? 'videocam' : 'call'} 
            size={24} 
            color={colors.gold} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calls</Text>
        <TouchableOpacity 
          style={styles.newCallButton}
          onPress={() => Alert.alert("New Call", "Search for a contact to start a call...")}
        >
          <Ionicons name="add-circle" size={28} color={colors.gold} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={calls}
        keyExtractor={(item) => item.id}
        renderItem={renderCall}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="call-outline" size={70} color="#444" />
            <Text style={styles.emptyText}>No calls yet</Text>
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
  newCallButton: {
    padding: 8,
  },
  listContent: { paddingBottom: 100 },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    borderRadius: 10,
  },
  callInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  missedName: {
    color: '#FF3B30',
  },
  callTypeIcon: {
    marginLeft: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#AAAAAA',
    marginLeft: 6,
  },
  missedText: {
    color: '#FF3B30',
  },
  timestamp: {
    fontSize: 13,
    color: '#666666',
    marginRight: 12,
  },
  callButton: {
    padding: 10,
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

export default CallsScreen;