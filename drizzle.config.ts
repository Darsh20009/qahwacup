import { defineConfig } from "drizzle-kit";

// Prefer Replit's internal database over external DATABASE_URL
const useReplitDB = process.env.PGHOST && process.env.PGDATABASE;

if (!useReplitDB && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL or Replit database, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: useReplitDB ? {
    host: process.env.PGHOST!,
    port: parseInt(process.env.PGPORT || "5432"),
    user: process.env.PGUSER!,
    password: process.env.PGPASSWORD!,
    database: process.env.PGDATABASE!,
    ssl: false,
  } : {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ["public"],
});
