import { query } from "@/lib/db";

export type Diagnostic = {
  id: string;
  merchant_id: string;
  cart_sample: unknown;
  root_causes: unknown;
  drop_off_metrics: unknown;
  status: string;
  created_at: string;
};

export async function createDiagnostic(input: {
  merchantId: string;
  cartSample: unknown;
  rootCauses: unknown;
  dropOffMetrics: unknown;
}) {
  const rows = await query<Diagnostic>(
    `
    INSERT INTO diagnostics (
      merchant_id,
      cart_sample,
      root_causes,
      drop_off_metrics
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      input.merchantId,
      JSON.stringify(input.cartSample),
      JSON.stringify(input.rootCauses),
      JSON.stringify(input.dropOffMetrics),
    ],
  );

  return rows[0];
}

export async function getDiagnostic(id: string, merchantId: string) {
  const rows = await query<Diagnostic>(
    `
    SELECT *
    FROM diagnostics
    WHERE id = $1 AND merchant_id = $2
    LIMIT 1
    `,
    [id, merchantId],
  );

  return rows[0] ?? null;
}