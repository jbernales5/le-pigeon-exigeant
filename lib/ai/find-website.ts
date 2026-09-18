import { zodTextFormat } from "openai/helpers/zod"
import { z } from "zod"

import { getOpenAI, OPENAI_MODEL } from "./openai"

const schema = z.object({
  website: z.string().nullable().describe("Official website of the property (https), never a booking platform. null if unsure."),
})

/** Uses OpenAI web search to find the official website of a property. */
export async function findOfficialWebsite(name: string, city: string | null, country: string | null): Promise<string | null> {
  const client = getOpenAI()
  const response = await client.responses.parse({
    model: OPENAI_MODEL,
    tools: [{ type: "web_search", search_context_size: "low" }],
    instructions:
      "Find the official website of the given hotel or luxury accommodation. Return only the official site (not Booking, Expedia, TripAdvisor, Google). Return null if you cannot find it with confidence.",
    input: [name, city, country].filter(Boolean).join(", "),
    text: { format: zodTextFormat(schema, "official_website") },
  })
  const site = response.output_parsed?.website ?? null
  return site && /^https?:\/\//i.test(site) ? site : null
}
