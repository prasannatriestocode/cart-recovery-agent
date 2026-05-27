import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { upsertMerchant } from "@/repositories/merchants";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const email = user.emailAddresses[0]?.emailAddress ?? "unknown@example.com";

  const merchant = await upsertMerchant(user.id, email);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Cart Recovery Agent</p>
            <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
          </div>
          <UserButton />
        </header>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">CockroachDB connected</h2>
          <p className="mt-2 text-slate-300">
            Merchant record synced for{" "}
            <span className="font-medium">{email}</span>.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Merchant ID: {merchant.id}
          </p>

          <Link
            href="/sessions"
            className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200"
          >
            Analyze abandoned carts
          </Link>
        </section>
      </div>
    </main>
  );
}