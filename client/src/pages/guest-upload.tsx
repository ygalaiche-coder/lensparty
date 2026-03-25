import { useState, useRef, useCallback } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/language-switcher";
import {
  Upload,
  Heart,
  ImagePlus,
  Loader2,
  Camera,
  MessageSquare,
  Send,
  X,
  CheckCircle2,
  Play,
} from "lucide-react";
import type { Event, Photo, GuestbookEntry } from "@shared/schema";

type PhotoWithoutData = Omit<Photo, "fileData">;

function LensLogo({ size = 26 }: { size?: number }) {
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

interface FilePreview {
  file: File;
  preview: string;
  name: string;
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:mime/type;base64, prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
  });
}

export default function GuestUploadPage() {
  const params = useParams<{ code: string }>();
  const code = params.code?.toUpperCase() || "";
  const { toast } = useToast();
  const { t } = useTranslation();
  const qc = useQueryClient();

  const [guestName, setGuestName] = useState("");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [guestMessage, setGuestMessage] = useState("");
  const [likedPhotos, setLikedPhotos] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch event by code
  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ["/api/events/code", code],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/events/code/${code}`);
      return res.json();
    },
    enabled: !!code,
  });

  // Fetch photos
  const { data: photos = [], isLoading: photosLoading } = useQuery<PhotoWithoutData[]>({
    queryKey: ["/api/events", event?.id, "photos"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/events/${event!.id}/photos`);
      return res.json();
    },
    enabled: !!event?.id,
    refetchInterval: 15000,
  });

  // Fetch guestbook
  const { data: guestbook = [] } = useQuery<GuestbookEntry[]>({
    queryKey: ["/api/events", event?.id, "guestbook"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/events/${event!.id}/guestbook`);
      return res.json();
    },
    enabled: !!event?.id && !!event?.guestbookEnabled,
  });

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"));
    const previews: FilePreview[] = arr.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
    }));
    setFiles(prev => [...prev, ...previews]);
    setUploadDone(false);
  }, []);

  const removeFile = (idx: number) => {
    setFiles(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const uploadFiles = async () => {
    if (!event || files.length === 0) return;
    setUploading(true);
    try {
      const photoList = await Promise.all(files.map(async (fp) => ({
        guestName: guestName || null,
        fileName: fp.name,
        fileData: await toBase64(fp.file),
        mimeType: fp.file.type,
        caption: caption || null,
      })));
      await apiRequest("POST", `/api/events/${event.id}/photos`, { photos: photoList });
      qc.invalidateQueries({ queryKey: ["/api/events", event.id, "photos"] });
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]);
      setCaption("");
      setUploadDone(true);
      toast({ title: "Photos uploaded!", description: `${photoList.length} photo(s) shared with the event.` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // Like photo mutation
  const likeMutation = useMutation({
    mutationFn: async (photoId: number) => {
      const res = await apiRequest("POST", `/api/photos/${photoId}/like`);
      return res.json();
    },
    onSuccess: (_, photoId) => {
      setLikedPhotos(prev => new Set([...prev, photoId]));
      qc.invalidateQueries({ queryKey: ["/api/events", event?.id, "photos"] });
    },
  });

  // Post guestbook message
  const guestbookMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/events/${event!.id}/guestbook`, {
        guestName: guestName || null,
        message: guestMessage,
        type: "text",
      });
      return res.json();
    },
    onSuccess: () => {
      setGuestMessage("");
      qc.invalidateQueries({ queryKey: ["/api/events", event?.id, "guestbook"] });
      toast({ title: "Message sent!" });
    },
  });

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Camera className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="font-display font-bold text-lg text-foreground mb-2">{t("guestUpload.eventNotFound")}</h1>
          <p className="text-muted-foreground text-sm">{t("guestUpload.eventNotFoundDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <style>{`@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap');`}</style>

      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-primary to-purple-700 px-4 py-10 text-center relative overflow-hidden">
        <div className="absolute top-3 right-3 z-10">
          <LanguageSwitcher compact />
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10">
          <div className="absolute top-2 left-8 w-12 h-12 rounded-full bg-white" />
          <div className="absolute bottom-2 right-12 w-8 h-8 rounded-full bg-white" />
        </div>
        <div className="relative">
          <div className="flex items-center justify-center gap-2 mb-3">
            <LensLogo size={24} />
            <span className="font-display font-bold text-white/80 text-sm">LensParty</span>
          </div>
          <h1 className="font-display font-bold text-xl text-white mb-1" data-testid="text-event-name">{event.name}</h1>
          {event.description && (
            <p className="text-white/80 text-sm max-w-xs mx-auto">{event.description}</p>
          )}
          <div className="mt-2 text-white/60 text-xs">{t("guestUpload.sharePhotos")}</div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Name input */}
        <div className="flex flex-col gap-1.5">
          <label className="font-display font-semibold text-sm text-foreground">{t("guestUpload.yourName")} <span className="text-muted-foreground font-normal">({t("guestUpload.yourNameOptional")})</span></label>
          <Input
            placeholder={t("guestUpload.yourNamePlaceholder")}
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            className="h-11 text-base"
            data-testid="input-guest-name"
          />
        </div>

        {/* Upload area */}
        <div className="flex flex-col gap-3">
          <label className="font-display font-semibold text-sm text-foreground">{t("guestUpload.uploadPhotos")}</label>

          {/* Dropzone */}
          <div
            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 gap-3 cursor-pointer transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            data-testid="dropzone-upload"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ImagePlus className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-sm text-foreground">{t("guestUpload.tapToSelect")}</p>
              <p className="text-muted-foreground text-xs mt-1">{t("guestUpload.dragDrop")}</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={e => e.target.files && handleFiles(e.target.files)}
            data-testid="input-file"
          />

          {/* File previews */}
          {files.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {files.map((fp, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-muted" data-testid={`preview-file-${idx}`}>
                  {fp.file.type.startsWith("video/") ? (
                    <>
                      <video src={fp.preview} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 left-1 flex items-center gap-0.5 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md pointer-events-none">
                        <Play className="w-2.5 h-2.5 fill-current" />
                        Video
                      </div>
                    </>
                  ) : (
                    <img src={fp.preview} alt={fp.name} className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                    data-testid={`button-remove-file-${idx}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Caption */}
          {files.length > 0 && (
            <Input
              placeholder={t("guestUpload.addCaption")}
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="h-11 text-base"
              data-testid="input-caption"
            />
          )}

          {/* Upload button */}
          {uploadDone ? (
            <div className="flex items-center justify-center gap-2 py-3 text-green-600 font-display font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              {t("guestUpload.uploadSuccess")}
            </div>
          ) : (
            <Button
              onClick={uploadFiles}
              disabled={files.length === 0 || uploading}
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground font-display font-bold py-5 text-base shadow-md shadow-primary/20"
              data-testid="button-upload"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("guestUpload.uploading")}</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" />{t("guestUpload.uploadButton")} {files.length > 0 ? `(${files.length})` : ""}</>
              )}
            </Button>
          )}
        </div>

        {/* Gallery */}
        <div className="flex flex-col gap-3">
          <h2 className="font-display font-bold text-base text-foreground">{t("guestUpload.eventGallery")}</h2>
          {photosLoading ? (
            <div className="photo-grid">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">{t("guestUpload.beFirst")}</p>
            </div>
          ) : (
            <div className="photo-grid">
              {photos.map(photo => (
                <GuestPhotoCard
                  key={photo.id}
                  photo={photo}
                  liked={likedPhotos.has(photo.id)}
                  onLike={() => !likedPhotos.has(photo.id) && likeMutation.mutate(photo.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Guestbook */}
        {!!event.guestbookEnabled && (
          <div className="flex flex-col gap-3">
            <h2 className="font-display font-bold text-base text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              {t("guestUpload.leaveMessage")}
            </h2>
            <div className="flex gap-2">
              <Input
                placeholder={t("guestUpload.messagePlaceholder")}
                value={guestMessage}
                onChange={e => setGuestMessage(e.target.value)}
                className="flex-1 h-11 text-base"
                onKeyDown={e => e.key === "Enter" && guestMessage.trim() && guestbookMutation.mutate()}
                data-testid="input-guestbook-message"
              />
              <Button
                onClick={() => guestbookMutation.mutate()}
                disabled={!guestMessage.trim() || guestbookMutation.isPending}
                className="bg-primary text-primary-foreground h-11 px-4"
                data-testid="button-send-message"
              >
                {guestbookMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            {guestbook.length > 0 && (
              <div className="flex flex-col gap-2 mt-1">
                {guestbook.map(entry => (
                  <div key={entry.id} className="bg-card border border-border rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-display font-semibold text-xs text-foreground">{entry.guestName || "Guest"}</span>
                      <span className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-foreground">{entry.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GuestPhotoCard({
  photo,
  liked,
  onLike,
}: {
  photo: PhotoWithoutData;
  liked: boolean;
  onLike: () => void;
}) {
  const [mediaSrc, setMediaSrc] = useState<string | null>(
    (photo as any).fileUrl || null
  );
  const isVideo = photo.mimeType?.startsWith("video/");

  useQuery({
    queryKey: ["/api/photos", photo.id, "data"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/photos/${photo.id}/data`);
      const data = await res.json();
      setMediaSrc(`data:${data.mimeType};base64,${data.fileData}`);
      return data;
    },
    staleTime: Infinity,
    enabled: !(photo as any).fileUrl,
  });

  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border" data-testid={`card-photo-${photo.id}`}>
      <div className="relative aspect-[4/3] bg-muted">
        {!mediaSrc && <Skeleton className="w-full h-full" />}
        {mediaSrc && isVideo ? (
          <video
            src={mediaSrc}
            controls
            playsInline
            muted
            preload="metadata"
            className="w-full h-full object-cover"
            data-testid={`video-player-${photo.id}`}
          />
        ) : mediaSrc ? (
          <img src={mediaSrc} alt={photo.caption || ""} className="w-full h-full object-cover" />
        ) : null}
        {isVideo && mediaSrc && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md pointer-events-none">
            <Play className="w-2.5 h-2.5 fill-current" />
            Video
          </div>
        )}
      </div>
      <div className="px-2.5 py-2 flex items-center justify-between gap-1">
        <div className="min-w-0">
          {photo.guestName && <p className="text-xs font-semibold truncate text-foreground">{photo.guestName}</p>}
          {photo.caption && <p className="text-xs text-muted-foreground truncate">{photo.caption}</p>}
        </div>
        <button
          onClick={onLike}
          className={`flex items-center gap-1 flex-shrink-0 transition-colors ${liked ? "text-accent" : "text-muted-foreground hover:text-accent"}`}
          data-testid={`button-like-${photo.id}`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          <span className="text-xs">{photo.likes + (liked ? 1 : 0)}</span>
        </button>
      </div>
    </div>
  );
}
