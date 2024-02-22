import { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import SpotifyProvider from "next-auth/providers/spotify";
import { RefreshTokenError } from "./types/types";

const OFFSET_ACCESS_EXPIRES = 1000 * 60 * 5;

async function refreshAccessToken(token: JWT) {
  try {
    const url = "https://accounts.spotify.com/api/token";
    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        )}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    };
    const response = await fetch(url, payload);

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.log(error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.SECRET,
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: { params: { scope: "user-top-read" } },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          accessToken: account.access_token,
          accessTokenExpires: (account?.expires_at || 0) * 1000,
          refreshToken: account.refresh_token,
          user,
        };
      }
      // Return previous token if the access token has not expired yet
      if (
        Date.now() >
        (token.accessTokenExpires as number) - OFFSET_ACCESS_EXPIRES
      ) {
        return token;
      }

      // Access token has expired, try to update it
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user = token.user as any;
        session.accessToken = token.accessToken as string;
        session.accessTokenExpires = token.accessTokenExpires as number;
        session.error = token.error as RefreshTokenError;
      }

      return session;
    },
  },
};
