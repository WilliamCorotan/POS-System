import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  RadioButton, 
  DataTable, 
  Card, 
  Title, 
  Paragraph 
} from 'react-native-paper';
import { RefundFormData, RefundItem, RefundType, Transaction } from '../types';

interface RefundFormProps {
  transactionId: number;
  transaction: Transaction | null;
  items: RefundItem[];
  onSubmit: (data: RefundFormData) => Promise<void>;
  onCancel: () => void;
}

export function RefundForm({ 
  transactionId, 
  transaction, 
  items, 
  onSubmit, 
  onCancel 
}: RefundFormProps) {
  const [reason, setReason] = useState('');
  const [refundType, setRefundType] = useState<RefundType>('partial');
  const [refundItems, setRefundItems] = useState<RefundItem[]>(items);
  const [totalRefund, setTotalRefund] = useState(0);

  // When refund type changes, update quantities
  useEffect(() => {
    if (refundType === 'full') {
      // Set all quantities to max available
      const updatedItems = items.map(item => ({
        ...item,
        quantityToRefund: item.availableQuantity,
        totalRefund: item.availableQuantity * item.unitPrice
      }));
      setRefundItems(updatedItems);
    } else {
      // Reset all quantities to 0
      const updatedItems = items.map(item => ({
        ...item,
        quantityToRefund: 0,
        totalRefund: 0
      }));
      setRefundItems(updatedItems);
    }
  }, [refundType, items]);

  // Calculate total refund amount
  useEffect(() => {
    const total = refundItems.reduce((sum, item) => sum + item.totalRefund, 0);
    setTotalRefund(total);
  }, [refundItems]);

  const handleQuantityChange = (index: number, value: string) => {
    const quantity = parseInt(value) || 0;
    const updatedItems = [...refundItems];
    const item = updatedItems[index];
    
    // Ensure quantity is within valid range
    const validQuantity = Math.min(Math.max(0, quantity), item.availableQuantity);
    
    item.quantityToRefund = validQuantity;
    item.totalRefund = validQuantity * item.unitPrice;
    
    setRefundItems(updatedItems);
  };

  const handleSubmit = async () => {
    // Validate that at least one item has a quantity to refund
    const hasItemsToRefund = refundItems.some(item => item.quantityToRefund > 0);
    if (!hasItemsToRefund) {
      alert('Please select at least one item to refund');
      return;
    }

    const formData: RefundFormData = {
      transactionId,
      reason,
      type: refundType,
      items: refundItems,
      totalAmount: totalRefund
    };

    await onSubmit(formData);
  };

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text>Loading transaction details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Transaction #{transaction.id}</Title>
          <Paragraph>Date: {new Date(transaction.dateOfTransaction).toLocaleString()}</Paragraph>
          <Paragraph>Total Amount: PHP {transaction.totalPrice.toFixed(2)}</Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Refund Type</Text>
        <RadioButton.Group
          onValueChange={value => setRefundType(value as RefundType)}
          value={refundType}
        >
          <View style={styles.radioRow}>
            <RadioButton.Item label="Full Refund" value="full" />
            <RadioButton.Item label="Partial Refund" value="partial" />
          </View>
        </RadioButton.Group>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reason for Refund</Text>
        <TextInput
          mode="outlined"
          multiline
          numberOfLines={3}
          value={reason}
          onChangeText={setReason}
          placeholder="Enter reason for refund"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items to Refund</Text>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Product</DataTable.Title>
            <DataTable.Title numeric>Available</DataTable.Title>
            <DataTable.Title numeric>Qty to Refund</DataTable.Title>
          </DataTable.Header>

          {refundItems.map((item, index) => (
            <DataTable.Row key={item.orderId}>
              <DataTable.Cell>{item.productName}</DataTable.Cell>
              <DataTable.Cell numeric>{item.availableQuantity}</DataTable.Cell>
              <DataTable.Cell numeric>
                <TextInput
                  mode="outlined"
                  keyboardType="numeric"
                  value={item.quantityToRefund.toString()}
                  onChangeText={(value) => handleQuantityChange(index, value)}
                  disabled={refundType === 'full' || item.availableQuantity === 0}
                  style={styles.quantityInput}
                />
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </View>

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total Refund Amount:</Text>
        <Text style={styles.totalAmount}>PHP {totalRefund.toFixed(2)}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button mode="outlined" onPress={onCancel} style={styles.button}>
          Cancel
        </Button>
        <Button 
          mode="contained" 
          onPress={handleSubmit} 
          disabled={totalRefund <= 0}
          style={styles.button}
        >
          Process Refund
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quantityInput: {
    height: 40,
    width: 60,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});