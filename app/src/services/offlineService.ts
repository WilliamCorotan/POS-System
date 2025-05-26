import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Product, Refund } from '../types';

const OFFLINE_QUEUE_KEY = 'offline_queue';
const OFFLINE_DATA_KEY = 'offline_data';

interface OfflineQueueItem {
  type: 'transaction' | 'refund';
  data: any;
  timestamp: number;
}

interface OfflineData {
  transactions: Transaction[];
  products: Product[];
  refunds: Refund[];
}

export const offlineService = {
  // Queue operations
  async addToQueue(item: Omit<OfflineQueueItem, 'timestamp'>) {
    try {
      const queue = await this.getQueue();
      queue.push({ ...item, timestamp: Date.now() });
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to offline queue:', error);
    }
  },

  async getQueue(): Promise<OfflineQueueItem[]> {
    try {
      const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  },

  async clearQueue() {
    try {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing offline queue:', error);
    }
  },

  // Offline data operations
  async saveOfflineData(data: Partial<OfflineData>) {
    try {
      const existingData = await this.getOfflineData();
      const newData = { ...existingData, ...data };
      await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  },

  async getOfflineData(): Promise<OfflineData> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
      return data ? JSON.parse(data) : { transactions: [], products: [], refunds: [] };
    } catch (error) {
      console.error('Error getting offline data:', error);
      return { transactions: [], products: [], refunds: [] };
    }
  },

  async clearOfflineData() {
    try {
      await AsyncStorage.removeItem(OFFLINE_DATA_KEY);
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }
}; 