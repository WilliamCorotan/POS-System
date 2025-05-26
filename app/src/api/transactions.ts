import { Transaction } from "../types";
import { API_URL, createHeaders } from "./config";
import { offlineService } from "../services/offlineService";

export const fetchTransactions = async (
    userId: string
): Promise<Transaction[]> => {
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            headers: createHeaders(userId),
        });
        if (!response.ok) throw new Error("Failed to fetch transactions");
        const transactions = await response.json();
        await offlineService.saveOfflineData({ transactions });
        return transactions;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        const offlineData = await offlineService.getOfflineData();
        return offlineData.transactions;
    }
};


export const createTransaction = async (
    userId: string,
    transactionData: any
): Promise<Transaction> => {
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: "POST",
            headers: createHeaders(userId),
            body: JSON.stringify(transactionData),
        });
        if (!response.ok) throw new Error("Failed to create transaction");
        const transaction = await response.json();
        const offlineData = await offlineService.getOfflineData();
        await offlineService.saveOfflineData({
            transactions: [...offlineData.transactions, transaction],
        });
        return transaction;
    } catch (error) {
        console.error("Error creating transaction:", error);
        await offlineService.addToQueue({
            type: 'transaction',
            data: transactionData,
        });
        throw error;
    }
};

export const refundTransaction = async (
    userId: string,
    transactionId: number
): Promise<Transaction> => {
    try {
        const response = await fetch(
            `${API_URL}/transactions/${transactionId}`,
            {
                method: "PUT",
                headers: createHeaders(userId),
                body: JSON.stringify({ status: "refunded" }),
            }
        );
        if (!response.ok) throw new Error("Failed to refund transaction");
        const transaction = await response.json();
        const offlineData = await offlineService.getOfflineData();
        const updatedTransactions = offlineData.transactions.map(t =>
            t.id === transactionId ? transaction : t
        );
        await offlineService.saveOfflineData({ transactions: updatedTransactions });
        return transaction;
    } catch (error) {
        console.error("Error refunding transaction:", error);
        throw error;
    }
};