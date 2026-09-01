const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL Connection Configuration (loaded from environment variables)
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'cloudakash',
  database: process.env.DB_NAME || 'postgres',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000, // Quick timeout to prevent long hanging requests
};

// Enable SSL if connecting to AWS RDS directly
if (process.env.DB_HOST && process.env.DB_HOST.includes('rds.amazonaws.com')) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.warn('PostgreSQL pool connection notice:', err.message);
});

// Helper for executing parameterized SQL queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log('Executed query', { text: text.substring(0, 80), duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  query,
};
