import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Portal, Dialog, TextInput, FAB, Snackbar } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { CartItem } from '../types';
import { getCartItems, updateCartItemQuantity, removeCartItem, finalizeTransaction, addToCart } from '../database';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutDialogVisible, setCheckoutDialogVisible] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);  // New state for pull-to-refresh

  useEffect(() => {
    loadCartItems();
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    console.log(status);
    setHasPermission(status === 'granted');
  };

  // Function to load cart items
  const loadCartItems = async () => {
    const items = await getCartItems();
    console.log('items',items);
    setCartItems(items);
  };

  // Calculate total price of cart items
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  // Update item quantity
  const handleUpdateQuantity = async (orderId: number, quantity: number) => {
    await updateCartItemQuantity(orderId, quantity);
    await loadCartItems();
  };

  // Remove item from cart
  const handleRemoveItem = async (orderId: number) => {
    await removeCartItem(orderId);
    await loadCartItems();
  };

  // Handle checkout process
  const handleCheckout = async () => {
    try {
      await finalizeTransaction(1, parseFloat(cashReceived)); // Using cash payment (id: 1)
      await loadCartItems();
      setCheckoutDialogVisible(false);
      setCashReceived('');
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  // Handle barcode scan
  const handleBarCodeScanned = async ({ type, data }) => {
    try {
      console.log('scanning', data);
      // Assuming the barcode contains the product ID
      await addToCart(parseInt(data), 1);  // Add product to cart
      await loadCartItems();  // Optionally reload the cart after adding the item
    } catch (error) {
      console.error('Error scanning product:', error);
    }
    setScanning(false);
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCartItems();  // Reload the cart items
    setRefreshing(false);    // End refreshing
  };

  // Render cart item
  const renderCartItem = ({ item }: { item: CartItem }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>Quantity: {item.quantity}</Paragraph>
        <Paragraph>Price: PHP{item.price}</Paragraph>
        <Paragraph>Subtotal: PHP{item.price * item.quantity}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button 
          onPress={() => handleUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
          disabled={item.quantity <= 1}
        >
          -
        </Button>
        <Button onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
          +
        </Button>
        <Button onPress={() => handleRemoveItem(item.id)}>Remove</Button>
      </Card.Actions>
    </Card>
  );

  if (scanning) {
    return (
      <View style={styles.container}>
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <Button 
          mode="contained"
          onPress={() => setScanning(false)}
          style={styles.cancelButton}
        >
          Cancel Scan
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={item => item.id.toString()}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <Text style={styles.total}>Total: PHP {calculateTotal().toFixed(2)}</Text>
            <Button 
              mode="contained" 
              onPress={() => setCheckoutDialogVisible(true)}
              disabled={cartItems.length === 0}
            >
              Checkout
            </Button>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}    // The state that controls the spinner
            onRefresh={handleRefresh}   // Function to call when the user pulls to refresh
            tintColor="#007bff"         // Color of the refresh spinner
            title="Refreshing..."       // Title displayed during refresh
            titleColor="#007bff"        // Title color
          />
        }
      />

      <FAB
        icon="barcode-scan"
        style={styles.fab}
        onPress={() => {
          if (hasPermission) {
            console.log('has');
            setScanning(true);
          } else {
            console.log('no');
            requestCameraPermission();
          }
        }}
      />

      <Portal>
        <Dialog visible={checkoutDialogVisible} onDismiss={() => setCheckoutDialogVisible(false)}>
          <Dialog.Title>Checkout</Dialog.Title>
          <Dialog.Content>
            <Text>Total Amount: PHP {calculateTotal().toFixed(2)}</Text>
            <TextInput
              label="Cash Received"
              value={cashReceived}
              onChangeText={setCashReceived}
              keyboardType="numeric"
              style={styles.input}
            />
            {parseFloat(cashReceived) >= calculateTotal() && (
              <Text>Change: PHP {(parseFloat(cashReceived) - calculateTotal()).toFixed(2)}</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCheckoutDialogVisible(false)}>Cancel</Button>
            <Button 
              onPress={handleCheckout}
              disabled={parseFloat(cashReceived) < calculateTotal()}
            >
              Complete Transaction
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  input: {
    marginVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    right: 32,
  },
});
