import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Refund, RefundFormData } from '../types';
import { 
  fetchRefundableItems, 
  createRefund as apiCreateRefund, 
  fetchRefunds as apiFetchRefunds 
} from '../api/refunds';

export function useRefunds() {
  const { userId } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRefundableItems = async (transactionId: number) => {
    if (!userId) throw new Error("User not authenticated");
    
    setLoading(true);
    try {
      const data = await fetchRefundableItems(userId, transactionId);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch refundable items";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createRefund = async (data: RefundFormData) => {
    if (!userId) throw new Error("User not authenticated");
    
    setLoading(true);
    try {
      const result = await apiCreateRefund(userId, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create refund";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchRefunds = async (): Promise<Refund[]> => {
    if (!userId) throw new Error("User not authenticated");
    
    setLoading(true);
    try {
      const refunds = await apiFetchRefunds(userId);
      return refunds;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch refunds";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getRefundableItems,
    createRefund,
    fetchRefunds
  };
}