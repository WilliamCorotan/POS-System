import { useStore } from '../contexts/StoreContext';
import { CartItem, Product } from '../types';

export function useCart() {
  const { state, dispatch } = useStore();

  const addToCart = (product: Product, quantity: number = 1) => {
    // Check if we have enough stock
    if (product.stock < quantity) {
      throw new Error(`Not enough stock. Only ${product.stock} items available.`);
    }

    const cartItem: CartItem = {
      id: Date.now(), // Temporary ID for new items
      product_id: product.id,
      name: product.name,
      quantity,
      price: product.sellPrice
    };

    // Update product stock
    dispatch({
      type: 'UPDATE_PRODUCT',
      payload: { ...product, stock: product.stock - quantity }
    });

    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    const cartItem = state.cart.find(item => item.id === id);
    if (!cartItem) return;

    const product = state.products.find(p => p.id === cartItem.product_id);
    if (!product) return;

    const stockDiff = cartItem.quantity - newQuantity;
    const newStock = product.stock + stockDiff;

    // Check if we have enough stock for increase
    if (newStock < 0) {
      throw new Error(`Not enough stock. Only ${product.stock} items available.`);
    }

    // Update product stock
    dispatch({
      type: 'UPDATE_PRODUCT',
      payload: { ...product, stock: newStock }
    });

    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      dispatch({ type: 'UPDATE_CART_ITEM', payload: { id, quantity: newQuantity } });
    }
  };

  const removeItem = (id: number) => {
    const cartItem = state.cart.find(item => item.id === id);
    if (!cartItem) return;

    const product = state.products.find(p => p.id === cartItem.product_id);
    if (!product) return;

    // Restore stock when removing item
    dispatch({
      type: 'UPDATE_PRODUCT',
      payload: { ...product, stock: product.stock + cartItem.quantity }
    });

    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  const clearCart = () => {
    // Restore all stock when clearing cart
    state.cart.forEach(cartItem => {
      const product = state.products.find(p => p.id === cartItem.product_id);
      if (product) {
        dispatch({
          type: 'UPDATE_PRODUCT',
          payload: { ...product, stock: product.stock + cartItem.quantity }
        });
      }
    });

    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotal = () => {
    return state.cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  return {
    items: state.cart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
  };
}