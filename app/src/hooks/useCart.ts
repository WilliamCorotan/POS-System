import { useStore } from '../contexts/StoreContext';
import { CartItem, Product } from '../types';

export function useCart() {
  const { state, dispatch } = useStore();

  const addToCart = (product: Product, quantity: number = 1) => {
    const cartItem: CartItem = {
      id: Date.now(), // Temporary ID for new items
      product_id: product.id,
      name: product.name,
      quantity,
      price: product.sellPrice
    };
    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      dispatch({ type: 'UPDATE_CART_ITEM', payload: { id, quantity } });
    }
  };

  const removeItem = (id: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  const clearCart = () => {
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