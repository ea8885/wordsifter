import { getSupabaseServerClient } from "../../../lib/auth/supabase-server";
import {
  createConfiguredLicenseRepository,
  hasLicenseStorageConfig,
} from "../../../lib/licensing/repository";
import { BETA_DURATION_DAYS } from "../../../lib/licensing/beta";
import { signActivationPayload } from "../../../lib/licensing/crypto";
import { randomUUID } from "node:crypto";

export async function POST(): Promise<Response> {
  try {
    const { client } = await getSupabaseServerClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return new Response("Authentication required.", { status: 401 });
    if (!hasLicenseStorageConfig()) {
      return Response.json(
        { ok: false, error: "Beta access is not configured." },
        { status: 503 },
      );
    }

    const entitlement = await createConfiguredLicenseRepository().startBeta(
      user.id,
      new Date(),
    );
    if (!entitlement.expiresAt || entitlement.expiresAt <= new Date()) {
      return Response.json(
        { ok: false, status: "expired", error: "Your beta access has expired." },
        { status: 410 },
      );
    }
    const issuedAt = new Date();
    const activationToken = signActivationPayload({
      userId: user.id,
      tier: entitlement.tier,
      deviceHash: "website-beta",
      tokenId: randomUUID(),
      issuedAt: issuedAt.toISOString(),
      expiresAt: entitlement.expiresAt?.toISOString() ?? issuedAt.toISOString(),
    });
    return Response.json({
      ok: true,
      tier: entitlement.tier,
      status: entitlement.status,
      expiresAt: entitlement.expiresAt,
      durationDays: BETA_DURATION_DAYS,
      activationToken,
    });
  } catch {
    return new Response("Beta access is unavailable right now.", {
      status: 503,
    });
  }
}

export async function GET(): Promise<Response> {
  try {
    const { client } = await getSupabaseServerClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return new Response("Authentication required.", { status: 401 });
    if (!hasLicenseStorageConfig()) {
      return Response.json({ status: "unavailable" }, { status: 503 });
    }

    const entitlement = await createConfiguredLicenseRepository().findEntitlementByUserAndTier(
      user.id,
      "beta",
    );
    if (!entitlement) return Response.json({ status: "available" });
    const expiresAt = entitlement.expiresAt;
    const expired = !expiresAt || expiresAt <= new Date();
    return Response.json({
      status: expired ? "expired" : entitlement.status,
      expiresAt,
      daysRemaining: !expiresAt || expired
        ? 0
        : Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86400000)),
    });
  } catch {
    return new Response("Beta status is unavailable right now.", { status: 503 });
  }
}