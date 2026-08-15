import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { config } from '../config.js';
import * as schema from './schema.js';

export const poolConnection = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.username,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(poolConnection, { schema, mode: 'default' });
