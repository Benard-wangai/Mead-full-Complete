// src/screens/OTPVerification.tsx
// Final Professional OTP Verification Screen for Mead
// Clean ref handling, Twilio OTP via Supabase, luxury design

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import { tap, successTap } from '../utils/haptics';
import { resendPhoneOtp, verifyPhoneOtp, ensureUserProfile } from '../services/authService';
import Button from '../components/Button';

const OTPVerification = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const { fullPhoneNumber, fullName, selectedLanguage } = route.params || {};

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Proper ref typing for TextInput
  const inputRefs = useRef<TextInput[]>([]);

  // Timer for resend button
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    const filteredText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = filteredText;
    setOtp(newOtp);

    // Auto-focus next field
    if (filteredText.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are filled
    if (index === 5 && filteredText.length === 1) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        verifyOtp(fullOtp);
      }
    }
  };

  const verifyOtp = async (fullOtp: string) => {
    if (fullOtp.length !== 6) {
      Alert.alert('Error', 'Please enter all 6 digits');
      return;
    }

    setLoading(true);
    tap();

    try {
      meadLogger.info('Verifying OTP', { phone: fullPhoneNumber });

      const { userId } = await verifyPhoneOtp(fullPhoneNumber, fullOtp);

      await ensureUserProfile({
        userId,
        phone: fullPhoneNumber,
        fullName,
        language: selectedLanguage,
      });

      successTap();
      meadLogger.info('OTP verified successfully', { userId });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });

    } catch (error: unknown) {
      meadLogger.error('OTP verification failed', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Invalid verification code. Please try again.';
      Alert.alert('Verification Failed', message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!canResend) return;

    setResendLoading(true);

    try {
      await resendPhoneOtp(fullPhoneNumber);

      successTap();
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);

      Alert.alert('Success', 'A new verification code has been sent to your phone.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.black }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark-outline" size={60} color={colors.gold} />
          <Text style={styles.title}>Verify Your Number</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={{ color: colors.gold, fontWeight: '600' }}>
              {fullPhoneNumber || 'your number'}
            </Text>
          </Text>
        </View>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn`t receive the code?</Text>
          <TouchableOpacity 
            onPress={resendOtp} 
            disabled={!canResend || resendLoading}
          >
            <Text style={[
              styles.resendButtonText,
              (!canResend || resendLoading) && { color: '#555' }
            ]}>
              {resendLoading 
                ? 'Sending...' 
                : canResend 
                  ? 'Resend Code' 
                  : `Resend in ${timer}s`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        <Button
          title={loading ? "Verifying Code..." : "Verify & Continue"}
          onPress={() => verifyOtp(otp.join(''))}
          disabled={loading || otp.join('').length !== 6}
          style={styles.verifyButton}
          variant="primary"
        />

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Change Phone Number</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFD700',
    marginTop: 20,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    marginBottom: 40,
  },
  otpInput: {
    width: 48,
    height: 60,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  resendText: {
    color: '#888',
    fontSize: 15,
  },
  resendButtonText: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  verifyButton: {
    width: '100%',
    marginBottom: 20,
  },
  backButton: {
    marginTop: 20,
  },
  backText: {
    color: '#888',
    fontSize: 15,
  },
});

export default OTPVerification;