import { Transaction } from '../types';
import { API_URL, createHeaders } from './config';

export const fetchTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const response = await fetch(`${API_URL}/transactions`, {
      headers: createHeaders(userId),
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const createTransaction = async (userId: string, transactionData: any): Promise<Transaction> => {
  try {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: createHeaders(userId),
      body: JSON.stringify(transactionData),
    });
    console.log('check >>', response);
    if (!response.ok) throw new Error('Failed to create transaction');
    return await response.json();
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};