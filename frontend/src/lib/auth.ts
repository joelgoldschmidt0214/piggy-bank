/**
 * BetterAuth Configuration
 * Google OAuth を使用した認証設定
 */

// TODO: BetterAuth のセットアップ
// 1. npm install better-auth
// 2. Google Cloud Console で OAuth 2.0 クライアントID作成
// 3. 環境変数設定（.env.local）
// 4. 以下のコードを実装

/*
import { betterAuth } from "better-auth"
import { googleProvider } from "better-auth/providers/google"

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  socialProviders: {
    google: googleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  cookies: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
})

export type Session = typeof auth.$Infer.Session
*/

// Placeholder implementation
export const auth = {
  // TODO: Implement BetterAuth
};

export type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
};
