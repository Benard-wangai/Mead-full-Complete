import { supabase } from '../utils/supabaseClient';
import { meadStorage } from '../utils/storage';
import { meadLogger } from '../utils/logger';
import { toE164Phone, isValidE164 } from '../utils/phone';

export type VerifyPhoneOtpResult = {
  userId: string;
  accessToken: string;
};

export async function resendPhoneOtp(fullPhone: string): Promise<void> {
  if (!isValidE164(fullPhone)) {
    throw new Error('Invalid phone number.');
  }

  const { error } = await supabase.auth.signInWithOtp({
    phone: fullPhone,
    options: {
      channel: 'sms',
      shouldCreateUser: true,
    },
  });

  if (error) {
    meadLogger.error('resendPhoneOtp failed', { message: error.message });
    throw error;
  }
}

export async function sendPhoneOtp(
  phone: string,
  countryCode: string,
  options?: { shouldCreateUser?: boolean }
): Promise<string> {
  const fullPhone = toE164Phone(phone, countryCode);

  if (!isValidE164(fullPhone)) {
    throw new Error('Invalid phone number. Check the country code and number.');
  }

  const { error } = await supabase.auth.signInWithOtp({
    phone: fullPhone,
    options: {
      channel: 'sms',
      shouldCreateUser: options?.shouldCreateUser ?? true,
    },
  });

  if (error) {
    meadLogger.error('sendPhoneOtp failed', { message: error.message, phone: fullPhone });
    throw error;
  }

  meadLogger.info('OTP sent', { phone: fullPhone });
  return fullPhone;
}

export async function verifyPhoneOtp(
  fullPhone: string,
  token: string
): Promise<VerifyPhoneOtpResult> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: fullPhone,
    token,
    type: 'sms',
  });

  if (error) {
    meadLogger.error('verifyPhoneOtp failed', { message: error.message });
    throw error;
  }

  const accessToken = data.session?.access_token;
  const userId = data.user?.id;

  if (!accessToken || !userId) {
    throw new Error('Verification succeeded but no session was returned. Please try again.');
  }

  await meadStorage.saveToken(accessToken);
  return { userId, accessToken };
}

export async function ensureUserProfile(params: {
  userId: string;
  phone: string;
  fullName?: string;
  language?: string;
}): Promise<void> {
  const { userId, phone, fullName, language } = params;
  const now = new Date().toISOString();

  const row: Record<string, string> = {
    id: userId,
    phone,
    updated_at: now,
  };

  if (fullName?.trim()) {
    row.full_name = fullName.trim();
  }
  if (language?.trim()) {
    row.language = language.trim();
  }

  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' });

  if (error) {
    meadLogger.warn('Profile upsert failed (user may still use app)', {
      message: error.message,
    });
  } else {
    meadLogger.info('Profile ensured after auth', { userId });
  }

  if (language?.trim()) {
    await meadStorage.saveSettings({ language: language.trim(), country_code: phone.slice(0, 4) });
  }
}

export async function completePhoneAuth(params: {
  phone: string;
  countryCode: string;
  otp: string;
  fullName?: string;
  language?: string;
}): Promise<VerifyPhoneOtpResult> {
  const fullPhone = toE164Phone(params.phone, params.countryCode);
  const result = await verifyPhoneOtp(fullPhone, params.otp);
  await ensureUserProfile({
    userId: result.userId,
    phone: fullPhone,
    fullName: params.fullName,
    language: params.language,
  });
  return result;
}

export { toE164Phone };
