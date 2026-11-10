// src/screens/MarketplaceScreen.tsx
// Fully Updated Marketplace Screen for Mead
// Connected to Supabase + Fixed Button style error + Clean luxury design

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { tap } from '../utils/haptics';
import Card from '../components/Card';
import Button from '../components/Button';
import { supabase } from '../utils/supabaseClient';

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  seller_name: string;
  location: string;
  rating: number;
  is_verified: boolean;
  description: string;
  stock: number;
}

const MarketplaceScreen = ({ navigation }: any) => {
  const { colors } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['All', 'Fashion', 'Electronics', 'Luxury Watches', 'Home'];

  // Fetch products from Supabase
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formattedProducts: Product[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        currency: item.currency || 'KES',
        image_url: item.image_url,
        seller_name: item.seller_name || 'Unknown Seller',
        location: item.location || 'Unknown Location',
        rating: item.rating || 0,
        is_verified: item.is_verified || false,
        description: item.description || '',
        stock: item.stock || 0,
      }));

      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);

      meadLogger.info(`Loaded ${formattedProducts.length} products from Supabase`);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load marketplace products. Please try again later.');
      meadLogger.error('Marketplace fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search filter
  useEffect(() => {
    let result = [...products];

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      result = result.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        product.seller_name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredProducts(result);
  }, [searchText, products]);

  const handleProductPress = (product: Product) => {
    tap();
    navigation.navigate('MarketplaceDetail', {
      productId: product.id,
      title: product.title,
      product,
    });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      onPress={() => handleProductPress(item)} 
      activeOpacity={0.9}
    >
      <Card style={styles.productCard}>
        <Image 
          source={item.image_url ? { uri: item.image_url } : require('../assets/default-avatar.png')} 
          style={styles.productImage} 
          resizeMode="cover" 
        />

        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>

          <View style={styles.sellerRow}>
            <Text style={styles.sellerName}>{item.seller_name}</Text>
            {item.is_verified && (
              <Ionicons name="checkmark-circle" size={16} color={colors.gold} />
            )}
          </View>

          <Text style={styles.location}>{item.location}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {item.price.toLocaleString()} {item.currency}
            </Text>
            <Text style={styles.rating}>★ {item.rating}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.black }]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Loading luxury marketplace...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.black }]}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          title="Retry" 
          onPress={fetchProducts} 
          style={{ marginTop: 24 }} 
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <TouchableOpacity onPress={() => Alert.alert('Sell on Mead', 'Create listing feature coming soon')}>
          <Ionicons name="add-circle" size={28} color={colors.gold} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products or sellers..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === cat && styles.categoryTextActive,
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={70} color="#444" />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    margin: 16,
    borderRadius: 25,
    paddingHorizontal: 16,
  },
  searchIcon: { marginRight: 12 },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
  },
  categoryScroll: { maxHeight: 60 },
  categoryContent: { paddingHorizontal: 16, paddingVertical: 8 },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryButtonActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  categoryText: { color: '#FFFFFF', fontWeight: '600' },
  categoryTextActive: { color: '#000000', fontWeight: '700' },
  productsList: { padding: 16, paddingBottom: 100 },
  productCard: { marginBottom: 20 },
  productImage: {
    width: '100%',
    height: 220,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  productInfo: { padding: 16 },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sellerName: {
    fontSize: 15,
    color: '#CCCCCC',
    marginRight: 6,
  },
  location: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
  },
  rating: {
    fontSize: 15,
    color: '#FFD700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
});

export default MarketplaceScreen;