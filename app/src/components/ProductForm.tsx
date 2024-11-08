import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Product } from '../types';

type ProductFormProps = {
  initialValues?: Partial<Product>;
  onSubmit: (product: Partial<Product>) => void;
  onCancel: () => void;
};

export default function ProductForm({ initialValues, onSubmit, onCancel }: ProductFormProps) {
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    code: '',
    description: '',
    buy_price: 0,
    sell_price: 0,
    stock: 0,
    low_stock_level: 0,
    ...initialValues,
  });

  const handleSubmit = () => {
    onSubmit(product);
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Name"
        value={product.name}
        onChangeText={(text) => setProduct({ ...product, name: text })}
        style={styles.input}
      />
      <TextInput
        label="Code"
        value={product.code}
        onChangeText={(text) => setProduct({ ...product, code: text })}
        style={styles.input}
      />
      <TextInput
        label="Description"
        value={product.description}
        onChangeText={(text) => setProduct({ ...product, description: text })}
        multiline
        style={styles.input}
      />
      <TextInput
        label="Buy Price"
        value={product.buy_price?.toString()}
        onChangeText={(text) => setProduct({ ...product, buy_price: parseFloat(text) || 0 })}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Sell Price"
        value={product.sell_price?.toString()}
        onChangeText={(text) => setProduct({ ...product, sell_price: parseFloat(text) || 0 })}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Stock"
        value={product.stock?.toString()}
        onChangeText={(text) => setProduct({ ...product, stock: parseInt(text) || 0 })}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Low Stock Level"
        value={product.low_stock_level?.toString()}
        onChangeText={(text) => setProduct({ ...product, low_stock_level: parseInt(text) || 0 })}
        keyboardType="numeric"
        style={styles.input}
      />
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={handleSubmit} style={styles.button}>
          Save
        </Button>
        <Button mode="outlined" onPress={onCancel} style={styles.button}>
          Cancel
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});