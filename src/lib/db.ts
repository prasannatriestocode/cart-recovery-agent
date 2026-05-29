import { Pool } from "pg";

const globalForPg = globalThis as unknown as {
  pgPool?: Pool;
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Check .env.local or deployment env vars.");
}

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export async function query<T = unknown>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}