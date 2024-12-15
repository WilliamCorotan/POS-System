import { db } from "@/lib/db";
import { unitMeasurements, payments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Unit Measurements
export async function getUnitMeasurements(userId: string) {
    return db
        .select()
        .from(unitMeasurements)
        .where(eq(unitMeasurements.clerkId, userId));
}

export async function createUnitMeasurement(data: any, userId: string) {
    return db.insert(unitMeasurements).values({
        ...data,
        clerkId: userId,
    });
}

export async function updateUnitMeasurement(
    id: number,
    data: any,
    userId: string
) {
    return db
        .update(unitMeasurements)
        .set(data)
        .where(
            and(
                eq(unitMeasurements.id, id),
                eq(unitMeasurements.clerkId, userId)
            )
        )
        .returning();
}

export async function deleteUnitMeasurement(id: number, userId: string) {
    return db
        .delete(unitMeasurements)
        .where(
            and(
                eq(unitMeasurements.id, id),
                eq(unitMeasurements.clerkId, userId)
            )
        );
}

// Payment Methods
export async function getPaymentMethods(userId: string) {
    return db.select().from(payments).where(eq(payments.clerkId, userId));
}

export async function createPaymentMethod(data: any, userId: string) {
    return db.insert(payments).values({
        ...data,
        clerkId: userId,
    });
}

export async function updatePaymentMethod(
    id: number,
    data: any,
    userId: string
) {
    return db
        .update(payments)
        .set(data)
        .where(and(eq(payments.id, id), eq(payments.clerkId, userId)))
        .returning();
}

export async function deletePaymentMethod(id: number, userId: string) {
    return db
        .delete(payments)
        .where(and(eq(payments.id, id), eq(payments.clerkId, userId)));
}
