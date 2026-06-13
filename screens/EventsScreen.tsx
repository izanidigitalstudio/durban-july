import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ScrollView, Pressable, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { events, eventCategories, EventItem } from '../lib/data';
import AdaptiveImage from '../components/AdaptiveImage';
import { useCatalogueColumns } from '../lib/responsive';

function getImageSource(image: string | number) {
  return typeof image === 'string' ? { uri: image } : image;
}

function getEventImageSource(item: EventItem) {
  const image = item.images?.[0] ?? item.image;
  return typeof image === 'string' ? { uri: image } : image;
}

const eventDays = [
  { key: 'All', label: 'All Days', date: '' },
  { key: 'Monday', label: 'Mon', date: '6 July' },
  { key: 'Sunday', label: 'Sun', date: '5 July' },
  { key: 'Saturday', label: 'Sat', date: '4 July' },
  { key: 'Friday', label: 'Fri', date: '3 July' },
  { key: 'Thursday', label: 'Thu', date: '2 July' },
  { key: 'Wednesday', label: 'Wed', date: '1 July' },
  { key: 'Tuesday', label: 'Tue', date: '7 July' },
];

export default function EventsScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const numColumns = useCatalogueColumns();

  const savedEventIds = useQuery(api.schedule.getMySchedule) ?? [];
  const toggleEvent = useMutation(api.schedule.toggleEvent);

  const handleToggleSchedule = async (eventId: string) => {
    try {
      const result = await toggleEvent({ eventId });
      // silent success - the UI updates reactively
    } catch {
      Alert.alert('Sign In Required', 'Please sign in to save events to your schedule.');
    }
  };

  const dayCounts = useMemo(() => {
    const counts: Record<string, number> = { All: events.length };
    eventDays.forEach((d: { key: string; label: string; date: string }) => {
      if (d.key !== 'All') {
        counts[d.key] = events.filter((e: EventItem) => e.date.startsWith(d.key)).length;
      }
    });
    return counts;
  }, []);

  const filtered = events.filter((e: EventItem) => {
    const catMatch = selectedCategory === 'All' || e.category === selectedCategory;
    const dayMatch = selectedDay === 'All' || e.date.startsWith(selectedDay);
    const query = searchQuery.trim().toLowerCase();
    const searchMatch =
      query.length === 0 ||
      [e.name, e.date, e.time, e.category, e.venue, e.location, e.description]
        .join(' ')
        .toLowerCase()
        .includes(query);
    return catMatch && dayMatch && searchMatch;
  });

  const renderEvent = ({ item }: { item: EventItem }) => {
    const cardTitle = item.name.replace(/^Demo:\s*/, '');
    return (
      <TouchableOpacity
        style={[styles.card, numColumns === 2 && styles.gridCard]}
        onPress={() => navigation.navigate('Detail', { type: 'event', id: item.id })}
        activeOpacity={0.85}
      >
        <View style={styles.cardImageWrap}>
          <AdaptiveImage
            source={getEventImageSource(item)}
            style={styles.cardImage}
          />
          <View style={[styles.cardBadge, getCategoryColor(item.category)]}>
            <Text style={[styles.cardBadgeText, getCategoryTextColor(item.category)]}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={2}>{cardTitle}</Text>
          <Text style={styles.cardVenue} numberOfLines={1}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} /> {item.venue}, {item.location}
          </Text>
          <Text style={styles.cardPrice}>{item.price}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View>
      {/* Search */}
      <View style={styles.searchSection}>
        <Text style={styles.searchSectionLabel}>Search events</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, date, venue, category..."
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
        <Text style={styles.searchHint}>Try searching by event name, date, venue, category, or keyword.</Text>
      </View>

      {/* ROW 1: Description */}
      <View style={styles.descriptionRow}>
        <Text style={styles.descriptionText}>1 - 6 July 2026  ·  Durban & Surrounds</Text>
      </View>

      {/* ROW 2: Day Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayFilterContent}
        style={styles.dayFilterRow}
      >
        {eventDays.map((day) => {
          const isActive = selectedDay === day.key;
          return (
            <Pressable
              key={day.key}
              onPress={() => setSelectedDay(day.key)}
              style={[styles.dayChip, isActive && styles.dayChipActive]}
            >
              <Text style={[styles.dayChipLabel, isActive && styles.dayChipLabelActive]}>
                {day.label}
              </Text>
              {day.date !== '' && (
                <Text style={[styles.dayChipDate, isActive && styles.dayChipDateActive]}>
                  {day.date}
                </Text>
              )}
              <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                <Text style={[styles.countText, isActive && styles.countTextActive]}>
                  {dayCounts[day.key] || 0}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ROW 3: Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catFilterContent}
        style={styles.catFilterRow}
      >
        {(eventCategories as readonly string[]).map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{cat}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>July Weekend Events</Text>
        <TouchableOpacity
          style={styles.scheduleHeaderBtn}
          onPress={() => navigation.navigate('MySchedule')}
        >
          <Ionicons name="calendar" size={20} color={Colors.gold} />
          {savedEventIds.length > 0 && (
            <View style={styles.scheduleBadge}>
              <Text style={styles.scheduleBadgeText}>{savedEventIds.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        key={`events-${numColumns}`}
        data={filtered as EventItem[]}
        numColumns={numColumns}
        columnWrapperStyle={numColumns === 2 ? styles.column : undefined}
        keyExtractor={(item: EventItem) => item.id}
        renderItem={renderEvent}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No events for this selection</Text>
            <Text style={styles.emptySubText}>Try a different day, category, or search term</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function getCategoryColor(cat: string) {
  const map: Record<string, any> = {
    'Race Day': { backgroundColor: Colors.gold + '25' },
    'Party': { backgroundColor: '#9B59B6' + '25' },
    'Fashion': { backgroundColor: '#E74C3C' + '25' },
    'Concert': { backgroundColor: '#3498DB' + '25' },
    'Lifestyle': { backgroundColor: Colors.green + '25' },
    'After Party': { backgroundColor: '#F39C12' + '25' },
    'Golf': { backgroundColor: '#2ECC71' + '25' },
  };
  return map[cat] || {};
}

function getCategoryTextColor(cat: string) {
  const map: Record<string, any> = {
    'Race Day': { color: Colors.gold },
    'Party': { color: '#9B59B6' },
    'Fashion': { color: '#E74C3C' },
    'Concert': { color: '#3498DB' },
    'Lifestyle': { color: Colors.greenLight },
    'After Party': { color: '#F39C12' },
    'Golf': { color: '#2ECC71' },
  };
  return map[cat] || {};
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.white },

  searchSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 8,
    paddingBottom: 10,
  },
  searchSectionLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: FontSizes.sm,
    paddingVertical: 0,
  },
  searchHint: {
    marginTop: 8,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },

  descriptionRow: { paddingHorizontal: Spacing.lg, paddingBottom: 10 },
  descriptionText: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '600' },

  dayFilterRow: { marginBottom: 8 },
  dayFilterContent: { paddingHorizontal: Spacing.lg, gap: 6 },
  dayChip: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minWidth: 60,
  },
  dayChipActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  dayChipLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '700' },
  dayChipLabelActive: { color: Colors.white },
  dayChipDate: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  dayChipDateActive: { color: 'rgba(255,255,255,0.85)' },
  countBadge: {
    marginTop: 4,
    backgroundColor: Colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  countBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  countText: { fontSize: 10, color: Colors.textMuted, fontWeight: '700' },
  countTextActive: { color: Colors.white },

  catFilterRow: { marginBottom: 10 },
  catFilterContent: { paddingHorizontal: Spacing.lg, gap: 6 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  chipText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: Colors.black },

  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  column: { justifyContent: 'space-between' },
  card: {
    marginBottom: 14,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  gridCard: { flex: 0, width: '49%' },
  cardImageWrap: {
    position: 'relative',
    width: '100%',
    backgroundColor: 'transparent',
  },
  cardImage: { width: '100%', backgroundColor: 'transparent' },
  cardBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  cardBadgeText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.black },
  cardInfo: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 9, backgroundColor: Colors.black },
  cardName: { fontSize: 15, fontWeight: '800', color: Colors.white, lineHeight: 18, marginBottom: 1 },
  cardVenue: { fontSize: 12, color: Colors.textSecondary, marginBottom: 1 },
  cardPrice: { fontSize: 12, fontWeight: '700', color: Colors.gold, marginBottom: 4 },
  cardDesc: { fontSize: 11, color: Colors.textMuted, lineHeight: 15 },
  addScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  addScheduleBtnActive: {
    backgroundColor: Colors.green + '15',
    borderColor: Colors.green + '40',
  },
  addScheduleText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  addScheduleTextActive: {
    color: Colors.greenLight,
  },
  scheduleHeaderBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  scheduleBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.gold,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  scheduleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.black,
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: FontSizes.lg, color: Colors.textSecondary, fontWeight: '600', marginTop: Spacing.md },
  emptySubText: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing.xs },
});
