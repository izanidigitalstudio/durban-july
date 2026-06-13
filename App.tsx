import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Authenticated, Unauthenticated, AuthLoading, useQuery } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from './lib/theme';
import { api } from './convex/_generated/api';
import { convex, convexAuthStorage } from './lib/convex';

import HomeScreen from './screens/HomeScreen';
import MarqueesScreen from './screens/MarqueesScreen';
import EventsScreen from './screens/EventsScreen';
import StayScreen from './screens/StayScreen';
import ProfileScreen from './screens/ProfileScreen';
import DetailScreen from './screens/DetailScreen';
import InquiryScreen from './screens/InquiryScreen';
import MyScheduleScreen from './screens/MyScheduleScreen';
import ShoppingScreen from './screens/ShoppingScreen';
import ThemeScreen from './screens/ThemeScreen';
import TransportScreen from './screens/TransportScreen';
import ConciergeScreen from './screens/ConciergeScreen';
import ServicesScreen from './screens/ServicesScreen';
import DurbanActivitiesScreen from './screens/DurbanActivitiesScreen';
import SponsorsScreen from './screens/SponsorsScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import AuthScreen from './screens/AuthScreen';
import MembershipOnboardingScreen from './screens/MembershipOnboardingScreen';
import OrganizerStudioScreen from './screens/OrganizerStudioScreen';
import AdminPinScreen from './screens/AdminPinScreen';
import PublicRegistrationScreen from './screens/PublicRegistrationScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const GUEST_KEY = '@durban_july_guest';
const ADMIN_VIEW_KEY = '@durban_july_admin_view_mode';
const WEB_APP_URL = 'https://www.durbanjulyvip.co.za';
const REGISTRATION_PATH = '/register';

const linking = {
  prefixes: [WEB_APP_URL],
  config: {
    screens: {
      Welcome: '',
      PublicRegistration: 'register',
      Auth: 'auth',
    },
  },
};

type AppViewMode = 'vip' | 'organiser' | 'admin';

const VIEW_MODE_META: Record<AppViewMode, { title: string; subtitle: string }> = {
  vip: {
    title: 'VIP Member View',
    subtitle: 'Browse events, save favourites, and plan your July experience.',
  },
  organiser: {
    title: 'Event Organiser View',
    subtitle: 'Claim events, submit new listings, and track approval status.',
  },
  admin: {
    title: 'Admin View',
    subtitle: 'Review content, approve requests, and preview the app like a user.',
  },
};

type MembershipState = {
  role: 'attendee' | 'organiser' | 'admin';
  organiserStatus: 'pending' | 'approved' | 'rejected';
  needsRoleSelection: boolean;
  isApprovedOrganiser: boolean;
  isPendingOrganiser: boolean;
  isAdmin: boolean;
  isAttendee: boolean;
};

function TabLabel({ color, label }: { color: string; label: string }) {
  return (
    <Text
      numberOfLines={1}
      style={[styles.tabLabel, { color }]}
    >
      {label}
    </Text>
  );
}

const getGuestMembership = (): MembershipState => ({
  role: 'attendee',
  organiserStatus: 'pending',
  needsRoleSelection: false,
  isApprovedOrganiser: false,
  isPendingOrganiser: false,
  isAdmin: false,
  isAttendee: true,
});

const getAdminViewMembership = (membership: MembershipState, viewMode: AppViewMode): MembershipState => {
  if (!membership.isAdmin) return membership;

  if (viewMode === 'vip') return getGuestMembership();

  if (viewMode === 'organiser') {
    return {
      role: 'organiser',
      organiserStatus: 'approved',
      needsRoleSelection: false,
      isApprovedOrganiser: true,
      isPendingOrganiser: false,
      isAdmin: false,
      isAttendee: false,
    };
  }

  return membership;
};

