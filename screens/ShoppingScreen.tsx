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
import { fashionStores } from '../lib/fashionData';
import { useCatalogueColumns } from '../lib/responsive';

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
    <TouchableOpacity style={styles.storeCard}>
      <Image source={{ uri: item.image }} style={styles.storeImage} />
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>

      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.storeDesc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color={Colors.gold} />
          <Text style={styles.location}>{item.location}</Text>
        </View>

        <View style={styles.specialtiesRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.specialties}
          >
            {item.specialties.map((specialty, idx) => (
              <View key={idx} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.phoneBtn}
            onPress={() => handleCall(item.phone)}
          >
            <Ionicons name="call" size={16} color={Colors.gold} />
            <Text style={styles.phoneBtnText}>Call</Text>
          </TouchableOpacity>

          {item.website && (
            <TouchableOpacity
              style={styles.websiteBtn}
              onPress={() => handleWebsite(item.website!)}
            >
              <Ionicons name="globe" size={16} color={Colors.gold} />
              <Text style={styles.websiteBtnText}>Visit</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.directionBtn}>
            <Ionicons name="navigate" size={16} color={Colors.gold} />
            <Text style={styles.directionBtnText}>Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
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
        key={numColumns}
        data={filteredStores}
        numColumns={numColumns}
        columnWrapperStyle={styles.column}
        renderItem={renderStoreCard}
        keyExtractor={(item) => item.id}
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
    gap: Spacing.md,
  },
  column: {
    gap: Spacing.md,
  },
  storeCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.card,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  storeImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.cardBorder,
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  categoryText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.background,
  },
  storeInfo: {
    padding: Spacing.md,
  },
  storeName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  storeDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  location: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  specialtiesRow: {
    marginBottom: Spacing.md,
  },
  specialties: {
    marginVertical: Spacing.xs,
  },
  specialtyTag: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.xs,
  },
  specialtyText: {
    fontSize: FontSizes.xs,
    color: Colors.gold,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  phoneBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  phoneBtnText: {
    fontSize: FontSizes.sm,
    color: Colors.gold,
    fontWeight: '600',
  },
  websiteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  websiteBtnText: {
    fontSize: FontSizes.sm,
    color: Colors.gold,
    fontWeight: '600',
  },
  directionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  directionBtnText: {
    fontSize: FontSizes.sm,
    color: Colors.background,
    fontWeight: '600',
  },
});
