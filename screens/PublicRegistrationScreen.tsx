import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Colors, BorderRadius, FontSizes, Spacing } from '../lib/theme';

const eventTypes = [
  'Music',
  'Fashion',
  'Food & Drink',
  'Networking',
  'Corporate',
  'Family',
  'Lifestyle',
  'Other',
];

const REGISTRATION_URL = 'https://www.durbanjulyvip.co.za/register';
const WEB_APP_URL = 'https://www.durbanjulyvip.co.za';
const TESTFLIGHT_URL = 'https://testflight.apple.com/join/vGNPJCxy';

export default function PublicRegistrationScreen({ navigation }: any) {
  const createRegistration = useMutation(api.registrations.createRegistration);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('');
  const [favouriteEventType, setFavouriteEventType] = useState('Music');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedHint = useMemo(() => eventTypes.find((item) => item === favouriteEventType) ?? 'Music', [favouriteEventType]);

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !favouriteEventType.trim()) {
      Alert.alert('Missing fields', 'Please fill in your name, email, and favourite event type.');
      return;
    }

    try {
      setLoading(true);
      await createRegistration({
        fullName,
        email,
        phone: phone.trim() || undefined,
        companyName: companyName.trim() || undefined,
        city: city.trim() || undefined,
        favouriteEventType,
        notes: notes.trim() || undefined,
        source: 'public-registration-link',
        destination: 'web',
      });
      setSubmitted(true);
      Alert.alert('Registration submitted', 'Choose how you want to continue.');
    } catch (error: any) {
      Alert.alert('Registration failed', error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    await Share.share({
      title: 'Durban July VIP registration',
      message: `Register here: ${REGISTRATION_URL}\n\nAfter registering, open the web app: ${WEB_APP_URL}\nOr join the beta app: ${TESTFLIGHT_URL}`,
      url: REGISTRATION_URL,
    });
  };

  const openWebApp = async () => {
    await Linking.openURL(WEB_APP_URL);
  };

  const handleOpenTestFlight = async () => {
    await Linking.openURL(TESTFLIGHT_URL);
  };

  const handleBack = async () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    await Linking.openURL(WEB_APP_URL);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>

          <Text style={styles.eyebrow}>Register for web access</Text>
          <Text style={styles.title}>Create your profile</Text>
          <Text style={styles.subtitle}>
            Share your details now and start using the web app while the App Store and Google Play listings are pending.
          </Text>

          {submitted ? (
            <View style={styles.successCard}>
              <Text style={styles.successTitle}>You're registered</Text>
              <Text style={styles.successText}>
                Open the web app now or join the beta build. You can also share the registration link with your team.
              </Text>
              <TouchableOpacity style={styles.primaryAction} onPress={openWebApp} activeOpacity={0.85}>
                <Text style={styles.primaryActionText}>Open web app</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryAction} onPress={handleOpenTestFlight} activeOpacity={0.85}>
                <Text style={styles.secondaryActionText}>Join beta on TestFlight</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareAction} onPress={handleShare} activeOpacity={0.85}>
                <Ionicons name="share-social-outline" size={18} color={Colors.gold} />
                <Text style={styles.shareActionText}>Share registration link</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.form}>
            <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your full name" />
            <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
            <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="Your phone number" keyboardType="phone-pad" />
            <Field label="Company name" value={companyName} onChangeText={setCompanyName} placeholder="Company or organisation" />
            <Field label="City" value={city} onChangeText={setCity} placeholder="Your city" />

            <Text style={styles.label}>Favourite event type</Text>
            <View style={styles.pillGrid}>
              {eventTypes.map((type) => {
                const active = type === favouriteEventType;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFavouriteEventType(type)}
                    style={[styles.pill, active && styles.pillActive]}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{type}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Field
              label="Additional notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything we should know?"
              multiline
            />

            <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>{loading ? 'Submitting...' : 'Submit registration'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareLinkBtn} onPress={handleShare} activeOpacity={0.85}>
              <Ionicons name="copy-outline" size={18} color={Colors.gold} />
              <Text style={styles.shareLinkText}>Share registration link</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerNote}>You'll be able to access the web app immediately after registering.</Text>
          <Text style={styles.selectionNote}>Selected: {selectedHint}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, multiline, ...props }: any) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        style={[styles.input, multiline && styles.textArea]}
        placeholderTextColor={Colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },
  eyebrow: { color: Colors.gold, fontSize: FontSizes.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.4 },
  title: { color: Colors.white, fontSize: 30, fontWeight: '800', marginTop: Spacing.xs },
  subtitle: { color: Colors.textSecondary, fontSize: FontSizes.md, lineHeight: 22, marginTop: Spacing.sm, marginBottom: Spacing.xl },
  successCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  successTitle: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '800' },
  successText: { color: Colors.textSecondary, fontSize: FontSizes.sm, lineHeight: 20 },
  primaryAction: {
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    paddingVertical: 13,
  },
  primaryActionText: { color: Colors.black, fontWeight: '800' },
  secondaryAction: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  secondaryActionText: { color: Colors.gold, fontWeight: '800' },
  shareAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  shareActionText: { color: Colors.gold, fontWeight: '700' },
  form: { gap: Spacing.md },
  fieldWrap: { gap: Spacing.sm },
  label: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '700' },
  input: {
    backgroundColor: Colors.surface,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    color: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pill: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
  },
  pillActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  pillText: { color: Colors.textSecondary, fontWeight: '700', fontSize: FontSizes.sm },
  pillTextActive: { color: Colors.black },
  submitBtn: {
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: Colors.black, fontSize: FontSizes.md, fontWeight: '800' },
  shareLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  shareLinkText: { color: Colors.gold, fontWeight: '700' },
  footerNote: { color: Colors.textSecondary, fontSize: FontSizes.sm, lineHeight: 20, marginTop: Spacing.lg },
  selectionNote: { color: Colors.gold, fontSize: FontSizes.xs, marginTop: Spacing.sm, fontWeight: '700' },
});