// src/screens/CreateListingScreen.tsx
// Create Listing Screen for Mead Marketplace - The Global Luxury Super App
// Full form to create a new product listing with images, pricing, description, and escrow info

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { tap, successTap } from '../utils/haptics';
import Button from '../components/Button';
import Card from '../components/Card';

const CreateListingScreen = () => {
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [currency] = useState('KES');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pickImages = async () => {
    tap();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.9,
    });

    if (!result.canceled && result.assets) {
      const newUris = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newUris].slice(0, 5)); // max 5 images
      successTap();
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateListing = async () => {
    if (!title.trim() || !price.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in title, price, and description.');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Add Photos', 'Please add at least one photo of your item.');
      return;
    }

    setIsLoading(true);
    tap();

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      meadLogger.info('New listing created', { 
        title, 
        price: parseFloat(price), 
        imagesCount: images.length 
      });

      successTap();

      Alert.alert(
        'Listing Created Successfully!',
        `Your listing for "${title}" has been posted on Mead Marketplace.\n\nIt will be reviewed and live shortly.`,
        [
          { 
            text: 'View in Marketplace', 
            onPress: () => {
              // navigation.navigate('Marketplace') when navigator is ready
              Alert.alert('Success', 'Redirecting to Marketplace...');
            }
          }
        ]
      );

      // Reset form
      setTitle('');
      setPrice('');
      setDescription('');
      setLocation('');
      setImages([]);
    } catch (error) {
      meadLogger.error('Failed to create listing', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setIsLoading(false);
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
        <View style={styles.header}>
          <Text style={styles.title}>Create New Listing</Text>
          <Text style={styles.subtitle}>Sell with confidence — protected by Mead Escrow</Text>
        </View>

        {/* Image Upload */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Photos (Max 5)</Text>
          
          <TouchableOpacity style={styles.uploadButton} onPress={pickImages}>
            <Ionicons name="camera-outline" size={40} color={colors.gold} />
            <Text style={styles.uploadText}>Add Photos</Text>
            <Text style={styles.uploadSubtext}>Tap to select from gallery</Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Listing Details */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Listing Details</Text>
          
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Gold Luxury Watch"
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
          />

          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={styles.currencyContainer}>
              <Text style={styles.label}>Currency</Text>
              <Text style={styles.currencyText}>{currency}</Text>
            </View>
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Describe your item in detail..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={5}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Nairobi, Kenya"
            placeholderTextColor="#666"
            value={location}
            onChangeText={setLocation}
          />
        </Card>

        {/* Escrow Info */}
        <View style={styles.escrowInfo}>
          <Ionicons name="shield-checkmark-outline" size={28} color={colors.gold} />
          <View style={styles.escrowText}>
            <Text style={styles.escrowTitle}>Protected by Mead Escrow</Text>
            <Text style={styles.escrowDesc}>
              2% commission • Money held safely until buyer confirms delivery
            </Text>
          </View>
        </View>

        {/* Create Button */}
        <Button
          title={isLoading ? "Posting Listing..." : "Post Listing"}
          onPress={handleCreateListing}
          disabled={isLoading || !title.trim() || !price.trim() || !description.trim()}
          style={styles.createButton}
          variant="primary"
        />

        <Text style={styles.note}>
          Your listing will be reviewed before going live. Thank you for choosing Mead.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 24 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 6,
  },
  card: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: '#FFD700',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
  },
  descriptionInput: {
    height: 140,
    textAlignVertical: 'top',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  priceContainer: { flex: 1 },
  priceInput: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    color: '#FFD700',
    fontSize: 20,
    fontWeight: '700',
  },
  currencyContainer: {
    justifyContent: 'flex-end',
  },
  currencyText: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD70033',
    marginBottom: 16,
  },
  uploadText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  uploadSubtext: {
    color: '#666',
    marginTop: 6,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imagePreviewWrapper: {
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  escrowInfo: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    alignItems: 'center',
  },
  escrowText: { marginLeft: 16, flex: 1 },
  escrowTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFD700',
  },
  escrowDesc: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 6,
  },
  createButton: {
    marginTop: 10,
  },
  note: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 13,
    marginTop: 24,
  },
});

export default CreateListingScreen;