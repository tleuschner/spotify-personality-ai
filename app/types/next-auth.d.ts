import NextAuth, { DefaultSession } from "next-auth";
import { RefreshTokenError } from "./types";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    error?: RefreshTokenError;
    accessToken?: string;
    accessTokenExpires?: number;
  }
}
