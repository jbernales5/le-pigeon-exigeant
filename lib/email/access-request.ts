import { render } from "@react-email/components"
import { createElement } from "react"

import { AccessRequestAdminEmail } from "@/emails/access-request-admin"
import { AccessRequestConfirmationEmail } from "@/emails/access-request-confirmation"
import { SITE } from "@/lib/site"

import { getResend, isEmailEnabled } from "./resend"

type Payload = { name: string; email: string; message: string | null; total: number }

/** Sends the admin notification and the applicant's confirmation. Never throws on the confirmation: the request is already stored. */
export async function sendAccessRequestEmails(payload: Payload) {
  if (!isEmailEnabled()) {
    console.warn("[email] RESEND_API_KEY manquante : e-mails de demande d'accès non envoyés.", payload.email)
    return { sent: false as const }
  }
  const resend = getResend()
  // Pre-rendered HTML (see reset-password.ts for why we avoid the SDK's `react` option).
  const adminEl = createElement(AccessRequestAdminEmail, payload)
  const applicantEl = createElement(AccessRequestConfirmationEmail, { name: payload.name })
  const [adminHtml, adminText, applicantHtml, applicantText] = await Promise.all([
    render(adminEl),
    render(adminEl, { plainText: true }),
    render(applicantEl),
    render(applicantEl, { plainText: true }),
  ])
  const [admin, applicant] = await Promise.allSettled([
    SITE.email.notify
      ? resend.emails.send({
          from: SITE.email.from,
          to: SITE.email.notify,
          replyTo: payload.email,
          subject: `Nouvelle demande d'accès · ${payload.name}`,
          html: adminHtml,
          text: adminText,
        })
      : Promise.resolve({ data: null, error: null }),
    resend.emails.send({
      from: SITE.email.from,
      to: payload.email,
      replyTo: SITE.email.replyTo,
      subject: `Votre demande d'accès à ${SITE.name} est bien arrivée`,
      html: applicantHtml,
      text: applicantText,
    }),
  ])
  for (const [label, r] of [["admin", admin], ["applicant", applicant]] as const) {
    if (r.status === "rejected") console.error(`[email] ${label} failed`, r.reason)
    else if (r.value.error) console.error(`[email] ${label} rejected by Resend`, r.value.error)
  }
  return { sent: true as const, admin, applicant }
}
