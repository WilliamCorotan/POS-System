import { db } from "@/lib/db";
import { productCategories } from "@/lib/db/schema";
import { Category } from "@/types";
import { eq, and, isNull } from "drizzle-orm";

export async function getCategories(userId: string) {
    return db
        .select()
        .from(productCategories)
        .where(and(eq(productCategories.clerkId, userId), isNull(productCategories.deleted)));
}

export async function createCategory(data: Category, userId: string) {
    return db.insert(productCategories).values({
        ...data,
        clerkId: userId,
    });
}

export async function updateCategory(
    id: number,
    data: Category,
    userId: string
) {
    return db
        .update(productCategories)
        .set(data)
        .where(
            and(
                eq(productCategories.id, id),
                eq(productCategories.clerkId, userId)
            )
        )
        .returning();
}

export async function deleteCategory(id: number, userId: string) {
    const date = new Date();
    const dateDeleted = `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(
        date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(
        date.getSeconds()
    ).padStart(2, "0")}`;

    return db
        .update(productCategories)
        .set({
            deleted: dateDeleted,
        })
        .where(
            and(
                eq(productCategories.id, id),
                eq(productCategories.clerkId, userId)
            )
        );
}
