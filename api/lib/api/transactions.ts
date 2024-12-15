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
    const newTransaction = await db.insert(transactions).values({
        ...data,
        clerkId: userId,
        date: new Date().toISOString(),
    });

    // Insert transaction items
    for (const item of items) {
        await db.insert(orders).values({
            transactionId: newTransaction.lastInsertRowid,
            clerkId: userId,
            ...item,
        });
    }

    return newTransaction;
}
