import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  eventDate: text("event_date"),
  eventType: text("event_type").notNull().default("other"),
  description: text("description"),
  code: text("code").notNull().unique(),
  hostName: text("host_name"),
  theme: text("theme").notNull().default("default"),
  moderationEnabled: integer("moderation_enabled").notNull().default(0),
  guestbookEnabled: integer("guestbook_enabled").notNull().default(1),
  createdAt: text("created_at").notNull(),
});

export const photos = sqliteTable("photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull(),
  guestName: text("guest_name"),
  fileName: text("file_name").notNull(),
  fileData: text("file_data").notNull(),
  mimeType: text("mime_type").notNull(),
  caption: text("caption"),
  likes: integer("likes").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const guestbookEntries = sqliteTable("guestbook_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertGuestbook = z.infer<typeof insertGuestbookSchema>;
export type GuestbookEntry = typeof guestbookEntries.$inferSelect;
