import { describe, expect, it } from "vitest";
import { analyzeCartSessions } from "@/lib/cart-analyzer";

describe("analyzeCartSessions", () => {
  it("identifies shipping as the biggest drop-off step", () => {
    const metrics = analyzeCartSessions([
      {
        sessionId: "s1",
        steps: ["cart", "shipping"],
        cartTotal: 62,
        shippingCost: 14.99,
        completed: false,
      },
      {
        sessionId: "s2",
        steps: ["cart", "shipping"],
        cartTotal: 48,
        shippingCost: 12.99,
        completed: false,
      },
      {
        sessionId: "s3",
        steps: ["cart", "shipping", "payment"],
        cartTotal: 91,
        shippingCost: 0,
        completed: false,
      },
      {
        sessionId: "s4",
        steps: ["cart", "shipping", "payment", "complete"],
        cartTotal: 120,
        shippingCost: 0,
        completed: true,
      },
    ]);

    expect(metrics.biggestDropOffStep).toBe("shipping");
    expect(metrics.shippingToPaymentRate).toBe(0.5);
    expect(metrics.averageShippingCostAtDropOff).toBeCloseTo(13.99);
  });
});