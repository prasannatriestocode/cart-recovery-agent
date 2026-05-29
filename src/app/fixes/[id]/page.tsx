import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/lib/current-merchant";
import { deployCodeFix, getCodeFix } from "@/repositories/code-fixes";

export default async function FixPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const merchant = await getCurrentMerchant();

  if (!merchant) {
    redirect("/sign-in");
  }
  
  const merchantId = merchant.id;
  const { id } = await params;
  const fix = await getCodeFix(id, merchant.id);

  if (!fix) {
    redirect("/dashboard");
  }

  async function deployAction() {
  "use server";

  const deployedFix = await deployCodeFix(id, merchantId);

  if (!deployedFix) {
    throw new Error("Deploy failed: code fix was not found for this merchant.");
  }

  redirect(`/fixes/${id}`);
}

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header>
          <p className="text-sm text-slate-400">Codex-generated fix</p>
          <h1 className="text-3xl font-bold">{fix.component_name}</h1>
          <p className="mt-2 max-w-3xl text-slate-300">{fix.explanation}</p>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold">Generated component</h2>
            <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-300">
              {fix.component_code}
            </pre>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold">Generated test</h2>
            <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-300">
              {fix.test_code}
            </pre>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Live preview</h2>

          <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950 p-6">
            <div
              aria-label="Free shipping progress"
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4"
            >
              <p className="font-medium text-emerald-200">
                You are $13.00 away from free shipping.
              </p>
              <div className="mt-3 h-2 rounded-full bg-slate-700">
                <div className="h-2 w-4/5 rounded-full bg-emerald-400" />
              </div>
            </div>
          </div>

          <p className="mt-4 text-slate-300">{fix.deployment_notes}</p>

          <form action={deployAction} className="mt-6">
            
            {fix.deployed ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-emerald-200">
                  Deployed to demo store
                </div>

                <Link
                  href="/storefront"
                  className="inline-flex rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-300"
                >
                  View Demo Storefront
                </Link>
              </div>
            ) : (
              <button
                type="submit"
                className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200"
              >
                Deploy to Demo Store
              </button>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}