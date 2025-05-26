import { NextResponse } from "next/server";
import { createUser, getUsersByParentId } from "@/lib/api/users";
import { getCurrentUserId } from "@/lib/api/base";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        console.log("userId", userId);

        const users = await getUsersByParentId(userId);
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
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

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }



        const newUser = await createUser(
            {
                name,
                email,
                password,
                clerkId: userId,
            },
            userId
        );

        return NextResponse.json(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
} 

export async function PUT(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await db.query.users.findFirst({
      where: and(
        eq(users.email, email),
        eq(users.password, password),
        eq(users.clerkId, userId)
      ),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      clerkId: user.clerkId,
    });
  } catch (error) {
    console.error("Error checking user credentials:", error);
    return NextResponse.json(
      { error: "Failed to check credentials" },
      { status: 500 }
    );
  }
} 