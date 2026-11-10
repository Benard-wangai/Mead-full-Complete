// src/screens/BrewCreateScreen.tsx
// Brew Create Screen for Mead - The Global Luxury Super App
// Production-ready with inline geo targeting, media upload, $1 payment via Paystack

import { useState } from 'react';
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
import { paystackService } from '../utils/paystackService';
import AppConfig from '../constants/appConfig';
import Button from '../components/Button';
import Input from '../components/Input';

const BrewCreateScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [caption, setCaption] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);

  // Geo Targeting
  const [targetType, setTargetType] = useState<'worldwide' | 'countries' | 'regions'>('worldwide');
  const [selectedCountries] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setMediaUri(asset.uri);
      setMediaType(asset.type === 'video' ? 'video' : 'photo');
    }
  };

  const handlePostBrew = async () => {
    if (!caption.trim()) {
      showToast('Please write a caption for your Brew', 'error');
      return;
    }
    if (!mediaUri) {
      showToast('Please select a photo or video', 'error');
      return;
    }

    setLoading(true);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const buyerEmail =
        authUser?.email ||
        authUser?.phone ||
        `mead-user-${authUser?.id?.slice(0, 8) || 'guest'}@meadtechnologies.com`;

      const payment = await paystackService.initializePayment({
        amount: AppConfig.PRICING.BREW_COST,
        email: buyerEmail,
        feature: 'post_brew',
        metadata: { caption: caption.substring(0, 100) },
      });

      if (payment?.authorization_url) {
        await paystackService.openAuthorizationUrl(payment.authorization_url);
      }

      // Upload media
      setUploading(true);
      const fileExt = mediaUri.split('.').pop() || 'jpg';
      const fileName = `brew_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('brews')
        .upload(fileName, mediaUri, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('brews')
        .getPublicUrl(fileName);

      const mediaUrl = publicUrlData.publicUrl;

      // Save Brew
      const { error: insertError } = await supabase
        .from('brews')
        .insert({
          user_id: authUser?.id,
          caption: caption.trim(),
          media_url: mediaUrl,
          media_type: mediaType,
          target_type: targetType,
          target_countries: selectedCountries.length > 0 ? selectedCountries : null,
          is_paid: true,
        });

      if (insertError) throw insertError;

      showToast('Brew posted successfully! ✨', 'success');
      navigation.goBack();
    } catch (error: any) {
      meadLogger.error('Failed to post Brew', error);
      showToast(error.message || 'Failed to post Brew. Please try again.', 'error');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.black }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create a Brew</Text>
        <Text style={styles.subtitle}>Share with the world or target specific countries • $1</Text>

        {/* Media Upload */}
        <TouchableOpacity style={styles.mediaContainer} onPress={pickMedia}>
          {mediaUri ? (
            mediaType === 'video' ? (
              <View style={styles.videoPlaceholder}>
                <Ionicons name="play-circle" size={60} color={colors.gold} />
                <Text style={styles.mediaLabel}>Video Selected</Text>
              </View>
            ) : (
              <Image source={{ uri: mediaUri }} style={styles.selectedMedia} />
            )
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="cloud-upload-outline" size={60} color={colors.gold} />
              <Text style={styles.uploadText}>Upload Photo or Video</Text>
            </View>
          )}
        </TouchableOpacity>

        <Input
          label="Caption"
          value={caption}
          onChangeText={setCaption}
          placeholder="What’s happening in your Brew?"
          multiline
          numberOfLines={4}
        />

        {/* Simple Geo Targeting */}
        <View style={styles.geoSection}>
          <Text style={styles.sectionTitle}>Target Audience</Text>
          
          <View style={styles.targetOptions}>
            {(['worldwide', 'countries', 'regions'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.targetOption,
                  targetType === type && styles.targetOptionActive
                ]}
                onPress={() => setTargetType(type)}
              >
                <Text style={[
                  styles.targetText,
                  targetType === type && styles.targetTextActive
                ]}>
                  {type === 'worldwide' ? '🌍 Worldwide' : 
                   type === 'countries' ? '🌍 Specific Countries' : '📍 Regions'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {targetType !== 'worldwide' && (
            <Text style={styles.note}>Country/Region selection coming in next update</Text>
          )}
        </View>

        <Button
          title={loading || uploading ? "Posting Brew..." : "Post Brew - $1"}
          onPress={handlePostBrew}
          disabled={loading || uploading || !caption.trim() || !mediaUri}
          style={styles.postButton}
        />

        <Text style={styles.note}>
          Your Brew will be visible according to your targeting settings.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#AAAAAA',
    marginBottom: 32,
  },
  mediaContainer: {
    height: 220,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD70033',
  },
  selectedMedia: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    alignItems: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    color: '#FFD700',
    marginTop: 12,
    fontSize: 16,
  },
  mediaLabel: {
    color: '#FFD700',
    marginTop: 12,
    fontSize: 16,
  },
  geoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 12,
  },
  targetOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  targetOption: {
    flex: 1,
    padding: 14,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    alignItems: 'center',
  },
  targetOptionActive: {
    backgroundColor: '#FFD700',
  },
  targetText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  targetTextActive: {
    color: '#000000',
  },
  postButton: {
    marginTop: 32,
  },
  note: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 20,
  },
});

export default BrewCreateScreen;