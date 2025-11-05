import pg from 'pg';

const { Pool } = pg;

async function setupDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.log('No DATABASE_URL found, skipping external database setup');
    return;
  }

  console.log('Checking database connection...');
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('render.com') ? { rejectUnauthorized: false } : false,
  });

  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
