import { describe, expect, it } from "vitest";
import { buildFixPrompt } from "@/lib/codex/build-fix-prompt";

describe("buildFixPrompt", () => {
  it("includes diagnosis context, output schema, and test-generation instruction", () => {
    const prompt = buildFixPrompt({
      rootCauses: {
        primaryCause: "shipping_cost_shock",
        confidence: "high",
      },
      dropOffMetrics: {
        biggestDropOffStep: "shipping",
        shippingToPaymentRate: 0.5,
      },
    });

    expect(prompt).toContain("shipping_cost_shock");
    expect(prompt).toContain("biggestDropOffStep");
    expect(prompt).toContain("Vitest + React Testing Library test");
    expect(prompt).toContain('"componentCode"');
    expect(prompt).toContain('"testCode"');
    expect(prompt).toContain("Return strict JSON only");
  });
});