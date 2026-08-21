"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../lib/auth/supabase-browser";
import DesktopDownload from "./desktop-download";

export default function AuthPanel() {
  const [email, setEmail] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [retailOpen, setRetailOpen] = useState(false);
  const [retailActive, setRetailActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [betaStatus, setBetaStatus] = useState<{
    status: "available" | "active" | "expiring" | "expired" | "unavailable";
    expiresAt?: string;
    daysRemaining?: number;
  }>({ status: "available" });

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;
    void getSupabaseBrowserClient()
      .auth.getSession()
      .then(({ data }) => {
        const nextEmail = data.session?.user.email ?? "";
        setUserEmail(nextEmail);
        if (nextEmail) {
          void fetch("/license/beta")
            .then(async (response) => ({
              response,
              result: (await response.json().catch(() => null)) as typeof betaStatus,
            }))
            .then(({ response, result }) => {
              if (response.ok && result?.status) {
                setBetaStatus({
                  ...result,
                  status:
                    result.status === "active" && (result.daysRemaining ?? 0) <= 3
                      ? "expiring"
                      : result.status,
                });
              }
            })
            .catch(() => setBetaStatus({ status: "unavailable" }));
        }
      })
      .catch(() => setUserEmail(""));
    try {
      const result = getSupabaseBrowserClient().auth.onAuthStateChange(
        (_event, session) => setUserEmail(session?.user.email ?? ""),
      );
      subscription = result.data.subscription;
    } catch {
      subscription = undefined;
    }
    return () => subscription?.unsubscribe();
  }, []);

  async function startGoogleSignIn() {
    setBusy(true);
    setMessage("");
    try {
      const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?return_to=/`,
        },
      });
      if (error) setMessage("Google sign-in is unavailable right now.");
    } catch {
      setMessage("Account sign-in is not configured on this deployment yet.");
    } finally {
      setBusy(false);
    }
  }

  async function sendMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const { error } = await getSupabaseBrowserClient().auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?return_to=/`,
        },
      });
      setMessage(
        error
          ? "That sign-in link could not be sent."
          : "Check your email for a sign-in link.",
      );
    } catch {
      setMessage("Account sign-in is not configured on this deployment yet.");
    } finally {
      setBusy(false);
    }
  }

  async function redeemLicense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/license/redeem", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ licenseKey }),
      });
      setMessage(
        response.ok
          ? "License activated."
          : "Sign in before redeeming a license.",
      );
      if (response.ok) {
        setRetailOpen(false);
        setRetailActive(true);
      }
    } catch {
      setMessage("License redemption is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  async function startBeta() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/license/beta", { method: "POST" });
      const result = (await response.json().catch(() => null)) as {
        expiresAt?: string;
        durationDays?: number;
        activationToken?: string;
      } | null;
      setMessage(
        response.ok && result?.expiresAt
          ? `Beta access started for ${result.durationDays ?? 30} days.`
          : "Sign in before starting the free beta.",
      );
      if (response.ok && result?.expiresAt && result.activationToken) {
        setBetaStatus({
          status: "active",
          expiresAt: result.expiresAt,
          daysRemaining: result.durationDays,
        });
        window.location.href = `wordsifter://activate?token=${encodeURIComponent(result.activationToken)}`;
      }
    } catch {
      setMessage("Beta access is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    try {
      await getSupabaseBrowserClient().auth.signOut();
      setUserEmail("");
      setBetaStatus({ status: "available" });
      setRetailActive(false);
      setMessage("Signed out.");
    } catch {
      setMessage("Sign out is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="account" className="authPanel" aria-label="Account access">
      <div className="authIntro">
        <strong>Save your best work</strong>
        <span>
          {userEmail
            ? `Signed in as ${userEmail}`
            : "Sign in to sync WordSifter across devices."}
        </span>
      </div>
      <div className="authGroups">
        <div className="authGroup authSignInGroup">
          <span className="authGroupLabel">Account access</span>
          <div className="authGroupControls">
            {userEmail ? (
              <span className="authVerified">Account verified</span>
            ) : (
              <>
              <button className="authGoogle" onClick={() => void startGoogleSignIn()} disabled={busy}>
                Continue with Google
              </button>
                <form onSubmit={(event) => void sendMagicLink(event)}>
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-label="Email address" required />
                  <button type="submit" disabled={busy}>Email me a link</button>
                </form>
              </>
            )}
          </div>
        </div>
        <div className="authGroup authBetaGroup">
          <span className="authGroupLabel">Desktop beta</span>
          <div className="authGroupControls">
            {userEmail ? <>
              {retailActive ? (
                <>
                  <span className="authTrialState">Retail access active</span>
                  <DesktopDownload />
                </>
              ) : betaStatus.status === "active" || betaStatus.status === "expiring" ? (
                <>
                  <span className={`authTrialState${betaStatus.status === "expiring" ? " authTrialExpiring" : ""}`}>
                    Beta {betaStatus.status === "expiring" ? "expiring" : "active"} · {betaStatus.daysRemaining ?? 0} days left
                  </span>
                  <DesktopDownload />
                </>
              ) : betaStatus.status === "expired" ? (
                <span className="authTrialState authTrialExpired">Beta expired</span>
              ) : (
                <button type="button" onClick={() => void startBeta()} disabled={busy || betaStatus.status === "unavailable"}>Start free 30-day beta</button>
              )}
              <button className="authQuiet" type="button" onClick={() => void signOut()} disabled={busy}>Sign out</button>
            </> : <span className="authHint">Sign in to unlock beta access and download.</span>}
          </div>
        </div>
        <div className="authGroup authRetailGroup">
          <button
            type="button"
            aria-expanded={retailOpen}
            onClick={() => setRetailOpen((open) => !open)}
          >
            {retailOpen ? "Hide retail key entry" : "Have a retail key?"}
          </button>
          {retailOpen && (
            <form onSubmit={(event) => void redeemLicense(event)}>
              <input value={licenseKey} onChange={(event) => setLicenseKey(event.target.value)} placeholder="Retail license key" aria-label="Retail license key" required />
              <button type="submit" disabled={busy}>Redeem key</button>
            </form>
          )}
        </div>
      </div>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
