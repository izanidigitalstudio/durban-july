import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/theme';
import { useAppData } from '../lib/appState';

export default function AuthScreen({ navigation }: any) {
  const { signIn } = useAppData();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }
    if (mode === 'signUp' && !name.trim()) {
      Alert.alert('Missing Fields', 'Please enter your name.');
      return;
    }

    try {
      setLoading(true);
      await signIn({
        email: email.trim().toLowerCase(),
        password,
        flow: mode,
        ...(mode === 'signUp' ? { name: name.trim() } : {}),
      });
    } catch (e: any) {
      const msg = e?.message || 'Something went wrong. Please try again.';
      Alert.alert(mode === 'signIn' ? 'Sign In Failed' : 'Sign Up Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>

            <View style={styles.headerArea}>
              <View style={styles.iconBadge}>
                <Ionicons name="mail-outline" size={28} color={Colors.gold} />
              </View>
              <Text style={styles.title}>
                {mode === 'signIn' ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={styles.subtitle}>
                {mode === 'signIn'
                  ? 'Sign in to access your VIP profile'
                  : 'Join to save inquiries and manage your Durban July experience'}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {mode === 'signUp' && (
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={Colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.black} />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {mode === 'signIn' ? 'Sign In' : 'Create Account'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Switch Mode */}
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {mode === 'signIn' ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <TouchableOpacity onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}>
                <Text style={styles.switchLink}>
                  {mode === 'signIn' ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { padding: Spacing.xxl, flexGrow: 1 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: Spacing.xxl,
  },
  headerArea: { marginBottom: Spacing.xxxl },
  iconBadge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.gold + '15', borderWidth: 1, borderColor: Colors.gold + '40',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  title: { fontSize: FontSizes.xxxl, fontWeight: '800', color: Colors.white, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 22 },
  form: { gap: Spacing.lg, marginBottom: Spacing.xxl },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.lg,
  },
  inputIcon: { marginRight: Spacing.md },
  input: {
    flex: 1, color: Colors.white, fontSize: FontSizes.md,
    paddingVertical: 16,
  },
  eyeBtn: { padding: Spacing.sm },
  submitBtn: {
    backgroundColor: Colors.gold, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.sm,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.black },
  switchRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: Spacing.sm, marginTop: Spacing.lg,
  },
  switchText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  switchLink: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '700' },
});
