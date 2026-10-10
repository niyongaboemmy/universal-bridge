import "server-only";
import { connect } from "node:net";
import type { PayloadRequest } from "payload";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // FR-FORM-08

type Kind = { mimetype: string; ext: string };

/**
 * NFR-SEC-06: identify the file by its magic bytes, never by the browser's
 * claimed type or extension. PDF, DOC (OLE2) and DOCX (ZIP with word/).
 */
export function sniff(bytes: Uint8Array): Kind | null {
  const starts = (sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts([0x25, 0x50, 0x44, 0x46, 0x2d])) return { mimetype: "application/pdf", ext: "pdf" };
  if (starts([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))
    return { mimetype: "application/msword", ext: "doc" };
  if (starts([0x50, 0x4b, 0x03, 0x04])) {
    // A DOCX is a ZIP whose entries include "word/". Check the first 64 KB.
    const head = Buffer.from(bytes.subarray(0, 65536)).toString("latin1");
    if (head.includes("word/")) {
      return {
        mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ext: "docx",
      };
    }
  }
  return null;
}

export type UploadCheck =
  | { ok: true; data: Buffer; kind: Kind; name: string }
  | { ok: false; error: "fileType" | "fileSize" };

export async function checkUpload(file: File): Promise<UploadCheck> {
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "fileSize" };
  const data = Buffer.from(await file.arrayBuffer());
  const kind = sniff(data);
  if (!kind || data.length === 0) return { ok: false, error: "fileType" };
  const base =
    (file.name || "upload")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .slice(0, 60) || "upload";
  return { ok: true, data, kind, name: `${base}.${kind.ext}` };
}

/** Thrown when storage rejects a file (e.g. a malformed PDF); shown on that field. */
export class UploadRejected extends Error {
  constructor(public field: string) {
    super(`Upload rejected for ${field}`);
  }
}

/** Store a checked file privately and queue its virus scan (ADR-004). */
export async function storePrivateFile(
  req: PayloadRequest,
  upload: Extract<UploadCheck, { ok: true }>,
  field = "file",
  applicationType?: string,
) {
  let doc;
  try {
    doc = await req.payload.create({
      collection: "private-files",
      overrideAccess: true,
      req,
      data: { scanStatus: "pending", applicationType } as never,
      file: {
        data: upload.data,
        mimetype: upload.kind.mimetype,
        name: upload.name,
        size: upload.data.length,
      },
    });
  } catch (err) {
    // Payload validates file structure (e.g. "Invalid PDF file.").
    if (err && typeof err === "object" && "name" in err && err.name === "ValidationError")
      throw new UploadRejected(field);
    throw err;
  }
  const { enqueue } = await import("@/lib/outbox");
  await enqueue(req, { kind: "scan-upload", payload: { fileId: doc.id } });
  return doc;
}

/**
 * clamd INSTREAM protocol: "zINSTREAM\0", chunks of <uint32 length><data>,
 * a zero-length chunk, then the reply "stream: OK" or "stream: <name> FOUND".
 */
export function clamScan(
  data: Buffer,
  hostPort: string,
  timeoutMs = 15_000,
): Promise<"clean" | "infected"> {
  const [host, port = "3310"] = hostPort.split(":");
  return new Promise((resolve, reject) => {
    const socket = connect({ host, port: Number(port) });
    const chunks: Buffer[] = [];
    socket.setTimeout(timeoutMs, () => socket.destroy(new Error("clamd timeout")));
    socket.on("connect", () => {
      socket.write("zINSTREAM\0");
      for (let i = 0; i < data.length; i += 64 * 1024) {
        const part = data.subarray(i, i + 64 * 1024);
        const size = Buffer.alloc(4);
        size.writeUInt32BE(part.length);
        socket.write(size);
        socket.write(part);
      }
      socket.end(Buffer.alloc(4));
    });
    socket.on("data", (c) => chunks.push(c));
    socket.on("error", reject);
    socket.on("close", () => {
      const reply = Buffer.concat(chunks).toString().replace(/\0/g, "").trim();
      if (reply.endsWith("OK")) resolve("clean");
      else if (reply.includes("FOUND")) resolve("infected");
      else reject(new Error(`clamd: ${reply || "no reply"}`));
    });
  });
}
