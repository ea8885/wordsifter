const clientEnv = (import.meta as ImportMeta & {
  env?: {
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  };
}).env;

function requiredEnv(name: string): string {
  const publicValue =
    name === "NEXT_PUBLIC_SUPABASE_URL"
      ? clientEnv?.NEXT_PUBLIC_SUPABASE_URL
      : name === "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
        ? clientEnv?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        : undefined;
  const value = process.env[name] ?? publicValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseBrowserConfig(): {
  url: string;
  publishableKey: string;
} {
  return {
    url: requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: requiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}

export function getSupabaseServerConfig(): {
  url: string;
  publishableKey: string;
  serviceRoleKey: string;
} {
  return {
    ...getSupabaseBrowserConfig(),
    serviceRoleKey: requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function getAppUrl(): URL {
  return new URL(requiredEnv("NEXT_PUBLIC_APP_URL"));
}
