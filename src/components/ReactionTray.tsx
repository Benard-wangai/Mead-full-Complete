// src/components/ReactionTray.tsx
// Luxury Reaction Tray for Mead - Quick reactions during calls, live streams, reels, and chats
// Fully interconnected with ActiveCallScreen, LiveScreen, ReelsScreen, and ChatThreadScreen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../utils/theme';
import { tap, successTap } from '../utils/haptics';

interface Reaction {
  emoji: string;
  label: string;
  color: string;
}

const availableReactions: Reaction[] = [
  { emoji: '❤️', label: 'Love', color: '#FF6B6B' },
  { emoji: '🔥', label: 'Fire', color: '#FFD700' },
  { emoji: '👏', label: 'Applause', color: '#00C853' },
  { emoji: '😂', label: 'Laugh', color: '#00B0FF' },
  { emoji: '😮', label: 'Wow', color: '#6A0DAD' },
  { emoji: '🙌', label: 'Praise', color: '#FFD700' },
  { emoji: '💎', label: 'Luxury', color: '#FFD700' },
  { emoji: '🌟', label: 'Star', color: '#FFD700' },
];

interface ReactionTrayProps {
  visible: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onReactionSelected: (reaction: Reaction) => void;
}

const ReactionTray: React.FC<ReactionTrayProps> = ({
  visible,
  onClose,
  onReactionSelected,
}) => {
  const { colors } = useTheme();
  const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(null);

  const handleSelectReaction = (reaction: Reaction) => {
    tap();
    setSelectedReaction(reaction);

    // Send reaction immediately
    onReactionSelected(reaction);
    successTap();

    // Auto-close after selection
    setTimeout(() => {
      onClose();
      setSelectedReaction(null);
    }, 600);
  };

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
      <View style={[styles.tray, { backgroundColor: colors.dark }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.gold }]}>Send a Reaction</Text>
          <Text style={[styles.subtitle, { color: colors.gray }]}>
            Show your appreciation instantly
          </Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.reactionList}
        >
          {availableReactions.map((reaction, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.reactionItem,
                selectedReaction?.emoji === reaction.emoji && styles.selectedReaction,
              ]}
              onPress={() => handleSelectReaction(reaction)}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              <Text style={[styles.reactionLabel, { color: colors.white }]}>
                {reaction.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={[styles.closeText, { color: colors.gray }]}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  tray: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
    minHeight: 260,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  reactionList: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  reactionItem: {
    alignItems: 'center',
    width: 80,
    marginHorizontal: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
  },
  selectedReaction: {
    backgroundColor: '#FFD70033',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  reactionEmoji: {
    fontSize: 42,
    marginBottom: 8,
  },
  reactionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ReactionTray;