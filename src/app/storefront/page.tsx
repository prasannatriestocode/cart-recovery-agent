import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/lib/current-merchant";
import { getLatestDeployedCodeFixForMerchant } from "@/repositories/code-fixes";

export const dynamic = "force-dynamic";

export default async function StorefrontPage() {
const merchant = await getCurrentMerchant();

  if (!merchant) {
    redirect("/sign-in");
  }

  const deployedFix = await getLatestDeployedCodeFixForMerchant(merchant.id);

  const hasFreeShippingBanner =
    deployedFix?.fix_type === "banner" && deployedFix.deployed;

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-950">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between border-b border-slate-300 pb-6">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Demo Storefront
            </p>
            <h1 className="text-3xl font-bold">Acme Outdoor Supply</h1>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Back to Agent
          </Link>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-[1fr_360px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Your cart</h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="font-medium">Trail Running Backpack</p>
                  <p className="text-sm text-slate-500">Qty 1</p>
                </div>
                <p className="font-semibold">$62.00</p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="font-medium">Hydration Bottle</p>
                  <p className="text-sm text-slate-500">Qty 1</p>
                </div>
                <p className="font-semibold">$0.00</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                Shipping is calculated at checkout.
              </p>
            </div>
          </div>

          <aside className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Order summary</h2>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>$62.00</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated shipping</span>
                <span>$13.00</span>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>$75.00</span>
                </div>
              </div>
            </div>

            {hasFreeShippingBanner ? (
              <div
                aria-label="Free shipping progress"
                className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-4"
              >
                <p className="font-medium text-emerald-900">
                  You are $13.00 away from free shipping.
                </p>
                <div className="mt-3 h-2 rounded-full bg-emerald-100">
                  <div className="h-2 w-4/5 rounded-full bg-emerald-500" />
                </div>
                <p className="mt-2 text-xs text-emerald-800">
                  Codex-generated fix deployed from Cart Recovery Agent.
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4">
                <p className="font-medium text-amber-900">
                  No recovery fix deployed yet.
                </p>
                <p className="mt-2 text-sm text-amber-800">
                  Shoppers currently discover shipping cost late in checkout.
                </p>
              </div>
            )}

            <button className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800">
              Continue to checkout
            </button>
          </aside>
        </section>

        {deployedFix ? (
          <section className="mt-8 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Active deployed fix
            </p>
            <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
              <div>
                <p className="text-slate-500">Component</p>
                <p className="font-semibold">{deployedFix.component_name}</p>
              </div>
              <div>
                <p className="text-slate-500">Mode</p>
                <p className="font-semibold">{deployedFix.generation_mode}</p>
              </div>
              <div>
                <p className="text-slate-500">Model</p>
                <p className="font-semibold">
                  {deployedFix.model_name ?? "not recorded"}
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}