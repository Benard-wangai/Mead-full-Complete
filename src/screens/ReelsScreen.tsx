/* eslint-disable no-undef */
// src/screens/ReelsScreen.tsx
// Reels Screen for Mead - The Global Luxury Super App
// Production-ready vertical video feed with smooth playback, MeadWatermark, and luxury interactions

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../utils/theme';
import { useToast } from '../components/Toast';
import { tap, successTap } from '../utils/haptics';
import MeadWatermark from '../components/MeadWatermark';

const { height, width } = Dimensions.get('window');

interface ReelItem {
  id: string;
  username: string;
  avatar: any;
  videoUri: any;
  caption: string;
  likes: number;
  comments: number;
}

const ReelsScreen = () => {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const flatListRef = useRef<FlatList>(null);
  const videoRefs = useRef<{ [key: string]: Video | null }>({});

  const [reels, setReels] = useState<ReelItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Sample data - Replace with Supabase fetch in production
  const sampleReels: ReelItem[] = [
    {
      id: '1',
      username: 'luxurykenya',
      avatar: require('../assets/default-avatar.png'),
      videoUri: require('../../assets/videos/reel1.mp4'),
      caption: 'Golden hour in Nairobi National Park ✨ #MeadReels',
      likes: 12400,
      comments: 342,
    },
    {
      id: '2',
      username: 'dubaielite',
      avatar: require('../assets/default-avatar.png'),
      videoUri: require('../../assets/videos/reel2.mp4'),
      caption: 'Burj Khalifa at golden hour 🏙️ Pure luxury living',
      likes: 8750,
      comments: 219,
    },
    {
      id: '3',
      username: 'mombasavibes',
      avatar: require('../assets/default-avatar.png'),
      videoUri: require('../../assets/videos/reel3.mp4'),
      caption: 'Beach life in Diani 🌊 Who else is ready for the weekend?',
      likes: 15600,
      comments: 487,
    },
  ];

  useEffect(() => {
    // Simulate loading from Supabase
    setTimeout(() => {
      setReels(sampleReels);
      setLoading(false);
    }, 800);
  }, []);

  const handleLike = useCallback((id: string) => {
    tap();

    setReels(prev => prev.map(reel =>
      reel.id === id
        ? { ...reel, likes: reel.likes + (likedReels.has(id) ? -1 : 1) }
        : reel
    ));

    setLikedReels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });

    successTap();
  }, [likedReels]);

  const handleComment = useCallback((reel: ReelItem) => {
    tap();
    showToast(`Opening comments for @${reel.username}`, 'info');
  }, [showToast]);

  const handleShare = useCallback((reel: ReelItem) => {
    tap();
    showToast(`Sharing "${reel.caption.substring(0, 40)}..."`, 'info');
  }, [showToast]);

  const renderReel = ({ item, index }: { item: ReelItem; index: number }) => {
    const isVisible = index === currentIndex;

    return (
      <View style={styles.reelContainer}>
        <Video
          ref={(ref) => { videoRefs.current[item.id] = ref; }}
          source={item.videoUri}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isVisible}
          isLooping
          isMuted={false}
        />

        {/* Luxury Watermark */}
        <MeadWatermark />

        {/* Bottom Overlay */}
        <View style={styles.overlay}>
          <View style={styles.userInfo}>
            <Image source={item.avatar} style={styles.avatar} />
            <Text style={styles.username}>@{item.username}</Text>
          </View>
          <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
            <Ionicons 
              name={likedReels.has(item.id) ? "heart" : "heart-outline"} 
              size={38} 
              color={likedReels.has(item.id) ? "#FF3B30" : "#FFFFFF"} 
            />
            <Text style={styles.actionCount}>{(item.likes / 1000).toFixed(1)}K</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleComment(item)}>
            <Ionicons name="chatbubble-outline" size={38} color="#FFFFFF" />
            <Text style={styles.actionCount}>{item.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)}>
            <Ionicons name="share-social-outline" size={38} color="#FFFFFF" />
            <Text style={styles.actionCount}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 }).current;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={renderReel}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>MEAD REELS</Text>
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={() => showToast('Create Reel - Coming Soon', 'info')}
        >
          <Ionicons name="add-circle" size={32} color={colors.gold} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  reelContainer: {
    height: height,
    width: width,
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 90,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginRight: 12,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  caption: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    position: 'absolute',
    bottom: 160,
    right: 20,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 28,
  },
  actionCount: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 6,
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  appTitle: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  createButton: {
    padding: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

export default ReelsScreen;