import OpenAI from "openai"

let client: OpenAI | null = null

export function isOpenAIEnabled() {
  return Boolean(process.env.OPENAI_API_KEY)
}

export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY manquante : ajoutez-la dans votre fichier .env")
  }
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return client
}

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini"
