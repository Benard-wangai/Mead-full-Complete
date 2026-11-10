// src/screens/PermissionsScreen.tsx
// Permissions Screen for Mead - The Global Luxury Super App
// Clear overview and management of all app permissions with luxury design

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { successTap, tap } from '../utils/haptics';
import { meadLogger } from '../utils/logger';

const PermissionsScreen = () => {
  const { colors } = useTheme();

  const permissions = [
    {
      id: 'camera',
      icon: 'camera-outline',
      title: 'Camera',
      status: 'Granted',
      description: 'Used for Reels, Live streaming, video calls, and profile photos',
      color: '#00FF88',
    },
    {
      id: 'microphone',
      icon: 'mic-outline',
      title: 'Microphone',
      status: 'Granted',
      description: 'Used for voice messages, audio calls, live streaming, and Mead Clear noise cancellation',
      color: '#00FF88',
    },
    {
      id: 'photos',
      icon: 'images-outline',
      title: 'Photos & Media',
      status: 'Granted',
      description: 'Used for uploading photos/videos to posts, Marketplace listings, and stories',
      color: '#00FF88',
    },
    {
      id: 'location',
      icon: 'location-outline',
      title: 'Location',
      status: 'Not Granted',
      description: 'Used for live location sharing in chats/calls and geo-targeted Brews',
      color: '#FF9500',
    },
    {
      id: 'notifications',
      icon: 'notifications-outline',
      title: 'Notifications',
      status: 'Granted',
      description: 'Used for new messages, group updates, live streams, and payment confirmations',
      color: '#00FF88',
    },
  ];

  const requestPermission = (permissionId: string) => {
    tap();
    meadLogger.info('Permission request', { permission: permissionId });

    Alert.alert(
      "Permission Request",
      `Would you like to grant ${permissionId} permission to Mead?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Grant", 
          onPress: () => {
            successTap();
            Alert.alert("Permission Updated", `${permissionId} permission has been granted.`);
          }
        }
      ]
    );
  };

  const openSystemSettings = () => {
    tap();
    Alert.alert(
      "Open Device Settings",
      "You will be redirected to your phone's settings to manage permissions manually.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => {
          // In real app: Linking.openSettings()
          Alert.alert("Opened", "System settings would open here in production.");
        }}
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>App Permissions</Text>
        <Text style={styles.headerSubtitle}>Manage what Mead can access</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {permissions.map((perm) => (
          <TouchableOpacity 
            key={perm.id}
            style={styles.permissionCard}
            onPress={() => requestPermission(perm.title)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={perm.icon as any} size={32} color={perm.color} />
            </View>

            <View style={styles.permissionInfo}>
              <Text style={styles.permissionTitle}>{perm.title}</Text>
              <Text style={styles.permissionDesc}>{perm.description}</Text>
            </View>

            <View style={[
              styles.statusBadge,
              { backgroundColor: perm.status === 'Granted' ? '#00FF8833' : '#FF950033' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: perm.status === 'Granted' ? '#00FF88' : '#FF9500' }
              ]}>
                {perm.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.systemSettingsButton} onPress={openSystemSettings}>
          <Ionicons name="settings-outline" size={24} color={colors.gold} />
          <Text style={styles.systemSettingsText}>Manage in System Settings</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Granting permissions helps Mead deliver the best experience.{'\n'}
          You can change these anytime in your device settings.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 24 
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: '#FFD700',
    letterSpacing: 1 
  },
  headerSubtitle: { 
    fontSize: 16, 
    color: '#AAAAAA', 
    marginTop: 6 
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 18,
    borderRadius: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  permissionInfo: { flex: 1 },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  permissionDesc: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 4,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  systemSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFD70033',
  },
  systemSettingsText: {
    color: '#FFD700',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 12,
  },
  footerNote: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 13,
    marginTop: 40,
    marginBottom: 60,
    paddingHorizontal: 40,
  },
});

export default PermissionsScreen;