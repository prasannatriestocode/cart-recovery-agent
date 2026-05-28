import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const { pool } = await import("../../src/lib/db");

  await pool.query(`
    ALTER TABLE code_fixes
    ADD COLUMN IF NOT EXISTS generation_mode STRING NOT NULL DEFAULT 'fast'
  `);

  await pool.query(`
    ALTER TABLE code_fixes
    ADD COLUMN IF NOT EXISTS model_name STRING
  `);

  await pool.end();

  console.log("Added generation_mode and model_name to code_fixes");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});