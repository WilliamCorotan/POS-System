import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function removeUniqueClerkId() {
  // Drop the unique constraint from clerkId column

  await db.run(sql`
        DROP TABLE IF EXISTS users_new;
    `);

  await db.run(sql`
        CREATE TABLE IF NOT EXISTS users_new (
            id INTEGER PRIMARY KEY,
            clerk_id TEXT NOT NULL,
            name TEXT,
            email TEXT,
            password TEXT,
            token TEXT,
            profile_picture TEXT REFERENCES files(id)
        );
    `);

  await db.run(sql`
        INSERT INTO users_new SELECT * FROM users;
       
    `);

  await db.run(sql`
        DROP TABLE users;
       
    `);

  await db.run(sql`
        ALTER TABLE users_new RENAME TO users;
       
    `);

  await db.run(sql`
        DROP TABLE IF EXISTS users_new;
    `);
}
