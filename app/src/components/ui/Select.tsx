import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Button, Menu, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface SelectItem {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: SelectItem[];
  style?: ViewStyle;
}

export function Select({ label, value, onValueChange, items, style }: SelectProps) {
  const [visible, setVisible] = useState(false);
  const selectedItem = items.find(item => item.value === value);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View style={[styles.container, style]}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={openMenu}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            <View style={styles.buttonInner}>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.label} numberOfLines={1}>
                  {label}
                </Text>
                <Text style={styles.value} numberOfLines={1}>
                  {selectedItem?.label || 'Select...'}
                </Text>
              </View>
            </View>
          </Button>
        }
        style={styles.menu}
      >
        {items.map((item) => (
          <Menu.Item
            key={item.value}
            onPress={() => {
              onValueChange(item.value);
              closeMenu();
            }}
            title={item.label}
            titleStyle={[
              styles.menuItem,
              item.value === value && styles.menuItemSelected
            ]}
          />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 150,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: colors.white,
  },
  buttonContent: {
    height: '100%',
  },
  buttonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  buttonTextContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    width: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  value: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.medium,
  },
  menu: {
    width: '50%',
    maxWidth: 280,
  },
  menuItem: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  menuItemSelected: {
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
});