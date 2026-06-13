import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import * as ImagePicker from 'expo-image-picker';
import AdaptiveImage from '../components/AdaptiveImage';

const blankForm = { name: '', date: '', time: '', venue: '', location: '', category: 'Party', description: '', price: '', priceValue: '0', highlights: '', image: '', images: ['', '', '', '', ''] };

type Props = {
  appViewMode?: 'vip' | 'organiser' | 'admin';
  onChangeAppViewMode?: (mode: 'vip' | 'organiser' | 'admin') => void;
};

export default function OrganizerStudioScreen({ appViewMode, onChangeAppViewMode }: Props) {
  const profile = useQuery(api.users.getProfile);
  const membership = useQuery(api.users.getMembershipState);
  const eventsQuery = useQuery(api.admin.getEvents);
  const requestsQuery = useQuery(api.admin.getMyOrganizerRequests);
  const events = useMemo(() => eventsQuery ?? [], [eventsQuery]);
  const myRequests = useMemo(() => requestsQuery ?? [], [requestsQuery]);
  const createOrganizerRequest = useMutation(api.admin.createOrganizerRequest);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(blankForm);

  const setFormImage = (index: number, value: string) => {
    setForm((current: typeof blankForm) => {
      const images = [...current.images];
      images[index] = value;
      return { ...current, images, image: images.find((item) => item.trim()) || '' };
    });
  };

  const moveFormImage = (fromIndex: number, toIndex: number) => {
    setForm((current: typeof blankForm) => {
      const images = [...current.images];
      const [moved] = images.splice(fromIndex, 1);
      images.splice(toIndex, 0, moved);
      return { ...current, images, image: images.find((item) => item.trim()) || '' };
    });
  };

  const removeFormImage = (index: number) => {
    setForm((current: typeof blankForm) => {
      const images = [...current.images];
      images[index] = '';
      return { ...current, images, image: images.find((item) => item.trim()) || '' };
    });
  };

  const pickFormImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 0.85 });
    if (result.canceled || !result.assets?.[0]) return;
    setFormImage(index, result.assets[0].uri);
  };

  const uploadImage = async (index: number) => {
    if (!approved) {
      Alert.alert('Not approved', 'Please wait for approval before uploading event images.');
      return;
    }
    await pickFormImage(index);
  };

  const submitClaim = async (event: any) => {
    try {
      setLoading(true);
      await createOrganizerRequest({
        type: 'claim',
        eventId: event._id,
        eventName: event.name,
      });
      Alert.alert('Submitted', 'Your claim has been sent for admin review.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to submit claim.');
    } finally {
      setLoading(false);
    }
  };

  const saveForm = async () => {
    if (!form.name.trim() || !form.date.trim()) {
      Alert.alert('Missing fields', 'Event name and date are required.');
      return;
    }
    const images = form.images.map((item: string) => item.trim()).filter(Boolean).slice(0, 5);
    try {
      setLoading(true);
      await createOrganizerRequest({
        type: 'create',
        name: form.name.trim(),
        date: form.date.trim(),
        time: form.time.trim(),
        venue: form.venue.trim(),
        location: form.location.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        price: form.price.trim(),
        priceValue: Number(form.priceValue) || 0,
        highlights: form.highlights.split(',').map((s: string) => s.trim()).filter(Boolean),
        image: images[0],
        images,
      });
      setShowEditor(false);
      setForm(blankForm);
      Alert.alert('Submitted', 'Your new event has been sent for admin review.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to submit event.');
    } finally {
      setLoading(false);
    }
  };

  const isAdminPreview = appViewMode === 'organiser' && profile?.role === 'admin';
  const approved = ((profile?.role === 'organiser' && profile?.organiserStatus === 'approved') || isAdminPreview) && appViewMode !== 'vip';
  const pending = profile?.role === 'organiser' && profile?.organiserStatus !== 'approved' && !isAdminPreview;

  const requestsByEventId = useMemo(() => {
    const map = new Map<string, (typeof myRequests)[number]>();
    for (const request of myRequests) {
      if (request.eventId && request.type === 'claim') {
        map.set(String(request.eventId), request);
      }
    }
    return map;
  }, [myRequests]);

  const requestCounts = useMemo(() => ({
    pending: myRequests.filter((request: (typeof myRequests)[number]) => request.status === 'pending').length,
    approved: myRequests.filter((request: (typeof myRequests)[number]) => request.status === 'approved').length,
    rejected: myRequests.filter((request: (typeof myRequests)[number]) => request.status === 'rejected').length,
  }), [myRequests]);

  if (profile === undefined || membership === undefined) {
    return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={Colors.gold} /></View>;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Organiser Studio</Text>
          {isAdminPreview ? <Text style={styles.previewBanner}>Admin preview: organiser view</Text> : null}
          {pending ? <Text style={styles.previewBanner}>Pending organiser access</Text> : null}
        </View>
        <TouchableOpacity onPress={() => { setForm(blankForm); setShowEditor(true); }}>
          <Ionicons name="add-circle" size={26} color={Colors.gold} />
        </TouchableOpacity>
      </SafeAreaView>

      <FlatList
        data={events}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 120 }}
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>Organiser access</Text>
              <Text style={styles.heroTitle}>Claim a listed event or submit a new one</Text>
              <Text style={styles.heroText}>
                Every claim or new event request is reviewed by admin before it becomes active.
              </Text>
              <Text style={styles.heroText}>
                Organisers should use this section for claims, submissions, and tracking approvals. Admins can preview this same flow in organiser mode.
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statCard}><Text style={styles.statValue}>{requestCounts.pending}</Text><Text style={styles.statLabel}>Pending</Text></View>
                <View style={styles.statCard}><Text style={styles.statValue}>{requestCounts.approved}</Text><Text style={styles.statLabel}>Approved</Text></View>
                <View style={styles.statCard}><Text style={styles.statValue}>{requestCounts.rejected}</Text><Text style={styles.statLabel}>Declined</Text></View>
              </View>
            </View>

            {pending ? (
              <View style={styles.noticeCard}>
                <Ionicons name="time-outline" size={20} color={Colors.gold} />
                <Text style={styles.noticeText}>Your organiser registration is still being reviewed. You can submit claims and new events now, but they will only go live after approval.</Text>
              </View>
            ) : null}

            {myRequests.length > 0 ? (
              <View style={styles.requestSection}>
                <Text style={styles.sectionTitle}>My submissions</Text>
                {myRequests.map((request: (typeof myRequests)[number]) => (
                  <View key={request._id} style={styles.requestCard}>
                    <View style={styles.requestHeader}>
                      <Text style={styles.requestTitle}>{request.type === 'claim' ? request.eventName || 'Event claim' : request.name || 'New event request'}</Text>
                      <View style={[styles.statusPill, request.status === 'approved' ? styles.statusApproved : request.status === 'rejected' ? styles.statusRejected : styles.statusPending]}>
                        <Text style={styles.statusText}>{request.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.requestMeta}>{request.type === 'claim' ? 'Claim request' : 'New event submission'}</Text>
                    {request.adminNotes ? <Text style={styles.requestNotes}>{request.adminNotes}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Claim a listed event</Text>
              <Text style={styles.sectionSubtitle}>Choose one event from the public list and request ownership.</Text>
            </View>
          </>
        }
        renderItem={({ item }: any) => {
          const existingRequest = requestsByEventId.get(String(item._id));
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardText}>{item.date} · {item.time}</Text>
              <Text style={styles.cardText}>{item.venue}</Text>
              {item.image ? <AdaptiveImage source={{ uri: item.image }} style={styles.cardImage} /> : null}
              <View style={styles.cardFooter}>
                <View style={[styles.statusPill, existingRequest ? existingRequest.status === 'approved' ? styles.statusApproved : existingRequest.status === 'rejected' ? styles.statusRejected : styles.statusPending : styles.statusIdle]}>
                  <Text style={styles.statusText}>{existingRequest ? existingRequest.status.toUpperCase() : 'AVAILABLE'}</Text>
                </View>
                <TouchableOpacity style={[styles.claimBtn, existingRequest && styles.claimBtnDisabled]} onPress={() => submitClaim(item)} disabled={loading || Boolean(existingRequest)}>
                  <Text style={styles.claimBtnText}>{existingRequest ? 'Requested' : 'Claim event'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<View style={[styles.center, { paddingTop: 80 }]}><Text style={styles.pendingText}>No listed events yet.</Text></View>}
      />

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowEditor(true)}>
          <Ionicons name="add" size={16} color={Colors.black} />
          <Text style={styles.primaryBtnText}>Add new event request</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showEditor} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <SafeAreaView edges={['top']}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowEditor(false)}><Text style={styles.modalText}>Cancel</Text></TouchableOpacity>
                <Text style={styles.modalTitle}>New Event Request</Text>
                <TouchableOpacity onPress={saveForm}><Text style={styles.modalText}>{loading ? 'Submitting...' : 'Submit'}</Text></TouchableOpacity>
              </View>
            </SafeAreaView>
            <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
              {(['name','date','time','venue','location','category','description','price','priceValue','highlights'] as const).map((field) => (
                <View key={field} style={{ marginBottom: 12 }}>
                  <Text style={styles.label}>{field}</Text>
                  <TextInput style={styles.input} value={String((form as any)[field])} onChangeText={(text: string) => setForm((current: typeof form) => ({ ...current, [field]: text }))} placeholderTextColor={Colors.textMuted} />
                </View>
              ))}
              <Text style={styles.label}>Event images (up to 5)</Text>
              <Text style={styles.bulkHint}>Add, move, or replace the five carousel images for this event. The first image is the cover image.</Text>
              <View style={styles.carouselEditor}>
                {form.images.map((imageUri: string, index: number) => (
                  <View key={`${index}-${imageUri || 'empty'}`} style={styles.carouselSlot}>
                    <View style={styles.carouselPreviewWrap}>
                      {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.carouselPreview} resizeMode="contain" />
                      ) : (
                        <View style={styles.carouselEmpty}><Ionicons name="image-outline" size={22} color={Colors.textMuted} /></View>
                      )}
                    </View>
                    <TextInput
                      style={styles.input}
                      value={imageUri}
                      onChangeText={(text: string) => setFormImage(index, text)}
                      placeholder={`Image ${index + 1} URL`}
                      placeholderTextColor={Colors.textMuted}
                    />
                    <View style={styles.carouselActions}>
                      <TouchableOpacity style={styles.carouselActionBtn} onPress={() => pickFormImage(index)}><Ionicons name="image" size={16} color={Colors.gold} /></TouchableOpacity>
                      <TouchableOpacity style={styles.carouselActionBtn} onPress={() => uploadImage(index)}><Ionicons name="cloud-upload" size={16} color={Colors.greenLight} /></TouchableOpacity>
                      <TouchableOpacity style={styles.carouselActionBtn} onPress={() => index > 0 && moveFormImage(index, index - 1)} disabled={index === 0}><Ionicons name="arrow-up" size={16} color={index === 0 ? Colors.textMuted : Colors.white} /></TouchableOpacity>
                      <TouchableOpacity style={styles.carouselActionBtn} onPress={() => index < form.images.length - 1 && moveFormImage(index, index + 1)} disabled={index === form.images.length - 1}><Ionicons name="arrow-down" size={16} color={index === form.images.length - 1 ? Colors.textMuted : Colors.white} /></TouchableOpacity>
                      <TouchableOpacity style={styles.carouselActionBtn} onPress={() => removeFormImage(index)}><Ionicons name="close" size={16} color={Colors.red} /></TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  title: { color: Colors.white, fontSize: FontSizes.xl, fontWeight: '800' },
  previewBanner: { color: Colors.greenLight, fontSize: FontSizes.xs, fontWeight: '700', marginTop: 2 },
  heroCard: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  heroLabel: { color: Colors.gold, fontSize: FontSizes.xs, fontWeight: '700', textTransform: 'uppercase' },
  heroTitle: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: '800', marginTop: 6 },
  heroText: { color: Colors.textSecondary, fontSize: FontSizes.sm, lineHeight: 20, marginTop: 8 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.md, alignItems: 'center' },
  statValue: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: FontSizes.xs, marginTop: 4 },
  requestSection: { marginBottom: Spacing.md },
  requestCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  requestHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  requestTitle: { color: Colors.white, fontWeight: '800', flex: 1 },
  requestMeta: { color: Colors.textSecondary, fontSize: FontSizes.xs, marginTop: 4 },
  requestNotes: { color: Colors.textSecondary, fontSize: FontSizes.xs, marginTop: 6, lineHeight: 18 },
  noticeCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.gold + '15', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.gold + '30', padding: Spacing.md, marginBottom: Spacing.md },
  noticeText: { flex: 1, color: Colors.white, fontSize: FontSizes.xs, lineHeight: 18 },
  sectionHead: { marginBottom: Spacing.md },
  sectionTitle: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: '800' },
  sectionSubtitle: { color: Colors.textSecondary, fontSize: FontSizes.xs, marginTop: 4 },
  card: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  cardTitle: { color: Colors.white, fontWeight: '800', fontSize: FontSizes.md, marginBottom: 4 },
  cardText: { color: Colors.textSecondary, fontSize: FontSizes.xs, marginTop: 2 },
  cardImage: { width: '100%', borderRadius: 12, marginTop: 10, backgroundColor: 'transparent' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm, marginTop: Spacing.md },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusIdle: { backgroundColor: Colors.surface },
  statusPending: { backgroundColor: Colors.gold + '20' },
  statusApproved: { backgroundColor: Colors.green + '20' },
  statusRejected: { backgroundColor: Colors.red + '20' },
  statusText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  claimBtn: { backgroundColor: Colors.gold, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 10 },
  claimBtnDisabled: { opacity: 0.55 },
  claimBtnText: { color: Colors.black, fontWeight: '800', fontSize: FontSizes.xs },
  bottomActions: { position: 'absolute', left: Spacing.lg, right: Spacing.lg, bottom: 24 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.gold, borderRadius: BorderRadius.md, paddingVertical: 14 },
  primaryBtnText: { color: Colors.black, fontWeight: '800' },
  pendingTitle: { color: Colors.white, fontSize: FontSizes.xl, fontWeight: '800', marginTop: 16, textAlign: 'center' },
  pendingText: { color: Colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background, maxHeight: '90%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  modalTitle: { color: Colors.white, fontWeight: '800' },
  modalText: { color: Colors.gold, fontWeight: '700' },
  label: { color: Colors.textSecondary, fontSize: FontSizes.xs, fontWeight: '700', marginBottom: 6 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 12, color: Colors.white },
  uploadBtn: { backgroundColor: Colors.gold, borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  uploadBtnText: { color: Colors.black, fontWeight: '800' },
  carouselEditor: { gap: 12, marginTop: 8, marginBottom: 8 },
  carouselSlot: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: BorderRadius.lg, padding: Spacing.md, gap: 10 },
  carouselPreviewWrap: { width: '100%' },
  carouselPreview: { width: '100%', height: 150, borderRadius: BorderRadius.md, backgroundColor: Colors.card, objectFit: 'contain' },
  carouselEmpty: { width: '100%', height: 150, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.card },
  carouselActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  carouselActionBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  bulkHint: { color: Colors.textSecondary, fontSize: FontSizes.xs, marginTop: 4, marginBottom: 4 },
});
