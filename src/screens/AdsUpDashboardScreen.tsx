// src/screens/AdsUpDashboardScreen.tsx
// Ads Up Dashboard for Brands - Mead Advertising Platform
// Professional dashboard for brands to create, manage, and track sponsored content

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { tap, successTap } from '../utils/haptics';
import Card from '../components/Card';

const AdsUpDashboardScreen = () => {
  const { colors } = useTheme();

  const [activeCampaigns] = useState(3);
  const [totalSpent] = useState(124500); // KES
  const [totalImpressions] = useState(245000);
  // eslint-disable-next-line no-empty-pattern
  const [] = useState(18400);

  const campaigns = [
    {
      id: 'c1',
      title: 'Luxury Watch Collection Launch',
      status: 'Active',
      budget: 45000,
      spent: 32800,
      impressions: 89000,
      engagements: 6200,
      endDate: 'May 15, 2026',
    },
    {
      id: 'c2',
      title: 'Premium Leather Bags Promotion',
      status: 'Active',
      budget: 32000,
      spent: 18500,
      impressions: 67000,
      engagements: 4300,
      endDate: 'April 30, 2026',
    },
    {
      id: 'c3',
      title: 'Saffron Brand Awareness',
      status: 'Paused',
      budget: 28000,
      spent: 12400,
      impressions: 45000,
      engagements: 2100,
      endDate: 'May 10, 2026',
    },
  ];

  const createNewCampaign = () => {
    tap();
    Alert.alert(
      "Create New Ads Up Campaign",
      "Set your budget, target audience, and content.\n\nMinimum budget: KES 50,000",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Start Campaign", 
          onPress: () => {
            successTap();
            Alert.alert("Campaign Creator", "Redirecting to campaign setup...");
          }
        }
      ]
    );
  };

  const manageCampaign = (campaign: any) => {
    tap();
    Alert.alert(
      campaign.title,
      `Status: ${campaign.status}\nBudget: KES ${campaign.budget.toLocaleString()}\nSpent: KES ${campaign.spent.toLocaleString()}`,
      [
        { text: "View Analytics", onPress: () => Alert.alert("Analytics", "Detailed performance coming soon") },
        { text: "Pause / Resume", onPress: () => Alert.alert("Action", "Campaign status updated") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ads Up Dashboard</Text>
        <Text style={styles.headerSubtitle}>Premium Advertising Platform</Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{activeCampaigns}</Text>
          <Text style={styles.statLabel}>Active Campaigns</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statValue}>KES {totalSpent.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{(totalImpressions / 1000).toFixed(0)}K</Text>
          <Text style={styles.statLabel}>Impressions</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <TouchableOpacity style={styles.createButton} onPress={createNewCampaign}>
        <Ionicons name="add-circle" size={24} color="#000" />
        <Text style={styles.createButtonText}>Create New Campaign</Text>
      </TouchableOpacity>

      {/* Active Campaigns */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Campaigns</Text>

        {campaigns.map((campaign) => (
          <TouchableOpacity 
            key={campaign.id} 
            style={styles.campaignCard}
            onPress={() => manageCampaign(campaign)}
          >
            <View style={styles.campaignHeader}>
              <Text style={styles.campaignTitle}>{campaign.title}</Text>
              <Text style={[
                styles.statusBadge,
                campaign.status === 'Active' ? styles.activeStatus : styles.pausedStatus
              ]}>
                {campaign.status}
              </Text>
            </View>

            <View style={styles.campaignStats}>
              <Text style={styles.statSmall}>
                Spent: <Text style={{ color: '#FFD700' }}>KES {campaign.spent.toLocaleString()}</Text>
              </Text>
              <Text style={styles.statSmall}>
                Impressions: {(campaign.impressions / 1000).toFixed(0)}K
              </Text>
            </View>

            <Text style={styles.endDate}>Ends: {campaign.endDate}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.footerNote}>
        Minimum campaign budget is KES 50,000. Performance is tracked in real-time.
      </Text>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 13,
    color: '#AAAAAA',
    marginTop: 6,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  createButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 17,
    marginLeft: 10,
  },
  section: { paddingHorizontal: 20, marginBottom: 40 },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#FFFFFF', 
    marginBottom: 16 
  },
  campaignCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  activeStatus: { backgroundColor: '#00FF8833', color: '#00FF88' },
  pausedStatus: { backgroundColor: '#FF950033', color: '#FF9500' },
  campaignStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statSmall: {
    fontSize: 15,
    color: '#CCCCCC',
  },
  endDate: {
    fontSize: 14,
    color: '#888888',
  },
  footerNote: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 13,
    marginBottom: 60,
    paddingHorizontal: 40,
  },
});

export default AdsUpDashboardScreen;