// Complete Navigation System for Mead - auth gate + all production screens

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, typography } from '../utils/theme';
import { getCurrentSession, supabase } from '../utils/supabaseClient';
import { navigationRef } from './navigationRef';
import { meadStorage } from '../utils/storage';
import { colors } from '../utils/theme';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OTPVerification from '../screens/OTPVerification';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import ReelsScreen from '../screens/ReelsScreen';
import LiveScreen from '../screens/LiveScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ChatThreadScreen from '../screens/ChatThreadScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import MarketplaceListingDetailScreen from '../screens/MarketplaceListingDetailScreen';
import CreateListingScreen from '../screens/CreateListingScreen';
import BrewCreateScreen from '../screens/BrewCreateScreen';
import MeadAIScreen from '../screens/MeadAIScreen';
import PaymentScreen from '../screens/PaymentScreen';
import GroupsScreen from '../screens/GroupsScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import VoteScreen from '../screens/VoteScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import HelpScreen from '../screens/HelpScreen';
import DownloadsScreen from '../screens/DownloadsScreen';
import BackupScreen from '../screens/BackupScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import ReferralScreen from '../screens/ReferralScreen';
import SearchScreen from '../screens/SearchScreen';
import AdsUpDashboardScreen from '../screens/AdsUpDashboardScreen';
import CallsScreen from '../screens/CallsScreen';
import ActiveCallScreen from '../screens/ActiveCallScreen';
import EntertainmentHubScreen from '../screens/EntertainmentHubScreen';
import MusicLibraryScreen from '../screens/MusicLibraryScreen';
import MeadBooksScreen from '../screens/MeadBooksScreen';
import MoviesTVScreen from '../screens/MoviesTVScreen';
import MeadArenaScreen from '../screens/MeadArenaScreen';
import MeadTogetherScreen from '../screens/MeadTogetherScreen';

import { RootStackParamList, RootTabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const MainTabs = () => {
  const { colors: themeColors, shadows } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.black,
          borderTopColor: themeColors.border,
          borderTopWidth: 1,
          height: 78,
          paddingBottom: 8,
          paddingTop: 6,
          ...shadows.goldGlow,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.regular,
          fontSize: 11,
          letterSpacing: 0.5,
        },
        tabBarActiveTintColor: themeColors.gold,
        tabBarInactiveTintColor: '#666666',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reels"
        component={ReelsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="videocam" size={size + 4} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Live"
        component={LiveScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="radio" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [bootRoute, setBootRoute] = useState<'Main' | 'Login' | null>(null);

  useEffect(() => {
    let mounted = true;

    const resolveBootRoute = async () => {
      const session = await getCurrentSession();
      if (mounted) {
        setBootRoute(session ? 'Main' : 'Login');
      }
    };

    resolveBootRoute();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.access_token) {
          await meadStorage.saveToken(session.access_token);
          setBootRoute('Main');
          if (
            navigationRef.isReady() &&
            (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')
          ) {
            const current = navigationRef.getCurrentRoute()?.name;
            const authScreens = new Set(['Login', 'Signup', 'OTPVerification']);
            if (current && authScreens.has(current)) {
              navigationRef.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          await meadStorage.clearToken();
          setBootRoute('Login');
          if (navigationRef.isReady()) {
            navigationRef.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!bootRoute) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.black,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={bootRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerification} />

      <Stack.Screen name="Main" component={MainTabs} />

      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
      <Stack.Screen name="MarketplaceDetail" component={MarketplaceListingDetailScreen} />
      <Stack.Screen name="CreateListing" component={CreateListingScreen} />
      <Stack.Screen name="BrewCreate" component={BrewCreateScreen} />
      <Stack.Screen name="MeadAI" component={MeadAIScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Groups" component={GroupsScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="Vote" component={VoteScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={TermsAndConditionsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Downloads" component={DownloadsScreen} />
      <Stack.Screen name="Backup" component={BackupScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="AdsUp" component={AdsUpDashboardScreen} />
      <Stack.Screen name="Calls" component={CallsScreen} />
      <Stack.Screen name="ActiveCall" component={ActiveCallScreen} />
      <Stack.Screen name="EntertainmentHub" component={EntertainmentHubScreen} />
      <Stack.Screen name="MusicLibrary" component={MusicLibraryScreen} />
      <Stack.Screen name="MeadBooks" component={MeadBooksScreen} />
      <Stack.Screen name="MoviesTV" component={MoviesTVScreen} />
      <Stack.Screen name="MeadArena" component={MeadArenaScreen} />
      <Stack.Screen name="MeadTogether" component={MeadTogetherScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
