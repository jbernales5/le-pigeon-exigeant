import slugify from "slugify"

export function toSlug(...parts: (string | null | undefined)[]) {
  return slugify(parts.filter(Boolean).join(" "), { lower: true, strict: true, locale: "fr" }).slice(0, 80) || "hotel"
}
