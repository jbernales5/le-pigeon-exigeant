import "dotenv/config"

import { randomBytes } from "node:crypto"

import { eq } from "drizzle-orm"

import { auth } from "../lib/auth"
import { db } from "../lib/db"
import { user } from "../lib/db/schema"

/**
 * Invite (seed) a member.
 *
 *   npm run user:invite -- camille@exemple.com Camille
 *   npm run user:invite -- --email camille@exemple.com --name "Camille & Louis" --password "UnMotDePasse!"
 *
 * Without --password, a random one is generated and printed once.
 */
function parseArgs(argv: string[]) {
  const out: { email?: string; name?: string; password?: string } = {}
  const positional: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--email") out.email = argv[++i]
    else if (a === "--name") out.name = argv[++i]
    else if (a === "--password") out.password = argv[++i]
    else if (a.startsWith("--")) throw new Error(`Option inconnue : ${a}`)
    else positional.push(a)
  }
  out.email ??= positional[0]
  out.name ??= positional[1]
  return out
}

function generatePassword() {
  // 16 chars, unambiguous alphabet, easy to read aloud to a friend.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  const bytes = randomBytes(16)
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")
}

async function main() {
  const { email, name, password: given } = parseArgs(process.argv.slice(2))
  if (!email || !name) {
    console.error("Usage : npm run user:invite -- <email> <prénom>   (ou --email … --name … [--password …])")
    process.exit(1)
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error(`E-mail invalide : ${email}`)
  if (given && given.length < 8) throw new Error("Le mot de passe doit contenir au moins 8 caractères.")

  const existing = await db.query.user.findFirst({ where: eq(user.email, email.toLowerCase()) })
  if (existing) {
    console.log(`• ${email} est déjà membre (${existing.name}). Rien à faire.`)
    process.exit(0)
  }

  const password = given ?? generatePassword()
  await auth.api.signUpEmail({ body: { email: email.toLowerCase(), password, name: name.trim() } })

  console.log(`✓ ${name} a rejoint la volière.\n`)
  console.log(`  e-mail        ${email.toLowerCase()}`)
  console.log(`  mot de passe  ${password}${given ? "" : "   (généré, affiché une seule fois)"}`)
  process.exit(0)
}

main().catch((err: Error & { cause?: Error }) => {
  console.error(err.cause?.message ?? err.message)
  process.exit(1)
})
