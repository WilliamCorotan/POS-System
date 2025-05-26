import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/api/base";

export async function PATCH(
    req: Request,
    { params }: any
) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, email, password } = body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) updateData.password = password;

        const updatedUser = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, parseInt(params.id)))
            .returning();

        return NextResponse.json(updatedUser[0]);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: any
) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await db
            .delete(users)
            .where(eq(users.id, parseInt(params.id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
} 