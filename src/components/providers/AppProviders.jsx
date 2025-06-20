'use client';

import { SessionProvider } from 'next-auth/react';

export function AppProviders({ children }) {
  return (
    <SessionProvider>
      {/* Add other providers here if needed */}
      {children}
    </SessionProvider>
  );
}
