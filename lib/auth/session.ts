export type AuthenticatedUser = {
  id: string;
  email: string | null;
  displayName: string | null;
};

const RESERVED_AUTH_PATHS = new Set([
  "/auth/callback",
  "/auth/sign-out",
  "/signin-with-chatgpt",
  "/signout-with-chatgpt",
]);

export function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  let url: URL;
  try {
    url = new URL(value, "https://wordsifter.local");
  } catch {
    return "/";
  }

  if (
    url.origin !== "https://wordsifter.local" ||
    RESERVED_AUTH_PATHS.has(url.pathname)
  ) {
    return "/";
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
