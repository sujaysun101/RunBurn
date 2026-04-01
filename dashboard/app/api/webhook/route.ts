import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiBaseUrl = process.env.API_BASE_URL;

    if (apiBaseUrl) {
      const raw = await request.text();
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/webhook`, {
        method: "POST",
        headers: {
          "content-type": request.headers.get("content-type") || "application/json",
          "x-github-event": request.headers.get("x-github-event") || "",
          "x-hub-signature-256": request.headers.get("x-hub-signature-256") || "",
          "x-github-delivery": request.headers.get("x-github-delivery") || ""
        },
        body: raw
      });

      return NextResponse.json({
        ok: true,
        proxied: true,
        upstreamStatus: response.status
      });
    }
  } catch (error) {
    console.error("[api/webhook] proxy error", {
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }

  return NextResponse.json({
    ok: true,
    proxied: false
  });
}
