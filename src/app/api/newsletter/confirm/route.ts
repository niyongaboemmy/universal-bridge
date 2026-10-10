import { NextResponse, type NextRequest } from "next/server";
import { localizePath, isLocale } from "@/i18n/routing";
import { payload } from "@/lib/cms/payload";

export const dynamic = "force-dynamic";

// Double opt-in confirmation: single-use token.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const p = await payload();
  const found =
    token.length > 20
      ? await p.find({
          collection: "subscribers",
          where: { token: { equals: token } },
          limit: 1,
          overrideAccess: true,
        })
      : null;
  const sub = found?.docs[0];
  if (!sub) return NextResponse.redirect(new URL("/newsletter/invalid", request.url), 303);
  await p.update({
    collection: "subscribers",
    id: sub.id,
    data: { confirmedAt: new Date().toISOString(), token: null },
    overrideAccess: true,
  });
  const locale = sub.locale && isLocale(sub.locale) ? sub.locale : "en";
  return NextResponse.redirect(
    new URL(localizePath("/newsletter/confirmed", locale), request.url),
    303,
  );
}
