import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({service:"vaultline", components:{web:"operational", api:"operational", database:"configured", advanced_integrations:"disabled_by_default"}, checkedAt:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}});}
