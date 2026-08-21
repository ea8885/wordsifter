export type ProductTier = "retail" | "beta";
export type LicenseStatus = "active" | "redeemed" | "expired" | "revoked";
export type EntitlementStatus = "active" | "expired" | "revoked";

export type License = {
  id: string;
  keyHash: string;
  tier: ProductTier;
  status: LicenseStatus;
  redeemedBy: string | null;
  redeemedAt: Date | null;
  expiresAt: Date | null;
};

export type Entitlement = {
  licenseId: string;
  userId: string;
  tier: ProductTier;
  status: EntitlementStatus;
  expiresAt: Date | null;
};

export type ActivationPayload = {
  userId: string;
  tier: ProductTier;
  deviceHash: string;
  tokenId: string;
  issuedAt: string;
  expiresAt: string;
};

export type RedeemLicenseInput = {
  userId: string;
  licenseKey: string;
  now: Date;
};

export type PersistRedemptionInput = {
  userId: string;
  keyHash: string;
  redeemedAt: Date;
  entitlement: Entitlement;
};

export type LicenseRepository = {
  findLicenseByHash(keyHash: string): Promise<License | null>;
  redeemLicense(input: PersistRedemptionInput): Promise<Entitlement>;
  startBeta(userId: string, now: Date): Promise<Entitlement>;
  findEntitlementByUserAndTier(
    userId: string,
    tier: ProductTier,
  ): Promise<Entitlement | null>;
  findEntitlementByLicenseId(licenseId: string): Promise<Entitlement | null>;
};
