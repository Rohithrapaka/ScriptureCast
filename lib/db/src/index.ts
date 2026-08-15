import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: NodePgDatabase<typeof schema> | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  console.warn("[@workspace/db] DATABASE_URL is not set. Database operations will require DATABASE_URL.");
}

export { pool, db };
export function getDb(): NodePgDatabase<typeof schema> {
  if (!db) {
    throw new Error("DATABASE_URL is not configured. Provision PostgreSQL and set DATABASE_URL environment variable.");
  }
  return db;
}

export * from "./schema";
