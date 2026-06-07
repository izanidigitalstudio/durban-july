import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppData } from '../lib/appState';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { marquees, accommodation } from '../lib/data';

export default function DetailScreen({ route, navigation }: any) {
  const { type, id } = route.params;
  const insets = useSafeAreaInsets();
  const { activeEvents, scheduleIds: savedEventIds, toggleEvent } = useAppData();
  const isSaved = type === 'event' && savedEventIds.includes(id);

  const handleToggleSchedule = async () => {
    try {
      await toggleEvent({ eventId: id });
    } catch {
      Alert.alert('Sign In Required', 'Please sign in to save events to your schedule.');
    }
  };

  let item: any = null;
  if (type === 'marquee') item = marquees.find(m => m.id === id);
  else if (type === 'event') item = activeEvents.find(e => e.id === id);
  else if (type === 'accommodation') item = accommodation.find(a => a.id === id);

  if (!item) return (
    <View style={styles.container}>
      <SafeAreaView><Text style={styles.errorText}>Item not found</Text></SafeAreaView>
    </View>
  );

  const isMarquee = type === 'marquee';
  const isEvent = type === 'event';
  const isAccom = type === 'accommodation';

  return (
    <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
      <ScrollView
        style={[styles.scrollView, Platform.OS === 'web' && styles.webScrollView]}
        contentContainerStyle={{ paddingBottom: 112 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: item.image }} style={styles.heroImage} />
          <LinearGradient
            colors={['rgba(11,11,15,0.3)', 'transparent', 'rgba(11,11,15,0.9)', Colors.background]}
            style={styles.heroGradient}
          />
          <SafeAreaView edges={['top']} style={styles.backRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            {isEvent && (
              <TouchableOpacity
                style={[styles.scheduleBtn, isSaved && styles.scheduleBtnActive]}
                onPress={handleToggleSchedule}
              >
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color={isSaved ? Colors.gold : Colors.white}
                />
              </TouchableOpacity>
            )}
          </SafeAreaView>
          <View style={styles.heroBottom}>
            {isMarquee && (
              <View style={styles.tierBadge}>
                <Text style={styles.tierBadgeText}>{item.tier}</Text>
              </View>
            )}
            {isEvent && (
              <View style={[styles.tierBadge, { backgroundColor: Colors.green }]}>
                <Text style={[styles.tierBadgeText, { color: Colors.white }]}>{item.category}</Text>
              </View>
            )}
            {isAccom && (
              <View style={[styles.tierBadge, { backgroundColor: Colors.green }]}>
                <Text style={[styles.tierBadgeText, { color: Colors.white }]}>{item.type}</Text>
              </View>
            )}
            <Text style={styles.heroTitle}>{item.name}</Text>
          </View>
        </View>

        {/* Info Row */}
        <View style={styles.infoRow}>
          {isEvent && (
            <>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={16} color={Colors.gold} />
                <Text style={styles.infoText}>{item.date}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={16} color={Colors.gold} />
                <Text style={styles.infoText}>{item.time}</Text>
              </View>
            </>
          )}
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={16} color={Colors.gold} />
            <Text style={styles.infoText}>{isEvent ? `${item.venue}, ${item.location}` : isMarquee ? item.venue : `${item.area}`}</Text>
          </View>
          {isAccom && (
            <View style={styles.infoItem}>
              <Ionicons name="car-outline" size={16} color={Colors.gold} />
              <Text style={styles.infoText}>{item.distanceToVenue} to Greyville</Text>
            </View>
          )}
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>
            {isAccom ? `${item.pricePerNight} /night` : isMarquee ? item.price : item.price}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        {/* Includes / Highlights / Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isMarquee ? 'What\'s Included' : isEvent ? 'Highlights' : 'Amenities'}
          </Text>
          {(isMarquee ? item.includes : isEvent ? item.highlights : item.amenities).map((f: string, i: number) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {isAccom && item.rating && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rating</Text>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons key={i} name={i < item.rating ? 'star' : 'star-outline'} size={20} color={i < item.rating ? Colors.gold : Colors.textMuted} />
              ))}
              <Text style={styles.ratingText}>{item.rating}/5</Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Bottom CTA */}
      <LinearGradient
        colors={['transparent', Colors.background, Colors.background]}
        style={styles.bottomBar}
      >
        <SafeAreaView edges={['bottom']} style={styles.bottomContent}>
          <View>
            <Text style={styles.bottomPrice}>
              {isAccom ? item.pricePerNight : isMarquee ? item.price : item.price}
            </Text>
            <Text style={styles.bottomPriceSub}>{isAccom ? 'per night' : 'per person'}</Text>
          </View>
          <View style={styles.bottomActions}>
            {isEvent && (
              <TouchableOpacity
                style={[styles.scheduleCtaBtn, isSaved && styles.scheduleCtaBtnActive]}
                onPress={handleToggleSchedule}
              >
                <Ionicons
                  name={isSaved ? 'checkmark-circle' : 'add-circle-outline'}
                  size={18}
                  color={isSaved ? Colors.green : Colors.white}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Inquiry', { type, id: item.id, name: item.name })}
            >
              <Text style={styles.ctaButtonText}>Enquire Now</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.black} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 0, overflow: 'hidden', backgroundColor: Colors.background },
  webContainer: { height: '100dvh', maxHeight: '100dvh' } as any,
  scrollView: { flex: 1, minHeight: 0 },
  webScrollView: { height: '100dvh', maxHeight: '100dvh' } as any,
  errorText: { color: Colors.white, fontSize: FontSizes.lg, padding: Spacing.xl },
  heroContainer: { height: 350, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  backRow: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingRight: Spacing.lg,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background + 'AA',
    alignItems: 'center', justifyContent: 'center', marginLeft: Spacing.lg, marginTop: Spacing.sm,
  },
  scheduleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background + 'AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  scheduleBtnActive: {
    backgroundColor: Colors.gold + '30',
  },
  heroBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.xl },
  tierBadge: {
    alignSelf: 'flex-start', backgroundColor: Colors.gold,
    borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md, paddingVertical: 4, marginBottom: Spacing.sm,
  },
  tierBadgeText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.black },
  heroTitle: { fontSize: FontSizes.xxxl, fontWeight: '800', color: Colors.white, lineHeight: 36 },
  infoRow: {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface, marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg, marginTop: -Spacing.md,
    borderWidth: 1, borderColor: Colors.cardBorder, gap: Spacing.sm,
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.lg, marginTop: Spacing.md,
    backgroundColor: Colors.green + '15', borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.green + '30',
  },
  priceLabel: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '600' },
  priceValue: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.gold },
  section: { paddingHorizontal: Spacing.xl, marginTop: Spacing.xxl },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white, marginBottom: Spacing.md },
  description: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  featureText: { fontSize: FontSizes.md, color: Colors.textSecondary, flex: 1 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: FontSizes.md, color: Colors.gold, fontWeight: '600', marginLeft: Spacing.sm },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: Spacing.xxxl },
  bottomContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm,
  },
  bottomPrice: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.gold },
  bottomPriceSub: { fontSize: FontSizes.xs, color: Colors.textMuted },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ctaButton: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.gold, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md,
  },
  ctaButtonText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.black },
  scheduleCtaBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleCtaBtnActive: {
    backgroundColor: Colors.green + '20',
    borderColor: Colors.green + '40',
  },
});
