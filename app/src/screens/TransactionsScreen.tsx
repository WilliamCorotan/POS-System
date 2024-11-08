import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { Transaction } from '../types';
import { getTransactions } from '../database';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const transactionsData = await getTransactions();
    setTransactions(transactionsData);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>Transaction #{item.id}</Title>
        <Paragraph>Date: {new Date(item.date_of_transaction).toLocaleDateString()}</Paragraph>
        <Paragraph>Total: PHP{item.total_price}</Paragraph>
        <Paragraph>Payment Method: {item.payment_method}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 8,
  },
});