const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://funda_lde6_user:0KmifglcPuIfMOuX6gQvrDS3ONST95La@dpg-d6s7k0sr85hc73eo6g8g-a.oregon-postgres.render.com/funda_lde6',
  ssl: {
    rejectUnauthorized: false
  }
});

// Add error handler to prevent crashing on idle connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
