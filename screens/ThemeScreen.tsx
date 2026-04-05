import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';

const themeInspo = [
  {
    title: 'Natural Earth Tones',
    desc: 'Think warm browns, olive greens, sandy beiges, terracotta, and muted golds. Draw from the South African landscape for your colour palette.',
    icon: 'leaf-outline' as const,
  },
  {
    title: 'Equestrian Elegance',
    desc: 'Incorporate riding-inspired details: leather accents, structured blazers, riding boots, wide-brim hats, and fitted silhouettes.',
    icon: 'ribbon-outline' as const,
  },
  {
    title: 'Bold Textures & Fabrics',
    desc: 'Tweed, linen, raw silk, suede, and woven fabrics. Mix textures for depth. African-print accents or Shweshwe details add local flair.',
    icon: 'layers-outline' as const,
  },
  {
    title: 'Statement Headwear',
    desc: 'Fascinators, wide-brim fedoras, vintage-inspired hats, and floral headpieces. Headwear is essential for Durban July and Country Allure amplifies this tradition.',
    icon: 'flower-outline' as const,
  },
  {
    title: 'South African Flair',
    desc: 'Celebrate local designers and heritage. Incorporate beadwork, Ndebele patterns, or contemporary African fashion. Support homegrown talent.',
    icon: 'sparkles-outline' as const,
  },
  {
    title: 'Rustic Accessories',
    desc: 'Woven bags, leather belts, wooden jewellery, vintage brooches, and nature-inspired pieces. Let accessories tell the country story.',
    icon: 'diamond-outline' as const,
  },
];

const outfitIdeas = [
  {
    gender: 'Women',
    ideas: [
      'Flowing linen midi dress in olive or terracotta with a statement fascinator',
      'Tailored tweed two-piece with riding boots and a leather clutch',
      'African-print maxi skirt paired with a structured blazer in earthy tones',
      'Silk slip dress in champagne gold with a wide-brim hat and woven accessories',
      'Bold Shweshwe-inspired gown with equestrian-themed jewellery',
    ],
  },
  {
    gender: 'Men',
    ideas: [
      'Three-piece suit in tan, olive, or charcoal with a textured waistcoat',
      'Linen blazer and chinos in earth tones with leather loafers',
      'Double-breasted suit with African-print pocket square and tie',
      'Tweed jacket paired with tailored trousers and a fedora hat',
      'Modern Madiba shirt with tailored pants and suede shoes',
    ],
  },
];

