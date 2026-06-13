import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, StatusBar, Animated, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { DURBAN_JULY_PROMO_IMAGE, marquees, events } from '../lib/data';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import AdaptiveImage from '../components/AdaptiveImage';

const { width } = Dimensions.get('window');
const vipMemberStatsQuery = (api as any)?.users?.getVipMemberStats;
const VIP_DEMO_COUNT = 7890;

const COUNTDOWN_DATE = new Date('2026-07-04T11:00:00+02:00');

function getImageSource(image: string | number) {
  return typeof image === 'string' ? { uri: image } : image;
}

function getMarqueeImageSource(item: { image: string | number; images?: Array<string | number> }) {
  const source = item.images?.[0] ?? item.image;
  return getImageSource(source);
}

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

function VipStatsSection({ queryRef }: { queryRef: any }) {
  useQuery(queryRef);

  return (
    <View style={styles.section}>
      <View style={styles.vipStatsCard}>
        <View style={styles.vipStatsHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>Platform status</Text>
            <Text style={styles.vipStatsKicker}>VIP members on Platform</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        </View>
        <Text style={styles.vipStatsTotal}>{VIP_DEMO_COUNT}</Text>
      </View>
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
        <View style={styles.heroContainer}>
          <Image source={getImageSource(DURBAN_JULY_PROMO_IMAGE)} style={styles.heroImage} />
          <View style={styles.heroTopFade} />
          <View style={styles.heroGradient} />
          <View style={styles.heroVignette} />
          <SafeAreaView edges={['top']} style={styles.heroContent}>
            <View style={styles.logoRow}>
              <View style={styles.logoPill}>
                <Text style={styles.logoText}>DURBAN JULY WEEK 2026</Text>
              </View>
            </View>
          </SafeAreaView>
          <View style={styles.heroBottom}>
            <View style={styles.heroCard}>
              <Text style={styles.heroTheme}>"Country Allure"</Text>
              <Text style={styles.heroTitle}>Hollywoodbets{'\n'}Durban July</Text>
              <Text style={styles.heroCopy}>Book hotel and hospitality packages for race week, VIP experiences, and premium event access.</Text>
              <Text style={styles.heroDate}>
                <Ionicons name="calendar-outline" size={14} color={Colors.gold} /> Saturday, 4 July 2026
              </Text>
              <Text style={styles.heroVenue}>
                <Ionicons name="location-outline" size={14} color={Colors.gold} /> Greyville Racecourse, Durban
              </Text>

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
        </View>

        {vipMemberStatsQuery ? <VipStatsSection queryRef={vipMemberStatsQuery} /> : null}

        <View style={styles.quickActions}>
          {[
            { icon: 'car-outline' as const, label: 'Uber', url: 'https://www.uber.com/za/en/ride/', isExternal: true },
            { icon: 'location-outline' as const, label: 'Durban', url: 'https://visitdurban.travel/page/experiences', isExternal: true },
            { icon: 'bed-outline' as const, label: 'Stay', target: 'Stay', isStack: true },
            { icon: 'diamond-outline' as const, label: 'VIP', target: 'ServicesTab', isStack: true },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.quickActionItem}
              onPress={() => {
                if (item.isExternal && item.url) {
                  Linking.openURL(item.url);
                  return;
                }
                if (item.isStack) {
                  navigation.getParent()?.navigate(item.target);
                } else {
                  navigation.navigate(item.target);
                }
              }}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name={item.icon} size={22} color={Colors.gold} />
              </View>
              <Text style={styles.quickActionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>Browse packages</Text>
              <Text style={styles.sectionTitle}>Race Day Marquees</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('MarqueesTab')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {featuredMarquees.map((m) => (
              <TouchableOpacity key={m.id} style={styles.featuredCard} onPress={() => navigation.navigate('Detail', { type: 'marquee', id: m.id })}>
                <View style={styles.featuredImageWrap}>
                  <AdaptiveImage source={getMarqueeImageSource(m)} style={styles.featuredImage} />
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>{m.tier}</Text>
                  </View>
                </View>
                <View style={styles.featuredInfo}>
                  <Text style={styles.featuredName} numberOfLines={2}>{m.name}</Text>
                  <Text style={styles.featuredPrice}>{m.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>Latest line-up</Text>
              <Text style={styles.sectionTitle}>July Weekend Events</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('EventsTab')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {featuredEvents.map((e) => {
            return (
              <TouchableOpacity
                key={e.id}
                style={styles.eventCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Detail', { type: 'event', id: e.id })}
              >
                <View style={styles.eventImageWrap}>
                  <Image
                    source={getImageSource(e.image)}
                    style={styles.eventImage}
                    resizeMode="contain"
                  />
                  <View style={styles.eventImageOverlay} />
                  <View style={styles.eventCategoryBadge}>
                    <Text style={styles.eventCategoryText}>{e.category}</Text>
                  </View>
                </View>

                <View style={styles.eventInfo}>
                  <View style={styles.eventMetaTopRow}>
                    <View style={styles.eventDatePill}>
                      <Ionicons name="calendar-outline" size={11} color={Colors.gold} />
                      <Text style={styles.eventDatePillText}>{e.date}</Text>
                    </View>
                  </View>

                  <Text style={styles.eventName} numberOfLines={2}>{e.name}</Text>

                  <View style={styles.eventMetaRow}>
                    <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                    <Text style={styles.eventMeta} numberOfLines={2}>{e.venue}</Text>
                  </View>

                  <View style={styles.eventFooter}>
                    <Text style={styles.eventPrice}>{e.price}</Text>
                    <View style={styles.eventCta}>
                      <Ionicons name="arrow-forward" size={12} color={Colors.black} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroContainer: { height: 560, position: 'relative' },
  heroImage: { width: '100%', height: '100%', position: 'absolute', objectFit: 'contain', backgroundColor: Colors.background },
  heroTopFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 180, backgroundColor: 'rgba(8,8,12,0.26)' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 420, backgroundColor: 'rgba(8,8,12,0.88)' },
  heroVignette: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.14)' },
  heroContent: { flex: 1 },
  logoRow: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  logoPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(12,12,16,0.8)',
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  logoText: { color: Colors.gold, fontSize: FontSizes.sm, fontWeight: '800', letterSpacing: 1.2 },
  heroBottom: { position: 'absolute', left: Spacing.xl, right: Spacing.xl, bottom: Spacing.xl },
  heroCard: {
    backgroundColor: 'rgba(20,20,26,0.96)',
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  heroTheme: { color: Colors.goldLight, fontSize: FontSizes.sm, fontWeight: '700', marginBottom: Spacing.xs, letterSpacing: 0.4 },
  heroTitle: { color: Colors.white, fontSize: 38, fontWeight: '900', lineHeight: 40, marginBottom: Spacing.sm },
  heroCopy: { color: Colors.textSecondary, fontSize: FontSizes.md, lineHeight: 22, marginBottom: Spacing.md },
  heroDate: { color: Colors.white, fontSize: FontSizes.sm, marginBottom: Spacing.xs },
  heroVenue: { color: Colors.white, fontSize: FontSizes.sm, marginBottom: Spacing.lg },
  countdownRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countdownUnit: { flex: 1, alignItems: 'center' },
  countdownBox: { backgroundColor: Colors.black, borderColor: Colors.cardBorder, borderWidth: 1, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, width: '100%' },
  countdownValue: { color: Colors.gold, fontSize: FontSizes.xl, fontWeight: '800', textAlign: 'center' },
  countdownLabel: { color: Colors.textSecondary, marginTop: Spacing.xs, fontSize: FontSizes.xs, letterSpacing: 0.4 },
  countdownSep: { color: Colors.textMuted, fontSize: FontSizes.xl, fontWeight: '700', marginHorizontal: 4 },
  section: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  sectionEyebrow: { color: Colors.goldLight, fontSize: FontSizes.xs, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4 },
  vipStatsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  vipStatsHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.md },
  vipStatsKicker: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: '800', marginTop: 1 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.greenDark,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginTop: 2,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success, marginRight: 6 },
  liveBadgeText: { color: Colors.success, fontWeight: '800', fontSize: FontSizes.xs, letterSpacing: 0.8 },
  vipStatsTotal: { color: Colors.white, fontSize: 36, fontWeight: '900' },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  quickActionItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionLabel: { color: Colors.white, fontSize: FontSizes.sm, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { color: Colors.white, fontSize: FontSizes.xxl, fontWeight: '900', lineHeight: 28 },
  seeAll: { color: Colors.gold, fontSize: FontSizes.md, fontWeight: '700' },
  horizontalList: { paddingRight: Spacing.xl },
  featuredCard: {
    width: 214,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  featuredImageWrap: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  featuredImage: { width: '100%', backgroundColor: 'transparent' },
  featuredGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent' },
  featuredBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: Colors.gold, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  featuredBadgeText: { color: Colors.black, fontSize: FontSizes.xs, fontWeight: '800' },
  featuredInfo: { paddingHorizontal: Spacing.md, paddingTop: 12, paddingBottom: 12, backgroundColor: Colors.black },
  featuredName: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '800', lineHeight: 18, marginBottom: 4 },
  featuredPrice: { color: Colors.gold, fontSize: FontSizes.sm, fontWeight: '700' },
  eventCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    height: 132,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  eventImageWrap: {
    width: 132,
    backgroundColor: Colors.deepMaroon,
    overflow: 'hidden',
    position: 'relative',
  },
  eventImage: { width: '100%', height: '100%', backgroundColor: Colors.deepMaroon, objectFit: 'contain' },
  eventImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
  eventCategoryBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(15,15,18,0.9)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  eventCategoryText: { color: Colors.goldLight, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  eventInfo: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    justifyContent: 'space-between',
    minHeight: 176,
    minWidth: 0,
  },
  eventMetaTopRow: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 8 },
  eventDatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.black,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  eventDatePillText: {
    color: Colors.goldLight,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  eventName: { color: Colors.white, fontSize: 17, fontWeight: '900', marginBottom: 10, lineHeight: 20, flexShrink: 1, flexWrap: 'wrap', maxWidth: '100%' },
  eventMetaRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  eventMeta: { color: Colors.textSecondary, fontSize: 12, marginLeft: 6, flex: 1, lineHeight: 15, flexShrink: 1, flexWrap: 'wrap', maxWidth: '100%' },
  eventFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  eventPrice: { color: Colors.gold, fontSize: 15, fontWeight: '800', flexShrink: 1, paddingRight: Spacing.sm },
  eventCta: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.full,
  },
  eventCtaText: { color: Colors.black, fontSize: FontSizes.xs, fontWeight: '900', marginRight: 6, letterSpacing: 0.4 },
});
