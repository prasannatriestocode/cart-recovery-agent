import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const { pool } = await import("../src/lib/db");

  await pool.query(`
    UPDATE code_fixes
    SET
      deployed = false,
      deployed_at = NULL,
      status = 'generated'
  `);

  await pool.end();

  console.log("Reset all demo deployments");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});