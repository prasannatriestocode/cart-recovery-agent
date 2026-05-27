import { query } from "@/lib/db";
import type { CartSessionInput } from "@/lib/cart-analyzer";

export async function createCartSessions(
  merchantId: string,
  sessions: CartSessionInput[],
) {
  const created = [];

  for (const session of sessions) {
    const rows = await query(
      `
      INSERT INTO cart_sessions (
        merchant_id,
        session_data,
        abandoned_at,
        recovered
      )
      VALUES (
        $1,
        $2,
        CASE WHEN $3 = false THEN now() ELSE NULL END,
        $3
      )
      RETURNING *
      `,
      [merchantId, JSON.stringify(session), session.completed],
    );

    created.push(rows[0]);
  }

  return created;
}