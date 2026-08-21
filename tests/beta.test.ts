import assert from "node:assert/strict";
import test from "node:test";
import { BETA_DURATION_DAYS, betaExpiresAt } from "../lib/licensing/beta";

test("beta access expires 30 days after it starts", () => {
  const startedAt = new Date("2026-08-21T12:00:00.000Z");

  assert.equal(BETA_DURATION_DAYS, 30);
  assert.equal(
    betaExpiresAt(startedAt).toISOString(),
    "2026-09-20T12:00:00.000Z",
  );
});
