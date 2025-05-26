import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useUser } from '../../contexts/UserContext';
import { colors, typography, spacing } from '../../theme';
import { Button } from '../ui/Button';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type RootTabParamList = {
  Cart: undefined;
  Products: undefined;
  Transactions: undefined;
  Settings: undefined;
};

type NavigationProp = BottomTabNavigationProp<RootTabParamList>;

type RequireAuthProps = {
  children: React.ReactNode;
  fallbackMessage?: string;
};

export function RequireAuth({ children, fallbackMessage = 'Please sign in to continue' }: RequireAuthProps) {
  const { user } = useUser();
  const navigation = useNavigation<NavigationProp>();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>{fallbackMessage}</Text>
        <Button
          title="Sign In"
          onPress={() => navigation.navigate('Settings')}
          style={styles.button}
        />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  message: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    minWidth: 200,
  },
}); 