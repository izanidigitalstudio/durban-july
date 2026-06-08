import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';

const transportServices = [
  {
    id: 'shuttle',
    name: 'July VIP Shuttle Service',
    category: 'Shuttle',
    description: 'Luxury shuttle service between major hotels and Greyville Racecourse.',
    features: [
      'Air-conditioned luxury coaches',
      'Multiple departure times',
      'Pick-up from major hotels',
    ],
    price: 'From R350 pp',
    image: 'https://api.a0.dev/assets/image?text=luxury+shuttle+bus+durban+july+evening&aspect=16:9&seed=4001',
    phone: '+27 31 582 2000',
    website: 'www.transportco.co.za',
  },
  {
    id: 'chauffeur',
    name: 'Executive Chauffeur Service',
    category: 'Chauffeur',
    description: 'Private chauffeur-driven luxury vehicle. Mercedes-Benz S-Class, BMW 7 Series, or Range Rover.',
    features: [
      'Choice of luxury vehicles',
      'Professional uniformed driver',
      'Door-to-door service',
    ],
    price: 'From R850 pp',
    image: 'https://api.a0.dev/assets/image?text=luxury+car+chauffeur+service+durban&aspect=16:9&seed=4002',
    phone: '+27 31 565 1234',
    website: 'www.luxedriver.co.za',
  },
  {
    id: 'helicopter',
    name: 'Helicopter Transfers',
    category: 'Helicopter',
    description: 'Exclusive helicopter transfers to and from the racecourse. VIP arrival experience.',
    features: [
      'Scenic aerial views',
      'Skip traffic completely',
      'Premium landing area',
    ],
    price: 'From R2,500 pp',
    image: 'https://api.a0.dev/assets/image?text=helicopter+durban+coastal+luxury&aspect=16:9&seed=4003',
    phone: '+27 31 910 1000',
    website: 'www.heli-africa.co.za',
  },
];

export default function TransportScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.gold} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>VIP Transport</Text>
          <Text style={styles.headerSubtitle}>Shuttles, chauffeurs & helicopter</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {transportServices.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <Image source={{ uri: service.image }} style={styles.serviceImage} />
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{service.category}</Text>
            </View>

            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDesc}>{service.description}</Text>

              <View style={styles.featuresList}>
                {service.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.greenLight} />
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
                  <Ionicons name="call" size={20} color={Colors.gold} />
                  <Text style={styles.buttonText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.visitButton}
                  onPress={() => Linking.openURL(`https://${service.website}`)}
                >
                  <Ionicons name="globe" size={20} color={Colors.gold} />
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
  webContainer: { height: '100dvh', maxHeight: '100dvh' } as any,
  header: {
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
    height: 200,
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    color: Colors.charcoal,
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
    color: Colors.gold,
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
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  buttonText: {
    color: Colors.gold,
    fontWeight: '600',
    fontSize: FontSizes.sm,
  },
  enquireText: {
    color: Colors.charcoal,
    fontWeight: '600',
    fontSize: FontSizes.sm,
  },
});
