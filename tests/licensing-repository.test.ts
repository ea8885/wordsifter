import assert from "node:assert/strict";
import test from "node:test";
import {
  createConfiguredLicenseRepository,
  hasLicenseStorageConfig,
} from "../lib/licensing/repository";

test("recognizes when a live license repository is configured", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

  assert.equal(hasLicenseStorageConfig(), true);
  assert.ok(createConfiguredLicenseRepository());
});

test("reports when a live license repository is not configured", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  assert.equal(hasLicenseStorageConfig(), false);
});
