export const API_URL = 'http://localhost:3000/api';

export const createHeaders = (userId: string) => ({
  'Content-Type': 'application/json',
  'X-User-ID': userId,
  Authorization: `Bearer ${userId}`
});