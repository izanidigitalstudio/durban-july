import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, ScrollView, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { useCatalogueColumns } from '../lib/responsive';

type Activity = {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  highlights: string[];
  image: string;
  hours?: string;
  price?: string;
  website?: string;
  phone?: string;
};

const categories = ['All', 'Attractions', 'Beach & Outdoors', 'Dining & Nightlife', 'Adventure', 'Culture'];

const activities: Activity[] = [
  {
    id: 'ushaka',
    name: 'uShaka Marine World',
    category: 'Attractions',
    description: 'One of the largest marine theme parks in the world. Explore Sea World aquarium, Wet \'n Wild water park, uShaka Beach, and Village Walk shopping promenade.',
    location: 'Bell Street, Point, Durban',
    highlights: ['Sea World Aquarium', 'Wet \'n Wild Water Park', 'Dolphin & Seal Shows', 'uShaka Beach & Village Walk'],
    image: 'https://api.a0.dev/assets/image?text=uShaka+Marine+World+Durban+aquarium+tropical+marine+theme+park+aerial+view&aspect=16:9&seed=ushaka1',
    hours: 'Daily: 09:00 - 17:00',
    price: 'From R195',
    website: 'https://ushakamarineworld.co.za',
    phone: '+27312738000',
  },
  {
    id: 'mabhida',
    name: 'Moses Mabhida Stadium',
    category: 'Adventure',
    description: 'Iconic 2010 FIFA World Cup stadium offering the Big Rush Big Swing (world\'s tallest swing), SkyCar rides to the top of the arch, and segway tours with panoramic views of Durban.',
    location: '44 Isaiah Ntshangase Rd, Stamford Hill',
    highlights: ['Big Rush Big Swing', 'SkyCar to Stadium Arch', 'People\'s Park', 'Segway Gliding Tours'],
    image: 'https://api.a0.dev/assets/image?text=Moses+Mabhida+Stadium+Durban+iconic+arch+modern+architecture+sunset&aspect=16:9&seed=mabhida1',
    hours: 'Tours: 09:00 - 16:00',
    price: 'SkyCar from R60',
    website: 'https://mmstadium.com',
    phone: '+27313222600',
  },
  {
    id: 'golden-mile',
    name: 'Durban Golden Mile',
    category: 'Beach & Outdoors',
    description: 'Durban\'s famous beachfront promenade stretching 6km along the Indian Ocean. Perfect for morning jogs, cycling, surfing, and soaking up the warm KZN sun.',
    location: 'Durban Beachfront, North & South Beach',
    highlights: ['Swimming & Surfing', 'Promenade Walks & Cycling', 'Rickshaw Rides', 'Mini Town Durban'],
    image: 'https://api.a0.dev/assets/image?text=Durban+Golden+Mile+beachfront+promenade+ocean+waves+sunshine+tropical&aspect=16:9&seed=golden1',
    hours: 'Open 24 hours',
    price: 'Free',
  },
  {
    id: 'umhlanga',
    name: 'Umhlanga Promenade & Lighthouse',
    category: 'Beach & Outdoors',
    description: 'The iconic Umhlanga Lighthouse and whale bone pier set against stunning ocean views. Walk the promenade, spot dolphins, and enjoy world-class restaurants nearby.',
    location: 'Umhlanga Rocks, Durban North',
    highlights: ['Iconic Lighthouse', 'Whale Bone Pier', 'Dolphin Spotting', 'Bronze Beach'],
    image: 'https://api.a0.dev/assets/image?text=Umhlanga+Lighthouse+promenade+ocean+beautiful+coastal+walk+sunset&aspect=16:9&seed=umhlanga1',
    hours: 'Open 24 hours',
    price: 'Free',
  },
  {
    id: 'florida-road',
    name: 'Florida Road',
    category: 'Dining & Nightlife',
    description: 'Durban\'s trendiest street for dining, cocktails, and nightlife. Lined with Victorian and Edwardian houses converted into restaurants, bars, and boutiques.',
    location: 'Florida Road, Morningside, Durban',
    highlights: ['Craft Cocktail Bars', 'International Restaurants', 'Live Music Venues', 'Vibrant Nightlife'],
    image: 'https://api.a0.dev/assets/image?text=Florida+Road+Durban+nightlife+restaurants+bars+Victorian+buildings+evening+ambiance&aspect=16:9&seed=florida1',
    hours: 'Restaurants: 11:00 - Late',
    price: 'Varies',
  },
  {
    id: 'suncoast',
    name: 'Suncoast Casino & Entertainment',
    category: 'Dining & Nightlife',
    description: 'Premier beachfront entertainment destination with casino, cinemas, restaurants, and a private beach. Perfect for an evening of entertainment after a day at the races.',
    location: '20 Suncoast Boulevard, Durban',
    highlights: ['Casino & Gaming', 'Beachfront Restaurants', 'Cinema Complex', 'Private Beach'],
    image: 'https://api.a0.dev/assets/image?text=Suncoast+Casino+Durban+beachfront+entertainment+complex+luxury+evening+lights&aspect=16:9&seed=suncoast1',
    hours: 'Casino: 24 hours',
    price: 'Free entry',
    website: 'https://www.tsogosun.com/suncoast',
    phone: '+27313283000',
  },
  {
    id: 'botanic',
    name: 'Durban Botanic Gardens',
    category: 'Culture',
    description: 'Africa\'s oldest surviving botanical gardens, established in 1849. Explore the orchid house, cycad collection, sunken garden, and serene lakes — a tranquil escape in the city.',
    location: '9A John Zikhali Rd, Berea, Durban',
    highlights: ['Orchid House', 'Cycad Collection', 'Sunken Garden & Lake', 'Heritage Tea Garden'],
    image: 'https://api.a0.dev/assets/image?text=Durban+Botanic+Gardens+lush+tropical+gardens+palm+trees+tranquil+lake&aspect=16:9&seed=botanic1',
    hours: 'Daily: 07:30 - 17:15',
    price: 'Free',
    phone: '+27313221195',
  },
  {
    id: 'valley',
    name: 'Valley of a Thousand Hills',
    category: 'Culture',
    description: 'Breathtaking Zulu cultural experience just 45 minutes from Durban. Explore traditional Zulu villages, watch cultural dances, taste local cuisine, and enjoy spectacular valley views.',
    location: 'Valley of 1000 Hills, KZN',
    highlights: ['Zulu Cultural Village', 'Traditional Dance Shows', 'Scenic Valley Views', 'Reptile Park'],
    image: 'https://api.a0.dev/assets/image?text=Valley+of+Thousand+Hills+Durban+KZN+green+rolling+hills+Zulu+cultural+village&aspect=16:9&seed=valley1',
    hours: 'Daily: 08:00 - 16:30',
    price: 'From R170',
    website: 'https://phezulusafaripark.co.za',
    phone: '+27317771000',
  },
  {
    id: 'gateway',
    name: 'Gateway Theatre of Shopping',
    category: 'Attractions',
    description: 'One of the largest shopping centres in the Southern Hemisphere. Features over 400 stores, IMAX cinema, wave house, skate park, rock climbing wall, and world-class dining.',
    location: '1 Palm Blvd, Umhlanga Ridge',
    highlights: ['400+ Retail Stores', 'IMAX & Cinemas', 'Wave House', 'Fine Dining & Food Court'],
    image: 'https://api.a0.dev/assets/image?text=Gateway+Theatre+Shopping+Umhlanga+Durban+luxury+mall+interior+modern&aspect=16:9&seed=gateway1',
    hours: 'Daily: 09:00 - 21:00',
    price: 'Free entry',
    website: 'https://gatewayworld.co.za',
    phone: '+27315142501',
  },
  {
    id: 'sardines',
    name: 'Wilson\'s Wharf & Harbour',
    category: 'Dining & Nightlife',
    description: 'Vibrant waterfront dining and entertainment precinct overlooking the Durban harbour. Enjoy fresh seafood, harbour cruises, and spectacular views of ships coming and going.',
    location: 'Wilson\'s Wharf, Durban Harbour',
    highlights: ['Waterfront Dining', 'Harbour Cruises', 'Fresh Seafood Restaurants', 'Sunset Views'],
    image: 'https://api.a0.dev/assets/image?text=Durban+harbour+waterfront+dining+boats+sunset+Wilson+Wharf&aspect=16:9&seed=wharf1',
    hours: 'Restaurants: 11:00 - 22:00',
    price: 'Varies',
  },
];

