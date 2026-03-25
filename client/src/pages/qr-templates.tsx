import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Printer, X } from "lucide-react";
import type { Event } from "@shared/schema";

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

// Template type
interface TemplateProps {
  qrCodeDataUri: string;
  eventName: string;
  eventCode: string;
  guestUrl: string;
  heading: string;
  subtitle: string;
}

// Size presets
const SIZES = {
  "table-card": { label: "Table Card (4×6\")", w: 384, h: 576 },
  "sign": { label: "Sign (8×10\")", w: 640, h: 800 },
  "poster": { label: "Poster (11×17\")", w: 704, h: 1088 },
} as const;

type SizeKey = keyof typeof SIZES;

// ─── TEMPLATE DEFINITIONS ────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: "elegant-wedding",
    name: "Elegant Wedding",
    defaultHeading: "Capture the Love",
    defaultSubtitle: "Scan to share your photos",
    render: (p: TemplateProps, size: SizeKey) => {
      const { w, h } = SIZES[size];
      return (
        <div
          style={{ width: w, height: h, fontFamily: "'Playfair Display', Georgia, serif" }}
          className="bg-[#FDF8F0] flex flex-col items-center justify-center text-center p-8 relative overflow-hidden"
        >
          <div className="absolute inset-3 border border-[#C9A96E] rounded pointer-events-none" />
          <div className="absolute inset-4 border border-[#C9A96E]/40 rounded pointer-events-none" />
          <h2 className="text-2xl font-semibold text-[#3D2B1F] mb-1 italic">{p.heading}</h2>
          <p className="text-xs text-[#8B7355] mb-6 tracking-widest uppercase" style={{ fontFamily: "sans-serif" }}>{p.subtitle}</p>
          <div className="bg-white rounded-lg p-3 shadow-md mb-5">
            <img src={p.qrCodeDataUri} alt="QR Code" style={{ width: w * 0.35, height: w * 0.35 }} />
          </div>
          <p className="text-base font-semibold text-[#3D2B1F] mb-1">{p.eventName}</p>
          <p className="text-[10px] text-[#8B7355] tracking-wide" style={{ fontFamily: "sans-serif" }}>Code: {p.eventCode}</p>
          <p className="text-[9px] text-[#A89070] mt-3 break-all max-w-[80%]" style={{ fontFamily: "sans-serif" }}>{p.guestUrl}</p>
        </div>
      );
    },
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    defaultHeading: "Share Your Photos",
    defaultSubtitle: "Scan the QR code with your phone camera",
    render: (p: TemplateProps, size: SizeKey) => {
      const { w, h } = SIZES[size];
      return (
        <div
          style={{ width: w, height: h, fontFamily: "'Satoshi', sans-serif" }}
          className="bg-white flex flex-col items-center justify-center text-center p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{p.heading}</h2>
          <p className="text-xs text-gray-400 mb-8">{p.subtitle}</p>
          <div className="mb-6">
            <img src={p.qrCodeDataUri} alt="QR Code" style={{ width: w * 0.4, height: w * 0.4 }} />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">{p.eventName}</p>
          <p className="text-xs text-gray-400">Code: {p.eventCode}</p>
          <p className="text-[9px] text-gray-300 mt-4 break-all max-w-[80%]">{p.guestUrl}</p>
        </div>
      );
    },
  },
  {
    id: "party-vibes",
    name: "Party Vibes",
    defaultHeading: "📸 Snap & Share!",
    defaultSubtitle: "Point your camera at the QR code",
    render: (p: TemplateProps, size: SizeKey) => {
      const { w, h } = SIZES[size];
      return (
        <div
          style={{ width: w, height: h, fontFamily: "'Clash Display', 'Satoshi', sans-serif", background: "linear-gradient(135deg, hsl(262 83% 58%), hsl(330 80% 60%))" }}
          className="flex flex-col items-center justify-center text-center p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-6 left-6 text-4xl opacity-30 rotate-[-15deg]">🎉</div>
          <div className="absolute bottom-8 right-8 text-4xl opacity-30 rotate-[20deg]">🎊</div>
          <h2 className="text-3xl font-bold mb-1 drop-shadow">{p.heading}</h2>
          <p className="text-sm text-white/70 mb-6">{p.subtitle}</p>
          <div className="bg-white rounded-2xl p-4 shadow-xl mb-5">
            <img src={p.qrCodeDataUri} alt="QR Code" style={{ width: w * 0.35, height: w * 0.35 }} />
          </div>
          <p className="text-lg font-bold drop-shadow mb-1">{p.eventName}</p>
          <p className="text-xs text-white/60">Code: {p.eventCode}</p>
          <p className="text-[9px] text-white/40 mt-3 break-all max-w-[80%]">{p.guestUrl}</p>
        </div>
      );
    },
  },
  {
    id: "rustic-garden",
    name: "Rustic Garden",
    defaultHeading: "Share the Moment",
    defaultSubtitle: "Scan to upload your photos",
    render: (p: TemplateProps, size: SizeKey) => {
      const { w, h } = SIZES[size];
      return (
        <div
          style={{ width: w, height: h, fontFamily: "'Satoshi', sans-serif" }}
          className="bg-[#E8EDE5] flex flex-col items-center justify-center text-center p-8 relative overflow-hidden"
        >
          <div className="absolute top-4 left-4 text-3xl opacity-40">🌿</div>
          <div className="absolute top-4 right-4 text-3xl opacity-40">🌿</div>
          <div className="absolute bottom-4 left-4 text-3xl opacity-40 scale-x-[-1]">🌿</div>
          <div className="absolute bottom-4 right-4 text-3xl opacity-40 scale-x-[-1]">🌿</div>
          <h2 className="text-2xl font-bold text-[#3B5323] mb-1">{p.heading}</h2>
          <p className="text-xs text-[#6B7F5E] mb-6">{p.subtitle}</p>
          <div className="bg-white rounded-xl p-3 shadow-md border border-[#B5C4A8] mb-5">
            <img src={p.qrCodeDataUri} alt="QR Code" style={{ width: w * 0.35, height: w * 0.35 }} />
          </div>
          <p className="text-base font-bold text-[#3B5323] mb-1">{p.eventName}</p>
          <p className="text-[10px] text-[#6B7F5E]">Code: {p.eventCode}</p>
          <p className="text-[9px] text-[#8C9E7D] mt-3 break-all max-w-[80%]">{p.guestUrl}</p>
        </div>
      );
    },
  },
  {
    id: "corporate-professional",
    name: "Corporate Professional",
    defaultHeading: "Event Photo Gallery",
    defaultSubtitle: "Scan to contribute your photos",
    render: (p: TemplateProps, size: SizeKey) => {
      const { w, h } = SIZES[size];
      return (
        <div
          style={{ width: w, height: h, fontFamily: "'Satoshi', sans-serif" }}
          className="bg-[#1A2040] flex flex-col items-center justify-center text-center p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-1">{p.heading}</h2>
          <p className="text-xs text-white/50 mb-8 tracking-wide uppercase">{p.subtitle}</p>
          <div className="bg-white rounded-lg p-4 mb-6">
            <img src={p.qrCodeDataUri} alt="QR Code" style={{ width: w * 0.35, height: w * 0.35 }} />
          </div>
          <p className="text-lg font-bold mb-1">{p.eventName}</p>
          <p className="text-xs text-white/40">Code: {p.eventCode}</p>
          <div className="w-12 h-px bg-white/20 my-3" />
          <p className="text-[9px] text-white/30 break-all max-w-[80%]">{p.guestUrl}</p>
        </div>
      );
    },
  },
  {
    id: "birthday-fun",
    name: "Birthday Fun",
    defaultHeading: "🎂 Share the Party!",
    defaultSubtitle: "Scan with your phone camera",
    render: (p: TemplateProps, size: SizeKey) => {
      const { w, h } = SIZES[size];
      return (
        <div
          style={{ width: w, height: h, fontFamily: "'Clash Display', 'Satoshi', sans-serif", background: "linear-gradient(135deg, #FFA726, #FF7043)" }}
          className="flex flex-col items-center justify-center text-center p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-5 left-8 text-3xl opacity-40">🎈</div>
          <div className="absolute top-8 right-6 text-3xl opacity-40">🎊</div>
          <div className="absolute bottom-6 left-6 text-3xl opacity-40">🎁</div>
          <div className="absolute bottom-5 right-8 text-3xl opacity-40">🎈</div>
          <h2 className="text-3xl font-bold mb-1 drop-shadow">{p.heading}</h2>
          <p className="text-sm text-white/70 mb-6">{p.subtitle}</p>
          <div className="bg-white rounded-2xl p-4 shadow-xl mb-5">
            <img src={p.qrCodeDataUri} alt="QR Code" style={{ width: w * 0.35, height: w * 0.35 }} />
          </div>
          <p className="text-lg font-bold drop-shadow mb-1">{p.eventName}</p>
          <p className="text-xs text-white/60">Code: {p.eventCode}</p>
          <p className="text-[9px] text-white/40 mt-3 break-all max-w-[80%]">{p.guestUrl}</p>
        </div>
      );
    },
  },
  {
    id: "baby-shower",
    name: "Baby Shower",
    defaultHeading: "Share Your Photos",
    defaultSubtitle: "Welcome Little One 👶",
    render: (p: TemplateProps, size: SizeKey) => {
      const { w, h } = SIZES[size];
      return (
        <div
          style={{ width: w, height: h, fontFamily: "'Satoshi', sans-serif", background: "linear-gradient(180deg, #FDE2E4, #E2ECF6)" }}
          className="flex flex-col items-center justify-center text-center p-8 relative overflow-hidden"
        >
          <div className="absolute top-6 right-8 text-3xl opacity-30">🧸</div>
          <div className="absolute bottom-6 left-8 text-3xl opacity-30">🍼</div>
          <h2 className="text-2xl font-bold text-[#6B4C6E] mb-1">{p.heading}</h2>
          <p className="text-sm text-[#9B7EA0] mb-6">{p.subtitle}</p>
          <div className="bg-white rounded-2xl p-3 shadow-md mb-5">
            <img src={p.qrCodeDataUri} alt="QR Code" style={{ width: w * 0.35, height: w * 0.35 }} />
          </div>
          <p className="text-base font-bold text-[#6B4C6E] mb-1">{p.eventName}</p>
          <p className="text-[10px] text-[#9B7EA0]">Code: {p.eventCode}</p>
          <p className="text-[9px] text-[#B8A0BC] mt-3 break-all max-w-[80%]">{p.guestUrl}</p>
        </div>
      );
    },
  },
  {
    id: "classic-bw",
    name: "Classic Black & White",
    defaultHeading: "SCAN ME",
    defaultSubtitle: "Share your photos from the event",
    render: (p: TemplateProps, size: SizeKey) => {
      const { w, h } = SIZES[size];
      return (
        <div
          style={{ width: w, height: h, fontFamily: "'Satoshi', sans-serif" }}
          className="bg-black flex flex-col items-center justify-center text-center p-8 text-white"
        >
          <h2 className="text-3xl font-bold tracking-[0.2em] mb-1">{p.heading}</h2>
          <p className="text-xs text-white/40 mb-8">{p.subtitle}</p>
          <div className="bg-white rounded p-4 mb-6">
            <img src={p.qrCodeDataUri} alt="QR Code" style={{ width: w * 0.38, height: w * 0.38 }} />
          </div>
          <p className="text-lg font-bold tracking-wide mb-1">{p.eventName}</p>
          <p className="text-xs text-white/40">Code: {p.eventCode}</p>
          <div className="w-16 h-px bg-white/20 my-3" />
          <p className="text-[9px] text-white/25 break-all max-w-[80%]">{p.guestUrl}</p>
        </div>
      );
    },
  },
  {
    id: "sunset-warm",
    name: "Sunset Warm",
    defaultHeading: "Share the Magic ✨",
    defaultSubtitle: "Scan to upload your favorite moments",
    render: (p: TemplateProps, size: SizeKey) => {
      const { w, h } = SIZES[size];
      return (
        <div
          style={{ width: w, height: h, fontFamily: "'Satoshi', sans-serif", background: "linear-gradient(180deg, #FFF3E0, #FFE0B2, #FFCC80)" }}
          className="flex flex-col items-center justify-center text-center p-8 relative overflow-hidden"
        >
          <h2 className="text-2xl font-bold text-[#5D4037] mb-1">{p.heading}</h2>
          <p className="text-xs text-[#8D6E63] mb-6">{p.subtitle}</p>
          <div className="bg-white/90 rounded-xl p-3 shadow-lg mb-5">
            <img src={p.qrCodeDataUri} alt="QR Code" style={{ width: w * 0.35, height: w * 0.35 }} />
          </div>
          <p className="text-base font-bold text-[#5D4037] mb-1">{p.eventName}</p>
          <p className="text-[10px] text-[#8D6E63]">Code: {p.eventCode}</p>
          <p className="text-[9px] text-[#A1887F] mt-3 break-all max-w-[80%]">{p.guestUrl}</p>
        </div>
      );
    },
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    defaultHeading: "Photo Time! 📷",
    defaultSubtitle: "Scan to share your photos with everyone",
    render: (p: TemplateProps, size: SizeKey) => {
      const { w, h } = SIZES[size];
      return (
        <div
          style={{ width: w, height: h, fontFamily: "'Satoshi', sans-serif", background: "linear-gradient(180deg, #E0F7FA, #B2EBF2, #80DEEA)" }}
          className="flex flex-col items-center justify-center text-center p-8"
        >
          <h2 className="text-2xl font-bold text-[#00695C] mb-1">{p.heading}</h2>
          <p className="text-xs text-[#4DB6AC] mb-6">{p.subtitle}</p>
          <div className="bg-white rounded-xl p-3 shadow-md mb-5">
            <img src={p.qrCodeDataUri} alt="QR Code" style={{ width: w * 0.35, height: w * 0.35 }} />
          </div>
          <p className="text-base font-bold text-[#00695C] mb-1">{p.eventName}</p>
          <p className="text-[10px] text-[#4DB6AC]">Code: {p.eventCode}</p>
          <p className="text-[9px] text-[#80CBC4] mt-3 break-all max-w-[80%]">{p.guestUrl}</p>
        </div>
      );
    },
  },
];

