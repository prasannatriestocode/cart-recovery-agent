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

function assertGeneratedFix(value: unknown): Omit<
  GeneratedFixResult,
  "generationMode" | "modelName"
> {
  if (!value || typeof value !== "object") {
    throw new Error("Codex returned a non-object response.");
  }

  const parsed = value as Record<string, unknown>;

  const fixType = parsed.fixType;
  const componentName = parsed.componentName;
  const componentCode = parsed.componentCode;
  const testCode = parsed.testCode;
  const explanation = parsed.explanation;
  const deploymentNotes = parsed.deploymentNotes;

  if (typeof fixType !== "string" || fixType.trim().length === 0) {
    throw new Error("Codex response missing required field: fixType");
  }

  if (typeof componentName !== "string" || componentName.trim().length === 0) {
    throw new Error("Codex response missing required field: componentName");
  }

  if (typeof componentCode !== "string" || componentCode.trim().length === 0) {
    throw new Error("Codex response missing required field: componentCode");
  }

  if (typeof testCode !== "string" || testCode.trim().length === 0) {
    throw new Error("Codex response missing required field: testCode");
  }

  if (typeof explanation !== "string" || explanation.trim().length === 0) {
    throw new Error("Codex response missing required field: explanation");
  }

  if (
    typeof deploymentNotes !== "string" ||
    deploymentNotes.trim().length === 0
  ) {
    throw new Error("Codex response missing required field: deploymentNotes");
  }

  return {
    fixType,
    componentName,
    componentCode,
    testCode,
    explanation,
    deploymentNotes,
  };
}

function extractCodexText(result: unknown): string {
  if (typeof result === "string") {
    return result;
  }

  if (!result || typeof result !== "object") {
    throw new Error("Codex returned an empty response.");
  }

  const record = result as Record<string, unknown>;

  if (typeof record.final_response === "string") {
    return record.final_response;
  }

  if (typeof record.finalResponse === "string") {
    return record.finalResponse;
  }

  if (typeof record.output === "string") {
    return record.output;
  }

  if (typeof record.text === "string") {
    return record.text;
  }

  if (Array.isArray(record.items)) {
    const agentMessage = record.items.find((item) => {
      return (
        item &&
        typeof item === "object" &&
        (item as Record<string, unknown>).type === "agent_message" &&
        typeof (item as Record<string, unknown>).text === "string"
      );
    });

    if (agentMessage) {
      return String((agentMessage as Record<string, unknown>).text);
    }
  }

  throw new Error(
    `Could not extract text from Codex response. Top-level keys: ${Object.keys(
      record,
    ).join(", ")}`,
  );
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
    console.log("Prompt preview:", prompt.slice(0, 500));

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

const rawText = extractCodexText(result);

//console.log("Codex raw response preview:", rawText.slice(0, 2000));

const parsed = JSON.parse(extractJson(rawText));
const validated = assertGeneratedFix(parsed);

return {
  ...validated,
  generationMode,
  modelName,
};
}