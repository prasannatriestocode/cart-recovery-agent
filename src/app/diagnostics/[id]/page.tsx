import { notFound, redirect } from "next/navigation";
import { getCurrentMerchant } from "@/lib/current-merchant";
import { generateFixWithCodex } from "@/lib/codex/generate-fix";
import { getDiagnostic } from "@/repositories/diagnostics";
import {
  createCodeFix,
  getCodeFixForDiagnosticAndMode,
} from "@/repositories/code-fixes";

type MetricsView = {
  biggestDropOffStep?: string;
  shippingToPaymentRate?: number;
};

type RootCauseView = {
  primaryCause?: string;
  recommendation?: string;
};

async function generateFixAction(formData: FormData) {
  "use server";

  const merchant = await getCurrentMerchant();

  if (!merchant) {
    redirect("/sign-in");
  }

  const diagnosticId = String(formData.get("diagnosticId") ?? "");
  const modeValue = String(formData.get("mode") ?? "fast");
  const generationMode = modeValue === "deep" ? "deep" : "fast";

  const diagnostic = await getDiagnostic(diagnosticId, merchant.id);

  if (!diagnostic) {
    redirect("/dashboard");
  }

  const existingFix = await getCodeFixForDiagnosticAndMode(
    diagnostic.id,
    merchant.id,
    generationMode,
  );

  if (existingFix) {
    redirect(`/fixes/${existingFix.id}`);
  }

  const generatedFix = await generateFixWithCodex({
    rootCauses: diagnostic.root_causes,
    dropOffMetrics: diagnostic.drop_off_metrics,
    mode: generationMode,
  });

  const codeFix = await createCodeFix({
    diagnosticId: diagnostic.id,
    fixType: generatedFix.fixType,
    generationMode: generatedFix.generationMode,
    modelName: generatedFix.modelName,
    componentName: generatedFix.componentName,
    componentCode: generatedFix.componentCode,
    testCode: generatedFix.testCode,
    explanation: generatedFix.explanation,
    deploymentNotes: generatedFix.deploymentNotes,
  });

  redirect(`/fixes/${codeFix.id}`);
}

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

  const metrics = diagnostic.drop_off_metrics as MetricsView;
  const rootCauses = diagnostic.root_causes as RootCauseView;

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
              {String(metrics.biggestDropOffStep ?? "unknown")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Shipping → Payment</p>
            <p className="mt-2 text-2xl font-bold">
              {Math.round(Number(metrics.shippingToPaymentRate ?? 0) * 100)}%
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Root cause</p>
            <p className="mt-2 text-2xl font-bold">
              {String(rootCauses.primaryCause ?? "unknown")}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Recommendation</h2>
          <p className="mt-2 text-slate-300">
            {String(rootCauses.recommendation ?? "No recommendation available.")}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <form action={generateFixAction}>
              <input type="hidden" name="diagnosticId" value={diagnostic.id} />
              <input type="hidden" name="mode" value="fast" />
              <button
                type="submit"
                className="inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200"
              >
                Generate Fast Fix
              </button>
            </form>

            <form action={generateFixAction}>
              <input type="hidden" name="diagnosticId" value={diagnostic.id} />
              <input type="hidden" name="mode" value="deep" />
              <button
                type="submit"
                className="inline-flex rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Generate Deep Fix
              </button>
            </form>
          </div>
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