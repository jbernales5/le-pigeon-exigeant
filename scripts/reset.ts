import "dotenv/config"

import { rm } from "node:fs/promises"
import path from "node:path"

import { sql } from "drizzle-orm"

import { db } from "../lib/db"

const FULL = process.argv.includes("--all")
const UPLOADS = path.join(process.cwd(), "storage", "uploads")

async function main() {
  if (/neon\.tech/.test(process.env.DATABASE_URL ?? "") && !process.argv.includes("--force")) {
    throw new Error("DATABASE_URL pointe vers Neon (production). Ajoutez --force si c'est bien voulu.")
  }

  if (FULL) {
    // Drop everything (BetterAuth tables, hotels, drizzle migration log). Re-run `npm run db:migrate` afterwards.
    await db.execute(sql`drop schema if exists public cascade`)
    await db.execute(sql`drop schema if exists drizzle cascade`)
    await db.execute(sql`create schema public`)
    console.log("✓ Schéma supprimé. Lancez `npm run db:migrate` puis `npm run db:seed`.")
  } else {
    // Keep users & sessions, empty the collection only.
    await db.execute(sql`truncate table hotel_photos, hotels restart identity cascade`)
    console.log("✓ Tables hotels et hotel_photos vidées (utilisateurs conservés).")
  }

  await rm(UPLOADS, { recursive: true, force: true })
  await (await import("node:fs/promises")).mkdir(UPLOADS, { recursive: true })
  await (await import("node:fs/promises")).writeFile(path.join(UPLOADS, ".gitkeep"), "")
  console.log("✓ Photos locales supprimées (storage/uploads).")
  process.exit(0)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
