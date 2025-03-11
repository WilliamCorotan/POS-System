import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Dialog, Text, RadioButton } from 'react-native-paper';
import { PaymentMethod } from '../types';
import { colors, typography, spacing, shadows } from '../theme';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Ionicons } from '@expo/vector-icons';

interface CheckoutDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onCheckout: (paymentMethodId: number, cashReceived: number, referenceNumber?: string) => void;
  total: number;
  paymentMethods: PaymentMethod[];
}

export function CheckoutDialog({ 
  visible, 
  onDismiss, 
  onCheckout, 
  total, 
  paymentMethods 
}: CheckoutDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<number | null>(
    paymentMethods[0]?.id || null
  );
  const [cashReceived, setCashReceived] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const change = cashReceivedNum - total;

  // Reset reference number when payment method changes
  useEffect(() => {
    setReferenceNumber('');
  }, [selectedMethod]);

  const handleCheckout = () => {
    if (!selectedMethod) return;
    
    // Get the selected payment method name
    const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod);
    const isGcash = selectedPaymentMethod?.name.toLowerCase() === 'gcash';
    
    // Validate reference number for GCash
    if (isGcash && !referenceNumber.trim()) {
      alert('Please enter a GCash reference number');
      return;
    }
    
    // For cash payments, ensure cash received is sufficient
    if (!isGcash && cashReceivedNum < total) {
      return;
    }
    
    onCheckout(selectedMethod, cashReceivedNum, isGcash ? referenceNumber : undefined);
    setCashReceived('');
    setReferenceNumber('');
  };

  // Check if the selected payment method is GCash
  const isGcashSelected = () => {
    const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod);
    return selectedPaymentMethod?.name.toLowerCase() === 'gcash';
  };

  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
      <Dialog.Title style={styles.title}>Checkout</Dialog.Title>
      <Dialog.ScrollArea style={styles.scrollArea}>
        <ScrollView>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>PHP {total.toFixed(2)}</Text>
          </View>
          
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <RadioButton.Group
            onValueChange={value => setSelectedMethod(parseInt(value))}
            value={selectedMethod?.toString() || ''}
          >
            <View style={styles.paymentMethodsContainer}>
              {paymentMethods.map(method => (
                <View key={method.id} style={styles.paymentMethodItem}>
                  <RadioButton.Android
                    value={method.id.toString()}
                    color={colors.primary}
                  />
                  <Text style={styles.paymentMethodText}>{method.name}</Text>
                </View>
              ))}
            </View>
          </RadioButton.Group>

          {isGcashSelected() ? (
            // GCash payment - show reference number field
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>GCash Reference Number</Text>
              <Input
                placeholder="Enter reference number"
                value={referenceNumber}
                onChangeText={setReferenceNumber}
                leftIcon={<Ionicons name="receipt-outline" size={20} color={colors.gray600} />}
                containerStyle={styles.inputContainer}
              />
              <Text style={styles.helperText}>
                Please enter the reference number from your GCash transaction
              </Text>
            </View>
          ) : (
            // Cash payment - show cash received field
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cash Received</Text>
              <Input
                placeholder="Enter amount"
                value={cashReceived}
                onChangeText={setCashReceived}
                keyboardType="numeric"
                leftIcon={<Ionicons name="cash-outline" size={20} color={colors.gray600} />}
                containerStyle={styles.inputContainer}
              />
              
              {cashReceivedNum >= total && (
                <View style={styles.changeContainer}>
                  <Text style={styles.changeLabel}>Change:</Text>
                  <Text style={styles.changeAmount}>PHP {change.toFixed(2)}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </Dialog.ScrollArea>
      
      <Dialog.Actions style={styles.actions}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={onDismiss}
          style={styles.cancelButton}
        />
        <Button
          title="Complete"
          variant="primary"
          onPress={handleCheckout}
          disabled={
            !selectedMethod || 
            (isGcashSelected() ? !referenceNumber.trim() : cashReceivedNum < total)
          }
          style={styles.completeButton}
        />
      </Dialog.Actions>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 16,
    backgroundColor: colors.white,
    ...shadows.lg,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  scrollArea: {
    paddingHorizontal: spacing.md,
    maxHeight: 400,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  totalLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  paymentMethodsContainer: {
    marginBottom: spacing.lg,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  paymentMethodText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  inputContainer: {
    marginBottom: spacing.sm,
  },
  helperText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  changeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.success + '15', // Light green background
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  changeLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  changeAmount: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.success,
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    padding: spacing.sm,
  },
  cancelButton: {
    marginRight: spacing.xs,
  },
  completeButton: {
    marginLeft: spacing.xs,
  },
});