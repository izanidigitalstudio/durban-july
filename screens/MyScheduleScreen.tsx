import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../lib/appState';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { EventItem } from '../lib/data';

const dayOrder = ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'];

const dayDates: Record<string, string> = {
  Wednesday: '1 July 2026',
  Thursday: '2 July 2026',
  Friday: '3 July 2026',
  Saturday: '4 July 2026',
  Sunday: '5 July 2026',
  Monday: '6 July 2026',
};

type ScheduleSection = {
  type: 'header';
  day: string;
  date: string;
  count: number;
} | {
  type: 'event';
  event: EventItem;
};

export default function MyScheduleScreen({ navigation }: any) {
  const { activeEvents, scheduleIds: savedEventIds, toggleEvent, clearSchedule } = useAppData();

  const savedEvents = useMemo(() => {
    return activeEvents.filter(e => savedEventIds.includes(e.id));
  }, [activeEvents, savedEventIds]);

  const sections = useMemo(() => {
    const result: ScheduleSection[] = [];
    for (const day of dayOrder) {
      const dayEvents = savedEvents
        .filter(e => e.date.startsWith(day))
        .sort((a, b) => {
          const timeA = a.time.split(' - ')[0].replace(':', '');
          const timeB = b.time.split(' - ')[0].replace(':', '');
          return parseInt(timeA) - parseInt(timeB);
        });
      if (dayEvents.length > 0) {
        result.push({ type: 'header', day, date: dayDates[day] || '', count: dayEvents.length });
        dayEvents.forEach(event => {
          result.push({ type: 'event', event });
        });
      }
    }
    return result;
  }, [savedEvents]);

  const handleRemove = (eventId: string) => {
    Alert.alert(
      'Remove from Schedule',
      'Remove this event from your itinerary?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => toggleEvent({ eventId }),
        },
      ]
    );
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Schedule',
      'Remove all events from your itinerary?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearSchedule(),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ScheduleSection }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.dayHeader}>
          <View style={styles.dayDot} />
          <View style={styles.dayHeaderText}>
            <Text style={styles.dayName}>{item.day}</Text>
            <Text style={styles.dayDate}>{item.date}</Text>
          </View>
          <View style={styles.dayCountBadge}>
            <Text style={styles.dayCountText}>{item.count} event{item.count !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      );
    }

    const event = item.event;
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => navigation.navigate('Detail', { type: 'event', id: event.id })}
        activeOpacity={0.85}
      >
        <View style={styles.timelineConnector}>
          <View style={styles.timelineLine} />
        </View>
        <View style={styles.eventContent}>
          <Image source={{ uri: event.image }} style={styles.eventImage} />
          <View style={styles.eventDetails}>
            <View style={styles.eventTimeRow}>
              <Ionicons name="time-outline" size={12} color={Colors.gold} />
              <Text style={styles.eventTime}>{event.time}</Text>
            </View>
            <Text style={styles.eventName} numberOfLines={2}>{event.name}</Text>
            <View style={styles.eventVenueRow}>
              <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.eventVenue} numberOfLines={1}>{event.venue}</Text>
            </View>
            <Text style={styles.eventPrice}>{event.price}</Text>
          </View>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemove(event.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={22} color={Colors.red} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Schedule</Text>
          <Text style={styles.headerSubtitle}>
            {savedEvents.length} event{savedEvents.length !== 1 ? 's' : ''} planned
          </Text>
        </View>
        {savedEvents.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Ionicons name="trash-outline" size={20} color={Colors.red} />
          </TouchableOpacity>
        )}
      </View>

      {savedEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="calendar-outline" size={56} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No Events Planned Yet</Text>
          <Text style={styles.emptyDesc}>
            Browse events and tap the bookmark icon to build your personalized Durban July itinerary
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="search-outline" size={18} color={Colors.black} />
            <Text style={styles.browseBtnText}>Browse Events</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item, index) => {
            if (item.type === 'header') return `header-${item.day}`;
            return `event-${item.event.id}`;
          }}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, marginLeft: Spacing.md },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.white },
  headerSubtitle: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '600', marginTop: 2 },
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 100 },

  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  dayDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.gold,
    marginRight: Spacing.md,
  },
  dayHeaderText: { flex: 1 },
  dayName: { fontSize: FontSizes.lg, fontWeight: '800', color: Colors.white },
  dayDate: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 1 },
  dayCountBadge: {
    backgroundColor: Colors.gold + '20',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
  },
  dayCountText: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '700' },

  eventCard: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  timelineConnector: {
    width: 12,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.cardBorder,
    marginLeft: 0,
  },
  eventContent: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  eventImage: { width: 80, height: '100%', minHeight: 100 },
  eventDetails: { flex: 1, padding: Spacing.md },
  eventTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  eventTime: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '700' },
  eventName: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  eventVenueRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  eventVenue: { fontSize: FontSizes.xs, color: Colors.textMuted, flex: 1 },
  eventPrice: { fontSize: FontSizes.sm, fontWeight: '800', color: Colors.gold },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
  },
  browseBtnText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.black },
});
