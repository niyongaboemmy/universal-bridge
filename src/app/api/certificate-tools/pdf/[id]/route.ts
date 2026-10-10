import { NextResponse, type NextRequest } from "next/server";
import { payload } from "@/lib/cms/payload";
import { certificatePdf } from "@/lib/certificates/pdf";
import { audit } from "@/lib/audit";
import { createLocalReq } from "payload";
import { staffUser } from "@/lib/staff-auth";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

// FR-CERT-04: academy staff download a print-ready PDF.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await staffUser(request.headers, "academy");
  if (!user) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  const p = await payload();
  const cert = await p
    .findByID({ collection: "certificates", id: Number(id), overrideAccess: true })
    .catch(() => null);
  if (!cert) return NextResponse.json({ error: "not found" }, { status: 404 });
  const pdf = await certificatePdf(cert, siteUrl());
  await audit(await createLocalReq({ user }, p), {
    action: "download-pdf",
    entity: "certificates",
    entityId: cert.id,
  });
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${cert.code}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
