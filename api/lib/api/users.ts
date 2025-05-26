import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    clerkId: string;
}

export async function createUser(data: CreateUserData, adminId: string) {
    // Create the new user with the admin's clerk ID and parent ID
    console.log("aa", {
      ...data,
      clerkId: adminId,
    });
    return db.insert(users).values({
        ...data,
        clerkId: adminId,
    });
}

export async function getUsersByParentId(parentId: string) {
    return db.query.users.findMany({
        where: eq(users.clerkId, parentId),
    });
}

export async function getUserById(id: string) {
    return db.query.users.findFirst({
        where: eq(users.id, parseInt(id)),
    });
} 