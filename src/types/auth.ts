// src/types/auth.ts

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  image?: string | null;
}

export interface Session {
  user: User;
}

export interface Credentials {
  email: string;
  password: string;
  name?: string;
  isRegistering?: string;
}