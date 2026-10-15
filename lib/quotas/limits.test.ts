import { describe, expect, it } from "vitest";
import { quotaError, quotaState } from "./limits";
describe("quota limits",()=>{it("reports remaining usage",()=>{expect(quotaState({apiCallsPerDay:100,storageBytes:1,seats:1,integrations:1,rateBurst:1},25)).toMatchObject({remaining:75,percent:25,exhausted:false});});it("returns a clear upgrade-safe quota error",()=>{expect(quotaError("api_calls",quotaState({apiCallsPerDay:100,storageBytes:1,seats:1,integrations:1,rateBurst:1},100))).toMatchObject({code:"QUOTA_EXCEEDED",metric:"api_calls",limit:100});});});
