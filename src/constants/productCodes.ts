// src/constants/productCodes.ts
// Paystack Product & Plan Codes for Mead - The Global Luxury Super App
// Centralized location for all subscription and one-time purchase codes

export const PRODUCT_CODES = {
  // One-time Purchases
  POST_MEAD_BREW: 'PROD_ggoitv57n0ugsbx',
  MEGA_GROUP_UPGRADE: 'PROD_p9kyqo31en0s7fx',
  MEAD_SELLER_VERIFICATION: 'PROD_j161xx3vf9ak1x4',

  // Subscriptions (6 months)
  MEAD_AUDIO_CALLS_PRO: 'PROD_693fbkj4khasbl6',
  MEAD_VIDEO_CALL_PRO: 'PROD_4v8uceh4eo7qjcb',
  MEAD_AI_PLAN: 'PLN_8zq0dkme0ltzp1w',
  GAMING_PRO: 'PLN_xjoy7qzpuck7prd',
} as const;

export type ProductCodeKey = keyof typeof PRODUCT_CODES;

export const getProductCode = (key: ProductCodeKey): string => {
  return PRODUCT_CODES[key];
};

export const PRODUCT_DETAILS = {
  [PRODUCT_CODES.POST_MEAD_BREW]: {
    name: 'Post a Mead Brew',
    amount: 150,
    currency: 'KES',
    description: 'Geo-targeted premium content post',
    type: 'one_time' as const,
  },
  [PRODUCT_CODES.MEGA_GROUP_UPGRADE]: {
    name: 'Mega Group Upgrade',
    amount: 1300,
    currency: 'KES',
    description: 'Increase group limit to 10 million members',
    type: 'one_time' as const,
  },
  [PRODUCT_CODES.MEAD_SELLER_VERIFICATION]: {
    name: 'Seller Verification',
    amount: 500,
    currency: 'KES',
    description: 'Get verified seller badge & trust protection',
    type: 'one_time' as const,
  },
  [PRODUCT_CODES.MEAD_AUDIO_CALLS_PRO]: {
    name: 'Audio Calls Pro',
    amount: 260,
    currency: 'KES',
    description: 'Unlimited audio calls for 6 months',
    type: 'subscription' as const,
  },
  [PRODUCT_CODES.MEAD_VIDEO_CALL_PRO]: {
    name: 'Video Calls Pro',
    amount: 390,
    currency: 'KES',
    description: 'Unlimited HD video calls + screen share for 6 months',
    type: 'subscription' as const,
  },
  [PRODUCT_CODES.MEAD_AI_PLAN]: {
    name: 'Unlimited Mead AI',
    amount: 650,
    currency: 'KES',
    description: 'Unlimited access to frontier intelligence',
    type: 'subscription' as const,
  },
  [PRODUCT_CODES.GAMING_PRO]: {
    name: 'Mead Arena Pro',
    amount: 450,
    currency: 'KES',
    description: 'Unlimited gaming + multiplayer worldwide',
    type: 'subscription' as const,
  },
} as const;

export default PRODUCT_CODES;