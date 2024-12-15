import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function addClerkId() {
    try {
        // Add clerk_id to files table
        await db.run(sql`
            ALTER TABLE files
            ADD COLUMN clerk_id TEXT NOT NULL DEFAULT '';
        `);

        // Add clerk_id to payments table
        await db.run(sql`
            ALTER TABLE payments
            ADD COLUMN clerk_id TEXT NOT NULL DEFAULT '';
        `);

        // Add clerk_id to users table
        await db.run(sql`
            ALTER TABLE users
            ADD COLUMN clerk_id TEXT NOT NULL DEFAULT '';
        `);

        // Add unique constraint to users.clerk_id
        await db.run(sql`
            CREATE UNIQUE INDEX idx_users_clerk_id ON users(clerk_id);
        `);

        // Add clerk_id to contacts_types table
        await db.run(sql`
            ALTER TABLE contacts_types
            ADD COLUMN clerk_id TEXT NOT NULL DEFAULT '';
        `);

        // Add clerk_id to user_contacts table
        await db.run(sql`
            ALTER TABLE user_contacts
            ADD COLUMN clerk_id TEXT NOT NULL DEFAULT '';
        `);

        // Add clerk_id to settings table
        await db.run(sql`
            ALTER TABLE settings
            ADD COLUMN clerk_id TEXT NOT NULL DEFAULT '';
        `);

        // Add clerk_id to user_settings table
        await db.run(sql`
            ALTER TABLE user_settings
            ADD COLUMN clerk_id TEXT NOT NULL DEFAULT '';
        `);

        // Add clerk_id to unit_measurements table
        await db.run(sql`
            ALTER TABLE unit_measurements
            ADD COLUMN clerk_id TEXT NOT NULL DEFAULT '';
        `);

        // Add clerk_id to product_categories table
        await db.run(sql`
            ALTER TABLE product_categories
            ADD COLUMN clerk_id TEXT NOT NULL DEFAULT '';
        `);

        // Add clerk_id to products table
        await db.run(sql`
            ALTER TABLE products
            ADD COLUMN clerk_id TEXT NOT NULL DEFAULT '';
        `);

        // Add clerk_id to transactions table
        await db.run(sql`
            ALTER TABLE transactions
            ADD COLUMN clerk_id TEXT NOT NULL DEFAULT '';
        `);

        // Add clerk_id to orders table
        await db.run(sql`
            ALTER TABLE orders
            ADD COLUMN clerk_id TEXT NOT NULL DEFAULT '';
        `);

        // Add clerk_id to transactions_history table
        await db.run(sql`
            ALTER TABLE transactions_history
            ADD COLUMN clerk_id TEXT NOT NULL DEFAULT '';
        `);

        console.log("✓ Added clerk_id to all tables");
    } catch (error) {
        console.error("Failed to add clerk_id columns:", error);
        throw error;
    }
}
