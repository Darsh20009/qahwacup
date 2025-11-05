import pg from 'pg';

const { Pool } = pg;

async function setupDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.log('No DATABASE_URL found, skipping external database setup');
    return;
  }

  console.log('Setting up database for external deployment...');
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: false,
    options: '-c search_path=public',
  });

  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
    
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
