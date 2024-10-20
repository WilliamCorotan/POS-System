import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { Client } from 'mysql2/promise'

const app = new Hono()

app.use('/*', cors())
app.use('/*', jwt({
  secret: 'your_jwt_secret_here',
}))

// MySQL connection
const db = await new Client({
  host: 'localhost',
  user: 'your_mysql_user',
  password: 'your_mysql_password',
  database: 'pos_system',
})

await db.connect()

interface Product {
  id: number
  name: string
  code: string
  description: string
  image: string
  buy_price: number
  sell_price: number
  stock: number
  low_stock_level: number
  expiration_date: string
  unit_measurements_id: number
  category_id: number
}

interface Order {
  id: number
  product_id: number
  quantity: number
}

interface Transaction {
  id: number
  payment_method_id: number
  date_of_transaction: string
  email_to: string
  cash_received: number
  total_price: number
}

app.get('/products', async (c) => {
  const [rows] = await db.query(`
    SELECT p.*, pc.name as category_name, um.name as unit_measurement, f.filepath as image_path
    FROM products p
    LEFT JOIN product_categories pc ON p.category_id = pc.id
    LEFT JOIN unit_measurements um ON p.unit_measurements_id = um.id
    LEFT JOIN files f ON p.image = f.id
  `)
  return c.json(rows)
})

app.post('/products', async (c) => {
  const product: Omit<Product, 'id'> = await c.req.json()
  const [result] = await db.query(
    'INSERT INTO products (name, code, description, image, buy_price, sell_price, stock, low_stock_level, expiration_date, unit_measurements_id, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [product.name, product.code, product.description, product.image, product.buy_price, product.sell_price, product.stock, product.low_stock_level, product.expiration_date, product.unit_measurements_id, product.category_id]
  )
  const newProduct = { id: result.insertId, ...product }
  return c.json(newProduct, 201)
})

app.put('/products/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const product: Omit<Product, 'id'> = await c.req.json()
  const [result] = await db.query(
    'UPDATE products SET name = ?, code = ?, description = ?, image = ?, buy_price = ?, sell_price = ?, stock = ?, low_stock_level = ?, expiration_date = ?, unit_measurements_id = ?, category_id = ? WHERE id = ?',
    [product.name, product.code, product.description, product.image, product.buy_price, product.sell_price, product.stock, product.low_stock_level, product.expiration_date, product.unit_measurements_id, product.category_id, id]
  )
  if (result.affectedRows === 0) {
    return c.json({ error: 'Product not found' }, 404)
  }
  const updatedProduct = { id, ...product }
  return c.json(updatedProduct)
})

app.delete('/products/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const [result] = await db.query('DELETE FROM products WHERE id = ?', [id])
  if (result.affectedRows === 0) {
    return c.json({ error: 'Product not found' }, 404)
  }
  return c.json({ message: 'Product deleted successfully' })
})

app.post('/order', async (c) => {
  const cart: { product_id: number; quantity: number }[] = await c.req.json()
  const connection = await db.getConnection()
  
  try {
    await connection.beginTransaction()

    // Create a new transaction
    const [transactionResult] = await connection.query(
      'INSERT INTO transactions (payment_method_id, date_of_transaction, total_price) VALUES (?, NOW(), ?)',
      [1, 0] // Assuming payment_method_id 1 is for cash, and we'll update the total_price later
    )
    const transactionId = transactionResult.insertId

    let totalPrice = 0

    // Process each item in the cart
    for (const item of cart) {
      // Create an order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (product_id, quantity) VALUES (?, ?)',
        [item.product_id, item.quantity]
      )
      const orderId = orderResult.insertId

      // Link the order to the transaction
      await connection.query(
        'INSERT INTO transaction_orders (order_id, transaction_id) VALUES (?, ?)',
        [orderId, transactionId]
      )

      // Update product stock
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      )

      // Calculate total price
      const [productResult] = await connection.query('SELECT sell_price FROM products WHERE id = ?', [item.product_id])
      totalPrice += productResult[0].sell_price * item.quantity
    }

    // Update the transaction with the total price
    await connection.query(
      'UPDATE transactions SET total_price = ? WHERE id = ?',
      [totalPrice, transactionId]
    )

    await connection.commit()

    return c.json({ message: 'Order processed successfully', transactionId, totalPrice })
  } catch (error) {
    await connection.rollback()
    console.error('Error processing order:', error)
    return c.json({ error: 'Failed to process order' }, 500)
  } finally {
    connection.release()
  }
})

export default app