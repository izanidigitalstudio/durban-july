import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { EventItem, events as staticEvents } from './data';

const STORAGE_KEY = '@durban_july_webapp_state';

export type AppUser = {
  id: string;
  email: string;
  password: string;
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

type AuthInput = {
  email: string;
  password: string;
  flow: 'signIn' | 'signUp';
  name?: string;
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
  signIn: (input: AuthInput) => Promise<void>;
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
    isGuest: input?.isGuest ?? initial.isGuest,
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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!isMounted) {
          return;
        }

        if (!value) {
          setState(createInitialState());
          setIsReady(true);
          return;
        }

        const parsed = JSON.parse(value) as Partial<StoredState>;
        setState(sanitizeState(parsed));
        setIsReady(true);
      })
      .catch(() => {
        if (isMounted) {
          setState(createInitialState());
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {
      // Best-effort persistence for the web app.
    });
  }, [isReady, state]);

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === state.currentUserId) ?? null,
    [state.currentUserId, state.users]
  );

  const scheduleIds = useMemo(() => {
    if (!state.currentUserId) {
      return [];
    }

    return state.scheduleByUser[state.currentUserId] ?? [];
  }, [state.currentUserId, state.scheduleByUser]);

  const value = useMemo<AppStateValue>(() => ({
    isReady,
    isGuest: state.isGuest,
    isAuthenticated: Boolean(currentUser),
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
    signIn: async ({ email, password, flow, name }) => {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail || !password.trim()) {
        throw new Error('Email and password are required.');
      }

      if (flow === 'signUp') {
        if (!name?.trim()) {
          throw new Error('Name is required.');
        }

        if (state.users.some((user) => user.email === normalizedEmail)) {
          throw new Error('An account with that email already exists.');
        }

        const newUser: AppUser = {
          id: makeId('user'),
          email: normalizedEmail,
          password,
          name: name.trim(),
          displayName: name.trim(),
          bio: '',
          profileImageUrl: '',
        };

        setState((current) => ({
          ...current,
          isGuest: false,
          currentUserId: newUser.id,
          users: [...current.users, newUser],
        }));
        return;
      }

      const existingUser = state.users.find(
        (user) => user.email === normalizedEmail && user.password === password
      );

      if (!existingUser) {
        throw new Error('Invalid email or password.');
      }

      setState((current) => ({
        ...current,
        isGuest: false,
        currentUserId: existingUser.id,
      }));
    },
    signOut: async () => {
      setState((current) => ({
        ...current,
        currentUserId: null,
      }));
    },
    updateProfile: async ({ displayName, bio, profileImageUrl }) => {
      if (!state.currentUserId) {
        throw new Error('You must be signed in.');
      }

      setState((current) => ({
        ...current,
        users: current.users.map((user) =>
          user.id === current.currentUserId
            ? {
                ...user,
                displayName: displayName.trim(),
                bio: bio.trim(),
                profileImageUrl: profileImageUrl?.trim() ?? '',
              }
            : user
        ),
      }));
    },
    toggleEvent: async ({ eventId }) => {
      if (!state.currentUserId) {
        throw new Error('Sign in required.');
      }

      let nextIds: string[] = [];

      setState((current) => {
        const existingIds = current.scheduleByUser[current.currentUserId as string] ?? [];
        const hasEvent = existingIds.includes(eventId);
        nextIds = hasEvent
          ? existingIds.filter((id) => id !== eventId)
          : [...existingIds, eventId];

        return {
          ...current,
          scheduleByUser: {
            ...current.scheduleByUser,
            [current.currentUserId as string]: nextIds,
          },
        };
      });

      return nextIds;
    },
    clearSchedule: async () => {
      if (!state.currentUserId) {
        return;
      }

      setState((current) => ({
        ...current,
        scheduleByUser: {
          ...current.scheduleByUser,
          [current.currentUserId as string]: [],
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
  }), [currentUser, isReady, scheduleIds, state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppData must be used within AppStateProvider.');
  }

  return context;
}
