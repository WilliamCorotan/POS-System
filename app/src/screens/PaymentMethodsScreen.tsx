import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Card, Title, FAB, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { PaymentMethod } from '../types';
import { getPaymentMethods, deletePaymentMethod } from '../database';

export default function PaymentMethodsScreen() {
  const navigation = useNavigation();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    const methods = await getPaymentMethods();
    setPaymentMethods(methods);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPaymentMethods();
    setRefreshing(false);
  };

  const handleDelete = async (id: number) => {
    await deletePaymentMethod(id);
    await loadPaymentMethods();
  };

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => navigation.navigate('EditPaymentMethod', { paymentMethod: item })}>
          Edit
        </Button>
        <Button onPress={() => handleDelete(item.id)}>Delete</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={paymentMethods}
        renderItem={renderPaymentMethod}
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
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddPaymentMethod')}
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});