export default function QRTemplatesPage() {
  const params = useParams<{ id: string }>();
  const eventId = parseInt(params.id || "0");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customHeading, setCustomHeading] = useState("");
  const [customSubtitle, setCustomSubtitle] = useState("");
  const [size, setSize] = useState<SizeKey>("table-card");

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
  const { data: qrData, isLoading: qrLoading } = useQuery<{ qrCode: string; guestUrl: string }>({
    queryKey: ["/api/events", eventId, "qr"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/events/${eventId}/qr`);
      return res.json();
    },
    enabled: !!eventId,
  });

  const selectedTemplate = TEMPLATES.find(t => t.id === selectedId);

  // When selecting a template, populate custom heading/subtitle from defaults
  const selectTemplate = (id: string) => {
    const tmpl = TEMPLATES.find(t => t.id === id);
    if (tmpl) {
      setSelectedId(id);
      setCustomHeading(tmpl.defaultHeading);
      setCustomSubtitle(tmpl.defaultSubtitle);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const templateProps: TemplateProps | null = qrData && event ? {
    qrCodeDataUri: qrData.qrCode,
    eventName: event.name,
    eventCode: event.eventCode,
    guestUrl: qrData.guestUrl,
    heading: customHeading,
    subtitle: customSubtitle,
  } : null;

  if (eventLoading || qrLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Skeleton className="h-10 w-72 mb-4" />
        <Skeleton className="h-6 w-48 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!event || !qrData) {
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
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap');
        .font-display { font-family: 'Clash Display', 'Satoshi', sans-serif; }
        @media print {
          body * { visibility: hidden !important; }
          .print-target, .print-target * { visibility: visible !important; }
          .print-target { position: absolute; left: 0; top: 0; }
        }
      `}</style>

      {/* Header */}
      <header className="h-16 border-b border-border flex items-center px-6 gap-4 bg-background/80 backdrop-blur-md sticky top-0 z-50 no-print">
        <Link href={`/event/${eventId}`}>
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors" data-testid="button-back-dashboard">
            <ArrowLeft className="w-4 h-4" />
            <LensLogo size={20} />
            <span className="font-display font-bold text-sm">LensParty</span>
          </button>
        </Link>
        <div className="ml-auto">
          <span className="text-sm text-muted-foreground font-display">{event.name}</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-foreground" data-testid="text-page-title">Print Templates</h1>
          <p className="text-muted-foreground text-sm mt-1">Choose a template, customize, and print QR code signs for your event.</p>
        </div>

        {/* Template gallery */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {TEMPLATES.map(tmpl => {
            const previewProps: TemplateProps = {
              qrCodeDataUri: qrData.qrCode,
              eventName: event.name,
              eventCode: event.eventCode,
              guestUrl: qrData.guestUrl,
              heading: tmpl.defaultHeading,
              subtitle: tmpl.defaultSubtitle,
            };
            return (
              <button
                key={tmpl.id}
                onClick={() => selectTemplate(tmpl.id)}
                className={`group relative rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg hover:-translate-y-1 ${
                  selectedId === tmpl.id ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-border"
                }`}
                data-testid={`template-${tmpl.id}`}
              >
                <div className="aspect-[2/3] overflow-hidden">
                  <div style={{ transform: "scale(0.28)", transformOrigin: "top left", width: SIZES["table-card"].w, height: SIZES["table-card"].h }}>
                    {tmpl.render(previewProps, "table-card")}
                  </div>
                </div>
                <div className="p-2 bg-card border-t border-border">
                  <p className="text-xs font-display font-semibold text-foreground truncate">{tmpl.name}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Preview modal/expanded view */}
        {selectedTemplate && templateProps && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedId(null)}>
            <div
              className="bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-lg text-foreground" data-testid="text-template-name">{selectedTemplate.name}</h2>
                <button
                  onClick={() => setSelectedId(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  data-testid="button-close-preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Template preview */}
                <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-xl p-4 overflow-auto">
                  <div className="print-target shadow-2xl rounded-lg overflow-hidden" style={{ flexShrink: 0 }}>
                    {(() => {
                      const { w, h } = SIZES[size];
                      // Scale down for display if needed
                      const maxDisplayW = 400;
                      const scale = w > maxDisplayW ? maxDisplayW / w : 1;
                      return (
                        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: w, height: h }}>
                          {selectedTemplate.render(templateProps, size)}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Customization controls */}
                <div className="lg:w-64 flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Heading</label>
                    <input
                      type="text"
                      value={customHeading}
                      onChange={e => setCustomHeading(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      data-testid="input-heading"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Subtitle</label>
                    <input
                      type="text"
                      value={customSubtitle}
                      onChange={e => setCustomSubtitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      data-testid="input-subtitle"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Size</label>
                    <div className="flex flex-col gap-1.5">
                      {(Object.entries(SIZES) as [SizeKey, typeof SIZES[SizeKey]][]).map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => setSize(key)}
                          className={`text-left px-3 py-2 text-sm rounded-lg border transition-colors ${
                            size === key
                              ? "border-primary bg-primary/5 text-primary font-semibold"
                              : "border-border text-muted-foreground hover:border-primary/30"
                          }`}
                          data-testid={`button-size-${key}`}
                        >
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <Button
                      onClick={handlePrint}
                      className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold"
                      data-testid="button-print"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handlePrint}
                      className="w-full gap-2 font-display"
                      data-testid="button-save-pdf"
                    >
                      Save as PDF
                    </Button>
                  </div>

                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    Tip: Use "Save as PDF" in the print dialog to download a printable file.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
