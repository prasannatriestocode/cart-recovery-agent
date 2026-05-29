import { query } from "@/lib/db";

export type CodeFix = {
  id: string;
  diagnostic_id: string;
  fix_type: string;
  generation_mode: string;
  model_name: string | null;
  component_name: string;
  component_code: string;
  test_code: string;
  explanation: string;
  deployment_notes: string | null;
  status: string;
  deployed: boolean;
  deployed_at: string | null;
  created_at: string;
};

export async function createCodeFix(input: {
  diagnosticId: string;
  fixType: string;
  generationMode: "fast" | "deep";
  modelName?: string;
  componentName: string;
  componentCode: string;
  testCode: string;
  explanation: string;
  deploymentNotes?: string;
}) {
  const rows = await query<CodeFix>(
    `
    INSERT INTO code_fixes (
      diagnostic_id,
      fix_type,
      generation_mode,
      model_name,
      component_name,
      component_code,
      test_code,
      explanation,
      deployment_notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
    `,
    [
      input.diagnosticId,
      input.fixType,
      input.generationMode,
      input.modelName ?? null,
      input.componentName,
      input.componentCode,
      input.testCode,
      input.explanation,
      input.deploymentNotes ?? null,
    ],
  );

  return rows[0];
}

export async function getCodeFix(id: string, merchantId: string) {
  const rows = await query<CodeFix>(
    `
    SELECT *
    FROM code_fixes cf
    JOIN diagnostics d ON d.id = cf.diagnostic_id
    WHERE cf.id = $1
    AND d.merchant_id = $2
    LIMIT 1
    `,
    [id, merchantId],
  );

  return rows[0] ?? null;
}

export async function deployCodeFix(id: string, merchantId: string) {
  const rows = await query<CodeFix>(
    `
    UPDATE code_fixes
    SET
      deployed = true,
      deployed_at = now(),
      status = 'deployed'
    WHERE id = $1
      AND EXISTS (
        SELECT 1
        FROM diagnostics
        WHERE diagnostics.id = code_fixes.diagnostic_id
          AND diagnostics.merchant_id = $2
      )
    RETURNING *
    `,
    [id, merchantId],
  );

  return rows[0] ?? null;
}

export async function getLatestDeployedCodeFixForMerchant(merchantId: string) {
  const rows = await query<CodeFix>(
    `
    SELECT cf.*
    FROM code_fixes cf
    JOIN diagnostics d ON d.id = cf.diagnostic_id
    WHERE cf.deployed = true
      AND d.merchant_id = $1
    ORDER BY cf.deployed_at DESC
    LIMIT 1
    `,
    [merchantId],
  );

  return rows[0] ?? null;
}

export async function getCodeFixForDiagnosticAndMode(
  diagnosticId: string,
  merchantId: string,
  generationMode: "fast" | "deep",
) {
  const rows = await query<CodeFix>(
    `
    SELECT cf.*
    FROM code_fixes cf
    JOIN diagnostics d ON d.id = cf.diagnostic_id
    WHERE cf.diagnostic_id = $1
      AND d.merchant_id = $2
      AND cf.generation_mode = $3
    ORDER BY cf.created_at DESC
    LIMIT 1
    `,
    [diagnosticId, merchantId, generationMode],
  );

  return rows[0] ?? null;
}