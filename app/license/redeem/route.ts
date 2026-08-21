import { getSupabaseServerClient } from "../../../lib/auth/supabase-server";
import {
  createConfiguredLicenseRepository,
  hasLicenseStorageConfig,
} from "../../../lib/licensing/repository";
import { redeemLicense } from "../../../lib/licensing/service";

const genericError = () =>
  Response.json({ error: "License key could not be redeemed." }, { status: 400 });

export async function POST(request: Request): Promise<Response> {
  let userId: string;
  try {
    const { client } = await getSupabaseServerClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return new Response("Authentication required.", { status: 401 });
    userId = user.id;
  } catch {
    return new Response("Authentication is not configured.", { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return genericError();
  }

  const licenseKey =
    typeof body === "object" && body !== null && "licenseKey" in body
      ? body.licenseKey
      : null;
  if (typeof licenseKey !== "string") return genericError();

  try {
    if (!hasLicenseStorageConfig()) {
      return Response.json(
        {
          ok: false,
          configured: false,
          error: "License storage is not configured.",
        },
        { status: 503 },
      );
    }

    const entitlement = await redeemLicense(
      createConfiguredLicenseRepository(),
      { userId, licenseKey, now: new Date() },
    );
    return Response.json({
      ok: true,
      configured: true,
      entitlement: {
        tier: entitlement.tier,
        status: entitlement.status,
        expiresAt: entitlement.expiresAt,
      },
    });
  } catch {
    return genericError();
  }
}