function ContentTabs({ isGuest, onSignIn, membership, viewMode, onChangeView, initialTab = 'HomeTab' }: { isGuest: boolean; onSignIn: () => void; membership: MembershipState; viewMode: AppViewMode; onChangeView: (mode: AppViewMode) => void; initialTab?: string; }) {
  const effectiveMembership = getAdminViewMembership(membership, viewMode);
  const isVipMode = viewMode === 'vip';
  const isOrganiserMode = viewMode === 'organiser';
  const resolvedInitialTab = (() => {
    const availableTabs = ['HomeTab', 'MarqueesTab', 'EventsTab', 'MyItineraryTab'];

    if (isOrganiserMode) {
      availableTabs.push('OrganizerStudioTab');
    }

    availableTabs.push('AccountTab');

    return availableTabs.includes(initialTab) ? initialTab : 'HomeTab';
  })();

  return (
    <View style={styles.tabsShell}>
      <Tab.Navigator
        key={`${viewMode}-${resolvedInitialTab}`}
        initialRouteName={resolvedInitialTab}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.cardBorder,
            borderTopWidth: 1,
            height: Platform.OS === 'web' ? 72 : 85,
            paddingBottom: Platform.OS === 'web' ? 8 : 28,
            paddingTop: 7,
          },
          tabBarActiveTintColor: Colors.gold,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarItemStyle: {
            minWidth: 0,
            paddingHorizontal: 2,
          },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{
            tabBarLabel: ({ color }: { color: string }) => <TabLabel color={color} label="Home" />,
            tabBarIcon: ({ color }: { color: string }) => (
              <Ionicons name="home-outline" size={22} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="MarqueesTab"
          component={MarqueesScreen}
          options={{
            tabBarLabel: ({ color }: { color: string }) => <TabLabel color={color} label="Marquees" />,
            tabBarIcon: ({ color }: { color: string }) => (
              <Ionicons name="ribbon-outline" size={22} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="EventsTab"
          component={EventsScreen}
          options={{
            tabBarLabel: ({ color }: { color: string }) => <TabLabel color={color} label="Events" />,
            tabBarIcon: ({ color }: { color: string }) => (
              <Ionicons name="musical-notes-outline" size={22} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="MyItineraryTab"
          component={MyScheduleScreen}
          options={{
            tabBarLabel: ({ color }: { color: string }) => <TabLabel color={color} label="Itinerary" />,
            tabBarIcon: ({ color }: { color: string }) => (
              <Ionicons name="calendar-outline" size={22} color={color} />
            ),
          }}
        />
        {isOrganiserMode ? (
          <Tab.Screen
            name="OrganizerStudioTab"
            children={() => (
              <OrganizerStudioScreen appViewMode={viewMode} onChangeAppViewMode={onChangeView} />
            )}
            options={{
              tabBarLabel: ({ color }: { color: string }) => (
                <TabLabel color={color} label={effectiveMembership.isApprovedOrganiser ? 'Studio' : 'Pending'} />
              ),
              tabBarIcon: ({ color }: { color: string }) => (
                <Ionicons name="business-outline" size={22} color={color} />
              ),
            }}
          />
        ) : null}
        <Tab.Screen
          name="AccountTab"
          options={{
            tabBarLabel: ({ color }: { color: string }) => <TabLabel color={color} label="Account" />,
            tabBarIcon: ({ color }: { color: string }) => (
              <Ionicons name="person-outline" size={22} color={color} />
            ),
          }}
        >
          {(props: any) => <ProfileScreen {...props} isGuest={isGuest} onSignIn={onSignIn} appViewMode={viewMode} onChangeAppViewMode={onChangeView} membership={effectiveMembership} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}

function AuthenticatedApp({ onSignIn, appViewMode, onChangeAppViewMode }: { onSignIn: () => void; appViewMode: AppViewMode; onChangeAppViewMode: (mode: AppViewMode) => void; }) {
  const profile = useQuery(api.users.getProfile);
  const membership = useQuery(api.users.getMembershipState);

  if (profile === undefined || membership === undefined) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  if (!profile || membership === null || membership.needsRoleSelection) {
    return <MembershipOnboardingScreen profile={profile} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main">
        {({ route }: any) => (
          <ContentTabs
            isGuest={false}
            onSignIn={onSignIn}
            membership={membership}
            viewMode={appViewMode}
            onChangeView={onChangeAppViewMode}
            initialTab={route?.params?.initialTab}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="Inquiry" component={InquiryScreen} />
      <Stack.Screen name="ServicesTab" component={ServicesScreen} />
      <Stack.Screen name="Stay" component={StayScreen} />
      <Stack.Screen name="MySchedule" component={MyScheduleScreen} />
      <Stack.Screen name="Shopping" component={ShoppingScreen} />
      <Stack.Screen name="Transport" component={TransportScreen} />
      <Stack.Screen name="Concierge" component={ConciergeScreen} />
      <Stack.Screen name="Sponsors" component={SponsorsScreen} />
      <Stack.Screen name="Theme" component={ThemeScreen} />
      <Stack.Screen name="DurbanActivities" component={DurbanActivitiesScreen} />
      <Stack.Screen name="OrganizerDashboard">
        {(props: any) => <OrganizerStudioScreen {...props} appViewMode={appViewMode} onChangeAppViewMode={onChangeAppViewMode} />}
      </Stack.Screen>
      <Stack.Screen name="AdminDashboard">
        {(props: any) => <AdminDashboardScreen {...props} appViewMode={appViewMode} onChangeAppViewMode={onChangeAppViewMode} />}
      </Stack.Screen>
      <Stack.Screen name="AdminPin" component={AdminPinScreen} />
      <Stack.Screen name="OrganizerPin" component={AdminPinScreen} />
    </Stack.Navigator>
  );
}

function GuestApp({ onSignIn, appViewMode, onChangeAppViewMode }: { onSignIn: () => void; appViewMode: AppViewMode; onChangeAppViewMode: (mode: AppViewMode) => void; }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main">
        {() => <ContentTabs isGuest={true} onSignIn={onSignIn} membership={getGuestMembership()} viewMode={appViewMode} onChangeView={onChangeAppViewMode} />}
      </Stack.Screen>
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="Inquiry" component={InquiryScreen} />
      <Stack.Screen name="ServicesTab" component={ServicesScreen} />
      <Stack.Screen name="Stay" component={StayScreen} />
      <Stack.Screen name="MySchedule" component={MyScheduleScreen} />
      <Stack.Screen name="Shopping" component={ShoppingScreen} />
      <Stack.Screen name="Transport" component={TransportScreen} />
      <Stack.Screen name="Concierge" component={ConciergeScreen} />
      <Stack.Screen name="Sponsors" component={SponsorsScreen} />
      <Stack.Screen name="Theme" component={ThemeScreen} />
      <Stack.Screen name="DurbanActivities" component={DurbanActivitiesScreen} />
      <Stack.Screen name="OrganizerDashboard" component={OrganizerStudioScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminPin" component={AdminPinScreen} />
      <Stack.Screen name="OrganizerPin" component={AdminPinScreen} />
    </Stack.Navigator>
  );
}

function WelcomeFlow({ onGuest }: { onGuest: () => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome">
        {(props: any) => <WelcomeScreen {...props} onGuest={onGuest} />}
      </Stack.Screen>
      <Stack.Screen name="PublicRegistration" component={PublicRegistrationScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}

function RegistrationFlow() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PublicRegistration" component={PublicRegistrationScreen} />
    </Stack.Navigator>
  );
}

function isRegistrationUrl(url: string | null | undefined) {
  if (!url) return false;

  const trimmed = url.split('?')[0].split('#')[0];
  const path = trimmed.includes('://') ? trimmed.replace(/^https?:\/\/[^/]+/, '') : trimmed;
  return path === REGISTRATION_PATH || path === `${REGISTRATION_PATH}/`;
}

function getInitialRegistrationState() {
  if (Platform.OS !== 'web') return false;

  const location = typeof globalThis !== 'undefined' ? (globalThis as any).location : null;
  if (!location?.pathname) return false;

  return isRegistrationUrl(location.pathname);
}

function AppContent() {
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const [adminViewMode, setAdminViewMode] = useState<AppViewMode>('admin');
  const [showRegistration, setShowRegistration] = useState(() => getInitialRegistrationState());

  useEffect(() => {
    AsyncStorage.getItem(GUEST_KEY).then((val: string | null) => {
      setIsGuest(val === 'true');
    });
    AsyncStorage.getItem(ADMIN_VIEW_KEY).then((val: string | null) => {
      if (val === 'vip' || val === 'organiser' || val === 'admin') {
        setAdminViewMode(val);
      }
    });

    Linking.getInitialURL().then((url: string | null) => {
      if (isRegistrationUrl(url)) {
        setShowRegistration(true);
      }
    });

    const subscription = Linking.addEventListener('url', ({ url }: { url: string }) => {
      setShowRegistration(isRegistrationUrl(url));
    });

    return () => subscription.remove();
  }, []);

  const enterGuest = useCallback(async () => {
    await AsyncStorage.setItem(GUEST_KEY, 'true');
    setIsGuest(true);
  }, []);

  const exitGuest = useCallback(async () => {
    await AsyncStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
  }, []);

  const handleChangeAdminView = useCallback(async (mode: AppViewMode) => {
    setAdminViewMode(mode);
    await AsyncStorage.setItem(ADMIN_VIEW_KEY, mode);
  }, []);

  if (isGuest === null) {
    return (
      <SafeAreaProvider style={styles.container}>
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      </SafeAreaProvider>
    );
  }

  if (showRegistration) {
    return (
      <SafeAreaProvider style={styles.container}>
        <NavigationContainer linking={linking}>
          <RegistrationFlow />
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <NavigationContainer>
        <AuthLoading>
          <View style={[styles.container, styles.center]}>
            <ActivityIndicator size="large" color={Colors.gold} />
            <Text style={{ color: Colors.textSecondary, marginTop: 12 }}>Loading...</Text>
          </View>
        </AuthLoading>

        <Authenticated>
          <AuthenticatedApp onSignIn={exitGuest} appViewMode={adminViewMode} onChangeAppViewMode={handleChangeAdminView} />
        </Authenticated>

        <Unauthenticated>
          {isGuest ? (
            <GuestApp onSignIn={exitGuest} appViewMode={adminViewMode} onChangeAppViewMode={handleChangeAdminView} />
          ) : (
            <WelcomeFlow onGuest={enterGuest} />
          )}
        </Unauthenticated>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ConvexAuthProvider client={convex} storage={convexAuthStorage}>
      <AppContent />
    </ConvexAuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsShell: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
  },
  tabLabel: {
    width: '100%',
    minWidth: 0,
    paddingHorizontal: 1,
    textAlign: 'center',
    fontSize: Platform.OS === 'web' ? 9 : 11,
    lineHeight: Platform.OS === 'web' ? 12 : 14,
    fontWeight: '600',
  },
  viewBanner: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    backgroundColor: Colors.surface,
  },
  viewBannerCopy: {
    marginBottom: 10,
  },
  viewBannerEyebrow: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  viewBannerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  viewBannerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  viewBannerPills: {
    flexDirection: 'row',
    gap: 8,
  },
  viewBannerPill: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.background,
    paddingVertical: 8,
  },
  viewBannerPillActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  viewBannerPillText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  viewBannerPillTextActive: {
    color: Colors.black,
  },
  viewBannerReturnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },
  viewBannerReturnText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 8,
  },
});
