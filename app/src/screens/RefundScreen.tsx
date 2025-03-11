import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RefundForm } from '../components/RefundForm';
import { useRefunds } from '../hooks/useRefunds';
import { RefundFormData, Transaction, RefundItem } from '../types';

export default function RefundScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { transactionId } = route.params as { transactionId: number };
  const { getRefundableItems, createRefund } = useRefunds();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [refundItems, setRefundItems] = useState<RefundItem[]>([]);

  useEffect(() => {
    loadRefundableItems();
  }, []);

  const loadRefundableItems = async () => {
    try {
      setLoading(true);
      const data = await getRefundableItems(transactionId);
      setTransaction(data.transaction);
      setRefundItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load refundable items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: RefundFormData) => {
    try {
      setLoading(true);
      await createRefund(data);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process refund');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading refund details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <RefundForm
      transactionId={transactionId}
      transaction={transaction}
      items={refundItems}
      onSubmit={handleSubmit}
      onCancel={() => navigation.goBack()}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});