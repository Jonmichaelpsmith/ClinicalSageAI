import knex from 'knex';
import 'dotenv/config';

// Create PostgreSQL connection
const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: { min: 0, max: 10 }
});

export default db;