import * as cheerio from "cheerio"

import type { CandidateImage } from "@/lib/hotel-draft"

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"

export type ScrapedPage = {
  url: string
  finalUrl: string
  title: string
  description: string
  siteName: string | null
  lang: string | null
  jsonLd: unknown[]
  text: string
  images: CandidateImage[]
}

const BAD_IMAGE = /(logo|icon|sprite|favicon|badge|flag|payment|visa|mastercard|tripadvisor|award|pixel|tracking|avatar|arrow|loader|placeholder|blank|spacer|\.svg|\.gif|data:)/i

function absolutize(base: string, src: string | undefined | null) {
  if (!src) return null
  const trimmed = src.trim()
  if (!trimmed || trimmed.startsWith("data:")) return null
  try {
    return new URL(trimmed, base).toString()
  } catch {
    return null
  }
}

/** Pick the largest candidate from a srcset attribute. */
function largestFromSrcset(base: string, srcset: string | undefined) {
  if (!srcset) return null
  let best: { url: string; w: number } | null = null
  for (const part of srcset.split(",")) {
    const [rawUrl, descriptor] = part.trim().split(/\s+/)
    const url = absolutize(base, rawUrl)
    if (!url) continue
    const w = descriptor?.endsWith("w") ? parseInt(descriptor) : descriptor?.endsWith("x") ? parseFloat(descriptor) * 1000 : 0
    if (!best || w > best.w) best = { url, w }
  }
  return best
}

/**
 * Many sites expose the same picture in several responsive variants
 * (Drupal `/styles/<variant>/public/…`, WordPress `-1024x768`, `@2x`, `?w=`…).
 * Group variants under a normalized key and keep the most promising one.
 */
