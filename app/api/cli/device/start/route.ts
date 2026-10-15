import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.VAULTLINE_ENABLE_DEVICE_AUTH !== "true") return NextResponse.json({ status: "disabled", reason: "Device authentication is not enabled." }, { status: 503 });
  return NextResponse.json({ status: "not_implemented", reason: "Device-code persistence and approval require a reviewed auth rollout." }, { status: 501 });
}
