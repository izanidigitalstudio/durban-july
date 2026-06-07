import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { useCatalogueColumns } from '../lib/responsive';
import { marquees, MarqueePackage } from '../lib/data';

const tiers = ['All', 'General', 'VIP', 'VVIP', 'Premium', 'Ultra VIP'] as const;

export default function MarqueesScreen({ navigation }: any) {
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const numColumns = useCatalogueColumns();

  const filtered = selectedTier === 'All'
    ? marquees
    : marquees.filter(m => m.tier === selectedTier);

  const renderMarquee = ({ item }: { item: MarqueePackage }) => (
    <TouchableOpacity
      style={[styles.card, { flex: 1 / numColumns }]}
      onPress={() => navigation.navigate('Detail', { type: 'marquee', id: item.id })}
      activeOpacity={0.85}
    >
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.cardGradient} />
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>{item.tier}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardVenue} numberOfLines={1}>
          <Ionicons name="location-outline" size={10} color={Colors.textSecondary} /> {item.venue}
        </Text>
        <View style={styles.cardBottom}>
          <Text style={styles.cardPrice}>{item.price}</Text>
          {item.capacity && (
            <Text style={styles.cardCapacity} numberOfLines={1}>
              <Ionicons name="people-outline" size={10} color={Colors.textSecondary} /> {item.capacity}
            </Text>
          )}
        </View>
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
        key={`marquees-${numColumns}`}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderMarquee}
        numColumns={numColumns}
        columnWrapperStyle={styles.columnWrapper}
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
  list: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: 2 },
  card: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    margin: 6,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardImageContainer: {
    position: 'relative',
    height: 120,
    width: '100%',
  },
  cardImage: { width: '100%', height: '100%' },
  cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50 },
  cardBadge: {
    position: 'absolute', top: Spacing.xs, right: Spacing.xs,
    backgroundColor: Colors.gold, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
  },
  cardBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.black },
  cardContent: { padding: Spacing.sm },
  cardName: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.white, marginBottom: 2 },
  cardVenue: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 4 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: FontSizes.sm, fontWeight: '800', color: Colors.gold },
  cardCapacity: { fontSize: FontSizes.xs - 1, color: Colors.textSecondary },
});
