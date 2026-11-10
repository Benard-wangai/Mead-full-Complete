// src/components/ExpandableNavHub.tsx
// Luxury Expandable Navigation Hub for Mead
// Floating action button that expands into a beautiful radial menu
// Fully professional icons, smooth animation, haptics, and luxury black + gold theme

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { tap, heavyTap } from '../utils/haptics';

Dimensions.get('window');

interface ExpandableNavHubProps {
  onBrewCreate: () => void;      // Geo-targeted Brew post
  onMeadAI: () => void;
  onEntertainment: () => void;
  onMarketplace: () => void;
  onLive: () => void;
}

const ExpandableNavHub: React.FC<ExpandableNavHubProps> = ({
  onBrewCreate,
  onMeadAI,
  onEntertainment,
  onMarketplace,
  onLive,
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = React.useRef(new Animated.Value(0)).current;

  const toggleHub = () => {
    tap();
    const toValue = isExpanded ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      friction: 7,
      tension: 65,
      useNativeDriver: true,
    }).start();

    setIsExpanded(!isExpanded);
    if (!isExpanded) heavyTap();
  };

  const menuItems = [
    {
      icon: 'location-outline',           // Professional icon for Geo-targeted Brews
      label: 'Create Brew',
      color: colors.gold,
      onPress: () => {
        tap();
        onBrewCreate();
        setIsExpanded(false);
      },
    },
    {
      icon: 'sparkles-outline',
      label: 'Mead AI',
      color: '#8A2BE2',
      onPress: () => {
        tap();
        onMeadAI();
        setIsExpanded(false);
      },
    },
    {
      icon: 'musical-notes-outline',
      label: 'Entertainment',
      color: '#00C853',
      onPress: () => {
        tap();
        onEntertainment();
        setIsExpanded(false);
      },
    },
    {
      icon: 'cart-outline',
      label: 'Marketplace',
      color: '#FF6B6B',
      onPress: () => {
        tap();
        onMarketplace();
        setIsExpanded(false);
      },
    },
    {
      icon: 'radio-outline',
      label: 'Go Live',
      color: '#00BFFF',
      onPress: () => {
        tap();
        onLive();
        setIsExpanded(false);
      },
    },
  ];

  const animatedStyle = (index: number) => ({
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 1],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [50, -85 - (index * 68)],
        }),
      },
    ],
    opacity: animation,
  });

  return (
    <View style={styles.container}>
      {/* Expanded Menu Items */}
      {isExpanded &&
        menuItems.map((item, index) => (
          <Animated.View
            key={index}
            style={[styles.menuItemContainer, animatedStyle(index)]}
          >
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: item.color }]}
              onPress={item.onPress}
              activeOpacity={0.85}
            >
              <Ionicons name={item.icon as any} size={26} color="#000000" />
            </TouchableOpacity>
            <Text style={[styles.menuLabel, { color: colors.white }]}>
              {item.label}
            </Text>
          </Animated.View>
        ))}

      {/* Main Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.gold }]}
        onPress={toggleHub}
        activeOpacity={0.85}
      >
        <Ionicons
          name={isExpanded ? 'close' : 'grid-outline'}
          size={32}
          color={colors.black}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    alignItems: 'center',
    zIndex: 999,
  },
  fab: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 15,
  },
  menuItemContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  menuItem: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  menuLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 4,
  },
});

export default ExpandableNavHub;