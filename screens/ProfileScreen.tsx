import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, TextInput, Alert, ActivityIndicator, Platform, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuthActions } from '@convex-dev/auth/react';

type Props = {
  navigation: any;
  isGuest?: boolean;
  onSignIn?: () => void;
  appViewMode?: 'vip' | 'organiser' | 'admin';
  onChangeAppViewMode?: (mode: 'vip' | 'organiser' | 'admin') => void;
  membership?: {
    isAdmin: boolean;
    isApprovedOrganiser?: boolean;
    isPendingOrganiser?: boolean;
  } | null;
};

const membershipOptions = [
  {
    key: 'vip',
    title: 'VIP Member',
    fee: 'Free for 3 months',
    description:
      'Register now for free and enjoy VIP access during the launch period.',
    benefits: [
      'View Durban July week events and save favourites',
      'Create your own Durban July week itinerary',
      'Access ticket links and booking details',
      'Receive VIP-only app updates and experiences',
    ],
    accent: Colors.gold,
  },
  {
    key: 'organiser',
    title: 'Event Organiser',
    fee: 'Free for 3 months',
    description:
      'Apply to become an organiser. Approval is required before you can load or claim events in the app.',
    benefits: [
      'Create and manage your own event schedule for Durban July week',
      'Claim or load your approved events',
      'Upload and replace images for your own events after approval',
      'Access organiser tools and dashboard features',
    ],
    accent: Colors.greenLight,
  },
] as const;

