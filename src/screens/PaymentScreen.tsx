// src/screens/PaymentScreen.tsx
// Payment Screen for Mead - The Global Luxury Super App
// Beautiful, professional payment interface with Paystack integration

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { paystackService } from '../utils/paystackService';
import { getCurrentUser } from '../utils/supabaseClient';
import { meadLogger } from '../utils/logger';
import AppConfig from '../constants/appConfig';
import Button from '../components/Button';
import Card from '../components/Card';

const PaymentScreen = () => {
  const { colors } = useTheme();
  const [loadingFeature, setLoadingFeature] = useState<string | null>(null);

  // Local showToast function (since we removed global context for simplicity)
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    Alert.alert(
      type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info',
      message,
      [{ text: 'OK' }]
    );
  };

  const plans = [
    {
      id: 'mead_ai',
      title: 'Mead AI Unlimited',
      subtitle: 'Unlimited frontier intelligence',
      price: AppConfig.PRICING.MEAD_AI_UNLIMITED_MONTHLY,
      period: 'month',
      icon: 'sparkles' as const,
      color: '#FFD700',
    },
    {
      id: 'audio_pro',
      title: 'Audio Calls Pro',
      subtitle: 'Unlimited crystal-clear audio calls',
      price: AppConfig.PRICING.AUDIO_CALLS_PRO_6MONTHS,
      period: '6 months',
      icon: 'call' as const,
      color: '#00C853',
    },
    {
      id: 'video_pro',
      title: 'Video Calls Pro',
      subtitle: 'Unlimited HD video calls + screen share',
      price: AppConfig.PRICING.VIDEO_CALLS_PRO_6MONTHS,
      period: '6 months',
      icon: 'videocam' as const,
      color: '#FF3B30',
    },
    {
      id: 'seller_verification',
      title: 'Seller Verification',
      subtitle: 'Trust badge + priority listing',
      price: AppConfig.PRICING.SELLER_VERIFICATION,
      period: 'one-time',
      icon: 'shield-checkmark' as const,
      color: '#FFD700',
    },
  ];

  const handlePayment = async (plan: any) => {
    setLoadingFeature(plan.id);

    try {
      const user = await getCurrentUser();
      const email =
        user?.email ||
        user?.phone ||
        `mead-user-${user?.id?.slice(0, 8) || 'guest'}@meadtechnologies.com`;

      const result = await paystackService.initializePayment({
        email,
        amount: plan.price,
        feature: plan.id,
        isSubscription: plan.period !== 'one-time',
      });

      if (result?.authorization_url) {
        await paystackService.openAuthorizationUrl(result.authorization_url);
        showToast(`Complete payment for ${plan.title} in your browser.`, 'success');
      } else {
        showToast('Payment initialized but no checkout URL was returned.', 'error');
      }
      
      meadLogger.info('Payment initialized', { 
        feature: plan.id, 
        amount: plan.price,
        reference: result.reference 
      });

    } catch (error: any) {
      showToast('Payment initialization failed. Please try again.', 'error');
      meadLogger.error('Payment failed', { feature: plan.id, error: error.message });
    } finally {
      setLoadingFeature(null);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.black }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Upgrade Experience</Text>
        <Text style={styles.subtitle}>Unlock premium features</Text>
      </View>

      {plans.map((plan) => (
        <Card key={plan.id} style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={[styles.iconContainer, { backgroundColor: plan.color + '22' }]}>
              <Ionicons name={plan.icon} size={32} color={plan.color} />
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.currency}>$</Text>
            <Text style={styles.price}>{plan.price}</Text>
            <Text style={styles.period}>/{plan.period}</Text>
          </View>

          <Button
            title={loadingFeature === plan.id ? "Processing..." : "Pay Now"}
            onPress={() => handlePayment(plan)}
            disabled={loadingFeature === plan.id}
            style={styles.payButton}
          />
        </Card>
      ))}

      <Text style={styles.footerText}>
        Secure payments powered by Paystack. 
        Marketplace purchases are protected with 2% escrow.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  planCard: {
    marginBottom: 20,
    padding: 20,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planSubtitle: {
    fontSize: 15,
    color: '#AAAAAA',
    marginTop: 4,
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
    color: '#FFFFFF',
  },
  period: {
    fontSize: 18,
    color: '#AAAAAA',
    marginLeft: 8,
  },
  payButton: {
    marginTop: 8,
  },
  footerText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 14,
    marginTop: 20,
    marginBottom: 40,
  },
});

export default PaymentScreen;