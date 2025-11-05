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
    ssl: DATABASE_URL.includes('filess.io') || DATABASE_URL.includes('render.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Check current search_path
    const searchPathResult = await pool.query('SHOW search_path');
    console.log('Current search_path:', searchPathResult.rows[0].search_path);
    
    // Set default search_path for the current database
    // Extract database name from URL
    const dbMatch = DATABASE_URL.match(/\/([^/?]+)(?:\?|$)/);
    const dbName = dbMatch ? dbMatch[1] : null;
    
    if (dbName) {
      console.log(`Setting search_path for database: ${dbName}`);
      await pool.query(`ALTER DATABASE "${dbName}" SET search_path = public`);
      console.log('✅ Default search_path set to public');
    } else {
      console.log('⚠️  Could not extract database name, setting search_path for current session');
      await pool.query('SET search_path = public');
      console.log('✅ Session search_path set to public');
    }
    
    // Verify search_path is set
    const verifyResult = await pool.query('SHOW search_path');
    console.log('Updated search_path:', verifyResult.rows[0].search_path);
    
  } catch (error: any) {
    console.error('Error setting up database:', error.message);
    // Don't exit with error - allow build to continue
    console.log('⚠️  Continuing with build despite setup warning...');
  } finally {
    await pool.end();
  }
}

setupDatabase();
