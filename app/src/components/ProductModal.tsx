import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { Product } from '../types';

interface ProductModalProps {
  visible: boolean;
  onDismiss: () => void;
  product: Product | null;
}

export function ProductModal({ visible, onDismiss, product }: ProductModalProps) {
  if (!product) return null;

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <ScrollView>
          <Text style={styles.title}>{product.name}</Text>
          
          <View style={styles.section}>
            <Text style={styles.label}>Code:</Text>
            <Text style={styles.value}>{product.code}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{product.description || 'No description'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Buy Price:</Text>
            <Text style={styles.value}>PHP {product.buyPrice.toFixed(2)}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Sell Price:</Text>
            <Text style={styles.value}>PHP {product.sellPrice.toFixed(2)}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Stock:</Text>
            <Text style={styles.value}>{product.stock}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Low Stock Level:</Text>
            <Text style={styles.value}>{product.lowStockLevel || 'Not set'}</Text>
          </View>

          {product.expirationDate && (
            <View style={styles.section}>
              <Text style={styles.label}>Expiration Date:</Text>
              <Text style={styles.value}>
                {new Date(product.expirationDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </ScrollView>
        
        <Button mode="contained" onPress={onDismiss} style={styles.button}>
          Close
        </Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
  button: {
    marginTop: 20,
  },
});