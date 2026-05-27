import { describe, expect, it } from "vitest";
import { diagnose } from "@/lib/diagnosis";
import type { DropOffMetrics } from "@/lib/cart-analyzer";

describe("diagnose", () => {
  it("maps shipping drop-off with high shipping cost to shipping_cost_shock", () => {
    const metrics: DropOffMetrics = {
      totalSessions: 4,
      reachedCart: 4,
      reachedShipping: 4,
      reachedPayment: 2,
      completedCheckout: 1,
      cartToShippingRate: 1,
      shippingToPaymentRate: 0.5,
      paymentToCompleteRate: 0.5,
      biggestDropOffStep: "shipping",
      averageShippingCostAtDropOff: 13.99,
    };

    const result = diagnose(metrics);

    expect(result.primaryCause).toBe("shipping_cost_shock");
    expect(result.confidence).toBe("high");
    expect(result.recommendation).toMatch(/free-shipping threshold banner/i);
  });
});