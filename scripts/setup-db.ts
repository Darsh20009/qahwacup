import pg from 'pg';

const { Pool } = pg;

async function setupDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.log('No DATABASE_URL found, skipping external database setup');
    return;
  }

  console.log('Setting up database schema...');
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('render.com') ? { rejectUnauthorized: false } : false,
  });

  try {
    await pool.query('CREATE SCHEMA IF NOT EXISTS public');
    console.log('✅ Database schema "public" is ready');
    
    await pool.query('GRANT ALL ON SCHEMA public TO PUBLIC');
    console.log('✅ Permissions granted');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
