import {
  type Event, type InsertEvent, events,
  type Photo, type InsertPhoto, photos,
  type GuestbookEntry, type InsertGuestbook, guestbookEntries,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, desc } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required. Add a PostgreSQL database to your Railway project.");
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool);

// Auto-create tables on startup
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
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
        id SERIAL PRIMARY KEY,
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
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        guest_name TEXT,
        message TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'text',
        created_at TEXT NOT NULL
      );
    `);
    console.log("[DB] PostgreSQL tables initialized");
  } finally {
    client.release();
  }
}

// Run initialization
initializeDatabase().catch(err => {
  console.error("[DB] Failed to initialize tables:", err);
  process.exit(1);
});

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
    const [result] = await db.insert(events).values({
      ...event,
      createdAt: new Date().toISOString(),
    }).returning();
    return result;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [result] = await db.select().from(events).where(eq(events.id, id));
    return result;
  }

  async getEventByCode(code: string): Promise<Event | undefined> {
    const [result] = await db.select().from(events).where(eq(events.code, code));
    return result;
  }

  async updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | undefined> {
    const [result] = await db.update(events).set(data).where(eq(events.id, id)).returning();
    return result;
  }

  async addPhoto(photo: InsertPhoto): Promise<Photo> {
    const [result] = await db.insert(photos).values({
      ...photo,
      createdAt: new Date().toISOString(),
    }).returning();
    return result;
  }

  async getPhotos(eventId: number): Promise<Photo[]> {
    return db.select().from(photos).where(eq(photos.eventId, eventId)).orderBy(desc(photos.createdAt));
  }

  async likePhoto(photoId: number): Promise<Photo | undefined> {
    const [photo] = await db.select().from(photos).where(eq(photos.id, photoId));
    if (!photo) return undefined;
    const [result] = await db.update(photos).set({ likes: photo.likes + 1 }).where(eq(photos.id, photoId)).returning();
    return result;
  }

  async deletePhoto(photoId: number): Promise<void> {
    await db.delete(photos).where(eq(photos.id, photoId));
  }

  async addGuestbookEntry(entry: InsertGuestbook): Promise<GuestbookEntry> {
    const [result] = await db.insert(guestbookEntries).values({
      ...entry,
      createdAt: new Date().toISOString(),
    }).returning();
    return result;
  }

  async getGuestbookEntries(eventId: number): Promise<GuestbookEntry[]> {
    return db.select().from(guestbookEntries).where(eq(guestbookEntries.eventId, eventId)).orderBy(desc(guestbookEntries.createdAt));
  }
}

export const storage = new DatabaseStorage();
