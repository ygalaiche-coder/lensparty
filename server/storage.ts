import {
  type Event, type InsertEvent, events,
  type Photo, type InsertPhoto, photos,
  type GuestbookEntry, type InsertGuestbook, guestbookEntries,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

// Auto-create tables on startup
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    event_date TEXT,
    event_type TEXT NOT NULL DEFAULT 'other',
    description TEXT,
    code TEXT NOT NULL UNIQUE,
    host_name TEXT,
    theme TEXT NOT NULL DEFAULT 'default',
    moderation_enabled INTEGER NOT NULL DEFAULT 0,
    guestbook_enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    guest_name TEXT,
    file_name TEXT NOT NULL,
    file_data TEXT,
    file_url TEXT,
    mime_type TEXT NOT NULL,
    caption TEXT,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS guestbook_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    guest_name TEXT,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    created_at TEXT NOT NULL
  );
`);
console.log("[DB] Tables initialized");

export const db = drizzle(sqlite);

export interface IStorage {
  // Events
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventByCode(code: string): Promise<Event | undefined>;
  updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | undefined>;

  // Photos
  addPhoto(photo: InsertPhoto): Promise<Photo>;
  getPhotos(eventId: number): Promise<Photo[]>;
  likePhoto(photoId: number): Promise<Photo | undefined>;
  deletePhoto(photoId: number): Promise<void>;

  // Guestbook
  addGuestbookEntry(entry: InsertGuestbook): Promise<GuestbookEntry>;
  getGuestbookEntries(eventId: number): Promise<GuestbookEntry[]>;
}

export class DatabaseStorage implements IStorage {
  async createEvent(event: InsertEvent): Promise<Event> {
    return db.insert(events).values({
      ...event,
      createdAt: new Date().toISOString(),
    }).returning().get();
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return db.select().from(events).where(eq(events.id, id)).get();
  }

  async getEventByCode(code: string): Promise<Event | undefined> {
    return db.select().from(events).where(eq(events.code, code)).get();
  }

  async updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | undefined> {
    return db.update(events).set(data).where(eq(events.id, id)).returning().get();
  }

  async addPhoto(photo: InsertPhoto): Promise<Photo> {
    return db.insert(photos).values({
      ...photo,
      createdAt: new Date().toISOString(),
    }).returning().get();
  }

  async getPhotos(eventId: number): Promise<Photo[]> {
    return db.select().from(photos).where(eq(photos.eventId, eventId)).orderBy(desc(photos.createdAt)).all();
  }

  async likePhoto(photoId: number): Promise<Photo | undefined> {
    const photo = db.select().from(photos).where(eq(photos.id, photoId)).get();
    if (!photo) return undefined;
    return db.update(photos).set({ likes: photo.likes + 1 }).where(eq(photos.id, photoId)).returning().get();
  }

  async deletePhoto(photoId: number): Promise<void> {
    db.delete(photos).where(eq(photos.id, photoId)).run();
  }

  async addGuestbookEntry(entry: InsertGuestbook): Promise<GuestbookEntry> {
    return db.insert(guestbookEntries).values({
      ...entry,
      createdAt: new Date().toISOString(),
    }).returning().get();
  }

  async getGuestbookEntries(eventId: number): Promise<GuestbookEntry[]> {
    return db.select().from(guestbookEntries).where(eq(guestbookEntries.eventId, eventId)).orderBy(desc(guestbookEntries.createdAt)).all();
  }
}

export const storage = new DatabaseStorage();
