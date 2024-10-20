# POS System Server Setup

This guide will walk you through the process of setting up the server for the POS (Point of Sale) system.

## Prerequisites

- Node.js (v14 or later)
- MySQL (v8 or later)
- npm (usually comes with Node.js)

## Step 1: Database Setup

1. Log in to MySQL as root:
   ```
   mysql -u root -p
   ```

2. Create a new database for the POS system:
   ```sql
   CREATE DATABASE pos_system;
   ```

3. Create a new user and grant privileges:
   ```sql
   CREATE USER 'pos_user'@'localhost' IDENTIFIED BY 'your_password_here';
   GRANT ALL PRIVILEGES ON pos_system.* TO 'pos_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. Switch to the new database:
   ```sql
   USE pos_system;
   ```

5. Create the necessary tables:
   ```sql
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL UNIQUE,
     password VARCHAR(255) NOT NULL,
     token VARCHAR(255),
     profile_picture VARCHAR(255)
   );

   CREATE TABLE user_contacts (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT,
     contact_id INT,
     contact_type VARCHAR(50),
     FOREIGN KEY (user_id) REFERENCES users(id)
   );

   CREATE TABLE user_settings (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT,
     settings_name VARCHAR(255),
     FOREIGN KEY (user_id) REFERENCES users(id)
   );

   CREATE TABLE files (
     id VARCHAR(255) PRIMARY KEY,
     filename VARCHAR(255) NOT NULL,
     filepath VARCHAR(255) NOT NULL,
     mimetype VARCHAR(100) NOT NULL
   );

   CREATE TABLE product_categories (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     description TEXT
   );

   CREATE TABLE unit_measurements (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(50) NOT NULL,
     description TEXT
   );

   CREATE TABLE products (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     code VARCHAR(50) UNIQUE,
     description TEXT,
     image VARCHAR(255),
     buy_price DECIMAL(10, 2) NOT NULL,
     sell_price DECIMAL(10, 2) NOT NULL,
     stock INT NOT NULL,
     low_stock_level INT,
     expiration_date DATE,
     unit_measurements_id INT,
     category_id INT,
     FOREIGN KEY (unit_measurements_id) REFERENCES unit_measurements(id),
     FOREIGN KEY (category_id) REFERENCES product_categories(id),
     FOREIGN KEY (image) REFERENCES files(id)
   );

   CREATE TABLE orders (
     id INT AUTO_INCREMENT PRIMARY KEY,
     product_id INT,
     quantity INT NOT NULL,
     FOREIGN KEY (product_id) REFERENCES products(id)
   );

   CREATE TABLE payments (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(50) NOT NULL
   );

   CREATE TABLE transactions (
     id INT AUTO_INCREMENT PRIMARY KEY,
     payment_method_id INT,
     date_of_transaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     email_to VARCHAR(255),
     cash_received DECIMAL(10, 2),
     total_price DECIMAL(10, 2) NOT NULL,
     FOREIGN KEY (payment_method_id) REFERENCES payments(id)
   );

   CREATE TABLE transaction_orders (
     id INT AUTO_INCREMENT PRIMARY KEY,
     order_id INT,
     transaction_id INT,
     FOREIGN KEY (order_id) REFERENCES orders(id),
     FOREIGN KEY (transaction_id) REFERENCES transactions(id)
   );
   ```

6. Exit MySQL:
   ```
   EXIT;
   ```

## Step 2: Project Setup

1. Create a new directory for your project:
   ```
   mkdir pos-system-server
   cd pos-system-server
   ```

2. Initialize a new Node.js project:
   ```
   npm init -y
   ```

3. Install the required dependencies:
   ```
   npm install hono @hono/node-server mysql2 dotenv jsonwebtoken
   ```

4. Create a `.env` file in the root directory and add the following content:
   ```
   DB_HOST=localhost
   DB_USER=pos_user
   DB_PASSWORD=your_password_here
   DB_NAME=pos_system
   JWT_SECRET=your_jwt_secret_here
   ```

   Replace `your_password_here` with the password you set for the `pos_user` and `your_jwt_secret_here` with a secure random string for JWT token generation.

## Step 3: Server Code

1. Create a new file named `server.ts` in the root directory and copy the provided server code into it.

2. Update the database connection details in the server code to use the environment variables:

   ```typescript
   import { config } from 'dotenv';
   config();

   const db = await new Client({
     host: process.env.DB_HOST,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     database: process.env.DB_NAME,
   });
   ```

3. Update the JWT secret in the server code:

   ```typescript
   app.use('/*', jwt({
     secret: process.env.JWT_SECRET,
   }))
   ```

## Step 4: Running the Server

1. Add a start script to your `package.json`:
   ```json
   "scripts": {
     "start": "node --loader ts-node/esm server.ts"
   }
   ```

2. Install ts-node and typescript as dev dependencies:
   ```
   npm install --save-dev ts-node typescript @types/node
   ```

3. Create a `tsconfig.json` file in the root directory with the following content:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext",
       "moduleResolution": "node",
       "esModuleInterop": true,
       "strict": true
     }
   }
   ```

4. Start the server:
   ```
   npm start
   ```

Your server should now be running on `http://localhost:3000`.

## Next Steps

- Implement user authentication and authorization
- Add more API endpoints as needed
- Implement proper error handling and logging
- Set up a production-ready environment (e.g., using PM2 for process management)
- Configure HTTPS for secure communication
- Implement rate limiting and other security measures

Remember to keep your `.env` file and sensitive information secure and never commit them to version control.