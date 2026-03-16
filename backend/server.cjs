const express = require('express');
const cors = require('cors');
const db = require('./db.cjs');

const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Fetch entire database dump for our Zustand store 
// (In a real app, you wouldn't send everything at once, but this keeps the MVP working as is!)
app.get('/api/data', async (req, res) => {
  try {
    const usersRes = await db.query('SELECT id, login_id as "loginId", password, name, role, restaurant_id as "restaurantId" FROM users');
    const restsRes = await db.query('SELECT id, name, admin_id as "adminId", image FROM restaurants');
    const menusRes = await db.query('SELECT id, restaurant_id as "restaurantId", name, price, qty, image FROM menu_items');
    
    // Get orders with items
    const ordersRes = await db.query('SELECT id, customer_id as "customerId", restaurant_id as "restaurantId", status, total, created_at as "createdAt" FROM orders');
    const orderItemsRes = await db.query('SELECT order_id, menu_item_id as "menuItemId", name, price, qty FROM order_items');
    
    const orders = ordersRes.rows.map(o => {
      o.total = parseFloat(o.total);
      o.createdAt = parseInt(o.createdAt);
      o.items = orderItemsRes.rows
        .filter(item => item.order_id === o.id)
        .map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: parseFloat(item.price),
          qty: item.qty
        }));
      return o;
    });

    res.json({
      users: usersRes.rows.map(u => ({ ...u, password: u.password })), 
      restaurants: restsRes.rows,
      menuItems: menusRes.rows.map(m => ({ ...m, price: parseFloat(m.price) })),
      orders: orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Place new order
app.post('/api/orders', async (req, res) => {
  const { id, customerId, restaurantId, items, total, status, createdAt } = req.body;
  try {
    await db.query('BEGIN');
    
    await db.query(
      'INSERT INTO orders (id, customer_id, restaurant_id, status, total, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, customerId, restaurantId, status, total, createdAt]
    );

    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, menu_item_id, name, price, qty) VALUES ($1, $2, $3, $4, $5)',
        [id, item.menuItemId, item.name, item.price, item.qty]
      );
    }

    await db.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Update order status and deduct qty
app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, menuItemsUpdates } = req.body;
  
  try {
    await db.query('BEGIN');
    
    await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);

    if (menuItemsUpdates && menuItemsUpdates.length > 0) {
      for (const item of menuItemsUpdates) {
        await db.query('UPDATE menu_items SET qty = $1 WHERE id = $2', [item.qty, item.id]);
      }
    }

    await db.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

// Update menu qty manually
app.patch('/api/menu/:id/qty', async (req, res) => {
  const { id } = req.params;
  const { qty } = req.body;
  try {
    await db.query('UPDATE menu_items SET qty = $1 WHERE id = $2', [qty, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

// Create new restaurant and its admin
app.post('/api/restaurants', async (req, res) => {
  const { id, name, image, adminId, adminLoginId, adminPassword, adminName } = req.body;
  
  try {
    await db.query('BEGIN');
    
    // 1. Create the Admin User first
    await db.query(
      'INSERT INTO users (id, login_id, password, name, role, restaurant_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [adminId, adminLoginId, adminPassword, adminName, 'admin', id]
    );

    // 2. Create the Restaurant linked to that admin
    await db.query(
      'INSERT INTO restaurants (id, name, admin_id, image) VALUES ($1, $2, $3, $4)',
      [id, name, adminId, image]
    );

    await db.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
});

// Create new menu item
app.post('/api/menu', async (req, res) => {
  const { id, restaurantId, name, price, qty, image } = req.body;
  try {
    await db.query(
      'INSERT INTO menu_items (id, restaurant_id, name, price, qty, image) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, restaurantId, name, price, qty, image]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
});

// Handle React routing, return all requests to React app
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({ error: 'Server crashed' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