export default function ThemeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>2026 Theme</Text>
            <Text style={styles.headerSub}>Style Guide & Inspiration</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Image
            source={{
              uri: 'https://api.a0.dev/assets/image?text=light+skin+Black+African+woman+long+beautiful+hair+horse+beside+her+country+field+earth+tone+dress+elegant+fashion&aspect=16:9&seed=2642',
            }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroLabel}>HOLLYWOODBETS DURBAN JULY 2026</Text>
            <Text style={styles.heroTheme}>"Country Allure"</Text>
            <Text style={styles.heroDate}>Saturday, 4 July 2026 | Greyville Racecourse</Text>
          </View>
        </View>

        {/* About the Theme */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Theme</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              The 2026 Hollywoodbets Durban July theme is{' '}
              <Text style={styles.goldBold}>"Country Allure"</Text>, announced on
              19 March 2026.
            </Text>
            <Text style={[styles.aboutText, { marginTop: 12 }]}>
              This theme invites designers and racegoers to explore the charm of
              rural landscapes, the elegance of equestrian heritage, and authentic
              South African flair. Think rolling fields, earthy palettes, natural
              textures, and the timeless sophistication of country living meets the
              bold creativity of Mzansi fashion.
            </Text>
            <Text style={[styles.aboutText, { marginTop: 12 }]}>
              Whether you draw from the golden grasslands of the Free State, the
              vineyards of the Western Cape, or the rolling hills of KwaZulu-Natal,
              Country Allure celebrates the beauty and spirit of South Africa
              beyond the city.
            </Text>
          </View>
        </View>

        {/* Style Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style Guide</Text>
          <Text style={styles.sectionSub}>
            Key elements to nail the Country Allure look
          </Text>

          {themeInspo.map((item, i) => (
            <View key={i} style={styles.guideCard}>
              <View style={styles.guideIconWrap}>
                <Ionicons name={item.icon} size={22} color={Colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guideTitle}>{item.title}</Text>
                <Text style={styles.guideDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Colour Palette */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Colour Palette</Text>
          <Text style={styles.sectionSub}>
            The colours of Country Allure
          </Text>
          <View style={styles.paletteRow}>
            {[
              { name: 'Earthy Brown', color: '#8B6914' },
              { name: 'Olive Green', color: '#556B2F' },
              { name: 'Terracotta', color: '#CC6B49' },
              { name: 'Sandy Gold', color: '#C4A35A' },
              { name: 'Cream', color: '#F5F0DC' },
              { name: 'Rust', color: '#A0522D' },
            ].map((c, i) => (
              <View key={i} style={styles.paletteItem}>
                <View style={[styles.paletteSwatch, { backgroundColor: c.color }]} />
                <Text style={styles.paletteName}>{c.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Outfit Ideas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outfit Ideas</Text>

          {outfitIdeas.map((group, gi) => (
            <View key={gi} style={styles.outfitGroup}>
              <View style={styles.outfitHeader}>
                <Ionicons
                  name={group.gender === 'Women' ? 'woman-outline' : 'man-outline'}
                  size={20}
                  color={Colors.gold}
                />
                <Text style={styles.outfitGender}>{group.gender}</Text>
              </View>
              {group.ideas.map((idea, ii) => (
                <View key={ii} style={styles.outfitItem}>
                  <View style={styles.outfitBullet} />
                  <Text style={styles.outfitText}>{idea}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Pro Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pro Tips</Text>
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={20} color={Colors.gold} />
            <Text style={styles.tipText}>
              Start planning your outfit early. Book a styling consultation through
              our Concierge Services for expert help nailing the theme.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="shirt-outline" size={20} color={Colors.gold} />
            <Text style={styles.tipText}>
              Visit our Fashion & Shopping section for curated Durban boutiques
              that stock designer and locally-made pieces perfect for Country Allure.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="camera-outline" size={20} color={Colors.gold} />
            <Text style={styles.tipText}>
              The best-dressed competition is fierce. Coordinate accessories,
              headwear, and shoes to tell a cohesive Country Allure story.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: FontSizes.xs, color: Colors.gold },
  content: { paddingHorizontal: Spacing.lg },

  // Hero
  heroBanner: {
    borderRadius: BorderRadius.xl, overflow: 'hidden',
    marginBottom: Spacing.xxl,
  },
  heroImage: {
    width: '100%',
    height: 220,
  },
  heroOverlay: {
    backgroundColor: Colors.card,
    padding: Spacing.xl, alignItems: 'center',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  heroLabel: {
    fontSize: FontSizes.xs, fontWeight: '600',
    color: Colors.textSecondary, letterSpacing: 1.5, marginBottom: 6,
  },
  heroTheme: {
    fontSize: 28, fontWeight: '800', color: Colors.gold,
    fontStyle: 'italic', marginBottom: 6,
  },
  heroDate: { fontSize: FontSizes.sm, color: Colors.textSecondary },

  // Sections
  section: { marginBottom: Spacing.xxl },
  sectionTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  sectionSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },

  // About
  aboutCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, borderWidth: 1, borderColor: Colors.cardBorder,
    marginTop: Spacing.md,
  },
  aboutText: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 24 },
  goldBold: { color: Colors.gold, fontWeight: '700' },

  // Guide
  guideCard: {
    flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start',
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  guideIconWrap: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.gold + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  guideTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  guideDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },

  // Palette
  paletteRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md,
    marginTop: Spacing.md,
  },
  paletteItem: { alignItems: 'center', width: 90 },
  paletteSwatch: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 2, borderColor: Colors.cardBorder,
    marginBottom: 6,
  },
  paletteName: { fontSize: FontSizes.xs, color: Colors.textSecondary, textAlign: 'center' },

  // Outfits
  outfitGroup: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  outfitHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  outfitGender: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white },
  outfitItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  outfitBullet: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.gold, marginTop: 7,
  },
  outfitText: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, flex: 1 },

  // Tips
  tipCard: {
    flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start',
    backgroundColor: Colors.gold + '08', borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.gold + '20',
  },
  tipText: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, flex: 1 },
});