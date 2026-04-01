import { NextRequest, NextResponse } from "next/server";
import { handleWebhookRequest } from "../../../../handlers/workflow-run.js";

export async function POST(request: NextRequest) {
  try {
    const raw = Buffer.from(await request.arrayBuffer());
    const headers = Object.fromEntries(request.headers.entries());
    await handleWebhookRequest({
      headers,
      rawBody: raw
    });
  } catch (error) {
    console.error("[api/webhook] processing error", {
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }

  return NextResponse.json({ ok: true });
}
