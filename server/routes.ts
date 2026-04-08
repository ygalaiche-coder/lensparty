import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage, pool } from "./storage";
import { insertEventSchema, insertPhotoSchema, insertGuestbookSchema } from "@shared/schema";
import QRCode from "qrcode";
import { isCloudStorageEnabled, uploadToR2, deleteFromR2 } from "./r2";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isPaymentsEnabled, getStripe, PLANS } from "./stripe";

const JWT_SECRET = process.env.JWT_SECRET || "lensparty-dev-secret-change-in-production";
const COOKIE_NAME = "lensparty_token";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
      req.userId = payload.userId;
    } catch (_e) {
      // Invalid token — ignore, proceed as unauthenticated
    }
  }
  next();
}

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

  // --- Auth routes ---

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password, and name are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      const existing = await storage.getUserByEmail(email.toLowerCase().trim());
      if (existing) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name.trim(),
      });
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
      });
      res.json({ id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email.toLowerCase().trim());
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
      });
      res.json({ id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/logout", (_req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ success: true });
  });

  app.get("/api/auth/me", optionalAuth, async (req, res) => {
    if (!req.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await storage.getUserById(req.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    const userEvents = await storage.getEventsByUserId(user.id);
    res.json({ id: user.id, email: user.email, name: user.name, eventsCount: userEvents.length, isAdmin: user.isAdmin });
  });

  // --- My events route ---

  app.get("/api/my/events", optionalAuth, async (req, res) => {
    if (!req.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userEvents = await storage.getEventsByUserId(req.userId);
    // Attach photo count per event
    const eventsWithCounts = await Promise.all(
      userEvents.map(async (event) => {
        const eventPhotos = await storage.getPhotos(event.id);
        return { ...event, photoCount: eventPhotos.length };
      })
    );
    res.json(eventsWithCounts);
  });

  // Create event
  app.post("/api/events", optionalAuth, async (req, res) => {
    try {
      const body = insertEventSchema.parse({
        ...req.body,
        code: generateCode(),
        userId: req.userId || null,
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
    const [photo] = await db.select().from(photosTable).where(eq(photosTable.id, id));
    if (!photo) return res.status(404).json({ error: "Photo not found" });

    // If photo has a fileUrl (R2), redirect to it
    if (photo.fileUrl) {
      return res.redirect(photo.fileUrl);
    }

    // Legacy: return base64 data
    res.json({ fileData: photo.fileData, mimeType: photo.mimeType });
  });

  // Serve photos from R2 (when no public URL is configured)
  app.get("/api/photos/r2/:eventPath/:eventId/:filename", async (req, res) => {
    try {
      const key = `${req.params.eventPath}/${req.params.eventId}/${req.params.filename}`;

      const { getObjectStream } = await import("./r2");
      const { stream, contentType } = await getObjectStream(key);

      res.setHeader("Content-Type", contentType || "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

      // Pipe the R2 stream directly to the response
      const nodeStream = stream as any;
      nodeStream.pipe(res);
    } catch (e: any) {
      console.error("R2 proxy error:", e);
      res.status(500).json({ error: "Failed to load photo" });
    }
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
    const [photo] = await db.select().from(photosTable).where(eq(photosTable.id, id));

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

  // --- Demo route ---

  app.post("/api/demo/create", async (_req, res) => {
    try {
      const code = generateCode();
      const event = await storage.createEvent({
        name: "Demo Event ✨",
        eventType: "other",
        description: "Try LensParty — upload photos and see the magic!",
        hostName: "Demo Host",
        code,
        isDemo: 1,
        userId: null,
      });
      res.json(event);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- Admin routes ---

  const ADMIN_SECRET = process.env.ADMIN_SECRET || "lensparty-admin-2026";

  async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
      const user = await storage.getUserById(payload.userId);
      if (!user) return res.status(401).json({ error: "User not found" });
      if (user.isAdmin !== 1) return res.status(403).json({ error: "Admin access required" });
      req.userId = user.id;
      next();
    } catch (_e) {
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  // Bootstrap first admin (only works when zero admins exist)
  app.post("/api/admin/bootstrap", async (req, res) => {
    try {
      const { email, secret } = req.body;
      if (!email || !secret) return res.status(400).json({ error: "Email and secret are required" });
      if (secret !== ADMIN_SECRET) return res.status(403).json({ error: "Invalid secret" });
      const { rows: admins } = await pool.query("SELECT id FROM users WHERE is_admin = 1 LIMIT 1");
      if (admins.length > 0) return res.status(403).json({ error: "Admin already exists. Use /api/admin/promote instead." });
      const user = await storage.getUserByEmail(email.toLowerCase().trim());
      if (!user) return res.status(404).json({ error: "User not found" });
      await pool.query("UPDATE users SET is_admin = 1 WHERE id = $1", [user.id]);
      res.json({ id: user.id, email: user.email, name: user.name, isAdmin: 1 });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin stats overview
  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [usersR, eventsR, photosR, paidR, demoR, newUsersR, newEventsR] = await Promise.all([
        pool.query("SELECT COUNT(*) as count FROM users"),
        pool.query("SELECT COUNT(*) as count FROM events WHERE is_demo = 0"),
        pool.query("SELECT COUNT(*) as count FROM photos"),
        pool.query("SELECT COUNT(*) as count, COALESCE(SUM(CASE WHEN plan='pro' THEN 19.99 WHEN plan='business' THEN 39.99 ELSE 0 END), 0) as revenue FROM events WHERE stripe_payment_id IS NOT NULL"),
        pool.query("SELECT COUNT(*) as count FROM events WHERE is_demo = 1"),
        pool.query("SELECT COUNT(*) as count FROM users WHERE created_at >= $1", [monthStart]),
        pool.query("SELECT COUNT(*) as count FROM events WHERE created_at >= $1 AND is_demo = 0", [monthStart]),
      ]);

      const paidCount = parseInt(paidR.rows[0].count);
      const totalRevenue = parseFloat(paidR.rows[0].revenue);
      const totalEvents = parseInt(eventsR.rows[0].count);

      // Revenue this month
      const revenueMonthR = await pool.query(
        "SELECT COALESCE(SUM(CASE WHEN plan='pro' THEN 19.99 WHEN plan='business' THEN 39.99 ELSE 0 END), 0) as revenue FROM events WHERE stripe_payment_id IS NOT NULL AND paid_at >= $1",
        [monthStart]
      );

      res.json({
        totalUsers: parseInt(usersR.rows[0].count),
        totalEvents,
        totalPhotos: parseInt(photosR.rows[0].count),
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        paidEvents: paidCount,
        freeEvents: totalEvents - paidCount,
        demoEvents: parseInt(demoR.rows[0].count),
        newUsersThisMonth: parseInt(newUsersR.rows[0].count),
        newEventsThisMonth: parseInt(newEventsR.rows[0].count),
        revenueThisMonth: Math.round(parseFloat(revenueMonthR.rows[0].revenue) * 100) / 100,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin users list
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const search = (req.query.search as string) || "";
      const limit = 50;
      const offset = (page - 1) * limit;

      let whereClause = "";
      const params: any[] = [];
      if (search) {
        whereClause = "WHERE u.email ILIKE $1 OR u.name ILIKE $1";
        params.push(`%${search}%`);
      }

      const countR = await pool.query(`SELECT COUNT(*) as count FROM users u ${whereClause}`, params);
      const total = parseInt(countR.rows[0].count);

      const usersR = await pool.query(
        `SELECT u.id, u.email, u.name, u.is_admin, u.created_at,
          COUNT(e.id) FILTER (WHERE e.id IS NOT NULL) as event_count,
          COUNT(e.id) FILTER (WHERE e.stripe_payment_id IS NOT NULL) as paid_event_count,
          COALESCE(SUM(CASE WHEN e.plan='pro' THEN 19.99 WHEN e.plan='business' THEN 39.99 ELSE 0 END) FILTER (WHERE e.stripe_payment_id IS NOT NULL), 0) as total_spent
        FROM users u
        LEFT JOIN events e ON e.user_id = u.id AND e.is_demo = 0
        ${whereClause}
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      res.json({
        users: usersR.rows.map(r => ({
          id: r.id,
          email: r.email,
          name: r.name,
          createdAt: r.created_at,
          isAdmin: r.is_admin,
          eventCount: parseInt(r.event_count),
          paidEventCount: parseInt(r.paid_event_count),
          totalSpent: Math.round(parseFloat(r.total_spent) * 100) / 100,
        })),
        total,
        page,
        pages: Math.ceil(total / limit),
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin events list
  app.get("/api/admin/events", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const search = (req.query.search as string) || "";
      const planFilter = (req.query.plan as string) || "all";
      const limit = 50;
      const offset = (page - 1) * limit;

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIdx = 1;

      if (search) {
        conditions.push(`(e.name ILIKE $${paramIdx} OR e.code ILIKE $${paramIdx})`);
        params.push(`%${search}%`);
        paramIdx++;
      }
      if (planFilter === "demo") {
        conditions.push("e.is_demo = 1");
      } else if (planFilter !== "all") {
        conditions.push(`e.plan = $${paramIdx} AND e.is_demo = 0`);
        params.push(planFilter);
        paramIdx++;
      }

      const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

      const countR = await pool.query(`SELECT COUNT(*) as count FROM events e ${whereClause}`, params);
      const total = parseInt(countR.rows[0].count);

      const eventsR = await pool.query(
        `SELECT e.id, e.name, e.event_type, e.code, e.plan, e.paid_at, e.stripe_payment_id,
          e.created_at, e.host_name, e.is_demo,
          u.email as host_email,
          COUNT(p.id) as photo_count
        FROM events e
        LEFT JOIN users u ON u.id = e.user_id
        LEFT JOIN photos p ON p.event_id = e.id
        ${whereClause}
        GROUP BY e.id, u.email
        ORDER BY e.created_at DESC
        LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
        [...params, limit, offset]
      );

      res.json({
        events: eventsR.rows.map(r => ({
          id: r.id,
          name: r.name,
          eventType: r.event_type,
          code: r.code,
          plan: r.plan,
          photoCount: parseInt(r.photo_count),
          paidAt: r.paid_at,
          stripePaymentId: r.stripe_payment_id,
          createdAt: r.created_at,
          hostEmail: r.host_email,
          hostName: r.host_name,
          isDemo: r.is_demo,
        })),
        total,
        page,
        pages: Math.ceil(total / limit),
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin revenue
  app.get("/api/admin/revenue", requireAdmin, async (_req, res) => {
    try {
      // Monthly revenue (last 12 months)
      const monthlyR = await pool.query(
        `SELECT
          TO_CHAR(TO_TIMESTAMP(paid_at, 'YYYY-MM-DD"T"HH24:MI:SS'), 'Mon') as month,
          EXTRACT(YEAR FROM TO_TIMESTAMP(paid_at, 'YYYY-MM-DD"T"HH24:MI:SS')) as year,
          EXTRACT(MONTH FROM TO_TIMESTAMP(paid_at, 'YYYY-MM-DD"T"HH24:MI:SS')) as month_num,
          COUNT(*) as count,
          COALESCE(SUM(CASE WHEN plan='pro' THEN 19.99 WHEN plan='business' THEN 39.99 ELSE 0 END), 0) as revenue
        FROM events
        WHERE stripe_payment_id IS NOT NULL AND paid_at IS NOT NULL
        GROUP BY month, year, month_num
        ORDER BY year DESC, month_num DESC
        LIMIT 12`
      );

      // Revenue by plan
      const byPlanR = await pool.query(
        `SELECT plan, COUNT(*) as count,
          COALESCE(SUM(CASE WHEN plan='pro' THEN 19.99 WHEN plan='business' THEN 39.99 ELSE 0 END), 0) as revenue
        FROM events
        WHERE stripe_payment_id IS NOT NULL
        GROUP BY plan`
      );

      const byPlan: Record<string, { count: number; revenue: number }> = {};
      for (const r of byPlanR.rows) {
        byPlan[r.plan] = { count: parseInt(r.count), revenue: Math.round(parseFloat(r.revenue) * 100) / 100 };
      }

      // Recent transactions
      const recentR = await pool.query(
        `SELECT e.id, e.name as event_name, e.plan,
          CASE WHEN e.plan='pro' THEN 19.99 WHEN e.plan='business' THEN 39.99 ELSE 0 END as amount,
          e.paid_at, u.email as host_email
        FROM events e
        LEFT JOIN users u ON u.id = e.user_id
        WHERE e.stripe_payment_id IS NOT NULL
        ORDER BY e.paid_at DESC
        LIMIT 10`
      );

      res.json({
        monthly: monthlyR.rows.reverse().map(r => ({
          month: r.month,
          revenue: Math.round(parseFloat(r.revenue) * 100) / 100,
          count: parseInt(r.count),
        })),
        byPlan,
        recent: recentR.rows.map(r => ({
          id: r.id,
          eventName: r.event_name,
          plan: r.plan,
          amount: parseFloat(r.amount),
          paidAt: r.paid_at,
          hostEmail: r.host_email,
        })),
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Update user admin status
  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const { isAdmin } = req.body;
      if (isAdmin !== 0 && isAdmin !== 1) return res.status(400).json({ error: "isAdmin must be 0 or 1" });
      await pool.query("UPDATE users SET is_admin = $1 WHERE id = $2", [isAdmin, id]);
      const user = await storage.getUserById(id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Delete event (admin)
  app.delete("/api/admin/events/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      // Delete photos first, then guestbook entries, then the event
      await pool.query("DELETE FROM photos WHERE event_id = $1", [id]);
      await pool.query("DELETE FROM guestbook_entries WHERE event_id = $1", [id]);
      await pool.query("DELETE FROM events WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Promote user to admin
  app.post("/api/admin/promote", requireAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email is required" });
      const user = await storage.getUserByEmail(email.toLowerCase().trim());
      if (!user) return res.status(404).json({ error: "User not found" });
      await pool.query("UPDATE users SET is_admin = 1 WHERE id = $1", [user.id]);
      res.json({ id: user.id, email: user.email, name: user.name, isAdmin: 1 });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- Payment routes ---

  app.get("/api/plans", (_req, res) => {
    res.json({
      enabled: isPaymentsEnabled(),
      plans: PLANS,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
    });
  });

  app.post("/api/checkout", optionalAuth, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const stripe = getStripe();
      if (!stripe) {
        return res.status(503).json({ error: "Payments not available" });
      }
      const { plan, eventId } = req.body;
      if (!plan || !eventId) {
        return res.status(400).json({ error: "Plan and eventId are required" });
      }
      if (plan !== "pro" && plan !== "business") {
        return res.status(400).json({ error: "Invalid plan" });
      }
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      if (event.userId !== req.userId) {
        return res.status(403).json({ error: "Not your event" });
      }
      const planInfo = PLANS[plan];
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: planInfo.name },
              unit_amount: planInfo.price,
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/#/payment-success`,
        cancel_url: `${baseUrl}/#/event/${eventId}`,
        metadata: {
          eventId: String(eventId),
          userId: String(req.userId),
          plan,
        },
      });
      res.json({ url: session.url });
    } catch (e: any) {
      console.error("Checkout error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/webhooks/stripe", async (req, res) => {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ error: "Payments not available" });
    }
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    try {
      let event;
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        event = JSON.parse(req.body.toString());
      }
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const eventId = parseInt(session.metadata?.eventId);
        const plan = session.metadata?.plan;
        if (eventId && plan) {
          await storage.updateEvent(eventId, {
            plan,
            stripePaymentId: session.id,
            paidAt: new Date().toISOString(),
          } as any);
        }
      }
      res.json({ received: true });
    } catch (e: any) {
      console.error("Webhook error:", e);
      res.status(400).json({ error: e.message });
    }
  });

  return httpServer;
}
