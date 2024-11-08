import React, { useState, useEffect } from 'react';
import { View, ScrollView, FlatList, StyleSheet } from 'react-native';
import { Searchbar, Card, Title, Paragraph, Button, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../types';
import { getProducts, deleteProduct } from '../database';

export default function ProductsScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const productsData = await getProducts();
    setProducts(productsData);
  };

  const handleDeleteProduct = async (id: number) => {
    await deleteProduct(id);
    await loadProducts();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const reloadProductList = async () => {
    const productsData = await getProducts();
    setProducts(productsData);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <Card  style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>Code: {item.code}</Paragraph>
        <Paragraph>Price: PHP{item.sell_price}</Paragraph>
        <Paragraph>Stock: {item.stock}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => navigation.navigate('EditProduct', { product: item })}>
          Edit
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search products"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct', { onProductAdded: reloadProductList })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
  },
  productList: {
    padding: 8,
  },
  card: {
    flex: 1,
    margin: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});