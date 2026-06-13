import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Dimensions, Platform, StatusBar, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';

const { width, height } = Dimensions.get('window');

type Props = {
  onGuest: () => void;
  navigation: any;
};

export default function WelcomeScreen({ onGuest, navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image
        source={{ uri: 'https://api.a0.dev/assets/image?text=hollywoodbets+durban+july+horse+racing+greyville+elegant+vip+guests+dressed+up+luxury+fashion+golden+hour+champagne+celebration&aspect=9:16&seed=42' }}
        style={styles.bgImage}
      />
      <View style={styles.gradient} />

      <SafeAreaView style={styles.content}>
        <ScrollView
          style={[styles.scrollView, Platform.OS === 'web' && styles.webScroll]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.logoArea}>
            <View style={styles.logoBadge}>
              <Ionicons name="trophy" size={28} color={Colors.gold} />
            </View>
          </View>

          <View style={styles.bottomArea}>
            <Text style={styles.theme}>"Country Allure"</Text>
            <Text style={styles.title}>Hollywoodbets{'\n'}Durban July</Text>
            <Text style={styles.subtitle}>4 July 2026</Text>
            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => navigation.navigate('Auth', { initialMode: 'signIn' })}
                activeOpacity={0.85}
              >
                <Ionicons name="log-in-outline" size={20} color={Colors.black} />
                <Text style={styles.loginBtnText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerBtn}
                onPress={() => navigation.navigate('Auth', { initialMode: 'signUp' })}
                activeOpacity={0.85}
              >
                <Ionicons name="person-add-outline" size={20} color={Colors.gold} />
                <Text style={styles.registerBtnText}>Register</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.guestBtn} onPress={onGuest} activeOpacity={0.85}>
                <Ionicons name="eye-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.guestBtnText}>Continue as Guest</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bgImage: { position: 'absolute', width, height, resizeMode: 'cover' },
  gradient: { position: 'absolute', width, height },
  content: { flex: 1 },
  scrollView: { flex: 1 },
  webScroll: {
    overflowY: 'auto',
    overflowX: 'hidden',
    touchAction: 'pan-y',
    WebkitOverflowScrolling: 'touch',
  } as any,
  scrollContent: { flexGrow: 1, justifyContent: 'space-between' },
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
  buttons: { gap: Spacing.md },
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.md, backgroundColor: Colors.gold,
    paddingVertical: 15, borderRadius: BorderRadius.md,
  },
  loginBtnText: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.black },
  registerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.md, backgroundColor: 'transparent',
    paddingVertical: 15, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.gold,
  },
  registerBtnText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.gold },
  guestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  guestBtnText: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '500' },
});
