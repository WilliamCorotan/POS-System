import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, CartItem, Transaction, PaymentMethod } from '../types';

type State = {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
};

type Action =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: number }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'UPDATE_CART_ITEM'; payload: { id: number; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'SET_PAYMENT_METHODS'; payload: PaymentMethod[] }
  | { type: 'ADD_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'UPDATE_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'DELETE_PAYMENT_METHOD'; payload: number };

const initialState: State = {
  products: [],
  cart: [],
  transactions: [],
  paymentMethods: [],
};

const StoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

function storeReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        ),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
      };
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => item.product_id === action.payload.product_id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.product_id === action.payload.product_id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    }
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'SET_PAYMENT_METHODS':
      return { ...state, paymentMethods: action.payload };
    case 'ADD_PAYMENT_METHOD':
      return { ...state, paymentMethods: [...state.paymentMethods, action.payload] };
    case 'UPDATE_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: state.paymentMethods.map(method =>
          method.id === action.payload.id ? action.payload : method
        ),
      };
    case 'DELETE_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: state.paymentMethods.filter(method => method.id !== action.payload),
      };
    default:
      return state;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  // Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const persistedState = await AsyncStorage.getItem('store');
        if (persistedState) {
          const { products, paymentMethods, transactions } = JSON.parse(persistedState);
          dispatch({ type: 'SET_PRODUCTS', payload: products });
          dispatch({ type: 'SET_PAYMENT_METHODS', payload: paymentMethods });
          dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
        }
      } catch (error) {
        console.error('Error loading persisted data:', error);
      }
    };
    loadPersistedData();
  }, []);

  // Persist state changes
  useEffect(() => {
    const persistData = async () => {
      try {
        const dataToStore = {
          products: state.products,
          paymentMethods: state.paymentMethods,
          transactions: state.transactions,
        };
        await AsyncStorage.setItem('store', JSON.stringify(dataToStore));
      } catch (error) {
        console.error('Error persisting data:', error);
      }
    };
    persistData();
  }, [state.products, state.paymentMethods, state.transactions]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}