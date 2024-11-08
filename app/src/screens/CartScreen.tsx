import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import { CartItem } from '../types';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>Quantity: {item.quantity}</Paragraph>
        <Paragraph>Price: PHP{item.price}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => {}}>-</Button>
        <Button onPress={() => {}}>+</Button>
        <Button onPress={() => {}}>Remove</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={item => item.id.toString()}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <Text style={styles.total}>Total: PHP {calculateTotal().toFixed(2)}</Text>
            <Button mode="contained" onPress={() => {}}>
              Checkout
            </Button>
          </View>
        )}
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
  footer: {
    padding: 16,
    backgroundColor: 'white',
    elevation: 4,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});