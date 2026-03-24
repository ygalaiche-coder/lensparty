import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  eventDate: text("event_date"),
  eventType: text("event_type").notNull().default("other"),
  description: text("description"),
  code: text("code").notNull().unique(),
  hostName: text("host_name"),
  theme: text("theme").notNull().default("default"),
  moderationEnabled: integer("moderation_enabled").notNull().default(0),
  guestbookEnabled: integer("guestbook_enabled").notNull().default(1),
  userId: integer("user_id"),
  plan: text("plan").notNull().default("free"),
  stripePaymentId: text("stripe_payment_id"),
  paidAt: text("paid_at"),
  createdAt: text("created_at").notNull(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  guestName: text("guest_name"),
  fileName: text("file_name").notNull(),
  fileData: text("file_data"),
  fileUrl: text("file_url"),
  mimeType: text("mime_type").notNull(),
  caption: text("caption"),
  likes: integer("likes").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const guestbookEntries = pgTable("guestbook_entries", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  guestName: text("guest_name"),
  message: text("message").notNull(),
  type: text("type").notNull().default("text"),
  createdAt: text("created_at").notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  likes: true,
  createdAt: true,
});

export const insertGuestbookSchema = createInsertSchema(guestbookEntries).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertGuestbook = z.infer<typeof insertGuestbookSchema>;
export type GuestbookEntry = typeof guestbookEntries.$inferSelect;
