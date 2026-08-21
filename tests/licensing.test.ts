import assert from "node:assert/strict";
import test from "node:test";
import {
  hashLicenseKey,
  normalizeLicenseKey,
} from "../lib/licensing/crypto";
import type {
  Entitlement,
  License,
  LicenseRepository,
} from "../lib/licensing/types";
import { redeemLicense } from "../lib/licensing/service";

function repositoryFor(license: License): LicenseRepository {
  let currentLicense = license;
  let entitlement: Entitlement | undefined;

  return {
    async findLicenseByHash(hash) {
      return currentLicense.keyHash === hash ? currentLicense : null;
    },
    async redeemLicense(input) {
      currentLicense = {
        ...currentLicense,
        status: "redeemed",
        redeemedBy: input.userId,
        redeemedAt: input.redeemedAt,
      };
      entitlement = input.entitlement;
      return entitlement;
    },
    async startBeta() {
      throw new Error("Not used in this test.");
    },
    async findEntitlementByUserAndTier() {
      return null;
    },
    async findEntitlementByLicenseId() {
      return entitlement ?? null;
    },
  };
}

function activeLicense(): License {
  return {
    id: "license-1",
    keyHash: hashLicenseKey("WS-ABCD-EFGH"),
    tier: "retail",
    status: "active",
    redeemedBy: null,
    redeemedAt: null,
    expiresAt: null,
  };
}

test("normalizes and hashes license keys consistently", () => {
  assert.equal(normalizeLicenseKey(" ws-abcd-efgh "), "WSABCDEFGH");
  assert.equal(
    hashLicenseKey("ws-abcd-efgh"),
    hashLicenseKey("WS ABCD EFGH"),
  );
});

test("redeems an active license into an entitlement", async () => {
  const result = await redeemLicense(repositoryFor(activeLicense()), {
    userId: "user-1",
    licenseKey: "WS-ABCD-EFGH",
    now: new Date("2026-08-20T00:00:00.000Z"),
  });

  assert.deepEqual(result, {
    tier: "retail",
    status: "active",
    expiresAt: null,
    userId: "user-1",
    licenseId: "license-1",
  });
});

test("rejects a license redeemed by another user", async () => {
  const license = {
    ...activeLicense(),
    status: "redeemed" as const,
    redeemedBy: "other-user",
  };

  await assert.rejects(
    redeemLicense(repositoryFor(license), {
      userId: "user-1",
      licenseKey: "WS-ABCD-EFGH",
      now: new Date("2026-08-20T00:00:00.000Z"),
    }),
    /could not be redeemed/,
  );
});
