import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConvexReactClient } from 'convex/react';

export const CONVEX_URL = 'https://dapper-impala-619.convex.cloud';

export const convex = new ConvexReactClient(CONVEX_URL);
export const convexAuthStorage = AsyncStorage;
