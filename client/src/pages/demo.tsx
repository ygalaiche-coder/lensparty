import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Heart,
  ImagePlus,
  Loader2,
  Camera,
  CheckCircle2,
  Play,
  ArrowRight,
  Sparkles,
  QrCode,
} from "lucide-react";
import type { Event, Photo } from "@shared/schema";

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

export default function DemoPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [demoEvent, setDemoEvent] = useState<Event | null>(null);
  const [creating, setCreating] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Create demo event on mount
  useEffect(() => {
    let cancelled = false;
    async function create() {
      try {
        const res = await apiRequest("POST", "/api/demo/create");
        const event = await res.json();
        if (!cancelled) {
          setDemoEvent(event);
          setCreating(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setCreating(false);
          toast({ title: "Error", description: "Failed to create demo event. Please try again.", variant: "destructive" });
        }
      }
    }
    create();
    return () => { cancelled = true; };
  }, []);

  // Poll for photos
  const { data: photos = [] } = useQuery<PhotoWithoutData[]>({
    queryKey: [`/api/events/${demoEvent?.id}/photos`],
    queryFn: getQueryFn({ on401: "returnNull" }) as any,
    enabled: !!demoEvent,
    refetchInterval: 3000,
  });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    setUploadSuccess(false);
  }, []);

  const removeFile = useCallback((idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const handleUpload = useCallback(async () => {
    if (!demoEvent || selectedFiles.length === 0) return;
    setUploading(true);

    try {
      const photoList = await Promise.all(
        selectedFiles.map(async (file) => {
          const buffer = await file.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
          );
          return {
            fileName: file.name,
            fileData: base64,
            mimeType: file.type || "image/jpeg",
            guestName: guestName.trim() || null,
            caption: null,
          };
        })
      );

      await apiRequest("POST", `/api/events/${demoEvent.id}/photos`, { photos: photoList });

      setUploadSuccess(true);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      queryClient.invalidateQueries({ queryKey: [`/api/events/${demoEvent.id}/photos`] });

      toast({ title: "Photos uploaded!", description: `${photoList.length} photo(s) shared to the demo event.` });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }, [demoEvent, selectedFiles, guestName, queryClient, toast]);

  const isVideo = (mimeType: string) => mimeType?.startsWith("video/");

  if (creating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Setting up your demo...</p>
        </div>
      </div>
    );
  }

  if (!demoEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center flex flex-col items-center gap-4">
          <p className="text-muted-foreground">Failed to create demo. Please refresh to try again.</p>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-primary via-purple-600 to-accent text-white py-3 px-4 text-center">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold">This is a live demo! Try uploading a photo and see it appear in real-time.</span>
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-demo-home">
              <LensLogo size={24} />
              <span className="font-display font-bold text-foreground">LensParty</span>
              <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">DEMO</span>
            </div>
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-demo-signup">
              Create Your Own Event
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
            Try LensParty Live
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Upload a photo and see it appear in real-time. No sign-up needed.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <QrCode className="w-4 h-4" />
            <span>Event Code: <strong className="text-foreground">{demoEvent.code}</strong></span>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Upload Side */}
          <div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display font-bold text-xl text-foreground mb-1">Upload Photos</h2>
              <p className="text-muted-foreground text-sm mb-6">Try uploading a photo — it'll appear in the gallery instantly.</p>

              {/* Guest Name */}
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-1 block">Your Name <span className="text-muted-foreground">(optional)</span></label>
                <Input
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="e.g. Maria"
                  data-testid="input-demo-name"
                />
              </div>

              {/* File Input */}
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors mb-4"
                onClick={() => fileInputRef.current?.click()}
                data-testid="area-demo-upload"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-demo-files"
                />
                <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-display font-semibold text-foreground mb-1">Tap to select photos</p>
                <p className="text-xs text-muted-foreground">or drag & drop · JPG, PNG, MP4 and more</p>
              </div>

              {/* File previews */}
              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {selectedFiles.map((file, i) => {
                    const url = URL.createObjectURL(file);
                    const isVid = file.type.startsWith("video/");
                    return (
                      <div key={i} className="relative rounded-lg overflow-hidden border border-border aspect-square">
                        {isVid ? (
                          <video src={url} className="w-full h-full object-cover" muted preload="metadata" />
                        ) : (
                          <img src={url} alt={file.name} className="w-full h-full object-cover" />
                        )}
                        {isVid && (
                          <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Play className="w-2.5 h-2.5" /> Video
                          </div>
                        )}
                        <button
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/80"
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Upload button */}
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold"
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
                data-testid="button-demo-upload"
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" /> Upload {selectedFiles.length > 0 ? `${selectedFiles.length} file(s)` : ""}</>
                )}
              </Button>

              {uploadSuccess && (
                <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Photos uploaded successfully!</span>
                </div>
              )}
            </div>
          </div>

          {/* Gallery Side */}
          <div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-bold text-xl text-foreground mb-1">Event Gallery</h2>
                  <p className="text-muted-foreground text-sm">{photos.length} photo{photos.length !== 1 ? "s" : ""} · Updates in real-time</p>
                </div>
              </div>

              {photos.length === 0 ? (
                <div className="text-center py-16">
                  <ImagePlus className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="font-display font-semibold text-foreground mb-1">No photos yet</p>
                  <p className="text-muted-foreground text-sm">Upload a photo on the left and it'll appear here instantly!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {photos.map((photo) => {
                    const src = photo.fileUrl || `/api/photos/${photo.id}/data`;
                    return (
                      <div key={photo.id} className="relative rounded-lg overflow-hidden border border-border aspect-square group">
                        {isVideo(photo.mimeType) ? (
                          <video src={src} className="w-full h-full object-cover" controls playsInline muted preload="metadata" />
                        ) : (
                          <img src={src} alt={photo.fileName} className="w-full h-full object-cover" loading="lazy" />
                        )}
                        {isVideo(photo.mimeType) && (
                          <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 pointer-events-none">
                            <Play className="w-2.5 h-2.5" /> Video
                          </div>
                        )}
                        {photo.guestName && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-medium">{photo.guestName}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 dark:from-primary/20 dark:via-accent/10 dark:to-primary/20 border border-primary/15 rounded-2xl p-10">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-3">Liked it? Create your own event for free.</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">Set up your event in 30 seconds. No credit card needed.</p>
            <Link href="/login">
              <Button
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground font-display font-semibold px-8 py-5 text-base shadow-lg shadow-primary/25"
                data-testid="button-demo-cta"
              >
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
