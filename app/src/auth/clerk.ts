import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { clerkClient } from '@clerk/clerk-expo';

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
};

export const saveUserToStorage = async (user: any) => {
  try {
    await AsyncStorage.setItem('offlineUser', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to storage:', error);
  }
};

export const getOfflineUser = async () => {
  try {
    const user = await AsyncStorage.getItem('offlineUser');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting offline user:', error);
    return null;
  }
};

export const clearOfflineUser = async () => {
  try {
    await AsyncStorage.removeItem('offlineUser');
  } catch (error) {
    console.error('Error clearing offline user:', error);
  }
};

export { tokenCache };