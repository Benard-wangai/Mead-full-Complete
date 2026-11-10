// src/navigation/types.ts
// Complete TypeScript Navigation Types for Mead - The Global Luxury Super App
// All screens and parameters are properly typed for full type safety

export type RootStackParamList = {
  // ====================== AUTH FLOW ======================
  Login: undefined;
  Signup: undefined;
  OTPVerification: {
    fullPhoneNumber: string;
    countryCode?: string;
    fullName?: string;
    selectedLanguage?: string;
  };

  // ====================== MAIN APP ======================
  Main: undefined;

  // ====================== PROFILE ======================
  Profile: undefined;
  ProfileEdit: undefined;

  // ====================== SOCIAL & CONTENT ======================
  Reels: undefined;
  Live: undefined;
  BrewCreate: undefined;
  MeadAI: undefined;

  // ====================== MESSAGING ======================
  Chats: undefined;
  ChatThread: { 
    conversationId: string; 
    participantName?: string;
    participantAvatar?: string;
  };

  // ====================== MARKETPLACE ======================
  Marketplace: undefined;
  MarketplaceDetail: {
    productId: string;
    title?: string;
    product?: Record<string, unknown>;
  };
  CreateListing: undefined;

  // ====================== GROUPS & COMMUNITY ======================
  Groups: undefined;
  GroupDetail: { 
    groupId: string;
    groupName?: string;
  };
  CreateGroup: undefined;

  // ====================== VOTING ======================
  Vote: { 
    voteId: string;
    title?: string;
  };

  // ====================== PAYMENTS ======================
  Payment: { 
    feature: string;           // e.g., "mead_ai", "audio_pro", "brew", etc.
    amount?: number;
    planCode?: string;
    isSubscription?: boolean;
  };

  // ====================== UTILITY ======================
  Notifications: undefined;
  Settings: undefined;
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;
  Help: undefined;
  Permissions: undefined;
  Downloads: undefined;
  Backup: undefined;
  Referral: undefined;
  Search: undefined;
  AdsUp: undefined;
  Calls: undefined;
  ActiveCall: {
    contactName?: string;
    contactAvatar?: string;
    isVideo?: boolean;
  };

  // ====================== ENTERTAINMENT ======================
  EntertainmentHub: undefined;
  MusicLibrary: undefined;
  MeadBooks: undefined;
  MoviesTV: undefined;
  MeadArena: undefined;        // Gaming
  MeadTogether: {
    sessionId?: string;
    activityType?: 'movie' | 'music' | 'game' | 'reading';
  };
};

export type RootTabParamList = {
  Home: undefined;
  Chats: undefined;
  Reels: undefined;
  Live: undefined;
  Marketplace: undefined;
  Profile: undefined;
};

// Common Param Types
export type NavigationProps = {
  navigation: any;
  route: any;
};

// Screen Props Example
export interface ScreenProps {
  navigation: any;
  route: any;
}

// Export for easy use
export type RootStackScreenProps = {
  navigation: any;
  route: any;
};

export default RootStackParamList;