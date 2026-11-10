// src/screens/ProfileScreen.tsx
// Updated Profile Screen - Now connected to Supabase
// Fetches real user data from the 'profiles' table

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { tap, successTap } from '../utils/haptics';
import { supabase } from '../utils/supabaseClient';
import Button from '../components/Button';
import Card from '../components/Card';

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  followers: number;
  following: number;
  brews_posted: number;
  created_at: string;
}

const ProfileScreen = ({ navigation }: any) => {
  const { colors } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile from Supabase
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found. Please log in again.');
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      setProfile({
        id: user.id,
        username: data?.username || user.email?.split('@')[0] || 'mead_user',
        full_name: data?.full_name || 'Mead User',
        avatar_url: data?.avatar_url,
        bio: data?.bio || 'Exploring the world through luxury and connection.',
        followers: data?.followers || 0,
        following: data?.following || 0,
        brews_posted: data?.brews_posted || 0,
        created_at: data?.created_at || new Date().toISOString(),
      });

      meadLogger.info('Profile loaded successfully', { userId: user.id });

    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'Failed to load profile');
      meadLogger.error('Failed to fetch profile', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    tap();
    Alert.alert(
      'Logout',
      'Are you sure you want to log out from Mead?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              successTap();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    tap();
    navigation.navigate('ProfileEdit');
  };

  // Loading State
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.black }]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Loading your luxury profile...</Text>
      </View>
    );
  }

  // Error State
  if (error || !profile) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.black }]}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
        <Text style={styles.errorText}>{error || 'Unable to load profile'}</Text>
        <Button 
          title="Retry" 
          onPress={fetchProfile} 
          style={{ marginTop: 20 }} 
        />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.black }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header / Avatar Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleEditProfile}>
          <Image
            source={
              profile.avatar_url 
                ? { uri: profile.avatar_url } 
                : require('../assets/default-avatar.png')
            }
            style={styles.avatar}
          />
        </TouchableOpacity>

        <Text style={styles.username}>@{profile.username}</Text>
        <Text style={styles.fullName}>{profile.full_name}</Text>

        {profile.bio && (
          <Text style={styles.bio}>{profile.bio}</Text>
        )}

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{profile.followers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{profile.following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{profile.brews_posted}</Text>
          <Text style={styles.statLabel}>Brews Posted</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Button 
          title="My Brews" 
          onPress={() => Alert.alert('My Brews', 'Brew history coming soon')} 
          variant="secondary"
        />
        <Button 
          title="My Purchases" 
          onPress={() => Alert.alert('Purchases', 'Order history coming soon')} 
          variant="secondary"
        />
        <Button 
          title="Saved Items" 
          onPress={() => Alert.alert('Saved', 'Saved items coming soon')} 
          variant="secondary"
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
        <Text style={styles.logoutText}>Logout from Mead</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#FFD700',
    marginBottom: 16,
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 4,
  },
  fullName: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: '#CCCCCC',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 10,
  },
  editButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: 16,
    width: '30%',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 13,
    color: '#888888',
    marginTop: 4,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingText: {
    color: '#888',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProfileScreen;