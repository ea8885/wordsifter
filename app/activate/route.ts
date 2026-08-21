import { getSupabaseServerClient } from "../../lib/auth/supabase-server";
import { verifyActivationToken } from "../../lib/licensing/crypto";

export async function GET(request: Request): Promise<Response> {
  try {
    const token = new URL(request.url).searchParams.get("token");
    return Response.json({ ok: true, payload: verifyActivationToken(token || "") });
  } catch {
    return Response.json({ ok: false, error: "Activation token is invalid or expired." }, { status: 401 });
  }
}

export async function POST(): Promise<Response> {
  try {
    const { client } = await getSupabaseServerClient();
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) return new Response("Authentication required.", { status: 401 });
  } catch {
    return new Response("Authentication is not configured.", { status: 503 });
  }

  return Response.json(
    { error: "Desktop activation storage is not configured." },
    { status: 503 },
  );
}
