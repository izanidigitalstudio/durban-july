import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Contacts from 'expo-contacts';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import AdaptiveImage from '../components/AdaptiveImage';

const ADMIN_PIN = '1977';

type AppViewMode = 'vip' | 'organiser' | 'admin';

type TabKey = 'events' | 'claimed' | 'organisers' | 'providers' | 'vip';
type BulkImportFieldKey = 'name' | 'company' | 'designation' | 'city' | 'phone' | 'email' | 'skip';

type BulkImportColumn = {
  key: string;
  label: string;
  sample?: string;
  mappedTo: BulkImportFieldKey;
};

type ParsedBulkImport = {
  columns: BulkImportColumn[];
  rows: string[][];
};

type DeviceImportContact = {
  id: string;
  name: string;
  companyName?: string;
  designation?: string;
  phone?: string;
  email?: string;
  city?: string;
  province?: string;
  note?: string;
};

type DeviceContactSource = {
  id?: string | number | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  displayName?: string | null;
  company?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  title?: string | null;
  notes?: string | null;
  note?: string | null;
  phoneNumbers?: Array<{ number?: string | null }> | null;
  phones?: Array<{ number?: string | null }> | null;
  emails?: Array<{ email?: string | null }> | null;
  addresses?: Array<{ city?: string | null; region?: string | null }> | null;
};

type VipImportRow = {
  name: string;
  email?: string;
  phone?: string;
  mobileNumbers?: string[];
  notes?: string;
  category?: string;
  attendeeCompanyName?: string;
  attendeeDesignation?: string;
  attendeeCity?: string;
  attendeeProvince?: string;
  attendeeFavouriteEventType?: string;
  companyName?: string;
  city?: string;
};

const BULK_IMPORT_FIELD_OPTIONS: Array<{ key: BulkImportFieldKey; label: string; hint: string }> = [
  { key: 'name', label: 'Full Name', hint: 'Stores as member name' },
  { key: 'company', label: 'Company', hint: 'Stores as attendee company name' },
  { key: 'designation', label: 'Designation', hint: 'Stores as attendee designation' },
  { key: 'city', label: 'City', hint: 'Stores as attendee city' },
  { key: 'phone', label: 'Mobile Number', hint: 'Stores as phone number' },
  { key: 'email', label: 'Email', hint: 'Stores as email address' },
  { key: 'skip', label: 'Skip column', hint: 'Do not import this column' },
];

const BULK_IMPORT_POSITIONS: BulkImportFieldKey[] = ['name', 'company', 'designation', 'city', 'phone', 'email'];

const normalizeBulkImportHeader = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

const detectBulkImportField = (header: string, index: number): BulkImportFieldKey => {
  const normalized = normalizeBulkImportHeader(header);
  const aliasMap: Record<string, BulkImportFieldKey> = {
    fullname: 'name',
    name: 'name',
    company: 'company',
    companyname: 'company',
    designation: 'designation',
    title: 'designation',
    jobtitle: 'designation',
    city: 'city',
    mobile: 'phone',
    mobilenumber: 'phone',
    phone: 'phone',
    phonenumber: 'phone',
    email: 'email',
    emailaddress: 'email',
  };
  return aliasMap[normalized] || BULK_IMPORT_POSITIONS[index] || 'skip';
};

const parseBulkImportText = (text: string): ParsedBulkImport => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return { columns: [], rows: [] };

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const rawHeaders = lines[0].split(delimiter).map((value) => value.trim());
  const hasHeader = rawHeaders.some((value, index) => detectBulkImportField(value, index) !== 'skip' && normalizeBulkImportHeader(value) !== '');
  const dataLines = lines.slice(hasHeader ? 1 : 0);
  const rows = dataLines.map((line) => line.split(delimiter).map((value) => value.trim()));
  const columnCount = Math.max(rawHeaders.length, ...rows.map((row) => row.length), 0);
  const columns = Array.from({ length: columnCount }, (_, index) => {
    const header = hasHeader ? rawHeaders[index] || `Column ${index + 1}` : `Column ${index + 1}`;
    return {
      key: `column-${index}`,
      label: header,
      sample: rows[0]?.[index] || '',
      mappedTo: hasHeader ? detectBulkImportField(header, index) : BULK_IMPORT_POSITIONS[index] || 'skip',
    };
  });

  return { columns, rows };
};

type BulkImportRow = {
  name: string;
  email?: string;
  phone?: string;
  mobileNumbers?: string[];
  notes?: string;
  category?: string;
  attendeeCompanyName?: string;
  attendeeDesignation?: string;
  attendeeCity?: string;
  companyName?: string;
  city?: string;
};

