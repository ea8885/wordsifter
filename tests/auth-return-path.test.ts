import assert from "node:assert/strict";
import test from "node:test";
import { safeReturnPath } from "../lib/auth/session";

test("accepts a safe relative return path", () => {
  assert.equal(safeReturnPath("/account"), "/account");
  assert.equal(
    safeReturnPath("/account?tab=licenses#active"),
    "/account?tab=licenses#active",
  );
});

test("rejects external and reserved return paths", () => {
  assert.equal(safeReturnPath("//evil.example"), "/");
  assert.equal(safeReturnPath("https://evil.example"), "/");
  assert.equal(safeReturnPath("/auth/callback"), "/");
  assert.equal(safeReturnPath("not-a-path"), "/");
});
