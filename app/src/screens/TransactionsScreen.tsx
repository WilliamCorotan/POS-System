import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { Transaction } from '../types';
import { getTransactions } from '../database';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const transactionsData = await getTransactions();
    setTransactions(transactionsData);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>Transaction #{item.id}</Title>
        <Paragraph>Date: {new Date(item.date_of_transaction).toLocaleDateString()}</Paragraph>
        <Paragraph>Total: PHP{item.total_price}</Paragraph>
        {/* <Paragraph>Payment Method: {item.payment_method}</Paragraph> */}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007bff"
            title="Refreshing..."
            titleColor="#007bff"
          />
        }
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