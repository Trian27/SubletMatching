import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { isSupabaseConfigured, supabase } from '@/src/api/supabase';

export default function AccountScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    if (!supabase) return;
    setIsSubmitting(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setMessage(error.message);
    else setMessage('Signed in successfully.');
    setIsSubmitting(false);
  };

  const sendReset = async () => {
    if (!supabase) return;
    const targetEmail = (userEmail || email).trim();
    if (!targetEmail) {
      setMessage('Enter an email first.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(targetEmail);
    if (error) setMessage(error.message);
    else setMessage('Password reset email sent.');
    setIsSubmitting(false);
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMessage('Signed out.');
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Account</Text>

      {!isSupabaseConfigured ? (
        <Text style={styles.warning}>
          Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to use auth.
        </Text>
      ) : null}

      {userEmail ? (
        <View style={styles.card}>
          <Text style={styles.label}>Signed in as</Text>
          <Text style={styles.email}>{userEmail}</Text>
          <Pressable onPress={sendReset} style={styles.buttonSecondary}>
            <Text style={styles.buttonSecondaryText}>Send password reset email</Text>
          </Pressable>
          <Pressable onPress={signOut} style={styles.buttonGhost}>
            <Text style={styles.buttonGhostText}>Sign out</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter password"
          />

          <Pressable onPress={signIn} style={styles.buttonPrimary} disabled={isSubmitting}>
            <Text style={styles.buttonPrimaryText}>{isSubmitting ? 'Please wait…' : 'Sign in'}</Text>
          </Pressable>

          <Pressable onPress={sendReset} style={styles.buttonSecondary} disabled={isSubmitting}>
            <Text style={styles.buttonSecondaryText}>Forgot password</Text>
          </Pressable>
        </View>
      )}

      {!!message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc', padding: 16, gap: 12 },
  title: { fontSize: 26, fontWeight: '700', color: '#0f172a' },
  warning: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fdba74',
    borderRadius: 12,
    color: '#9a3412',
    padding: 10,
  },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 10 },
  label: { color: '#475569', fontSize: 13 },
  email: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  buttonPrimary: { backgroundColor: '#cc0033', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  buttonPrimaryText: { color: '#fff', fontWeight: '700' },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonSecondaryText: { color: '#0f172a', fontWeight: '600' },
  buttonGhost: { paddingVertical: 10, alignItems: 'center' },
  buttonGhostText: { color: '#64748b', fontWeight: '600' },
  message: { color: '#334155', marginTop: 4 },
});
