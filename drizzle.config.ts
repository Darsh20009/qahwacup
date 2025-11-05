import { defineConfig } from "drizzle-kit";
import { parse } from "pg-connection-string";

const useReplitDB = process.env.PGHOST && process.env.PGDATABASE;

if (!useReplitDB && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL or Replit database, ensure the database is provisioned");
}

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
    const parsed = parse(process.env.DATABASE_URL!);
    
    return {
      host: parsed.host!,
      port: parseInt(parsed.port || "5432"),
      user: parsed.user!,
      password: parsed.password!,
      database: parsed.database!,
      ssl: false,
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
  migrations: {
    schema: "public",
  },
});
