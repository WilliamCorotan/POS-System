import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProductForm from '../components/ProductForm';
import { createProduct } from '../database';
import { Product } from '../types';

interface AddProductScreenProps {
    route: nati;  // For accessing the parameters passed to the screen
}

export default function AddProductScreen({ route }) {
  const navigation = useNavigation();
  const { onProductAdded } = route.params;

  const handleCreateProduct = async (product: Partial<Product>) => {
    await createProduct(product);
    onProductAdded();  
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <ProductForm
        onSubmit={handleCreateProduct}
        onCancel={() => navigation.goBack()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});