import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentMerchant } from "@/lib/current-merchant";
import { getDiagnostic } from "@/repositories/diagnostics";

export default async function DiagnosticPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const merchant = await getCurrentMerchant();

  if (!merchant) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const diagnostic = await getDiagnostic(id, merchant.id);

  if (!diagnostic) {
    notFound();
  }

  const metrics = diagnostic.drop_off_metrics as Record<string, any>;
  const rootCauses = diagnostic.root_causes as Record<string, any>;

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-sm text-slate-400">Diagnostic</p>
          <h1 className="text-3xl font-bold">Abandoned cart diagnosis</h1>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Biggest drop-off</p>
            <p className="mt-2 text-2xl font-bold">
              {String(metrics.biggestDropOffStep)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Shipping → Payment</p>
            <p className="mt-2 text-2xl font-bold">
              {Math.round(Number(metrics.shippingToPaymentRate) * 100)}%
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Root cause</p>
            <p className="mt-2 text-2xl font-bold">
              {String(rootCauses.primaryCause)}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Recommendation</h2>
          <p className="mt-2 text-slate-300">
            {String(rootCauses.recommendation)}
          </p>

          <Link
            href={`/fixes/new?diagnosticId=${diagnostic.id}`}
            className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200"
          >
            Generate fix with Codex
          </Link>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Raw metrics</h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-300">
            {JSON.stringify(metrics, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}