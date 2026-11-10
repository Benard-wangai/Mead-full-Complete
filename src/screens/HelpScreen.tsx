// src/screens/HelpScreen.tsx
// Help & Support Screen for Mead

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { tap, successTap } from '../utils/haptics';
import Button from '../components/Button';

const HelpScreen = () => {
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  // ←←← CHANGE THESE TO YOUR REAL CONTACT DETAILS ←←←
  const SUPPORT_EMAIL = 'support@meadtechnologies.com';
  const SUPPORT_PHONE = "+254 700 000 000";          // ← Replace with your real phone number (with country code)

  const faqs = [
    {
      id: 1,
      question: "How do I reset my password or recover my account?",
      answer: "Mead uses phone number authentication. If you lose access, go to Login → 'Forgot Account?' and verify your phone number. Our support team can help restore your account within 24 hours."
    },
    {
      id: 2,
      question: "How does the 2% Escrow protection work in Marketplace?",
      answer: "When you buy something, your payment is held securely by Mead Escrow. The seller only receives the money after you confirm that you received the item in good condition. If there's an issue, you can request a refund."
    },
    {
      id: 3,
      question: "What is a Mega Group and how do I upgrade?",
      answer: "A Mega Group allows up to 10 million members. Normal groups are limited to 10,000. To upgrade, go to any group → tap the star icon → pay the one-time $10 fee. The upgrade is permanent."
    },
    {
      id: 4,
      question: "How do I download content for offline use?",
      answer: "In Music, Movies, or Books sections, tap the download icon on any item. Downloaded content is saved in your device and can be accessed even without internet. You can manage downloads in Settings → Downloads."
    },
    {
      id: 5,
      question: "How does Mead AI work?",
      answer: "Mead AI is your personal frontier intelligence. Ask anything — from luxury advice to complex questions. Free users get 10 responses per day. Unlimited access is available with the $5/month subscription."
    },
    {
      id: 6,
      question: "Can I use Mead without internet?",
      answer: "Yes! Mead has strong offline support. Messages, votes, and downloads are queued and sync automatically when you're back online. Ultra Low Data Mode further reduces data usage."
    },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const contactSupport = () => {
    tap();
    Alert.alert(
      "Contact Support",
      `Our support team typically responds within 2 hours.\n\nEmail: ${SUPPORT_EMAIL}\nPhone: ${SUPPORT_PHONE}`,
      [
        { text: "Copy Email", onPress: () => Alert.alert("Copied", SUPPORT_EMAIL) },
        { text: "Call Now", onPress: () => Alert.alert("Calling", `Calling ${SUPPORT_PHONE}...`) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const reportIssue = () => {
    tap();
    Alert.alert(
      "Report an Issue",
      "Describe the problem you're experiencing and our team will investigate immediately.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Start Report", 
          onPress: () => {
            successTap();
            Alert.alert("Thank You", "Your report has been submitted. We will contact you soon.");
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <Text style={styles.headerSubtitle}>We`re here to help 24/7</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search help topics..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={contactSupport}>
            <Ionicons name="headset" size={32} color={colors.gold} />
            <Text style={styles.quickActionText}>Contact Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={reportIssue}>
            <Ionicons name="bug-outline" size={32} color={colors.gold} />
            <Text style={styles.quickActionText}>Report Issue</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {filteredFaqs.map((faq, index) => (
            <TouchableOpacity 
              key={faq.id}
              style={styles.faqItem}
              onPress={() => setSelectedFaq(selectedFaq === index ? null : index)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons 
                  name={selectedFaq === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.gold} 
                />
              </View>
              
              {selectedFaq === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Still need help?</Text>
          <Text style={styles.supportText}>
            Our dedicated support team is ready to assist you with any issue.
          </Text>
          <Button
            title="Contact Support Team"
            onPress={contactSupport}
            variant="primary"
            style={styles.supportButton}
          />
        </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    margin: 20,
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  quickAction: { alignItems: 'center' },
  quickActionText: {
    color: '#FFD700',
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
  },
  faqSection: { paddingHorizontal: 20, marginBottom: 40 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 20,
  },
  faqItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginBottom: 12,
    padding: 18,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 15,
    color: '#CCCCCC',
    marginTop: 16,
    lineHeight: 24,
  },
  supportCard: {
    margin: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 12,
  },
  supportText: {
    fontSize: 15,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 24,
  },
  supportButton: {
    width: '100%',
  },
});

export default HelpScreen;