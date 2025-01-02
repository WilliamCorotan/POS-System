import { PaymentMethod } from '../types';
import { API_URL, createHeaders } from './config';

export const fetchPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  try {
    const response = await fetch(`${API_URL}/settings/payment-methods`, {
      method: 'GET',
      headers: createHeaders(userId),
    });
    if (!response.ok) throw new Error('Failed to fetch payment methods');
    return await response.json();
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};