export default function ProfileScreen({ navigation, isGuest, onSignIn, appViewMode, onChangeAppViewMode, membership }: Props) {
  const profile = useQuery(api.users.getProfile);
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const saveProfileImage = useMutation(api.users.saveProfileImage);
  const { signOut } = useAuthActions();
  const deleteAccountMutation = useMutation(api.users.deleteAccount);

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || profile.name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const loadImagePicker = useCallback(async () => {
    if (Platform.OS === 'web') {
      return null;
    }

    return await import('expo-image-picker');
  }, []);

  const uploadImage = useCallback(async (uri: string) => {
    try {
      setUploading(true);

      const uploadUrl = await generateUploadUrl();

      const response = await globalThis.fetch(uri);
      const blob = await response.blob();

      const uploadResponse = await globalThis.fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': blob.type || 'image/jpeg' },
        body: blob,
      });

      const { storageId } = await uploadResponse.json();
      await saveProfileImage({ storageId });
    } catch (e) {
      console.error('Image upload error:', e);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [generateUploadUrl, saveProfileImage]);

  const handleTakePhoto = useCallback(async () => {
    try {
      const ImagePicker = await loadImagePicker();
      if (!ImagePicker) {
        Alert.alert('Not available', 'Profile photo capture is only available on iOS and Android.');
        return;
      }

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow camera access to take a profile photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;
      await uploadImage(result.assets[0].uri);
    } catch (e) {
      console.error('Camera error:', e);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  }, [loadImagePicker, uploadImage]);

  const handleChooseFromLibrary = useCallback(async () => {
    try {
      const ImagePicker = await loadImagePicker();
      if (!ImagePicker) {
        Alert.alert('Not available', 'Photo library picking is only available on iOS and Android.');
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;
      await uploadImage(result.assets[0].uri);
    } catch (e) {
      console.error('Library error:', e);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  }, [loadImagePicker, uploadImage]);

  const handlePickImage = useCallback(() => {
    Alert.alert('Profile Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Library', onPress: handleChooseFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [handleTakePhoto, handleChooseFromLibrary]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateProfile({ displayName, bio });
      setEditing(false);
      Alert.alert('Success', 'Profile updated!');
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccountMutation();
              await signOut();
            } catch (e) {
              console.error('Delete account error', e);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderMembershipOptions = () => (
    <View style={styles.membershipSection}>
      <Text style={styles.sectionTitle}>Membership options</Text>
      <Text style={styles.membershipIntro}>
        Choose the membership that matches how you want to use the Durban July app.
      </Text>

      {membershipOptions.map((option) => (
        <View key={option.key} style={styles.membershipCard}>
          <View style={styles.membershipCardHeader}>
            <View style={[styles.membershipBadge, { borderColor: option.accent + '55', backgroundColor: option.accent + '14' }]}>
              <Ionicons
                name={option.key === 'vip' ? 'star-outline' : 'business-outline'}
                size={18}
                color={option.accent}
              />
              <Text style={[styles.membershipBadgeText, { color: option.accent }]}>{option.title}</Text>
            </View>
            <Text style={styles.membershipFee}>{option.fee}</Text>
          </View>

          <Text style={styles.membershipDescription}>{option.description}</Text>

          <View style={styles.benefitsList}>
            {option.benefits.map((benefit) => (
              <View key={benefit} style={styles.benefitRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color={option.accent} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <Text style={styles.membershipNote}>
        VIP members focus on discovery and booking. Organisers focus on claims and submissions. Admins can switch views to review both.
      </Text>
    </View>
  );

  const renderViewSwitcher = () => {
    if (!membership?.isAdmin || !appViewMode || !onChangeAppViewMode) return null;

    return (
      <View style={styles.viewSwitcherSection}>
        <Text style={styles.sectionTitle}>Switch view</Text>
        <Text style={styles.membershipIntro}>
          Preview the app as a VIP member, event organiser, or admin.
        </Text>
        <View style={styles.viewSwitcherRow}>
          {(['vip', 'organiser', 'admin'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.viewSwitcherBtn, appViewMode === mode && styles.viewSwitcherBtnActive]}
              onPress={() => onChangeAppViewMode(mode)}
              activeOpacity={0.85}
            >
              <Text style={[styles.viewSwitcherText, appViewMode === mode && styles.viewSwitcherTextActive]}>
                {mode === 'vip' ? 'VIP Member' : mode === 'organiser' ? 'Event Organiser' : 'Admin View'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderRoleGuide = () => {
    if (membership?.isAdmin) return null;

    return (
      <View style={styles.roleGuideCard}>
        <Ionicons
          name={membership?.isApprovedOrganiser || membership?.isPendingOrganiser ? 'business-outline' : 'star-outline'}
          size={22}
          color={membership?.isApprovedOrganiser || membership?.isPendingOrganiser ? Colors.greenLight : Colors.gold}
        />
        <View style={styles.roleGuideTextWrap}>
          <Text style={styles.roleGuideTitle}>
            {membership?.isApprovedOrganiser || membership?.isPendingOrganiser ? 'Organiser workspace' : 'VIP member workspace'}
          </Text>
          <Text style={styles.roleGuideText}>
            {membership?.isApprovedOrganiser || membership?.isPendingOrganiser
              ? 'Use Organiser Studio to claim events, submit new listings, and track approval status.'
              : 'Use Home, Events, Marquees, Stay, VIP services, and Account to plan your experience.'}
          </Text>
        </View>
      </View>
    );
  };

  const renderAdminAccess = () => {
    return (
      <View style={styles.adminAccessSection}>
        <Text style={styles.sectionTitle}>Team Admin Access</Text>
        <TouchableOpacity
          style={styles.adminAccessCard}
          onPress={() => navigation.navigate('AdminPin')}
          activeOpacity={0.85}
        >
          <View style={styles.adminAccessInner}>
            <View style={styles.adminAccessIconWrap}>
              <Ionicons name="shield-checkmark" size={22} color={Colors.gold} />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={styles.adminAccessTitle}>Admin Dashboard</Text>
              <Text style={styles.adminAccessDesc}>
                Open the admin access screen to continue.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gold} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Guest View
  if (isGuest) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.background }}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Account</Text>
          </View>
        </SafeAreaView>
        <ScrollView
          contentContainerStyle={styles.guestContent}
          showsVerticalScrollIndicator={false}
        >
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

          {renderMembershipOptions()}
          {renderViewSwitcher()}
          {renderRoleGuide()}
          {renderAdminAccess()}

          {/* VIP Services Quick Access */}
          <Text style={styles.sectionTitle}>VIP Services</Text>

          <View style={styles.servicesGrid}>
            {[
              { icon: 'car-sport-outline' as const, label: 'Transport', count: 5 },
              { icon: 'diamond-outline' as const, label: 'Concierge', count: 4 },
              { icon: 'ribbon-outline' as const, label: 'Sponsors', count: 'All' },
            ].map((s) => (
              <TouchableOpacity
                key={s.label}
                style={styles.serviceGridItem}
                onPress={() => {
                  if (s.label === 'Sponsors') {
                    navigation.getParent()?.navigate('Sponsors');
                    return;
                  }

                  navigation.getParent()?.navigate('ServicesTab');
                }}
                activeOpacity={0.8}
              >
                <View style={styles.serviceIconWrap}>
                  <Ionicons name={s.icon} size={24} color={Colors.gold} />
                </View>
                <Text style={styles.serviceGridLabel}>{s.label}</Text>
                <Text style={styles.serviceGridCount}>{typeof s.count === 'number' ? `${s.count} options` : s.label === 'Sponsors' ? 'View all logos' : 'View your schedule'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {renderMembershipOptions()}
          {renderAdminAccess()}
        </ScrollView>
      </View>
    );
  }

  // Loading
  if (profile === undefined) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  const avatarUri = profile?.profileImageUrl || profile?.image;
  const userName = profile?.displayName || profile?.name || 'User';
  const userEmail = profile?.email || '';

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

      <ScrollView
        contentContainerStyle={styles.profileContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} style={styles.avatarWrap}>
            {uploading ? (
              <View style={[styles.avatar, styles.center]}>
                <ActivityIndicator color={Colors.gold} />
              </View>
            ) : avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={40} color={Colors.textMuted} />
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>

          {!editing ? (
            <>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{userEmail}</Text>
              {profile?.bio ? <Text style={styles.profileBio}>{profile.bio}</Text> : null}
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

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.getParent()?.navigate('Theme')}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.gold + '20' }]}>
              <Ionicons name="sparkles" size={20} color={Colors.gold} />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={[styles.menuLabel, { color: Colors.gold }]}>2026 Durban July Theme</Text>
              <Text style={styles.menuDesc}>Country Allure - style guide & inspiration</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gold} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Transport')}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.green + '20' }]}>
              <Ionicons name="car-sport-outline" size={20} color={Colors.greenLight} />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={styles.menuLabel}>VIP Transport</Text>
              <Text style={styles.menuDesc}>Shuttles, chauffeurs & helicopter</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Stay')}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.goldLight + '30' }]}>
              <Ionicons name="bed" size={20} color={Colors.gold} />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={styles.menuLabel}>Accommodation</Text>
              <Text style={styles.menuDesc}>Hotels, villas & luxury stays</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Shopping')}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.gold + '15' }]}>
              <Ionicons name="shirt" size={20} color={Colors.gold} />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={styles.menuLabel}>Fashion & Shopping</Text>
              <Text style={styles.menuDesc}>Designer boutiques & stores</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.getParent()?.navigate('Sponsors')}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.gold + '20' }]}>
              <Ionicons name="ribbon-outline" size={20} color={Colors.gold} />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={styles.menuLabel}>Sponsors</Text>
              <Text style={styles.menuDesc}>All Durban July sponsor logos</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Concierge')}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.burgundy + '20' }]}>
              <Ionicons name="diamond-outline" size={20} color={Colors.burgundy} />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={styles.menuLabel}>VIP Concierge</Text>
              <Text style={styles.menuDesc}>Styling, photography & more</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('DurbanActivities')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#0891b2' + '20' }]}>
              <Ionicons name="compass-outline" size={20} color="#0891b2" />
            </View>
            <View style={styles.menuTextArea}>
              <Text style={styles.menuLabel}>What to Do in Durban</Text>
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

          {renderAdminAccess()}
        </View>

        {renderMembershipOptions()}
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

  // Membership
  membershipSection: {
    marginBottom: Spacing.xxl,
  },
  membershipIntro: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  membershipCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  membershipCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    flexShrink: 1,
  },
  membershipBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
  },
  membershipFee: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: '700',
    textAlign: 'right',
  },
  membershipDescription: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  benefitsList: {
    gap: Spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  benefitText: {
    flex: 1,
    color: Colors.white,
    fontSize: FontSizes.sm,
    lineHeight: 19,
  },
  membershipNote: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
    lineHeight: 18,
    marginTop: Spacing.sm,
  },
  viewSwitcherSection: {
    marginBottom: Spacing.xxl,
  },
  viewSwitcherRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  viewSwitcherBtn: {
    flexGrow: 1,
    minWidth: '30%',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  viewSwitcherBtnActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.gold + '15',
  },
  viewSwitcherText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
    fontWeight: '800',
    textAlign: 'center',
  },
  viewSwitcherTextActive: {
    color: Colors.gold,
  },
  roleGuideCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  roleGuideTextWrap: {
    flex: 1,
  },
  roleGuideTitle: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '800',
    marginBottom: 4,
  },
  roleGuideText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    lineHeight: 19,
  },

  // Guest styles
  guestContent: { padding: Spacing.xl, paddingBottom: Spacing.xxxl + 120 },
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
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  serviceGridItem: {
    width: '48%', backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.md,
  },
  serviceIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  serviceGridLabel: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.white, marginBottom: 2 },
  serviceGridCount: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  adminAccessSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  adminAccessCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.gold + '40',
    backgroundColor: Colors.surface,
  },
  adminAccessInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  adminAccessIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold + '30',
  },
  adminAccessTitle: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.white },
  adminAccessDesc: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  adminAccessSubtitle: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  // Profile styles
  profileContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl + 120 },
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

  // Edit form
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

  // Menu
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
  menuContent: { flex: 1 },
  menuTitle: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.white },
  menuSubtitle: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 1 },
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xxl,
    paddingVertical: Spacing.md,
  },
  privacyLinkText: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
  deleteAccountItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg, gap: Spacing.md,
    marginTop: Spacing.md, marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
});
