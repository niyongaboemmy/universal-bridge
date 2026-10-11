import { describe, expect, it } from "vitest";
import { isLockedAuth } from "@/lib/auth/payload-errors";
import { isFileRejection } from "@/lib/uploads";

// Production builds minify class names, so Payload errors are recognised by their data.

describe("Payload errors survive minification", () => {
  it("an invalid upload is a file rejection, whatever the class is called", () => {
    const minified = Object.assign(new Error("The following field is invalid: file"), {
      name: "o",
      status: 400,
      data: { errors: [{ message: "Invalid PDF file.", path: "file" }] },
    });
    expect(isFileRejection(minified)).toBe(true);
    expect(isFileRejection({ status: 400, data: { errors: [{ path: "email" }] } })).toBe(false);
    expect(isFileRejection({ status: 500 })).toBe(false);
    expect(isFileRejection(null)).toBe(false);
  });

  it("a locked account is recognised by Payload's message, not the class name", () => {
    const locked = Object.assign(
      new Error("This user is locked due to having too many failed login attempts."),
      { name: "o", status: 401 },
    );
    expect(isLockedAuth(locked)).toBe(true);
    expect(isLockedAuth({ name: "LockedAuth" })).toBe(true);
    const wrong = Object.assign(new Error("The email or password provided is incorrect."), {
      name: "o",
      status: 401,
    });
    expect(isLockedAuth(wrong)).toBe(false);
  });
});
