import type { Config } from "tailwindcss";
const config: Config = { content:["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"], theme:{extend:{fontFamily:{sans:["var(--font-geist)","ui-sans-serif"]},colors:{ink:"#10231f",mint:"#d8f3e8",lime:"#b8f06a",line:"#dbe8e1"}}}, plugins:[] };
export default config;
