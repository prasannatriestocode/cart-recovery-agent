import type { DropOffMetrics } from "./cart-analyzer";

export type RootCause = {
  primaryCause:
    | "shipping_cost_shock"
    | "payment_method_gap"
    | "checkout_friction";
  confidence: "low" | "medium" | "high";
  recommendation: string;
};

export function diagnose(metrics: DropOffMetrics): RootCause {
  if (
    metrics.biggestDropOffStep === "shipping" &&
    metrics.averageShippingCostAtDropOff >= 10
  ) {
    return {
      primaryCause: "shipping_cost_shock",
      confidence: "high",
      recommendation: "Add a free-shipping threshold banner before checkout.",
    };
  }

  if (metrics.biggestDropOffStep === "payment") {
    return {
      primaryCause: "payment_method_gap",
      confidence: "medium",
      recommendation:
        "Promote express checkout and alternative payment methods.",
    };
  }

  return {
    primaryCause: "checkout_friction",
    confidence: "medium",
    recommendation: "Reduce form fields and clarify checkout progress.",
  };
}