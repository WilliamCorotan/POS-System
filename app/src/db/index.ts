import * as SQLite from 'expo-sqlite';
import { createTables } from './schema';

const db = SQLite.openDatabase('pos.db');

export const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        createTables(tx);
      },
      error => {
        console.error('Error creating tables:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve(true);
      }
    );
  });
};

export const dropTables = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql('DROP TABLE IF EXISTS users;');
        tx.executeSql('DROP TABLE IF EXISTS user_contacts;');
        tx.executeSql('DROP TABLE IF EXISTS user_settings;');
        tx.executeSql('DROP TABLE IF EXISTS settings;');
        tx.executeSql('DROP TABLE IF EXISTS products;');
        tx.executeSql('DROP TABLE IF EXISTS transactions;');
        tx.executeSql('DROP TABLE IF EXISTS transactions_history;');
        tx.executeSql('DROP TABLE IF EXISTS payments;');
        tx.executeSql('DROP TABLE IF EXISTS files;');
        tx.executeSql('DROP TABLE IF EXISTS orders;');
      },
      error => {
        console.error('Error dropping tables:', error);
        reject(error);
      },
      () => {
        console.log('Tables dropped successfully');
        resolve(true);
      }
    );
  });
};

export const getDatabase = () => db;