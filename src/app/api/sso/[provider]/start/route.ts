import { NextResponse, type NextRequest } from "next/server";
import { beginSignIn, provider } from "@/lib/auth/sso";
import { rateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const p = provider((await params).provider);
  if (!p) return NextResponse.json({ error: "Unknown or disabled provider" }, { status: 404 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!(await rateLimit("sso-start", ip, { limit: 20, windowSec: 600 })).success) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }
  const { url, cookie } = await beginSignIn(p);
  const res = NextResponse.redirect(url);
  res.cookies.set(`ub-sso-${p.id}`, cookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/api/sso/${p.id}`,
    maxAge: 600,
  });
  return res;
}
