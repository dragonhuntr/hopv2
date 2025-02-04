import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/utils";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {  
        enabled: true,
        registration: {
            enabled: true,
            requireEmailVerification: false,
            path: "api/auth/register"
        },
        login: {
            path: "api/auth/login"
        }
    },
});
