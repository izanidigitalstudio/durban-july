import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import AdaptiveImage from '../components/AdaptiveImage';

const conciergeServices = [
  {
    id: 'styling',
    name: 'Personal Styling Consultation',
    category: 'Styling',
    description: 'Expert styling advice for Durban July. Wardrobe selection, color consultation, and outfit coordination.',
    features: [
      'One-on-one consultation',
      'Personalized style recommendations',
      'Outfit coordination',
    ],
    price: 'From R1,200',
    image: 'https://api.a0.dev/assets/image?text=personal+stylist+luxury+consultation&aspect=16:9&seed=5001',
    phone: '+27 31 207 1000',
    website: 'www.stylesoc.co.za',
  },
  {
    id: 'photography',
    name: 'Professional Photography',
    category: 'Photography',
    description: 'Professional photographers for your Durban July moments. Coverage options from race day to evening events.',
    features: [
      'Professional photographer',
      'Digital & printed photos',
      'Same-day editing available',
    ],
    price: 'From R2,500',
    image: 'https://api.a0.dev/assets/image?text=professional+photographer+durban+event&aspect=16:9&seed=5002',
    phone: '+27 31 304 5555',
    website: 'www.durbaneventphoto.co.za',
  },
  {
    id: 'makeup',
    name: 'Professional Makeup & Hair',
    category: 'Beauty',
    description: 'Professional makeup artist and hair stylist service. Bridal makeup, day looks, or evening glam.',
    features: [
      'Professional makeup artist',
      'Hair styling services',
      'Touch-up support',
    ],
    price: 'From R800',
    image: 'https://api.a0.dev/assets/image?text=professional+makeup+artist+luxury+beauty&aspect=16:9&seed=5003',
    phone: '+27 31 201 8888',
    website: 'www.beaut-elite.co.za',
  },
  {
    id: 'florist',
    name: 'Luxury Floral & Event Decor',
    category: 'Decor',
    description: 'Exquisite floral arrangements and event decoration. Perfect for pre-party hosting or VIP tables.',
    features: [
      'Custom arrangements',
      'Event decoration',
      'Same-day delivery',
    ],
    price: 'From R500',
    image: 'https://api.a0.dev/assets/image?text=luxury+floral+arrangement+event+decoration&aspect=16:9&seed=5004',
    phone: '+27 31 309 2222',
    website: 'www.floralbliss.co.za',
  },
];

export default function ConciergeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.burgundy} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>VIP Concierge</Text>
          <Text style={styles.headerSubtitle}>Styling, photography & more</Text>
        </View>
      </View>

      <ScrollView
        style={[styles.content, Platform.OS === 'web' && styles.webScroll]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {conciergeServices.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <AdaptiveImage source={{ uri: service.image }} style={styles.serviceImage} />
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{service.category}</Text>
            </View>

            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDesc}>{service.description}</Text>

              <View style={styles.featuresList}>
                {service.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.burgundy} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.priceText}>{service.price}</Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => Linking.openURL(`tel:${service.phone}`)}
                >
                  <Ionicons name="call" size={20} color={Colors.burgundy} />
                  <Text style={styles.buttonText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.visitButton}
                  onPress={() => Linking.openURL(`https://${service.website}`)}
                >
                  <Ionicons name="globe" size={20} color={Colors.burgundy} />
                  <Text style={styles.buttonText}>Visit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.enquireButton}
                  onPress={() => Linking.openURL(`https://${service.website}/enquire`)}
                >
                  <Text style={styles.enquireText}>Enquire</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.charcoal} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  webContainer: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    height: '100dvh', maxHeight: '100dvh',
  } as any,
  header: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
  webScroll: {
    overflowY: 'auto', overflowX: 'hidden', touchAction: 'pan-y',
    WebkitOverflowScrolling: 'touch',
  } as any,
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  serviceCard: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
  serviceImage: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.burgundy,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: FontSizes.sm,
  },
  serviceInfo: {
    padding: Spacing.lg,
  },
  serviceName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  serviceDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  featuresList: {
    marginBottom: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  featureText: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  priceText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.burgundy,
    marginBottom: Spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  visitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  enquireButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.burgundy,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  buttonText: {
    color: Colors.burgundy,
    fontWeight: '600',
    fontSize: FontSizes.sm,
  },
  enquireText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: FontSizes.sm,
  },
});
