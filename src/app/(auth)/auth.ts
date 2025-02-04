import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000", // the base url of your auth server
    paths: {
        register: "/api/auth/register",
        login: "/api/auth/login"
    }
});