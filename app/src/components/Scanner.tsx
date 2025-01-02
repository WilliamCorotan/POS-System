import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';

interface ScannerProps {
  onScan: () => void;
  onCancel: () => void;
}

export function Scanner({ onScan, onCancel }: ScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { products } = useProducts();
  const { addToCart } = useCart();
  const [lastScan, setLastScan] = useState<number>(0);
  const SCAN_DELAY = 2000; // 2 seconds delay between scans

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    const now = Date.now();
    if (now - lastScan < SCAN_DELAY) {
      return;
    }
    setLastScan(now);

    console.log('this >>', products);
    const product = products.find(p => p.code === data);
    if (product) {
      addToCart(product, 1);
      onScan();
    }
  };

  if (hasPermission === null) {
    return null;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Button 
          mode="contained" 
          onPress={onCancel}
        >
          No Camera Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <Button 
        mode="contained" 
        onPress={onCancel}
        style={styles.cancelButton}
      >
        Cancel
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    right: 32,
  },
});