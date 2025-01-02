import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, Portal, Dialog, TextInput } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useCart } from '../hooks/useCart';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useTransactions } from '../hooks/useTransactions';
import { CartItem } from '../types';
import { CartItemComponent } from '../components/CartItemComponent';
import { CheckoutDialog } from '../components/CheckoutDialog';
import { Scanner } from '../components/Scanner';
import { fetchPaymentMethods } from '../api/payment-methods';
import { useUser } from '../contexts/UserContext';
import { createTransaction } from '../api/transactions';

export default function CartScreen() {
  const { userId } = useUser();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart();
  const { paymentMethods, setPaymentMethods } = usePaymentMethods();
  const { addTransaction } = useTransactions();
  const [scanning, setScanning] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  console.log('payment', paymentMethods);

  const handleCheckout = async (paymentMethodId: number, cashReceived: number) => {
    const transaction = {
      payment_method_id: paymentMethodId,
      date_of_transaction: new Date().toISOString(),
      cash_received: cashReceived,
      total_price: getTotal(),
      status: 'completed',
      items: items,
    };

    console.log('data >>', transaction);
    
    await createTransaction(userId, transaction);
    await clearCart();
    setCheckoutVisible(false);
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <CartItemComponent
      item={item}
      onUpdateQuantity={updateQuantity}
      onRemove={removeItem}
    />
  );

  const getSettings =  async () => {
    const paymentMethods = await fetchPaymentMethods(userId);
    console.log('check>>', paymentMethods);
    setPaymentMethods(paymentMethods);
}

useEffect(()=>{
    getSettings();
  }, []);

  if (scanning) {
    return <Scanner onScan={() => setScanning(false)} onCancel={() => setScanning(false)} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={item => item.id.toString()}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <Title>Total: PHP {getTotal().toFixed(2)}</Title>
            <Button 
              mode="contained" 
              onPress={() => setCheckoutVisible(true)}
              disabled={items.length === 0}
            >
              Checkout
            </Button>
          </View>
        )}
      />

      <Button
        icon="barcode-scan"
        mode="contained"
        onPress={() => setScanning(true)}
        style={styles.scanButton}
      >
        Scan Product
      </Button>

      <CheckoutDialog
        visible={checkoutVisible}
        onDismiss={() => setCheckoutVisible(false)}
        onCheckout={handleCheckout}
        total={getTotal()}
        paymentMethods={paymentMethods}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    elevation: 4,
  },
  scanButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 28,
  },
});