import { NextResponse, type NextRequest } from "next/server";
import { commitTransaction, createLocalReq, initTransaction, killTransaction } from "payload";
import { audit } from "@/lib/audit";
import { parseCsv, validateCertRows } from "@/lib/certificates/csv";
import { payload } from "@/lib/cms/payload";
import { staffUser } from "@/lib/staff-auth";

export const dynamic = "force-dynamic";

/**
 * FR-CERT-04 bulk import. POST text/csv. `?dryRun=1` validates only.
 * All rows are created in one transaction — any failure creates none.
 */
export async function POST(request: NextRequest) {
  const user = await staffUser(request.headers, "content.academy");
  if (!user) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const text = (await request.text()).slice(0, 2_000_000);
  const { valid, errors } = validateCertRows(parseCsv(text));
  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";
  if (errors.length || dryRun)
    return NextResponse.json(
      { dryRun, ok: errors.length === 0, rows: valid.length, errors },
      { status: errors.length ? 422 : 200 },
    );

  const p = await payload();
  const req = await createLocalReq({ user }, p);
  await initTransaction(req);
  try {
    const codes: string[] = [];
    for (const row of valid) {
      const doc = await p.create({
        collection: "certificates",
        req,
        overrideAccess: false,
        user,
        data: {
          holderName: row.holderName,
          kind: row.kind as "internship" | "training",
          programTitle: row.programTitle,
          role: row.role || undefined,
          startDate: row.startDate,
          endDate: row.endDate,
          signatoryName: row.signatoryName,
          signatoryTitle: row.signatoryTitle,
          issuedAt: row.issuedAt || new Date().toISOString().slice(0, 10),
          status: "valid",
        },
      });
      codes.push(doc.code!);
    }
    await audit(req, {
      action: "bulk-import",
      entity: "certificates",
      meta: { count: codes.length },
    });
    await commitTransaction(req);
    return NextResponse.json({ ok: true, created: codes.length, codes });
  } catch (err) {
    await killTransaction(req);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Import failed" },
      { status: 500 },
    );
  }
}
