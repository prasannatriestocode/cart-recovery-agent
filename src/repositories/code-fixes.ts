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

export async function getCodeFix(id: string) {
  const rows = await query<CodeFix>(
    `
    SELECT *
    FROM code_fixes
    WHERE id = $1
    LIMIT 1
    `,
    [id],
  );

  return rows[0] ?? null;
}

export async function deployCodeFix(id: string) {
  const rows = await query<CodeFix>(
    `
    UPDATE code_fixes
    SET
      deployed = true,
      deployed_at = now(),
      status = 'deployed'
    WHERE id = $1
    RETURNING *
    `,
    [id],
  );

  return rows[0] ?? null;
}

export async function getLatestDeployedCodeFix() {
  const rows = await query<CodeFix>(
    `
    SELECT *
    FROM code_fixes
    WHERE deployed = true
    ORDER BY deployed_at DESC
    LIMIT 1
    `,
  );

  return rows[0] ?? null;
}