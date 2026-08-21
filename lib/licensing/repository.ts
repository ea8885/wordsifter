import { getSupabaseServerConfig } from "../auth/config";
import { createClient } from "@supabase/supabase-js";
import type { LicenseRepository } from "./types";

export function hasLicenseStorageConfig(): boolean {
  try {
    const config = getSupabaseServerConfig();
    return Boolean(config.url && config.publishableKey && config.serviceRoleKey);
  } catch {
    return false;
  }
}

export function createUnconfiguredLicenseRepository(): LicenseRepository {
  return {
    async findLicenseByHash() {
      throw new Error("License storage is not configured.");
    },
    async redeemLicense() {
      throw new Error("License storage is not configured.");
    },
    async startBeta() {
      throw new Error("License storage is not configured.");
    },
    async findEntitlementByUserAndTier() {
      throw new Error("License storage is not configured.");
    },
    async findEntitlementByLicenseId() {
      throw new Error("License storage is not configured.");
    },
  };
}

export function createConfiguredLicenseRepository(): LicenseRepository {
  if (!hasLicenseStorageConfig()) {
    return createUnconfiguredLicenseRepository();
  }

  const { url, serviceRoleKey } = getSupabaseServerConfig();
  const client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return {
    async findLicenseByHash(keyHash) {
      const { data, error } = await client
        .from("licenses")
        .select("id,key_hash,tier,status,redeemed_by,redeemed_at,expires_at")
        .eq("key_hash", keyHash)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        keyHash: data.key_hash,
        tier: data.tier,
        status: data.status,
        redeemedBy: data.redeemed_by,
        redeemedAt: data.redeemed_at ? new Date(data.redeemed_at) : null,
        expiresAt: data.expires_at ? new Date(data.expires_at) : null,
      };
    },
    async redeemLicense(input) {
      const { data, error } = await client.rpc("redeem_license", {
        p_key_hash: input.keyHash,
        p_user_id: input.userId,
        p_now: input.redeemedAt.toISOString(),
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error("License key could not be redeemed.");
      return {
        licenseId: row.license_id,
        userId: row.user_id,
        tier: row.tier,
        status: row.status,
        expiresAt: row.expires_at ? new Date(row.expires_at) : null,
      };
    },
    async startBeta(userId, now) {
      const { data, error } = await client.rpc("start_beta", {
        p_user_id: userId,
        p_now: now.toISOString(),
        p_duration_days: 30,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error("Beta access could not be started.");
      return {
        licenseId: row.license_id,
        userId: row.user_id,
        tier: row.tier,
        status: row.status,
        expiresAt: row.expires_at ? new Date(row.expires_at) : null,
      };
    },
    async findEntitlementByLicenseId(licenseId) {
      const { data, error } = await client
        .from("entitlements")
        .select("license_id,user_id,tier,status,expires_at")
        .eq("license_id", licenseId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        licenseId: data.license_id,
        userId: data.user_id,
        tier: data.tier,
        status: data.status,
        expiresAt: data.expires_at ? new Date(data.expires_at) : null,
      };
    },
    async findEntitlementByUserAndTier(userId, tier) {
      const { data, error } = await client
        .from("entitlements")
        .select("license_id,user_id,tier,status,expires_at")
        .eq("user_id", userId)
        .eq("tier", tier)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        licenseId: data.license_id,
        userId: data.user_id,
        tier: data.tier,
        status: data.status,
        expiresAt: data.expires_at ? new Date(data.expires_at) : null,
      };
    },
  };
}
