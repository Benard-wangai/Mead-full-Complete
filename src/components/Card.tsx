// src/components/Card.tsx
// Luxury Card Component for Mead - Black + Gold Imperial Design
// Reusable across all 94 files for posts, listings, stats, feed items, etc.
// Fully interconnected with HomeScreen, ProfileScreen, Marketplace, EntertainmentHub, etc.

import React, { ReactNode } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ImageStyle,
  ImageSourcePropType,
} from 'react-native';
import { useTheme } from '../utils/theme';
import { tap } from '../utils/haptics';

interface CardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: ImageSourcePropType;
  imageStyle?: ImageStyle;
  footer?: ReactNode;
  children?: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  description,
  image,
  imageStyle,
  footer,
  children,
  onPress,
  style,
  disabled = false,
}) => {
  const { colors } = useTheme();

  const cardContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.dark,
          borderColor: colors.gold + '44',
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {image && (
        <Image
          source={image}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        {title && (
          <Text style={[styles.title, { color: colors.gold }]}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.gray }]}>
            {subtitle}
          </Text>
        )}
        {description && (
          <Text style={[styles.description, { color: colors.lightGray }]}>
            {description}
          </Text>
        )}
        {children}
      </View>

      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          tap();
          onPress();
        }}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#FFD70022',
  },
  disabled: {
    opacity: 0.75,
  },
});

export default Card;