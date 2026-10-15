import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({"status":"not_enabled","detail":"Usage reads require an authenticated server query; no client-supplied counters are accepted."},{status:501,headers:{"Cache-Control":"no-store"}});}
