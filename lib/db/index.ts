import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "./schema"

declare global {
  var __bookrichPool: Pool | undefined
}

function createPool() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }
  const isNeon = /neon\.tech/.test(connectionString)
  return new Pool({
    connectionString,
    max: isNeon ? 3 : 10,
    ssl: isNeon ? { rejectUnauthorized: false } : undefined,
  })
}

// Reuse the pool across hot reloads in development.
const pool = globalThis.__bookrichPool ?? createPool()
if (process.env.NODE_ENV !== "production") globalThis.__bookrichPool = pool

export const db = drizzle(pool, { schema })
export { schema }
