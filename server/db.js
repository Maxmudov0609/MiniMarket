import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },

  max: 5,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});