export default function DurbanActivitiesScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const numColumns = useCatalogueColumns();

  const filtered = selectedCategory === 'All'
    ? activities
    : activities.filter((a) => a.category === selectedCategory);

  const renderActivity = ({ item }: { item: Activity }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryBadgeText}>{item.category}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color={Colors.gold} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>

        {item.hours && (
          <View style={styles.locationRow}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{item.hours}</Text>
          </View>
        )}

        {/* Highlights */}
        <View style={styles.highlightsWrap}>
          {item.highlights.map((h, i) => (
            <View key={i} style={styles.highlightChip}>
              <Text style={styles.highlightText}>{h}</Text>
            </View>
          ))}
        </View>

        {/* Price + Actions */}
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{item.price || 'Free'}</Text>
          <View style={styles.actions}>
            {item.phone && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => Linking.openURL(`tel:${item.phone}`)}
              >
                <Ionicons name="call" size={14} color={Colors.gold} />
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
            )}
            {item.website && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => Linking.openURL(item.website!)}
              >
                <Ionicons name="globe-outline" size={14} color={Colors.gold} />
                <Text style={styles.actionText}>Visit</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionBtn, styles.mapBtn]}
              onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.location)}`)}
            >
              <Text style={styles.mapBtnText}>Map</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>What to Enjoy in Durban</Text>
            <Text style={styles.headerSub}>Leisure, Culture & Adventure</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        key={numColumns}
        data={filtered}
        numColumns={numColumns}
        columnWrapperStyle={styles.column}
        keyExtractor={(item) => item.id}
        renderItem={renderActivity}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: FontSizes.sm, color: Colors.gold },

  filterRow: {
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardBorder, minHeight: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  chipText: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.white },
  chipTextActive: { color: Colors.black },

  list: { padding: Spacing.lg, paddingBottom: 100 },
  column: { gap: Spacing.lg },

  card: {
    flex: 1,
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg, overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 180 },
  categoryBadge: {
    position: 'absolute', top: Spacing.md, left: Spacing.md,
    backgroundColor: Colors.charcoal + 'DD', borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
  },
  categoryBadgeText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.white },

  cardBody: { padding: Spacing.lg },
  cardTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white, marginBottom: Spacing.xs },
  cardDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },

  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  locationText: { fontSize: FontSizes.sm, color: Colors.gold, flex: 1 },
  infoText: { fontSize: FontSizes.sm, color: Colors.textSecondary },

  highlightsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.sm, marginBottom: Spacing.md },
  highlightChip: {
    backgroundColor: Colors.green + '15', borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  highlightText: { fontSize: FontSizes.xs, color: Colors.greenLight },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.cardBorder,
  },
  price: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.gold },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
  },
  actionText: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.gold },
  mapBtn: {
    backgroundColor: Colors.gold, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
  },
  mapBtnText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.black },
});
