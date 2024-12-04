import { createClient } from "@/auth-utils/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth/error?type=google&error=code_not_found`,
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/error?type=google&error=${error.message}`,
    );
  }

  const baseUrl =
    process.env.NODE_ENV === "development"
      ? origin
      : `https://${request.headers.get("x-forwarded-host") ?? new URL(origin).host}`;

  return NextResponse.redirect(`${baseUrl}${next}`);
}
