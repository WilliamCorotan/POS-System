import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function getProducts(userId: string) {
    return db.select().from(products).where(eq(products.clerkId, userId));
}

export async function createProduct(data: any, userId: string) {
    return db.insert(products).values({
        ...data,
        clerkId: userId,
    });
}

export async function updateProduct(id: number, data: any, userId: string) {
    return db
        .update(products)
        .set(data)
        .where(and(eq(products.id, id), eq(products.clerkId, userId)))
        .returning();
}

export async function deleteProduct(id: number, userId: string) {
    return db
        .delete(products)
        .where(and(eq(products.id, id), eq(products.clerkId, userId)));
}
