import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/lib/current-merchant";
import { analyzeCartSessions } from "@/lib/cart-analyzer";
import type { CartSessionInput } from "@/lib/cart-analyzer";
import { diagnose } from "@/lib/diagnosis";
import { createCartSessions } from "@/repositories/cart-sessions";
import { createDiagnostic } from "@/repositories/diagnostics";

const sampleData = JSON.stringify(
  [
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
  ],
  null,
  2,
);

async function analyzeAction(formData: FormData) {
  "use server";

  const merchant = await getCurrentMerchant();

  if (!merchant) {
    redirect("/sign-in");
  }

  const raw = String(formData.get("cartSessions") ?? "[]");
  const sessions = JSON.parse(raw) as CartSessionInput[];

  await createCartSessions(merchant.id, sessions);

  const metrics = analyzeCartSessions(sessions);
  const rootCauses = diagnose(metrics);

  const diagnostic = await createDiagnostic({
    merchantId: merchant.id,
    cartSample: sessions,
    rootCauses,
    dropOffMetrics: metrics,
  });

  redirect(`/diagnostics/${diagnostic.id}`);
}

export default async function SessionsPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-sm text-slate-400">Cart Recovery Agent</p>
          <h1 className="text-3xl font-bold">Paste abandoned cart sessions</h1>
          <p className="mt-2 text-slate-300">
            Paste a JSON sample of cart sessions. The app will save the sessions,
            analyze drop-off, and create a diagnostic.
          </p>
        </header>

        <form action={analyzeAction} className="mt-8 space-y-4">
          <textarea
            name="cartSessions"
            defaultValue={sampleData}
            className="min-h-[420px] w-full rounded-2xl border border-slate-700 bg-slate-900 p-4 font-mono text-sm text-slate-100"
          />

          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200"
          >
            Analyze abandoned carts
          </button>
        </form>
      </div>
    </main>
  );
}