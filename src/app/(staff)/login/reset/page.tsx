import type { Metadata } from "next";
import { payload } from "@/lib/cms/payload";
import { LoginShell } from "../Shell";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = {
  title: "Set your password · UB Office",
  robots: { index: false },
  referrer: "no-referrer",
};
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

/** Choose a password from an emailed link: a forgotten password or an invitation. */
export default async function ResetPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const token = sp.token ?? "";
  const invite = sp.invite === "1";
  const owner = token
    ? ((await (
        await payload()
      ).db.findOne({
        collection: "users",
        where: {
          resetPasswordToken: { equals: token },
          resetPasswordExpiration: { greater_than: new Date().toISOString() },
        },
      })) as { email: string; name?: string } | null)
    : null;
  return (
    <LoginShell>
      <ResetForm
        token={token}
        invite={invite}
        account={owner ? { email: owner.email, name: owner.name ?? "" } : null}
      />
    </LoginShell>
  );
}
