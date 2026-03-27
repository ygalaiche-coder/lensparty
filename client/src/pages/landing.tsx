import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/language-switcher";
import {
  Calendar,
  QrCode,
  Images,
  Smartphone,
  ScanFace,
  MonitorPlay,
  Mic,
  ShieldCheck,
  Palette,
  Check,
  X,
  ChevronDown,
  AlertTriangle,
  Sun,
  Moon,
  Camera,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

// Scroll animation hook
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// LensParty SVG Logo
function LensLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="LensParty logo" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="16" r="8" fill="hsl(262 83% 58%)" opacity="0.15"/>
      <circle cx="16" cy="16" r="5" fill="hsl(262 83% 58%)"/>
      <circle cx="16" cy="16" r="2.5" fill="white"/>
      <circle cx="21" cy="11" r="1.5" fill="hsl(330 80% 60%)"/>
    </svg>
  );
}

// Animated iPhone mockup showing LensParty flow
function HeroPhoneMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep(s => (s + 1) % 4), 3500);
    return () => clearInterval(timer);
  }, []);

  // Fresh wedding/event photos — different from the rest of the page
  const photos = [
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=200&h=200&fit=crop",
  ];

  // Screen content for each step
  const screens = [
    // Step 0: QR Code
    <div key="qr" className="flex flex-col items-center justify-center h-full px-5">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
        <QrCode className="w-4 h-4 text-primary" />
      </div>
      <p className="text-[10px] font-display font-bold text-gray-900 dark:text-white">Sarah's Wedding</p>
      <p className="text-[8px] text-gray-400 mb-3">Scan to share your photos</p>
      <div className="w-24 h-24 mb-3">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* QR code corners (finder patterns) */}
          <rect x="4" y="4" width="24" height="24" rx="3" fill="#1a1a2e" />
          <rect x="7" y="7" width="18" height="18" rx="2" fill="white" />
          <rect x="10" y="10" width="12" height="12" rx="1" fill="#1a1a2e" />
          <rect x="72" y="4" width="24" height="24" rx="3" fill="#1a1a2e" />
          <rect x="75" y="7" width="18" height="18" rx="2" fill="white" />
          <rect x="78" y="10" width="12" height="12" rx="1" fill="#1a1a2e" />
          <rect x="4" y="72" width="24" height="24" rx="3" fill="#1a1a2e" />
          <rect x="7" y="75" width="18" height="18" rx="2" fill="white" />
          <rect x="10" y="78" width="12" height="12" rx="1" fill="#1a1a2e" />
          {/* Data modules — deterministic pattern */}
          {[[32,4],[36,8],[40,4],[44,12],[48,8],[52,4],[56,12],[60,8],[64,4],[68,12],
            [32,36],[36,32],[40,40],[44,36],[48,44],[52,40],[56,36],[60,44],[64,40],[68,36],
            [32,52],[36,56],[40,60],[44,52],[48,56],[52,64],[56,52],[60,56],[64,60],[68,52],
            [32,68],[36,76],[40,84],[48,68],[52,76],[60,68],[64,84],[68,76],
            [4,32],[8,36],[12,40],[16,44],[20,36],[4,48],[12,52],[20,48],
            [4,60],[8,64],[16,60],[20,64],[80,36],[84,40],[88,44],[92,36],
            [80,52],[84,48],[88,56],[92,60],[80,64],[88,68],[92,64],
            [36,84],[40,92],[48,84],[52,88],[56,92],[60,84],[64,88]].map(([x,y], i) =>
            <rect key={`d${i}`} x={x} y={y} width="3" height="3" rx="0.5" fill="#1a1a2e" />
          )}
          {/* Alignment pattern */}
          <rect x="72" y="72" width="14" height="14" rx="2" fill="#1a1a2e" />
          <rect x="74" y="74" width="10" height="10" rx="1.5" fill="white" />
          <rect x="77" y="77" width="4" height="4" rx="1" fill="#1a1a2e" />
          {/* LensParty logo center */}
          <circle cx="50" cy="50" r="8" fill="white" />
          <circle cx="50" cy="50" r="6" fill="#7C3AED" opacity="0.15" />
          <circle cx="50" cy="50" r="4" fill="#7C3AED" />
          <circle cx="50" cy="50" r="2" fill="white" />
        </svg>
      </div>
      <div className="flex items-center gap-1 bg-green-50 dark:bg-green-950/30 rounded-full px-2.5 py-0.5">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[8px] font-semibold text-green-600 dark:text-green-400">Ready to scan</span>
      </div>
    </div>,
    // Step 1: Uploading
    <div key="upload" className="flex flex-col items-center h-full px-4 pt-3">
      <p className="text-[10px] font-display font-bold text-gray-900 dark:text-white">Upload Photos</p>
      <p className="text-[8px] text-gray-400 mb-3">Sarah's Wedding</p>
      <div className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Camera className="w-4 h-4 text-primary" />
          <div>
            <p className="text-[9px] font-semibold text-gray-900 dark:text-white">Uploading files...</p>
            <p className="text-[8px] text-gray-400">3 of 5 photos</p>
          </div>
        </div>
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: "60%", transition: "width 1s ease" }} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 w-full">
        {photos.slice(0, 6).map((src, i) => (
          <div key={i} className="aspect-square rounded-md overflow-hidden relative">
            <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
            {i < 3 && <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
          </div>
        ))}
      </div>
    </div>,
    // Step 2: Gallery
    <div key="gallery" className="flex flex-col h-full px-3 pt-2">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[10px] font-display font-bold text-gray-900 dark:text-white">Sarah's Wedding</p>
          <p className="text-[8px] text-gray-400">247 photos · 12 guests</p>
        </div>
        <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/30 rounded-full px-2 py-0.5">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[7px] font-bold text-red-500">LIVE</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 flex-1">
        {photos.map((src, i) => (
          <div key={i} className="rounded-md overflow-hidden">
            <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
        {photos.slice(0, 3).map((src, i) => (
          <div key={`extra-${i}`} className="rounded-md overflow-hidden">
            <img src={src} alt="" className="w-full h-full object-cover opacity-80" loading="lazy" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1.5 py-2">
        <div className="flex -space-x-1.5">
          {["bg-blue-400","bg-pink-400","bg-green-400"].map((bg, i) => (
            <div key={i} className={`w-4 h-4 rounded-full ${bg} border border-white dark:border-gray-900 flex items-center justify-center`}>
              <span className="text-[6px] text-white font-bold">{["S","J","M"][i]}</span>
            </div>
          ))}
        </div>
        <span className="text-[8px] text-gray-400">+9 uploading</span>
      </div>
    </div>,
    // Step 3: Done
    <div key="done" className="flex flex-col items-center justify-center h-full px-5">
      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
        <Check className="w-6 h-6 text-green-500" />
      </div>
      <p className="text-[11px] font-display font-bold text-gray-900 dark:text-white mb-0.5">All Done!</p>
      <p className="text-[8px] text-gray-400 text-center mb-3">247 photos from 12 guests</p>
      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden shadow-sm mb-2">
        <img src={photos[3]} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="flex items-center gap-1">
        {[0,1,2,3,4].map(i => (
          <div key={i} className={`rounded-full transition-all ${i === 2 ? "w-3 h-1 bg-primary" : "w-1 h-1 bg-gray-300 dark:bg-gray-600"}`} />
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="relative w-[260px] mx-auto" style={{ perspective: "1000px" }}>
      {/* iPhone with slight perspective tilt */}
      <div
        className="relative bg-black rounded-[2.8rem] p-[10px] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.3)]"
        style={{ transform: "rotateY(-5deg) rotateX(2deg)" }}
      >
        {/* Inner screen bezel */}
        <div className="relative bg-white dark:bg-gray-950 rounded-[2.2rem] overflow-hidden">
          {/* Dynamic Island */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20" />
          {/* Status bar */}
          <div className="relative z-10 flex items-center justify-between px-7 pt-3 pb-0">
            <span className="text-[9px] font-semibold text-gray-900 dark:text-white">9:41</span>
            <div className="flex items-center gap-1">
              <svg width="14" height="10" viewBox="0 0 14 10" className="text-gray-900 dark:text-white"><path d="M0 6h2v4H0zM4 4h2v6H4zM8 2h2v8H8zM12 0h2v10h-2z" fill="currentColor"/></svg>
            </div>
          </div>
          {/* Screen content with fade transition */}
          <div className="relative h-[430px] overflow-hidden">
            {screens.map((screen, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                style={{ opacity: step === i ? 1 : 0, pointerEvents: step === i ? "auto" : "none" }}
              >
                {screen}
              </div>
            ))}
          </div>
          {/* Home indicator */}
          <div className="flex justify-center pb-2 pt-1">
            <div className="w-28 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        </div>
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        {[0,1,2,3].map(i => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`rounded-full transition-all duration-300 ${step === i ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"}`}
            data-testid={`phone-step-${i}`}
          />
        ))}
      </div>

      {/* Floating label badges */}
      <div className="absolute -top-3 -right-16 bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 shadow-md border border-border/50 flex items-center gap-1.5">
        <span className="text-xs">📸</span>
        <span className="text-[11px] font-semibold text-foreground">HD Quality</span>
      </div>
      <div className="absolute top-1/3 -left-20 bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 shadow-md border border-border/50 flex items-center gap-1.5">
        <span className="text-xs">🔓</span>
        <span className="text-[11px] font-semibold text-foreground">No App</span>
      </div>
      <div className="absolute bottom-20 -right-20 bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 shadow-md border border-border/50 flex items-center gap-1.5">
        <span className="text-xs">🎬</span>
        <span className="text-[11px] font-semibold text-foreground">Videos Too</span>
      </div>
    </div>
  );
}

// Step card
function StepCard({ number, icon: Icon, title, desc, delay }: { number: string; icon: any; title: string; desc: string; delay: number }) {
  return (
    <AnimatedSection delay={delay} className="flex flex-col items-center text-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent text-white text-xs font-display font-bold flex items-center justify-center shadow">
          {number}
        </div>
      </div>
      <h3 className="font-display font-bold text-xl text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{desc}</p>
    </AnimatedSection>
  );
}

// Feature card
function FeatureCard({ icon: Icon, title, desc, delay }: { icon: any; title: string; desc: string; delay: number }) {
  return (
    <AnimatedSection delay={delay}>
      <div className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow duration-200 h-full">
        <div className="w-11 h-11 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-display font-semibold text-base text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </div>
    </AnimatedSection>
  );
}

// Use case card
function UseCaseCard({ emoji, title, desc, bg, delay }: { emoji: string; title: string; desc: string; bg: string; delay: number }) {
  return (
    <AnimatedSection delay={delay}>
      <div className={`${bg} rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform duration-200 h-full`}>
        <div className="text-4xl mb-3">{emoji}</div>
        <h3 className="font-display font-bold text-base text-foreground mb-1">{title}</h3>
        <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
      </div>
    </AnimatedSection>
  );
}

// Pain point card
function PainPointCard({ emoji, title, desc, delay }: { emoji: string; title: string; desc: string; delay: number }) {
  return (
    <AnimatedSection delay={delay}>
      <div className="bg-card border border-border rounded-xl p-6 h-full">
        <div className="text-3xl mb-3">{emoji}</div>
        <h3 className="font-display font-bold text-base text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </div>
    </AnimatedSection>
  );
}

// Pricing card
function PricingCard({ plan, price, features, popular, cta, popularLabel, perEventLabel, freePrice }: {
  plan: string; price: string; features: string[]; popular?: boolean; cta?: string; popularLabel?: string; perEventLabel?: string; freePrice?: string;
}) {
  return (
    <div className={`relative rounded-2xl p-8 flex flex-col gap-4 h-full transition-all duration-200 ${
      popular
        ? "bg-gradient-to-br from-primary to-purple-700 text-white shadow-2xl shadow-primary/30 scale-105"
        : "bg-card border border-border hover:shadow-md"
    }`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
          {popularLabel || "Most Popular"}
        </div>
      )}
      <div>
        <div className={`text-sm font-semibold uppercase tracking-wide mb-1 ${popular ? "text-white/70" : "text-muted-foreground"}`}>{plan}</div>
        <div className={`font-display font-bold text-4xl ${popular ? "text-white" : "text-foreground"}`}>{price}</div>
        {price !== (freePrice || "$0") && <div className={`text-sm mt-1 ${popular ? "text-white/60" : "text-muted-foreground"}`}>{perEventLabel || "per event"}</div>}
      </div>
      <ul className="flex flex-col gap-2.5 flex-1">
        {features.map((f, i) => (
          <li key={i} className={`flex items-start gap-2.5 text-sm ${popular ? "text-white/90" : "text-foreground"}`}>
            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${popular ? "text-white" : "text-primary"}`} />
            {f}
          </li>
        ))}
      </ul>
      <Link href="/create">
        <Button
          className={`w-full mt-2 ${popular
            ? "bg-white text-primary hover:bg-white/90"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
          data-testid={`button-pricing-${plan.toLowerCase()}`}
        >
          {cta || "Get Started"}
        </Button>
      </Link>
    </div>
  );
}

// Comparison table
function ComparisonTable() {
  const rows = [
    { feature: "Free Tier", lp: "✓", gx: "✗", gc: "✗", rp: "✗" },
    { feature: "AI Face Search", lp: "✓", gx: "✗", gc: "✗", rp: "✗" },
    { feature: "Basic Paid Price", lp: "$19.99", gx: "$49+", gc: "$49+", rp: "$20" },
    { feature: "Storage Duration", lp: "24 months", gx: "12 months", gc: "6 months", rp: "6 months" },
    { feature: "Upload Window", lp: "12 months", gx: "90 days", gc: "30 days", rp: "30 days" },
    { feature: "Guest Limit", lp: "Unlimited", gx: "500", gc: "300", rp: "200" },
    { feature: "Audio Guestbook", lp: "✓", gx: "✓", gc: "✗", rp: "✗" },
    { feature: "Live Slideshow", lp: "✓", gx: "✗", gc: "✗", rp: "✗" },
    { feature: "No App Required", lp: "✓", gx: "✓", gc: "✓", rp: "✓" },
    { feature: "AI Moderation", lp: "✓", gx: "✗", gc: "✗", rp: "✗" },
  ];

  const isCheck = (v: string) => v === "✓";
  const isCross = (v: string) => v === "✗";

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 px-5 font-display font-semibold text-foreground w-48">Feature</th>
            <th className="py-4 px-4 font-display font-bold text-white bg-primary/90 rounded-t-sm">LensParty</th>
            <th className="py-4 px-4 font-semibold text-muted-foreground">Guestpix</th>
            <th className="py-4 px-4 font-semibold text-muted-foreground">GuestCam</th>
            <th className="py-4 px-4 font-semibold text-muted-foreground">Rompolo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-muted/30" : ""}`}>
              <td className="py-3.5 px-5 text-foreground font-medium">{row.feature}</td>
              <td className="py-3.5 px-4 text-center bg-primary/5 font-semibold">
                {isCheck(row.lp) ? <span className="text-green-500 font-bold">✓</span> :
                 isCross(row.lp) ? <span className="text-muted-foreground">✗</span> :
                 <span className="text-primary">{row.lp}</span>}
              </td>
              <td className="py-3.5 px-4 text-center text-muted-foreground">
                {isCheck(row.gx) ? <span className="text-green-500">✓</span> :
                 isCross(row.gx) ? <span className="text-muted-foreground/50">✗</span> : row.gx}
              </td>
              <td className="py-3.5 px-4 text-center text-muted-foreground">
                {isCheck(row.gc) ? <span className="text-green-500">✓</span> :
                 isCross(row.gc) ? <span className="text-muted-foreground/50">✗</span> : row.gc}
              </td>
              <td className="py-3.5 px-4 text-center text-muted-foreground">
                {isCheck(row.rp) ? <span className="text-green-500">✓</span> :
                 isCross(row.rp) ? <span className="text-muted-foreground/50">✗</span> : row.rp}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Testimonial card — upgraded with avatar, variable stars, optional photo
const testimonials = [
  {
    quote: "347 photos from our wedding that we never would have seen. My aunt figured it out in seconds — no app needed.",
    name: "Sarah M.",
    event: "Wedding, June 2025",
    stars: 5,
    initials: "SM",
    color: "bg-purple-500",
    photo: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=200&fit=crop",
  },
  {
    quote: "Set up in 2 minutes. The live slideshow at the reception had everyone cheering when new photos appeared.",
    name: "Maria K.",
    event: "Birthday Party",
    stars: 5,
    initials: "MK",
    color: "bg-pink-500",
    photo: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=300&h=200&fit=crop",
  },
  {
    quote: "Great concept and mostly works perfectly. Wish there were more gallery themes, but for the price you can't beat it.",
    name: "David C.",
    event: "Corporate Event",
    stars: 4,
    initials: "DC",
    color: "bg-blue-500",
    photo: null,
  },
  {
    quote: "Lo usamos para el baby shower de mi hermana. 200+ fotos en una hora. Increíble.",
    name: "Ana R.",
    event: "Baby Shower",
    stars: 5,
    initials: "AR",
    color: "bg-rose-500",
    photo: null,
  },
  {
    quote: "We use LensParty for all our corporate offsites. The free tier alone replaces what we were paying $50/event for.",
    name: "James T.",
    event: "Event Planner",
    stars: 5,
    initials: "JT",
    color: "bg-emerald-500",
    photo: "https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=300&h=200&fit=crop",
  },
  {
    quote: "The AI face search found every single photo of my parents at the anniversary party. In seconds.",
    name: "Priya M.",
    event: "Anniversary Party",
    stars: 5,
    initials: "PM",
    color: "bg-amber-500",
    photo: null,
  },
];

function TestimonialCard({ testimonial, delay }: { testimonial: typeof testimonials[number]; delay: number }) {
  return (
    <AnimatedSection delay={delay}>
      <div className="p-6 rounded-xl border border-border bg-card flex flex-col gap-4 h-full">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full ${testimonial.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {testimonial.initials}
          </div>
          <div className="min-w-0">
            <div className="font-display font-semibold text-sm text-foreground truncate">{testimonial.name}</div>
            <div className="text-xs text-muted-foreground truncate">{testimonial.event}</div>
          </div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < testimonial.stars ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`} />
          ))}
        </div>
        <p className="text-foreground text-sm leading-relaxed flex-1">"{testimonial.quote}"</p>
        {testimonial.photo && (
          <div className="rounded-lg overflow-hidden border border-border">
            <img src={testimonial.photo} alt="Event photo" className="w-full h-28 object-cover" loading="lazy" />
          </div>
        )}
      </div>
    </AnimatedSection>
  );
}

// FAQ accordion item
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left font-display font-semibold text-sm text-foreground hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(o => !o)}
        data-testid={`faq-${question.substring(0, 20).toLowerCase().replace(/\s+/g, '-')}`}
      >
        {question}
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const { data: user } = useQuery<{ id: number; email: string; name: string; eventsCount: number } | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen text-foreground" style={{ scrollBehavior: "smooth", backgroundColor: theme === "dark" ? undefined : "#FFFBF7" }}>
      {/* Font import */}
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,500;1,600&display=swap');
        .font-display { font-family: 'Clash Display', 'Satoshi', sans-serif; }
        .font-script { font-family: 'Playfair Display', Georgia, serif; font-style: italic; }
        @keyframes floatUp {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float-anim { animation: floatUp 3s ease-in-out infinite; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-marquee-slow { animation: marquee 45s linear infinite; }
      `}</style>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center px-4 md:px-6 lg:px-12">
        <div className="flex items-center gap-2 mr-4 md:mr-8">
          <LensLogo size={28} />
          <span className="font-display font-bold text-lg text-foreground">LensParty</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 flex-1">
          <button onClick={() => scrollTo("features")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.features")}</button>
          <button onClick={() => scrollTo("pricing")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.pricing")}</button>
          <button onClick={() => scrollTo("how-it-works")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.howItWorks")}</button>
          <Link href="/demo">
            <span className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors cursor-pointer" data-testid="link-nav-demo">Live Demo</span>
          </Link>
          {user && (
            <Link href="/my-events">
              <span className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors cursor-pointer" data-testid="link-my-events">{t("nav.myEvents")}</span>
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden md:flex w-9 h-9 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <LanguageSwitcher />
          {user ? (
            <Link href="/my-events">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold text-xs md:text-sm px-3 md:px-4" data-testid="button-nav-my-events">
                {t("nav.myEvents")}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <span className="hidden md:inline text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium" data-testid="link-sign-in">{t("nav.signIn")}</span>
              </Link>
              <Link href="/login">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold text-xs md:text-sm px-3 md:px-4" data-testid="button-nav-create">
                  {t("nav.getStarted")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/8 dark:from-primary/15 dark:via-background dark:to-accent/15 pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 rounded-full px-4 py-1.5 w-fit">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-primary font-display">{t("hero.badge")}</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-foreground leading-tight">
              {t("hero.title1")}<br />
              {t("hero.title2")}<br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t("hero.title3")}</span>
            </h1>
            <p className="font-script text-xl text-muted-foreground/80">{t("hero.tagline")}</p>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login">
                <Button
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground font-display font-semibold px-6 py-5 text-base shadow-lg shadow-primary/25"
                  data-testid="button-hero-create"
                >
                  {t("hero.cta")}
                </Button>
              </Link>
              <Button
                variant="outline"
                className="font-display font-semibold px-6 py-5 text-base"
                onClick={() => scrollTo("how-it-works")}
                data-testid="button-hero-how"
              >
                {t("hero.howItWorks")}
              </Button>
            </div>
            <Link href="/demo">
              <span className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors cursor-pointer" data-testid="link-hero-demo">
                Try Live Demo →
              </span>
            </Link>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-500" />{t("hero.noCreditCard")}</div>
              <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-500" />{t("hero.freePlan")}</div>
              <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-500" />{t("hero.quickSetup")}</div>
            </div>
          </div>

          {/* Animated phone mockup */}
          <div className="hidden lg:flex items-center justify-center py-8">
            <HeroPhoneMockup />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10 px-6 lg:px-12 bg-muted/40 border-y border-border/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "10,000+", label: t("stats.events") },
            { value: "1.2M+", label: t("stats.photos") },
            { value: "4.9 ★", label: t("stats.rating") },
            { value: "98%", label: t("stats.recommend") },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-display font-bold text-2xl sm:text-3xl text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-8 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            {t("trust.banner")}
          </p>
          <div className="mt-2 text-lg tracking-widest">
            🇺🇸 🇬🇧 🇫🇷 🇪🇸 🇵🇹 🇧🇷 🇩🇪 🇮🇹 🇯🇵 🇦🇺
          </div>
        </div>
      </section>

      {/* Auto-scrolling Photo Carousel */}
      <section className="py-10 overflow-hidden">
        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {[
            { src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=300&h=200&fit=crop", alt: "Wedding guests taking selfie" },
            { src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=200&fit=crop", alt: "Friends taking group selfie" },
            { src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop", alt: "Friends celebrating with drinks" },
            { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=200&fit=crop", alt: "Wedding celebration moment" },
            { src: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=300&h=200&fit=crop", alt: "Friends hugging at party" },
            { src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&h=200&fit=crop", alt: "Happy crowd at event" },
            { src: "https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=300&h=200&fit=crop", alt: "Friends at sunset celebration" },
            { src: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=300&h=200&fit=crop", alt: "Friends laughing together" },
            { src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=300&h=200&fit=crop", alt: "Wedding guests taking selfie" },
            { src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=200&fit=crop", alt: "Friends taking group selfie" },
            { src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop", alt: "Friends celebrating with drinks" },
            { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=200&fit=crop", alt: "Wedding celebration moment" },
            { src: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=300&h=200&fit=crop", alt: "Friends hugging at party" },
            { src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&h=200&fit=crop", alt: "Happy crowd at event" },
            { src: "https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=300&h=200&fit=crop", alt: "Friends at sunset celebration" },
            { src: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=300&h=200&fit=crop", alt: "Friends laughing together" },
          ].map((photo, i) => (
            <div key={i} className="flex-shrink-0 w-56 h-36 mx-2 rounded-xl overflow-hidden shadow-md">
              <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 font-display">{t("howItWorks.label")}</div>
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">{t("howItWorks.title")}</h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">{t("howItWorks.subtitle")}</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-10">
            <StepCard number="1" icon={Calendar} title={t("howItWorks.step1Title")} desc={t("howItWorks.step1Desc")} delay={100} />
            <StepCard number="2" icon={QrCode} title={t("howItWorks.step2Title")} desc={t("howItWorks.step2Desc")} delay={200} />
            <StepCard number="3" icon={Images} title={t("howItWorks.step3Title")} desc={t("howItWorks.step3Desc")} delay={300} />
          </div>

          {/* Zero Friction Banner */}
          <AnimatedSection delay={400} className="mt-16">
            <div className="relative rounded-2xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 dark:from-primary/20 dark:via-accent/10 dark:to-primary/20 border border-primary/15 p-8 md:p-10">
              <div className="text-center mb-8">
                <h3 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">{t("zeroFriction.title")}</h3>
                <p className="text-muted-foreground text-base">{t("zeroFriction.subtitle")}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                  { emoji: "📱", title: t("zeroFriction.noApp"), desc: t("zeroFriction.noAppDesc") },
                  { emoji: "🔓", title: t("zeroFriction.noLogin"), desc: t("zeroFriction.noLoginDesc") },
                  { emoji: "💰", title: t("zeroFriction.noCost"), desc: t("zeroFriction.noCostDesc") },
                  { emoji: "🧠", title: t("zeroFriction.noTech"), desc: t("zeroFriction.noTechDesc") },
                ].map((item, i) => (
                  <div key={i} className="text-center flex flex-col items-center gap-2">
                    <div className="text-3xl md:text-4xl">{item.emoji}</div>
                    <div className="font-display font-bold text-sm md:text-base text-foreground">{item.title}</div>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <p className="font-serif italic text-primary/70 text-base">{t("zeroFriction.quote")}</p>
                <p className="text-muted-foreground text-xs mt-1">{t("zeroFriction.quoteAuthor")}</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Scrolling Event-Type Badges */}
      <section className="py-8 overflow-hidden border-y border-border/30">
        <div className="flex animate-marquee-slow" style={{ width: "max-content" }}>
          {[
            "💒 Weddings", "🎂 Birthdays", "🏢 Corporate", "👶 Baby Showers", "🎓 Graduations",
            "🎄 Holiday Parties", "🎤 Concerts", "🏖️ Reunions", "🥂 Engagements", "🎃 Halloween",
            "🍾 New Year's Eve", "🏆 Award Nights", "🎪 Festivals", "🙏 Memorials",
            "💒 Weddings", "🎂 Birthdays", "🏢 Corporate", "👶 Baby Showers", "🎓 Graduations",
            "🎄 Holiday Parties", "🎤 Concerts", "🏖️ Reunions", "🥂 Engagements", "🎃 Halloween",
            "🍾 New Year's Eve", "🏆 Award Nights", "🎪 Festivals", "🙏 Memorials",
          ].map((badge, i) => (
            <span
              key={i}
              className="flex-shrink-0 mx-3 px-5 py-2 rounded-full bg-primary/5 dark:bg-primary/10 text-sm font-display font-semibold text-foreground whitespace-nowrap border border-primary/10"
            >
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 font-display">{t("useCases.label")}</div>
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">{t("useCases.title")}</h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">{t("useCases.subtitle")}</p>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <UseCaseCard emoji="💒" title={t("useCases.weddings")} desc={t("useCases.weddingsDesc")} bg="bg-purple-50 dark:bg-purple-950/30" delay={0} />
            <UseCaseCard emoji="🎂" title={t("useCases.birthdays")} desc={t("useCases.birthdaysDesc")} bg="bg-yellow-50 dark:bg-yellow-950/30" delay={60} />
            <UseCaseCard emoji="🏢" title={t("useCases.corporate")} desc={t("useCases.corporateDesc")} bg="bg-blue-50 dark:bg-blue-950/30" delay={120} />
            <UseCaseCard emoji="👶" title={t("useCases.babyShower")} desc={t("useCases.babyShowerDesc")} bg="bg-pink-50 dark:bg-pink-950/30" delay={180} />
            <UseCaseCard emoji="🎓" title={t("useCases.graduations")} desc={t("useCases.graduationsDesc")} bg="bg-green-50 dark:bg-green-950/30" delay={240} />
            <UseCaseCard emoji="🎉" title={t("useCases.celebrations")} desc={t("useCases.celebrationsDesc")} bg="bg-orange-50 dark:bg-orange-950/30" delay={300} />
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 px-6 lg:px-12 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl text-foreground">{t("trust.title")}</h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { emoji: "🔒", title: t("trust.privacy"), desc: t("trust.privacyDesc") },
              { emoji: "💯", title: t("trust.ownership"), desc: t("trust.ownershipDesc") },
              { emoji: "💸", title: t("trust.guarantee"), desc: t("trust.guaranteeDesc") },
              { emoji: "🛟", title: t("trust.support"), desc: t("trust.supportDesc") },
            ].map((signal, i) => (
              <AnimatedSection key={i} delay={i * 80}>
                <div className="text-center p-5 rounded-xl bg-card border border-border h-full">
                  <div className="text-3xl mb-3">{signal.emoji}</div>
                  <h3 className="font-display font-bold text-sm text-foreground mb-1">{signal.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{signal.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 font-display">{t("painPoints.subtitle")}</div>
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">{t("painPoints.title")}</h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">{t("painPoints.subtitle")}</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            <PainPointCard emoji="😤" title={t("painPoints.followUps")} desc={t("painPoints.followUpsDesc")} delay={0} />
            <PainPointCard emoji="📉" title={t("painPoints.quality")} desc={t("painPoints.qualityDesc")} delay={80} />
            <PainPointCard emoji="💸" title={t("painPoints.expensive")} desc={t("painPoints.expensiveDesc")} delay={160} />
          </div>
          <AnimatedSection delay={200} className="text-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-6" />
            <p className="font-display font-semibold text-lg text-foreground">{t("painPoints.solution")}</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Why Traditional Methods Fail — Comparison Table */}
      <section className="py-20 px-6 lg:px-12 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 font-display">THE REALITY CHECK</div>
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">Why Traditional Methods Fail</h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">Don't risk your memories getting lost in group chats, forgotten passwords, or on disposable cameras.</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <div className="overflow-x-auto -mx-6 px-6">
              <div className="min-w-[700px]">
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm" data-testid="comparison-traditional-table">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left py-4 px-4 font-display font-semibold text-foreground w-36">Feature</th>
                        <th className="py-4 px-3 text-center">
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Winner</span>
                            <span className="font-display font-bold text-primary">LensParty</span>
                          </div>
                        </th>
                        <th className="py-4 px-3 font-display font-semibold text-muted-foreground text-center">Disposable Cameras</th>
                        <th className="py-4 px-3 font-display font-semibold text-muted-foreground text-center">Group Text</th>
                        <th className="py-4 px-3 font-display font-semibold text-muted-foreground text-center">Shared Album</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { feature: "Setup Work", lp: { s: "good", main: "Ready-to-Use", sub: "Place QR code" }, dc: { s: "bad", main: "Buy & Place", sub: "50+ cameras" }, gt: { s: "bad", main: "Manual Add", sub: "Every number" }, sa: { s: "bad", main: "Invite All", sub: "Select 100+" } },
                        { feature: "Guest Experience", lp: { s: "good", main: "Just Scan QR", sub: "No numbers" }, dc: { s: "warn", main: "Find Camera", sub: "Limited shots" }, gt: { s: "bad", main: "Need Info", sub: "Ask everyone" }, sa: { s: "bad", main: "Need Apple ID", sub: "Must login" } },
                        { feature: "Android Guests", lp: { s: "good", main: "Works 100%", sub: "" }, dc: { s: "good", main: "Anyone", sub: "Physical" }, gt: { s: "bad", main: "Breaks Chat", sub: "Green bubble" }, sa: { s: "bad", main: "Excluded", sub: "Or web only" } },
                        { feature: "Video Quality", lp: { s: "good", main: "Full HD", sub: "" }, dc: { s: "bad", main: "No Video", sub: "Photos only" }, gt: { s: "bad", main: "Pixelated", sub: "MMS limit" }, sa: { s: "warn", main: "Compressed", sub: "Save space" } },
                        { feature: "Photo Quality", lp: { s: "good", main: "Original Resolution", sub: "" }, dc: { s: "warn", main: "Varies", sub: "Film quality" }, gt: { s: "bad", main: "Compressed", sub: "Auto-shrink" }, sa: { s: "good", main: "Original", sub: "If uploaded" } },
                        { feature: "Photo Collection", lp: { s: "good", main: "Automatic", sub: "Real-time" }, dc: { s: "bad", main: "Manual", sub: "Develop film" }, gt: { s: "bad", main: "Scattered", sub: "Multiple chats" }, sa: { s: "warn", main: "Manual Upload", sub: "" } },
                        { feature: "Cost", lp: { s: "good", main: "Free", sub: "Or from $19.99" }, dc: { s: "bad", main: "$200+", sub: "50 cameras + develop" }, gt: { s: "good", main: "Free", sub: "But painful" }, sa: { s: "good", main: "Free", sub: "Apple only" } },
                        { feature: "Privacy", lp: { s: "good", main: "Private & Encrypted", sub: "" }, dc: { s: "good", main: "Physical", sub: "No cloud" }, gt: { s: "bad", main: "Shared Everywhere", sub: "" }, sa: { s: "warn", main: "Apple's Terms", sub: "" } },
                      ].map((row, i) => (
                        <tr key={i} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                          <td className="py-3 px-4 font-display font-semibold text-foreground text-sm">{row.feature}</td>
                          {[row.lp, row.dc, row.gt, row.sa].map((cell, ci) => (
                            <td key={ci} className={`py-3 px-3 text-center ${ci === 0 ? "bg-primary/5" : ""}`}>
                              <div className="flex flex-col items-center gap-0.5">
                                <div className="flex items-center gap-1">
                                  {cell.s === "good" && <Check className="w-3.5 h-3.5 text-green-500" />}
                                  {cell.s === "warn" && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                                  {cell.s === "bad" && <X className="w-3.5 h-3.5 text-red-400" />}
                                  <span className={`font-semibold text-xs ${cell.s === "good" ? "text-green-600 dark:text-green-400" : cell.s === "warn" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                                    {cell.main}
                                  </span>
                                </div>
                                {cell.sub && <span className="text-[10px] text-muted-foreground">{cell.sub}</span>}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 font-display">{t("features.label")}</div>
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">{t("features.title")}</h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">{t("features.subtitle")}</p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={Smartphone} title={t("features.noApp")} desc={t("features.noAppDesc")} delay={0} />
            <FeatureCard icon={ScanFace} title={t("features.faceSearch")} desc={t("features.faceSearchDesc")} delay={80} />
            <FeatureCard icon={MonitorPlay} title={t("features.slideshow")} desc={t("features.slideshowDesc")} delay={160} />
            <FeatureCard icon={Mic} title={t("features.guestbook")} desc={t("features.guestbookDesc")} delay={240} />
            <FeatureCard icon={ShieldCheck} title={t("features.moderation")} desc={t("features.moderationDesc")} delay={320} />
            <FeatureCard icon={Palette} title={t("features.themes")} desc={t("features.themesDesc")} delay={400} />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 lg:px-12 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 font-display">{t("pricing.label")}</div>
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">{t("pricing.title")}</h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">{t("pricing.subtitle")}</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <AnimatedSection delay={0}>
              <PricingCard
                plan={t("pricing.free")}
                price={t("currency.free")}
                cta={t("pricing.startFree")}
                freePrice={t("currency.free")}
                perEventLabel={t("pricing.perEvent")}
                features={t("pricing.freeFeatures", { returnObjects: true }) as string[]}
              />
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <PricingCard
                plan={t("pricing.pro")}
                price={t("currency.pro")}
                popular
                cta={t("pricing.getPro")}
                popularLabel={t("pricing.mostPopular")}
                freePrice={t("currency.free")}
                perEventLabel={t("pricing.perEvent")}
                features={t("pricing.proFeatures", { returnObjects: true }) as string[]}
              />
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <PricingCard
                plan={t("pricing.business")}
                price={t("currency.business")}
                cta={t("pricing.getBusiness")}
                freePrice={t("currency.free")}
                perEventLabel={t("pricing.perEvent")}
                features={t("pricing.businessFeatures", { returnObjects: true }) as string[]}
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 font-display">{t("comparison.label")}</div>
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">{t("comparison.title")}</h2>
            <p className="text-muted-foreground text-base max-w-md mx-auto">{t("comparison.subtitle")}</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <ComparisonTable />
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 lg:px-12 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 font-display">{t("testimonials.label")}</div>
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">{t("testimonials.title")}</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((tm, i) => (
              <TestimonialCard key={i} testimonial={tm} delay={i * 60} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 lg:px-12">
        <div className="max-w-2xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 font-display">{t("faq.label")}</div>
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">{t("faq.title")}</h2>
          </AnimatedSection>
          <AnimatedSection delay={50} className="flex flex-col gap-3">
            <FaqItem question={t("faq.q1")} answer={t("faq.a1")} />
            <FaqItem question={t("faq.q2")} answer={t("faq.a2")} />
            <FaqItem question={t("faq.q3")} answer={t("faq.a3")} />
            <FaqItem question={t("faq.q4")} answer={t("faq.a4")} />
            <FaqItem question={t("faq.q5")} answer={t("faq.a5")} />
            <FaqItem question={t("faq.q6")} answer={t("faq.a6")} />
            <FaqItem question={t("faq.q7")} answer={t("faq.a7")} />
            <FaqItem question={t("faq.q8")} answer={t("faq.a8")} />
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-primary via-purple-700 to-accent/80">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl text-white mb-4">{t("cta.title")}</h2>
          <p className="text-white/80 text-base mb-8">{t("cta.subtitle")}</p>
          <Link href="/login">
            <Button
              className="bg-white text-primary hover:bg-white/90 font-display font-bold px-8 py-5 text-base shadow-xl"
              data-testid="button-cta-create"
            >
              {t("cta.button")}
            </Button>
          </Link>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 lg:px-12 border-t border-border bg-background">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LensLogo size={22} />
            <span className="font-display font-bold text-base text-foreground">LensParty</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors">{t("nav.features")}</button>
            <button onClick={() => scrollTo("pricing")} className="hover:text-foreground transition-colors">{t("nav.pricing")}</button>
            <button onClick={() => scrollTo("faq")} className="hover:text-foreground transition-colors">{t("faq.label")}</button>
          </div>
          <div className="text-sm text-muted-foreground">© 2026 LensParty. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
