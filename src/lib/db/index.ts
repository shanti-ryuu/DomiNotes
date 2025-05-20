import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Use environment variable for the database connection string
// For local development, you would set this in .env.local
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export schema for use in other files
export * from './schema';
