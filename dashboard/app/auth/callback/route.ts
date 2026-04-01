import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  try {
    const code = request.nextUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.redirect(new URL("/auth?error=missing_code", origin));
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/auth?error=exchange_failed", origin));
    }

    const response = NextResponse.redirect(new URL("/dashboard", origin));
    const providerToken = data.session?.provider_token;

    if (providerToken && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const installationsResponse = await fetch("https://api.github.com/user/installations", {
        headers: {
          Authorization: `Bearer ${providerToken}`,
          Accept: "application/vnd.github+json"
        },
        cache: "no-store"
      });

      if (installationsResponse.ok) {
        const installationsPayload = await installationsResponse.json();
        const githubInstallationIds = (installationsPayload.installations || []).map((item: { id: number }) => item.id);

        if (githubInstallationIds.length > 0) {
          const { createClient } = await import("@supabase/supabase-js");
          const serviceClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false }
          });

          const { data: matches } = await serviceClient
            .from("installations")
            .select("id, plan")
            .in("github_installation_id", githubInstallationIds)
            .limit(1);

          if (matches?.[0]) {
            response.cookies.set("rb-installation-id", matches[0].id, { httpOnly: true, sameSite: "lax", path: "/" });
            response.cookies.set("rb-plan", matches[0].plan, { httpOnly: true, sameSite: "lax", path: "/" });
          }
        }
      }
    }

    return response;
  } catch {
    return NextResponse.redirect(new URL("/auth?error=callback_failed", origin));
  }
}
