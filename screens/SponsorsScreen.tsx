import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Alert, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';

const sponsors = [
  {
    name: 'HONOR',
    logo: 'https://www.hollywoodbetsdurbanjuly.co.za/wp-content/uploads/2025/06/HONOR-LOGO_BLACK-resized.png',
    website: 'https://www.honor.com/za/',
  },
  {
    name: 'Omoda',
    logo: 'https://www.hollywoodbetsdurbanjuly.co.za/wp-content/uploads/2024/05/OMODA-200.png',
    website: 'https://www.omoda.co.za/',
  },
  {
    name: 'Dove',
    logo: 'https://www.hollywoodbetsdurbanjuly.co.za/wp-content/uploads/2023/05/Dove-June3-resize.png',
    website: 'https://www.dove.com/',
  },
  {
    name: 'Vaseline Cera-Glow',
    logo: 'https://www.hollywoodbetsdurbanjuly.co.za/wp-content/uploads/2025/06/CeraGlow850.png',
    website: 'https://www.vaseline.com/',
  },
  {
    name: 'Ridgemont',
    logo: 'https://www.hollywoodbetsdurbanjuly.co.za/wp-content/uploads/2023/05/SPRidgemont.png',
    website: 'https://www.ridgemont.co.za/',
  },
  {
    name: 'Savanna',
    logo: 'https://www.hollywoodbetsdurbanjuly.co.za/wp-content/uploads/2023/05/SPSavanna.png',
    website: 'https://www.savanna.co.za/',
  },
  {
    name: 'Glamour',
    logo: 'https://www.hollywoodbetsdurbanjuly.co.za/wp-content/uploads/2023/05/SPGlamour.png',
    website: 'https://www.glamour.co.za/',
  },
  {
    name: 'GQ',
    logo: 'https://www.hollywoodbetsdurbanjuly.co.za/wp-content/uploads/2023/05/SPGQ.png',
    website: 'https://www.gq.co.za/',
  },
  {
    name: 'Avis',
    logo: 'https://www.hollywoodbetsdurbanjuly.co.za/wp-content/uploads/2023/06/avis_4cp_red-e1685681596375.jpg',
    website: 'https://www.avis.com/',
  },
  {
    name: 'Splash Out',
    logo: 'https://www.hollywoodbetsdurbanjuly.co.za/wp-content/uploads/2023/06/new-splash-out-logos-03-200.png',
    website: 'https://splashout.co.za/',
  },
  {
    name: 'Windhoek',
    logo: 'https://www.hollywoodbetsdurbanjuly.co.za/wp-content/uploads/2024/05/Windhoek_200.jpg',
    website: 'https://www.windhoekbeer.com/',
  },
  {
    name: 'Proudly SA',
    logo: 'https://www.hollywoodbetsdurbanjuly.co.za/wp-content/uploads/2024/07/ProudlySA_Member_Logo-2-e1719901656793.png',
    website: 'https://www.proudlysa.co.za/',
  },
  {
    name: 'SABC Sport',
    logo: 'https://www.hollywoodbetsdurbanjuly.co.za/wp-content/uploads/2025/06/SABC-SPORT-LOGO-200.png',
    website: 'https://www.sabc.co.za/sabc-sport/',
  },
];

export default function SponsorsScreen({ navigation }: { navigation: any }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const openSponsorWebsite = async (website?: string) => {
    if (!website) {
      Alert.alert('Website unavailable', 'No sponsor website is available for this sponsor yet.');
      return;
    }

    const supported = await Linking.canOpenURL(website);
    if (!supported) {
      Alert.alert('Unable to open link', website);
      return;
    }

    await Linking.openURL(website);
  };

  return (
    <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack?.()) {
                navigation.goBack();
              } else {
                navigation.getParent()?.navigate('AccountTab');
              }
            }}
            hitSlop={10}
            style={styles.backButton}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-back" size={26} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Sponsors</Text>
            <Text style={styles.headerSubtitle}>13 official Durban July sponsors</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroRow}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={22} color={Colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Official partners and brands</Text>
              <Text style={styles.heroCopy}>Tap any card to visit the sponsor website.</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={[styles.scroll, Platform.OS === 'web' && styles.webScroll]}
        contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {sponsors.map((sponsor) => (
          <TouchableOpacity
            key={sponsor.name}
            style={[styles.card, isDesktop && styles.cardDesktop]}
            activeOpacity={0.88}
            onPress={() => openSponsorWebsite(sponsor.website)}
          >
            <View style={styles.logoWrap}>
              <Image source={{ uri: sponsor.logo }} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.cardText}>
              <Text style={styles.name}>{sponsor.name}</Text>
              <Text style={styles.tapHint}>Tap to open website</Text>
            </View>

            <View style={styles.ctaBubble}>
              <Ionicons name="open-outline" size={18} color={Colors.gold} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 0, overflow: 'hidden', backgroundColor: Colors.background },
  webContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    height: '100dvh',
    maxHeight: '100dvh',
  } as any,
  safeHeader: {
    flexShrink: 0,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1, minHeight: 0 },
  webScroll: {
    overflowY: 'auto',
    overflowX: 'hidden',
    touchAction: 'pan-y',
    WebkitOverflowScrolling: 'touch',
  } as any,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  headerTextWrap: { flex: 1 },
  headerTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  heroCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(201, 168, 76, 0.10)',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.28)',
  },
  heroTitle: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '800',
  },
  heroCopy: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  contentDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    shadowColor: Colors.black,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  cardDesktop: {
    flexBasis: '31%',
    flexGrow: 1,
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: Colors.paleGray,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  logo: {
    width: '82%',
    height: '82%',
  },
  cardText: {
    flex: 1,
    paddingVertical: Spacing.xs,
  },
  name: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  tapHint: {
    marginTop: 4,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  ctaBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 168, 76, 0.14)',
  },
});
