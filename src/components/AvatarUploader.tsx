// src/components/AvatarUploader.tsx
// Luxury Avatar Uploader for Mead - Camera, Gallery, and Duo Camera Preview
// Fixed: Safe null/undefined check for result.assets + proper typing

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../utils/theme';
import { tap, successTap } from '../utils/haptics';
import { useCameraPermission, useMediaLibraryPermission } from '../utils/permissions';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface AvatarUploaderProps {
  currentAvatar?: string | null;
  // eslint-disable-next-line no-unused-vars
  onAvatarSelected: (uri: string) => void;
  size?: number;
  editable?: boolean;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatar,
  onAvatarSelected,
  size = 120,
  editable = true,
}) => {
  const { colors } = useTheme();
  const cameraPermission = useCameraPermission();
  const mediaLibraryPermission = useMediaLibraryPermission();

  const [isUploading, setIsUploading] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(currentAvatar || null);

  const handleTakePhoto = async () => {
    tap();

    const granted = await cameraPermission.request();
    if (!granted) return;

    setIsUploading(true);

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      // Fixed: Safe null/undefined check for result.assets
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset && asset.uri) {
          const uri = asset.uri;
          setAvatarUri(uri);
          onAvatarSelected(uri);
          successTap();
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChooseFromGallery = async () => {
    tap();

    const granted = await mediaLibraryPermission.request();
    if (!granted) return;

    setIsUploading(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      // Fixed: Safe null/undefined check for result.assets
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset && asset.uri) {
          const uri = asset.uri;
          setAvatarUri(uri);
          onAvatarSelected(uri);
          successTap();
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery.');
    } finally {
      setIsUploading(false);
    }
  };

  const showOptions = () => {
    if (!editable) return;

    tap();

    Alert.alert(
      'Change Profile Picture',
      'Choose how you want to update your avatar',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Gallery', onPress: handleChooseFromGallery },
      ]
    );
  };

  return (
    <TouchableOpacity 
      onPress={showOptions} 
      disabled={!editable}
      style={[styles.container, { width: size, height: size }]}
    >
      <View style={[styles.avatarWrapper, { borderColor: colors.gold }]}>
        {avatarUri ? (
          <Image 
            source={{ uri: avatarUri }} 
            style={styles.avatar} 
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.dark }]}>
            <Ionicons name="person" size={size * 0.45} color={colors.gold} />
          </View>
        )}

        {editable && (
          <View style={[styles.editBadge, { backgroundColor: colors.gold }]}>
            <Ionicons name="camera" size={18} color={colors.black} />
          </View>
        )}

        {isUploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.gold} size="large" />
          </View>
        )}
      </View>

      {editable && (
        <Text style={[styles.hint, { color: colors.gray }]}>
          Tap to change avatar
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarWrapper: {
    borderRadius: 999,
    borderWidth: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
  hint: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AvatarUploader;