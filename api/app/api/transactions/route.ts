import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/api/base";
import { getTransactions, createTransaction } from "@/lib/api/transactions";

export async function GET() {
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const transactionsList = await getTransactions(userId);
        return NextResponse.json(transactionsList);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        console.log('request >>', body);
        const { items, ...transactionData } = body;
        
        const newTransaction = await createTransaction(
            transactionData,
            items,
            userId
        );
        return NextResponse.json(newTransaction);
    } catch (error) {
        console.error("Error creating transaction:", error);
        return NextResponse.json(
            { error: "Failed to create transaction" },
            { status: 500 }
        );
    }
}
