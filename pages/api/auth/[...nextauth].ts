import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { getFacebookProviderConfig } from "@/src/server/social-auth-config";

export default async function auth(req: any, res: any) {
  const facebook = getFacebookProviderConfig();
  const providers = [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
  ];

  if (facebook.enabled) {
    providers.push(
      FacebookProvider({
        clientId: facebook.clientId,
        clientSecret: facebook.clientSecret,
      }),
    );
  }

  return await NextAuth(req, res, {
    secret: process.env.TOKEN,
    providers,
    session: {
      strategy: "jwt",
      maxAge: 60 * 60 * 24 * 14,
    },
    useSecureCookies: process.env.APP_URL?.startsWith("https://") ?? false,
    callbacks: {
      async signIn({ account, profile }) {
        if (account?.provider === "google") {
          const email = String((profile as any)?.email ?? "").trim();
          const emailVerified = (profile as any)?.email_verified;

          if (!email) {
            return false;
          }

          if (emailVerified === false) {
            return false;
          }
        }

        if (account?.provider === "facebook") {
          const email = String((profile as any)?.email ?? "").trim();

          if (!email) {
            return false;
          }
        }

        return true;
      },
    },
  });
}
