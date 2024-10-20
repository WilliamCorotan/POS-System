import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, Alert, Image } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

const API_URL = 'http://localhost:3000'; // Replace with your actual API URL

interface Product {
  id: number;
  name: string;
  code: string;
  description: string;
  image_path: string;
  buy_price: number;
  sell_price: number;
  stock: number;
  low_stock_level: number;
  expiration_date: string;
  unit_measurements_id: number;
  category_id: number;
  category_name: string;
  unit_measurement: string;
}

interface CartItem extends Product {
  quantity: number;
}

function ProductForm({ onSubmit, initialProduct = null }) {
  const [name, setName] = useState(initialProduct ? initialProduct.name : '');
  const [code, setCode] = useState(initialProduct ? initialProduct.code : '');
  const [description, setDescription] = useState(initialProduct ? initialProduct.description : '');
  const [buyPrice, setBuyPrice] = useState(initialProduct ? initialProduct.buy_price.toString() : '');
  const [sellPrice, setSellPrice] = useState(initialProduct ? initialProduct.sell_price.toString() : '');
  const [stock, setStock] = useState(initialProduct ? initialProduct.stock.toString() : '');
  const [lowStockLevel, setLowStockLevel] = useState(initialProduct ? initialProduct.low_stock_level.toString() : '');
  const [expirationDate, setExpirationDate] = useState(initialProduct ? initialProduct.expiration_date : '');
  const [unitMeasurementsId, setUnitMeasurementsId] = useState(initialProduct ? initialProduct.unit_measurements_id.toString() : '');
  const [categoryId, setCategoryId] = useState(initialProduct ? initialProduct.category_id.toString() : '');

  const handleSubmit = () => {
    onSubmit({
      name,
      code,
      description,
      buy_price: parseFloat(buyPrice),
      sell_price: parseFloat(sellPrice),
      stock: parseInt(stock),
      low_stock_level: parseInt(lowStockLevel),
      expiration_date: expirationDate,
      unit_measurements_id: parseInt(unitMeasurementsId),
      category_id: parseInt(categoryId),
    });
  };

  return (
    <View style={styles.form}>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Code" value={code} onChangeText={setCode} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
      <TextInput style={styles.input} placeholder="Buy Price" value={buyPrice} onChangeText={setBuyPrice} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Sell Price" value={sellPrice} onChangeText={setSellPrice} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Low Stock Level" value={lowStockLevel} onChangeText={setLowStockLevel} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Expiration Date (YYYY-MM-DD)" value={expirationDate} onChangeText={setExpirationDate} />
      <TextInput style={styles.input} placeholder="Unit Measurements ID" value={unitMeasurementsId} onChangeText={setUnitMeasurementsId} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Category ID" value={categoryId} onChangeText={setCategoryId} keyboardType="numeric" />
      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>{initialProduct ? 'Update' : 'Add'} Product</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function POSSystem() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { getToken, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });
      const newProduct = await response.json();
      setProducts([...products, newProduct]);
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Failed to add product');
    }
  };

  const updateProduct = async (id: number, product: Omit<Product, 'id'>) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });
      const updatedProduct = await response.json();
      setProducts(products.map(p => p.id === id ? updatedProduct : p));
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product');
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const token = await getToken();
      await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', 'Failed to delete product');
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const processOrder = async () => {
    try {
      const token = await getToken();
      const orderData = cart.map(item => ({ product_id: item.id, quantity: item.quantity }));
      const response = await fetch(`${API_URL}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });
      const data = await response.json();
      console.log('Order processed:', data);
      Alert.alert('Success', `Order processed successfully. Transaction ID: ${data.transactionId}`);
      setCart([]);
      fetchProducts(); // Refresh product list to update stock
    } catch (error) {
      console.error('Error processing order:', error);
      Alert.alert('Error', 'Failed to process order');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.sell_price * item.quantity, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>POS System</Text>
      <TouchableOpacity onPress={handleSignOut}   style={styles.signOutButton}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
      <View style={styles.productsContainer}>
        <Text style={styles.sectionTitle}>Products</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Product</Text>
        </TouchableOpacity>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.productItem}>
              <TouchableOpacity onPress={() => addToCart(item)}>
                <Image source={{ uri: item.image_path }} style={styles.productImage} />
                <Text>{item.name} - ${item.sell_price.toFixed(2)}</Text>
                <Text>Stock: {item.stock}</Text>
                <Text>Category: {item.category_name}</Text>
                <Text>Unit: {item.unit_measurement}</Text>
              </TouchableOpacity>
              <View style={styles.productActions}>
                <TouchableOpacity onPress={() => {
                  setEditingProduct(item);
                  setModalVisible(true);
                }}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteProduct(item.id)}>
                  <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
      <View style={styles.cartContainer}>
        <Text style={styles.sectionTitle}>Cart</Text>
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Text>{item.name} x {item.quantity}</Text>
              <Text>${(item.sell_price * item.quantity).toFixed(2)}</Text>
            </View>
          )}
        />
        <Text style={styles.total}>Total: ${totalAmount.toFixed(2)}</Text>
        <TouchableOpacity onPress={processOrder} style={styles.processButton}>
          <Text style={styles.processButtonText}>Process Order</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          setEditingProduct(null);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ProductForm
              onSubmit={(product) => {
                if (editingProduct) {
                  updateProduct(editingProduct.id, product);
                } else {
                  addProduct(product);
                }
                setModalVisible(false);
                setEditingProduct(null);
              }}
              initialProduct={editingProduct}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(!modalVisible);
                setEditingProduct(null);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  productImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  productActions: {
    flexDirection: 'row',
  },
  editButton: {
    color: 'blue',
    marginRight: 10,
  },
  deleteButton: {
    color: 'red',
  },
  cartContainer: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  processButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});