/** Normalize local phone + country code to E.164 (e.g. +254712345678). */

export function toE164Phone(phone: string, countryCode: string): string {
  let digits = phone.replace(/\D/g, '');
  const code = countryCode.replace(/\D/g, '');

  // National trunk prefix (common in KE, UK, etc.)
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (code && digits.startsWith(code)) {
    return `+${digits}`;
  }

  return `+${code}${digits}`;
}

export function isValidE164(fullPhone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(fullPhone);
}
