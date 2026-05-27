import { currentUser } from "@clerk/nextjs/server";
import { upsertMerchant } from "@/repositories/merchants";

export async function getCurrentMerchant() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const email = user.emailAddresses[0]?.emailAddress ?? "unknown@example.com";
  return upsertMerchant(user.id, email);
}