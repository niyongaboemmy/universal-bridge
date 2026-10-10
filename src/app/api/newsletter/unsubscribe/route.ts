import { NextResponse, type NextRequest } from "next/server";
import { checkUnsubscribeToken } from "@/features/newsletter/tokens";
import { payload } from "@/lib/cms/payload";

export const dynamic = "force-dynamic";

// One-click unsubscribe (GET from email links, POST for List-Unsubscribe-Post).
async function handle(request: NextRequest) {
  const email = (request.nextUrl.searchParams.get("email") ?? "").toLowerCase();
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!email || !checkUnsubscribeToken(email, token))
    return NextResponse.redirect(new URL("/newsletter/invalid", request.url), 303);
  const p = await payload();
  const found = await p.find({
    collection: "subscribers",
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });
  if (found.docs[0])
    await p.update({
      collection: "subscribers",
      id: found.docs[0].id,
      data: { unsubscribedAt: new Date().toISOString() },
      overrideAccess: true,
    });
  return NextResponse.redirect(new URL("/newsletter/unsubscribed", request.url), 303);
}
export const GET = handle;
export const POST = handle;
