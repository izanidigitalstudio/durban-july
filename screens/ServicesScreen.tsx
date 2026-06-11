import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { transport, conciergeServices, TransportItem, ConciergeService } from '../lib/data';
import { useCatalogueColumns } from '../lib/responsive';

type Tab = 'transport' | 'concierge';

export default function ServicesScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<Tab>('transport');
  const numColumns = useCatalogueColumns();

  const renderTransport = ({ item }: { item: TransportItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Inquiry', { type: 'transport', id: item.id, name: item.name })}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.transportBadge}>
        <Ionicons
          name={item.type === 'Shuttle' ? 'bus-outline' : item.type === 'Chauffeur' ? 'car-sport-outline' : item.type === 'Helicopter' ? 'airplane-outline' : 'speedometer-outline'}
          size={14}
          color={Colors.gold}
        />
        <Text style={styles.transportBadgeText}>{item.type}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.featuresList}>
          {item.features.slice(0, 3).map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.green} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>{item.price}</Text>
          <View style={styles.inquireBtn}>
            <Text style={styles.inquireBtnText}>Enquire</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.gold} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderConcierge = ({ item }: { item: ConciergeService }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Inquiry', { type: 'concierge', id: item.id, name: item.name })}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.conciergeBadge}>
        <Text style={styles.conciergeBadgeText}>{item.category}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.featuresList}>
          {item.features.slice(0, 3).map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.green} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>{item.price}</Text>
          <View style={styles.inquireBtn}>
            <Text style={styles.inquireBtnText}>Enquire</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.gold} />
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
          numColumns={numColumns}
          columnWrapperStyle={styles.column}
          keyExtractor={(item) => item.id}
          renderItem={renderTransport}
          contentContainerStyle={styles.list}
          style={[styles.serviceList, Platform.OS === 'web' && styles.webList]}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        />
      ) : (
        <FlatList
          key={`concierge-${numColumns}`}
          data={conciergeServices}
          numColumns={numColumns}
          columnWrapperStyle={styles.column}
          keyExtractor={(item) => item.id}
          renderItem={renderConcierge}
          contentContainerStyle={styles.list}
          style={[styles.serviceList, Platform.OS === 'web' && styles.webList]}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        />
      )}
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
  safeHeader: {
    flexShrink: 0,
    backgroundColor: Colors.background,
  },
  serviceList: { flex: 1, minHeight: 0 },
  webList: {
    overflowY: 'auto',
    overflowX: 'hidden',
    touchAction: 'pan-y',
    WebkitOverflowScrolling: 'touch',
  } as any,
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
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  column: { gap: Spacing.lg },
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    marginBottom: Spacing.lg, backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  cardImage: { width: '100%', height: 170 },
  transportBadge: {
    position: 'absolute', top: Spacing.md, left: Spacing.md,
    backgroundColor: Colors.background + 'EE', borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  transportBadgeText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.gold },
  conciergeBadge: {
    position: 'absolute', top: Spacing.md, right: Spacing.md,
    backgroundColor: Colors.burgundy, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
  },
  conciergeBadgeText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.white },
  cardContent: { padding: Spacing.lg },
  cardName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white, marginBottom: Spacing.xs },
  cardDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
  featuresList: { marginBottom: Spacing.md, gap: Spacing.xs },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  featureText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: FontSizes.lg, fontWeight: '800', color: Colors.gold },
  inquireBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inquireBtnText: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '600' },
});
