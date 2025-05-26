import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useUser } from '../contexts/UserContext';
import { colors, typography, spacing, shadows } from '../theme';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { user, clearUser } = useUser();

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.title}>{user.name}</Text>
        <Text style={styles.subtitle}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Account Information</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{user.username}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email || 'Not provided'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="settings-outline" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>App Settings</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>App Version</Text>
              <Text style={styles.settingDescription}>Current version of the app</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Support</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.supportRow}>
            <Ionicons name="mail-outline" size={24} color={colors.primary} />
            <View style={styles.supportInfo}>
              <Text style={styles.supportTitle}>Contact Support</Text>
              <Text style={styles.supportDescription}>Get help with your account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </View>
          
          <View style={styles.supportRow}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
            <View style={styles.supportInfo}>
              <Text style={styles.supportTitle}>Documentation</Text>
              <Text style={styles.supportDescription}>Learn how to use the app</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </View>
        </View>
      </View>
      
      <View style={styles.actionSection}>
        <Button
          title="Sign Out"
          variant="outline"
          icon={<Ionicons name="log-out-outline" size={20} color={colors.error} />}
          onPress={clearUser}
          style={styles.signOutButton}
          textStyle={{ color: colors.error }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 36,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    ...shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  roleBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
  },
  roleText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  settingValue: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  supportInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  supportTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  supportDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  actionSection: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  signOutButton: {
    borderColor: colors.error,
  },
});