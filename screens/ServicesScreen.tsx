import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { useCatalogueColumns } from '../lib/responsive';
import { transport, conciergeServices, TransportItem, ConciergeService } from '../lib/data';

type Tab = 'transport' | 'concierge';

export default function ServicesScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<Tab>('transport');
  const numColumns = useCatalogueColumns();

  const renderTransport = ({ item }: { item: TransportItem }) => (
    <TouchableOpacity
      style={[styles.card, { flex: 1 / numColumns }]}
      onPress={() => navigation.navigate('Inquiry', { type: 'transport', id: item.id, name: item.name })}
      activeOpacity={0.85}
    >
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.transportBadge}>
          <Ionicons
            name={item.type === 'Shuttle' ? 'bus-outline' : item.type === 'Chauffeur' ? 'car-sport-outline' : item.type === 'Helicopter' ? 'airplane-outline' : 'speedometer-outline'}
            size={10}
            color={Colors.gold}
          />
          <Text style={styles.transportBadgeText}>{item.type}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>{item.price.split(' ')[0]}</Text>
          <View style={styles.inquireBtn}>
            <Text style={styles.inquireBtnText}>Enquire</Text>
            <Ionicons name="chevron-forward" size={10} color={Colors.gold} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderConcierge = ({ item }: { item: ConciergeService }) => (
    <TouchableOpacity
      style={[styles.card, { flex: 1 / numColumns }]}
      onPress={() => navigation.navigate('Inquiry', { type: 'concierge', id: item.id, name: item.name })}
      activeOpacity={0.85}
    >
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.conciergeBadge}>
          <Text style={styles.conciergeBadgeText}>{item.category}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>{item.price.split(' ')[0]}</Text>
          <View style={styles.inquireBtn}>
            <Text style={styles.inquireBtnText}>Enquire</Text>
            <Ionicons name="chevron-forward" size={10} color={Colors.gold} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>VIP Services</Text>
            <Text style={styles.headerSub}>Transport & Concierge · July Weekend</Text>
          </View>
        </View>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'transport' && styles.tabActive]}
            onPress={() => setActiveTab('transport')}
          >
            <Ionicons name="car-outline" size={18} color={activeTab === 'transport' ? Colors.gold : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'transport' && styles.tabTextActive]}>Transport</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'concierge' && styles.tabActive]}
            onPress={() => setActiveTab('concierge')}
          >
            <Ionicons name="diamond-outline" size={18} color={activeTab === 'concierge' ? Colors.gold : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'concierge' && styles.tabTextActive]}>Concierge</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      {activeTab === 'transport' ? (
        <FlatList
          key={`transport-${numColumns}`}
          data={transport}
          keyExtractor={(item) => item.id}
          renderItem={renderTransport}
          numColumns={numColumns}
          style={styles.listView}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          key={`concierge-${numColumns}`}
          data={conciergeServices}
          keyExtractor={(item) => item.id}
          renderItem={renderConcierge}
          numColumns={numColumns}
          style={styles.listView}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 0, overflow: 'hidden', backgroundColor: Colors.background },
  webContainer: { height: '100dvh', maxHeight: '100dvh' } as any,
  safeHeader: { flexShrink: 0, backgroundColor: Colors.background },
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
  tabRow: {
    flexDirection: 'row', marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md, backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, padding: 4,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.sm,
  },
  tabActive: { backgroundColor: Colors.card },
  tabText: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: Colors.gold },
  listView: { flex: 1, minHeight: 0 },
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
  transportBadge: {
    position: 'absolute', top: Spacing.xs, left: Spacing.xs,
    backgroundColor: Colors.background + 'EE', borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  transportBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.gold },
  conciergeBadge: {
    position: 'absolute', top: Spacing.xs, right: Spacing.xs,
    backgroundColor: Colors.burgundy, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
  },
  conciergeBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  cardContent: { padding: Spacing.sm },
  cardName: { fontSize: FontSizes.md - 1, fontWeight: '700', color: Colors.white, marginBottom: Spacing.xs },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  cardPrice: { fontSize: FontSizes.sm, fontWeight: '800', color: Colors.gold },
  inquireBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  inquireBtnText: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '600' },
});
