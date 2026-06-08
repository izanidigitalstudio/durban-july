import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { useAppData } from '../lib/appState';

export default function InquiryScreen({ route, navigation }: any) {
  const { type, id, name } = route.params;
  const { createInquiry } = useAppData();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '2',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const typeLabel = type === 'marquee' ? 'Marquee' : type === 'event' ? 'Event' : type === 'accommodation' ? 'Accommodation' : type === 'transport' ? 'Transport' : 'Concierge';

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      Alert.alert('Required Fields', 'Please fill in your name, email, and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      await createInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        itemType: type,
        itemId: id,
        itemName: name,
        guests: parseInt(form.guests) || 2,
        message: form.message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
        <SafeAreaView style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.green} />
          </View>
          <Text style={styles.successTitle}>Enquiry Submitted</Text>
          <Text style={styles.successDesc}>
            Thank you for your interest in {name}. Our VIP concierge team will contact you within 24 hours to confirm availability and arrange your booking.
          </Text>
          <View style={styles.successInfo}>
            <View style={styles.successInfoRow}>
              <Ionicons name="mail-outline" size={16} color={Colors.gold} />
              <Text style={styles.successInfoText}>Confirmation sent to {form.email}</Text>
            </View>
            <View style={styles.successInfoRow}>
              <Ionicons name="call-outline" size={16} color={Colors.gold} />
              <Text style={styles.successInfoText}>We'll call you on {form.phone}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.doneButton} onPress={() => navigation.popToTop()}>
            <Text style={styles.doneButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enquire</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formContainer}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Item info */}
          <View style={styles.itemCard}>
            <View style={styles.itemBadge}>
              <Text style={styles.itemBadgeText}>{typeLabel}</Text>
            </View>
            <Text style={styles.itemName}>{name}</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => setForm(f => ({ ...f, name: v }))}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.formLabel}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(v) => setForm(f => ({ ...f, email: v }))}
              placeholder="your@email.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.formLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(v) => setForm(f => ({ ...f, phone: v }))}
              placeholder="+27 XX XXX XXXX"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
            />

            <Text style={styles.formLabel}>Number of Guests</Text>
            <TextInput
              style={styles.input}
              value={form.guests}
              onChangeText={(v) => setForm(f => ({ ...f, guests: v }))}
              placeholder="2"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
            />

            <Text style={styles.formLabel}>Additional Requirements</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.message}
              onChangeText={(v) => setForm(f => ({ ...f, message: v }))}
              placeholder="Special requests, dietary requirements, group details..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Enquiry</Text>
                <Ionicons name="send" size={18} color={Colors.black} />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By submitting, you agree to be contacted by our VIP concierge team regarding your enquiry. Response within 24 hours.
          </Text>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  safeHeader: { flexShrink: 0, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white },
  formContainer: { flex: 1, minHeight: 0 },
  scrollView: { flex: 1, minHeight: 0 },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl, flexGrow: 1 },
  itemCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.cardBorder,
    marginBottom: Spacing.xxl,
  },
  itemBadge: {
    alignSelf: 'flex-start', backgroundColor: Colors.gold,
    borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2,
    marginBottom: Spacing.sm,
  },
  itemBadgeText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.black },
  itemName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white },
  formSection: { marginBottom: Spacing.xxl },
  formLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  input: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontSize: FontSizes.md, color: Colors.white,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  textArea: { height: 100, paddingTop: Spacing.md },
  submitButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.gold, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg, marginBottom: Spacing.lg,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.black },
  disclaimer: { fontSize: FontSizes.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxxl },
  successIcon: { marginBottom: Spacing.xxl },
  successTitle: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.white, marginBottom: Spacing.md },
  successDesc: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.xxl },
  successInfo: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, width: '100%', gap: Spacing.md,
    borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: Spacing.xxl,
  },
  successInfoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  successInfoText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  doneButton: {
    backgroundColor: Colors.gold, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xxxl, paddingVertical: Spacing.lg,
  },
  doneButtonText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.black },
});
