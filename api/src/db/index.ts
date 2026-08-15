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
  // All business timestamps are interpreted and returned in Vietnam time.
  timezone: '+07:00',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// TIMESTAMP columns are converted using the MySQL session timezone. Keeping
// this aligned with mysql2 prevents CSV wall-clock values from being treated
// as UTC by a database server whose system timezone is UTC.
poolConnection.on('connection', (connection) => {
  connection.query("SET time_zone = '+07:00'")
})

export const db = drizzle(poolConnection, { schema, mode: 'default' });
