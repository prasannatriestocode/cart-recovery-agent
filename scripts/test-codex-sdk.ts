import dotenv from "dotenv";
import { Codex } from "@openai/codex-sdk";

dotenv.config({ path: ".env.local" });

async function main() {
  console.log("OPENAI_API_KEY loaded:", Boolean(process.env.OPENAI_API_KEY));

  const codex = new Codex();
  const thread = await codex.startThread();

  const result = await thread.run(
    'Return strict JSON only: {"ok": true, "message": "hello from codex"}',
  );

  console.log(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});