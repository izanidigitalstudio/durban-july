import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Dimensions, Platform, ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';

const { width, height } = Dimensions.get('window');

type Props = {
  onGuest: () => void;
  navigation: any;
};

export default function WelcomeScreen({ onGuest, navigation }: Props) {
  const [loading, setLoading] = React.useState(false);

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
        source={{ uri: 'https://api.a0.dev/assets/image?text=hollywoodbets+durban+july+horse+racing+greyville+elegant+vip+guests+dressed+up+luxury+fashion+golden+hour+champagne+celebration&aspect=9:16&seed=42' }}
        style={styles.bgImage}
      />
      <LinearGradient
        colors={['rgba(11,11,15,0.3)', 'rgba(11,11,15,0.7)', 'rgba(11,11,15,0.95)', Colors.background]}
        locations={[0, 0.4, 0.65, 0.85]}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.content}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoBadge}>
            <Ionicons name="trophy" size={28} color={Colors.gold} />
          </View>
        </View>

        {/* Bottom Content */}
        <View style={styles.bottomArea}>
          <Text style={styles.theme}>"Country Allure"</Text>
          <Text style={styles.title}>Hollywoodbets{'\n'}Durban July</Text>
          <Text style={styles.subtitle}>5 July 2026</Text>
          <Text style={styles.desc}>
            Your VIP guide to marquees, events, accommodation, transport and concierge services for the Durban July weekend.
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.gold} />
              <Text style={styles.loadingText}>Signing in...</Text>
            </View>
          ) : (
            <View style={styles.buttons}>
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bgImage: { position: 'absolute', width, height, resizeMode: 'cover' },
  gradient: { position: 'absolute', width, height },
  content: { flex: 1, justifyContent: 'space-between' },
  logoArea: { alignItems: 'center', paddingTop: Spacing.xxxl },
  logoBadge: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.surface,
    borderWidth: 2, borderColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  bottomArea: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xl },
  theme: {
    fontSize: FontSizes.sm, color: Colors.gold, fontStyle: 'italic',
    letterSpacing: 2, marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 36, fontWeight: '800', color: Colors.white,
    lineHeight: 40, marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.md, color: Colors.gold, fontWeight: '600',
    marginBottom: Spacing.md,
  },
  desc: {
    fontSize: FontSizes.sm, color: Colors.textSecondary,
    lineHeight: 20, marginBottom: Spacing.xxl,
  },
  loadingContainer: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  loadingText: { fontSize: FontSizes.md, color: Colors.gold, marginTop: Spacing.md },
  buttons: { gap: Spacing.md },
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
