import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import ProductForm from '../components/ProductForm';
import { createProduct } from '../database';
import { Product } from '../types';

export default function AddProductScreen({ route }) {
  const navigation = useNavigation();
  const { onProductAdded } = route.params;
  const [scanning, setScanning] = useState(false);
  const [productData, setProductData] = useState<Partial<Product>>({});
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCreateProduct = async (product: Partial<Product>) => {
    await createProduct(product);
    onProductAdded();
    navigation.goBack();
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanning(false);
    setProductData(prev => {console.log('prev', prev); return { ...prev, code: data }});
  };

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
          Cancel
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ProductForm
        initialValues={productData}
        setInitialValues={setProductData}
        onSubmit={handleCreateProduct}
        onCancel={() => navigation.goBack()}
        onScanBarcode={() => setScanning(true)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
  },
});