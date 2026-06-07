import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppStateProvider, useAppData } from './lib/appState';
import { Colors } from './lib/theme';
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
import AdminPinScreen from './screens/AdminPinScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import AuthScreen from './screens/AuthScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ContentTabs({ isGuest, onSignIn }: { isGuest: boolean; onSignIn: () => void }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'web' ? 0 : Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.cardBorder,
          borderTopWidth: 1,
          height: 57 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="MarqueesTab"
        component={MarqueesScreen}
        options={{
          tabBarLabel: 'Marquees',
          tabBarIcon: ({ color }) => <Ionicons name="ribbon-outline" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsScreen}
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: ({ color }) => (
            <Ionicons name="musical-notes-outline" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyItineraryTab"
        component={MyScheduleScreen}
        options={{
          tabBarLabel: 'My Itinerary',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="AccountTab"
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
        }}
      >
        {(props) => <ProfileScreen {...props} isGuest={isGuest} onSignIn={onSignIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AuthenticatedApp() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main">
        {() => <ContentTabs isGuest={false} onSignIn={() => undefined} />}
      </Stack.Screen>
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="Inquiry" component={InquiryScreen} />
      <Stack.Screen name="ServicesTab" component={ServicesScreen} />
      <Stack.Screen name="Stay" component={StayScreen} />
      <Stack.Screen name="MySchedule" component={MyScheduleScreen} />
      <Stack.Screen name="Shopping" component={ShoppingScreen} />
      <Stack.Screen name="Transport" component={TransportScreen} />
      <Stack.Screen name="Concierge" component={ConciergeScreen} />
      <Stack.Screen name="Theme" component={ThemeScreen} />
      <Stack.Screen name="DurbanActivities" component={DurbanActivitiesScreen} />
      <Stack.Screen name="AdminPin" component={AdminPinScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    </Stack.Navigator>
  );
}

function GuestApp({ onSignIn }: { onSignIn: () => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main">
        {() => <ContentTabs isGuest={true} onSignIn={onSignIn} />}
      </Stack.Screen>
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="Inquiry" component={InquiryScreen} />
      <Stack.Screen name="ServicesTab" component={ServicesScreen} />
      <Stack.Screen name="Stay" component={StayScreen} />
      <Stack.Screen name="MySchedule" component={MyScheduleScreen} />
      <Stack.Screen name="Shopping" component={ShoppingScreen} />
      <Stack.Screen name="Transport" component={TransportScreen} />
      <Stack.Screen name="Concierge" component={ConciergeScreen} />
      <Stack.Screen name="Theme" component={ThemeScreen} />
      <Stack.Screen name="DurbanActivities" component={DurbanActivitiesScreen} />
      <Stack.Screen name="AdminPin" component={AdminPinScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    </Stack.Navigator>
  );
}

function WelcomeFlow({ onGuest }: { onGuest: () => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome">
        {(props) => <WelcomeScreen {...props} onGuest={onGuest} />}
      </Stack.Screen>
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { isReady, isAuthenticated, isGuest, enterGuest, exitGuest } = useAppData();

  if (!isReady) {
    return (
      <SafeAreaProvider style={styles.container}>
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Loading Durban July VIP...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <NavigationContainer>
        {isAuthenticated ? (
          <AuthenticatedApp />
        ) : isGuest ? (
          <GuestApp onSignIn={exitGuest} />
        ) : (
          <WelcomeFlow onGuest={enterGuest} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppNavigator />
    </AppStateProvider>
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
  loadingText: {
    color: Colors.textSecondary,
    marginTop: 12,
  },
});
