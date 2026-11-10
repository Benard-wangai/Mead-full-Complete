// src/screens/TermsAndConditionsScreen.tsx
// Terms & Conditions Screen for Mead - The Global Luxury Super App
// Professional, clear, and comprehensive terms with luxurious design

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../utils/theme';
import { tap } from '../utils/haptics';

const TermsAndConditionsScreen = () => {
  const { colors } = useTheme();

  const handleAccept = () => {
    tap();
    // In real app, this would save acceptance and navigate back
    // For now, show confirmation
    alert("Thank you! You have accepted Mead's Terms & Conditions.");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.black }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <Text style={styles.headerSubtitle}>Last Updated: April 21, 2026</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.intro}>
            Welcome to Mead — The Global Luxury Super App.{'\n\n'}
            By using Mead, you agree to these Terms and Conditions. Please read them carefully.
          </Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using Mead, you acknowledge that you have read, understood, and agree to be bound by these Terms. 
            If you do not agree, you may not use the app.
          </Text>

          <Text style={styles.sectionTitle}>2. User Eligibility</Text>
          <Text style={styles.paragraph}>
            You must be at least 18 years old or have parental/guardian consent to use Mead. 
            You are responsible for maintaining the confidentiality of your account.
          </Text>

          <Text style={styles.sectionTitle}>3. Privacy & Data Protection</Text>
          <Text style={styles.paragraph}>
            Your privacy is extremely important to us. We collect and process data in accordance with our Privacy Policy. 
            All communications are encrypted and we do not sell your personal data.
          </Text>

          <Text style={styles.sectionTitle}>4. Content & Conduct</Text>
          <Text style={styles.paragraph}>
            You are responsible for all content you post. You agree not to post illegal, harmful, or infringing content. 
            Mead reserves the right to remove content and suspend accounts that violate these rules.
          </Text>

          <Text style={styles.sectionTitle}>5. Payments & Subscriptions</Text>
          <Text style={styles.paragraph}>
            All payments are processed securely through Paystack and other approved gateways. 
            Subscriptions are billed automatically. You can cancel anytime through the Settings screen.
          </Text>

          <Text style={styles.sectionTitle}>6. Escrow & Marketplace</Text>
          <Text style={styles.paragraph}>
            Marketplace transactions use 2% escrow protection. Funds are held until the buyer confirms delivery. 
            Disputes are resolved fairly by Mead&apos;s team.
          </Text>

          <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content, logos, and trademarks of Mead are the property of Mead. 
            You retain ownership of your content but grant Mead a license to display it within the app.
          </Text>

          <Text style={styles.sectionTitle}>8. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to suspend or terminate your account at any time for violations of these terms.
          </Text>

          <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            Mead is provided &quot;as is&quot;. We are not liable for any indirect, incidental, or consequential damages arising from your use of the app.
          </Text>

          <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may update these Terms from time to time. Continued use of Mead after changes constitutes acceptance of the new terms.
          </Text>

          <Text style={styles.contact}>
            If you have any questions about these Terms, please contact us at support@meadtechnologies.com
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
        <Text style={styles.acceptButtonText}>I Accept the Terms & Conditions</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#FFD700',
    letterSpacing: 1 
  },
  headerSubtitle: { 
    fontSize: 15, 
    color: '#AAAAAA', 
    marginTop: 8 
  },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
    marginTop: 32,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    color: '#CCCCCC',
    marginBottom: 16,
  },
  intro: {
    fontSize: 17,
    lineHeight: 28,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  contact: {
    fontSize: 15,
    color: '#888888',
    marginTop: 40,
    textAlign: 'center',
  },
  acceptButton: {
    backgroundColor: '#FFD700',
    margin: 20,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default TermsAndConditionsScreen;