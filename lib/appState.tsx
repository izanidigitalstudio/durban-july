import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react';
import { useMutation, useQuery } from 'convex/react';

import { EventItem, events as staticEvents } from './data';
import { api } from '../convex/_generated/api';

const STORAGE_KEY = '@durban_july_webapp_state';

export type AppUser = {
  id: string;
  email: string;
  password?: string;
  name: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
};

export type ManagedEvent = EventItem & {
  _id: string;
  isActive: boolean;
};

export type Member = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  status: 'active' | 'invited';
};

export type Inquiry = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  itemType: string;
  itemId: string;
  itemName: string;
  guests: number;
  message: string;
  createdAt: number;
};

type StoredState = {
  isGuest: boolean;
  currentUserId: string | null;
  users: AppUser[];
  scheduleByUser: Record<string, string[]>;
  inquiries: Inquiry[];
  events: ManagedEvent[];
  members: Member[];
};

type EventInput = Omit<ManagedEvent, '_id' | 'id' | 'isActive'> & {
  priceValue: number;
  highlights: string[];
};

type EventUpdate = Partial<EventInput> & {
  id: string;
  isActive?: boolean;
};

type AppStateValue = {
  isReady: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
  currentUser: AppUser | null;
  scheduleIds: string[];
  activeEvents: ManagedEvent[];
  adminEvents: ManagedEvent[];
  members: Member[];
  inquiries: Inquiry[];
  enterGuest: () => Promise<void>;
  exitGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (input: { displayName: string; bio: string; profileImageUrl?: string }) => Promise<void>;
  toggleEvent: (input: { eventId: string }) => Promise<string[]>;
  clearSchedule: () => Promise<void>;
  createInquiry: (input: Omit<Inquiry, '_id' | 'createdAt'>) => Promise<void>;
  seedEvents: (input: { events: EventInput[] }) => Promise<number>;
  createEvent: (input: EventInput) => Promise<void>;
  updateEvent: (input: EventUpdate) => Promise<void>;
  deleteEvent: (input: { id: string }) => Promise<void>;
  addMember: (input: Omit<Member, '_id' | 'status'>) => Promise<void>;
  deleteMember: (input: { id: string }) => Promise<void>;
  bulkAddMembers: (input: { members: Array<Omit<Member, '_id' | 'status'>> }) => Promise<number>;
};

const AppStateContext = createContext<AppStateValue | null>(null);

function mapStaticEvent(event: EventItem): ManagedEvent {
  return {
    ...event,
    _id: `event-${event.id}`,
    isActive: true,
  };
}

