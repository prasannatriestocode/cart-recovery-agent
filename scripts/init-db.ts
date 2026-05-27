import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

dotenv.config({ path: ".env.local" });

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Check your .env.local file.");
  }

  console.log("Using database host:", new URL(process.env.DATABASE_URL).host);

  const { pool } = await import("../src/lib/db");

  const schemaPath = path.join(process.cwd(), "src/lib/schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  await pool.query(schema);
  await pool.end();

  console.log("Database initialized");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});