import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { marquees, MarqueePackage } from '../lib/data';

const tiers = ['All', 'General', 'VIP', 'VVIP', 'Premium', 'Ultra VIP'] as const;

export default function MarqueesScreen({ navigation }: any) {
  const [selectedTier, setSelectedTier] = useState<string>('All');

  const filtered = selectedTier === 'All'
    ? marquees
    : marquees.filter(m => m.tier === selectedTier);

  const renderMarquee = ({ item }: { item: MarqueePackage }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detail', { type: 'marquee', id: item.id })}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardGradient} />
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
          <Text style={styles.headerTitle}>Race Day Marquees</Text>
          <Text style={styles.headerSub}>Greyville Racecourse · 4 July 2026 · "Country Allure"</Text>
        </View>
        <FlatList
          horizontal
          data={tiers}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedTier === item && styles.filterChipActive]}
              onPress={() => setSelectedTier(item)}
            >
              <Text style={[styles.filterText, selectedTier === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderMarquee}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: FontSizes.sm, color: Colors.gold, marginTop: 2 },
  filterRow: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  filterChipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  filterText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: Colors.black },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  card: {
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    marginBottom: Spacing.lg, backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  cardImage: { width: '100%', height: 180 },
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