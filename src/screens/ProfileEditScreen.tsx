/* eslint-disable no-undef */
// src/screens/ProfileEditScreen.tsx
// Profile Edit Screen for Mead - The Global Luxury Super App
// Production-ready with Supabase avatar upload, proper publicUrl handling, and luxury UX

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { useToast } from '../components/Toast';
import { supabase } from '../utils/supabaseClient';
import Button from '../components/Button';
import Input from '../components/Input';

const ProfileEditScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    full_name: '',
    bio: '',
    phone: '',
    avatar_url: '',
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Load current profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, bio, phone, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfile({
          full_name: data?.full_name || '',
          bio: data?.bio || '',
          phone: data?.phone || '',
          avatar_url: data?.avatar_url || '',
        });
      } catch (error: any) {
        meadLogger.error('Failed to load profile', error);
        showToast('Failed to load profile data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [showToast]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!profile.full_name.trim()) {
      showToast('Full name is required', 'error');
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let avatarUrl = profile.avatar_url;

      // Upload new avatar if selected
      if (selectedImage) {
        const fileExt = selectedImage.split('.').pop() || 'jpg';
        const fileName = `avatar_${user.id}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, selectedImage, { upsert: true });

        if (uploadError) throw uploadError;

        // Fixed: Correct publicUrl access
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name.trim(),
          bio: profile.bio.trim(),
          phone: profile.phone.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      showToast('Profile updated successfully!', 'success');
      navigation.goBack();
    } catch (error: any) {
      meadLogger.error('Profile update failed', error);
      showToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.black }]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.black }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Keep your luxury identity updated</Text>

        {/* Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          <Image
            source={
              selectedImage
                ? { uri: selectedImage }
                : profile.avatar_url
                ? { uri: profile.avatar_url }
                : require('../assets/default-avatar.png')
            }
            style={styles.avatar}
          />
          <View style={styles.editOverlay}>
            <Ionicons name="camera" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.changePhotoText}>Tap to change photo</Text>

        {/* Form Fields */}
        <Input
          label="Full Name"
          value={profile.full_name}
          onChangeText={(text) => setProfile({ ...profile, full_name: text })}
          placeholder="Your full name"
        />

        <Input
          label="Bio"
          value={profile.bio}
          onChangeText={(text) => setProfile({ ...profile, bio: text })}
          placeholder="Tell the world about yourself..."
          multiline
          numberOfLines={4}
        />

        <Input
          label="Phone Number"
          value={profile.phone}
          onChangeText={(text) => setProfile({ ...profile, phone: text })}
          placeholder="+254 700 000 000"
          keyboardType="phone-pad"
        />

        <Button
          title={saving ? "Saving Changes..." : "Save Profile"}
          onPress={handleSave}
          disabled={saving || !profile.full_name.trim()}
          style={styles.saveButton}
        />

        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 40,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    textAlign: 'center',
    color: '#FFD700',
    fontSize: 15,
    marginBottom: 32,
  },
  saveButton: {
    marginTop: 32,
    marginBottom: 16,
  },
  cancelButton: {
    alignItems: 'center',
  },
  cancelText: {
    color: '#888888',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#AAAAAA',
    marginTop: 16,
  },
});

export default ProfileEditScreen;