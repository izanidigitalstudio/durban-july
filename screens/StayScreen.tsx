import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { useCatalogueColumns } from '../lib/responsive';
import { accommodation, accommodationTypes, AccommodationItem } from '../lib/data';

export default function StayScreen({ navigation }: any) {
  const [selectedType, setSelectedType] = useState<string>('All');
  const numColumns = useCatalogueColumns();

  const filtered = selectedType === 'All'
    ? accommodation
    : accommodation.filter(a => a.type === selectedType);

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
      style={[styles.card, { flex: 1 / numColumns }]}
      onPress={() => navigation.navigate('Detail', { type: 'accommodation', id: item.id })}
      activeOpacity={0.85}
    >
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.type}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.nameRow}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color={Colors.gold} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <Text style={styles.cardArea} numberOfLines={1}>
          <Ionicons name="location-outline" size={11} color={Colors.textSecondary} /> {item.area}
        </Text>
        <Text style={styles.cardDistance} numberOfLines={1}>
          <Ionicons name="car-outline" size={11} color={Colors.textSecondary} /> {item.distanceToVenue}
        </Text>
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardPrice}>{item.pricePerNight.split(' ')[0]}</Text>
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
          <View>
            <Text style={styles.headerTitle}>Where to Stay</Text>
            <Text style={styles.headerSub}>Premium Accommodation · July Weekend</Text>
          </View>
        </View>
        <FlatList
          horizontal
          data={accommodationTypes}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedType === item && styles.filterChipActive]}
              onPress={() => setSelectedType(item)}
            >
              <Text style={[styles.filterText, selectedType === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
      <FlatList
        key={`stay-${numColumns}`}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
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
  typeBadge: {
    position: 'absolute', top: Spacing.xs, right: Spacing.xs,
    backgroundColor: Colors.green, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  cardContent: { padding: Spacing.sm },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  cardName: { fontSize: FontSizes.md - 1, fontWeight: '700', color: Colors.white, flex: 1, marginRight: 4 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: Colors.surface, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  ratingText: { fontSize: 10, color: Colors.gold, fontWeight: '600' },
  cardArea: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 2 },
  cardDistance: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  cardPrice: { fontSize: FontSizes.sm, fontWeight: '800', color: Colors.gold },
  perNight: { fontSize: FontSizes.xs - 2, color: Colors.textMuted },
  inquireButton: {
    backgroundColor: Colors.gold, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
  },
  inquireButtonText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.black },
});
