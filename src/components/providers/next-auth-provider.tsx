"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function NextAuthProvider({ children }: Props) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
} 