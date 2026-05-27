import { buildFixPrompt } from "./build-fix-prompt";
import { getMockFix } from "./mock-fix";

export type GeneratedFixResult = {
  fixType: string;
  componentName: string;
  componentCode: string;
  testCode: string;
  explanation: string;
  deploymentNotes: string;
};

export async function generateFixWithCodex(input: {
  rootCauses: unknown;
  dropOffMetrics: unknown;
}): Promise<GeneratedFixResult> {
  const prompt = buildFixPrompt(input);

  if (process.env.CODEX_MOCK === "true") {
    console.log("CODEX_MOCK=true, returning mock fix.");
    console.log("Prompt preview:", prompt.slice(0, 500));
    return getMockFix();
  }

  throw new Error(
    "Real Codex SDK call is not implemented yet. Set CODEX_MOCK=true.",
  );
}