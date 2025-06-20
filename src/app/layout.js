import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"
import { AppProviders } from '@/components/providers/AppProviders';
import { SessionProvider } from "next-auth/react";
import AppToaster from "@/components/ui/Toaster";
import QueryProvider from "@/components/providers/QueryProvider";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <QueryProvider>
          <AppToaster/>
          {children}
          </QueryProvider>
          </AppProviders>
      </body>
    </html>
  );
}
