import * as SQLite from 'expo-sqlite';
import { Product, Transaction } from './types';

const db = SQLite.openDatabase('pos.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(`
        CREATE TABLE IF NOT EXISTS files (
          id TEXT PRIMARY KEY,
          filename TEXT,
          filepath TEXT,
          mimetype TEXT
        );
      `);
  
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT
        );
      `);
  
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT,
          password TEXT,
          token TEXT,
          profile_picture TEXT REFERENCES files(id)
        );
      `);
  
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS contacts_types (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT
        );
      `);
  
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS user_contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id),
          contact_id INTEGER
        );
      `);
  
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT
        );
      `);
  
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id),
          settings_id INTEGER REFERENCES settings(id)
        );
      `);
  
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS unit_measurements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          description TEXT
        );
      `);
  
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS product_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          description TEXT
        );
      `);
  
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          code TEXT,
          description TEXT,
          image TEXT REFERENCES files(id),
          buy_price DECIMAL(10, 2),
          sell_price DECIMAL(10, 2),
          stock INTEGER,
          low_stock_level INTEGER,
          expiration_date TIMESTAMP,
          unit_measurements_id INTEGER REFERENCES unit_measurements(id)
        );
      `);
  
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER REFERENCES products(id),
          quantity INTEGER
        );
      `);
  
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          payment_method_id INTEGER REFERENCES payments(id),
          date_of_transaction TIMESTAMP,
          email_to TEXT,
          cash_received DECIMAL(10, 2),
          total_price DECIMAL(10, 2)
        );
      `);
  
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS transaction_orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER REFERENCES orders(id),
          transaction_id INTEGER REFERENCES transactions(id)
        );
      `);
  
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS transactions_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id),
          transaction_id INTEGER REFERENCES transactions(id)
        );
      `);

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

export const getProductByCode = async (code: string): Promise<Product | null> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM products WHERE code LIKE ? LIMIT 1', // Query to get product by code
          [code], // Pass the code as the parameter
          (_, { rows: { _array } }) => {
            // If a product is found, return it, otherwise return null
            resolve(_array.length > 0 ? _array[0] : null);
          },
          (_, error) => {
            reject(error); // Reject the promise if an error occurs
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
          product.image,
          product.buy_price,
          product.sell_price,
          product.stock,
          product.low_stock_level,
          id,
        ],
        (_, result) => {console.log('result', result); resolve()},
        (_, error) => {
            console.log('error', error);
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

export const getActiveTransaction = (): Promise<Transaction | null> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM transactions WHERE status = "active" LIMIT 1',
          [],
          (_, { rows: { _array } }) => {
            console.log('Active transaction result:', _array); // Log the result
            resolve(_array[0] || []);
          },
          (_, error) => {
            console.error('Error fetching active transaction:', error); // Log the error
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  
  export const createTransaction = (): Promise<number> => {
    console.log('creating');
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO transactions (payment_method_id, date_of_transaction, status, total_price) VALUES (null, datetime("now"), "active", 0)',
          [], // Default to cash payment
          (_, { insertId }) => {console.log('insertId', insertId); resolve(insertId)},
          (_, error) => {
            console.log('Error creating transaction:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const getTableSchema = (tableName: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `PRAGMA table_info(${tableName});`, // Query to get table schema
          [],
          (_, { rows: { _array } }) => {
            // The result is an array of column details
            resolve(_array);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  export const addToCart = async (productId: number, quantity: number = 1): Promise<void> => {

    console.log('productId', productId);
    let transaction = await getActiveTransaction();
    console.log('transaction', transaction);
    if (!transaction || !transaction.id) {
      const transactionId = await createTransaction();
      transaction = { id: transactionId } as Transaction;
    }

    

    


    // console.log('transaction', transaction);
    return new Promise(async(resolve, reject) => {

      const product = await getProductByCode((productId).toString());


      if (!product || !product.id) {
        reject('Product not found');
        return;
      }
      console.log('product', product);
      productId = product.id;
      db.transaction(tx => {
        // Check if product already exists in cart
        tx.executeSql(
          `SELECT o.* FROM orders o
           JOIN transaction_orders tro ON o.id = tro.order_id
           WHERE tro.transaction_id = ? AND o.product_id = ?`,
          [transaction.id, productId],
          (_, { rows: { _array } }) => {
            if (_array.length > 0) {
              // Update existing order
              const order = _array[0];
              tx.executeSql(
                'UPDATE orders SET quantity = quantity + ? WHERE id = ?',
                [quantity, order.id],
                () => resolve(),
                (_, error) => {
                  reject(error);
                  return false;
                }
              );
            } else {
              // Create new order
              tx.executeSql(
                'INSERT INTO orders (product_id, quantity) VALUES (?, ?)',
                [productId, 1],
                (_, { insertId: orderId }) => {
                  tx.executeSql(
                    'INSERT INTO transaction_orders (order_id, transaction_id) VALUES (?, ?)',
                    [orderId, transaction.id],
                    () => resolve(),
                    (_, error) => {
                      reject(error);
                      return false;
                    }
                  );
                },
                (_, error) => {
                  reject(error);
                  return false;
                }
              );
            }
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  export const getCartItems = async (): Promise<CartItem[]> => {
    const transaction = await getActiveTransaction();
    if (!transaction || !transaction.id) {console.log('hell yeah'); return []};
  
    console.log('transactionssss', transaction.id);
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT o.id, p.name, o.quantity, p.sell_price as price, p.id as product_id
           FROM orders o
           LEFT JOIN transaction_orders tro ON o.id = tro.order_id
           LEFT JOIN products p ON o.product_id = p.id`,
          [transaction.id],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  export const updateCartItemQuantity = (orderId: number, quantity: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE orders SET quantity = ? WHERE id = ?',
          [quantity, orderId],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  export const removeCartItem = (orderId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM orders WHERE id = ?',
          [orderId],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  export const finalizeTransaction = async (paymentMethodId: number, cashReceived: number): Promise<void> => {
    // Step 1: Get the active transaction
    const transaction = await getActiveTransaction();
    if (!transaction) throw new Error('No active transaction found');
    
    return new Promise((resolve, reject) => {
      // Step 2: Start a new database transaction
      db.transaction(tx => {
        // Step 3: Get the sum of all the orders in the current transaction
        tx.executeSql(
          `SELECT SUM(o.quantity * p.sell_price) AS total_price 
           FROM orders o
           JOIN transaction_orders tro ON o.id = tro.order_id
           JOIN products p ON o.product_id = p.id
           WHERE tro.transaction_id = ?`,
          [transaction.id],
          (_, { rows }) => {
            const totalPrice = rows.length > 0 ? rows.item(0).total_price : 0;
            
            // Step 4: Update the transaction with the calculated total price
            tx.executeSql(
              'UPDATE transactions SET status = "completed", payment_method_id = ?, cash_received = ?, total_price = ? WHERE id = ?',
              [paymentMethodId, cashReceived, totalPrice, transaction.id],
              () => {
                resolve();
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });  
  };