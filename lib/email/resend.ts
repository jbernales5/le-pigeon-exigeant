import { Resend } from "resend"

let client: Resend | null = null

export function isEmailEnabled() {
  return Boolean(process.env.RESEND_API_KEY)
}

export function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY manquante")
  client ??= new Resend(process.env.RESEND_API_KEY)
  return client
}
