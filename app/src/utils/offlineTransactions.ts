import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';

const PENDING_TRANSACTIONS_KEY = 'pending_transactions';

export interface PendingTransaction extends Omit<Transaction, 'id'> {
    localId: string;
    timestamp: number;
    status: 'pending';
}

export const savePendingTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<string> => {
    try {
        const pendingTransactions = await getPendingTransactions();
        const localId = `local_${Date.now()}`;
        
        const pendingTransaction: PendingTransaction = {
            ...transaction,
            localId,
            timestamp: Date.now(),
            status: 'pending'
        };
        
        await AsyncStorage.setItem(
            PENDING_TRANSACTIONS_KEY,
            JSON.stringify([...pendingTransactions, pendingTransaction])
        );
        
        return localId;
    } catch (error) {
        console.error('Error saving pending transaction:', error);
        throw error;
    }
};

export const getPendingTransactions = async (): Promise<PendingTransaction[]> => {
    try {
        const transactions = await AsyncStorage.getItem(PENDING_TRANSACTIONS_KEY);
        return transactions ? JSON.parse(transactions) : [];
    } catch (error) {
        console.error('Error getting pending transactions:', error);
        return [];
    }
};

export const removePendingTransaction = async (localId: string): Promise<void> => {
    try {
        const pendingTransactions = await getPendingTransactions();
        const updatedTransactions = pendingTransactions.filter(
            transaction => transaction.localId !== localId
        );
        await AsyncStorage.setItem(
            PENDING_TRANSACTIONS_KEY,
            JSON.stringify(updatedTransactions)
        );
    } catch (error) {
        console.error('Error removing pending transaction:', error);
        throw error;
    }
};

export const clearPendingTransactions = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(PENDING_TRANSACTIONS_KEY);
    } catch (error) {
        console.error('Error clearing pending transactions:', error);
        throw error;
    }
}; 