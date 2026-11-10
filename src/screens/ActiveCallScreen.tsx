/* eslint-disable no-undef */
// src/screens/ActiveCallScreen.tsx
// Active Call Screen for Mead - The Global Luxury Super App
// Beautiful in-call interface with video/voice support, controls, and luxury design

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { tap, successTap } from '../utils/haptics';
import { meadLogger } from '../utils/logger';

Dimensions.get('window');

const ActiveCallScreen = ({ route }: any) => {
  useTheme();
  const { contactName = "Unknown", contactAvatar, callType = "video" } = route?.params || {};

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === "video");
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Simulate call connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
      successTap();
    }, 1200);

    // Call duration timer
    const durationTimer = setInterval(() => {
      if (isConnected) {
        setCallDuration(prev => prev + 1);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(durationTimer);
    };
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    tap();
    meadLogger.info('Call ended', { contact: contactName, duration: callDuration });
    
    Alert.alert(
      "Call Ended",
      `Call with ${contactName} ended.\nDuration: ${formatDuration(callDuration)}`,
      [{ 
        text: "OK", 
        onPress: () => {
          // In real app: navigation.goBack()
          Alert.alert("Call Ended", "Returning to Calls screen...");
        }
      }]
    );
  };

  const toggleMute = () => {
    tap();
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    tap();
    setIsSpeakerOn(!isSpeakerOn);
  };

  const toggleVideo = () => {
    tap();
    if (callType === "voice") return;
    setIsVideoOn(!isVideoOn);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={endCall} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.callStatus}>
          {isConnected ? "Connected" : "Connecting..."}
        </Text>
        <Text style={styles.duration}>
          {formatDuration(callDuration)}
        </Text>
      </View>

      {/* Main Call Area */}
      <View style={styles.callArea}>
        <View style={styles.remoteVideo}>
          {callType === "video" && isVideoOn ? (
            <Image 
              source={contactAvatar || require('../assets/default-avatar.png')} 
              style={styles.remoteImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.audioOnlyContainer}>
              <Image 
                source={contactAvatar || require('../assets/default-avatar.png')} 
                style={styles.audioAvatar} 
              />
              <Text style={styles.audioOnlyText}>{contactName}</Text>
              <Text style={styles.audioOnlySubtext}>Voice Call</Text>
            </View>
          )}
        </View>

        {/* Local Video (Picture-in-Picture) */}
        {callType === "video" && isVideoOn && (
          <View style={styles.localVideo}>
            <Image 
              source={require('../assets/default-avatar.png')} 
              style={styles.localImage} 
            />
          </View>
        )}
      </View>

      {/* Call Info */}
      <View style={styles.callInfo}>
        <Text style={styles.contactName}>{contactName}</Text>
        <Text style={styles.callTypeText}>
          {callType === "video" ? "Video Call" : "Voice Call"}
        </Text>
      </View>

      {/* Call Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.controlButton, isMuted && styles.controlButtonActive]} 
          onPress={toggleMute}
        >
          <Ionicons 
            name={isMuted ? "mic-off" : "mic"} 
            size={28} 
            color={isMuted ? "#FF3B30" : "#FFF"} 
          />
          <Text style={styles.controlLabel}>Mute</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]} 
          onPress={toggleSpeaker}
        >
          <Ionicons 
            name={isSpeakerOn ? "volume-high" : "volume-medium"} 
            size={28} 
            color="#FFF" 
          />
          <Text style={styles.controlLabel}>Speaker</Text>
        </TouchableOpacity>

        {callType === "video" && (
          <TouchableOpacity 
            style={[styles.controlButton, !isVideoOn && styles.controlButtonActive]} 
            onPress={toggleVideo}
          >
            <Ionicons 
              name={isVideoOn ? "videocam" : "videocam-off"} 
              size={28} 
              color={isVideoOn ? "#FFF" : "#FF3B30"} 
            />
            <Text style={styles.controlLabel}>Video</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.endCallButton} 
          onPress={endCall}
        >
          <Ionicons name="call" size={32} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: { padding: 8 },
  callStatus: { color: '#00FF88', fontSize: 16, fontWeight: '600' },
  duration: { color: '#FFF', fontSize: 16, fontWeight: '500' },

  callArea: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteImage: {
    width: '100%',
    height: '100%',
  },
  audioOnlyContainer: {
    alignItems: 'center',
  },
  audioAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  audioOnlyText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
  },
  audioOnlySubtext: {
    color: '#AAAAAA',
    fontSize: 16,
    marginTop: 8,
  },
  localVideo: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 100,
    height: 140,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFD700',
    overflow: 'hidden',
  },
  localImage: {
    width: '100%',
    height: '100%',
  },

  callInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  contactName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  callTypeText: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 4,
  },

  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#111111',
  },
  controlButton: {
    alignItems: 'center',
    padding: 12,
  },
  controlButtonActive: {
    backgroundColor: '#333',
    borderRadius: 50,
  },
  controlLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 6,
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ActiveCallScreen;