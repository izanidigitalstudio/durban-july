import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Dimensions, Platform, ActivityIndicator, StatusBar, Share, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';

const { width, height } = Dimensions.get('window');

const REGISTRATION_URL = 'https://www.durbanjulyvip.co.za/register';
const WEB_APP_URL = 'https://www.durbanjulyvip.co.za';
const TESTFLIGHT_URL = 'https://testflight.apple.com/join/vGNPJCxy';

type Props = {
  onGuest: () => void;
  navigation: any;
};

export default function WelcomeScreen({ onGuest, navigation }: Props) {
  const loading = false;

  const handleShareRegistration = async () => {
    try {
      await Share.share({
        title: 'Durban July VIP registration',
        message: `Register here: ${REGISTRATION_URL}\n\nAfter registering, you can access the web app: ${WEB_APP_URL}\nOr join the beta app: ${TESTFLIGHT_URL}`,
        url: REGISTRATION_URL,
      });
    } catch (e) {
      console.log('Share cancelled or failed', e);
    }
  };

  const handleOpenWebApp = async () => {
    await Linking.openURL(WEB_APP_URL);
  };

  const handleOpenTestFlight = async () => {
    await Linking.openURL(TESTFLIGHT_URL);
  };

  const handleOpenRegistration = async () => {
    await Linking.openURL(REGISTRATION_URL);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image
        source={{ uri: 'https://api.a0.dev/assets/image?text=hollywoodbets+durban+july+horse+racing+greyville+elegant+vip+guests+dressed+up+luxury+fashion+golden+hour+champagne+celebration&aspect=9:16&seed=42' }}
        style={styles.bgImage}
      />
      <View style={styles.gradient} />

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
          <Text style={styles.subtitle}>4 July 2026</Text>
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
              <TouchableOpacity
                style={styles.registerBtn}
                onPress={() => navigation.navigate('PublicRegistration')}
                activeOpacity={0.85}
              >
                <Ionicons name="person-add-outline" size={20} color={Colors.black} />
                <Text style={styles.registerBtnText}>Register Now</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkBtn} onPress={handleOpenRegistration} activeOpacity={0.85}>
                <Ionicons name="open-outline" size={18} color={Colors.gold} />
                <Text style={styles.linkBtnText}>Open registration link</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareBtn} onPress={handleShareRegistration} activeOpacity={0.85}>
                <Ionicons name="share-social-outline" size={20} color={Colors.gold} />
                <Text style={styles.shareBtnText}>Share registration link</Text>
              </TouchableOpacity>

              <View style={styles.quickLinks}>
                <TouchableOpacity style={styles.quickLinkBtn} onPress={handleOpenWebApp} activeOpacity={0.85}>
                  <Text style={styles.quickLinkText}>Open web app</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickLinkBtn} onPress={handleOpenTestFlight} activeOpacity={0.85}>
                  <Text style={styles.quickLinkText}>Join beta</Text>
                </TouchableOpacity>
              </View>

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
  registerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.md, backgroundColor: Colors.gold,
    paddingVertical: 15, borderRadius: BorderRadius.md,
  },
  registerBtnText: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.black },
  linkBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: 'transparent',
    paddingVertical: 13, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.gold,
  },
  linkBtnText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.gold },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.md, backgroundColor: 'rgba(0,0,0,0.28)',
    paddingVertical: 14, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.gold,
  },
  shareBtnText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.gold },
  quickLinks: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickLinkBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  quickLinkText: { color: Colors.white, fontSize: FontSizes.sm, fontWeight: '700' },
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
