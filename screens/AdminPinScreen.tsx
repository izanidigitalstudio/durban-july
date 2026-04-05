import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';

const ADMIN_PIN = '1977';

export default function AdminPinScreen() {
  const navigation = useNavigation<any>();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (pin === ADMIN_PIN) {
      setError(false);
      setPin('');
      navigation.replace('AdminDashboard');
    } else {
      setError(true);
      setPin('');
      Alert.alert('Access Denied', 'Incorrect PIN. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
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
        <Text style={styles.title}>Super Admin</Text>
        <Text style={styles.subtitle}>Enter your admin PIN to access the dashboard</Text>

        <TextInput
          style={[styles.pinInput, error && styles.pinInputError]}
          value={pin}
          onChangeText={(t) => { setPin(t); setError(false); }}
          placeholder="Enter PIN"
          placeholderTextColor={Colors.textMuted}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          autoFocus
        />

        <TouchableOpacity
          style={[styles.submitBtn, pin.length < 4 && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={pin.length < 4}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>Access Dashboard</Text>
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
  subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xxxl },
  pinInput: {
    width: '100%', backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.xl, paddingVertical: 16,
    color: Colors.white, fontSize: FontSizes.xxl, textAlign: 'center',
    letterSpacing: 12, fontWeight: '700',
  },
  pinInputError: { borderColor: Colors.red },
  submitBtn: {
    width: '100%', backgroundColor: Colors.gold, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.xl,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.black },
});
