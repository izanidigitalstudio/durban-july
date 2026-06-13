import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { accommodation, accommodationTypes, AccommodationItem } from '../lib/data';
import AdaptiveImage from '../components/AdaptiveImage';
import { useCatalogueColumns } from '../lib/responsive';

export default function StayScreen({ navigation }: any) {
  const [selectedType, setSelectedType] = useState<string>('All');
  const numColumns = useCatalogueColumns();

  const filtered = useMemo(() => {
    const baseList = selectedType === 'All'
      ? accommodation
      : accommodation.filter((a) => a.type === selectedType);
    return baseList;
  }, [selectedType]);

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Ionicons
        key={i}
        name={i < count ? 'star' : 'star-outline'}
        size={13}
        color={i < count ? Colors.gold : Colors.textMuted}
      />
    ));
  };

  const renderItem = ({ item }: { item: AccommodationItem }) => (
    <TouchableOpacity
      style={[styles.card, numColumns === 2 && styles.gridCard]}
      onPress={() => navigation.navigate('Detail', { type: 'accommodation', id: item.id })}
      activeOpacity={0.85}
    >
      <AdaptiveImage source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.typeBadge}>
        <Text style={styles.typeBadgeText}>{item.type}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.starsRow}>{renderStars(item.rating)}</View>
        <Text style={styles.cardArea}>
          <Ionicons name="location-outline" size={13} color={Colors.textSecondary} /> {item.area}
        </Text>
        <Text style={styles.cardDistance}>
          <Ionicons name="car-outline" size={13} color={Colors.textSecondary} /> {item.distanceToVenue} to Greyville
        </Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.amenitiesRow}>
          {item.amenities.slice(0, 3).map((a: string, i: number) => (
            <View key={i} style={styles.amenityChip}>
              <Text style={styles.amenityText}>{a}</Text>
            </View>
          ))}
          {item.amenities.length > 3 && (
            <View style={styles.amenityChip}>
              <Text style={styles.amenityText}>+{item.amenities.length - 3}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardPrice}>{item.pricePerNight}</Text>
            <Text style={styles.perNight}>per night</Text>
          </View>
          <TouchableOpacity
            style={styles.inquireButton}
            onPress={() => navigation.navigate('Inquiry', { type: 'accommodation', id: item.id, name: item.name })}
          >
            <Text style={styles.inquireButtonText}>Enquire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Accommodation</Text>
            <Text style={styles.headerSub}>50+ Premium Durban stays for Durban July</Text>
            <Text style={styles.headerNote}>
              Curated around the most sought-after areas: Umhlanga, Morningside, Musgrave, North Beach, and Greyville access.
            </Text>
          </View>
        </View>
        <FlatList
          horizontal
          data={accommodationTypes}
          keyExtractor={(item: string) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }: { item: (typeof accommodationTypes)[number] }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedType === item && styles.filterChipActive]}
              onPress={() => setSelectedType(item)}
            >
              <Text style={[styles.filterText, selectedType === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{accommodation.length}+</Text>
            <Text style={styles.summaryLabel}>Premium stays</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>5–15 min</Text>
            <Text style={styles.summaryLabel}>Top areas to Greyville</Text>
          </View>
        </View>
      </SafeAreaView>
      <FlatList
        key={`stays-${numColumns}`}
        data={filtered}
        numColumns={numColumns}
        columnWrapperStyle={numColumns === 2 ? styles.column : undefined}
        keyExtractor={(item: AccommodationItem) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: FontSizes.sm, color: Colors.gold, marginTop: 2, fontWeight: '700' },
  headerNote: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 6, lineHeight: 16 },
  filterRow: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  filterChipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  filterText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: Colors.black },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  summaryValue: { fontSize: FontSizes.lg, fontWeight: '800', color: Colors.gold },
  summaryLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 4 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  column: { justifyContent: 'space-between' },
  card: {
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    marginBottom: Spacing.lg, backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  gridCard: { flex: 0, width: '49%' },
  cardImage: { width: '100%', backgroundColor: 'transparent' },
  typeBadge: {
    position: 'absolute', top: Spacing.md, right: Spacing.md,
    backgroundColor: Colors.green, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
  },
  typeBadgeText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.white },
  cardContent: { padding: Spacing.lg },
  cardName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  starsRow: { flexDirection: 'row', gap: 2, marginBottom: Spacing.sm },
  cardArea: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: 2 },
  cardDistance: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  cardDesc: { fontSize: FontSizes.sm, color: Colors.textMuted, lineHeight: 20, marginBottom: Spacing.md },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  amenityChip: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  amenityText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: FontSizes.lg, fontWeight: '800', color: Colors.gold },
  perNight: { fontSize: FontSizes.xs, color: Colors.textMuted },
  inquireButton: {
    backgroundColor: Colors.gold, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
  },
  inquireButtonText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.black },
});
