import { Refund, RefundFormData } from "../types";
import { API_URL, createHeaders } from "./config";

export const fetchRefundableItems = async (
  userId: string,
  transactionId: number
) => {
  try {
    const response = await fetch(
      `${API_URL}/transactions/${transactionId}/refund`,
      {
        headers: createHeaders(userId),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch refundable items");
    return await response.json();
  } catch (error) {
    console.error("Error fetching refundable items:", error);
    throw error;
  }
};

export const createRefund = async (
  userId: string,
  refundData: RefundFormData
) => {
  try {
    const response = await fetch(`${API_URL}/refunds`, {
      method: "POST",
      headers: createHeaders(userId),
      body: JSON.stringify(refundData),
    });
    if (!response.ok) throw new Error("Failed to create refund");
    return await response.json();
  } catch (error) {
    console.error("Error creating refund:", error);
    throw error;
  }
};

export const fetchRefunds = async (userId: string): Promise<Refund[]> => {
  try {
    const response = await fetch(`${API_URL}/refunds`, {
      headers: createHeaders(userId),
    });
    if (!response.ok) throw new Error("Failed to fetch refunds");
    return await response.json();
  } catch (error) {
    console.error("Error fetching refunds:", error);
    throw error;
  }
};

export const fetchRefundById = async (
  userId: string,
  refundId: number
): Promise<Refund> => {
  try {
    const response = await fetch(`${API_URL}/refunds/${refundId}`, {
      headers: createHeaders(userId),
    });
    if (!response.ok) throw new Error("Failed to fetch refund");
    return await response.json();
  } catch (error) {
    console.error("Error fetching refund:", error);
    throw error;
  }
};