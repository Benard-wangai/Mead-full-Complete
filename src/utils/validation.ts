// src/utils/validation.ts
// Comprehensive Validation System for Mead - All forms, inputs, and data across 94 files
// Supports phone numbers with country codes, names, Brew titles, payment amounts, group names, etc.
// Fully interconnected with Input.tsx, SignupScreen, LoginScreen, BrewCreateScreen, Marketplace, etc.

export interface ValidationResult<T = any> {
  isValid: boolean;
  value?: T;
  error?: string | null;
}

export class Validation {
  // Phone number validation with country code
  static phone(phone: string, countryCode: string = '+254'): ValidationResult<string> {
    if (!phone || phone.trim() === '') {
      return { isValid: false, error: 'Phone number is required' };
    }

    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 8 || cleaned.length > 15) {
      return { isValid: false, error: 'Phone number must be between 8 and 15 digits' };
    }

    // Basic international phone pattern
    const fullNumber = countryCode.replace('+', '') + cleaned;
    const phoneRegex = /^\d{8,15}$/;

    if (!phoneRegex.test(fullNumber)) {
      return { isValid: false, error: 'Invalid phone number format' };
    }

    return {
      isValid: true,
      value: cleaned,
      error: null,
    };
  }

  // Name validation (for signup, profile, etc.)
  static name(name: string): ValidationResult<string> {
    if (!name || name.trim() === '') {
      return { isValid: false, error: 'Name is required' };
    }

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return { isValid: false, error: 'Name must be at least 2 characters' };
    }

    if (trimmed.length > 50) {
      return { isValid: false, error: 'Name is too long (max 50 characters)' };
    }

    // Allow letters, spaces, hyphens, and apostrophes only
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(trimmed)) {
      return { isValid: false, error: 'Name can only contain letters, spaces, hyphens and apostrophes' };
    }

    return {
      isValid: true,
      value: trimmed,
      error: null,
    };
  }

  // Brew title validation
  static brewTitle(title: string): ValidationResult<string> {
    if (!title || title.trim() === '') {
      return { isValid: false, error: 'Brew title is required' };
    }

    const trimmed = title.trim();
    if (trimmed.length < 5) {
      return { isValid: false, error: 'Brew title must be at least 5 characters' };
    }

    if (trimmed.length > 80) {
      return { isValid: false, error: 'Brew title is too long (max 80 characters)' };
    }

    return {
      isValid: true,
      value: trimmed,
      error: null,
    };
  }

  // Brew description validation (optional but recommended)
  static brewDescription(description: string): ValidationResult<string> {
    if (!description || description.trim() === '') {
      return { isValid: true, value: '', error: null }; // Optional
    }

    const trimmed = description.trim();
    if (trimmed.length > 500) {
      return { isValid: false, error: 'Description is too long (max 500 characters)' };
    }

    return {
      isValid: true,
      value: trimmed,
      error: null,
    };
  }

  // Payment amount validation
  static paymentAmount(amount: string | number): ValidationResult<number> {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(num) || num <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' };
    }

    if (num > 10000000) { // Reasonable upper limit for demo
      return { isValid: false, error: 'Amount is too large' };
    }

    return {
      isValid: true,
      value: num,
      error: null,
    };
  }

  // Group name validation (for mega groups, normal groups)
  static groupName(name: string): ValidationResult<string> {
    if (!name || name.trim() === '') {
      return { isValid: false, error: 'Group name is required' };
    }

    const trimmed = name.trim();
    if (trimmed.length < 3) {
      return { isValid: false, error: 'Group name must be at least 3 characters' };
    }

    if (trimmed.length > 60) {
      return { isValid: false, error: 'Group name is too long (max 60 characters)' };
    }

    return {
      isValid: true,
      value: trimmed,
      error: null,
    };
  }

  // Country code validation
  static countryCode(code: string): ValidationResult<string> {
    const cleaned = code.trim();
    const countryCodeRegex = /^\+\d{1,4}$/;

    if (!countryCodeRegex.test(cleaned)) {
      return { isValid: false, error: 'Invalid country code format (e.g. +254)' };
    }

    return {
      isValid: true,
      value: cleaned,
      error: null,
    };
  }

  // Generic required field
  static required(value: any, fieldName: string = 'Field'): ValidationResult<any> {
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true, value, error: null };
  }

  // Combined validation for Signup form
  static signupForm(name: string, phone: string, countryCode: string): {
    isValid: boolean;
    errors: { name?: string; phone?: string; countryCode?: string };
  } {
    const nameResult = this.name(name);
    const phoneResult = this.phone(phone, countryCode);
    const codeResult = this.countryCode(countryCode);

    const errors: any = {};

    if (!nameResult.isValid) errors.name = nameResult.error;
    if (!phoneResult.isValid) errors.phone = phoneResult.error;
    if (!codeResult.isValid) errors.countryCode = codeResult.error;

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Combined validation for Brew creation
  static brewForm(title: string, description?: string): {
    isValid: boolean;
    errors: { title?: string; description?: string };
  } {
    const titleResult = this.brewTitle(title);
    const descResult = description ? this.brewDescription(description) : { isValid: true, error: null };

    const errors: any = {};

    if (!titleResult.isValid) errors.title = titleResult.error;
    if (!descResult.isValid) errors.description = descResult.error;

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

export default Validation;