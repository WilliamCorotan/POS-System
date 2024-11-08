import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ProductForm from '../components/ProductForm';
import { updateProduct } from '../database';
import { Product } from '../types';

export default function EditProductScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const product = route.params?.product as Product;

  const handleUpdateProduct = async (updatedProduct: Partial<Product>) => {
    await updateProduct(product.id, updatedProduct);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <ProductForm
        initialValues={product}
        onSubmit={handleUpdateProduct}
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