function createInitialState(): StoredState {
  return {
    isGuest: false,
    currentUserId: null,
    users: [],
    scheduleByUser: {},
    inquiries: [],
    events: staticEvents.map(mapStaticEvent),
    members: [],
  };
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeState(input: Partial<StoredState> | null | undefined): StoredState {
  const initial = createInitialState();

  return {
    isGuest: false,
    currentUserId: input?.currentUserId ?? initial.currentUserId,
    users: input?.users ?? initial.users,
    scheduleByUser: input?.scheduleByUser ?? initial.scheduleByUser,
    inquiries: input?.inquiries ?? initial.inquiries,
    events: input?.events?.length ? input.events : initial.events,
    members: input?.members ?? initial.members,
  };
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredState>(createInitialState);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const { signOut: convexSignOut } = useAuthActions();
  const remoteProfile = useQuery(api.users.getProfile, isAuthenticated ? {} : 'skip');
  const updateRemoteProfile = useMutation(api.users.updateProfile);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!isMounted) {
          return;
        }

        if (!value) {
          setState(createInitialState());
          setIsStorageReady(true);
          return;
        }

        const parsed = JSON.parse(value) as Partial<StoredState>;
        setState(sanitizeState(parsed));
        setIsStorageReady(true);
      })
      .catch(() => {
        if (isMounted) {
          setState(createInitialState());
          setIsStorageReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isStorageReady) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {
      // Best-effort persistence for the web app.
    });
  }, [isStorageReady, state]);

  const currentUser = useMemo<AppUser | null>(() => {
    if (!isAuthenticated || !remoteProfile) {
      return null;
    }

    return {
      id: String(remoteProfile._id),
      email: remoteProfile.email ?? '',
      name: remoteProfile.name ?? remoteProfile.displayName ?? 'VIP Member',
      displayName: remoteProfile.displayName,
      bio: remoteProfile.bio,
      profileImageUrl: remoteProfile.profileImageUrl ?? remoteProfile.image ?? '',
    };
  }, [isAuthenticated, remoteProfile]);

  const currentUserId = currentUser?.id ?? null;
  const isReady = isStorageReady
    && !isAuthLoading
    && (!isAuthenticated || remoteProfile !== undefined);

  const scheduleIds = useMemo(() => {
    if (!currentUserId) {
      return [];
    }

    return state.scheduleByUser[currentUserId] ?? [];
  }, [currentUserId, state.scheduleByUser]);

  const value = useMemo<AppStateValue>(() => ({
    isReady,
    isGuest: state.isGuest,
    isAuthenticated,
    currentUser,
    scheduleIds,
    activeEvents: state.events.filter((event) => event.isActive),
    adminEvents: state.events,
    members: state.members,
    inquiries: state.inquiries,
    enterGuest: async () => {
      setState((current) => ({
        ...current,
        isGuest: true,
      }));
    },
    exitGuest: async () => {
      setState((current) => ({
        ...current,
        isGuest: false,
      }));
    },
    signOut: async () => {
      await convexSignOut();
      setState((current) => ({
        ...current,
        isGuest: false,
        currentUserId: null,
      }));
    },
    updateProfile: async ({ displayName, bio }) => {
      if (!currentUserId) {
        throw new Error('You must be signed in.');
      }
      await updateRemoteProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
    },
    toggleEvent: async ({ eventId }) => {
      if (!currentUserId) {
        throw new Error('Sign in required.');
      }

      let nextIds: string[] = [];

      setState((current) => {
        const existingIds = current.scheduleByUser[currentUserId] ?? [];
        const hasEvent = existingIds.includes(eventId);
        nextIds = hasEvent
          ? existingIds.filter((id) => id !== eventId)
          : [...existingIds, eventId];

        return {
          ...current,
          scheduleByUser: {
            ...current.scheduleByUser,
            [currentUserId]: nextIds,
          },
        };
      });

      return nextIds;
    },
    clearSchedule: async () => {
      if (!currentUserId) {
        return;
      }

      setState((current) => ({
        ...current,
        scheduleByUser: {
          ...current.scheduleByUser,
          [currentUserId]: [],
        },
      }));
    },
    createInquiry: async (input) => {
      setState((current) => ({
        ...current,
        inquiries: [
          {
            ...input,
            _id: makeId('inquiry'),
            createdAt: Date.now(),
          },
          ...current.inquiries,
        ],
      }));
    },
    seedEvents: async ({ events }) => {
      const existingEvents = new Set(state.events.map((event) => `${event.name}|${event.date}`));
      const toAdd = events.filter((event) => !existingEvents.has(`${event.name}|${event.date}`));

      if (!toAdd.length) {
        return 0;
      }

      setState((current) => ({
        ...current,
        events: [
          ...current.events,
          ...toAdd.map((event) => ({
            ...event,
            id: makeId('event'),
            _id: makeId('event'),
            isActive: true,
          })),
        ],
      }));

      return toAdd.length;
    },
    createEvent: async (input) => {
      const id = makeId('event');
      setState((current) => ({
        ...current,
        events: [
          {
            ...input,
            id,
            _id: id,
            isActive: true,
          },
          ...current.events,
        ],
      }));
    },
    updateEvent: async ({ id, ...updates }) => {
      setState((current) => ({
        ...current,
        events: current.events.map((event) =>
          event._id === id
            ? {
                ...event,
                ...updates,
              }
            : event
        ),
      }));
    },
    deleteEvent: async ({ id }) => {
      const event = state.events.find((item) => item._id === id);

      setState((current) => ({
        ...current,
        events: current.events.filter((item) => item._id !== id),
        scheduleByUser: event
          ? Object.fromEntries(
              Object.entries(current.scheduleByUser).map(([userId, ids]) => [
                userId,
                ids.filter((eventId) => eventId !== event.id),
              ])
            )
          : current.scheduleByUser,
      }));
    },
    addMember: async ({ name, email, phone }) => {
      setState((current) => ({
        ...current,
        members: [
          {
            _id: makeId('member'),
            name: name.trim(),
            email: email?.trim(),
            phone: phone?.trim(),
            status: 'active',
          },
          ...current.members,
        ],
      }));
    },
    deleteMember: async ({ id }) => {
      setState((current) => ({
        ...current,
        members: current.members.filter((member) => member._id !== id),
      }));
    },
    bulkAddMembers: async ({ members }) => {
      const sanitized = members
        .map((member) => ({
          name: member.name.trim(),
          email: member.email?.trim(),
          phone: member.phone?.trim(),
        }))
        .filter((member) => member.name);

      if (!sanitized.length) {
        return 0;
      }

      setState((current) => ({
        ...current,
        members: [
          ...sanitized.map((member) => ({
            _id: makeId('member'),
            ...member,
            status: 'active' as const,
          })),
          ...current.members,
        ],
      }));

      return sanitized.length;
    },
  }), [
    convexSignOut,
    currentUser,
    currentUserId,
    isAuthenticated,
    isReady,
    scheduleIds,
    state,
    updateRemoteProfile,
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppData must be used within AppStateProvider.');
  }

  return context;
}
