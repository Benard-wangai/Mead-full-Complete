// src/screens/ReferralScreen.tsx
// Referral Screen for Mead - The Global Luxury Super App
// Invite friends and earn rewards with beautiful sharing options

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { tap, successTap } from '../utils/haptics';
import { meadLogger } from '../utils/logger';
import Card from '../components/Card';

const ReferralScreen = () => {
  const { colors } = useTheme();

  const [referralCode] = useState("MEAD-BENARD-0926"); // Your unique code
  const [referralsCount] = useState(12);
  const [totalEarned] = useState(2450); // in KES

  const inviteViaWhatsApp = async () => {
    tap();
    const message = `Join me on Mead - The Global Luxury Super App!\n\nUse my referral code: ${referralCode}\n\nDownload here: https://meadtechnologies.com\n\nLet's enjoy luxury together! 🖤✨`;

    try {
      await Share.share({
        message: message,
      });
      successTap();
    } catch (error) {
      Alert.alert("Share Failed", "Couldn't open share sheet.");
    }
  };

  const copyReferralCode = () => {
    tap();
    // In real app, use Clipboard.setStringAsync(referralCode)
    Alert.alert("Copied!", `Referral code ${referralCode} copied to clipboard.`);
    successTap();
    meadLogger.info('Referral code copied', { code: referralCode });
  };

  const viewReferralHistory = () => {
    tap();
    Alert.alert(
      "Referral History",
      `You have successfully referred ${referralsCount} friends.\n\nTotal earnings: KES ${totalEarned.toLocaleString()}\n\nKeep inviting for more rewards!`
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <Text style={styles.headerSubtitle}>Invite friends • Get rewarded</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Reward Summary */}
        <Card style={styles.rewardCard}>
          <Text style={styles.rewardTitle}>Your Referral Stats</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{referralsCount}</Text>
              <Text style={styles.statLabel}>Friends Joined</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>KES {totalEarned.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
          </View>

          <Text style={styles.rewardNote}>
            Earn KES 200 for every friend who joins and makes their first purchase or subscription.
          </Text>
        </Card>

        {/* Referral Code */}
        <Card style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Unique Referral Code</Text>
          <TouchableOpacity style={styles.codeContainer} onPress={copyReferralCode}>
            <Text style={styles.referralCode}>{referralCode}</Text>
            <Ionicons name="copy-outline" size={22} color={colors.gold} />
          </TouchableOpacity>
          <Text style={styles.codeHelper}>Tap to copy</Text>
        </Card>

        {/* How it Works */}
        <Card style={styles.howItWorksCard}>
          <Text style={styles.sectionTitle}>How Refer & Earn Works</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumText}>1</Text></View>
            <Text style={styles.stepText}>Share your referral code with friends</Text>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumText}>2</Text></View>
            <Text style={styles.stepText}>They download Mead and sign up using your code</Text>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumText}>3</Text></View>
            <Text style={styles.stepText}>They make their first purchase or subscription</Text>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumText}>4</Text></View>
            <Text style={styles.stepText}>You earn KES 200 per successful referral</Text>
          </View>
        </Card>

        {/* Invite Buttons */}
        <View style={styles.inviteSection}>
          <Text style={styles.inviteTitle}>Invite Friends Now</Text>
          
          <TouchableOpacity style={styles.inviteButton} onPress={inviteViaWhatsApp}>
            <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
            <Text style={styles.inviteButtonText}>Share on WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.inviteButton} onPress={copyReferralCode}>
            <Ionicons name="copy" size={28} color={colors.gold} />
            <Text style={styles.inviteButtonText}>Copy Referral Code</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.historyButton} onPress={viewReferralHistory}>
          <Text style={styles.historyText}>View Referral History</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 24 
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: '#FFD700',
    letterSpacing: 1 
  },
  headerSubtitle: { 
    fontSize: 16, 
    color: '#AAAAAA', 
    marginTop: 6 
  },
  rewardCard: { margin: 20 },
  rewardTitle: { fontSize: 20, fontWeight: '700', color: '#FFD700', marginBottom: 16 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '700', color: '#FFD700' },
  statLabel: { fontSize: 14, color: '#AAAAAA', marginTop: 4 },
  statDivider: { width: 1, height: 50, backgroundColor: '#333' },
  rewardNote: { fontSize: 15, color: '#CCCCCC', textAlign: 'center' },

  codeCard: { marginHorizontal: 20, marginBottom: 20 },
  codeLabel: { fontSize: 16, color: '#FFD700', marginBottom: 12 },
  codeContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  referralCode: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  codeHelper: { fontSize: 13, color: '#888', marginTop: 8, textAlign: 'center' },

  howItWorksCard: { marginHorizontal: 20, marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFD700', marginBottom: 20 },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumText: { color: '#000', fontWeight: '700', fontSize: 16 },
  stepText: { flex: 1, fontSize: 16, color: '#CCCCCC', lineHeight: 24 },

  inviteSection: { paddingHorizontal: 20, marginBottom: 40 },
  inviteTitle: { fontSize: 20, fontWeight: '700', color: '#FFD700', marginBottom: 16 },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 16,
  },

  historyButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  historyText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReferralScreen;