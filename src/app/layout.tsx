export const dynamic = "force-dynamic";   // 🔥 REQUIRED for NextAuth + Prisma

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
