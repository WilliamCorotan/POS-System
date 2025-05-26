import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useUser } from '../contexts/UserContext';
import { colors, typography, spacing, shadows } from '../theme';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { API_URL, createHeaders } from '../api/config';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: { clerkId: string };
};

type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const endpoint = `${API_URL}/users`;

export default function LoginScreen() {
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const route = useRoute<LoginScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const clerkId = route.params?.clerkId;

  console.log(clerkId, 'clerkId');
  console.log(endpoint, 'endpoint');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    console.log(createHeaders(clerkId), 'createHeaders');
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: createHeaders(clerkId),
        body: JSON.stringify({
          email,
          password,
          clerkId, // Include the clerkId in the request
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Transform the API response to match our User type
      const userData = {
        id: data.id,
        username: data.email.split('@')[0],
        role: 'cashier' as const,
        name: data.name,
        email: data.email,
        clerkId: data.clerkId,
      };
      
      await setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="cart" size={64} color={colors.primary} />
          <Text style={styles.title}>POS System</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
          {clerkId && (
            <Text style={styles.clerkId}>Clerk ID: {clerkId}</Text>
          )}
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon icon="email" />}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry
            left={<TextInput.Icon icon="lock-outline" />}
          />

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  clerkId: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    marginTop: spacing.sm,
    fontFamily: typography.fontFamily.medium,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.white,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: spacing.md,
  },
}); 