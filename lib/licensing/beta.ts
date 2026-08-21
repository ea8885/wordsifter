export const BETA_DURATION_DAYS = 30;

export function betaExpiresAt(startedAt: Date): Date {
  const expiresAt = new Date(startedAt);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + BETA_DURATION_DAYS);
  return expiresAt;
}