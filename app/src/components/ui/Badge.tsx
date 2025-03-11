import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  outlined?: boolean;
}

export function Badge({ 
  label, 
  variant = 'primary', 
  size = 'medium',
  outlined = false 
}: BadgeProps) {
  return (
    <View style={[
      styles.badge,
      styles[variant],
      styles[size],
      outlined && styles.outlined,
      outlined && styles[`${variant}Outlined`],
    ]}>
      <Text style={[
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        outlined && styles[`${variant}OutlinedText`],
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    alignSelf: 'flex-start',
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  success: {
    backgroundColor: colors.success,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  error: {
    backgroundColor: colors.error,
  },
  info: {
    backgroundColor: colors.info,
  },
  // Outlined variants
  primaryOutlined: {
    borderColor: colors.primary,
  },
  secondaryOutlined: {
    borderColor: colors.secondary,
  },
  successOutlined: {
    borderColor: colors.success,
  },
  warningOutlined: {
    borderColor: colors.warning,
  },
  errorOutlined: {
    borderColor: colors.error,
  },
  infoOutlined: {
    borderColor: colors.info,
  },
  // Sizes
  small: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 4,
  },
  medium: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  large: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  // Text styles
  text: {
    fontFamily: typography.fontFamily.medium,
    color: colors.white,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  successText: {
    color: colors.white,
  },
  warningText: {
    color: colors.white,
  },
  errorText: {
    color: colors.white,
  },
  infoText: {
    color: colors.white,
  },
  // Outlined text styles
  primaryOutlinedText: {
    color: colors.primary,
  },
  secondaryOutlinedText: {
    color: colors.secondary,
  },
  successOutlinedText: {
    color: colors.success,
  },
  warningOutlinedText: {
    color: colors.warning,
  },
  errorOutlinedText: {
    color: colors.error,
  },
  infoOutlinedText: {
    color: colors.info,
  },
  // Text sizes
  smallText: {
    fontSize: typography.fontSize.xs,
  },
  mediumText: {
    fontSize: typography.fontSize.sm,
  },
  largeText: {
    fontSize: typography.fontSize.md,
  },
});