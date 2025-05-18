import { useStore } from '../contexts/StoreContext';
import { Product } from '../types';
import { createTransaction } from '../api/transactions';
import { fetchProducts } from '../api/products';
import { fetchTransactions } from '../api/transactions';
import { fetchPaymentMethods } from '../api/payment-methods';
import { getPendingTransactions, removePendingTransaction } from '../utils/offlineTransactions';

export function useProducts() {
  const { state, dispatch } = useStore();

  const setProducts = (products: Product[]) => {
    dispatch({ type: 'SET_PRODUCTS', payload: products });
  }; 
  const addProduct = (product: Product) => {
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  };

  const updateProduct = (product: Product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
  };

  const deleteProduct = (id: number) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
  };

  const updateSettings = async (userId: string) => {
    try {
      // Then refetch all data
      const [products, transactions, paymentMethods] = await Promise.all([
        fetchProducts(userId),
        fetchTransactions(userId),
        fetchPaymentMethods(userId)
      ]);

      // Update store with new data
      dispatch({ type: 'SET_PRODUCTS', payload: products });
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
      dispatch({ type: 'SET_PAYMENT_METHODS', payload: paymentMethods });

      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return {
    products: state.products,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSettings,
  };
}