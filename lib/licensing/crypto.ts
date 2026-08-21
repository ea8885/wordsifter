import { createHash, createHmac } from "node:crypto";
import { getAppUrl } from "../auth/config";
import type { ActivationPayload } from "./types";

const LICENSE_PATTERN = /^WS[A-Z0-9]{8,32}$/;

export function normalizeLicenseKey(value: string): string {
  const normalized = value.replace(/[\s-]/g, "").toUpperCase();
  if (!LICENSE_PATTERN.test(normalized)) {
    throw new Error("License key could not be redeemed.");
  }
  return normalized;
}

export function hashLicenseKey(value: string): string {
  const normalized = normalizeLicenseKey(value);
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}

export function signActivationPayload(payload: ActivationPayload): string {
  const secret = process.env.LICENSE_TOKEN_SECRET;
  if (!secret) throw new Error("License activation is not configured.");

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signature = createHmac("sha256", secret)
    .update(`${getAppUrl().origin}.${encodedPayload}`)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyActivationToken(token: string): ActivationPayload {
  const secret = process.env.LICENSE_TOKEN_SECRET;
  if (!secret) throw new Error("License activation is not configured.");

  const [encodedPayload, encodedSignature] = String(token || "").split(".");
  if (!encodedPayload || !encodedSignature) throw new Error("Activation token is invalid.");
  const expected = createHmac("sha256", secret)
    .update(`${getAppUrl().origin}.${encodedPayload}`)
    .digest("base64url");
  if (expected.length !== encodedSignature.length) throw new Error("Activation token is invalid.");
  if (!Buffer.from(expected).equals(Buffer.from(encodedSignature))) throw new Error("Activation token is invalid.");

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as ActivationPayload;
  if (!payload.userId || !payload.tokenId || !payload.expiresAt) throw new Error("Activation payload is incomplete.");
  if (new Date(payload.expiresAt) <= new Date()) throw new Error("Activation token has expired.");
  return payload;
}
