import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET() {
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${origin}/auth/callback`,
        scopes: "read:user read:org"
      }
    });

    if (error || !data.url) {
      return NextResponse.redirect(new URL("/auth?error=oauth_start_failed", origin));
    }

    return NextResponse.redirect(data.url);
  } catch {
    return NextResponse.redirect(new URL("/auth?error=oauth_start_failed", origin));
  }
}
