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

export const getDatabase = () => db;