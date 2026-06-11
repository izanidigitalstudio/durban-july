import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { marquees, MarqueePackage } from '../lib/data';
import { useCatalogueColumns } from '../lib/responsive';

const tiers = ['All', 'VIP', 'Ultra VIP'] as const;
type Tier = (typeof tiers)[number];

function getImageSource(uri: string | number) {
  return typeof uri === 'string' ? { uri } : uri;
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
      style={[styles.card, { flexBasis: numColumns === 3 ? '31%' : '48%' }]}
      onPress={() => navigation.navigate('Detail', { type: 'marquee', id: item.id })}
      activeOpacity={0.85}
    >
      <View style={styles.cardImageWrap}>
        <Image
          source={getImageSource(item.image)}
          style={[styles.cardImage, item.imageFit === 'contain' && styles.cardImageContain]}
          resizeMode={item.imageFit ?? 'contain'}
        />
      </View>
      <View style={styles.cardGradient} />
      <View style={styles.cardBadge}>
        <Text style={styles.cardBadgeText}>{item.tier}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardVenue}>
          <Ionicons name="location-outline" size={12} color={Colors.textSecondary} /> {item.venue}
        </Text>
        <View style={styles.cardBottom}>
          <Text style={styles.cardPrice}>{item.price}</Text>
          {item.capacity && (
            <Text style={styles.cardCapacity}>
              <Ionicons name="people-outline" size={12} color={Colors.textSecondary} /> {item.capacity}
            </Text>
          )}
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.background }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hospitality Platforms</Text>
          <Text style={styles.headerSub}>Durban July 2026 · Official marquee hospitality</Text>
        </View>
        <View style={styles.filterRow}>
          {tiers.map((item: Tier) => (
            <TouchableOpacity
              key={item}
              style={[styles.filterChip, selectedTier === item && styles.filterChipActive]}
              onPress={() => setSelectedTier(item)}
            >
              <Text style={[styles.filterText, selectedTier === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map(renderMarquee)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: FontSizes.sm, color: Colors.gold, marginTop: 2 },
  filterRow: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.sm, flexDirection: 'row', flexWrap: 'wrap' },
  filterChip: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  filterChipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  filterText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: Colors.black },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  card: {
    flexGrow: 1,
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  cardImageWrap: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.deepMaroon,
    borderBottomWidth: 1,
    borderBottomColor: Colors.deepMaroon,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.deepMaroon,
  },
  cardImageContain: {
    backgroundColor: Colors.surface,
  },
  cardGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  cardBadge: {
    position: 'absolute', top: Spacing.md, right: Spacing.md,
    backgroundColor: Colors.gold, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
  },
  cardBadgeText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.black },
  cardContent: { padding: Spacing.lg },
  cardName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  cardVenue: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cardPrice: { fontSize: FontSizes.lg, fontWeight: '800', color: Colors.gold },
  cardCapacity: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  cardDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
});
