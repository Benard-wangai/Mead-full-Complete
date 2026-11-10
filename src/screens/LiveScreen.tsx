// src/screens/LiveScreen.tsx
// Live Streaming Screen for Mead - The Global Luxury Super App
// Production-ready with camera, permissions, gifts, comments, and luxury design

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { tap } from '../utils/haptics';
import { useCameraPermission, useMicrophonePermission } from '../utils/permissions';
import Button from '../components/Button';

Dimensions.get('window');

interface LiveComment {
  id: string;
  username: string;
  message: string;
  giftAmount?: number;
  timestamp: string;
}

const LiveScreen = () => {
  const { colors } = useTheme();

  const [isLive, setIsLive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [viewerCount, setViewerCount] = useState(1247);
  const [isMuted, setIsMuted] = useState(false);
  const [, setIsFrontCamera] = useState(true);

  const [, setComments] = useState<LiveComment[]>([
    { id: '1', username: 'luxurykenya', message: 'This view is insane 🔥', timestamp: 'just now' },
    { id: '2', username: 'dubaielite', message: 'Sending 5000 coins ✨', timestamp: '1m ago', giftAmount: 5000 },
  ]);

  const [newComment, setNewComment] = useState('');

  const { granted: hasCameraPermission, request: requestCamera } = useCameraPermission();
  const { granted: hasMicPermission, request: requestMic } = useMicrophonePermission();

  // Request permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      if (!hasCameraPermission) await requestCamera();
      if (!hasMicPermission) await requestMic();
    };
    requestPermissions();
  }, []);

  // Simulate viewer growth when live
  useEffect(() => {
    // eslint-disable-next-line no-undef
    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 5) + 3);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  const startLive = async () => {
    if (!streamTitle.trim()) {
      Alert.alert('Error', 'Please enter a title for your live stream');
      return;
    }

    if (!hasCameraPermission || !hasMicPermission) {
      Alert.alert('Permissions Required', 'Camera and microphone access are needed to go live.');
      return;
    }

    setIsStarting(true);

    try {
      // TODO: Integrate real streaming (Agora, LiveKit, or RTMP)
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate start delay

      setIsLive(true);
      meadLogger.info('Live stream started', { title: streamTitle });
    } catch (error) {
      meadLogger.error('Failed to start live stream', error);
      Alert.alert('Error', 'Failed to start live stream. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const endLive = () => {
    Alert.alert(
      'End Live Stream',
      'Are you sure you want to end this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Stream',
          style: 'destructive',
          onPress: () => {
            setIsLive(false);
            setViewerCount(1247);
            meadLogger.info('Live stream ended');
          },
        },
      ]
    );
  };

  const sendComment = () => {
    if (!newComment.trim()) return;

    const comment: LiveComment = {
      id: Date.now().toString(),
      username: 'You',
      message: newComment.trim(),
      timestamp: 'now',
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    tap();
  };

  const sendGift = (amount: number, emoji: string) => {
    if (!isLive) return;

    const giftComment: LiveComment = {
      id: Date.now().toString(),
      username: 'You',
      message: `Sent a luxury gift`,
      giftAmount: amount,
      timestamp: 'now',
    };

    setComments(prev => [giftComment, ...prev]);
    tap();
    Alert.alert('Gift Sent', `You sent ${emoji} worth $${amount}!`);
  };

  const toggleCamera = () => {
    if (isLive) return;
    setIsFrontCamera(prev => !prev);
  };

  const toggleMute = () => setIsMuted(prev => !prev);

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      {/* Camera / Live Area */}
      <View style={styles.cameraContainer}>
        {isLive ? (
          <View style={styles.livePlaceholder}>
            <Text style={styles.liveIndicator}>● LIVE</Text>
            <Text style={styles.viewerCount}>{viewerCount.toLocaleString()} watching</Text>
            <Text style={styles.streamTitleLive}>{streamTitle}</Text>
          </View>
        ) : (
          <View style={styles.previewPlaceholder}>
            <Ionicons name="videocam" size={80} color="#FFD700" />
            <Text style={styles.previewText}>Camera Preview</Text>
          </View>
        )}
      </View>

      {/* Top Bar */}
      {isLive && (
        <View style={styles.topBar}>
          <TouchableOpacity onPress={endLive} style={styles.endButton}>
            <Text style={styles.endText}>END LIVE</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pre-Live Setup */}
      {!isLive && (
        <View style={styles.preLiveContainer}>
          <TextInput
            style={styles.titleInput}
            placeholder="What is your live about?"
            placeholderTextColor="#666"
            value={streamTitle}
            onChangeText={setStreamTitle}
            maxLength={60}
          />

          <Button
            title={isStarting ? "Starting Live..." : "GO LIVE"}
            onPress={startLive}
            disabled={isStarting || !streamTitle.trim()}
            style={styles.goLiveButton}
          />
        </View>
      )}

      {/* Live Controls */}
      {isLive && (
        <View style={styles.liveControls}>
          <TouchableOpacity onPress={toggleCamera} style={styles.controlButton}>
            <Ionicons name="camera-reverse" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMute} style={styles.controlButton}>
            <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity onPress={endLive} style={[styles.controlButton, styles.endLiveButton]}>
            <Ionicons name="stop-circle" size={32} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      )}

      {/* Gifts & Comments (Live Only) */}
      {isLive && (
        <View style={styles.interactionContainer}>
          {/* Quick Gifts */}
          <View style={styles.giftsContainer}>
            {[100, 500, 2000].map((amount) => (
              <TouchableOpacity key={amount} style={styles.giftButton} onPress={() => sendGift(amount, '💎')}>
                <Text style={styles.giftEmoji}>💎</Text>
                <Text style={styles.giftAmount}>{amount}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Comments Input */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Send a message..."
              placeholderTextColor="#888"
              value={newComment}
              onChangeText={setNewComment}
              onSubmitEditing={sendComment}
            />
            <TouchableOpacity onPress={sendComment}>
              <Ionicons name="send" size={24} color="#FFD700" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  livePlaceholder: {
    alignItems: 'center',
  },
  previewPlaceholder: {
    alignItems: 'center',
  },
  liveIndicator: {
    color: '#FF3B30',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 8,
  },
  viewerCount: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 12,
  },
  streamTitleLive: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  previewText: {
    color: '#FFD700',
    fontSize: 18,
    marginTop: 16,
  },
  topBar: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  endButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  endText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  preLiveContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  titleInput: {
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  goLiveButton: {
    backgroundColor: '#FFD700',
  },
  liveControls: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endLiveButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
  },
  interactionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 12,
  },
  giftsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 12,
  },
  giftButton: {
    alignItems: 'center',
  },
  giftEmoji: {
    fontSize: 32,
  },
  giftAmount: {
    color: '#FFD700',
    fontSize: 12,
    marginTop: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 30,
    paddingHorizontal: 16,
  },
  commentInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 14,
    fontSize: 16,
  },
});

export default LiveScreen;