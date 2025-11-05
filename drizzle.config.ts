import { defineConfig } from "drizzle-kit";

// Prefer Replit's internal database over external DATABASE_URL
const useReplitDB = process.env.PGHOST && process.env.PGDATABASE;

if (!useReplitDB && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL or Replit database, ensure the database is provisioned");
}

// For external databases (like Render), ensure we specify the schema
const getDbCredentials = () => {
  if (useReplitDB) {
    return {
      host: process.env.PGHOST!,
      port: parseInt(process.env.PGPORT || "5432"),
      user: process.env.PGUSER!,
      password: process.env.PGPASSWORD!,
      database: process.env.PGDATABASE!,
      ssl: false,
    };
  } else {
    // External database (e.g., Render)
    const url = process.env.DATABASE_URL!;
    // Add search_path for public schema if not already present
    const urlWithSchema = url.includes('options=') 
      ? url 
      : url + (url.includes('?') ? '&' : '?') + 'options=-c%20search_path%3Dpublic';
    
    return {
      url: urlWithSchema,
      ssl: true, // Most external databases require SSL
    };
  }
};

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: getDbCredentials(),
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});
