import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { marquees, MarqueePackage } from '../lib/data';
import AdaptiveImage from '../components/AdaptiveImage';
import { useCatalogueColumns } from '../lib/responsive';

const tiers = ['All', 'VIP', 'Ultra VIP'] as const;
type Tier = (typeof tiers)[number];

function getImageSource(uri: string | number) {
  return typeof uri === 'string' ? { uri } : uri;
}

function getPrimaryMarqueeImage(item: MarqueePackage) {
  return getImageSource(item.images?.[0] ?? item.image);
}

export default function MarqueesScreen({ navigation }: any) {
  const [selectedTier, setSelectedTier] = useState<Tier>('All');
  const numColumns = useCatalogueColumns();

  const filtered = selectedTier === 'All'
    ? marquees
    : marquees.filter((m) => m.tier === selectedTier);

  const renderMarquee = (item: MarqueePackage) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.card, numColumns === 2 && styles.gridCard]}
      onPress={() => navigation.navigate('Detail', { type: 'marquee', id: item.id })}
      activeOpacity={0.85}
    >
      <View style={styles.cardImageWrap}>
        <AdaptiveImage
          source={getPrimaryMarqueeImage(item)}
          style={styles.cardImage}
        />
        <View style={styles.cardImageShade} />
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>{item.tier}</Text>
        </View>
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardVenue} numberOfLines={1}>{item.venue}</Text>

        <View style={styles.cardMetaRow}>
          <Text style={styles.cardPrice} numberOfLines={1}>{item.price}</Text>
        </View>

        <Text style={styles.cardDescription} numberOfLines={3}>{item.description}</Text>

        <View style={styles.cardCta}>
          <Text style={styles.cardCtaText}>View Package</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Book Hotel and Hospitality Packages</Text>
          <Text style={styles.headerTitle}>2026 Hospitality Packages Released</Text>
          <Text style={styles.headerSub}>Official marquee hospitality for Durban July 2026</Text>
        </View>

        <View style={styles.filterRow}>
          {tiers.map((item: Tier) => (
            <TouchableOpacity
              key={item}
              style={[styles.filterChip, selectedTier === item && styles.filterChipActive]}
              onPress={() => setSelectedTier(item)}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterText, selectedTier === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={[styles.cardGrid, numColumns === 2 && styles.cardGridDesktop]}>
          {filtered.map(renderMarquee)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  kicker: {
    fontSize: FontSizes.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: Colors.goldLight,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 6,
    lineHeight: 30,
  },
  headerSub: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 21,
  },
  filterRow: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginRight: 8,
    marginTop: 8,
  },
  filterChipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  filterText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '700' },
  filterTextActive: { color: Colors.black },
  list: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: 100 },
  cardGrid: { width: '100%' },
  cardGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
    overflow: 'hidden',
  },
  gridCard: { width: '49%' },
  cardImageWrap: {
    position: 'relative',
    width: '100%',
    backgroundColor: 'transparent',
  },
  cardImage: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  cardImageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  cardBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 2,
  },
  cardBadgeText: { fontSize: 12, fontWeight: '800', color: Colors.black },
  cardInfo: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: Colors.black,
  },
  cardName: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 26,
  },
  cardVenue: {
    fontSize: FontSizes.sm,
    color: Colors.goldLight,
    marginTop: 4,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cardPrice: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.gold,
  },
  cardDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginTop: 8,
  },
  cardCta: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold,
  },
  cardCtaText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.black,
  },
});
