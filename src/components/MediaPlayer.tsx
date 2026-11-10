// src/components/MediaPlayer.tsx
// Luxury Media Player for Mead - The Global Luxury Super App
// Supports Video + Audio with beautiful UI, progress, and MeadWatermark

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../utils/theme';
import { tap } from '../utils/haptics';
import MeadWatermark from './MeadWatermark';

Dimensions.get('window');

interface MediaPlayerProps {
  uri: string;
  type: 'video' | 'audio';
  title?: string;
  artist?: string;
  autoPlay?: boolean;
  showWatermark?: boolean;
  // eslint-disable-next-line no-unused-vars
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({
  uri,
  type,
  title,
  artist,
  autoPlay = false,
  showWatermark = true,
  onPlaybackStatusUpdate,
}) => {
  const { colors } = useTheme();

  const videoRef = useRef<Video>(null);
  const audioRef = useRef<Audio.Sound>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [, setDuration] = useState(0);

  // Video Status Handler
  const handleVideoStatus = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying);
      setDuration(status.durationMillis || 0);
      setProgress(status.durationMillis ? (status.positionMillis || 0) / status.durationMillis : 0);
    }
    onPlaybackStatusUpdate?.(status);
  };

  // Audio Status Handler
  const handleAudioStatus = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying);
      setDuration(status.durationMillis || 0);
      setProgress(status.durationMillis ? (status.positionMillis || 0) / status.durationMillis : 0);
    }
    onPlaybackStatusUpdate?.(status);
  };

  const togglePlayPause = async () => {
    tap();
    if (type === 'video' && videoRef.current) {
      isPlaying ? await videoRef.current.pauseAsync() : await videoRef.current.playAsync();
    } else if (type === 'audio' && audioRef.current) {
      isPlaying ? await audioRef.current.pauseAsync() : await audioRef.current.playAsync();
    }
  };

  // Load Audio
  useEffect(() => {
    if (type === 'audio') {
      const loadAudio = async () => {
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: autoPlay }
          );
          audioRef.current = sound;
          sound.setOnPlaybackStatusUpdate(handleAudioStatus);
        } catch (error) {
          console.error('Audio load error:', error);
        }
      };
      loadAudio();
    }

    return () => {
      if (audioRef.current) audioRef.current.unloadAsync();
    };
  }, [uri]);

  return (
    <View style={styles.container}>
      {type === 'video' ? (
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={autoPlay}
            isLooping={false}
            onPlaybackStatusUpdate={handleVideoStatus}
          />

          {/* Luxury Watermark */}
          {showWatermark && <MeadWatermark />}

          {/* Play/Pause Overlay */}
          <TouchableOpacity style={styles.playOverlay} onPress={togglePlayPause}>
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.gold} />
            ) : (
              <Ionicons 
                name={isPlaying ? "pause-circle" : "play-circle"} 
                size={80} 
                color={colors.gold} 
              />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        /* Audio Player */
        <View style={[styles.audioContainer, { backgroundColor: colors.dark }]}>
          <View style={styles.audioInfo}>
            <Ionicons name="musical-notes" size={70} color={colors.gold} />
            <Text style={styles.audioTitle}>{title || 'Now Playing'}</Text>
            <Text style={styles.audioArtist}>{artist || 'Mead Audio'}</Text>
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>

          <TouchableOpacity style={styles.audioPlayButton} onPress={togglePlayPause}>
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={52} 
              color={colors.gold} 
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  audioContainer: {
    padding: 24,
    alignItems: 'center',
  },
  audioInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  audioTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
  },
  audioArtist: {
    fontSize: 15,
    color: '#AAAAAA',
    marginTop: 4,
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  audioPlayButton: {
    padding: 12,
  },
});

export default MediaPlayer;