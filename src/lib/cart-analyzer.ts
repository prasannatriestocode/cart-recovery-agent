export type CartSessionInput = {
  sessionId: string;
  steps: string[];
  cartTotal: number;
  shippingCost: number;
  completed: boolean;
};

export type DropOffMetrics = {
  totalSessions: number;
  reachedCart: number;
  reachedShipping: number;
  reachedPayment: number;
  completedCheckout: number;
  cartToShippingRate: number;
  shippingToPaymentRate: number;
  paymentToCompleteRate: number;
  biggestDropOffStep: "cart" | "shipping" | "payment";
  averageShippingCostAtDropOff: number;
};

export function analyzeCartSessions(
  sessions: CartSessionInput[],
): DropOffMetrics {
  const totalSessions = sessions.length;

  const reachedCart = sessions.filter((s) => s.steps.includes("cart")).length;
  const reachedShipping = sessions.filter((s) =>
    s.steps.includes("shipping"),
  ).length;
  const reachedPayment = sessions.filter((s) =>
    s.steps.includes("payment"),
  ).length;
  const completedCheckout = sessions.filter((s) =>
    s.steps.includes("complete"),
  ).length;

  const cartToShippingRate = safeRate(reachedShipping, reachedCart);
  const shippingToPaymentRate = safeRate(reachedPayment, reachedShipping);
  const paymentToCompleteRate = safeRate(completedCheckout, reachedPayment);

  const dropOffs = {
    cart: 1 - cartToShippingRate,
    shipping: 1 - shippingToPaymentRate,
    payment: 1 - paymentToCompleteRate,
  };

  const biggestDropOffStep = Object.entries(dropOffs).sort(
    (a, b) => b[1] - a[1],
  )[0][0] as DropOffMetrics["biggestDropOffStep"];

  const shippingDropOffSessions = sessions.filter(
    (s) => s.steps.includes("shipping") && !s.steps.includes("payment"),
  );

  const averageShippingCostAtDropOff =
    shippingDropOffSessions.length === 0
      ? 0
      : shippingDropOffSessions.reduce((sum, s) => sum + s.shippingCost, 0) /
        shippingDropOffSessions.length;

  return {
    totalSessions,
    reachedCart,
    reachedShipping,
    reachedPayment,
    completedCheckout,
    cartToShippingRate,
    shippingToPaymentRate,
    paymentToCompleteRate,
    biggestDropOffStep,
    averageShippingCostAtDropOff,
  };
}

function safeRate(numerator: number, denominator: number) {
  if (denominator === 0) return 0;
  return Number((numerator / denominator).toFixed(2));
}