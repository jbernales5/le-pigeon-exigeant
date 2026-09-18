import { render } from "@react-email/components"
import { createElement } from "react"

import { ResetPasswordEmail } from "@/emails/reset-password"
import { SITE } from "@/lib/site"

import { getResend, isEmailEnabled } from "./resend"

export const RESET_TOKEN_TTL_SECONDS = 60 * 60

export async function sendResetPasswordEmail({ name, email, url }: { name: string; email: string; url: string }) {
  if (!isEmailEnabled()) {
    // Local development without Resend: surface the link in the server console so the flow stays testable.
    console.warn(`[email] RESEND_API_KEY manquante : lien de réinitialisation pour ${email} → ${url}`)
    return
  }
  // Render ourselves: the SDK's `react` option loads @react-email/render dynamically, which fails inside the Next bundle.
  const element = createElement(ResetPasswordEmail, { name, url, expiresInMinutes: RESET_TOKEN_TTL_SECONDS / 60 })
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })])
  const { error } = await getResend().emails.send({
    from: SITE.email.from,
    to: email,
    replyTo: SITE.email.replyTo,
    subject: `Votre nouveau mot de passe ${SITE.name}`,
    html,
    text,
  })
  if (error) {
    console.error("[email] reset password rejected by Resend", error)
    throw new Error("L'e-mail n'a pas pu être envoyé.")
  }
}
