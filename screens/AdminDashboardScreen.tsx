import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  Alert, Modal, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppData } from '../lib/appState';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { EventItem, events as staticEvents } from '../lib/data';

type Tab = 'events' | 'members';

const EVENT_CATEGORIES = ['Race Day', 'Party', 'Fashion', 'Concert', 'Lifestyle', 'After Party'];

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const {
    adminEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    seedEvents,
    members,
    addMember,
    deleteMember,
    bulkAddMembers,
  } = useAppData();
  const [tab, setTab] = useState<Tab>('events');

  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Event form
  const [eventForm, setEventForm] = useState({
    name: '', date: '', time: '', venue: '', location: '',
    category: 'Race Day', description: '', price: '', priceValue: '0',
    highlights: '', image: '',
  });

  // Member form
  const [memberForm, setMemberForm] = useState({ name: '', email: '', phone: '' });
  const [bulkText, setBulkText] = useState('');

  const resetEventForm = () => {
    setEventForm({
      name: '', date: '', time: '', venue: '', location: '',
      category: 'Race Day', description: '', price: '', priceValue: '0',
      highlights: '', image: '',
    });
    setEditingEvent(null);
  };

  const handleSeedEvents = async () => {
    Alert.alert(
      'Seed Events',
      `Import ${staticEvents.length} events from app data into the admin database?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: async () => {
            try {
              setLoading(true);
              const mapped = staticEvents.map(e => ({
                name: e.name, date: e.date, time: e.time,
                venue: e.venue, location: e.location, category: e.category,
                description: e.description, price: e.price, priceValue: e.priceValue,
                highlights: e.highlights, image: e.image,
              }));
              const count = await seedEvents({ events: mapped });
              if (count > 0) {
                Alert.alert('Success', `Imported ${count} events.`);
              } else {
                Alert.alert('Info', 'Events already exist. No new events imported.');
              }
            } catch (e) {
              Alert.alert('Error', 'Failed to seed events.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name, date: event.date, time: event.time,
      venue: event.venue, location: event.location, category: event.category,
      description: event.description, price: event.price,
      priceValue: String(event.priceValue), highlights: event.highlights.join(', '),
      image: event.image,
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.name || !eventForm.date) {
      Alert.alert('Error', 'Name and date are required.');
      return;
    }
    try {
      setLoading(true);
      const data = {
        name: eventForm.name, date: eventForm.date, time: eventForm.time,
        venue: eventForm.venue, location: eventForm.location,
        category: eventForm.category as EventItem['category'], description: eventForm.description,
        price: eventForm.price, priceValue: Number(eventForm.priceValue) || 0,
        highlights: eventForm.highlights.split(',').map(s => s.trim()).filter(Boolean),
        image: eventForm.image || 'https://api.a0.dev/assets/image?text=durban+july+event&aspect=16:9',
      };
      if (editingEvent) {
        await updateEvent({ id: editingEvent._id, ...data });
        Alert.alert('Success', 'Event updated.');
      } else {
        await createEvent(data);
        Alert.alert('Success', 'Event created.');
      }
      setShowEventModal(false);
      resetEventForm();
    } catch (e) {
      Alert.alert('Error', 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = (event: any) => {
    Alert.alert('Delete Event', `Delete "${event.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try { await deleteEvent({ id: event._id }); }
          catch (e) { Alert.alert('Error', 'Failed to delete.'); }
        },
      },
    ]);
  };

  const handleToggleActive = async (event: any) => {
    try {
      await updateEvent({ id: event._id, isActive: !event.isActive });
    } catch (e) {
      Alert.alert('Error', 'Failed to update event status.');
    }
  };

  // Member handlers
  const handleAddMember = async () => {
    if (!memberForm.name) {
      Alert.alert('Error', 'Name is required.');
      return;
    }
    try {
      setLoading(true);
      await addMember({
        name: memberForm.name,
        email: memberForm.email || undefined,
        phone: memberForm.phone || undefined,
      });
      setMemberForm({ name: '', email: '', phone: '' });
      setShowMemberModal(false);
      Alert.alert('Success', 'Member added.');
    } catch (e) {
      Alert.alert('Error', 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = (member: any) => {
    Alert.alert('Remove Member', `Remove "${member.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try { await deleteMember({ id: member._id }); }
          catch (e) { Alert.alert('Error', 'Failed to remove.'); }
        },
      },
    ]);
  };

  const handleBulkImport = async () => {
    if (!bulkText.trim()) {
      Alert.alert('Error', 'Please paste member data.');
      return;
    }
    try {
      setLoading(true);
      const lines = bulkText.trim().split('\n').filter(Boolean);
      const parsed = lines.map(line => {
        const parts = line.split(/[,\t]/).map(s => s.trim());
        return {
          name: parts[0] || 'Unknown',
          email: parts[1] || undefined,
          phone: parts[2] || undefined,
        };
      });
      const count = await bulkAddMembers({ members: parsed });
      setBulkText('');
      setShowBulkModal(false);
      Alert.alert('Success', `Imported ${count} members.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to import members.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportContacts = async () => {
    Alert.alert(
      'Not Available on Web',
      'Contact import is not available in this standalone web build. Use bulk paste instead.'
    );
  };

  const filteredEvents = adminEvents.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==================== RENDER ====================

  const renderEventItem = ({ item }: { item: any }) => (
    <View style={[styles.card, !item.isActive && styles.cardInactive]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardSub}>{item.date}</Text>
          <View style={styles.cardMeta}>
            <View style={[styles.badge, !item.isActive && styles.badgeInactive]}>
              <Text style={styles.badgeText}>
                {item.isActive ? item.category : 'Inactive'}
              </Text>
            </View>
            <Text style={styles.cardPrice}>{item.price}</Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => handleToggleActive(item)}
            style={[styles.actionBtn, { backgroundColor: item.isActive ? Colors.green + '20' : Colors.red + '20' }]}
          >
            <Ionicons
              name={item.isActive ? 'eye' : 'eye-off'}
              size={16}
              color={item.isActive ? Colors.greenLight : Colors.red}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleEditEvent(item)}
            style={[styles.actionBtn, { backgroundColor: Colors.gold + '20' }]}
          >
            <Ionicons name="pencil" size={16} color={Colors.gold} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteEvent(item)}
            style={[styles.actionBtn, { backgroundColor: Colors.red + '15' }]}
          >
            <Ionicons name="trash" size={16} color={Colors.red} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderMemberItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberInitial}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {item.email ? <Text style={styles.cardSub}>{item.email}</Text> : null}
          {item.phone ? <Text style={styles.cardSub}>{item.phone}</Text> : null}
        </View>
        <View style={styles.cardActions}>
          <View style={[styles.statusBadge, item.status === 'active' ? styles.statusActive : styles.statusInvited]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteMember(item)}
            style={[styles.actionBtn, { backgroundColor: Colors.red + '15' }]}
          >
            <Ionicons name="trash" size={16} color={Colors.red} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'events' && styles.tabBtnActive]}
            onPress={() => { setTab('events'); setSearchQuery(''); }}
          >
            <Ionicons name="calendar" size={16} color={tab === 'events' ? Colors.black : Colors.textSecondary} />
            <Text style={[styles.tabText, tab === 'events' && styles.tabTextActive]}>
              Events ({adminEvents.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'members' && styles.tabBtnActive]}
            onPress={() => { setTab('members'); setSearchQuery(''); }}
          >
            <Ionicons name="people" size={16} color={tab === 'members' ? Colors.black : Colors.textSecondary} />
            <Text style={[styles.tabText, tab === 'members' && styles.tabTextActive]}>
              Members ({members.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search + Actions */}
        <View style={styles.toolbarRow}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder={tab === 'events' ? 'Search events...' : 'Search members...'}
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {tab === 'events' ? (
            <View style={styles.actionRow}>
              {adminEvents.length === 0 && (
                <TouchableOpacity style={styles.seedBtn} onPress={handleSeedEvents}>
                  <Ionicons name="cloud-download" size={14} color={Colors.white} />
                  <Text style={styles.seedBtnText}>Seed</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => { resetEventForm(); setShowEventModal(true); }}
              >
                <Ionicons name="add" size={18} color={Colors.black} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.seedBtn} onPress={() => setShowBulkModal(true)}>
                <Ionicons name="cloud-upload" size={14} color={Colors.white} />
                <Text style={styles.seedBtnText}>Bulk</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => { setMemberForm({ name: '', email: '', phone: '' }); setShowMemberModal(true); }}
              >
                <Ionicons name="person-add" size={16} color={Colors.black} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Content */}
      {loading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color={Colors.gold} />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {tab === 'events' ? (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item._id}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Events</Text>
              <Text style={styles.emptyDesc}>
                Tap "Seed" to import events from app data, or tap + to create new.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredMembers}
          keyExtractor={(item) => item._id}
          renderItem={renderMemberItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Members</Text>
              <Text style={styles.emptyDesc}>
                Add members individually or bulk import from Excel/Contacts.
              </Text>
            </View>
          }
        />
      )}

      {/* ========== EVENT EDITOR MODAL ========== */}
      <Modal visible={showEventModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <SafeAreaView edges={['top']}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => { setShowEventModal(false); resetEventForm(); }}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {editingEvent ? 'Edit Event' : 'New Event'}
                </Text>
                <TouchableOpacity onPress={handleSaveEvent}>
                  <Text style={styles.modalSave}>Save</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Event Name *</Text>
              <TextInput style={styles.formInput} value={eventForm.name}
                onChangeText={t => setEventForm(f => ({ ...f, name: t }))}
                placeholder="e.g. Durban July Race Day" placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.formLabel}>Date *</Text>
              <TextInput style={styles.formInput} value={eventForm.date}
                onChangeText={t => setEventForm(f => ({ ...f, date: t }))}
                placeholder="e.g. Saturday, 4 July 2026" placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.formLabel}>Time</Text>
              <TextInput style={styles.formInput} value={eventForm.time}
                onChangeText={t => setEventForm(f => ({ ...f, time: t }))}
                placeholder="e.g. 11:00 - 21:00" placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.formLabel}>Venue</Text>
              <TextInput style={styles.formInput} value={eventForm.venue}
                onChangeText={t => setEventForm(f => ({ ...f, venue: t }))}
                placeholder="e.g. Greyville Racecourse" placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.formLabel}>Location</Text>
              <TextInput style={styles.formInput} value={eventForm.location}
                onChangeText={t => setEventForm(f => ({ ...f, location: t }))}
                placeholder="e.g. Greyville, Durban" placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.formLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
                {EVENT_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, eventForm.category === cat && styles.catChipActive]}
                    onPress={() => setEventForm(f => ({ ...f, category: cat }))}
                  >
                    <Text style={[styles.catChipText, eventForm.category === cat && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.formLabel}>Description</Text>
              <TextInput style={[styles.formInput, styles.formTextarea]} value={eventForm.description}
                onChangeText={t => setEventForm(f => ({ ...f, description: t }))}
                placeholder="Event description..." placeholderTextColor={Colors.textMuted}
                multiline numberOfLines={4}
              />

              <Text style={styles.formLabel}>Price</Text>
              <TextInput style={styles.formInput} value={eventForm.price}
                onChangeText={t => setEventForm(f => ({ ...f, price: t }))}
                placeholder="e.g. From R1,093" placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.formLabel}>Price Value (number)</Text>
              <TextInput style={styles.formInput} value={eventForm.priceValue}
                onChangeText={t => setEventForm(f => ({ ...f, priceValue: t }))}
                placeholder="e.g. 1093" placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />

              <Text style={styles.formLabel}>Highlights (comma-separated)</Text>
              <TextInput style={[styles.formInput, styles.formTextarea]} value={eventForm.highlights}
                onChangeText={t => setEventForm(f => ({ ...f, highlights: t }))}
                placeholder="Highlight 1, Highlight 2, ..." placeholderTextColor={Colors.textMuted}
                multiline
              />

              <Text style={styles.formLabel}>Image URL</Text>
              <TextInput style={styles.formInput} value={eventForm.image}
                onChangeText={t => setEventForm(f => ({ ...f, image: t }))}
                placeholder="https://..." placeholderTextColor={Colors.textMuted}
              />

              <View style={{ height: 60 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========== ADD MEMBER MODAL ========== */}
      <Modal visible={showMemberModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '60%' }]}>
            <SafeAreaView edges={['top']}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowMemberModal(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Add Member</Text>
                <TouchableOpacity onPress={handleAddMember}>
                  <Text style={styles.modalSave}>Add</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            <ScrollView style={styles.formScroll}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput style={styles.formInput} value={memberForm.name}
                onChangeText={t => setMemberForm(f => ({ ...f, name: t }))}
                placeholder="John Doe" placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.formLabel}>Email</Text>
              <TextInput style={styles.formInput} value={memberForm.email}
                onChangeText={t => setMemberForm(f => ({ ...f, email: t }))}
                placeholder="john@example.com" placeholderTextColor={Colors.textMuted}
                keyboardType="email-address" autoCapitalize="none"
              />

              <Text style={styles.formLabel}>Phone</Text>
              <TextInput style={styles.formInput} value={memberForm.phone}
                onChangeText={t => setMemberForm(f => ({ ...f, phone: t }))}
                placeholder="+27 xxx xxx xxxx" placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
              />
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========== BULK IMPORT MODAL ========== */}
      <Modal visible={showBulkModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '75%' }]}>
            <SafeAreaView edges={['top']}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => { setShowBulkModal(false); setBulkText(''); }}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Bulk Import</Text>
                <TouchableOpacity onPress={handleBulkImport}>
                  <Text style={styles.modalSave}>Import</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            <ScrollView style={styles.formScroll}>
              <Text style={styles.bulkHint}>
                Paste from Excel or CSV. Each line: Name, Email, Phone{'\n'}
                (separated by comma or tab)
              </Text>

              <TextInput
                style={styles.bulkInput}
                value={bulkText}
                onChangeText={setBulkText}
                placeholder={"John Doe, john@email.com, +27123456789\nJane Smith, jane@email.com, +27987654321"}
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={10}
                textAlignVertical="top"
              />

              <Text style={styles.bulkOr}> OR </Text>

              <TouchableOpacity style={styles.contactsBtn} onPress={handleImportContacts}>
                <Ionicons name="people" size={20} color={Colors.gold} />
                <Text style={styles.contactsBtnText}>Import from Device Contacts</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white },

  // Tabs
  tabRow: {
    flexDirection: 'row', marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: 3, marginBottom: Spacing.md,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: BorderRadius.sm, gap: 6,
  },
  tabBtnActive: { backgroundColor: Colors.gold },
  tabText: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.black },

  // Toolbar
  toolbarRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.sm,
  },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, gap: Spacing.sm,
  },
  searchInput: {
    flex: 1, color: Colors.white, fontSize: FontSizes.sm, paddingVertical: 10,
  },
  actionRow: { flexDirection: 'row', gap: Spacing.xs },
  seedBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
  },
  seedBtnText: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.white },
  addBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.md,
    backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center',
  },

  // Loading
  loadingBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.sm,
    backgroundColor: Colors.gold + '15',
  },
  loadingText: { fontSize: FontSizes.xs, color: Colors.gold },

  // List
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },

  // Card
  card: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  cardInactive: { opacity: 0.5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.white },
  cardSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 6 },
  cardPrice: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '600' },
  badge: {
    backgroundColor: Colors.gold + '20', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 4,
  },
  badgeInactive: { backgroundColor: Colors.red + '20' },
  badgeText: { fontSize: 10, fontWeight: '600', color: Colors.gold },
  cardActions: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  actionBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },

  // Member
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.gold + '20', alignItems: 'center', justifyContent: 'center',
  },
  memberInitial: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.gold },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusActive: { backgroundColor: Colors.green + '20' },
  statusInvited: { backgroundColor: Colors.gold + '20' },
  statusText: { fontSize: 10, fontWeight: '600', color: Colors.greenLight },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white, marginTop: Spacing.md },
  emptyDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, paddingHorizontal: Spacing.xxl },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.cardBorder,
  },
  modalCancel: { fontSize: FontSizes.md, color: Colors.textSecondary },
  modalTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.white },
  modalSave: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.gold },

  // Form
  formScroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  formLabel: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, marginTop: Spacing.md },
  formInput: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    color: Colors.white, fontSize: FontSizes.sm,
  },
  formTextarea: { height: 80, textAlignVertical: 'top' },
  catRow: { marginBottom: Spacing.sm },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.cardBorder,
    marginRight: 8,
  },
  catChipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  catChipText: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.textSecondary },
  catChipTextActive: { color: Colors.black },

  // Bulk
  bulkHint: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
  bulkInput: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    color: Colors.white, fontSize: FontSizes.sm,
    minHeight: 150, textAlignVertical: 'top',
  },
  bulkOr: {
    textAlign: 'center', color: Colors.textMuted, fontSize: FontSizes.sm,
    marginVertical: Spacing.lg,
  },
  contactsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.gold + '40',
    paddingVertical: 14,
  },
  contactsBtnText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.gold },
});
