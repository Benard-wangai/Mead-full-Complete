// src/utils/permissions.ts
// Centralized Permission Management System for Mead - The Global Luxury Super App
// Comprehensive, fully detailed, and designed for the entire app
// Covers Camera, Microphone, Media Library, Location, and future permissions

import { Alert, Platform } from 'react-native';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useMediaLibraryPermissions } from 'expo-image-picker';
import * as Location from 'expo-location';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'undetermined';

export type PermissionResult = {
  granted: boolean;
  status: PermissionStatus;
  request: () => Promise<boolean>;
  canAskAgain?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Camera Permission Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useCameraPermission(): PermissionResult {
  const [permission, requestPermission] = useCameraPermissions();

  const request = async (): Promise<boolean> => {
    if (permission?.granted) return true;

    const { status } = await requestPermission();

    if (status === 'granted') return true;

    if (status !== 'denied') {
      showPermissionDeniedAlert(
        'Camera',
        'Live streaming, Reels recording, and profile photos'
      );
    }
    return false;
  };

  return {
    granted: permission?.granted ?? false,
    status: (permission?.status as PermissionStatus) ?? 'undetermined',
    request,
    canAskAgain: permission?.canAskAgain,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Microphone Permission Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useMicrophonePermission(): PermissionResult {
  const [permission, requestPermission] = useMicrophonePermissions();

  const request = async (): Promise<boolean> => {
    if (permission?.granted) return true;

    const { status } = await requestPermission();

    if (status === 'granted') return true;

    if (status !== 'denied') {
      showPermissionDeniedAlert(
        'Microphone',
        'Live streaming, voice calls, and voice messages'
      );
    }
    return false;
  };

  return {
    granted: permission?.granted ?? false,
    status: (permission?.status as PermissionStatus) ?? 'undetermined',
    request,
    canAskAgain: permission?.canAskAgain,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Media Library Permission Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useMediaLibraryPermission(): PermissionResult {
  const [permission, requestPermission] = useMediaLibraryPermissions();

  const request = async (): Promise<boolean> => {
    if (permission?.granted) return true;

    const { status } = await requestPermission();

    if (status === 'granted') return true;

    if (status !== 'denied') {
      showPermissionDeniedAlert(
        'Photos & Videos',
        'Uploading Reels, Marketplace listings, and profile photos'
      );
    }
    return false;
  };

  return {
    granted: permission?.granted ?? false,
    status: (permission?.status as PermissionStatus) ?? 'undetermined',
    request,
    canAskAgain: permission?.canAskAgain,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Location Permission Hook (for geo-targeted Brews and location sharing)
// ─────────────────────────────────────────────────────────────────────────────
export function useLocationPermission(): PermissionResult {
  const [permission, requestPermission] = Location.useForegroundPermissions();

  const request = async (): Promise<boolean> => {
    if (permission?.granted) return true;

    const { status } = await requestPermission();

    if (status === 'granted') return true;

    if (status !== 'denied') {
      showPermissionDeniedAlert(
        'Location',
        'Geo-targeted Brews and live location sharing'
      );
    }
    return false;
  };

  return {
    granted: permission?.granted ?? false,
    status: (permission?.status as PermissionStatus) ?? 'undetermined',
    request,
    canAskAgain: permission?.canAskAgain,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined Live Permissions (Camera + Microphone)
// ─────────────────────────────────────────────────────────────────────────────
export async function requestLivePermissions(): Promise<boolean> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const camera = useCameraPermission();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const microphone = useMicrophonePermission();

  const cameraGranted = await camera.request();
  const micGranted = await microphone.request();

  return cameraGranted && micGranted;
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined Reels Permissions (Camera + Microphone + Media Library)
// ─────────────────────────────────────────────────────────────────────────────
export async function requestReelsPermissions(): Promise<boolean> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const camera = useCameraPermission();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const microphone = useMicrophonePermission();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const mediaLibrary = useMediaLibraryPermission();

  const cameraGranted = await camera.request();
  const micGranted = await microphone.request();
  const mediaGranted = await mediaLibrary.request();

  return cameraGranted && micGranted && mediaGranted;
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined Brew Permissions (Location + optional Media)
// ─────────────────────────────────────────────────────────────────────────────
export async function requestBrewPermissions(): Promise<boolean> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const location = useLocationPermission();
  return await location.request();
}

// ─────────────────────────────────────────────────────────────────────────────
// User-friendly permission denied alert
// ─────────────────────────────────────────────────────────────────────────────
function showPermissionDeniedAlert(permissionName: string, featureDescription: string) {
  Alert.alert(
    `${permissionName} Access Denied`,
    `Mead needs ${permissionName.toLowerCase()} access for ${featureDescription}. ` +
    `Please enable it in your device Settings.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          Alert.alert(
            'How to Enable',
            Platform.OS === 'ios'
              ? `Go to Settings > Mead > Allow ${permissionName}`
              : `Go to Settings > Apps > Mead > Permissions > Allow ${permissionName}`
          );
        },
      },
    ]
  );
}

// Default export for easy importing
export default {
  useCameraPermission,
  useMicrophonePermission,
  useMediaLibraryPermission,
  useLocationPermission,
  requestLivePermissions,
  requestReelsPermissions,
  requestBrewPermissions,
};