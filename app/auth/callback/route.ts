import { NextResponse } from "next/server";
import { getAppUrl } from "../../../lib/auth/config";
import { safeReturnPath } from "../../../lib/auth/session";
import { getSupabaseServerClient } from "../../../lib/auth/supabase-server";

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const returnTo = safeReturnPath(requestUrl.searchParams.get("return_to"));

  if (!code) {
    return new Response("Authentication callback is missing a code.", {
      status: 400,
    });
  }

  try {
    const { client } = await getSupabaseServerClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      return new Response("Authentication could not be completed.", {
        status: 400,
      });
    }

    return NextResponse.redirect(new URL(returnTo, getAppUrl()));
  } catch {
    return new Response("Authentication is not configured.", { status: 503 });
  }
}
