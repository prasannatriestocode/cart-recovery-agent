import { Codex } from "@openai/codex-sdk";
import { buildFixPrompt } from "./build-fix-prompt";
import { getMockFix } from "./mock-fix";

export type GeneratedFixResult = {
  fixType: string;
  generationMode: "fast" | "deep";
  modelName: string;
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
  mode?: "fast" | "deep";
}): Promise<GeneratedFixResult> {
  const prompt = buildFixPrompt(input);

  const generationMode = input.mode === "deep" ? "deep" : "fast";

  const modelName =
    generationMode === "deep"
      ? process.env.CODEX_DEEP_MODEL ?? "gpt-5.3-codex"
      : process.env.CODEX_FAST_MODEL ?? "gpt-5.2-codex";

  console.log(`Using Codex generation mode: ${generationMode}`);
  console.log(`Selected model: ${modelName}`);

  if (process.env.CODEX_MOCK?.toLowerCase() === "true") {
    console.log("CODEX_MOCK=true, returning mock fix.");
    //console.log("Prompt preview:", prompt.slice(0, 500));

    const mockFix = getMockFix();

    return {
      ...mockFix,
      generationMode,
      modelName,
    };
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
    generationMode,
    modelName,
    componentName: String(parsed.componentName),
    componentCode: String(parsed.componentCode),
    testCode: String(parsed.testCode),
    explanation: String(parsed.explanation),
    deploymentNotes: String(parsed.deploymentNotes),
  };
}