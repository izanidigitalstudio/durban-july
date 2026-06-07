import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ScrollView, Pressable, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../lib/appState';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { useCatalogueColumns } from '../lib/responsive';
import { eventCategories, EventItem } from '../lib/data';

const eventDays = [
  { key: 'All', label: 'All Days', date: '' },
  { key: 'Wednesday', label: 'Wed', date: '1 July' },
  { key: 'Thursday', label: 'Thu', date: '2 July' },
  { key: 'Friday', label: 'Fri', date: '3 July' },
  { key: 'Saturday', label: 'Sat', date: '4 July' },
  { key: 'Sunday', label: 'Sun', date: '5 July' },
  { key: 'Monday', label: 'Mon', date: '6 July' },
];

export default function EventsScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const { activeEvents, scheduleIds: savedEventIds, toggleEvent } = useAppData();
  const numColumns = useCatalogueColumns();

  const handleToggleSchedule = async (eventId: string) => {
    try {
      const result = await toggleEvent({ eventId });
      // silent success - the UI updates reactively
    } catch {
      Alert.alert('Sign In Required', 'Please sign in to save events to your schedule.');
    }
  };

  const dayCounts = useMemo(() => {
    const counts: Record<string, number> = { All: activeEvents.length };
    eventDays.forEach(d => {
      if (d.key !== 'All') {
        counts[d.key] = activeEvents.filter(e => e.date.startsWith(d.key)).length;
      }
    });
    return counts;
  }, [activeEvents]);

  const filtered = activeEvents.filter(e => {
    const catMatch = selectedCategory === 'All' || e.category === selectedCategory;
    const dayMatch = selectedDay === 'All' || e.date.startsWith(selectedDay);
    return catMatch && dayMatch;
  });

  const renderEvent = ({ item }: { item: EventItem }) => {
    const isSaved = savedEventIds.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.card, { flex: 1 / numColumns }]}
        onPress={() => navigation.navigate('Detail', { type: 'event', id: item.id })}
        activeOpacity={0.85}
      >
        <View style={styles.cardImageContainer}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeDay}>{item.date.split(',')[0].slice(0, 3)}</Text>
            <Text style={styles.dateBadgeDate}>{item.date.split(' ').slice(-2).join(' ')}</Text>
          </View>
          {/* Bookmark button on card image */}
          <TouchableOpacity
            style={[styles.bookmarkBtn, isSaved && styles.bookmarkBtnActive]}
            onPress={(e) => {
              e.stopPropagation?.();
              handleToggleSchedule(item.id);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={isSaved ? Colors.gold : Colors.white}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.categoryRow}>
            <View style={[styles.categoryBadge, getCategoryColor(item.category)]}>
              <Text style={[styles.categoryText, getCategoryTextColor(item.category)]}>{item.category}</Text>
            </View>
            <Text style={styles.cardTime} numberOfLines={1}>
              {item.time.split(' ')[0]}
            </Text>
          </View>
          <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.cardVenue} numberOfLines={1}>
            <Ionicons name="location-outline" size={10} color={Colors.textSecondary} /> {item.venue}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>{item.price.split(' ')[0]}</Text>
            <TouchableOpacity
              style={[styles.addScheduleBtn, isSaved && styles.addScheduleBtnActive]}
              onPress={(e) => {
                e.stopPropagation?.();
                handleToggleSchedule(item.id);
              }}
            >
              <Ionicons
                name={isSaved ? 'checkmark' : 'add'}
                size={14}
                color={isSaved ? Colors.greenLight : Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View>
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
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        numColumns={numColumns}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No events for this selection</Text>
            <Text style={styles.emptySubText}>Try a different day or category</Text>
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

  descriptionRow: { paddingHorizontal: Spacing.lg, paddingBottom: 12 },
  descriptionText: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '600' },

  dayFilterRow: { marginBottom: 10 },
  dayFilterContent: { paddingHorizontal: Spacing.lg, gap: 8 },
  dayChip: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minWidth: 64,
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

  catFilterRow: { marginBottom: 12 },
  catFilterContent: { paddingHorizontal: Spacing.lg, gap: 8 },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  chipText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: Colors.black },

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
  dateBadge: {
    position: 'absolute', top: Spacing.xs, left: Spacing.xs,
    backgroundColor: Colors.background + 'EE', borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs, paddingVertical: 2,
    alignItems: 'center',
  },
  dateBadgeDay: { fontSize: 9, color: Colors.gold, fontWeight: '700' },
  dateBadgeDate: { fontSize: 9, color: Colors.white, fontWeight: '600' },
  cardContent: { padding: Spacing.sm },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  categoryBadge: { borderRadius: BorderRadius.sm, paddingHorizontal: 4, paddingVertical: 2 },
  categoryText: { fontSize: 9, fontWeight: '700' },
  cardTime: { fontSize: 10, color: Colors.textSecondary },
  cardName: { fontSize: FontSizes.md - 1, fontWeight: '700', color: Colors.white, marginBottom: 2, height: 32 },
  cardVenue: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: FontSizes.sm, fontWeight: '800', color: Colors.gold },
  addScheduleBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  addScheduleBtnActive: {
    backgroundColor: Colors.green + '20',
    borderColor: Colors.green + '40',
  },
  bookmarkBtn: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background + 'CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkBtnActive: {
    backgroundColor: Colors.gold + '30',
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
