"use server"

import { and, eq, gt, sql } from "drizzle-orm"
import { nanoid } from "nanoid"
import { z } from "zod"

import { db } from "@/lib/db"
import { accessRequests } from "@/lib/db/schema"
import { sendAccessRequestEmails } from "@/lib/email/access-request"

export async function verifyInviteCode(code: string) {
  const expected = process.env.INVITE_CODE
  if (!expected) return true
  return code.trim().toLowerCase() === expected.trim().toLowerCase()
}

const accessRequestSchema = z.object({
  name: z.string().trim().min(2, "Dites-nous au moins votre prénom.").max(120),
  email: z.string().trim().toLowerCase().email("Cette adresse e-mail ne semble pas valide."),
  message: z.string().trim().max(1000, "Restez sous 1000 caractères, on lit tout à la main.").optional(),
  // Honeypot: real humans never fill it.
  website: z.string().max(0).optional(),
})

export type AccessRequestResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

export async function requestAccess(input: unknown): Promise<AccessRequestResult> {
  const parsed = accessRequestSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Vérifiez les champs.", fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> }
  }
  const { name, email, message } = parsed.data

  // One request per address per 30 days; we still answer "ok" so the form can't be used to probe emails.
  const recent = await db.query.accessRequests.findFirst({
    where: and(eq(accessRequests.email, email), gt(accessRequests.createdAt, sql`now() - interval '30 days'`)),
    columns: { id: true },
  })
  if (recent) return { ok: true }

  await db.insert(accessRequests).values({ id: nanoid(12), email, name, message: message || null })
  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(accessRequests).where(eq(accessRequests.status, "pending"))

  try {
    const result = await sendAccessRequestEmails({ name, email, message: message || null, total })
    if (result.sent) await db.update(accessRequests).set({ notifiedAt: new Date() }).where(eq(accessRequests.email, email))
  } catch (err) {
    console.error("[access-request] e-mail failure", err)
  }
  return { ok: true }
}
