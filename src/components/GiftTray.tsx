// src/components/GiftTray.tsx
// Luxury Gift Tray for Mead - Send virtual gifts during calls, live streams, and chats
// Fully interconnected with ActiveCallScreen, LiveScreen, and ChatThreadScreen
// Supports real-time gifting with 70/30 revenue split and haptics

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../utils/theme';
import { tap, successTap } from '../utils/haptics';

interface Gift {
  id: string;
  name: string;
  emoji: string;
  price: number;        // in KES
  color: string;
}

const availableGifts: Gift[] = [
  { id: '1', name: 'Golden Rose', emoji: '🌹', price: 250, color: '#FFD700' },
  { id: '2', name: 'Luxury Crown', emoji: '👑', price: 850, color: '#FFD700' },
  { id: '3', name: 'Diamond Heart', emoji: '💎', price: 450, color: '#00B0FF' },
  { id: '4', name: 'Champagne Toast', emoji: '🥂', price: 650, color: '#FF6B6B' },
  { id: '5', name: 'Private Jet', emoji: '✈️', price: 1250, color: '#00C853' },
  { id: '6', name: 'Mead Throne', emoji: '🪑', price: 950, color: '#6A0DAD' },
];

interface GiftTrayProps {
  // eslint-disable-next-line no-unused-vars
  onGiftSent: (gift: Gift) => void;
  visible: boolean;
  onClose: () => void;
}

const GiftTray: React.FC<GiftTrayProps> = ({ onGiftSent, visible, onClose }) => {
  const { colors } = useTheme();
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

  const handleSendGift = (gift: Gift) => {
    tap();
    setSelectedGift(gift);

    Alert.alert(
      'Send Gift',
      `Send ${gift.emoji} ${gift.name} for KES ${gift.price}?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setSelectedGift(null) },
        {
          text: 'Send Gift',
          onPress: () => {
            successTap();
            onGiftSent(gift);
            setSelectedGift(null);
            onClose();
            
            Alert.alert(
              'Gift Sent!',
              `${gift.emoji} ${gift.name} has been sent. Thank you for supporting creators on Mead.`,
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
      <View style={[styles.tray, { backgroundColor: colors.dark }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.gold }]}>Send a Gift</Text>
          <Text style={[styles.subtitle, { color: colors.gray }]}>
            Show appreciation • 70% goes to the creator
          </Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.giftList}
        >
          {availableGifts.map((gift) => (
            <TouchableOpacity
              key={gift.id}
              style={[
                styles.giftItem,
                selectedGift?.id === gift.id && styles.selectedGift,
              ]}
              onPress={() => handleSendGift(gift)}
            >
              <Text style={styles.giftEmoji}>{gift.emoji}</Text>
              <Text style={[styles.giftName, { color: colors.white }]}>
                {gift.name}
              </Text>
              <Text style={[styles.giftPrice, { color: colors.gold }]}>
                KES {gift.price}
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
    minHeight: 320,
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
  giftList: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  giftItem: {
    alignItems: 'center',
    width: 100,
    marginHorizontal: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
  },
  selectedGift: {
    backgroundColor: '#FFD70033',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  giftEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  giftName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  giftPrice: {
    fontSize: 15,
    fontWeight: '700',
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

export default GiftTray;