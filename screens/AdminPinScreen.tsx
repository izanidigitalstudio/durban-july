import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';

const ADMIN_PIN = '1977';

type Props = {
  route?: {
    params?: {
      returnTo?: string;
    };
  };
};

export default function AdminPinScreen({ route }: Props) {
  const navigation = useNavigation<any>();
  const returnTo = route?.params?.returnTo;
  const [pin, setPin] = useState('');

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

  const unlockAdmin = async () => {
    if (pin.trim() !== ADMIN_PIN) {
      Alert.alert('Incorrect code', 'Please enter the correct admin access code.');
      return;
    }

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'AdminDashboard',
          params: { accessPin: ADMIN_PIN },
        },
      ],
    });
  };

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

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.lockIcon}>
          <Ionicons name="shield-checkmark" size={48} color={Colors.gold} />
        </View>
        <Text style={styles.title}>Admin access</Text>
        <Text style={styles.subtitle}>Enter the access code to open the dashboard.</Text>

        <TextInput
          style={styles.pinInput}
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          placeholder="Enter code"
          placeholderTextColor={Colors.textMuted}
        />
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={unlockAdmin}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>Open Dashboard</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  lockIcon: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.gold + '15', borderWidth: 2, borderColor: Colors.gold + '30',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
  },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.white, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  pinInput: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 16,
    color: Colors.white,
    fontSize: FontSizes.lg,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: Spacing.lg,
  },
  submitBtn: {
    width: '100%', backgroundColor: Colors.gold, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.sm,
  },
  submitBtnText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.black },
});