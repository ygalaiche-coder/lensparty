import { useState } from "react";
import { useParams, Link } from "wouter";
import JSZip from "jszip";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  QrCode,
  Images,
  BookOpen,
  Settings,
  Trash2,
  Heart,
  Copy,
  MonitorPlay,
  Users,
  Download,
  ArrowLeft,
  Loader2,
  Calendar,
  Sparkles,
  Printer,
  Play,
} from "lucide-react";
import type { Event, Photo, GuestbookEntry } from "@shared/schema";

function LensLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="LensParty logo">
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="16" r="8" fill="hsl(262 83% 58%)" opacity="0.15"/>
      <circle cx="16" cy="16" r="5" fill="hsl(262 83% 58%)"/>
      <circle cx="16" cy="16" r="2.5" fill="white"/>
      <circle cx="21" cy="11" r="1.5" fill="hsl(330 80% 60%)"/>
    </svg>
  );
}

type PhotoWithoutData = Omit<Photo, "fileData">;

// Download all photos as a ZIP file
async function downloadAllPhotos(photos: PhotoWithoutData[], eventName: string) {
  if (photos.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder(eventName.replace(/[^a-z0-9]/gi, "_") || "LensParty_Event");

  const toastEl = document.createElement("div");
  toastEl.style.cssText = "position:fixed;bottom:20px;right:20px;background:#7C3AED;color:white;padding:12px 20px;border-radius:12px;font-size:14px;z-index:9999;font-family:sans-serif;";
  toastEl.textContent = "⬇️ Preparing download...";
  document.body.appendChild(toastEl);

  try {
    let downloaded = 0;
    for (const photo of photos) {
      const url = (photo as any).fileUrl || `/api/photos/${photo.id}/data`;
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          // Legacy base64 response
          const data = await res.json();
          const base64 = data.fileData;
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const ext = photo.mimeType?.split("/")[1] || "jpg";
          folder?.file(`photo-${photo.id}-${photo.guestName || "guest"}.${ext}`, bytes);
        } else {
          // Direct image/video from R2
          const blob = await res.blob();
          const ext = photo.fileName?.split(".").pop() || "jpg";
          folder?.file(`photo-${photo.id}-${photo.guestName || "guest"}.${ext}`, blob);
        }
        downloaded++;
        toastEl.textContent = `⬇️ Downloading ${downloaded}/${photos.length}...`;
      } catch {
        // Skip failed downloads
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${eventName.replace(/[^a-z0-9]/gi, "_")}_photos.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
    toastEl.textContent = `✅ Downloaded ${downloaded} photos!`;
    setTimeout(() => toastEl.remove(), 3000);
  } catch (e) {
    toastEl.textContent = "❌ Download failed. Try again.";
    setTimeout(() => toastEl.remove(), 3000);
  }
}

export default function EventDashboard() {
  const params = useParams<{ id: string }>();
  const eventId = parseInt(params.id || "0");
  const { toast } = useToast();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("photos");

  // Fetch event
  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ["/api/events", eventId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/events/${eventId}`);
      return res.json();
    },
    enabled: !!eventId,
  });

  // Fetch QR code
  const { data: qrData } = useQuery<{ qrCode: string; guestUrl: string }>({
    queryKey: ["/api/events", eventId, "qr"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/events/${eventId}/qr`);
      return res.json();
    },
    enabled: !!eventId,
  });

  // Fetch photos
  const { data: photos = [], isLoading: photosLoading } = useQuery<PhotoWithoutData[]>({
    queryKey: ["/api/events", eventId, "photos"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/events/${eventId}/photos`);
      return res.json();
    },
    enabled: !!eventId,
    refetchInterval: 10000,
  });

  // Fetch guestbook
  const { data: guestbook = [], isLoading: guestbookLoading } = useQuery<GuestbookEntry[]>({
    queryKey: ["/api/events", eventId, "guestbook"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/events/${eventId}/guestbook`);
      return res.json();
    },
    enabled: !!eventId,
  });

  // Delete photo
  const deleteMutation = useMutation({
    mutationFn: async (photoId: number) => {
      await apiRequest("DELETE", `/api/photos/${photoId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/events", eventId, "photos"] });
      toast({ title: "Photo deleted" });
    },
  });

  // Update event settings
  const settingsMutation = useMutation({
    mutationFn: async (data: Partial<Event>) => {
      const res = await apiRequest("PATCH", `/api/events/${eventId}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/events", eventId] });
      toast({ title: "Settings updated" });
    },
  });

  const copyUrl = () => {
    if (qrData?.guestUrl) {
      navigator.clipboard.writeText(qrData.guestUrl);
      toast({ title: "Link copied!", description: "Guest upload link copied to clipboard." });
    }
  };

  // Unique guest names
  const guestCount = new Set(photos.map(p => p.guestName).filter(Boolean)).size;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch { return dateStr; }
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Skeleton className="h-10 w-72 mb-4" />
        <Skeleton className="h-6 w-48 mb-8" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">Event not found</p>
          <Link href="/create"><Button>Create an Event</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <style>{`@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap');`}</style>

      {/* Header */}
      <header className="h-16 border-b border-border flex items-center px-6 gap-4 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/">
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4" />
            <LensLogo size={20} />
            <span className="font-display font-bold text-sm">LensParty</span>
          </button>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <Link href={`/slideshow/${eventId}`}>
            <Button variant="outline" size="sm" className="gap-2" data-testid="button-open-slideshow">
              <MonitorPlay className="w-4 h-4" />
              {t("dashboard.slideshow")}
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 gap-8 flex flex-col">
        {/* Event header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display font-bold text-xl text-foreground" data-testid="text-event-name">{event.name}</h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  event.plan === "pro"
                    ? "bg-primary/10 text-primary"
                    : event.plan === "business"
                    ? "bg-green-500/10 text-green-600"
                    : "bg-muted text-muted-foreground"
                }`}
                data-testid="badge-plan"
              >
                {event.plan || "free"}
              </span>
            </div>
            {event.eventDate && (
              <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground text-sm">
                <Calendar className="w-4 h-4" />
                {formatDate(event.eventDate)}
              </div>
            )}
          </div>
          {(!event.plan || event.plan === "free") && (
            <Link href={`/upgrade/${eventId}`}>
              <Button size="sm" className="gap-1.5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground font-display font-semibold shadow-lg shadow-primary/20" data-testid="button-upgrade">
                <Sparkles className="w-3.5 h-3.5" />
                {t("dashboard.upgrade")}
              </Button>
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Images, label: t("dashboard.photos"), value: photos.length },
            { icon: Users, label: t("dashboard.guests"), value: guestCount },
            { icon: QrCode, label: t("dashboard.qrScans"), value: "—" },
          ].map(({ icon: Icon, label, value }, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-1" data-testid={`stat-${label.toLowerCase()}`}>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
              </div>
              <div className="font-display font-bold text-xl text-foreground">{value}</div>
            </div>
          ))}
        </div>

        {/* QR code card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-md flex flex-col sm:flex-row gap-6 items-center">
          <div className="bg-white rounded-xl p-4 shadow-inner border border-border flex-shrink-0">
            {qrData ? (
              <img src={qrData.qrCode} alt="QR code" className="w-36 h-36" data-testid="img-qr-code" />
            ) : (
              <Skeleton className="w-36 h-36 rounded-lg" />
            )}
          </div>
          <div className="flex flex-col gap-3 flex-1 text-center sm:text-left">
            <div>
              <h2 className="font-display font-bold text-base text-foreground mb-1">{t("dashboard.shareQR")}</h2>
              <p className="text-muted-foreground text-sm">{t("dashboard.shareQRDesc")}</p>
            </div>
            {qrData && (
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 max-w-sm">
                <code className="text-xs text-foreground flex-1 truncate" data-testid="text-guest-url">{qrData.guestUrl}</code>
                <button onClick={copyUrl} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0" data-testid="button-copy-url">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyUrl}
                className="gap-1.5"
                data-testid="button-copy-link"
              >
                <Copy className="w-3.5 h-3.5" />
                {t("dashboard.copyLink")}
              </Button>
              {qrData && (
                <a href={qrData.qrCode} download="lensparty-qr.png">
                  <Button variant="outline" size="sm" className="gap-1.5" data-testid="button-download-qr">
                    <Download className="w-3.5 h-3.5" />
                    {t("dashboard.downloadQR")}
                  </Button>
                </a>
              )}
              <Link href={`/event/${eventId}/print`}>
                <Button variant="outline" size="sm" className="gap-1.5" data-testid="button-print-templates">
                  <Printer className="w-3.5 h-3.5" />
                  {t("dashboard.printTemplates")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="photos" className="gap-2 font-display" data-testid="tab-photos">
              <Images className="w-4 h-4" />
              {t("dashboard.photos")} ({photos.length})
            </TabsTrigger>
            <TabsTrigger value="guestbook" className="gap-2 font-display" data-testid="tab-guestbook">
              <BookOpen className="w-4 h-4" />
              {t("dashboard.guestbook")} ({guestbook.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 font-display" data-testid="tab-settings">
              <Settings className="w-4 h-4" />
              {t("dashboard.settings")}
            </TabsTrigger>
          </TabsList>

          {/* Photos Tab */}
          <TabsContent value="photos">
            {photosLoading ? (
              <div className="photo-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-xl mb-3" />
                ))}
              </div>
            ) : photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Images className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="font-display font-semibold text-base text-foreground mb-1">{t("dashboard.noPhotos")}</p>
                <p className="text-muted-foreground text-sm max-w-xs">{t("dashboard.noPhotosDesc")}</p>
              </div>
            ) : (
              <>
                {/* Download All bar */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">{photos.length} photo{photos.length !== 1 ? "s" : ""}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 font-display font-semibold"
                    data-testid="button-download-all"
                    onClick={() => downloadAllPhotos(photos, event.name)}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download All
                  </Button>
                </div>
                <div className="photo-grid">
                  {photos.map(photo => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      onDelete={() => deleteMutation.mutate(photo.id)}
                      deleting={deleteMutation.isPending}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Guestbook Tab */}
          <TabsContent value="guestbook">
            {guestbookLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            ) : guestbook.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <BookOpen className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="font-display font-semibold text-base text-foreground mb-1">{t("dashboard.noMessages")}</p>
                <p className="text-muted-foreground text-sm">{t("dashboard.noMessagesDesc")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {guestbook.map(entry => (
                  <div key={entry.id} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-semibold text-sm text-foreground">{entry.guestName || "Anonymous Guest"}</span>
                      <span className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-foreground">{entry.message}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="flex flex-col gap-5 max-w-md">
              <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
                <h3 className="font-display font-semibold text-base text-foreground">{t("dashboard.eventSettings")}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-semibold text-sm">{t("dashboard.moderation")}</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.moderationDesc")}</p>
                  </div>
                  <Switch
                    checked={!!event.moderationEnabled}
                    onCheckedChange={(v) => settingsMutation.mutate({ moderationEnabled: v ? 1 : 0 })}
                    data-testid="switch-moderation"
                  />
                </div>
                <div className="w-full h-px bg-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-semibold text-sm">{t("dashboard.guestbookToggle")}</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.guestbookToggleDesc")}</p>
                  </div>
                  <Switch
                    checked={!!event.guestbookEnabled}
                    onCheckedChange={(v) => settingsMutation.mutate({ guestbookEnabled: v ? 1 : 0 })}
                    data-testid="switch-guestbook"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PhotoCard({
  photo,
  onDelete,
  deleting,
}: {
  photo: PhotoWithoutData;
  onDelete: () => void;
  deleting: boolean;
}) {
  const [mediaSrc, setMediaSrc] = useState<string | null>(
    (photo as any).fileUrl || null
  );
  const [loaded, setLoaded] = useState(false);
  const isVideo = photo.mimeType?.startsWith("video/");

  const { isLoading } = useQuery({
    queryKey: ["/api/photos", photo.id, "data"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/photos/${photo.id}/data`);
      const data = await res.json();
      const src = `data:${data.mimeType};base64,${data.fileData}`;
      setMediaSrc(src);
      return src;
    },
    staleTime: Infinity,
    enabled: !(photo as any).fileUrl,
  });

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden group relative" data-testid={`card-photo-${photo.id}`}>
      {/* Media */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {isLoading && <Skeleton className="w-full h-full" />}
        {mediaSrc && isVideo ? (
          <video
            src={mediaSrc}
            controls
            playsInline
            muted
            preload="metadata"
            className={`w-full h-full object-cover ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoadedData={() => setLoaded(true)}
            data-testid={`video-player-${photo.id}`}
          />
        ) : mediaSrc ? (
          <img
            src={mediaSrc}
            alt={photo.caption || "Photo"}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
          />
        ) : null}
        {/* Video badge */}
        {isVideo && mediaSrc && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md pointer-events-none">
            <Play className="w-2.5 h-2.5 fill-current" />
            Video
          </div>
        )}
      </div>

      {/* Overlay buttons: Delete + Download */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        {/* Download */}
        {mediaSrc && (
          <a
            href={mediaSrc}
            download={photo.fileName || `photo-${photo.id}`}
            className="w-7 h-7 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            data-testid={`button-download-photo-${photo.id}`}
            onClick={e => e.stopPropagation()}
          >
            <Download className="w-3 h-3" />
          </a>
        )}
        {/* Delete */}
        <button
          onClick={onDelete}
          disabled={deleting}
          className="w-7 h-7 rounded-lg bg-destructive/90 text-destructive-foreground flex items-center justify-center hover:bg-destructive transition-colors"
          data-testid={`button-delete-photo-${photo.id}`}
        >
          {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
        </button>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          {photo.guestName && (
            <p className="text-xs font-semibold text-foreground truncate">{photo.guestName}</p>
          )}
          {photo.caption && (
            <p className="text-xs text-muted-foreground truncate">{photo.caption}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Heart className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs text-muted-foreground" data-testid={`text-likes-${photo.id}`}>{photo.likes}</span>
        </div>
      </div>
    </div>
  );
}
