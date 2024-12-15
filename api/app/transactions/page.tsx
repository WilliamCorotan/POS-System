"use client";

import { useAuth } from "@clerk/nextjs";
import TransactionList from "@/components/TransactionList";

export default function TransactionsPage() {
    const { userId } = useAuth();

    if (!userId) {
        return <div>Please sign in to view transactions</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Transactions</h1>
                {/* Add New Transaction button can be added here */}
            </div>
            <TransactionList />
        </div>
    );
}
