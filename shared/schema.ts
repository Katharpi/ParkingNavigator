import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Parking spaces table
export const parkingSpaces = pgTable("parking_spaces", {
  id: serial("id").primaryKey(),
  spaceNumber: varchar("space_number").notNull().unique(),
  section: varchar("section").notNull(),
  status: varchar("status").notNull().default("available"), // available, occupied, maintenance
  lastUpdated: timestamp("last_updated").defaultNow(),
  occupiedBy: varchar("occupied_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Parking history for analytics
export const parkingHistory = pgTable("parking_history", {
  id: serial("id").primaryKey(),
  spaceId: serial("space_id").references(() => parkingSpaces.id),
  action: varchar("action").notNull(), // occupied, freed, maintenance
  timestamp: timestamp("timestamp").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertParkingSpaceSchema = createInsertSchema(parkingSpaces).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const updateParkingSpaceSchema = createInsertSchema(parkingSpaces).omit({
  id: true,
  createdAt: true,
  spaceNumber: true,
  section: true,
}).partial();

export type InsertParkingSpace = z.infer<typeof insertParkingSpaceSchema>;
export type UpdateParkingSpace = z.infer<typeof updateParkingSpaceSchema>;
export type ParkingSpace = typeof parkingSpaces.$inferSelect;
export type ParkingHistory = typeof parkingHistory.$inferSelect;
