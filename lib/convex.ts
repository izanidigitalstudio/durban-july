import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConvexReactClient } from 'convex/react';

export const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  throw new Error('Missing EXPO_PUBLIC_CONVEX_URL environment variable.');
}

export const convex = new ConvexReactClient(CONVEX_URL);
export const convexAuthStorage = AsyncStorage;
