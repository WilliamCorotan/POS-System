import * as SQLite from 'expo-sqlite';
import { Product, Transaction } from './types';

const db = SQLite.openDatabase('pos.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        code TEXT,
        description TEXT,
        image TEXT,
        buy_price REAL,
        sell_price REAL,
        stock INTEGER,
        low_stock_level INTEGER,
        expiration_date TEXT,
        unit_measurements_id INTEGER
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_method_id INTEGER,
        date_of_transaction TEXT,
        email_to TEXT,
        cash_received REAL,
        total_price REAL
      );`
    );
  });
};

export const getProducts = (): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM products',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getProductById = (id: number): Promise<Product> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM products WHERE id = ?',
        [id],
        (_, { rows: { _array } }) => resolve(_array[0]),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const createProduct = (product: Partial<Product>): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO products (name, code, description, buy_price, sell_price, stock, low_stock_level)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.code,
          product.description,
          product.buy_price,
          product.sell_price,
          product.stock,
          product.low_stock_level,
        ],
        (_, { insertId }) => resolve(insertId),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const updateProduct = (id: number, product: Partial<Product>): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE products 
         SET name = ?, code = ?, description = ?, buy_price = ?, 
             sell_price = ?, stock = ?, low_stock_level = ?
         WHERE id = ?`,
        [
          product.name,
          product.code,
          product.description,
          product.buy_price,
          product.sell_price,
          product.stock,
          product.low_stock_level,
          id,
        ],
        (_, result) => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const deleteProduct = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM products WHERE id = ?',
        [id],
        (_, result) => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getTransactions = (): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM transactions ORDER BY date_of_transaction DESC',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};