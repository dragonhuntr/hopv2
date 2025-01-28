import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { type User as DbUser } from "@prisma/client";
import { type AuthUser, type Credentials } from "@/types/auth";
import { z } from "zod";

import { db } from "@/server/db/schema";

const authSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        isRegistering: { type: "hidden" }
      },
      async authorize(credentials) {
        const creds = credentials as Credentials;
        if (!creds?.email || !creds?.password) {
          return null;
        }

        const result = authSchema.safeParse(creds);
        if (!result.success) {
          throw new Error(result.error.errors[0]?.message || "Invalid input");
        }

        // If this is a registration request
        if (creds.isRegistering === "true") {
          const existingUser = await db.user.findUnique({
            where: { email: creds.email }
          });

          if (existingUser) {
            throw new Error("User already exists");
          }

          const hashedPassword = await bcrypt.hash(creds.password, 10);
          const user = await db.user.create({
            data: {
              email: creds.email,
              password: hashedPassword,
              name: creds.name || null,
            },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          } as AuthUser;
        }

        // Regular sign in
        const user = await db.user.findUnique({
          where: {
            email: creds.email
          }
        }) as (DbUser | null);

        if (!user?.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          creds.password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        } as AuthUser;
      }
    })
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt"
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub!,
      },
    }),
  },
  pages: {
    signIn: "/auth",
  },
} satisfies NextAuthConfig;