const parseMobileNumbers = (value: string) =>
  Array.from(
    new Set(
      value
        .split(/[\n,;|]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );

const getDeviceContactName = (contact: DeviceContactSource) => {
  const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim();
  return name || contact.name || contact.displayName || '';
};

const getDeviceContactPhone = (contact: DeviceContactSource) => contact.phoneNumbers?.[0]?.number || contact.phones?.[0]?.number || '';

const buildDeviceContactId = (contact: DeviceContactSource, index: number) => {
  if (contact.id !== undefined && contact.id !== null && String(contact.id).trim()) {
    return String(contact.id);
  }

  const parts = [
    getDeviceContactName(contact),
    getDeviceContactPhone(contact),
    contact.emails?.[0]?.email || '',
    contact.company || contact.companyName || '',
  ]
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean)
    .join('|');

  return parts ? `contact-${parts}` : `contact-${index}`;
};

const buildVipRowFromDeviceContact = (contact: DeviceImportContact) => ({
  name: contact.name,
  email: contact.email || '',
  phone: contact.phone || '',
  mobileNumbers: parseMobileNumbers(contact.phone || ''),
  notes: contact.note || undefined,
  category: 'VIP Members',
  attendeeCompanyName: contact.companyName || undefined,
  attendeeDesignation: contact.designation || undefined,
  attendeeCity: contact.city || undefined,
  attendeeProvince: contact.province || undefined,
  attendeeFavouriteEventType: undefined,
  companyName: contact.companyName || undefined,
  city: contact.city || undefined,
});

const phoneToDigits = (value?: string) => String(value || '').replace(/[^\d+]/g, '');

const looksLikeVipPhone = (value?: string) => {
  const raw = String(value || '').trim();
  if (!raw) return false;
  if (/[a-zA-Z]/.test(raw)) return false;
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 8;
};

const getPrimaryPhone = (item: Member) => item.phone || item.mobileNumbers?.[0] || (looksLikeVipPhone(item.city) ? item.city : '') || '';

const getVipCity = (item: Member) => {
  const city = [item.attendeeCity, item.city].map((value) => String(value || '').trim()).find((value) => value && !looksLikeVipPhone(value));
  return city || '';
};

const openMemberContact = async (type: 'whatsapp' | 'sms' | 'email' | 'call', item: Member) => {
  const phone = phoneToDigits(getPrimaryPhone(item));
  const email = String(item.email || '').trim();
  try {
    if (type === 'email') {
      if (!email) return Alert.alert('No email', 'This member does not have an email address saved.');
      await Linking.openURL(`mailto:${encodeURIComponent(email)}`);
      return;
    }
    if (!phone) return Alert.alert('No mobile number', 'This member does not have a mobile number saved.');
    if (type === 'whatsapp') {
      await Linking.openURL(`https://wa.me/${phone.replace(/\D/g, '')}`);
      return;
    }
    if (type === 'call') {
      await Linking.openURL(`tel:${phone}`);
      return;
    }
    await Linking.openURL(`sms:${phone}`);
  } catch {
    Alert.alert('Unable to open contact app', 'Please check that the contact details are valid.');
  }
};

const buildBulkImportRows = (
  parsed: ParsedBulkImport,
  mappings: Record<string, BulkImportFieldKey>,
  category: string,
): BulkImportRow[] => {
  return parsed.rows
    .map((cells: string[]) => {
      const row: BulkImportRow = {
        name: '',
        email: undefined,
        phone: undefined,
        mobileNumbers: undefined,
        notes: undefined,
        category: category || undefined,
        attendeeCompanyName: undefined,
        attendeeDesignation: undefined,
        attendeeCity: undefined,
        companyName: undefined,
        city: undefined,
      };

      parsed.columns.forEach((column: BulkImportColumn, index: number) => {
        const mappedTo = mappings[column.key] || column.mappedTo;
        const value = (cells[index] || '').trim();
        if (!value || mappedTo === 'skip') return;
        if (mappedTo === 'name') row.name = value;
        if (mappedTo === 'company') {
          row.attendeeCompanyName = value;
          row.companyName = value;
        }
        if (mappedTo === 'designation') row.attendeeDesignation = value;
        if (mappedTo === 'city') {
          row.attendeeCity = value;
          row.city = value;
        }
        if (mappedTo === 'phone') {
          row.mobileNumbers = parseMobileNumbers(value);
          row.phone = row.mobileNumbers[0] || value;
        }
        if (mappedTo === 'email') row.email = value;
      });

      return row;
    })
    .filter((row: BulkImportRow) => Boolean(row.name));
};

type Provider = {
  _id: string;
  _creationTime: number;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  services?: string;
  websiteOrSocialLink?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: number;
};

type Member = {
  _id: string;
  _creationTime: number;
  name: string;
  email?: string;
  phone?: string;
  mobileNumbers?: string[];
  status: string;
  category?: string;
  role?: string;
  accessPin?: string;
  assignedEventIds?: string[];
  approvedAt?: number;
  notes?: string;
  organiserStatus?: 'pending' | 'approved' | 'rejected';
  attendeeCompanyName?: string;
  attendeeDesignation?: string;
  attendeeAddress?: string;
  attendeeCity?: string;
  attendeeProvince?: string;
  attendeeFavouriteEventType?: string;
  companyName?: string;
  city?: string;
};

type OrganizerRequest = {
  _id: string;
  _creationTime: number;
  type: 'claim' | 'create';
  status: 'pending' | 'approved' | 'rejected';
  eventId?: string;
  eventName?: string;
  name?: string;
  venue?: string;
  date?: string;
  time?: string;
  location?: string;
  image?: string;
  description?: string;
};

type Props = {
  appViewMode?: AppViewMode;
  onChangeAppViewMode?: (mode: AppViewMode) => void;
  route?: {
    params?: {
      accessPin?: string;
      returnTo?: string;
    };
  };
};

export default function AdminDashboardScreen({ appViewMode, onChangeAppViewMode }: Props) {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const accessPin = route.params?.accessPin?.trim() || ADMIN_PIN;
  const returnTo = route.params?.returnTo;
  const isSuperAccess = true;
  const [tab, setTab] = useState<TabKey>('events');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const eventsQuery = useQuery(api.admin.getEvents);
  const organiserRequestsQuery = useQuery(api.admin.getOrganizerRequests, { accessPin });
  const membersQuery = useQuery(api.admin.getMembers, { accessPin });
  const providersQuery = useQuery(api.admin.getProviders, { accessPin });
  const vipMembersQuery = useQuery(api.admin.getVipMembers, { accessPin });

  const events = useMemo(() => eventsQuery ?? [], [eventsQuery]);
  const organiserRequests = useMemo(() => (organiserRequestsQuery ?? []) as OrganizerRequest[], [organiserRequestsQuery]);
  const members = useMemo(() => (membersQuery ?? []) as Member[], [membersQuery]);
  const providers = useMemo(() => (providersQuery ?? []) as Provider[], [providersQuery]);
  const vipMembers = useMemo(() => (vipMembersQuery ?? []) as Member[], [vipMembersQuery]);

  const claimRequests = useMemo(
    () => organiserRequests.filter((request: OrganizerRequest) => request.type === 'claim'),
    [organiserRequests]
  );

  const claimRequestByEventId = useMemo(() => {
    const map = new Map<string, OrganizerRequest>();
    for (const request of claimRequests) {
      if (!request.eventId) continue;
      const existing = map.get(String(request.eventId));
      if (!existing || request._creationTime > existing._creationTime) {
        map.set(String(request.eventId), request);
      }
    }
    return map;
  }, [claimRequests]);

  const getEventClaimStatus = (event: any) => {
    const claim = event._id ? claimRequestByEventId.get(String(event._id)) : null;
    if (!claim) return 'unclaimed';
    if (claim.status === 'approved') return 'approved';
    if (claim.status === 'rejected') return 'declined';
    return 'claimed';
  };

  const organiserReviewRequests = useMemo(
    () => organiserRequests.filter((request: OrganizerRequest) => request.type === 'create'),
    [organiserRequests]
  );

  const organiserMembers = useMemo(
    () => members.filter((item: Member) => item.role === 'organiser' || item.role === 'organizer' || item.organiserStatus || item.accessPin),
    [members]
  );

  const dashboardStats = useMemo(
    () => ({
      events: events.length,
      claimed: claimRequests.length,
      organisers: organiserMembers.length + organiserReviewRequests.length,
      providers: providers.length,
      vipMembers: vipMembers.length,
    }),
    [events.length, claimRequests.length, organiserMembers.length, organiserReviewRequests.length, providers.length, vipMembers.length]
  );

  const createEvent = useMutation(api.admin.createEvent);
  const updateEvent = useMutation(api.admin.updateEvent);
  const deleteEvent = useMutation(api.admin.deleteEvent);
  const approveOrganizerRequest = useMutation(api.admin.approveOrganizerRequest);
  const rejectOrganizerRequest = useMutation(api.admin.rejectOrganizerRequest);
  const updateMember = useMutation(api.admin.updateMember);
  const deleteMember = useMutation(api.admin.deleteMember);
  const addProvider = useMutation(api.admin.addProvider);
  const updateProvider = useMutation(api.admin.updateProvider);
  const deleteProvider = useMutation(api.admin.deleteProvider);
  const updateVipMember = useMutation(api.admin.updateVipMember);
  const approveVipMember = useMutation(api.admin.approveVipMember);
  const declineVipMember = useMutation(api.admin.declineVipMember);
  const addMember = useMutation(api.admin.addMember);
  const bulkImportMembers = useMutation(api.admin.bulkImportMembers);

  const withAdminPin = (args: Record<string, any> = {}) => ({ accessPin, ...args });

  const handleGoBack = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    if (returnTo) {
      navigation.navigate(returnTo);
      return;
    }

    navigation.navigate('Main');
  };

  const [showEventModal, setShowEventModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [showMemberActionsModal, setShowMemberActionsModal] = useState(false);
  const [showMemberImportModal, setShowMemberImportModal] = useState(false);
  const [showDeviceImportModal, setShowDeviceImportModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [editingVip, setEditingVip] = useState<Member | null>(null);
  const [eventForm, setEventForm] = useState({ name: '', date: '', time: '', venue: '', location: '', category: 'Lifestyle', description: '', price: '', priceValue: '0', images: ['', '', '', '', ''] });
  const [providerForm, setProviderForm] = useState({ name: '', companyName: '', email: '', phone: '', services: '', websiteOrSocialLink: '', notes: '' });
  const [vipForm, setVipForm] = useState({ name: '', email: '', phone: '', mobileNumbers: '', notes: '', attendeeCompanyName: '', attendeeDesignation: '', attendeeCity: '', attendeeProvince: '', attendeeFavouriteEventType: '' });
  const vipMemberCategory = 'VIP Members';
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkImportSource, setBulkImportSource] = useState<'paste' | 'file'>('paste');
  const [bulkImportMappings, setBulkImportMappings] = useState<Record<string, BulkImportFieldKey>>({});
  const [activeBulkImportColumn, setActiveBulkImportColumn] = useState<BulkImportColumn | null>(null);
  const [importingMembers, setImportingMembers] = useState(false);
  const [deviceContactsLoading, setDeviceContactsLoading] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState<DeviceImportContact[]>([]);
  const [selectedDeviceContactIds, setSelectedDeviceContactIds] = useState<string[]>([]);
  const [deviceContactsLoadedOnce, setDeviceContactsLoadedOnce] = useState(false);

  const safeText = (value: unknown) => String(value || '').toLowerCase();

  const parsedBulkImport = useMemo(() => parseBulkImportText(bulkImportText), [bulkImportText]);

  useEffect(() => {
    if (!parsedBulkImport.columns.length) {
      setBulkImportMappings({});
      return;
    }

    setBulkImportMappings((current: Record<string, BulkImportFieldKey>) => {
      const currentKeys = Object.keys(current);
      const parsedKeys = parsedBulkImport.columns.map((column: BulkImportColumn) => column.key);
      const sameColumns = currentKeys.length === parsedKeys.length && parsedKeys.every((key: string) => currentKeys.includes(key));
      if (sameColumns) return current;
      return Object.fromEntries(parsedBulkImport.columns.map((column: BulkImportColumn) => [column.key, column.mappedTo])) as Record<string, BulkImportFieldKey>;
    });
  }, [parsedBulkImport.columns]);

  const mappedBulkImportRows = useMemo(
    () => buildBulkImportRows(parsedBulkImport, bulkImportMappings, vipMemberCategory),
    [parsedBulkImport, bulkImportMappings]
  );

  const selectedDeviceContacts = useMemo(
    () => deviceContacts.filter((contact: DeviceImportContact) => selectedDeviceContactIds.includes(contact.id)),
    [deviceContacts, selectedDeviceContactIds]
  );

  const mappedDeviceImportRows = useMemo(
    () => selectedDeviceContacts.map((contact: DeviceImportContact) => buildVipRowFromDeviceContact(contact)),
    [selectedDeviceContacts]
  );

  const syncSelectedDeviceContactIds = (
    contacts: DeviceImportContact[],
    currentSelection: string[],
    forceDefaultSelection: boolean,
    resetSelection: boolean,
  ) => {
    if (resetSelection) {
      return [];
    }

    const availableIds = new Set(contacts.map((contact: DeviceImportContact) => contact.id));
    const preservedSelection = currentSelection.filter((id: string) => availableIds.has(id));

    if (preservedSelection.length && !forceDefaultSelection) {
      return preservedSelection;
    }

    if (forceDefaultSelection || !deviceContactsLoadedOnce) {
      return contacts.slice(0, 20).map((contact: DeviceImportContact) => contact.id);
    }

    return preservedSelection;
  };

  const toggleDeviceContactSelection = (contactId: string) => {
    setSelectedDeviceContactIds((current: string[]) =>
      current.includes(contactId) ? current.filter((id) => id !== contactId) : [...current, contactId],
    );
  };

  const clearDeviceContactSelection = () => {
    setSelectedDeviceContactIds([]);
  };

  const selectAllDeviceContacts = () => {
    setSelectedDeviceContactIds(deviceContacts.map((contact: DeviceImportContact) => contact.id));
  };

  const handleCloseDeviceContactsImport = () => {
    setShowDeviceImportModal(false);
    setShowMemberActionsModal(true);
  };

  const handleOpenDeviceContactsImport = async (forceDefaultSelection = false, resetSelection = false) => {
    try {
      setDeviceContactsLoading(true);

      const available = await Contacts.isAvailableAsync();
      if (!available) {
        Alert.alert('Contacts unavailable', 'This device cannot access contacts right now.');
        setShowMemberActionsModal(true);
        return;
      }

      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow contacts access to import from your device.');
        setShowMemberActionsModal(true);
        return;
      }

      const result = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.FirstName,
          Contacts.Fields.LastName,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Addresses,
          Contacts.Fields.Company,
          Contacts.Fields.JobTitle,
        ],
        pageSize: 500,
        sort: Contacts.SortTypes.FirstName,
      });

      const mappedContacts: DeviceImportContact[] = (result.data || [])
        .map((contact: DeviceContactSource, index: number) => ({
          id: buildDeviceContactId(contact, index),
          name: getDeviceContactName(contact),
          companyName: contact.company || contact.companyName || undefined,
          designation: contact.jobTitle || contact.title || undefined,
          phone: getDeviceContactPhone(contact),
          email: contact.emails?.[0]?.email || undefined,
          city: contact.addresses?.[0]?.city || contact.addresses?.[0]?.region || undefined,
          province: contact.addresses?.[0]?.region || undefined,
          note: contact.note || contact.notes || undefined,
        }))
        .filter((contact: DeviceImportContact) => Boolean(contact.name || contact.phone || contact.email));

      setDeviceContacts(mappedContacts);
      setSelectedDeviceContactIds((currentSelection: string[]) =>
        syncSelectedDeviceContactIds(mappedContacts, currentSelection, forceDefaultSelection, resetSelection),
      );
      setDeviceContactsLoadedOnce(true);
      setShowMemberActionsModal(false);
      setShowDeviceImportModal(true);
    } catch (error) {
      console.log('device contacts load failed', error);
      Alert.alert('Error', 'Could not load device contacts. Please try again or import from CSV instead.');
      setShowMemberActionsModal(true);
    } finally {
      setDeviceContactsLoading(false);
    }
  };

  const handleBulkImportMembers = async (
    rows: VipImportRow[]
   ) => {
    if (!rows.length) {
      Alert.alert('No members found', 'Add one or more rows before importing.');
      return;
    }

    try {
      setImportingMembers(true);
      await bulkImportMembers(withAdminPin({
        category: vipMemberCategory,
        members: rows.map((row) => ({
          ...row,
          category: row.category || vipMemberCategory,
        })),
      }));
      Alert.alert('Imported', `${rows.length} members were added successfully.`);
      setBulkImportText('');
      setSelectedDeviceContactIds([]);
      setDeviceContactsLoadedOnce(false);
      setShowMemberImportModal(false);
      setShowDeviceImportModal(false);
      setShowMemberActionsModal(false);
      setDeviceContacts([]);
    } catch {
      Alert.alert('Error', 'Failed to import members.');
    } finally {
      setImportingMembers(false);
    }
  };

  const handleImportSelectedDeviceContacts = async () => {
    if (!selectedDeviceContactIds.length) {
      Alert.alert('No contacts selected', 'Select at least one contact to import.');
      return;
    }

    const rowsToImport = mappedDeviceImportRows.filter((row: VipImportRow) => Boolean(row.name.trim()));
    if (!rowsToImport.length) {
      Alert.alert('No importable contacts', 'The selected contacts do not have enough details to import.');
      return;
    }

    await handleBulkImportMembers(rowsToImport);
    setShowDeviceImportModal(false);
  };

  const handlePickMemberFile = async () => {
    try {
      const DocumentPicker = (await import('expo-document-picker')) as any;
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: ['text/csv', 'text/plain', 'application/csv', 'application/vnd.ms-excel'],
        multiple: false,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const file = result.assets[0];
      const text = await FileSystem.readAsStringAsync(file.uri);
      setBulkImportText(text);
      setBulkImportSource('file');
      const preview = parseBulkImportText(text);
      setBulkImportMappings(Object.fromEntries(preview.columns.map((column) => [column.key, column.mappedTo])));
      setShowMemberImportModal(true);
    } catch {
      Alert.alert('Error', 'Could not read the selected file.');
    }
  };

  const filteredEvents = useMemo(() => {
    const q = safeText(search);
    return events.filter((item: any) =>
      [item.name, item.date, item.time, item.venue, item.location, item.category].some((field) => safeText(field).includes(q))
    );
  }, [events, search]);

  const filteredClaimedEvents = useMemo(() => {
    const q = safeText(search);
    return claimRequests.filter((item: OrganizerRequest) =>
      [item.eventName, item.name, item.date, item.venue, item.location, item.status].some((field) => safeText(field).includes(q))
    );
  }, [claimRequests, search]);

  const filteredOrganisers = useMemo(() => {
    const q = safeText(search);
    return organiserMembers.filter((item: Member) =>
      [item.name, item.email, item.phone, item.notes].some((field) => safeText(field).includes(q)));
  }, [organiserMembers, search]);

  const filteredProviders = useMemo(() => {
    const q = safeText(search);
    return providers.filter((item: Provider) => [item.name, item.companyName, item.email, item.phone, item.services].some((field) => safeText(field).includes(q)));
  }, [providers, search]);

  const filteredVip = useMemo(() => {
    const q = safeText(search);
    return vipMembers.filter((item: Member) => [item.name, item.email, item.phone, item.notes, item.attendeeCompanyName, item.companyName, item.attendeeDesignation, item.city, item.attendeeCity, item.attendeeProvince, item.attendeeFavouriteEventType].some((field) => safeText(field).includes(q)));
  }, [vipMembers, search]);

  const resetEventForm = () => {
    setEditingEvent(null);
    setEventForm({ name: '', date: '', time: '', venue: '', location: '', category: 'Lifestyle', description: '', price: '', priceValue: '0', images: ['', '', '', '', ''] });
  };

  const setEventImage = (index: number, value: string) => {
    setEventForm((current: typeof eventForm) => {
      const images = [...current.images];
      images[index] = value;
      return { ...current, images };
    });
  };

  const moveEventImage = (fromIndex: number, toIndex: number) => {
    setEventForm((current: typeof eventForm) => {
      const images = [...current.images];
      const [moved] = images.splice(fromIndex, 1);
      images.splice(toIndex, 0, moved);
      return { ...current, images };
    });
  };

  const removeEventImage = (index: number) => {
    setEventForm((current: typeof eventForm) => {
      const images = [...current.images];
      images[index] = '';
      return { ...current, images };
    });
  };

  const pickEventImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 0.85 });
    if (result.canceled || !result.assets?.[0]) return;
    setEventImage(index, result.assets[0].uri);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.name || !eventForm.date) {
      Alert.alert('Error', 'Event name and date are required.');
      return;
    }
    const images = eventForm.images.map((item: string) => item.trim()).filter(Boolean).slice(0, 5);
    try {
      setLoading(true);
      const payload = {
        name: eventForm.name,
        date: eventForm.date,
        time: eventForm.time,
        venue: eventForm.venue,
        location: eventForm.location,
        category: eventForm.category,
        description: eventForm.description,
        price: eventForm.price,
        priceValue: Number(eventForm.priceValue) || 0,
        highlights: [],
        image: images[0],
        images,
      };
      if (editingEvent?._id) {
        await updateEvent(withAdminPin({ id: editingEvent._id, ...payload }));
      } else {
        await createEvent(withAdminPin({ ...payload }));
      }
      setShowEventModal(false);
      resetEventForm();
    } catch {
      Alert.alert('Error', 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = (item: any) => {
    Alert.alert('Delete Event', `Delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteEvent({ id: item._id }); } catch { Alert.alert('Error', 'Failed to delete event.'); } } },
    ]);
  };

  const handleToggleEvent = async (item: any, isActive: boolean) => {
    try {
      await updateEvent({ id: item._id, isActive });
    } catch {
      Alert.alert('Error', 'Failed to update event status.');
    }
  };

  const handleApproveOrganizer = async (request: OrganizerRequest) => {
    try {
      setLoading(true);
      await approveOrganizerRequest(withAdminPin({ requestId: request._id as any }));
    } catch {
      Alert.alert('Error', 'Failed to approve organiser.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineOrganizer = async (request: OrganizerRequest) => {
    try {
      setLoading(true);
      await rejectOrganizerRequest(withAdminPin({ requestId: request._id as any }));
    } catch {
      Alert.alert('Error', 'Failed to decline organiser.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProvider = async () => {
    if (!providerForm.name) {
      Alert.alert('Error', 'Provider name is required.');
      return;
    }
    try {
      setLoading(true);
      if (editingProvider) {
        await updateProvider(withAdminPin({
          id: editingProvider._id,
          name: providerForm.name,
          companyName: providerForm.companyName || undefined,
          email: providerForm.email || undefined,
          phone: providerForm.phone || undefined,
          services: providerForm.services || undefined,
          websiteOrSocialLink: providerForm.websiteOrSocialLink || undefined,
          notes: providerForm.notes || undefined,
        }));
      } else {
        await addProvider(withAdminPin({
          name: providerForm.name,
          companyName: providerForm.companyName || undefined,
          email: providerForm.email || undefined,
          phone: providerForm.phone || undefined,
          services: providerForm.services || undefined,
          websiteOrSocialLink: providerForm.websiteOrSocialLink || undefined,
          notes: providerForm.notes || undefined,
        }));
      }
      setShowProviderModal(false);
      setEditingProvider(null);
      setProviderForm({ name: '', companyName: '', email: '', phone: '', services: '', websiteOrSocialLink: '', notes: '' });
    } catch {
      Alert.alert('Error', 'Failed to save provider.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProvider = (item: Provider) => {
    Alert.alert('Delete Provider', `Delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteProvider({ id: item._id }); } catch { Alert.alert('Error', 'Failed to delete provider.'); } } },
    ]);
  };

  const handleSaveVip = async () => {
    if (!vipForm.name) {
      Alert.alert('Error', 'VIP member name is required.');
      return;
    }
    try {
      setLoading(true);
      if (editingVip) {
        await updateVipMember(withAdminPin({
          id: editingVip._id,
          name: vipForm.name,
          email: vipForm.email || undefined,
          phone: vipForm.phone || undefined,
          mobileNumbers: parseMobileNumbers(vipForm.mobileNumbers),
          notes: vipForm.notes || undefined,
          attendeeCompanyName: vipForm.attendeeCompanyName || undefined,
          attendeeDesignation: vipForm.attendeeDesignation || undefined,
          attendeeCity: vipForm.attendeeCity || undefined,
          attendeeProvince: vipForm.attendeeProvince || undefined,
          attendeeFavouriteEventType: vipForm.attendeeFavouriteEventType || undefined,
          companyName: vipForm.attendeeCompanyName || undefined,
          city: vipForm.attendeeCity || undefined,
        }));
      } else {
        await addMember(withAdminPin({
          name: vipForm.name,
          email: vipForm.email || undefined,
          phone: vipForm.phone || undefined,
          mobileNumbers: parseMobileNumbers(vipForm.mobileNumbers),
          notes: vipForm.notes || undefined,
          category: vipMemberCategory,
          attendeeCompanyName: vipForm.attendeeCompanyName || undefined,
          attendeeDesignation: vipForm.attendeeDesignation || undefined,
          attendeeCity: vipForm.attendeeCity || undefined,
          attendeeProvince: vipForm.attendeeProvince || undefined,
          attendeeFavouriteEventType: vipForm.attendeeFavouriteEventType || undefined,
          companyName: vipForm.attendeeCompanyName || undefined,
          city: vipForm.attendeeCity || undefined,
        }));
      }
      setShowVipModal(false);
      setEditingVip(null);
      setVipForm({ name: '', email: '', phone: '', mobileNumbers: '', notes: '', attendeeCompanyName: '', attendeeDesignation: '', attendeeCity: '', attendeeProvince: '', attendeeFavouriteEventType: '' });
    } catch {
      Alert.alert('Error', 'Failed to save VIP member.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVip = (item: Member) => {
    Alert.alert('Delete VIP Member', `Delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteMember(withAdminPin({ id: item._id })); } catch { Alert.alert('Error', 'Failed to delete VIP member.'); } } },
    ]);
  };

  const setProviderEditing = (item: Provider | null) => {
    setEditingProvider(item);
    setProviderForm(item ? {
      name: item.name || '',
      companyName: item.companyName || '',
      email: item.email || '',
      phone: item.phone || '',
      services: item.services || '',
      websiteOrSocialLink: item.websiteOrSocialLink || '',
      notes: item.notes || '',
    } : { name: '', companyName: '', email: '', phone: '', services: '', websiteOrSocialLink: '', notes: '' });
    setShowProviderModal(true);
  };

  const setVipEditing = (item: Member | null) => {
    setEditingVip(item);
    setVipForm(item ? {
      name: item.name || '',
      email: item.email || '',
      phone: item.phone || (looksLikeVipPhone(item.city) ? item.city || '' : ''),
      mobileNumbers: (item.mobileNumbers || item.phone || looksLikeVipPhone(item.city) ? [item.phone || item.mobileNumbers?.[0] || item.city || ''] : []).filter(Boolean).join(', '),
      notes: item.notes || '',
      attendeeCompanyName: item.attendeeCompanyName || item.companyName || '',
      attendeeDesignation: item.attendeeDesignation || '',
      attendeeCity: getVipCity(item) || item.city || '',
      attendeeProvince: item.attendeeProvince || '',
      attendeeFavouriteEventType: item.attendeeFavouriteEventType || '',
    } : { name: '', email: '', phone: '', mobileNumbers: '', notes: '', attendeeCompanyName: '', attendeeDesignation: '', attendeeCity: '', attendeeProvince: '', attendeeFavouriteEventType: '' });
    setShowVipModal(true);
  };

  const renderStatus = (status: string) => (
    <View style={[styles.statusBadge, status === 'approved' ? styles.statusApproved : status === 'rejected' || status === 'declined' ? styles.statusRejected : status === 'claimed' ? styles.statusClaimed : styles.statusUnclaimed]}>
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );

  const renderStatPill = (label: string, value: number, icon: keyof typeof Ionicons.glyphMap) => (
    <View style={styles.statPill}>
      <Ionicons name={icon} size={14} color={Colors.gold} />
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  const renderTabLabel = (label: string, count: number, active: boolean) => (
    <View style={styles.tabLabelWrap}>
      <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>
        {label}
      </Text>
      <View style={[styles.tabCountBadge, active && styles.tabCountBadgeActive]}>
        <Text style={[styles.tabCountText, active && styles.tabCountTextActive]}>{count}</Text>
      </View>
    </View>
  );

  const renderClaimedEventItem = ({ item }: { item: OrganizerRequest }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.eventName || item.name || 'Claimed event'}</Text>
          <Text style={styles.cardSub}>{item.date || 'No date supplied'}{item.time ? ` · ${item.time}` : ''}</Text>
          <Text style={styles.cardSub}>{item.venue || item.location || 'Waiting for review'}</Text>
          <Text style={styles.cardSub}>{item.description || 'Event claim submitted by an organiser.'}</Text>
        </View>
        {renderStatus(item.status === 'pending' ? 'claimed' : item.status)}
      </View>
      {item.image ? <AdaptiveImage source={{ uri: item.image }} style={styles.previewImage} /> : null}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleApproveOrganizer(item)}>
          <Ionicons name="checkmark" size={16} color={Colors.greenLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeclineOrganizer(item)}>
          <Ionicons name="close" size={16} color={Colors.red} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEventItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSub}>{item.date} · {item.time}</Text>
          <Text style={styles.cardSub}>{item.venue} · {item.location}</Text>
          <Text style={styles.cardSub}>{item.category}</Text>
        </View>
        {renderStatus(getEventClaimStatus(item))}
      </View>
      {item.image ? <AdaptiveImage source={{ uri: item.image }} style={styles.previewImage} /> : null}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => { setEditingEvent(item); setEventForm({ name: item.name || '', date: item.date || '', time: item.time || '', venue: item.venue || '', location: item.location || '', category: item.category || 'Lifestyle', description: item.description || '', price: item.price || '', priceValue: String(item.priceValue || 0), images: item.images || ['', '', '', '', ''] }); setShowEventModal(true); }}>
          <Ionicons name="pencil" size={16} color={Colors.gold} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleToggleEvent(item, true)}>
          <Ionicons name="checkmark" size={16} color={Colors.greenLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleToggleEvent(item, false)}>
          <Ionicons name="close" size={16} color={Colors.red} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteEvent(item)}>
          <Ionicons name="trash" size={16} color={Colors.red} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOrganizerItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || 'O'}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSub}>{item.email || item.phone || 'No contact'}</Text>
          <Text style={styles.cardSub}>{item.role || 'organiser'} · {item.status}</Text>
        </View>
        {renderStatus(item.status === 'approved' ? 'approved' : item.status === 'rejected' ? 'rejected' : 'pending')}
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => {
          setEditingVip(null);
          Alert.alert('Edit Organiser', 'Use the VIP/member editor to update organiser details.');
        }}>
          <Ionicons name="pencil" size={16} color={Colors.gold} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleApproveOrganizer({ _id: item._id, _creationTime: item._creationTime, type: 'create', status: 'pending', name: item.name })}>
          <Ionicons name="checkmark" size={16} color={Colors.greenLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeclineOrganizer({ _id: item._id, _creationTime: item._creationTime, type: 'create', status: 'pending', name: item.name })}>
          <Ionicons name="close" size={16} color={Colors.red} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteVip(item as any)}>
          <Ionicons name="trash" size={16} color={Colors.red} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProviderItem = ({ item }: { item: Provider }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSub}>{item.companyName || 'Provider'}</Text>
          <Text style={styles.cardSub}>{item.services || 'No services added'}</Text>
          <Text style={styles.cardSub}>{item.email || item.phone || ''}</Text>
        </View>
        {renderStatus(item.status)}
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setProviderEditing(item)}>
          <Ionicons name="pencil" size={16} color={Colors.gold} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => updateProvider(withAdminPin({ id: item._id, status: 'approved' }))}>
          <Ionicons name="checkmark" size={16} color={Colors.greenLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => updateProvider(withAdminPin({ id: item._id, status: 'rejected' }))}>
          <Ionicons name="close" size={16} color={Colors.red} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteProvider(item)}>
          <Ionicons name="trash" size={16} color={Colors.red} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVipItem = ({ item }: { item: Member }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => setVipEditing(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || 'V'}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardMetaLabel}>Full Name</Text>
          <Text style={styles.cardTitle}>{item.name || 'VIP member'}</Text>
          <Text style={styles.cardMetaLabel}>Company</Text>
          <Text style={styles.cardSub}>{item.attendeeCompanyName || item.companyName || 'No company'}</Text>
          <Text style={styles.cardMetaLabel}>Designation</Text>
          <Text style={styles.cardSub}>{item.attendeeDesignation || 'No designation'}</Text>
          <Text style={styles.cardMetaLabel}>Phone</Text>
          <Text style={styles.cardSub}>{getPrimaryPhone(item) || 'No mobile number'}</Text>
          <Text style={styles.cardMetaLabel}>Email</Text>
          <Text style={styles.cardSub}>{item.email || 'No email'}</Text>
          <Text style={styles.cardMetaLabel}>City</Text>
          <Text style={styles.cardSub}>{getVipCity(item) || 'No city'}</Text>
          <Text style={styles.cardMetaLabel}>Province</Text>
          <Text style={styles.cardSub}>{item.attendeeProvince || 'No province'}</Text>
          <Text style={styles.cardMetaLabel}>Favourite event type</Text>
          <Text style={styles.cardSub}>{item.attendeeFavouriteEventType || 'No favourite event type'}</Text>
          {item.notes ? (
            <>
              <Text style={styles.cardMetaLabel}>Notes</Text>
              <Text style={styles.cardSub}>{item.notes}</Text>
            </>
          ) : null}
        </View>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => void openMemberContact('whatsapp', item)}>
          <Ionicons name="logo-whatsapp" size={16} color={Colors.greenLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => void openMemberContact('sms', item)}>
          <Ionicons name="chatbubble-ellipses" size={16} color={Colors.gold} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => void openMemberContact('email', item)}>
          <Ionicons name="mail" size={16} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => void openMemberContact('call', item)}>
          <Ionicons name="call" size={16} color={Colors.gold} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteVip(item)}>
          <Ionicons name="trash" size={16} color={Colors.red} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const handleApproveVip = async (item: Member) => {
    try {
      await approveVipMember(withAdminPin({ id: item._id }));
    } catch {
      Alert.alert('Error', 'Failed to approve VIP member.');
    }
  };

  const handleDeclineVip = async (item: Member) => {
    try {
      await declineVipMember(withAdminPin({ id: item._id }));
    } catch {
      Alert.alert('Error', 'Failed to decline VIP member.');
    }
  };

  if (!isSuperAccess) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.background }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Admin Access</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
        <View style={styles.centerContent}>
          <Ionicons name="shield-checkmark" size={54} color={Colors.gold} />
          <Text style={styles.emptyTitle}>Admin access required</Text>
          <Text style={styles.emptyDesc}>Enter the admin access code from the profile screen to open the dashboard.</Text>
        </View>
      </View>
    );
  }

  if (eventsQuery === undefined || organiserRequestsQuery === undefined || membersQuery === undefined || providersQuery === undefined || vipMembersQuery === undefined) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.background }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={[styles.emptyTitle, { marginTop: 18 }]}>Loading dashboard…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          <TouchableOpacity style={[styles.tabBtn, tab === 'events' && styles.tabBtnActive]} onPress={() => setTab('events')}>
            <Ionicons name="calendar" size={16} color={tab === 'events' ? Colors.black : Colors.textSecondary} />
            {renderTabLabel('All Events', dashboardStats.events, tab === 'events')}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'claimed' && styles.tabBtnActive]} onPress={() => setTab('claimed')}>
            <Ionicons name="bookmark" size={16} color={tab === 'claimed' ? Colors.black : Colors.textSecondary} />
            {renderTabLabel('Claimed Events', dashboardStats.claimed, tab === 'claimed')}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'organisers' && styles.tabBtnActive]} onPress={() => setTab('organisers')}>
            <Ionicons name="business" size={16} color={tab === 'organisers' ? Colors.black : Colors.textSecondary} />
            {renderTabLabel('All Event Organisers', dashboardStats.organisers, tab === 'organisers')}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'providers' && styles.tabBtnActive]} onPress={() => setTab('providers')}>
            <Ionicons name="briefcase" size={16} color={tab === 'providers' ? Colors.black : Colors.textSecondary} />
            {renderTabLabel('All Providers', dashboardStats.providers, tab === 'providers')}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'vip' && styles.tabBtnActive]} onPress={() => setTab('vip')}>
            <Ionicons name="star" size={16} color={tab === 'vip' ? Colors.black : Colors.textSecondary} />
            {renderTabLabel('All VIP Members', dashboardStats.vipMembers, tab === 'vip')}
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.toolbarRow}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${tab}...`}
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              if (tab === 'events') {
                resetEventForm();
                setShowEventModal(true);
              } else if (tab === 'organisers') {
                Alert.alert('Info', 'Organiser records are managed from requests and VIP/member profiles.');
              } else if (tab === 'providers') {
                setProviderEditing(null);
              } else {
                setShowMemberActionsModal(true);
              }
            }}
          >
            <Ionicons name="add" size={18} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color={Colors.gold} />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      ) : null}

      {tab === 'events' ? (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item: any) => item._id}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Events</Text>
              <Text style={styles.sectionSubtitle}>{dashboardStats.events} events listed on the platform. All events start as unclaimed until a claim is approved.</Text>
            </View>
          }
        />
      ) : tab === 'organisers' ? (
        <FlatList
          data={organiserReviewRequests.concat(filteredOrganisers as any)}
          keyExtractor={(item: any) => item._id}
          renderItem={({ item }: { item: any }) => ('type' in item ? renderOrganizerRequestCard(item) : renderOrganizerMemberCard(item))}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Event Organisers</Text>
              <Text style={styles.sectionSubtitle}>{dashboardStats.organisers} organiser records and requests available for review.</Text>
            </View>
          }
        />
      ) : tab === 'claimed' ? (
        <FlatList
          data={filteredClaimedEvents}
          keyExtractor={(item: OrganizerRequest) => item._id}
          renderItem={renderClaimedEventItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Claimed Events</Text>
              <Text style={styles.sectionSubtitle}>{dashboardStats.claimed} event claims waiting for review. Approved claims move into All Events as approved, rejected claims show as declined.</Text>
            </View>
          }
        />
      ) : tab === 'providers' ? (
        <FlatList
          data={filteredProviders}
          keyExtractor={(item: Provider) => item._id}
          renderItem={renderProviderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Providers</Text>
              <Text style={styles.sectionSubtitle}>{dashboardStats.providers} providers listed on the platform. Add, edit, delete, approve and decline providers.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredVip}
          keyExtractor={(item: Member) => item._id}
          renderItem={renderVipItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All VIP Members</Text>
              <Text style={styles.sectionSubtitle}>{dashboardStats.vipMembers} VIP members registered on the app.</Text>
            </View>
          }
        />
      )}

      <Modal visible={showEventModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardWrap}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalContent}>
              <SafeAreaView edges={['top']}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowEventModal(false)}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
                  <Text style={styles.modalTitle}>{editingEvent ? 'Edit Event' : 'Add Event'}</Text>
                  <TouchableOpacity onPress={handleSaveEvent}><Text style={styles.modalSave}>Save</Text></TouchableOpacity>
                </View>
              </SafeAreaView>
              <ScrollView
                style={styles.formScroll}
                contentContainerStyle={styles.formScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets
                keyboardDismissMode="on-drag"
              >
                {(['name', 'date', 'time', 'venue', 'location', 'category', 'description', 'price', 'priceValue'] as const).map((field) => (
                  <View key={field}>
                    <Text style={styles.formLabel}>{field === 'priceValue' ? 'Price Value' : field.toUpperCase()}</Text>
                    <TextInput
                      style={[styles.formInput, field === 'description' && styles.formTextarea]}
                      value={(eventForm as any)[field]}
                      onChangeText={(text: string) => setEventForm((current: typeof eventForm) => ({ ...current, [field]: text }))}
                      multiline={field === 'description'}
                      numberOfLines={field === 'description' ? 4 : 1}
                    />
                  </View>
                ))}
                <Text style={styles.formLabel}>Event images (up to 5)</Text>
                <Text style={styles.sectionSubtitle}>Move images around, replace them, or leave a slot blank. The first image becomes the cover image.</Text>
                <View style={styles.carouselEditor}>
                  {eventForm.images.map((imageUri: string, index: number) => (
                    <View key={`${index}-${imageUri || 'empty'}`} style={styles.carouselSlot}>
                      {imageUri ? <Image source={{ uri: imageUri }} style={styles.carouselPreview} resizeMode="contain" /> : <View style={styles.carouselEmpty}><Ionicons name="image-outline" size={22} color={Colors.textMuted} /></View>}
                      <TextInput
                        style={styles.formInput}
                        value={imageUri}
                        onChangeText={(text: string) => setEventImage(index, text)}
                        placeholder={`Image ${index + 1} URL`}
                        placeholderTextColor={Colors.textMuted}
                      />
                      <View style={styles.carouselActions}>
                        <TouchableOpacity style={styles.carouselActionBtn} onPress={() => pickEventImage(index)}><Ionicons name="image" size={16} color={Colors.gold} /></TouchableOpacity>
                        <TouchableOpacity style={styles.carouselActionBtn} onPress={() => index > 0 && moveEventImage(index, index - 1)} disabled={index === 0}><Ionicons name="arrow-up" size={16} color={index === 0 ? Colors.textMuted : Colors.white} /></TouchableOpacity>
                        <TouchableOpacity style={styles.carouselActionBtn} onPress={() => index < eventForm.images.length - 1 && moveEventImage(index, index + 1)} disabled={index === eventForm.images.length - 1}><Ionicons name="arrow-down" size={16} color={index === eventForm.images.length - 1 ? Colors.textMuted : Colors.white} /></TouchableOpacity>
                        <TouchableOpacity style={styles.carouselActionBtn} onPress={() => removeEventImage(index)}><Ionicons name="close" size={16} color={Colors.red} /></TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={showProviderModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardWrap}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalContent}>
              <SafeAreaView edges={['top']}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowProviderModal(false)}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
                  <Text style={styles.modalTitle}>{editingProvider ? 'Edit Provider' : 'Add Provider'}</Text>
                  <TouchableOpacity onPress={handleSaveProvider}><Text style={styles.modalSave}>Save</Text></TouchableOpacity>
                </View>
              </SafeAreaView>
              <ScrollView style={styles.formScroll} contentContainerStyle={styles.formScrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {(['name', 'companyName', 'email', 'phone', 'services', 'websiteOrSocialLink', 'notes'] as const).map((field) => (
                  <View key={field}>
                    <Text style={styles.formLabel}>{field}</Text>
                    <TextInput style={[styles.formInput, field === 'notes' && styles.formTextarea]} value={providerForm[field]} onChangeText={(text: string) => setProviderForm((current: typeof providerForm) => ({ ...current, [field]: text }))} multiline={field === 'notes'} numberOfLines={field === 'notes' ? 4 : 1} />
                  </View>
                ))}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={showVipModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardWrap}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalContent}>
              <SafeAreaView edges={['top']}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowVipModal(false)}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
                  <Text style={styles.modalTitle}>{editingVip ? 'Edit VIP Member' : 'Add VIP Member'}</Text>
                  <TouchableOpacity onPress={handleSaveVip}><Text style={styles.modalSave}>Save</Text></TouchableOpacity>
                </View>
              </SafeAreaView>
              <ScrollView style={styles.formScroll} contentContainerStyle={styles.formScrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View>
                  <Text style={styles.formLabel}>Category</Text>
                  <TextInput style={styles.formInput} value={vipMemberCategory} editable={false} placeholderTextColor={Colors.textMuted} />
                </View>
                {(['name', 'attendeeCompanyName', 'attendeeDesignation', 'phone', 'email', 'mobileNumbers', 'attendeeCity', 'attendeeProvince', 'attendeeFavouriteEventType', 'notes'] as const).map((field) => (
                  <View key={field}>
                    <Text style={styles.formLabel}>
                      {field === 'name'
                        ? 'Full Name'
                        : field === 'attendeeCompanyName'
                          ? 'Company'
                          : field === 'attendeeDesignation'
                            ? 'Designation'
                            : field === 'phone'
                              ? 'Phone'
                              : field === 'email'
                                ? 'Email'
                                : field === 'mobileNumbers'
                                  ? 'Additional mobile numbers'
                                  : field === 'attendeeCity'
                                    ? 'City'
                                    : field === 'attendeeProvince'
                                      ? 'Province'
                                      : field === 'attendeeFavouriteEventType'
                                        ? 'Favourite event type'
                                        : 'Notes'}
                    </Text>
                    <TextInput style={[styles.formInput, field === 'notes' && styles.formTextarea]} value={vipForm[field]} onChangeText={(text: string) => setVipForm((current: typeof vipForm) => ({ ...current, [field]: text }))} multiline={field === 'notes'} numberOfLines={field === 'notes' ? 4 : 1} />
                  </View>
                ))}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={showMemberActionsModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.memberActionSheet}>
            <Text style={styles.modalTitle}>Add VIP members</Text>
            <Text style={styles.sectionSubtitle}>Choose how you want to add people into VIP membership.</Text>
            <TouchableOpacity style={styles.memberActionBtn} onPress={() => { setShowMemberActionsModal(false); setShowVipModal(true); }}>
              <Ionicons name="person-add" size={18} color={Colors.gold} />
              <Text style={styles.memberActionBtnText}>Add VIP member individually</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.memberActionBtn} onPress={() => { setShowMemberActionsModal(false); setShowMemberImportModal(true); setBulkImportSource('paste'); }}>
              <Ionicons name="clipboard" size={18} color={Colors.greenLight} />
              <Text style={styles.memberActionBtnText}>Paste VIP list from Excel / CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.memberActionBtn} onPress={() => { setShowMemberActionsModal(false); void handlePickMemberFile(); }}>
              <Ionicons name="document-text" size={18} color={Colors.textSecondary} />
              <Text style={styles.memberActionBtnText}>Import VIP list from file</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.memberActionBtn} onPress={() => void handleOpenDeviceContactsImport()}>
              <Ionicons name="people" size={18} color={Colors.white} />
              <Text style={styles.memberActionBtnText}>Select contacts from device</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowMemberActionsModal(false)} style={styles.modalCancelRow}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showDeviceImportModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.memberActionSheet, { maxHeight: '90%' }]}>
            <Text style={styles.modalTitle}>Import from device contacts</Text>
            <Text style={styles.sectionSubtitle}>Select contacts from your device to import into VIP membership.</Text>
            {deviceContactsLoading ? (
              <ActivityIndicator size="large" color={Colors.gold} />
            ) : (
              <>
                <TouchableOpacity style={styles.memberActionBtn} onPress={() => void handleOpenDeviceContactsImport(true, false)}>
                  <Ionicons name="refresh" size={18} color={Colors.gold} />
                  <Text style={styles.memberActionBtnText}>Reload device contacts</Text>
                </TouchableOpacity>
                <View style={styles.selectionToolsRow}>
                  <TouchableOpacity style={styles.selectionToolBtn} onPress={clearDeviceContactSelection}>
                    <Text style={styles.selectionToolText}>Clear selection</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.selectionToolBtn} onPress={selectAllDeviceContacts}>
                    <Text style={styles.selectionToolText}>Select all</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.selectionCountText}>{selectedDeviceContactIds.length} selected</Text>
                <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                  {deviceContacts.map((contact: DeviceImportContact) => {
                    const selected = selectedDeviceContactIds.includes(contact.id);
                    return (
                      <TouchableOpacity
                        key={contact.id}
                        style={[styles.mappingRow, selected && { borderColor: Colors.gold, backgroundColor: Colors.gold + '18' }]}
                        onPress={() => toggleDeviceContactSelection(contact.id)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.mappingColumnLabel}>{contact.name || 'Unnamed contact'}</Text>
                          <Text style={styles.mappingColumnHint}>{[contact.phone, contact.email, contact.companyName].filter(Boolean).join(' · ') || 'No phone or email'}</Text>
                        </View>
                        <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={selected ? Colors.gold : Colors.textMuted} />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity style={styles.primaryImportBtn} onPress={() => void handleImportSelectedDeviceContacts()} disabled={importingMembers || !selectedDeviceContactIds.length}>
                  {importingMembers ? <ActivityIndicator color={Colors.black} /> : <Text style={styles.primaryImportBtnText}>Import selected contacts</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.memberActionBtn} onPress={handleCloseDeviceContactsImport}>
                  <Ionicons name="arrow-back" size={18} color={Colors.white} />
                  <Text style={styles.memberActionBtnText}>Back</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showMemberImportModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <SafeAreaView edges={['top']}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowMemberImportModal(false)}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
                <Text style={styles.modalTitle}>Bulk import VIP members</Text>
                <TouchableOpacity onPress={() => void handleBulkImportMembers(mappedBulkImportRows)} disabled={importingMembers}>
                  <Text style={styles.modalSave}>{importingMembers ? 'Importing…' : 'Import'}</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Category</Text>
              <TextInput style={styles.formInput} value={vipMemberCategory} editable={false} placeholderTextColor={Colors.textMuted} />
              <Text style={styles.formLabel}>Paste VIP spreadsheet rows</Text>
              <Text style={styles.bulkHint}>Standard import fields are Full Name, Company, Designation, City, Mobile Number, and Email. Match columns below before importing. Multiple mobile numbers can be separated by commas or semicolons.</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea, styles.bulkPasteInput]}
                value={bulkImportText}
                onChangeText={setBulkImportText}
                placeholder="Full Name\tCompany\tDesignation\tCity\tMobile Number\tEmail"
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
              <View style={styles.importMappingSection}>
                <View style={styles.importMappingHeaderRow}>
                  <Text style={styles.formLabel}>Match imported columns</Text>
                  <TouchableOpacity onPress={() => setBulkImportMappings(Object.fromEntries(parsedBulkImport.columns.map((column: BulkImportColumn) => [column.key, column.mappedTo])) as Record<string, BulkImportFieldKey>)}>
                    <Text style={styles.mappingResetText}>Auto-match</Text>
                  </TouchableOpacity>
                </View>
                {parsedBulkImport.columns.length ? parsedBulkImport.columns.map((column: BulkImportColumn, index: number) => {
                  const mappedTo = bulkImportMappings[column.key] || column.mappedTo;
                  const option = BULK_IMPORT_FIELD_OPTIONS.find((item) => item.key === mappedTo) || BULK_IMPORT_FIELD_OPTIONS[BULK_IMPORT_FIELD_OPTIONS.length - 1];
                  return (
                    <TouchableOpacity key={column.key} style={styles.mappingRow} onPress={() => setActiveBulkImportColumn(column)}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.mappingColumnLabel}>{column.label}</Text>
                        <Text style={styles.mappingColumnHint}>{column.sample || `Column ${index + 1}`}</Text>
                      </View>
                      <View style={styles.mappingValuePill}>
                        <Text style={styles.mappingValueText}>{option.label}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }) : <Text style={styles.bulkHint}>Paste your spreadsheet rows to start matching fields.</Text>}
              </View>
              <View style={styles.importSourceRow}>
                <TouchableOpacity style={[styles.importSourceBtn, bulkImportSource === 'paste' && styles.importSourceBtnActive]} onPress={() => setBulkImportSource('paste')}>
                  <Text style={[styles.importSourceText, bulkImportSource === 'paste' && styles.importSourceTextActive]}>Paste VIP data</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.importSourceBtn, bulkImportSource === 'file' && styles.importSourceBtnActive]} onPress={() => void handlePickMemberFile()}>
                  <Text style={[styles.importSourceText, bulkImportSource === 'file' && styles.importSourceTextActive]}>VIP file</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.primaryImportBtn} onPress={() => void handleBulkImportMembers(mappedBulkImportRows)} disabled={importingMembers}>
                {importingMembers ? <ActivityIndicator color={Colors.black} /> : <Text style={styles.primaryImportBtnText}>Import rows</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(activeBulkImportColumn)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.memberActionSheet}>
            <Text style={styles.modalTitle}>Match column</Text>
            <Text style={styles.sectionSubtitle}>{activeBulkImportColumn?.label}</Text>
            {BULK_IMPORT_FIELD_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.memberActionBtn}
                onPress={() => {
                  if (activeBulkImportColumn) {
                    setBulkImportMappings((current: Record<string, BulkImportFieldKey>) => ({ ...current, [activeBulkImportColumn.key]: option.key }));
                  }
                  setActiveBulkImportColumn(null);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberActionBtnText}>{option.label}</Text>
                  <Text style={styles.mappingColumnHint}>{option.hint}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setActiveBulkImportColumn(null)} style={styles.modalCancelRow}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  function renderOrganizerRequestCard(item: OrganizerRequest) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.type === 'claim' ? item.eventName || 'Event claim' : item.name || 'Organizer request'}</Text>
            <Text style={styles.cardSub}>{item.date || item.time || item.venue || 'Pending review'}</Text>
          </View>
          {renderStatus(item.status)}
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleApproveOrganizer(item)}><Ionicons name="checkmark" size={16} color={Colors.greenLight} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDeclineOrganizer(item)}><Ionicons name="close" size={16} color={Colors.red} /></TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderOrganizerMemberCard(item: Member) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || 'O'}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSub}>{item.email || getPrimaryPhone(item) || 'No contact'}</Text>
          </View>
          {renderStatus(item.status || 'pending')}
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Edit organiser', 'Use the VIP/member editor to update organiser details if needed.')}>
            <Ionicons name="pencil" size={16} color={Colors.gold} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => updateMember(withAdminPin({ id: item._id, status: 'approved', role: 'organiser' }))}>
            <Ionicons name="checkmark" size={16} color={Colors.greenLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => updateMember(withAdminPin({ id: item._id, status: 'rejected', role: 'organiser' }))}>
            <Ionicons name="close" size={16} color={Colors.red} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteVip(item)}>
            <Ionicons name="trash" size={16} color={Colors.red} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white },
  tabRow: { paddingHorizontal: Spacing.lg, gap: 10, paddingBottom: Spacing.sm },
  tabBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.cardBorder, minWidth: 150 },
  tabBtnActive: { backgroundColor: Colors.gold, borderColor: Colors.gold, shadowColor: Colors.gold, shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  tabLabelWrap: { alignItems: 'center', justifyContent: 'center', gap: 4, flexShrink: 1 },
  tabText: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary, textAlign: 'center' },
  tabTextActive: { color: Colors.black },
  tabCountBadge: { minWidth: 24, paddingHorizontal: 8, height: 20, borderRadius: 10, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  tabCountBadgeActive: { backgroundColor: 'rgba(10,10,10,0.14)' },
  tabCountText: { color: Colors.textSecondary, fontSize: 10, fontWeight: '800' },
  tabCountTextActive: { color: Colors.black },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  statPill: { flexGrow: 1, minWidth: '48%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: BorderRadius.lg, paddingHorizontal: 12, paddingVertical: 10 },
  statValue: { color: Colors.white, fontSize: FontSizes.sm, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  toolbarRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md },
  searchInput: { flex: 1, color: Colors.white, paddingVertical: 10 },
  addBtn: { width: 42, height: 42, borderRadius: BorderRadius.md, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center' },
  loadingBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  loadingText: { color: Colors.gold, fontSize: FontSizes.xs },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  sectionHeader: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: '800' },
  sectionSubtitle: { color: Colors.textSecondary, fontSize: FontSizes.xs, marginTop: 6, lineHeight: 18 },
  card: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.md, marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardTitle: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '800' },
  cardSub: { color: Colors.textSecondary, fontSize: FontSizes.xs, marginTop: 4 },
  cardMetaLabel: { color: Colors.gold, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginTop: 6 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: Spacing.md },
  actionButton: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusApproved: { backgroundColor: Colors.green + '20' },
  statusPending: { backgroundColor: Colors.gold + '20' },
  statusClaimed: { backgroundColor: Colors.gold + '20' },
  statusUnclaimed: { backgroundColor: Colors.textMuted + '25' },
  statusRejected: { backgroundColor: Colors.red + '20' },
  statusText: { color: Colors.white, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gold + '20', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.gold, fontWeight: '800' },
  previewImage: { width: '100%', borderRadius: 14, marginTop: 12, backgroundColor: 'transparent' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalKeyboardWrap: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  modalContent: { flex: 1, backgroundColor: Colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  modalCancel: { color: Colors.textSecondary, fontSize: FontSizes.md },
  modalTitle: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '800' },
  modalSave: { color: Colors.gold, fontSize: FontSizes.md, fontWeight: '800' },
  formScroll: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  formScrollContent: { paddingBottom: 180 },
  formLabel: { color: Colors.textSecondary, fontSize: FontSizes.xs, fontWeight: '700', marginTop: 14, marginBottom: 6 },
  formInput: { backgroundColor: Colors.surface, color: Colors.white, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 12 },
  formTextarea: { minHeight: 90, textAlignVertical: 'top' },
  carouselEditor: { gap: 12, marginTop: 8, marginBottom: 8 },
  carouselSlot: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: BorderRadius.lg, padding: Spacing.md, gap: 10 },
  carouselPreview: { width: '100%', height: 160, borderRadius: BorderRadius.md, backgroundColor: Colors.card, objectFit: 'contain' },
  carouselEmpty: { width: '100%', height: 160, borderRadius: BorderRadius.md, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  carouselActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  carouselActionBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  bulkHint: { color: Colors.textSecondary, fontSize: FontSizes.xs, marginTop: 4, marginBottom: 4 },
  bulkPasteInput: { minHeight: 180 },
  importMappingSection: { marginTop: 14, gap: 10 },
  importMappingHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mappingResetText: { color: Colors.gold, fontSize: FontSizes.xs, fontWeight: '800' },
  mappingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.md, borderRadius: BorderRadius.lg, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 8 },
  mappingColumnLabel: { color: Colors.white, fontSize: FontSizes.sm, fontWeight: '800' },
  mappingColumnHint: { color: Colors.textSecondary, fontSize: FontSizes.xs, marginTop: 4 },
  mappingValuePill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.gold },
  mappingValueText: { color: Colors.black, fontSize: FontSizes.xs, fontWeight: '800' },
  importSourceRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  importSourceBtn: { flex: 1, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.cardBorder, backgroundColor: Colors.surface, paddingVertical: 10, alignItems: 'center' },
  importSourceBtnActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  importSourceText: { color: Colors.textSecondary, fontSize: FontSizes.xs, fontWeight: '800' },
  importSourceTextActive: { color: Colors.black },
  primaryImportBtn: { marginTop: 14, borderRadius: BorderRadius.md, backgroundColor: Colors.gold, paddingVertical: 14, alignItems: 'center' },
  primaryImportBtnText: { color: Colors.black, fontSize: FontSizes.md, fontWeight: '800' },
  emptyTitle: { marginTop: 16, color: Colors.white, fontSize: FontSizes.lg, fontWeight: '800', textAlign: 'center' },
  emptyDesc: { marginTop: 8, color: Colors.textSecondary, fontSize: FontSizes.sm, textAlign: 'center' },
  viewSwitcherWrap: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.gold + '35', backgroundColor: Colors.surface, padding: Spacing.md },
  viewSwitcherHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  viewSwitcherLabel: { color: Colors.gold, fontSize: FontSizes.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.1 },
  viewSwitcherSubtitle: { color: Colors.textSecondary, fontSize: FontSizes.sm, marginTop: 4, lineHeight: 18, paddingRight: Spacing.sm },
  viewSwitcherBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.gold, borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  viewSwitcherBadgeText: { color: Colors.black, fontSize: FontSizes.xs, fontWeight: '900', textTransform: 'uppercase' },
  viewSwitcherRow: { flexDirection: 'row', gap: 8 },
  viewSwitcherBtn: { flex: 1, minWidth: 0, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.cardBorder, backgroundColor: Colors.background, paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center', gap: 4 },
  viewSwitcherBtnActive: { borderColor: Colors.gold, backgroundColor: Colors.gold + '18' },
  viewSwitcherText: { color: Colors.white, fontSize: FontSizes.xs, fontWeight: '800', textAlign: 'center' },
  viewSwitcherTextActive: { color: Colors.gold },
  viewSwitcherHelperText: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  viewSwitcherHelperTextActive: { color: Colors.gold },
  returnAdminBtn: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: BorderRadius.md, backgroundColor: Colors.gold, paddingVertical: 12 },
  returnAdminText: { color: Colors.black, fontSize: FontSizes.xs, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6 },
  memberActionSheet: { backgroundColor: Colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg, borderTopWidth: 1, borderColor: Colors.cardBorder },
  memberActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.lg, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.cardBorder, marginTop: 10 },
  memberActionBtnText: { color: Colors.white, fontSize: FontSizes.sm, fontWeight: '700' },
  selectionToolsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  selectionToolBtn: { flex: 1, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.cardBorder, backgroundColor: Colors.surface, paddingVertical: 10, alignItems: 'center' },
  selectionToolText: { color: Colors.white, fontSize: FontSizes.xs, fontWeight: '800' },
  selectionCountText: { color: Colors.textSecondary, fontSize: FontSizes.xs, fontWeight: '700', marginTop: 10, marginBottom: 6 },
  modalCancelRow: { alignItems: 'center', paddingVertical: 14, marginTop: 6 },
});
