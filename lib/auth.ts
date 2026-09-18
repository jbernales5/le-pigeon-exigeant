import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"

import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { RESET_TOKEN_TTL_SECONDS, sendResetPasswordEmail } from "@/lib/email/reset-password"
import { SITE } from "@/lib/site"

export const auth = betterAuth({
  appName: "Le Pigeon Exigeant",
  baseURL: process.env.BETTER_AUTH_URL || undefined,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  // Origins allowed to call the auth API. baseURL is trusted implicitly; the rest covers the apex/www domain,
  // the Vercel aliases and preview deployments, and local development on any port.
  trustedOrigins: [
    SITE.url,
    "https://lepigeonexigeant.fr",
    "https://www.lepigeonexigeant.fr",
    "https://*.vercel.app",
    ...(process.env.NODE_ENV !== "production" ? ["http://localhost:*", "http://127.0.0.1:*"] : []),
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: RESET_TOKEN_TTL_SECONDS,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({ name: user.name, email: user.email, url })
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 jours
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
