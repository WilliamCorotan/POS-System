import { initialSetup } from "./00-initial-setup";
import { contactsAndSettings } from "./01-contacts-and-settings";
import { productsSetup } from "./02-products-setup";
import { transactionsSetup } from "./03-transactions-setup";
import { addClerkId } from "./04-add-clerk-id";

export async function runMigrations() {
    try {
        console.log("Running migrations...");

        await initialSetup();
        console.log("✓ Initial setup complete");

        await contactsAndSettings();
        console.log("✓ Contacts and settings tables created");

        await productsSetup();
        console.log("✓ Products tables created");

        await transactionsSetup();
        console.log("✓ Transactions tables created");

        await addClerkId();
        console.log("✓ Added Clerk ID support");

        console.log("All migrations completed successfully");
    } catch (error) {
        console.error("Migration failed:", error);
        throw error;
    }
}
