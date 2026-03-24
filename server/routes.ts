import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertPhotoSchema, insertGuestbookSchema } from "@shared/schema";
import QRCode from "qrcode";
import { isCloudStorageEnabled, uploadToR2, deleteFromR2 } from "./r2";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Health check for Railway
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      cloudStorage: isCloudStorageEnabled(),
    });
  });

  // Create event
  app.post("/api/events", async (req, res) => {
    try {
      const body = insertEventSchema.parse({
        ...req.body,
        code: generateCode(),
      });
      const event = await storage.createEvent(body);
      res.json(event);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Get event by ID (host view)
  app.get("/api/events/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const event = await storage.getEvent(id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  });

  // Get event by code (guest view)
  app.get("/api/events/code/:code", async (req, res) => {
    const event = await storage.getEventByCode(req.params.code.toUpperCase());
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  });

  // Update event settings
  app.patch("/api/events/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const event = await storage.updateEvent(id, req.body);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  });

  // Generate QR code for event
  app.get("/api/events/:id/qr", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const event = await storage.getEvent(id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const guestUrl = `${baseUrl}/#/g/${event.code}`;
    const qrDataUri = await QRCode.toDataURL(guestUrl, {
      width: 512,
      margin: 2,
      color: { dark: "#1a1a2e", light: "#ffffff" },
    });
    res.json({ qrCode: qrDataUri, guestUrl });
  });

  // Upload photos — supports both R2 cloud storage and legacy base64
  app.post("/api/events/:id/photos", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) return res.status(400).json({ error: "Invalid ID" });
      const event = await storage.getEvent(eventId);
      if (!event) return res.status(404).json({ error: "Event not found" });

      const { photos: photoList } = req.body;
      if (!Array.isArray(photoList) || photoList.length === 0) {
        return res.status(400).json({ error: "No photos provided" });
      }

      const useCloud = isCloudStorageEnabled();
      const saved = [];

      for (const p of photoList) {
        let fileUrl: string | null = null;
        let fileData: string | null = null;

        if (useCloud) {
          // Convert base64 to buffer and upload to R2
          const buffer = Buffer.from(p.fileData, "base64");
          fileUrl = await uploadToR2(buffer, p.mimeType, eventId, p.fileName);
        } else {
          // Legacy: store base64 in database
          fileData = p.fileData;
        }

        const photo = await storage.addPhoto({
          eventId,
          guestName: p.guestName || null,
          fileName: p.fileName,
          fileData,
          fileUrl,
          mimeType: p.mimeType,
          caption: p.caption || null,
        });
        saved.push(photo);
      }
      res.json(saved);
    } catch (e: any) {
      console.error("Photo upload error:", e);
      res.status(400).json({ error: e.message });
    }
  });

  // Get photos for event (lightweight listing — no base64 data)
  app.get("/api/events/:id/photos", async (req, res) => {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) return res.status(400).json({ error: "Invalid ID" });
    const eventPhotos = await storage.getPhotos(eventId);
    // Return photos without fileData (save bandwidth), but include fileUrl
    const lite = eventPhotos.map(({ fileData, ...rest }) => rest);
    res.json(lite);
  });

  // Get single photo data (legacy base64 fallback)
  app.get("/api/photos/:id/data", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const { db } = await import("./storage");
    const { photos: photosTable } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const photo = db.select().from(photosTable).where(eq(photosTable.id, id)).get();
    if (!photo) return res.status(404).json({ error: "Photo not found" });

    // If photo has a fileUrl (R2), redirect to it
    if (photo.fileUrl) {
      return res.redirect(photo.fileUrl);
    }

    // Legacy: return base64 data
    res.json({ fileData: photo.fileData, mimeType: photo.mimeType });
  });

  // Like photo
  app.post("/api/photos/:id/like", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const photo = await storage.likePhoto(id);
    if (!photo) return res.status(404).json({ error: "Photo not found" });
    res.json(photo);
  });

  // Delete photo (also removes from R2 if applicable)
  app.delete("/api/photos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    // Get photo first to check for R2 URL
    const { db } = await import("./storage");
    const { photos: photosTable } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const photo = db.select().from(photosTable).where(eq(photosTable.id, id)).get();

    if (photo?.fileUrl) {
      await deleteFromR2(photo.fileUrl);
    }

    await storage.deletePhoto(id);
    res.json({ success: true });
  });

  // Guestbook entries
  app.post("/api/events/:id/guestbook", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) return res.status(400).json({ error: "Invalid ID" });
      const entry = await storage.addGuestbookEntry({
        eventId,
        guestName: req.body.guestName || null,
        message: req.body.message,
        type: req.body.type || "text",
      });
      res.json(entry);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/events/:id/guestbook", async (req, res) => {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) return res.status(400).json({ error: "Invalid ID" });
    const entries = await storage.getGuestbookEntries(eventId);
    res.json(entries);
  });

  return httpServer;
}
