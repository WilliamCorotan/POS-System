import { useStore } from '../contexts/StoreContext';
import { PaymentMethod } from '../types';

export function usePaymentMethods() {
  const { state, dispatch } = useStore();

  const setPaymentMethods = (products: PaymentMethod[]) => {
    dispatch({ type: 'SET_PAYMENT_METHODS', payload: products });
  };

  const addPaymentMethod = (method: PaymentMethod) => {
    dispatch({ type: 'ADD_PAYMENT_METHOD', payload: method });
  };

  const updatePaymentMethod = (method: PaymentMethod) => {
    dispatch({ type: 'UPDATE_PAYMENT_METHOD', payload: method });
  };

  const deletePaymentMethod = (id: number) => {
    dispatch({ type: 'DELETE_PAYMENT_METHOD', payload: id });
  };

  return {
    paymentMethods: state.paymentMethods,
    setPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  };
}