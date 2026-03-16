const db = require('./db.cjs');

const initDB = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        login_id VARCHAR(50) UNIQUE,
        password VARCHAR(100),
        name VARCHAR(100),
        role VARCHAR(20),
        restaurant_id VARCHAR(50)
      );

      CREATE TABLE IF NOT EXISTS restaurants (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100),
        admin_id VARCHAR(50),
        image TEXT
      );

      CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR(50) PRIMARY KEY,
        restaurant_id VARCHAR(50),
        name VARCHAR(100),
        price NUMERIC(10, 2),
        qty INT,
        image TEXT
      );

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        customer_id VARCHAR(50),
        restaurant_id VARCHAR(50),
        status VARCHAR(20),
        total NUMERIC(10, 2),
        created_at BIGINT
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50),
        menu_item_id VARCHAR(50),
        name VARCHAR(100),
        price NUMERIC(10, 2),
        qty INT
      );
    `);

    // Only seed if empty
    const res = await db.query('SELECT COUNT(*) FROM users');
    if (parseInt(res.rows[0].count) === 0) {
      console.log('Seeding initial data...');
      
      // Seed Users
      const users = [
        ['1', 'alice', 'password', 'Alice (Customer)', 'customer', null],
        ['2', 'bob_admin', 'password', 'Bob (Admin - Burger King)', 'admin', 'r1'],
        ['3', 'charlie_admin', 'password', 'Charlie (Admin - Pizza Hut)', 'admin', 'r2'],
        ['super1', 'superadmin', 'password', 'Boss User (Super Admin)', 'super_admin', null]
      ];
      for (const u of users) {
        await db.query('INSERT INTO users(id, login_id, password, name, role, restaurant_id) VALUES($1, $2, $3, $4, $5, $6)', u);
      }

      // Seed Restaurants
      const rests = [
        ['r1', 'Burger King', '2', 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&q=80&w=800'],
        ['r2', 'Pizza Hut', '3', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800']
      ];
      for (const r of rests) {
        await db.query('INSERT INTO restaurants(id, name, admin_id, image) VALUES($1, $2, $3, $4)', r);
      }

      // Seed Menu Items
      const menus = [
        ['m1', 'r1', 'Whopper', 5.99, 10, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400'],
        ['m2', 'r1', 'Fries', 2.49, 50, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=400'],
        ['m3', 'r2', 'Pepperoni Pizza', 12.99, 5, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=400']
      ];
      for (const m of menus) {
        await db.query('INSERT INTO menu_items(id, restaurant_id, name, price, qty, image) VALUES($1, $2, $3, $4, $5, $6)', m);
      }

      console.log('Seeding complete!');
    } else {
      console.log('Database already initialized with data.');
    }
  } catch (err) {
    console.error('Error initializing db:', err);
  }
};

initDB();
