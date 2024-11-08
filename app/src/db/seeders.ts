import { getDatabase } from './index';

const db = getDatabase();

export const seedDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Seed payment methods
        tx.executeSql(`
          INSERT OR IGNORE INTO payments (name) VALUES 
          ('Cash'),
          ('Credit Card'),
          ('Debit Card'),
          ('Mobile Payment');
        `);

        // Seed unit measurements
        tx.executeSql(`
          INSERT OR IGNORE INTO unit_measurements (name, description) VALUES 
          ('piece', 'Individual unit'),
          ('kg', 'Kilogram'),
          ('g', 'Gram'),
          ('l', 'Liter'),
          ('ml', 'Milliliter');
        `);

        // Seed product categories
        tx.executeSql(`
          INSERT OR IGNORE INTO product_categories (name, description) VALUES 
          ('Electronics', 'Electronic devices and accessories'),
          ('Food', 'Food and beverages'),
          ('Clothing', 'Apparel and accessories'),
          ('Home', 'Home and living items');
        `);
      },
      error => {
        console.error('Error seeding database:', error);
        reject(error);
      },
      () => {
        console.log('Database seeded successfully');
        resolve(true);
      }
    );
  });
};

export const clearDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql('DELETE FROM products;');
        tx.executeSql('DELETE FROM transactions;');
        tx.executeSql('DELETE FROM orders;');
        tx.executeSql('DELETE FROM transaction_orders;');
        tx.executeSql('DELETE FROM transactions_history;');
      },
      error => {
        console.error('Error clearing database:', error);
        reject(error);
      },
      () => {
        console.log('Database cleared successfully');
        resolve(true);
      }
    );
  });
};