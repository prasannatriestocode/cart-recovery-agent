import { query } from "@/lib/db";

export type Merchant = {
  id: string;
  clerk_user_id: string;
  email: string;
  created_at: string;
};

export async function upsertMerchant(clerkUserId: string, email: string) {
  const rows = await query<Merchant>(
    `
    INSERT INTO merchants (clerk_user_id, email)
    VALUES ($1, $2)
    ON CONFLICT (clerk_user_id)
    DO UPDATE SET email = EXCLUDED.email
    RETURNING *
    `,
    [clerkUserId, email],
  );

  return rows[0];
}