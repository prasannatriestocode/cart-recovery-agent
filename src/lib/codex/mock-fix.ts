export function getMockFix() {
  return {
    fixType: "banner",
    componentName: "FreeShippingThresholdBanner",
    explanation:
      "The largest drop-off happens at the shipping step, where shoppers see added shipping cost. This banner moves the free-shipping incentive earlier in the journey.",
    componentCode: `type FreeShippingThresholdBannerProps = {
  cartTotal: number;
  freeShippingThreshold: number;
};

export function FreeShippingThresholdBanner({
  cartTotal,
  freeShippingThreshold,
}: FreeShippingThresholdBannerProps) {
  const remaining = Math.max(freeShippingThreshold - cartTotal, 0);
  const qualifies = remaining === 0;

  return (
    <section
      aria-label="Free shipping progress"
      className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4"
    >
      {qualifies ? (
        <p className="font-medium text-emerald-200">
          You qualify for free shipping.
        </p>
      ) : (
        <p className="font-medium text-emerald-200">
          You are \${remaining.toFixed(2)} away from free shipping.
        </p>
      )}
      <div className="mt-3 h-2 rounded-full bg-slate-700">
        <div
          className="h-2 rounded-full bg-emerald-400"
          style={{
            width: \`\${Math.min(
              (cartTotal / freeShippingThreshold) * 100,
              100,
            )}%\`,
          }}
        />
      </div>
    </section>
  );
}`,
    testCode: `import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FreeShippingThresholdBanner } from "./FreeShippingThresholdBanner";

describe("FreeShippingThresholdBanner", () => {
  it("shows remaining amount when cart is below threshold", () => {
    render(
      <FreeShippingThresholdBanner cartTotal={50} freeShippingThreshold={75} />,
    );

    expect(screen.getByText(/25.00 away from free shipping/i)).toBeInTheDocument();
  });

  it("shows success state when cart qualifies", () => {
    render(
      <FreeShippingThresholdBanner cartTotal={80} freeShippingThreshold={75} />,
    );

    expect(screen.getByText(/qualify for free shipping/i)).toBeInTheDocument();
  });
});`,
    deploymentNotes:
      "Place this component above the checkout button on the cart page. Run it as an A/B test for shoppers before they reach the shipping step.",
  };
}