import { type DefaultSession } from "next-auth";

/**
 * Module augmentation for `next-auth` types
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    email?: string | null;
    name?: string | null;
    password?: string;
  }
}

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  password?: string;
} 