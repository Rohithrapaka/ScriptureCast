import { pgTable, text, timestamp, integer, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// ── 1. USERS & AUTHENTICATION ──────────────────────────────────────────────────
export const userRoles = ["super_admin", "admin", "presenter", "worship_team", "viewer"] as const;
export type UserRole = (typeof userRoles)[number];

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: userRoles }).notNull().default("presenter"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable);
export const selectUserSchema = createSelectSchema(usersTable);
export type InsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;

// ── 2. SONGS & SONG SECTIONS ───────────────────────────────────────────────────
export const songSectionTypes = ["verse", "chorus", "bridge", "pre_chorus", "ending", "tag", "intro"] as const;
export type SongSectionType = (typeof songSectionTypes)[number];

export const songsTable = pgTable("songs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  originalTitle: text("original_title"),
  artistAuthor: text("artist_author"),
  key: text("key"),
  bpm: integer("bpm"),
  category: text("category").notNull().default("Worship"),
  tags: jsonb("tags").$type<string[]>().default([]),
  language: text("language").default("english"), // e.g., "english", "telugu", "hindi", "tamil", "malayalam", "kannada"
  defaultThemeId: uuid("default_theme_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSongSchema = createInsertSchema(songsTable);
export const selectSongSchema = createSelectSchema(songsTable);
export type InsertSong = typeof songsTable.$inferInsert;
export type Song = typeof songsTable.$inferSelect;

export const songSectionsTable = pgTable("song_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  songId: uuid("song_id").notNull().references(() => songsTable.id, { onDelete: "cascade" }),
  type: text("type", { enum: songSectionTypes }).notNull(),
  sectionNumber: integer("section_number").notNull().default(1),
  label: text("label").notNull(),
  hotkey: text("hotkey"),
  lyricsPrimary: text("lyrics_primary").notNull(),
  lyricsSecondary: text("lyrics_secondary"),
  orderIndex: integer("order_index").notNull(),
});

export const insertSongSectionSchema = createInsertSchema(songSectionsTable);
export const selectSongSectionSchema = createSelectSchema(songSectionsTable);
export type InsertSongSection = typeof songSectionsTable.$inferInsert;
export type SongSection = typeof songSectionsTable.$inferSelect;

// ── 3. THEMES & BACKGROUNDS ────────────────────────────────────────────────────
export const themesTable = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  fontFamily: text("font_family").notNull().default("Noto Sans Telugu"),
  fontSize: integer("font_size").notNull().default(56),
  fontWeight: text("font_weight").notNull().default("bold"),
  textAlign: text("text_align").notNull().default("center"),
  textColor: text("text_color").notNull().default("#ffffff"),
  shadow: boolean("shadow").notNull().default(true),
  outline: boolean("outline").notNull().default(false),
  outlineWidth: integer("outline_width").notNull().default(2),
  background: jsonb("background").$type<{
    type: "solid" | "gradient" | "image";
    color: string;
    gradientStart: string;
    gradientEnd: string;
    gradientDirection: string;
    imageUrl: string | null;
  }>().notNull(),
  transition: jsonb("transition").$type<{
    type: "fade" | "slide" | "crossfade";
    duration: number;
  }>().notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertThemeSchema = createInsertSchema(themesTable);
export const selectThemeSchema = createSelectSchema(themesTable);
export type InsertTheme = typeof themesTable.$inferInsert;
export type Theme = typeof themesTable.$inferSelect;

// ── 4. SERVICE PLANS ───────────────────────────────────────────────────────────
export const presentationTypes = ["scripture", "song", "announcement", "countdown", "image", "video"] as const;
export type PresentationType = (typeof presentationTypes)[number];

export const servicePlansTable = pgTable("service_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  serviceDate: timestamp("service_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServicePlanSchema = createInsertSchema(servicePlansTable);
export const selectServicePlanSchema = createSelectSchema(servicePlansTable);
export type InsertServicePlan = typeof servicePlansTable.$inferInsert;
export type ServicePlan = typeof servicePlansTable.$inferSelect;

export const servicePlanItemsTable = pgTable("service_plan_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id").notNull().references(() => servicePlansTable.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  itemType: text("item_type", { enum: presentationTypes }).notNull(),
  payload: jsonb("payload").notNull(),
});

export const insertServicePlanItemSchema = createInsertSchema(servicePlanItemsTable);
export const selectServicePlanItemSchema = createSelectSchema(servicePlanItemsTable);
export type InsertServicePlanItem = typeof servicePlanItemsTable.$inferInsert;
export type ServicePlanItem = typeof servicePlanItemsTable.$inferSelect;