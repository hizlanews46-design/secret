import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"Vaultline — Zero-Trust Variable Vault",description:"A client-encrypted workspace for integration variables."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
