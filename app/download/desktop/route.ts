import { getSupabaseServerClient } from "../../../lib/auth/supabase-server";
import {
  createConfiguredLicenseRepository,
  hasLicenseStorageConfig,
} from "../../../lib/licensing/repository";

const RELEASES_URL =
  "https://api.github.com/repos/ea8885/song-review-studio-releases/releases";

type GitHubRelease = {
  draft?: boolean;
  prerelease?: boolean;
  assets?: Array<{
    name?: string;
    browser_download_url?: string;
  }>;
};

async function latestWindowsBetaUrl(): Promise<string> {
  const response = await fetch(RELEASES_URL, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "WordSifter",
    },
    next: { revalidate: 60 },
  });
  if (!response.ok) throw new Error("Could not load the latest beta release.");
  const releases = (await response.json()) as GitHubRelease[];
  const release = releases.find((item) => !item.draft && item.prerelease);
  const installer = release?.assets?.find(
    (asset) =>
      asset.name?.startsWith("WordSifter-Setup-") &&
      asset.name.endsWith("-x64.exe") &&
      asset.browser_download_url,
  );
  if (!installer?.browser_download_url) {
    throw new Error("The latest Windows beta installer is unavailable.");
  }
  return installer.browser_download_url;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const { client } = await getSupabaseServerClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) {
      return Response.redirect(new URL("/#account", request.url), 303);
    }
    if (!hasLicenseStorageConfig()) {
      return Response.redirect(new URL("/#account", request.url), 303);
    }
    const repository = createConfiguredLicenseRepository();
    const [beta, retail] = await Promise.all([
      repository.findEntitlementByUserAndTier(user.id, "beta"),
      repository.findEntitlementByUserAndTier(user.id, "retail"),
    ]);
    const now = new Date();
    const entitled = [beta, retail].some(
      (entitlement) =>
        entitlement?.status === "active" &&
        (!entitlement.expiresAt || entitlement.expiresAt > now),
    );
    if (!entitled) {
      return Response.redirect(new URL("/#account", request.url), 303);
    }
    return Response.redirect(await latestWindowsBetaUrl(), 303);
  } catch {
    return Response.redirect(new URL("/#account", request.url), 303);
  }
}
