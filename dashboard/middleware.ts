import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/dashboard/recommendations")) {
    const plan = request.cookies.get("rb-plan")?.value || "free";

    if (plan === "free") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("upgrade", "recommendations");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/recommendations/:path*"]
};
