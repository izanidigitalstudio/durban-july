import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Linking, Alert, Platform, useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../lib/appState';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { marquees, accommodation } from '../lib/data';

function getImageSource(uri: string | number) {
  return typeof uri === 'string' ? { uri } : uri;
}

export default function DetailScreen({ route, navigation }: any) {
  const { type, id } = route.params;
  const [heroIndex, setHeroIndex] = useState(0);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const heroSlideWidth = Math.max(260, width - (Spacing.lg * 2) - 22);

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

  const heroImages = (Array.isArray(item.images) && item.images.length
    ? item.images.filter((uri: string | number) => Boolean(uri))
    : item.image
      ? [item.image]
      : []).slice(0, isMarquee ? 10 : undefined);

  const marqueePackages = isMarquee ? item.packageOptions ?? [] : [];
  const hasMultipleHeroImages = heroImages.length > 1;
  const heroCountLabel = heroImages.length ? `${heroIndex + 1}/${heroImages.length}` : '';
  const marqueePackageTitle = isMarquee && marqueePackages.length ? 'Marquee Packages' : null;

  const handleHeroScroll = (event: any) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / heroSlideWidth);
    setHeroIndex(Math.max(0, Math.min(nextIndex, heroImages.length - 1)));
  };

  return (
    <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
      <ScrollView
        style={[styles.scrollView, Platform.OS === 'web' && styles.webScrollView]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 112 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* Hero */}
        <View style={styles.heroContainer}>
          <View style={styles.heroFrame}>
            {hasMultipleHeroImages ? (
              <ScrollView
                horizontal
                pagingEnabled
                directionalLockEnabled
                nestedScrollEnabled
                decelerationRate="fast"
                snapToInterval={heroSlideWidth}
                snapToAlignment="start"
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleHeroScroll}
                scrollEventThrottle={16}
                style={[styles.heroCarousel, Platform.OS === 'web' && styles.webHeroCarousel]}
                contentContainerStyle={styles.heroCarouselContent}
              >
                {heroImages.map((uri: string | number, index: number) => (
                  <View key={`${String(uri)}-${index}`} style={[styles.heroSlide, { width: heroSlideWidth }]}>
                    <View style={styles.heroImageShell}>
                      <Image source={getImageSource(uri)} style={styles.heroImage} resizeMode="contain" />
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : heroImages.length === 1 ? (
              <View style={styles.singleHeroSlide}>
                <View style={styles.heroImageShell}>
                  <Image
                    source={getImageSource(heroImages[0])}
                    style={styles.heroImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.heroEmptyState}>
                <Ionicons name="image-outline" size={36} color={Colors.textMuted} />
                <Text style={styles.heroEmptyText}>No images available</Text>
              </View>
            )}

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
            {hasMultipleHeroImages && (
              <View style={styles.heroCounter}>
                <Text style={styles.heroCounterText}>{heroCountLabel}</Text>
              </View>
            )}
          </View>

          <View style={styles.heroMeta}>
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
            <View style={styles.heroSubline}>
              <Ionicons name="location-outline" size={14} color={Colors.gold} />
              <Text style={styles.heroSublineText} numberOfLines={1}>
                {isEvent ? `${item.venue}, ${item.location}` : isMarquee ? item.venue : `${item.area}`}
              </Text>
            </View>
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
          {!isEvent && (
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={16} color={Colors.gold} />
              <Text style={styles.infoText}>{isMarquee ? item.venue : `${item.area}`}</Text>
            </View>
          )}
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

        {isMarquee && item.contacts?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contacts</Text>
            {item.contacts.map((contact: any, i: number) => (
              <View key={`${contact.person}-${i}`} style={styles.contactCard}>
                <Text style={styles.contactPerson}>{contact.person}</Text>
                {!!contact.mobileNumbers?.length && (
                  <View style={styles.contactBlock}>
                    <Text style={styles.contactLabel}>Mobile</Text>
                    {contact.mobileNumbers.map((mobile: string) => (
                      <TouchableOpacity
                        key={mobile}
                        onPress={() => Linking.openURL(`tel:${mobile.replace(/\s+/g, '')}`)}
                      >
                        <Text style={styles.contactValue}>{mobile}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {!!contact.emails?.length && (
                  <View style={styles.contactBlock}>
                    <Text style={styles.contactLabel}>Email</Text>
                    {contact.emails.map((email: string) => (
                      <TouchableOpacity
                        key={email}
                        onPress={() => Linking.openURL(`mailto:${email}`)}
                      >
                        <Text style={styles.contactValue}>{email}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : null}

        {isMarquee && marqueePackages.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{marqueePackageTitle}</Text>
            {marqueePackages.map((pkg: any, index: number) => (
              <View key={`${pkg.name}-${index}`} style={styles.packageCard}>
                <View style={styles.packageHeader}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packagePrice}>{pkg.price}</Text>
                </View>
                <View style={styles.packageFeatureList}>
                  {pkg.highlights.map((feature: string, i: number) => (
                    <View key={`${feature}-${i}`} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : null}

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
      <View style={styles.bottomBar}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 0, overflow: 'hidden', backgroundColor: Colors.background },
  webContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    height: '100dvh',
    maxHeight: '100dvh',
  } as any,
  scrollView: { flex: 1, minHeight: 0 },
  webScrollView: {
    height: '100%',
    maxHeight: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    touchAction: 'pan-y',
    WebkitOverflowScrolling: 'touch',
  } as any,
  scrollContent: { flexGrow: 1 },
  errorText: { color: Colors.white, fontSize: FontSizes.lg, padding: Spacing.xl },
  heroContainer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxxl * 1.5, paddingBottom: Spacing.md },
  heroFrame: {
    height: 190,
    position: 'relative',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  heroCarousel: { flex: 1 },
  webHeroCarousel: { touchAction: 'pan-x' } as any,
  heroCarouselContent: { alignItems: 'stretch' },
  singleHeroSlide: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  heroSlide: {
    height: '100%',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  heroImageShell: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.deepMaroon,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.deepMaroon,
  },
  heroEmptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
  },
  heroEmptyText: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '600' },
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
  heroCounter: {
    position: 'absolute',
    top: 56,
    right: Spacing.lg,
    zIndex: 10,
    backgroundColor: Colors.background + 'AA',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  heroCounterText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  heroMeta: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  tierBadge: {
    alignSelf: 'flex-start', backgroundColor: Colors.gold,
    borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md, paddingVertical: 4, marginBottom: Spacing.sm,
  },
  tierBadgeText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.black },
  heroTitle: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.white, lineHeight: 30 },
  heroSubline: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  heroSublineText: { flex: 1, fontSize: FontSizes.sm, color: Colors.textSecondary },
  infoRow: {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface, marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg, marginTop: Spacing.md,
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
  contactCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  contactPerson: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.white, marginBottom: Spacing.sm },
  contactBlock: { marginTop: Spacing.sm },
  contactLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, textTransform: 'uppercase', marginBottom: 4 },
  contactValue: { fontSize: FontSizes.sm, color: Colors.gold, lineHeight: 20 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: FontSizes.md, color: Colors.gold, fontWeight: '600', marginLeft: Spacing.sm },
  packageCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  packageHeader: {
    marginBottom: Spacing.sm,
  },
  packageName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.white,
  },
  packagePrice: {
    fontSize: FontSizes.sm,
    color: Colors.gold,
    fontWeight: '700',
    marginTop: 4,
  },
  packageFeatureList: {
    marginTop: Spacing.sm,
  },
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
