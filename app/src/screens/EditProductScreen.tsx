import React, {useEffect, useState} from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import ProductForm from '../components/ProductForm';
import { updateProduct } from '../database';
import { Product } from '../types';

export default function EditProductScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const product = route.params?.product as Product;

  const [scanning, setScanning] = useState(false);
  const [productData, setProductData] = useState<Partial<Product>>(product);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const handleUpdateProduct = async (updatedProduct: Partial<Product>) => {
    await updateProduct(product.id, updatedProduct);
    console.log('done');
    navigation.goBack();
  };

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    console.log('data', data);
    setScanning(false);
    setProductData(prev => ({ ...prev, code: data }));
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
        onSubmit={handleUpdateProduct}
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