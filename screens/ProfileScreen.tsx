import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppData } from '../lib/appState';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { transport, conciergeServices } from '../lib/data';

type Props = {
  navigation: any;
  isGuest?: boolean;
  onSignIn?: () => void;
};

export default function ProfileScreen({ navigation, isGuest, onSignIn }: Props) {
  const { currentUser, signOut, updateProfile } = useAppData();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || currentUser.name || '');
      setBio(currentUser.bio || '');
      setProfileImageUrl(currentUser.profileImageUrl || '');
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateProfile({ displayName, bio, profileImageUrl });
      setEditing(false);
      Alert.alert('Success', 'Profile updated.');
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (e) {
            console.log('Sign out error', e);
          }
        },
      },
    ]);
  };

  if (isGuest) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.background }}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Account</Text>
          </View>
        </SafeAreaView>
        <ScrollView contentContainerStyle={styles.guestContent} showsVerticalScrollIndicator={false}>
          <View style={styles.guestCard}>
            <View style={styles.guestIconBadge}>
              <Ionicons name="person-outline" size={36} color={Colors.gold} />
            </View>
            <Text style={styles.guestTitle}>You're Exploring as a Guest</Text>
            <Text style={styles.guestDesc}>
              Create an account to save your inquiries, get personalized recommendations, and manage your Durban July experience.
            </Text>

            <TouchableOpacity style={styles.signInGoldBtn} onPress={onSignIn} activeOpacity={0.85}>
              <Text style={styles.signInGoldBtnText}>Sign In or Register</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>VIP Services</Text>

          <View style={styles.servicesGrid}>
            {[
              { icon: 'car-sport-outline' as const, label: 'Transport', count: transport.length },
              { icon: 'diamond-outline' as const, label: 'Concierge', count: conciergeServices.length },
            ].map((service) => (
              <TouchableOpacity
                key={service.label}
                style={styles.serviceGridItem}
                onPress={() => navigation.getParent()?.navigate('ServicesTab')}
                activeOpacity={0.8}
              >
                <LinearGradient colors={[Colors.green, Colors.greenDark]} style={styles.serviceIconWrap}>
                  <Ionicons name={service.icon} size={24} color={Colors.gold} />
                </LinearGradient>
                <Text style={styles.serviceGridLabel}>{service.label}</Text>
                <Text style={styles.serviceGridCount}>{service.count} options</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  const avatarUri = currentUser.profileImageUrl;
  const userName = currentUser.displayName || currentUser.name || 'User';
  const userEmail = currentUser.email || '';

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.background }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          {!editing ? (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Ionicons name="create-outline" size={22} color={Colors.gold} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setEditing(false)}>
              <Text style={{ color: Colors.textSecondary, fontSize: FontSizes.sm }}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.profileContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={40} color={Colors.textMuted} />
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Ionicons name="globe-outline" size={16} color={Colors.white} />
            </View>
          </View>

          {!editing ? (
            <>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{userEmail}</Text>
              {currentUser.bio ? <Text style={styles.profileBio}>{currentUser.bio}</Text> : null}
            </>
          ) : (
            <View style={styles.editForm}>
              <View style={styles.editInputWrap}>
                <Text style={styles.editLabel}>Display Name</Text>
                <TextInput
                  style={styles.editInput}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your name"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.editInputWrap}>
                <Text style={styles.editLabel}>Bio</Text>
                <TextInput
                  style={[styles.editInput, styles.editTextarea]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                />
              </View>
              <View style={styles.editInputWrap}>
                <Text style={styles.editLabel}>Profile Image URL</Text>
                <TextInput
                  style={styles.editInput}
                  value={profileImageUrl}
                  onChangeText={setProfileImageUrl}
                  placeholder="https://..."
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSaveProfile}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.black} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Theme')}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.gold + '20' }]}>
              <Ionicons name="sparkles" size={20} color={Colors.gold} />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={[styles.menuLabel, { color: Colors.gold }]}>2026 Durban July Theme</Text>
              <Text style={styles.menuDesc}>Country Allure - style guide & inspiration</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gold} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Transport')}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.green + '20' }]}>
              <Ionicons name="car-sport-outline" size={20} color={Colors.greenLight} />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={styles.menuLabel}>VIP Transport</Text>
              <Text style={styles.menuDesc}>Shuttles, chauffeurs & helicopter</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Stay')}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.goldLight + '30' }]}>
              <Ionicons name="bed" size={20} color={Colors.gold} />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={styles.menuLabel}>Accommodation</Text>
              <Text style={styles.menuDesc}>Hotels, villas & luxury stays</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Shopping')}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.gold + '15' }]}>
              <Ionicons name="shirt" size={20} color={Colors.gold} />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={styles.menuLabel}>Fashion & Shopping</Text>
              <Text style={styles.menuDesc}>Designer boutiques & stores</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Concierge')}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.burgundy + '20' }]}>
              <Ionicons name="diamond-outline" size={20} color={Colors.burgundy} />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={styles.menuLabel}>VIP Concierge</Text>
              <Text style={styles.menuDesc}>Styling, photography & more</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('DurbanActivities')}>
            <View style={[styles.menuIcon, { backgroundColor: '#0891b2' + '20' }]}>
              <Ionicons name="compass-outline" size={20} color="#0891b2" />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={styles.menuLabel}>What to Enjoy in Durban</Text>
              <Text style={styles.menuDesc}>Leisure, attractions & adventures</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.red + '15' }]}>
              <Ionicons name="log-out-outline" size={20} color={Colors.red} />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={[styles.menuLabel, { color: Colors.red }]}>Sign Out</Text>
              <Text style={styles.menuDesc}>See you at the July!</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AdminPin')}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.charcoal }]}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.textMuted} />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={[styles.menuLabel, { color: Colors.textMuted }]}>Admin Dashboard</Text>
              <Text style={styles.menuDesc}>Super admin access</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.md,
  },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.white },
  guestContent: { padding: Spacing.xl },
  guestCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: Spacing.xxl, alignItems: 'center', marginBottom: Spacing.xxl,
  },
  guestIconBadge: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.gold + '12', borderWidth: 1.5, borderColor: Colors.gold + '30',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  guestTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.white, marginBottom: Spacing.sm, textAlign: 'center' },
  guestDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xxl },
  signInGoldBtn: {
    backgroundColor: Colors.gold, borderRadius: BorderRadius.md,
    paddingVertical: 14, paddingHorizontal: Spacing.xxxl,
    width: '100%', alignItems: 'center',
  },
  signInGoldBtnText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.black },
  sectionTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.white, marginBottom: Spacing.lg },
  servicesGrid: { flexDirection: 'row', gap: Spacing.md },
  serviceGridItem: {
    flex: 1, backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: Spacing.lg, alignItems: 'center',
  },
  serviceIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  serviceGridLabel: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.white, marginBottom: 2 },
  serviceGridCount: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  profileContent: { paddingHorizontal: Spacing.xl },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.xxl },
  avatarWrap: { position: 'relative', marginBottom: Spacing.lg },
  avatar: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 3, borderColor: Colors.gold,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
  },
  cameraOverlay: {
    position: 'absolute', bottom: 2, right: 2,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.background,
  },
  profileName: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.white, marginBottom: 2 },
  profileEmail: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  profileBio: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  editForm: { width: '100%', gap: Spacing.lg, marginTop: Spacing.md },
  editInputWrap: {},
  editLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.xs },
  editInput: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.lg, paddingVertical: 14,
    color: Colors.white, fontSize: FontSizes.md,
  },
  editTextarea: { height: 80, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: Colors.gold, borderRadius: BorderRadius.md,
    paddingVertical: 14, alignItems: 'center',
  },
  saveBtnText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.black },
  menuSection: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg, gap: Spacing.md,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  menuTextArea: { flex: 1 },
  menuLabel: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.white },
  menuDesc: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 1 },
  menuDivider: { height: 1, backgroundColor: Colors.cardBorder, marginHorizontal: Spacing.lg },
});
