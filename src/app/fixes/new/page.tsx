import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/lib/current-merchant";
import { getDiagnostic } from "@/repositories/diagnostics";
import { createCodeFix } from "@/repositories/code-fixes";
import { generateFixWithCodex } from "@/lib/codex/generate-fix";

export default async function NewFixPage({
  searchParams,
}: {
  searchParams: Promise<{ diagnosticId?: string }>;
}) {
  const merchant = await getCurrentMerchant();

  if (!merchant) {
    redirect("/sign-in");
  }

  const { diagnosticId } = await searchParams;

  if (!diagnosticId) {
    redirect("/dashboard");
  }

  const diagnostic = await getDiagnostic(diagnosticId, merchant.id);

  if (!diagnostic) {
    redirect("/dashboard");
  }

const generatedFix = await generateFixWithCodex({
  rootCauses: diagnostic.root_causes,
  dropOffMetrics: diagnostic.drop_off_metrics,
});

const codeFix = await createCodeFix({
  diagnosticId: diagnostic.id,
  fixType: generatedFix.fixType,
  componentName: generatedFix.componentName,
  componentCode: generatedFix.componentCode,
  testCode: generatedFix.testCode,
  explanation: generatedFix.explanation,
  deploymentNotes: generatedFix.deploymentNotes,
});

  redirect(`/fixes/${codeFix.id}`);
}