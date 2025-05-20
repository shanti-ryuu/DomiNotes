import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Create a mock or real database connection based on whether the environment variable exists
// This prevents build failures when DATABASE_URL is not available (like during Netlify build)
let db: ReturnType<typeof drizzle>;

try {
  // Check if DATABASE_URL exists
  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
  } else {
    // During build time, create a mock DB or defer connection
    console.warn('DATABASE_URL not found. Using mock database for build.');
    // Create a minimal mock for build-time
    const mockSql = {
      query: async () => ({}),
    };
    // @ts-ignore - This is just for build time
    db = drizzle(mockSql, { schema });
  }
} catch (error) {
  console.error('Error initializing database:', error);
  // Provide fallback for build process
  // @ts-ignore - This is just for build time
  db = { query: async () => ({}) } as any;
}

// Export the database instance
export { db };

// Export schema for use in other files
export * from './schema';
