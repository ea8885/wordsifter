import { hashLicenseKey } from "./crypto";
import type {
  Entitlement,
  LicenseRepository,
  RedeemLicenseInput,
} from "./types";

const REDEMPTION_ERROR = "License key could not be redeemed.";

export async function redeemLicense(
  repository: LicenseRepository,
  input: RedeemLicenseInput,
): Promise<Entitlement> {
  let keyHash: string;
  try {
    keyHash = hashLicenseKey(input.licenseKey);
  } catch {
    throw new Error(REDEMPTION_ERROR);
  }

  const license = await repository.findLicenseByHash(keyHash);
  if (!license) throw new Error(REDEMPTION_ERROR);

  if (license.status === "redeemed" && license.redeemedBy === input.userId) {
    const existing = await repository.findEntitlementByLicenseId(license.id);
    if (existing) return existing;
  }

  if (
    license.status !== "active" ||
    (license.expiresAt && license.expiresAt <= input.now)
  ) {
    throw new Error(REDEMPTION_ERROR);
  }

  const entitlement: Entitlement = {
    licenseId: license.id,
    userId: input.userId,
    tier: license.tier,
    status: "active",
    expiresAt: license.expiresAt,
  };

  return repository.redeemLicense({
    userId: input.userId,
    keyHash,
    redeemedAt: input.now,
    entitlement,
  });
}
