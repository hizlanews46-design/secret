import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "vaultline",
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? "local",
    timestamp: new Date().toISOString(),
  }, { headers: { "Cache-Control": "no-store" } });
}
