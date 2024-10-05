import { createClient } from "@/auth-utils/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Use "next" parameter as the redirect URL or default to "/"
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      // Get the host for redirect
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      const redirectUrl = isLocalEnv
        ? `${origin}${next}`
        : forwardedHost
          ? `https://${forwardedHost}${next}`
          : `${origin}${next}`;

      return NextResponse.redirect(redirectUrl);
    }
  }

  // Return to an error page with instructions if no code is provided or if there's an error
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
