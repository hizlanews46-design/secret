import { NextResponse } from "next/server";
export async function POST(){return NextResponse.json({status:"disabled",detail:"Webhook adapters require provider signature verification and a reviewed adapter."},{status:501});}
