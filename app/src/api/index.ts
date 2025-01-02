// import { PaymentMethod, Product, Transaction } from '../types';

// const API_URL = 'http://192.168.254.103:3000/api';

// export const fetchProducts = async (): Promise<Product[]> => {
//   try {
//     const response = await fetch(`${API_URL}/products`);
//     if (!response.ok) throw new Error('Failed to fetch products');
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     throw error;
//   }
// };

// export const fetchTransactions = async (): Promise<Transaction[]> => {
//   try {
//     const response = await fetch(`${API_URL}/transactions`);
//     if (!response.ok) throw new Error('Failed to fetch transactions');
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching transactions:', error);
//     throw error;
//   }
// };

// export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
//     try {
//       const response = await fetch(`${API_URL}/settings/payment-methods`);
//       if (!response.ok) throw new Error('Failed to fetch payment methods');
//       return await response.json();
//     } catch (error) {
//       console.error('Error fetching payment methods:', error);
//       throw error;
//     }
//   };

// export const createTransaction = async (transactionData: any): Promise<Transaction> => {
//   try {
//     const response = await fetch(`${API_URL}/transactions`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(transactionData),
//     });
//     if (!response.ok) throw new Error('Failed to create transaction');
//     return await response.json();
//   } catch (error) {
//     console.error('Error creating transaction:', error);
//     throw error;
//   }
// };