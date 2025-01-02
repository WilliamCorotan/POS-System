import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { CartItem } from '../types';

interface CartItemComponentProps {
  item: CartItem;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

export function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemComponentProps) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>Quantity: {item.quantity}</Paragraph>
        <Paragraph>Price: PHP{item.price}</Paragraph>
        <Paragraph>Subtotal: PHP{item.price * item.quantity}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button 
          onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          -
        </Button>
        <Button onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}>
          +
        </Button>
        <Button onPress={() => onRemove(item.id)}>Remove</Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
  },
});