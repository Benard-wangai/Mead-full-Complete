// src/screens/SignupScreen.tsx
// Full Signup Screen for Mead - The Global Luxury Super App
// Phone-first registration with rich UX, language selection, and validation

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
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { sendPhoneOtp } from '../services/authService';
import Validation from '../utils/validation';
import Button from '../components/Button';
import CountryCodePicker from '../components/CountryCodePicker';
import LANGUAGES from '../constants/languages';

const SignupScreen = ({ navigation }: any) => {
  const { colors } = useTheme();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+254');
  const [fullName, setFullName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [searchLanguage, setSearchLanguage] = useState('');

  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchLanguage.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchLanguage.toLowerCase())
  );

  const handleSignup = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    const formCheck = Validation.signupForm(fullName, phoneNumber, countryCode);
    if (!formCheck.isValid) {
      Alert.alert(
        'Error',
        formCheck.errors.phone ||
          formCheck.errors.name ||
          formCheck.errors.countryCode ||
          'Please check your details'
      );
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'You must agree to the Terms and Conditions');
      return;
    }

    setLoading(true);

    try {
      const fullPhoneNumber = await sendPhoneOtp(phoneNumber.trim(), countryCode, {
        shouldCreateUser: true,
      });

      meadLogger.info('OTP sent successfully', { phone: fullPhoneNumber });

      navigation.navigate('OTPVerification', {
        fullPhoneNumber,
        countryCode,
        fullName: fullName.trim(),
        selectedLanguage: selectedLanguage.code,
      });
    } catch (error: unknown) {
      meadLogger.error('Signup failed', error);
      const message =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.black }]}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.gold }]}>Create Your Account</Text>
          <Text style={[styles.subtitle, { color: '#FFFFFF' }]}>
            Join the world of luxury and connection
          </Text>
        </View>

        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: '#FFFFFF' }]}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#666"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* Phone Number */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: '#FFFFFF' }]}>Phone Number</Text>
          <View style={styles.phoneInputContainer}>
            <CountryCodePicker
              selectedCode={countryCode}
              onCodeChange={setCountryCode}
            />
            <TextInput
              style={styles.phoneInput}
              placeholder="712 345 678"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              maxLength={15}
            />
          </View>
        </View>

        {/* Preferred Language */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: '#FFFFFF' }]}>Preferred Language</Text>
          <TouchableOpacity 
            style={styles.languageSelector}
            onPress={() => setShowLanguageModal(true)}
          >
            <Text style={styles.selectedLanguage}>
              {selectedLanguage.flag} {selectedLanguage.nativeName}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#FFD700" />
          </TouchableOpacity>
        </View>

        {/* Terms Agreement */}
        <TouchableOpacity 
          style={styles.termsContainer}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Ionicons name="checkmark" size={16} color="#000" />}
          </View>
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text 
              style={styles.termsLink}
              onPress={() => navigation.navigate('TermsAndConditions')}
            >
              Terms & Conditions
            </Text>{' '}
            and{' '}
            <Text 
              style={styles.termsLink}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              Privacy Policy
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Signup Button */}
        <Button
          title={loading ? "Creating Account..." : "Create Account"}
          onPress={handleSignup}
          disabled={loading || !fullName.trim() || !phoneNumber.trim() || !agreedToTerms}
          style={styles.signupButton}
        />

        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text 
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            Sign in
          </Text>
        </Text>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.dark }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: '#FFFFFF' }]}>Choose Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={28} color="#FFD700" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search language..."
              placeholderTextColor="#666"
              value={searchLanguage}
              onChangeText={setSearchLanguage}
            />

            <FlatList
              data={filteredLanguages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    selectedLanguage.code === item.code && styles.languageItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedLanguage(item);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text style={styles.languageFlag}>{item.flag}</Text>
                  <View>
                    <Text style={styles.languageNative}>{item.nativeName}</Text>
                    <Text style={styles.languageEnglish}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
    opacity: 0.9,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    fontSize: 18,
    padding: 16,
    borderRadius: 12,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  phoneInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    padding: 16,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
  },
  selectedLanguage: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 6,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FFD700',
  },
  termsText: {
    color: '#CCCCCC',
    fontSize: 15,
    flex: 1,
  },
  termsLink: {
    color: '#FFD700',
    textDecorationLine: 'underline',
  },
  signupButton: {
    backgroundColor: '#FFD700',
    marginTop: 30,
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
    fontSize: 15,
  },
  loginLink: {
    color: '#FFD700',
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  searchInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  languageItemSelected: {
    backgroundColor: '#FFD70022',
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 16,
  },
  languageNative: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  languageEnglish: {
    color: '#888',
    fontSize: 14,
  },
});

export default SignupScreen;