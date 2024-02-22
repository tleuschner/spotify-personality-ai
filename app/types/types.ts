export type TimeRange = "long_term" | "medium_term" | "short_term";

export type RefreshTokenError = "RefreshAccessTokenError";

export interface SeelenblickToken {
  accessToken: string;
  accessTokenExpires: number;
  refreshToken: string;
  user: User;
  iat: number;
  exp: number;
  jti: string;
}

export interface User {
  id: string;
  name: string;
}
