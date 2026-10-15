import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({"status":"not_enabled","detail":"Ticket mutations require authenticated server-side redaction and RLS."},{status:501,headers:{"Cache-Control":"no-store"}});}
