import { SQLTransaction } from 'expo-sqlite';

export const createTables = (tx: SQLTransaction) => {
  // Users table
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      token TEXT,
      profile_picture TEXT
    );
  `);

  // User contacts table
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS user_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      contact_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  // Contact types table
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS contact_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);

  // User settings table
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      settings_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (settings_id) REFERENCES settings (id)
    );
  `);

  // Settings table
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);

  // Products table
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      buy_price REAL NOT NULL,
      sell_price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      low_stock_level INTEGER NOT NULL DEFAULT 0,
      expiration_date TEXT,
      unit_measurements_id INTEGER,
      FOREIGN KEY (unit_measurements_id) REFERENCES unit_measurements (id)
    );
  `);

  // Product categories table
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS product_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    );
  `);

  // Unit measurements table
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS unit_measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    );
  `);

  // Orders table
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );
  `);

  // Transaction orders table
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS transaction_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      transaction_id INTEGER,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (transaction_id) REFERENCES transactions (id)
    );
  `);

  // Transactions table
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_method_id INTEGER,
      date_of_transaction TEXT NOT NULL,
      email_to TEXT,
      cash_received REAL NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY (payment_method_id) REFERENCES payments (id)
    );
  `);

  // Transaction history table
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS transactions_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      transaction_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (transaction_id) REFERENCES transactions (id)
    );
  `);

  // Payments table
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);

  // Files table
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      mimetype TEXT NOT NULL
    );
  `);
};