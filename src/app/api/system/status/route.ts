import { NextResponse } from "next/server";
import { freshSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/** Public, tiny: is the site in maintenance? (read by the proxy, cached 15 s there). */
export async function GET() {
  const { maintenance } = await freshSettings();
  return NextResponse.json(
    { maintenance: maintenance.on },
    { headers: { "cache-control": "no-store" } },
  );
}
