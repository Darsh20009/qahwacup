import pg from 'pg';

const { Pool } = pg;

async function setupDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.log('No DATABASE_URL found, skipping external database setup');
    return;
  }

  console.log('Setting up database for external deployment...');
  
  const isFilessDB = DATABASE_URL.includes('filess.io');
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: isFilessDB ? false : undefined,
  });

  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
    
    await pool.query('CREATE SCHEMA IF NOT EXISTS public');
    console.log('✅ Public schema ensured');
    
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    console.log('✅ pgcrypto extension ensured (for gen_random_uuid)');
    
    await pool.query('ALTER DATABASE CURRENT SET search_path TO public');
    console.log('✅ search_path set to public');
    
    const searchPathResult = await pool.query('SHOW search_path');
    console.log('Current search_path:', searchPathResult.rows[0].search_path);
    
    console.log('✅ Database setup completed successfully');
    
  } catch (error: any) {
    console.error('Error setting up database:', error.message);
    console.log('⚠️  Continuing with build despite setup warning...');
  } finally {
    await pool.end();
  }
}

setupDatabase();
