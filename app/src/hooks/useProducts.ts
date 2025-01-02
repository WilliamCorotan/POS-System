import { useStore } from '../contexts/StoreContext';
import { Product } from '../types';

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

  return {
    products: state.products,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}