function variantKey(url: string) {
  let u = url.replace(/^https?:\/\//, "")
  // Next.js image proxy → inner url
  const inner = u.match(/_next\/image\?url=([^&]+)/)
  if (inner) u = decodeURIComponent(inner[1]).replace(/^https?:\/\//, "")
  u = u.replace(/[?#].*$/, "")
  u = u.replace(/\/styles\/[^/]+\/public\//, "/public/") // Drupal image styles
  u = u.replace(/\/(cdn-cgi\/image|image\/upload|resize|thumbs?|thumbnails?)\/[^/]+\//, "/") // Cloudflare / Cloudinary / misc
  u = u.replace(/[-_](\d{2,4})x(\d{2,4})(?=\.[a-z]+$)/i, "") // WordPress -1024x768
  u = u.replace(/@[23]x(?=\.[a-z]+$)/i, "")
  u = u.replace(/\.(jpe?g|png|webp|avif)$/i, "")
  return u.toLowerCase()
}

function variantScore(img: CandidateImage) {
  let score = img.width ?? 0
  const u = img.url.toLowerCase()
  if (/extra_large|xlarge|xxl|original|full_size|fullsize|huge/.test(u)) score += 3000
  else if (/large|big/.test(u)) score += 2000
  else if (/medium/.test(u)) score += 1000
  if (/@2x|_2x|-2x/.test(u)) score += 500
  if (/small|thumb|tiny|mobile/.test(u)) score -= 1500
  return score
}

function dedupe(images: CandidateImage[]) {
  const best = new Map<string, CandidateImage>()
  const order: string[] = []
  for (const img of images) {
    const key = variantKey(img.url)
    const current = best.get(key)
    if (!current) {
      best.set(key, img)
      order.push(key)
    } else if (variantScore(img) > variantScore(current)) {
      best.set(key, { ...img, alt: img.alt ?? current.alt })
    }
  }
  return order.map((k) => best.get(k)!)
}

function collectJsonLd($: cheerio.CheerioAPI) {
  const nodes: unknown[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text()
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) nodes.push(...parsed)
      else if (parsed && typeof parsed === "object" && "@graph" in parsed && Array.isArray(parsed["@graph"]))
        nodes.push(...parsed["@graph"])
      else nodes.push(parsed)
    } catch {
      /* ignore malformed JSON-LD */
    }
  })
  return nodes
}

function imagesFromJsonLd(base: string, nodes: unknown[]): CandidateImage[] {
  const out: CandidateImage[] = []
  const visit = (v: unknown) => {
    if (!v) return
    if (typeof v === "string") {
      const url = absolutize(base, v)
      if (url) out.push({ url })
    } else if (Array.isArray(v)) v.forEach(visit)
    else if (typeof v === "object") {
      const o = v as Record<string, unknown>
      if (typeof o.url === "string") {
        const url = absolutize(base, o.url)
        if (url) out.push({ url, width: Number(o.width) || null, height: Number(o.height) || null })
      }
      if (typeof o.contentUrl === "string") {
        const url = absolutize(base, o.contentUrl)
        if (url) out.push({ url })
      }
    }
  }
  for (const node of nodes) {
    if (node && typeof node === "object") {
      const o = node as Record<string, unknown>
      visit(o.image)
      visit(o.photo)
      visit(o.photos)
    }
  }
  return out
}

export async function scrapePage(inputUrl: string): Promise<ScrapedPage> {
  const url = new URL(inputUrl).toString()
  const res = await fetch(url, {
    headers: {
      "user-agent": UA,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "fr-FR,fr;q=0.9,en;q=0.8",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) {
    if (res.status === 403 || res.status === 429 || res.status === 503) {
      throw new Error(
        `Ce site bloque les robots (${res.status}). Essayez une autre page du même site, la recherche par nom, ou téléversez vos photos.`
      )
    }
    throw new Error(`Impossible de charger la page (${res.status})`)
  }
  const html = await res.text()
  const finalUrl = res.url || url
  const $ = cheerio.load(html)

  const meta = (name: string) =>
    $(`meta[property="${name}"]`).attr("content") || $(`meta[name="${name}"]`).attr("content") || ""

  const title = (meta("og:title") || $("title").first().text() || "").trim()
  const description = (meta("og:description") || meta("description") || "").trim()
  const siteName = meta("og:site_name") || null
  const lang = $("html").attr("lang") || null
  const jsonLd = collectJsonLd($)

  // --- images ---------------------------------------------------------------
  const images: CandidateImage[] = []
  for (const key of ["og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"]) {
    $(`meta[property="${key}"], meta[name="${key}"]`).each((_, el) => {
      const u = absolutize(finalUrl, $(el).attr("content"))
      if (u) images.push({ url: u, width: null, height: null })
    })
  }
  images.push(...imagesFromJsonLd(finalUrl, jsonLd))

  $("img, source, [data-src], [data-bg], [data-background], [style*='background-image']").each((_, el) => {
    const $el = $(el)
    const fromSrcset =
      largestFromSrcset(finalUrl, $el.attr("srcset")) || largestFromSrcset(finalUrl, $el.attr("data-srcset"))
    const src =
      fromSrcset?.url ||
      absolutize(finalUrl, $el.attr("data-src")) ||
      absolutize(finalUrl, $el.attr("data-lazy-src")) ||
      absolutize(finalUrl, $el.attr("data-original")) ||
      absolutize(finalUrl, $el.attr("data-bg")) ||
      absolutize(finalUrl, $el.attr("data-background")) ||
      absolutize(finalUrl, $el.attr("src"))
    let styleUrl: string | null = null
    const style = $el.attr("style")
    if (style) {
      const m = style.match(/url\((['"]?)(.*?)\1\)/i)
      if (m) styleUrl = absolutize(finalUrl, m[2])
    }
    const candidate = src || styleUrl
    if (!candidate) return
    const w = parseInt($el.attr("width") || "") || fromSrcset?.w || null
    const h = parseInt($el.attr("height") || "") || null
    if (w && w < 400 && !fromSrcset) return
    images.push({ url: candidate, alt: $el.attr("alt") || null, width: w, height: h })
  })

  const pageKey = finalUrl.replace(/[?#].*$/, "").replace(/\/$/, "")
  const filtered = dedupe(images)
    .filter((img) => /^https?:/.test(img.url) && !BAD_IMAGE.test(img.url))
    .filter((img) => img.url.replace(/[?#].*$/, "").replace(/\/$/, "") !== pageKey)
    .filter((img) => /\.(jpe?g|png|webp|avif)(\?|$)/i.test(img.url) || /(image|img|photo|media|cdn|upload|asset|picture)/i.test(img.url))
    .slice(0, 40)

  // --- text -----------------------------------------------------------------
  $("script, style, noscript, svg, nav, footer, form, iframe").remove()
  const headings = $("h1, h2")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .slice(0, 20)
  const body = $("main").length ? $("main").text() : $("body").text()
  const text = [`# ${title}`, description, headings.join("\n"), body]
    .join("\n\n")
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 14_000)

  return { url, finalUrl, title, description, siteName, lang, jsonLd, text, images: filtered }
}
