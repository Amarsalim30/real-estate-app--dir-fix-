import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"
import { AppProviders } from '@/providers';
import { SessionProvider } from "next-auth/react";
import AppToaster from "@/components/ui/Toaster";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AppToaster/>
          {children}
          </AppProviders>
      </body>
    </html>
  );
}
