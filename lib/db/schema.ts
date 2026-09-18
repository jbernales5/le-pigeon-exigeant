import { relations } from "drizzle-orm"
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

/* -------------------------------------------------------------------------- */
/*                               BetterAuth tables                            */
/* -------------------------------------------------------------------------- */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)]
)

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("account_user_id_idx").on(t.userId)]
)

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)]
)

/* -------------------------------------------------------------------------- */
/*                                 Pigeon Exigeant tables                          */
/* -------------------------------------------------------------------------- */

export const hotels = pgTable(
  "hotels",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    tagline: text("tagline"),
    description: text("description"),
    city: text("city").notNull(),
    region: text("region"),
    country: text("country").notNull(),
    countryCode: text("country_code"),
    address: text("address"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    website: text("website"),
    sourceUrl: text("source_url"),
    pricePerNight: numeric("price_per_night", { precision: 10, scale: 2 }),
    currency: text("currency").notNull().default("EUR"),
    stayedAt: text("stayed_at"), // "YYYY-MM"
    rating: integer("rating"), // 1..5, personal
    highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
    amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
    personalNote: text("personal_note"),
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("hotels_slug_idx").on(t.slug),
    index("hotels_country_idx").on(t.country),
    index("hotels_city_idx").on(t.city),
    index("hotels_created_by_idx").on(t.createdById),
  ]
)

export const hotelPhotos = pgTable(
  "hotel_photos",
  {
    id: text("id").primaryKey(),
    hotelId: text("hotel_id")
      .notNull()
      .references(() => hotels.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    width: integer("width"),
    height: integer("height"),
    position: integer("position").notNull().default(0),
    sourceUrl: text("source_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("hotel_photos_hotel_id_idx").on(t.hotelId)]
)

export const accessRequests = pgTable(
  "access_requests",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    message: text("message"),
    status: text("status").notNull().default("pending"), // pending | invited | declined
    notifiedAt: timestamp("notified_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("access_requests_email_idx").on(t.email)]
)

/* ------------------------------- relations -------------------------------- */

export const userRelations = relations(user, ({ many }) => ({
  hotels: many(hotels),
}))

export const hotelsRelations = relations(hotels, ({ one, many }) => ({
  createdBy: one(user, { fields: [hotels.createdById], references: [user.id] }),
  photos: many(hotelPhotos),
}))

export const hotelPhotosRelations = relations(hotelPhotos, ({ one }) => ({
  hotel: one(hotels, { fields: [hotelPhotos.hotelId], references: [hotels.id] }),
}))

export type Hotel = typeof hotels.$inferSelect
export type NewHotel = typeof hotels.$inferInsert
export type HotelPhoto = typeof hotelPhotos.$inferSelect
export type User = typeof user.$inferSelect
export type AccessRequest = typeof accessRequests.$inferSelect
