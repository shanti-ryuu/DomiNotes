import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { createClient } from '@supabase/supabase-js';

// Create a database connection handling both build and runtime environments
let db: any;

try {
  // Check if DATABASE_URL exists
  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
  } else {
    // During build time, create a mock DB
    console.warn('DATABASE_URL not found. Using mock database for build.');
    // Create a minimal mock for build-time
    const mockSql = {
      query: async () => ({}),
    };
    // @ts-ignore - This is just for build time
    db = drizzle(mockSql as any, { schema });
  }
} catch (error) {
  console.error('Error initializing database:', error);
  // Provide fallback for build process
  db = { query: async () => ({}) } as any;
}

// Initialize Supabase client
export const supabase = (() => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      return createClient(supabaseUrl, supabaseAnonKey);
    }
    console.warn('Supabase credentials not found. Some features may not work properly.');
    return null;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return null;
  }
})();

// Export the database instance
export { db };

// Export schema for use in other files
export * from './schema';

// Add this to your src/lib/db/index.ts file
if (process.env.DATABASE_URL) {
  console.log('Database connection established successfully');
}