import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

const PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape',
];

const EVENT_TYPES = [
  'Music',
  'Sports',
  'Networking',
  'Corporate',
  'Fashion',
  'Food & Drink',
  'Family',
  'Other',
];

export default function MembershipOnboardingScreen({ profile }: { profile: any }) {
  const saveMembershipProfile = useMutation(api.users.saveMembershipProfile);
  const [role, setRole] = useState<'attendee' | 'organiser'>('attendee');
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [attendeeCompanyName, setAttendeeCompanyName] = useState(profile?.attendeeCompanyName || '');
  const [attendeeDesignation, setAttendeeDesignation] = useState(profile?.attendeeDesignation || '');
  const [attendeeAddress, setAttendeeAddress] = useState(profile?.attendeeAddress || '');
  const [attendeeCity, setAttendeeCity] = useState(profile?.attendeeCity || '');
  const [attendeeProvince, setAttendeeProvince] = useState(profile?.attendeeProvince || '');
  const [attendeeFavouriteEventType, setAttendeeFavouriteEventType] = useState(profile?.attendeeFavouriteEventType || '');
  const [companyName, setCompanyName] = useState(profile?.organiserCompanyName || '');
  const [contactPerson, setContactPerson] = useState(profile?.contactPerson || '');
  const [website, setWebsite] = useState(profile?.websiteOrSocialLink || '');
  const [description, setDescription] = useState(profile?.organiserDescription || '');
  const [loading, setLoading] = useState(false);
  const [provinceMenuOpen, setProvinceMenuOpen] = useState(false);
  const [eventTypeMenuOpen, setEventTypeMenuOpen] = useState(false);

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter your name.');
      return;
    }
    if (role === 'attendee' && (!attendeeCompanyName.trim() || !attendeeDesignation.trim() || !attendeeAddress.trim() || !attendeeCity.trim() || !attendeeProvince.trim() || !attendeeFavouriteEventType.trim())) {
      Alert.alert('Missing details', 'Please complete the attendee registration fields.');
      return;
    }
    if (role === 'organiser' && (!companyName.trim() || !contactPerson.trim() || !email.trim() || !phone.trim())) {
      Alert.alert('Missing details', 'Please complete the organiser registration fields.');
      return;
    }

    try {
      setLoading(true);
      await saveMembershipProfile({
        role,
        name: name.trim(),
        email: email.trim().toLowerCase() || undefined,
        phone: phone.trim() || undefined,
        attendeeCompanyName: role === 'attendee' ? attendeeCompanyName.trim() : undefined,
        attendeeDesignation: role === 'attendee' ? attendeeDesignation.trim() : undefined,
        attendeeAddress: role === 'attendee' ? attendeeAddress.trim() : undefined,
        attendeeCity: role === 'attendee' ? attendeeCity.trim() : undefined,
        attendeeProvince: role === 'attendee' ? attendeeProvince.trim() : undefined,
        attendeeFavouriteEventType: role === 'attendee' ? attendeeFavouriteEventType.trim() : undefined,
        organiserCompanyName: role === 'organiser' ? companyName.trim() : undefined,
        contactPerson: role === 'organiser' ? contactPerson.trim() : undefined,
        websiteOrSocialLink: role === 'organiser' ? website.trim() || undefined : undefined,
        organiserDescription: role === 'organiser' ? description.trim() || undefined : undefined,
      });
    } catch (e: any) {
      Alert.alert('Registration failed', e?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Choose your membership</Text>
      <Text style={styles.subtitle}>Select how you want to use the Durban July app.</Text>

      <TouchableOpacity style={[styles.card, role === 'attendee' && styles.cardActive]} onPress={() => setRole('attendee')} activeOpacity={0.85}>
        <Text style={styles.cardTitle}>Continue as Attendee</Text>
        <Text style={styles.cardText}>Browse events, save favourites, and buy tickets or booking links.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, role === 'organiser' && styles.cardActive]} onPress={() => setRole('organiser')} activeOpacity={0.85}>
        <Text style={styles.cardTitle}>Register as Event Organiser</Text>
        <Text style={styles.cardText}>Apply for organiser access to create and manage your own events.</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={Colors.textMuted} />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={Colors.textMuted} autoCapitalize="none" keyboardType="email-address" />

      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor={Colors.textMuted} keyboardType="phone-pad" />

      {role === 'attendee' && (
        <>
          <Text style={styles.sectionTitle}>Attendee details</Text>

          <Text style={styles.label}>Company name</Text>
          <TextInput style={styles.input} value={attendeeCompanyName} onChangeText={setAttendeeCompanyName} placeholder="Company name" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.label}>Designation</Text>
          <TextInput style={styles.input} value={attendeeDesignation} onChangeText={setAttendeeDesignation} placeholder="Job title or designation" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.label}>Full address</Text>
          <TextInput style={[styles.input, styles.textArea]} value={attendeeAddress} onChangeText={setAttendeeAddress} placeholder="Street address, suburb, postal code" placeholderTextColor={Colors.textMuted} multiline />

          <Text style={styles.label}>City</Text>
          <TextInput style={styles.input} value={attendeeCity} onChangeText={setAttendeeCity} placeholder="City" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.label}>Province</Text>
          <TouchableOpacity style={styles.select} onPress={() => { setEventTypeMenuOpen(false); setProvinceMenuOpen(!provinceMenuOpen); }} activeOpacity={0.85}>
            <Text style={[styles.selectText, !attendeeProvince && styles.placeholderText]}>{attendeeProvince || 'Select province'}</Text>
            <Text style={styles.selectChevron}>⌄</Text>
          </TouchableOpacity>
          {provinceMenuOpen && (
            <View style={styles.dropdown}>
              {PROVINCES.map((province) => (
                <TouchableOpacity
                  key={province}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setAttendeeProvince(province);
                    setProvinceMenuOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownItemText}>{province}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Favourite event type</Text>
          <TouchableOpacity style={styles.select} onPress={() => { setProvinceMenuOpen(false); setEventTypeMenuOpen(!eventTypeMenuOpen); }} activeOpacity={0.85}>
            <Text style={[styles.selectText, !attendeeFavouriteEventType && styles.placeholderText]}>{attendeeFavouriteEventType || 'Select favourite event type'}</Text>
            <Text style={styles.selectChevron}>⌄</Text>
          </TouchableOpacity>
          {eventTypeMenuOpen && (
            <View style={styles.dropdown}>
              {EVENT_TYPES.map((eventType) => (
                <TouchableOpacity
                  key={eventType}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setAttendeeFavouriteEventType(eventType);
                    setEventTypeMenuOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownItemText}>{eventType}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

      {role === 'organiser' && (
        <>
          <Text style={styles.sectionTitle}>Organiser details</Text>
          <Text style={styles.label}>Organiser / company name</Text>
          <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} placeholder="Company name" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.label}>Contact person</Text>
          <TextInput style={styles.input} value={contactPerson} onChangeText={setContactPerson} placeholder="Contact person" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.label}>Website or social link</Text>
          <TextInput style={styles.input} value={website} onChangeText={setWebsite} placeholder="Optional" placeholderTextColor={Colors.textMuted} autoCapitalize="none" />

          <Text style={styles.label}>Short description</Text>
          <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Tell us about your events" placeholderTextColor={Colors.textMuted} multiline />
          <Text style={styles.helper}>Approval status defaults to pending.</Text>
        </>
      )}

      <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleContinue} disabled={loading} activeOpacity={0.85}>
        {loading ? <ActivityIndicator color={Colors.black} /> : <Text style={styles.buttonText}>Continue</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xxl, paddingTop: 56, paddingBottom: 40 },
  title: { color: Colors.white, fontSize: FontSizes.xxxl, fontWeight: '800', marginBottom: Spacing.sm },
  subtitle: { color: Colors.textSecondary, marginBottom: Spacing.xl, lineHeight: 20 },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  cardActive: { borderColor: Colors.gold, backgroundColor: Colors.gold + '12' },
  cardTitle: { color: Colors.white, fontWeight: '800', fontSize: FontSizes.md, marginBottom: 4 },
  cardText: { color: Colors.textSecondary, fontSize: FontSizes.sm, lineHeight: 20 },
  sectionTitle: { color: Colors.gold, fontSize: FontSizes.sm, fontWeight: '800', marginTop: Spacing.lg, marginBottom: Spacing.xs, textTransform: 'uppercase' },
  label: { color: Colors.textSecondary, fontSize: FontSizes.xs, fontWeight: '700', marginTop: Spacing.md, marginBottom: 6 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    color: Colors.white,
    fontSize: FontSizes.md,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  helper: { color: Colors.textSecondary, marginTop: 6, fontSize: FontSizes.xs },
  select: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    flex: 1,
    marginRight: Spacing.sm,
  },
  placeholderText: {
    color: Colors.textMuted,
  },
  selectChevron: {
    color: Colors.textSecondary,
    fontSize: FontSizes.lg,
    marginTop: -2,
  },
  dropdown: {
    marginTop: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  dropdownItemText: {
    color: Colors.white,
    fontSize: FontSizes.md,
  },
  button: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.gold,
    paddingVertical: 15,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  buttonText: { color: Colors.black, fontWeight: '800', fontSize: FontSizes.md },
});