// src/screens/SettingsScreen.tsx
// Settings Screen for Mead - The Global Luxury Super App
// Production-ready with Supabase logout, real navigation, useToast, and luxury UX

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { useToast } from '../components/Toast';
import { supabase } from '../utils/supabaseClient';

const SettingsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileMusicEnabled, setProfileMusicEnabled] = useState(true);
  // eslint-disable-next-line no-empty-pattern
  const [] = useState(false);
  const [ultraLowDataMode, setUltraLowDataMode] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      "Logout from Mead",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;

              showToast('Logged out successfully', 'success');

              // Reset navigation to Login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error: any) {
              meadLogger.error('Logout failed', error);
              showToast('Failed to logout. Please try again.', 'error');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.black }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.subtitle}>Manage your Mead experience</Text>
      </View>

      {/* Quick Profile Edit */}
      <TouchableOpacity 
        style={styles.profileSection} 
        onPress={() => navigation.navigate('ProfileEdit')}
      >
        <View style={styles.profileAvatar}>
          <Ionicons name="person-circle" size={48} color={colors.gold} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Edit Profile</Text>
          <Text style={styles.profileDesc}>Update name, bio, and photo</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      {/* General Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>

        <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('ProfileEdit')}>
          <Ionicons name="person-circle-outline" size={24} color={colors.gold} style={styles.settingIcon} />
          <Text style={styles.settingText}>Account & Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={() => showToast('Privacy settings coming soon', 'info')}>
          <Ionicons name="lock-closed-outline" size={24} color={colors.gold} style={styles.settingIcon} />
          <Text style={styles.settingText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Communication */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Communication</Text>

        <View style={styles.settingRow}>
          <Ionicons name="notifications-outline" size={24} color={colors.gold} style={styles.settingIcon} />
          <Text style={styles.settingText}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#333', true: '#FFD70033' }}
            thumbColor={notificationsEnabled ? '#FFD700' : '#888'}
          />
        </View>

        <View style={styles.settingRow}>
          <Ionicons name="musical-notes-outline" size={24} color={colors.gold} style={styles.settingIcon} />
          <Text style={styles.settingText}>Profile Music</Text>
          <Switch
            value={profileMusicEnabled}
            onValueChange={setProfileMusicEnabled}
            trackColor={{ false: '#333', true: '#FFD70033' }}
            thumbColor={profileMusicEnabled ? '#FFD700' : '#888'}
          />
        </View>
      </View>

      {/* Data & Storage */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Storage</Text>

        <View style={styles.settingRow}>
          <Ionicons name="cloud-download-outline" size={24} color={colors.gold} style={styles.settingIcon} />
          <Text style={styles.settingText}>Ultra Low Data Mode</Text>
          <Switch
            value={ultraLowDataMode}
            onValueChange={setUltraLowDataMode}
            trackColor={{ false: '#333', true: '#FFD70033' }}
            thumbColor={ultraLowDataMode ? '#FFD700' : '#888'}
          />
        </View>

        <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Downloads')}>
          <Ionicons name="download-outline" size={24} color={colors.gold} style={styles.settingIcon} />
          <Text style={styles.settingText}>Downloads & Offline Content</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* About & Legal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About & Legal</Text>

        <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Help')}>
          <Ionicons name="help-circle-outline" size={24} color={colors.gold} style={styles.settingIcon} />
          <Text style={styles.settingText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('TermsAndConditions')}>
          <Ionicons name="document-text-outline" size={24} color={colors.gold} style={styles.settingIcon} />
          <Text style={styles.settingText}>Terms & Conditions</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={styles.logoutText}>Logout from Mead</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Mead v1.0.0 • Built for the World</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#FFD70022',
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: '#FFD700' 
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 8,
  },
  section: { 
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#FFD700', 
    marginBottom: 12,
    paddingLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  settingIcon: { 
    marginRight: 16,
    width: 28,
  },
  settingText: { 
    flex: 1, 
    fontSize: 17, 
    color: '#FFFFFF' 
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  profileAvatar: {
    marginRight: 16,
  },
  profileInfo: { flex: 1 },
  profileName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#FFFFFF' 
  },
  profileDesc: { 
    color: '#AAAAAA', 
    marginTop: 4 
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    margin: 20,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginTop: 40,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  version: {
    textAlign: 'center',
    color: '#555',
    fontSize: 13,
    marginBottom: 40,
  },
});

export default SettingsScreen;