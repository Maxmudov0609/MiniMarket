import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Verify the database server certificate. Never bypass TLS certificate checks.
  ssl: { rejectUnauthorized: true },

  max: 5,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});