type BuildFixPromptInput = {
  rootCauses: unknown;
  dropOffMetrics: unknown;
};

export function buildFixPrompt(input: BuildFixPromptInput) {
  return `
You are Codex inside Cart Recovery Agent, an eCommerce engineering workflow app.

The app has already analyzed abandoned cart sessions using deterministic TypeScript.
Your job is to generate a small React + Tailwind code fix.

Root causes:
${JSON.stringify(input.rootCauses, null, 2)}

Drop-off metrics:
${JSON.stringify(input.dropOffMetrics, null, 2)}

Generate a fix for the merchant's storefront.

Constraints:
- Generate one React component only.
- Use TypeScript.
- Use Tailwind CSS.
- Do not import external UI libraries.
- Include accessible text.
- Include a Vitest + React Testing Library test.
- The most likely fix is a free-shipping threshold banner if the root cause is shipping_cost_shock.
- Return strict JSON only.

JSON shape:
{
  "fixType": "banner",
  "componentName": "FreeShippingThresholdBanner",
  "componentCode": "...",
  "testCode": "...",
  "explanation": "...",
  "deploymentNotes": "..."
}
`;
}