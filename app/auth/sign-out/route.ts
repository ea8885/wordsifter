import { NextResponse } from "next/server";
import { getAppUrl } from "../../../lib/auth/config";
import { safeReturnPath } from "../../../lib/auth/session";
import { getSupabaseServerClient } from "../../../lib/auth/supabase-server";

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const returnTo = safeReturnPath(requestUrl.searchParams.get("return_to"));

  try {
    const { client } = await getSupabaseServerClient();
    await client.auth.signOut();
  } catch {
    return new Response("Authentication is not configured.", { status: 503 });
  }

  return NextResponse.redirect(new URL(returnTo, getAppUrl()));
}
