// src/screens/LoginScreen.tsx
// Login Screen for Mead - The Global Luxury Super App
// Phone-only authentication with manual country code selection, OTP verification, luxury black + gold design

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { apiService } from '../services/api';
import { toE164Phone } from '../utils/phone';
import Validation from '../utils/validation';
import { tap, successTap } from '../utils/haptics';
import Button from '../components/Button';
import CountryCodePicker from '../components/CountryCodePicker';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+254');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    const phoneCheck = Validation.phone(phone, countryCode);
    if (!phoneCheck.isValid) {
      setError(phoneCheck.error || 'Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');
    tap();

    try {
      const fullPhone = await apiService.sendOTP(phone.trim(), countryCode);
      successTap();
      setStep('otp');
      setError('');
      meadLogger.info('OTP sent successfully', { phone: fullPhone });
    } catch (err: unknown) {
      meadLogger.error('Failed to send OTP', err);
      const message =
        err instanceof Error ? err.message : 'Failed to send OTP. Check your number and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    tap();

    try {
      await apiService.verifyOTP(phone.trim(), otp, countryCode);
      successTap();
      meadLogger.info('OTP verified successfully', {
        phone: toE164Phone(phone.trim(), countryCode),
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      });
    } catch (err: unknown) {
      meadLogger.error('OTP verification failed', err);
      const message =
        err instanceof Error ? err.message : 'Invalid OTP. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.black }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>MEAD</Text>
          <Text style={styles.subtitle}>Welcome back to luxury</Text>
        </View>

        <View style={styles.form}>
          {step === 'phone' ? (
            <>
              <Text style={styles.label}>Phone Number</Text>
              
              <View style={styles.phoneInputContainer}>
                <CountryCodePicker
                  selectedCode={countryCode}
                  onCodeChange={setCountryCode}
                />
                <TextInput
                  style={styles.phoneInput}
                  placeholder="712 345 678"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={15}
                />
              </View>

              <Text style={styles.helperText}>
                We`ll send a 6-digit code to verify your number
              </Text>

              <Button
                title={loading ? "Sending OTP..." : "Send OTP"}
                onPress={handleSendOTP}
                disabled={loading || !phone.trim()}
                style={styles.button}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>Enter 6-digit OTP</Text>
              
              <TextInput
                style={styles.otpInput}
                placeholder="123456"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                maxLength={6}
                autoFocus
              />

              <Button
                title={loading ? "Verifying..." : "Verify OTP"}
                onPress={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                style={styles.button}
              />

              <TouchableOpacity 
                onPress={() => {
                  setStep('phone');
                  setOtp('');
                }}
                style={styles.backButton}
              >
                <Text style={styles.backText}>Change Phone Number</Text>
              </TouchableOpacity>
            </>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Signup' as never)}
          style={styles.signupLink}
        >
          <Text style={styles.signupText}>
            New to Mead? <Text style={styles.signupHighlight}>Create an account</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          By continuing, you agree to our Terms and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: '#000000',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 68,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#AAAAAA',
    marginTop: 12,
  },
  form: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 12,
    fontWeight: '600',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD70033',
  },
  countryCode: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    paddingVertical: 18,
  },
  otpInput: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    color: '#FFFFFF',
    fontSize: 24,
    letterSpacing: 12,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#FFD70033',
  },
  helperText: {
    color: '#888888',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  button: {
    marginTop: 32,
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    color: '#FFD700',
    fontSize: 15,
  },
  errorText: {
    color: '#FF4500',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  signupLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  signupText: {
    color: '#888888',
    fontSize: 15,
  },
  signupHighlight: {
    color: '#FFD700',
    fontWeight: '600',
  },
  footerText: {
    color: '#666666',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 16,
    paddingBottom: 40,
  },
});

export default LoginScreen;