import "dotenv/config"

import { randomBytes } from "node:crypto"

import { eq } from "drizzle-orm"

import { auth } from "../lib/auth"
import { db } from "../lib/db"
import { user } from "../lib/db/schema"

const EMAIL = process.env.SEED_USER_EMAIL
const PASSWORD = process.env.SEED_USER_PASSWORD || generatePassword()
const NAME = process.env.SEED_USER_NAME || "Premier pigeon"

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  return Array.from(randomBytes(16), (b) => alphabet[b % alphabet.length]).join("")
}

async function ensureUser() {
  const existing = await db.query.user.findFirst({ where: eq(user.email, EMAIL!) })
  if (existing) {
    console.log(`• Utilisateur existant : ${EMAIL}`)
    return existing
  }
  await auth.api.signUpEmail({ body: { email: EMAIL!, password: PASSWORD, name: NAME } })
  const created = await db.query.user.findFirst({ where: eq(user.email, EMAIL!) })
  if (!created) throw new Error("Création de l'utilisateur impossible")
  console.log(`✓ Utilisateur créé : ${EMAIL} / ${PASSWORD}`)
  return created
}

async function main() {
  if (!EMAIL) {
    console.error("SEED_USER_EMAIL manquant dans .env (et éventuellement SEED_USER_PASSWORD, SEED_USER_NAME).")
    process.exit(1)
  }
  await ensureUser()
  console.log("\nTerminé. Connectez-vous avec :")
  console.log(`  e-mail        ${EMAIL}`)
  console.log(`  mot de passe  ${PASSWORD}${process.env.SEED_USER_PASSWORD ? "" : "   (généré, affiché une seule fois)"}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
