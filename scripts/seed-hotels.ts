import "dotenv/config"

import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

import { db } from "../lib/db"
import { hotelPhotos, hotels, user } from "../lib/db/schema"
import { toSlug } from "../lib/slug"

// Adresses fictives pour le développement. Photos Unsplash génériques.
const EMAIL = process.env.SEED_USER_EMAIL

const u = (id: string, w = 1800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const SAMPLE_HOTELS = [
  {
    name: "Aman Tokyo",
    tagline: "Un ryokan contemporain suspendu au-dessus de la ville",
    description:
      "Perché aux derniers étages de la tour Otemachi, l'Aman Tokyo réinterprète l'esthétique japonaise à l'échelle monumentale : un atrium de trente mètres habillé de washi, des chambres où le bois clair et la pierre volcanique dialoguent avec la skyline. Le bain onsen du spa, face au ciel, est l'un des plus beaux moments de la capitale.",
    city: "Tokyo",
    region: "Kantō",
    country: "Japon",
    countryCode: "JP",
    address: "The Otemachi Tower, 1-5-6 Otemachi, Chiyoda-ku",
    latitude: 35.6866,
    longitude: 139.7653,
    website: "https://www.aman.com/hotels/aman-tokyo",
    pricePerNight: "1450.00",
    currency: "EUR",
    stayedAt: "2025-11",
    rating: 5,
    highlights: ["Atrium de 30 mètres en papier washi", "Onsen avec vue sur le mont Fuji", "Chambres de 71 m² minimum", "Petit-déjeuner japonais d'anthologie"],
    amenities: ["Spa", "Piscine intérieure", "Onsen", "Restaurant", "Bar", "Salle de sport", "Conciergerie"],
    personalNote: "Demandez une chambre côté Palais impérial : au réveil, la brume sur les jardins vaut le voyage.",
    photos: ["photo-1542314831-068cd1dbfeeb", "photo-1618773928121-c32242e63f39", "photo-1591088398332-8a7791972843", "photo-1551882547-ff40c63fe5fa"],
  },
  {
    name: "Le Sirenuse",
    tagline: "La maison de famille la plus élégante de la côte amalfitaine",
    description:
      "Ancienne villa d'été des Sersale, Le Sirenuse conserve l'âme d'une maison privée : céramiques de Vietri, antiquités de famille, terrasses en cascade au-dessus du dôme majolique de Positano. Le restaurant La Sponda, éclairé de quatre cents bougies, est un rituel à lui seul.",
    city: "Positano",
    region: "Campanie",
    country: "Italie",
    countryCode: "IT",
    address: "Via Cristoforo Colombo, 30",
    latitude: 40.6281,
    longitude: 14.4856,
    website: "https://sirenuse.it",
    pricePerNight: "1100.00",
    currency: "EUR",
    stayedAt: "2025-06",
    rating: 5,
    highlights: ["Piscine face au dôme de Positano", "Dîner aux 400 bougies à La Sponda", "Boutique Emporio Sirenuse", "Bateau privé pour Capri"],
    amenities: ["Piscine", "Spa", "Restaurant étoilé", "Bar", "Boutique", "Bateau"],
    personalNote: "La chambre 62 a la plus belle terrasse. Réservez La Sponda le premier soir, pas le dernier.",
    photos: ["photo-1533104816931-20fa691ff6ca", "photo-1568084680786-a84f91d1153c", "photo-1596394516093-501ba68a0ba6"],
  },
  {
    name: "La Mamounia",
    tagline: "Le palais des jardins, depuis 1923",
    description:
      "Derrière les remparts de la médina, huit hectares de jardins centenaires, des patios en zellige et une lumière qu'on ne trouve nulle part ailleurs. Rénové par Jouin Manku, le palace garde son faste orientaliste tout en restant délicieusement vivant.",
    city: "Marrakech",
    region: "Marrakech-Safi",
    country: "Maroc",
    countryCode: "MA",
    address: "Avenue Bab Jdid",
    latitude: 31.6231,
    longitude: -7.9987,
    website: "https://www.mamounia.com",
    pricePerNight: "620.00",
    currency: "EUR",
    stayedAt: "2026-02",
    rating: 4,
    highlights: ["Jardins de 8 hectares", "Spa de 2 500 m²", "Pâtisserie Pierre Hermé", "Pavillon de la piscine"],
    amenities: ["Piscine", "Spa", "Hammam", "Tennis", "Restaurants", "Bar", "Jardins"],
    personalNote: "Prenez le thé au bord de la piscine vers 17h, quand les jardins prennent leur couleur ocre.",
    photos: ["photo-1584132967334-10e028bd69f7", "photo-1548574505-5e239809ee19", "photo-1590490360182-c33d57733427"],
  },
  {
    name: "Amangiri",
    tagline: "Le désert comme seule architecture",
    description:
      "Au cœur des canyons de l'Utah, un monolithe de béton teinté couleur sable se fond dans la roche. La piscine enveloppe un rocher vieux de 165 millions d'années ; le silence est absolu. C'est l'hôtel qui redéfinit le luxe comme une absence.",
    city: "Canyon Point",
    region: "Utah",
    country: "États-Unis",
    countryCode: "US",
    address: "1 Kayenta Rd, Canyon Point",
    latitude: 37.0128,
    longitude: -111.6356,
    website: "https://www.aman.com/resorts/amangiri",
    pricePerNight: "3200.00",
    currency: "USD",
    stayedAt: "2025-09",
    rating: 5,
    highlights: ["Piscine autour d'un rocher millénaire", "Via ferrata privée", "Ciel étoilé sans pollution lumineuse", "Suites avec terrasse et bain extérieur"],
    amenities: ["Piscine", "Spa", "Yoga", "Randonnée", "Restaurant", "Bibliothèque"],
    personalNote: "Le vol en hélicoptère au-dessus du lac Powell au lever du soleil. Sans hésiter.",
    photos: ["photo-1571003123894-1f0594d2b5d9", "photo-1582719508461-905c673771fd", "photo-1540541338287-41700207dee6"],
  },
]

async function seedHotels(ownerId: string) {
  for (const h of SAMPLE_HOTELS) {
    const slug = toSlug(h.name, h.city)
    const exists = await db.query.hotels.findFirst({ where: eq(hotels.slug, slug), columns: { id: true } })
    if (exists) {
      console.log(`• Déjà présent : ${h.name}`)
      continue
    }
    const id = nanoid(12)
    const { photos, ...rest } = h
    await db.insert(hotels).values({ id, slug, ...rest, createdById: ownerId })
    await db.insert(hotelPhotos).values(
      photos.map((p, position) => ({ id: nanoid(12), hotelId: id, url: u(p), alt: h.name, width: 1800, height: 1200, position, sourceUrl: null }))
    )
    console.log(`✓ Ajouté : ${h.name}`)
  }
}

async function main() {
  if (!EMAIL) throw new Error("SEED_USER_EMAIL manquant dans .env : les adresses d'exemple sont attribuées à cet utilisateur.")
  const owner = await db.query.user.findFirst({ where: eq(user.email, EMAIL) })
  if (!owner) throw new Error(`Utilisateur ${EMAIL} introuvable : lancez d'abord \`npm run db:seed\`.`)
  await seedHotels(owner.id)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
