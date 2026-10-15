import { NextResponse } from "next/server";

function escapeSvg(value: string) { return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character); }

export async function GET(_request: Request, context: { params: Promise<{ project: string }> }) {
  const { project } = await context.params;
  const safeProject = escapeSvg(project.replace(/[^A-Za-z0-9._-]/g, "").slice(0, 64) || "project");
  const lastRotation = escapeSvg(process.env.VAULTLINE_PUBLIC_LAST_ROTATION ?? "not recorded");
  const rlsStatus = escapeSvg(process.env.VAULTLINE_PUBLIC_RLS_STATUS ?? "review required");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="96" role="img" aria-label="Vaultline hygiene badge for ${safeProject}"><title>Vaultline hygiene badge for ${safeProject}</title><rect width="520" height="96" rx="16" fill="#10231f"/><rect x="12" y="12" width="72" height="72" rx="14" fill="#a3e635"/><text x="48" y="58" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#10231f">V</text><text x="104" y="34" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#a3e635">VAULTLINE HYGIENE</text><text x="104" y="55" font-family="Arial,sans-serif" font-size="14" fill="#ffffff">${safeProject}</text><text x="104" y="76" font-family="Arial,sans-serif" font-size="11" fill="#cbd5d1">RLS: ${rlsStatus} · Last rotation: ${lastRotation}</text></svg>`;
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=300, must-revalidate", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'" } });
}
