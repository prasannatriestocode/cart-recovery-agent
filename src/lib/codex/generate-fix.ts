import { Codex } from "@openai/codex-sdk";
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

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Codex did not return JSON.");
  }

  return text.slice(start, end + 1);
}

export async function generateFixWithCodex(input: {
  rootCauses: unknown;
  dropOffMetrics: unknown;
}): Promise<GeneratedFixResult> {
  const prompt = buildFixPrompt(input);

  if (process.env.CODEX_MOCK?.toLowerCase() === "true") {
    console.log("CODEX_MOCK=true, returning mock fix.");
    console.log("Prompt preview:", prompt.slice(0, 500));
    return getMockFix();
  }

  const codex = new Codex();
  const thread = codex.startThread();

  const result = await thread.run(prompt);

  const rawText =
    typeof result === "string"
      ? result
      : "final_response" in result
        ? String(result.final_response)
        : JSON.stringify(result);

  const parsed = JSON.parse(extractJson(rawText));

  return {
    fixType: String(parsed.fixType),
    componentName: String(parsed.componentName),
    componentCode: String(parsed.componentCode),
    testCode: String(parsed.testCode),
    explanation: String(parsed.explanation),
    deploymentNotes: String(parsed.deploymentNotes),
  };
}