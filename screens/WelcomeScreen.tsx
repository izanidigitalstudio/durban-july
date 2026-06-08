import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView,
  Platform, ActivityIndicator, StatusBar, Alert, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';

const countryAllurePortrait = require('../assets/durban-july-2026-country-allure-portrait.jpg');
const vipLogo = require('../assets/vip-favicon.png');

type Props = {
  onGuest: () => void;
  navigation: any;
};

export default function WelcomeScreen({ onGuest, navigation }: Props) {
  const [loading, setLoading] = React.useState(false);
  const { width, height } = useWindowDimensions();
  const isCompact = height < 720 || width < 360;

  const handleGoogle = async () => {
    try {
      setLoading(true);
      Alert.alert(
        'Social Sign-In Unavailable',
        'This standalone web build uses local email sign-in. Please continue with email or explore as a guest.'
      );
    } catch (e) {
      console.log('Google sign in cancelled or failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    try {
      setLoading(true);
      Alert.alert(
        'Social Sign-In Unavailable',
        'This standalone web build uses local email sign-in. Please continue with email or explore as a guest.'
      );
    } catch (e) {
      console.log('Apple sign in cancelled or failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image
        source={countryAllurePortrait}
        style={styles.bgImage}
        blurRadius={12}
      />
      <LinearGradient
        colors={['rgba(11,11,15,0.15)', 'rgba(11,11,15,0.55)', 'rgba(11,11,15,0.96)', Colors.background]}
        locations={[0, 0.36, 0.64, 0.86]}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, isCompact && styles.compactContent]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo */}
          <View style={[styles.logoArea, isCompact && styles.compactLogoArea]}>
            <Image
              source={vipLogo}
              style={[styles.vipLogo, isCompact && styles.compactVipLogo]}
            />
          </View>

          {/* Bottom Content */}
          <View style={[styles.bottomArea, isCompact && styles.compactBottomArea]}>
            <Text style={styles.theme}>"Country Allure"</Text>
            <Text style={[styles.title, isCompact && styles.compactTitle]}>Hollywoodbets{'\n'}Durban July</Text>
            <Text style={styles.subtitle}>4 July 2026</Text>
            <Text style={[styles.desc, isCompact && styles.compactDesc]}>
              Your VIP guide to marquees, events, accommodation, transport and concierge services for the Durban July weekend.
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.gold} />
                <Text style={styles.loadingText}>Signing in...</Text>
              </View>
            ) : (
              <View style={[styles.buttons, isCompact && styles.compactButtons]}>
                {/* Google Sign In */}
                <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.85}>
                  <Ionicons name="logo-google" size={20} color="#000" />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </TouchableOpacity>

                {/* Apple Sign In (iOS only) */}
                {Platform.OS === 'ios' && (
                  <TouchableOpacity style={styles.appleBtn} onPress={handleApple} activeOpacity={0.85}>
                    <Ionicons name="logo-apple" size={22} color="#FFF" />
                    <Text style={styles.appleBtnText}>Continue with Apple</Text>
                  </TouchableOpacity>
                )}

                {/* Email Sign In */}
                <TouchableOpacity
                  style={styles.emailBtn}
                  onPress={() => navigation.navigate('Auth')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="mail-outline" size={20} color={Colors.gold} />
                  <Text style={styles.emailBtnText}>Sign in with Email</Text>
                </TouchableOpacity>

                {/* Guest Access */}
                <TouchableOpacity style={styles.guestBtn} onPress={onGuest} activeOpacity={0.85}>
                  <Text style={styles.guestBtnText}>Explore as Guest</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'space-between' },
  compactContent: { minHeight: '100%' },
  logoArea: { alignItems: 'center', paddingTop: Spacing.xxxl },
  compactLogoArea: { paddingTop: Spacing.md },
  vipLogo: { width: 112, height: 112, resizeMode: 'contain' },
  compactVipLogo: { width: 88, height: 88 },
  bottomArea: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xl },
  compactBottomArea: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  theme: {
    fontSize: FontSizes.sm, color: Colors.gold, fontStyle: 'italic',
    letterSpacing: 2, marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 36, fontWeight: '800', color: Colors.white,
    lineHeight: 40, marginBottom: Spacing.md,
  },
  compactTitle: { fontSize: 30, lineHeight: 33, marginBottom: Spacing.sm },
  subtitle: {
    fontSize: FontSizes.md, color: Colors.gold, fontWeight: '600',
    marginBottom: Spacing.md,
  },
  desc: {
    fontSize: FontSizes.sm, color: Colors.textSecondary,
    lineHeight: 20, marginBottom: Spacing.xxl,
  },
  compactDesc: { lineHeight: 18, marginBottom: Spacing.lg },
  loadingContainer: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  loadingText: { fontSize: FontSizes.md, color: Colors.gold, marginTop: Spacing.md },
  buttons: { gap: Spacing.md },
  compactButtons: { gap: Spacing.sm },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.md, backgroundColor: Colors.white,
    paddingVertical: 15, borderRadius: BorderRadius.md,
  },
  googleBtnText: { fontSize: FontSizes.md, fontWeight: '600', color: '#000' },
  appleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.md, backgroundColor: '#000',
    paddingVertical: 15, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  appleBtnText: { fontSize: FontSizes.md, fontWeight: '600', color: '#FFF' },
  emailBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.md, backgroundColor: 'transparent',
    paddingVertical: 15, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.gold,
  },
  emailBtnText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.gold },
  guestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md,
  },
  guestBtnText: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '500' },
});
