import { useStore } from '../contexts/StoreContext';
import { Transaction } from '../types';

export function useTransactions() {
  const { state, dispatch } = useStore();

  const addTransaction = (transaction: Transaction) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  };

  return {
    transactions: state.transactions,
    addTransaction,
  };
}