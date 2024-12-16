import { Product } from '../types';
import { API_URL, createHeaders } from './config';

export const fetchProducts = async (userId: string): Promise<Product[]> => {
    console.log('this >>', userId);
  try {
    const response = await fetch(`${API_URL}/products`, {
      headers: createHeaders(userId),
    });
    console.log('response>>', response);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};