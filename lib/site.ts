/** Brand & site-wide constants. Single source of truth for names, URLs and contact addresses. */
export const SITE = {
  name: "Le Pigeon Exigeant",
  shortName: "Pigeon Exigeant",
  tagline: "Hôtels d'exception",
  slogan: "Des séjours qui ont du caractère.",
  description:
    "Le Pigeon Exigeant est une collection privée d'hôtels et de maisons d'exception, recommandés par des membres qui y ont vraiment dormi, vraiment payé et vraiment envie de revenir. Sur invitation. Aucun algorithme, aucun sponsor.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://lepigeonexigeant.fr",
  locale: "fr_FR",
  email: {
    from: process.env.RESEND_FROM || "Le Pigeon Exigeant <noreply@lepigeonexigeant.fr>",
    replyTo: process.env.RESEND_REPLY_TO || "bonjour@lepigeonexigeant.fr",
    /** Receives a notification for every access request. Empty = no admin notification. */
    notify: process.env.ACCESS_REQUEST_NOTIFY_EMAIL || "",
  },
  /** Credit shown in footers ("Fait avec ♥ par un pigeon exigeant"). Override for your own instance. */
  author: {
    name: process.env.NEXT_PUBLIC_AUTHOR_NAME || "Jonathan Bernales",
    url: process.env.NEXT_PUBLIC_AUTHOR_URL || "https://jonathan.bernales.dev",
  },
  keywords: [
    "hôtels d'exception",
    "hôtels de luxe recommandés",
    "collection privée d'hôtels",
    "boutique hôtels",
    "avis d'hôtels entre amis",
    "voyages haut de gamme",
    "Le Pigeon Exigeant",
  ],
} as const

export const absoluteUrl = (path = "/") => new URL(path, SITE.url).toString()
