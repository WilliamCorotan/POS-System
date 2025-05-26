import { Category } from '../types';
import { API_URL, createHeaders } from './config';

export const fetchCategories = async (userId: string): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      headers: createHeaders(userId),
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};