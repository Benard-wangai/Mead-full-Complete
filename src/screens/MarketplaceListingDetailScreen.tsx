// src/screens/MarketplaceListingDetailScreen.tsx
// Marketplace Listing Detail Screen for Mead - The Global Luxury Super App
// Fully fixed with correct useToast import, escrow protection, and luxury UX

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { escrowService } from '../services/escrowService';
import { getCurrentUser } from '../utils/supabaseClient';
import { meadLogger } from '../utils/logger';
import { useToast } from '../components/Toast';   // ← Corrected import
import AppConfig from '../constants/appConfig';
import Button from '../components/Button';
import Card from '../components/Card';

Dimensions.get('window');

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  seller_id: string;
  seller_name: string;
  location: string;
  is_verified_seller: boolean;
  stock: number;
}

const MarketplaceListingDetailScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const { showToast } = useToast();   // ← Now properly imported

  const product: Product = route.params?.product;

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.black }]}>
        <Text style={styles.errorText}>Product not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const totalPrice = product.price * quantity;
  const commission = Math.round(totalPrice * AppConfig.PRICING.MARKETPLACE_COMMISSION);

  const handleBuyNow = async () => {
    if (quantity > (product.stock || 9999)) {
      Alert.alert('Out of Stock', 'The requested quantity exceeds available stock.');
      return;
    }

    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Sign In Required', 'Please log in to complete this purchase.');
        return;
      }

      const orderId = `order_${Date.now()}`;
      const buyerEmail =
        user.email ||
        user.phone ||
        `mead-user-${user.id.slice(0, 8)}@meadtechnologies.com`;

      await escrowService.initializeEscrowPayment(
        buyerEmail,
        totalPrice,
        orderId,
        product.seller_id,
        user.id,
        {
          productId: product.id,
          productTitle: product.title,
          quantity,
        }
      );

      showToast(`Secure escrow payment initialized for ${product.title}`, 'success');

      navigation.navigate('Payment', {
        feature: 'marketplace_escrow',
        amount: totalPrice,
        orderId,
      });

      meadLogger.info('Escrow payment initialized', { 
        orderId, 
        productId: product.id, 
        amount: totalPrice 
      });
    } catch (error: any) {
      meadLogger.error('Escrow payment failed', error);
      showToast('Failed to initialize payment. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const increaseQuantity = () => {
    if (quantity < (product.stock || 9999)) setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.black }]}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.image }} 
          style={styles.productImage} 
          resizeMode="cover" 
        />
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={() => setIsFavorited(!isFavorited)}
        >
          <Ionicons 
            name={isFavorited ? "heart" : "heart-outline"} 
            size={28} 
            color={isFavorited ? "#FF3B30" : "#FFFFFF"} 
          />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{product.title}</Text>
        
        <View style={styles.sellerRow}>
          <Text style={styles.sellerName}>by {product.seller_name}</Text>
          {product.is_verified_seller && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#FFD700" />
              <Text style={styles.verifiedText}>Verified Seller</Text>
            </View>
          )}
        </View>

        <Text style={styles.location}>{product.location}</Text>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>$</Text>
          <Text style={styles.price}>{product.price.toLocaleString()}</Text>
        </View>

        {/* Description */}
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>

        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity onPress={decreaseQuantity} style={styles.quantityButton}>
              <Ionicons name="remove" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{quantity}</Text>
            
            <TouchableOpacity onPress={increaseQuantity} style={styles.quantityButton}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.stockInfo}>{product.stock} available</Text>
        </View>

        {/* Cost Breakdown */}
        <Card style={styles.costCard}>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Subtotal</Text>
            <Text style={styles.costValue}>
              ${(product.price * quantity).toLocaleString()}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Mead Commission (2%)</Text>
            <Text style={styles.costValue}>${commission.toLocaleString()}</Text>
          </View>
          <View style={[styles.costRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalPrice.toLocaleString()}</Text>
          </View>
        </Card>

        {/* Escrow Protection Banner */}
        <View style={styles.escrowBanner}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#FFD700" />
          <Text style={styles.escrowText}>
            Protected by Escrow • Funds held until you confirm delivery
          </Text>
        </View>

        {/* Buy Now Button */}
        <Button
          title={loading ? "Processing Secure Payment..." : `Buy Now - $${totalPrice.toLocaleString()}`}
          onPress={handleBuyNow}
          disabled={loading}
          style={styles.buyButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: {
    height: 380,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 30,
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerName: {
    color: '#CCCCCC',
    fontSize: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70022',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  verifiedText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  location: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  currency: {
    fontSize: 24,
    color: '#FFD700',
    marginRight: 4,
  },
  price: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFD700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 12,
  },
  description: {
    color: '#CCCCCC',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  quantityContainer: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 8,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 24,
  },
  stockInfo: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  costCard: {
    marginBottom: 24,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  costLabel: {
    color: '#CCCCCC',
  },
  costValue: {
    color: '#FFFFFF',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#FFD70033',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
  totalValue: {
    fontWeight: '700',
    fontSize: 18,
    color: '#FFD700',
  },
  escrowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  escrowText: {
    color: '#FFD700',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  buyButton: {
    marginBottom: 40,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default MarketplaceListingDetailScreen;