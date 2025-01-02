import { db } from "@/lib/db";
import { transactions, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getTransactions(userId: string) {
    return db
        .select()
        .from(transactions)
        .where(eq(transactions.clerkId, userId));
}

export async function createTransaction(
    data: any,
    items: any[],
    userId: string
) {

    try {
        
        const date = new Date(data.date_of_transaction);
        const dateOfTransaction = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;

        const insertData = {
            ...data,
            date_of_transaction: dateOfTransaction,
            clerkId: userId,
        };
        console.log('inner >>', transactions);
        const newTransaction = await db.insert(transactions).values(insertData);

        // Insert transaction items
        for (const item of items) {
            await db.insert(orders).values({
                transactionId: newTransaction.lastInsertRowid,
                clerkId: userId,
                ...item,
            });
        }

        return newTransaction;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }

}
