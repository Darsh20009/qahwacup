import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const { Client } = pg;

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    
    console.log('🔧 Setting search_path to public...');
    await client.query('SET search_path TO public;');
    
    const migrationPath = path.join(process.cwd(), 'migrations', '0000_no_schema.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    
    const statements = migrationSql
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        try {
          console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);
          const fullStatement = `SET search_path TO public; ${statement}`;
          await client.query(fullStatement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error: any) {
          if (error.code === '42P07') {
            console.log(`⏭️  Table already exists, skipping...`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          }
        }
      }
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

runMigration();