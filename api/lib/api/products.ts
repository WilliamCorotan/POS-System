import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { Product } from "@/types";
import { and, eq, isNull } from "drizzle-orm";

export async function getProducts(userId: string) {
  return db
    .select()
    .from(products)
    .where(and(eq(products.clerkId, userId), isNull(products.deleted)));
}

export async function createProduct(data: Product, userId: string) {
  console.log("checkk >> before: ", data);
  return db.insert(products).values({
    ...data,
    unitMeasurementsId:
      data.unitMeasurementsId === 0 ? null : data.unitMeasurementsId,
    categoryId: data.categoryId === 0 ? null : data.categoryId,
    clerkId: userId,
  });
}

export async function updateProduct(id: number, data: Product, userId: string) {
  if (data.unitMeasurementsId === 0) {
    data.unitMeasurementsId = undefined;
  }

  if (data.categoryId === 0) {
    data.categoryId = undefined;
  }

  data.clerkId = userId;

  return db
    .update(products)
    .set(data)
    .where(and(eq(products.id, id), eq(products.clerkId, userId)))
    .returning();
}

export async function deleteProduct(id: number, userId: string) {
  const date = new Date();
  const dateDeleted = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(
    date.getSeconds()
  ).padStart(2, "0")}`;

  return db
    .update(products)
    .set({
      deleted: dateDeleted,
    })
    .where(and(eq(products.id, id), eq(products.clerkId, userId)));
}
