import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getProducts, createProduct } from "@/lib/api/products";

export async function GET() {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const productsList = await getProducts(userId);
        return NextResponse.json(productsList);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const newProduct = await createProduct(body, userId);
        return NextResponse.json(newProduct);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}
