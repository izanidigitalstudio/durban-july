import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { useCatalogueColumns } from '../lib/responsive';
import { fashionStores } from '../lib/fashionData';

export default function ShoppingScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const numColumns = useCatalogueColumns();

  const categories = [
    'Boutique',
    'Designer',
    'Luxury',
    'Contemporary',
    'Menswear',
    'Formal',
  ];

  const filteredStores = selectedCategory
    ? fashionStores.filter((store) => store.category === selectedCategory)
    : fashionStores;

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWebsite = (website: string) => {
    if (website) {
      Linking.openURL(`https://${website}`);
    }
  };

  const renderStoreCard = ({ item }: { item: (typeof fashionStores)[number] }) => (
    <View style={[styles.storeCard, { flex: 1 / numColumns }]}>
      <View style={styles.storeImageContainer}>
        <Image source={{ uri: item.image }} style={styles.storeImage} />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.storeInfo}>
        <Text style={styles.storeName} numberOfLines={1}>{item.name}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="location" size={12} color={Colors.gold} />
          <Text style={styles.location} numberOfLines={1}>{item.location}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleCall(item.phone)}
          >
            <Ionicons name="call" size={12} color={Colors.gold} />
          </TouchableOpacity>

          {item.website && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleWebsite(item.website!)}
            >
              <Ionicons name="globe" size={12} color={Colors.gold} />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.iconBtn, styles.mapBtn]}
            onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.location)}`)}
          >
            <Ionicons name="navigate" size={12} color={Colors.background} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Fashion & Shopping</Text>
          <Text style={styles.subtitle}>Designer Boutiques in Durban</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === null && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === null && styles.categoryChipTextActive,
            ]}
          >
            All Stores
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              selectedCategory === cat && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.categoryChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        key={`shopping-${numColumns}`}
        data={filteredStores}
        renderItem={renderStoreCard}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.white,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
  categoryScroll: {
    backgroundColor: Colors.background,
    paddingVertical: Spacing.sm,
  },
  categoryContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  categoryChipText: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: Colors.background,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  storeCard: {
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    overflow: 'hidden',
    margin: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  storeImageContainer: {
    position: 'relative',
    height: 120,
    width: '100%',
  },
  storeImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.cardBorder,
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.background,
  },
  storeInfo: {
    padding: Spacing.sm,
  },
  storeName: {
    fontSize: FontSizes.md - 1,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 4,
  },
  location: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  iconBtn: {
    flex: 1,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  mapBtn: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
});
