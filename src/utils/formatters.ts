// src/utils/formatters.ts
// Comprehensive Formatting Utilities for Mead - Luxury & Consistent Display Across All 94 Files
// Handles currency (KES & multi-currency), dates, timestamps, numbers, phone masking, truncation, etc.
// Used by Profile, Marketplace, Brews, Calls, Payments, Entertainment, Notifications, etc.

import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

export const formatters = {
  // ─────────────────────────────────────────────────────────────────────────────
  // CURRENCY FORMATTING
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Format Kenyan Shillings with commas and "KES" prefix
  formatKES: (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return 'KES 0';
    
    return `KES ${num.toLocaleString('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  },

  // Format any currency with symbol and locale
  formatCurrency: (amount: number | string, currency: string = 'KES'): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return `${currency} 0`;

    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // DATE & TIME FORMATTING
  // ─────────────────────────────────────────────────────────────────────────────

  // Relative time (e.g., "2 hours ago", "yesterday")
  formatRelativeTime: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  },

  // Full date with time (e.g., "12 Apr 2026, 3:45 PM")
  formatDateTime: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'dd MMM yyyy, h:mm a');
  },

  // Short date (e.g., "12 Apr 2026")
  formatDate: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'dd MMM yyyy');
  },

  // Chat-style timestamp (e.g., "3:45 PM" or "Yesterday")
  formatChatTimestamp: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffDays = differenceInDays(now, d);

    if (diffDays === 0) {
      return format(d, 'h:mm a');           // Today → "3:45 PM"
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return format(d, 'EEEE');             // "Monday"
    } else {
      return format(d, 'dd MMM');           // "12 Apr"
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // NUMBER FORMATTING
  // ─────────────────────────────────────────────────────────────────────────────

  // Format large numbers with K, M, B suffixes (e.g., 1.2K, 4.5M)
  formatNumber: (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toLocaleString();
  },

  // Format followers, views, likes, etc.
  formatCount: (count: number): string => {
    return formatters.formatNumber(count);
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PHONE & PERSONAL INFO
  // ─────────────────────────────────────────────────────────────────────────────

  // Mask phone number for privacy (e.g., +254 7•• ••• 678)
  maskPhone: (phone: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 9) return phone;
    
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 4)}•• ••• ${cleaned.slice(-3)}`;
  },

  // Capitalize first letter of each word
  capitalize: (str: string): string => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  // Truncate long text with ellipsis
  truncate: (str: string, maxLength: number = 80): string => {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength).trim() + '...';
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // FILE & MEDIA
  // ─────────────────────────────────────────────────────────────────────────────

  // Format file size (e.g., 2.4 MB)
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  // Format video duration (e.g., 3:45)
  formatDuration: (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },
};

// Export individual functions for easy importing
export const {
  formatKES,
  formatCurrency,
  formatRelativeTime,
  formatDateTime,
  formatDate,
  formatChatTimestamp,
  formatNumber,
  formatCount,
  maskPhone,
  capitalize,
  truncate,
  formatFileSize,
  formatDuration,
} = formatters;

export default formatters;