import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, TextInput, Button, RadioButton, Text } from 'react-native-paper';
import { PaymentMethod } from '../types';

interface CheckoutDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onCheckout: (paymentMethodId: number, cashReceived: number) => void;
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

  const handleCheckout = () => {
    if (selectedMethod && parseFloat(cashReceived) >= total) {
      onCheckout(selectedMethod, parseFloat(cashReceived));
      setCashReceived('');
    }
  };

  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>Checkout</Dialog.Title>
      <Dialog.Content>
        <Text>Total Amount: PHP {total.toFixed(2)}</Text>
        
        <Text style={styles.label}>Payment Method:</Text>
        <RadioButton.Group
          onValueChange={value => setSelectedMethod(parseInt(value))}
          value={selectedMethod?.toString() || ''}
        >
          {paymentMethods.map(method => (
            <RadioButton.Item
              key={method.id}
              label={method.name}
              value={method.id.toString()}
            />
          ))}
        </RadioButton.Group>

        <TextInput
          label="Cash Received"
          value={cashReceived}
          onChangeText={setCashReceived}
          keyboardType="numeric"
          style={styles.input}
        />
        {parseFloat(cashReceived) >= total && (
          <Text>Change: PHP {(parseFloat(cashReceived) - total).toFixed(2)}</Text>
        )}
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Cancel</Button>
        <Button 
          onPress={handleCheckout}
          disabled={!selectedMethod || parseFloat(cashReceived) < total}
        >
          Complete Transaction
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginVertical: 8,
  },
});