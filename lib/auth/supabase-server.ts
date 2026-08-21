import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseServerConfig } from "./config";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export async function getSupabaseServerClient(): Promise<{
  client: SupabaseClient;
  cookieStore: CookieStore;
}> {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseServerConfig();

  const client = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server components may not be allowed to mutate cookies.
        }
      },
    },
  });

  return { client, cookieStore };
}
