import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Portal, Dialog, TextInput, FAB, Snackbar, RadioButton } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { CartItem, PaymentMethod } from '../types';
import { getCartItems, updateCartItemQuantity, removeCartItem, finalizeTransaction, addToCart, getPaymentMethods } from '../database';
import { createTransaction } from '../api';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutDialogVisible, setCheckoutDialogVisible] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const lastScanRef = useRef<number>(0);
  const SCAN_DELAY = 2000;
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);

  useEffect(() => {
    loadCartItems();
    loadPaymentMethods();
    requestCameraPermission();
  }, []);

  const loadPaymentMethods = async () => {
    const methods = await getPaymentMethods();
    setPaymentMethods(methods);
    if (methods.length > 0) {
      setSelectedPaymentMethod(methods[0].id);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const loadCartItems = async () => {
    const items = await getCartItems();
    setCartItems(items);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleUpdateQuantity = async (orderId: number, quantity: number) => {
    await updateCartItemQuantity(orderId, quantity);
    await loadCartItems();
  };

  const handleRemoveItem = async (orderId: number) => {
    await removeCartItem(orderId);
    await loadCartItems();
  };

  const handleCheckout = async () => {
    if (!selectedPaymentMethod) return;
    
    try {
      // First finalize the local transaction
      await finalizeTransaction(selectedPaymentMethod, parseFloat(cashReceived));
      
      // Then sync with server
      const transactionData = {
        paymentMethodId: selectedPaymentMethod,
        cashReceived: parseFloat(cashReceived),
        items: cartItems.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      await createTransaction(transactionData);
      
      await loadCartItems();
      setCheckoutDialogVisible(false);
      setCashReceived('');
      setSelectedPaymentMethod(paymentMethods[0]?.id || null);
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };
  const handleBarCodeScanned = async ({ type, data }) => {
    const now = Date.now();
    if (now - lastScanRef.current < SCAN_DELAY) {
      return;
    }
    lastScanRef.current = now;

    try {
      await addToCart(parseInt(data), 1);
      await loadCartItems();
    } catch (error) {
      console.error('Error scanning product:', error);
    }
    setScanning(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCartItems();
    setRefreshing(false);
  };

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
          onBarCodeScanned={scanning ? handleBarCodeScanned : undefined}
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
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007bff"
            title="Refreshing..."
            titleColor="#007bff"
          />
        }
      />

      <FAB
        icon="barcode-scan"
        style={styles.fab}
        onPress={() => {
          if (hasPermission) {
            lastScanRef.current = 0;
            setScanning(true);
          } else {
            requestCameraPermission();
          }
        }}
      />

      <Portal>
        <Dialog visible={checkoutDialogVisible} onDismiss={() => setCheckoutDialogVisible(false)}>
          <Dialog.Title>Checkout</Dialog.Title>
          <Dialog.Content>
            <Text>Total Amount: PHP {calculateTotal().toFixed(2)}</Text>
            
            <Text style={styles.label}>Payment Method:</Text>
            <RadioButton.Group
              onValueChange={value => setSelectedPaymentMethod(parseInt(value))}
              value={selectedPaymentMethod?.toString() || ''}
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
            {parseFloat(cashReceived) >= calculateTotal() && (
              <Text>Change: PHP {(parseFloat(cashReceived) - calculateTotal()).toFixed(2)}</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCheckoutDialogVisible(false)}>Cancel</Button>
            <Button 
              onPress={handleCheckout}
              disabled={!selectedPaymentMethod || parseFloat(cashReceived) < calculateTotal()}
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
  label: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
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