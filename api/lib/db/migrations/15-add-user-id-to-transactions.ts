import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function addUserIdToTransactions() {
  try {
    // Check if the column already exists
    const columnExistsResult = await db.get<{ count: number }>(sql`
            SELECT COUNT(*) as count
            FROM pragma_table_info('transactions')
            WHERE name = 'user_id';
        `);

    const columnExists = columnExistsResult?.count ?? 0;

    if (columnExists === 0) {
      // Add the column if it doesn't exist
      await db.run(sql`
                ALTER TABLE transactions
                ADD COLUMN user_id INTEGER REFERENCES users(id) NULL DEFAULT NULL
            `);

      console.log(`✓ Added user_id column to transactions table`);
    } else {
      console.log(
        `✗ user_id column already exists in transactions table`
      );
    }
  } catch (error) {
    console.error("Failed to add user_id column:", error);
    throw error;
  }
}
