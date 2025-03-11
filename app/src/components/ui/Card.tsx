import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, shadows, spacing } from '../../theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, variant = 'default', style, ...props }: CardProps) {
  return (
    <View 
      style={[
        styles.card, 
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.card.borderRadius,
    padding: spacing.card.padding,
    margin: spacing.card.margin,
    ...shadows.sm,
  },
  elevated: {
    ...shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.none,
  },
});