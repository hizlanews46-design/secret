import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaRegister from "@/components/pwa-register";
import CookieConsent from "@/components/cookie-consent";

export const metadata: Metadata = {
  title: "Vaultline — Zero-Trust Variable Vault",
  description: "A consent-first, client-encrypted workspace for integration variables.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#10231f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}<PwaRegister /><CookieConsent /></body></html>;
}
