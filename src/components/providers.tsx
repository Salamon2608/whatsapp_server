"use client";

import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "@/components/dashboard/socket-context";
import { ThemeProvider } from "@/hooks/use-theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
