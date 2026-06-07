import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { marquees, events, accommodation } from '../lib/data';

const countryAllureHero = require('../assets/durban-july-2026-country-allure.jpg');
const vipLogo = require('../assets/vip-favicon.png');

const { width } = Dimensions.get('window');

const COUNTDOWN_DATE = new Date('2026-07-04T11:00:00+02:00');

function useCountdown() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = COUNTDOWN_DATE.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.countdownUnit}>
      <View style={styles.countdownBox}>
        <Text style={styles.countdownValue}>{String(value).padStart(2, '0')}</Text>
      </View>
      <Text style={styles.countdownLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }: any) {
  const countdown = useCountdown();
  const scrollY = useRef(new Animated.Value(0)).current;

  const featuredMarquees = marquees.slice(0, 4);
  const featuredEvents = events.slice(0, 4);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={countryAllureHero}
            style={styles.heroImageBackdrop}
            blurRadius={12}
          />
          <Image
            source={countryAllureHero}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(11,11,15,0.6)', 'rgba(11,11,15,0.95)', Colors.background]}
            style={styles.heroGradient}
          />
          <SafeAreaView edges={['top']} style={styles.heroContent}>
            <View style={styles.logoRow}>
              <Image source={vipLogo} style={styles.vipLogo} />
            </View>
          </SafeAreaView>
          <View style={styles.heroBottom}>
            <Text style={styles.heroTheme}>"Country Allure"</Text>
            <Text style={styles.heroTitle}>Hollywoodbets{'\n'}Durban July</Text>
            <Text style={styles.heroDate}>
              <Ionicons name="calendar-outline" size={14} color={Colors.gold} /> Saturday, 4 July 2026
            </Text>
            <Text style={styles.heroVenue}>
              <Ionicons name="location-outline" size={14} color={Colors.gold} /> Greyville Racecourse, Durban
            </Text>

            {/* Countdown */}
            <View style={styles.countdownRow}>
              <CountdownUnit value={countdown.days} label="Days" />
              <Text style={styles.countdownSep}>:</Text>
              <CountdownUnit value={countdown.hours} label="Hrs" />
              <Text style={styles.countdownSep}>:</Text>
              <CountdownUnit value={countdown.minutes} label="Min" />
              <Text style={styles.countdownSep}>:</Text>
              <CountdownUnit value={countdown.seconds} label="Sec" />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { icon: 'ribbon-outline' as const, label: 'Marquees', target: 'MarqueesTab', isStack: false },
            { icon: 'musical-notes-outline' as const, label: 'Events', target: 'EventsTab', isStack: false },
            { icon: 'bed-outline' as const, label: 'Stay', target: 'StayTab', isStack: false },
            { icon: 'diamond-outline' as const, label: 'VIP', target: 'ServicesTab', isStack: true },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.quickActionItem}
              onPress={() => {
                if (item.isStack) {
                  navigation.getParent()?.navigate(item.target);
                } else {
                  navigation.navigate(item.target);
                }
              }}
            >
              <LinearGradient
                colors={[Colors.green, Colors.greenDark]}
                style={styles.quickActionIcon}
              >
                <Ionicons name={item.icon} size={22} color={Colors.gold} />
              </LinearGradient>
              <Text style={styles.quickActionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Marquees */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Race Day Marquees</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MarqueesTab')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {featuredMarquees.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.featuredCard}
                onPress={() => navigation.navigate('Detail', { type: 'marquee', id: m.id })}
              >
                <Image source={{ uri: m.image }} style={styles.featuredImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.featuredGradient} />
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>{m.tier}</Text>
                </View>
                <View style={styles.featuredInfo}>
                  <Text style={styles.featuredName} numberOfLines={1}>{m.name}</Text>
                  <Text style={styles.featuredPrice}>{m.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>July Weekend Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EventsTab')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {featuredEvents.map((e) => (
            <TouchableOpacity
              key={e.id}
              style={styles.eventCard}
              onPress={() => navigation.navigate('Detail', { type: 'event', id: e.id })}
            >
              <Image source={{ uri: e.image }} style={styles.eventImage} />
              <View style={styles.eventInfo}>
                <View style={styles.eventCategoryBadge}>
                  <Text style={styles.eventCategoryText}>{e.category}</Text>
                </View>
                <Text style={styles.eventName} numberOfLines={2}>{e.name}</Text>
                <Text style={styles.eventMeta}>
                  <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} /> {e.date}
                </Text>
                <Text style={styles.eventMeta}>
                  <Ionicons name="location-outline" size={12} color={Colors.textSecondary} /> {e.venue}
                </Text>
                <Text style={styles.eventPrice}>{e.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Accommodation Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Where to Stay</Text>
            <TouchableOpacity onPress={() => navigation.navigate('StayTab')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {accommodation.slice(0, 4).map((a) => (
              <TouchableOpacity
                key={a.id}
                style={styles.stayCard}
                onPress={() => navigation.navigate('Detail', { type: 'accommodation', id: a.id })}
              >
                <Image source={{ uri: a.image }} style={styles.stayImage} />
                <View style={styles.stayInfo}>
                  <Text style={styles.stayName} numberOfLines={1}>{a.name}</Text>
                  <Text style={styles.stayArea}>{a.area}</Text>
                  <View style={styles.stayBottom}>
                    <Text style={styles.stayPrice}>{a.pricePerNight}</Text>
                    <View style={styles.stayRating}>
                      <Ionicons name="star" size={12} color={Colors.gold} />
                      <Text style={styles.stayRatingText}>{a.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroContainer: { height: 520, position: 'relative', backgroundColor: Colors.background, overflow: 'hidden' },
  heroImageBackdrop: {
    width: '100%', height: '100%', position: 'absolute',
    resizeMode: 'cover', opacity: 0.5,
  },
  heroImage: {
    width: '100%', height: '100%', position: 'absolute',
    resizeMode: 'contain',
  },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 350 },
  heroContent: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  logoRow: { alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.sm },
  vipLogo: { width: 64, height: 64, resizeMode: 'contain' },
  heroBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.xl },
  heroTheme: { fontSize: FontSizes.sm, color: Colors.gold, fontStyle: 'italic', letterSpacing: 2, marginBottom: Spacing.xs },
  heroTitle: { fontSize: FontSizes.hero, fontWeight: '800', color: Colors.white, lineHeight: 44, marginBottom: Spacing.md },
  heroDate: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.xs },
  heroVenue: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.xl },
  countdownRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  countdownUnit: { alignItems: 'center' },
  countdownBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  countdownValue: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.gold, fontVariant: ['tabular-nums'] },
  countdownLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 4 },
  countdownSep: { fontSize: FontSizes.xxl, color: Colors.textMuted, marginHorizontal: 6, marginBottom: 16 },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: -10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  quickActionItem: { alignItems: 'center', gap: Spacing.sm },
  quickActionIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  section: { marginTop: Spacing.xxxl, paddingHorizontal: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.white },
  seeAll: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '600' },
  horizontalList: { paddingRight: Spacing.lg, gap: Spacing.md },
  featuredCard: { width: 220, height: 160, borderRadius: BorderRadius.lg, overflow: 'hidden', position: 'relative' },
  featuredImage: { width: '100%', height: '100%' },
  featuredGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  featuredBadge: {
    position: 'absolute', top: Spacing.sm, left: Spacing.sm,
    backgroundColor: Colors.gold, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
  },
  featuredBadgeText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.black },
  featuredInfo: { position: 'absolute', bottom: Spacing.sm, left: Spacing.sm, right: Spacing.sm },
  featuredName: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.white },
  featuredPrice: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '600' },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  eventImage: { width: 110, height: 130 },
  eventInfo: { flex: 1, padding: Spacing.md, justifyContent: 'center' },
  eventCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.green + '30',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginBottom: Spacing.xs,
  },
  eventCategoryText: { fontSize: FontSizes.xs, color: Colors.greenLight, fontWeight: '600' },
  eventName: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.white, marginBottom: Spacing.xs },
  eventMeta: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 2 },
  eventPrice: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '700', marginTop: Spacing.xs },
  stayCard: {
    width: 200,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  stayImage: { width: '100%', height: 120 },
  stayInfo: { padding: Spacing.md },
  stayName: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.white, marginBottom: 2 },
  stayArea: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: Spacing.sm },
  stayBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stayPrice: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '600' },
  stayRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  stayRatingText: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '600' },
});
