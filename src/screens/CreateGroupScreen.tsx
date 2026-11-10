// src/screens/CreateGroupScreen.tsx
// Create Group Screen for Mead - The Global Luxury Super App
// Production-ready with Supabase integration, image upload, Mega Group upgrade, and luxury UX

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { useToast } from '../components/Toast';
import { supabase } from '../utils/supabaseClient';
import AppConfig from '../constants/appConfig';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const CreateGroupScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isMegaGroup, setIsMegaGroup] = useState(false);
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setGroupImage(result.assets[0].uri);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      showToast('Group name is required', 'error');
      return;
    }
    if (groupName.length > 60) {
      showToast('Group name must be under 60 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to create a group');

      let avatarUrl: string | null = null;

      // Upload group image if selected
      if (groupImage) {
        setUploading(true);
        const fileExt = groupImage.split('.').pop() || 'jpg';
        const fileName = `group_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('group-avatars')
          .upload(fileName, groupImage, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('group-avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrlData.publicUrl;
        setUploading(false);
      }

      // Insert new group
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: groupName.trim(),
          description: description.trim() || null,
          is_private: isPrivate,
          is_mega: isMegaGroup,
          avatar_url: avatarUrl,
          creator_id: user.id,
          member_count: 1,
          max_members: isMegaGroup ? 10000000 : 10000,
        })
        .select()
        .single();

      if (error) throw error;

      showToast(`Group "${groupName}" created successfully!`, 'success');

      // Navigate to the new group
      navigation.replace('GroupDetail', { groupId: data.id });

      meadLogger.info('Group created successfully', { 
        groupId: data.id, 
        name: groupName, 
        isMega: isMegaGroup 
      });

      // Reset form
      setGroupName('');
      setDescription('');
      setGroupImage(null);
      setIsPrivate(false);
      setIsMegaGroup(false);

    } catch (error: any) {
      meadLogger.error('Failed to create group', error);
      showToast(error.message || 'Failed to create group. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.black }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create New Group</Text>
        <Text style={styles.subtitle}>Build your luxury community on Mead</Text>

        {/* Group Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {groupImage ? (
            <Image source={{ uri: groupImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="camera-outline" size={48} color={colors.gold} />
              <Text style={styles.uploadText}>Add Group Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <Input
          label="Group Name"
          value={groupName}
          onChangeText={setGroupName}
          placeholder="e.g. Nairobi Luxury Network"
          maxLength={60}
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="What is this group about?"
          multiline
          numberOfLines={4}
        />

        {/* Privacy Option */}
        <Card style={styles.optionCard}>
          <View style={styles.optionRow}>
            <Ionicons name="lock-closed-outline" size={24} color={colors.gold} />
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Private Group</Text>
              <Text style={styles.optionDesc}>Only invited people can join</Text>
            </View>
            <TouchableOpacity onPress={() => setIsPrivate(!isPrivate)}>
              <Ionicons 
                name={isPrivate ? "toggle" : "toggle-outline"} 
                size={34} 
                color={isPrivate ? colors.gold : "#666"} 
              />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Mega Group Option */}
        <Card style={styles.optionCard}>
          <View style={styles.optionRow}>
            <Ionicons name="star" size={24} color="#FFD700" />
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Mega Group</Text>
              <Text style={styles.optionDesc}>
                Up to 10 Million members • One-time ${AppConfig.PRICING?.MEGA_GROUP_UPGRADE || 10}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsMegaGroup(!isMegaGroup)}>
              <Ionicons 
                name={isMegaGroup ? "toggle" : "toggle-outline"} 
                size={34} 
                color={isMegaGroup ? colors.gold : "#666"} 
              />
            </TouchableOpacity>
          </View>
        </Card>

        <Button
          title={loading || uploading ? "Creating Group..." : "Create Group"}
          onPress={handleCreateGroup}
          disabled={loading || uploading || !groupName.trim()}
          style={styles.createButton}
        />

        <Text style={styles.note}>
          Groups are moderated. Mega Groups require a one-time upgrade payment.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 32,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  uploadText: {
    color: '#FFD700',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  optionCard: {
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  optionDesc: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
  },
  createButton: {
    marginTop: 32,
    marginBottom: 20,
  },
  note: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
});

export default CreateGroupScreen;