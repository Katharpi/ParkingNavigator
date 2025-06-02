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

// User storage table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username").notNull().unique(),
  password: varchar("password").notNull(),
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
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
  spaceId: serial("space_id").references(() => parkingSpaces.id).notNull(),
  action: varchar("action").notNull(), // occupied, freed, maintenance
  timestamp: timestamp("timestamp").defaultNow(),
  userId: serial("user_id").references(() => users.id).notNull(),
});

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

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
