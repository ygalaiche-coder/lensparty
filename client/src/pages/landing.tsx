import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
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

// Phone mockup illustration
function HeroMockup() {
  return (
    <div className="relative flex items-center justify-center h-[420px] w-full max-w-lg mx-auto">
      {/* Floating photo cards */}
      <div className="absolute top-4 left-0 w-28 h-20 rounded-xl overflow-hidden shadow-xl border-2 border-white/80 dark:border-white/20 rotate-[-8deg] z-10 bg-gradient-to-br from-purple-400 to-pink-400">
        <div className="w-full h-full flex items-center justify-center">
          <Camera className="w-8 h-8 text-white/80" />
        </div>
      </div>
      <div className="absolute top-8 right-0 w-24 h-32 rounded-xl overflow-hidden shadow-xl border-2 border-white/80 dark:border-white/20 rotate-[6deg] z-10 bg-gradient-to-br from-pink-400 to-orange-400">
        <div className="w-full h-full flex items-center justify-center">
          <Images className="w-8 h-8 text-white/80" />
        </div>
      </div>
      <div className="absolute bottom-8 left-4 w-20 h-24 rounded-xl overflow-hidden shadow-xl border-2 border-white/80 dark:border-white/20 rotate-[4deg] z-10 bg-gradient-to-br from-blue-400 to-purple-400">
        <div className="w-full h-full flex items-center justify-center">
          <Star className="w-8 h-8 text-white/80" />
        </div>
      </div>
      <div className="absolute bottom-4 right-6 w-28 h-20 rounded-xl overflow-hidden shadow-xl border-2 border-white/80 dark:border-white/20 rotate-[-5deg] z-10 bg-gradient-to-br from-green-400 to-teal-400">
        <div className="w-full h-full flex items-center justify-center">
          <Zap className="w-8 h-8 text-white/80" />
        </div>
      </div>

      {/* Phone frame */}
      <div className="relative z-20 w-48 h-80 bg-gray-900 dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border-4 border-gray-700 flex flex-col overflow-hidden">
        {/* Status bar */}
        <div className="h-8 bg-gray-900 dark:bg-gray-800 flex items-center justify-center">
          <div className="w-20 h-4 bg-gray-800 dark:bg-gray-700 rounded-full" />
        </div>
        {/* Screen content */}
        <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4 gap-3">
          <div className="text-[10px] font-display font-bold text-primary text-center">LensParty</div>
          {/* QR code grid */}
          <div className="w-20 h-20 bg-gray-900 rounded-lg p-2">
            <div className="w-full h-full grid grid-cols-5 gap-0.5">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[1px]"
                  style={{
                    backgroundColor: [0,1,2,5,6,7,10,12,17,18,19,20,21,22,23,24].includes(i)
                      ? "#1a1a2e" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="text-[8px] text-gray-500 text-center">Scan to upload photos</div>
          <div className="w-full h-px bg-gray-100 dark:bg-gray-700" />
          {/* Mini gallery */}
          <div className="grid grid-cols-2 gap-1 w-full">
            {["from-purple-400 to-pink-400","from-pink-400 to-red-400","from-blue-400 to-purple-400","from-green-400 to-teal-400"].map((grad, i) => (
              <div key={i} className={`h-10 rounded bg-gradient-to-br ${grad} flex items-center justify-center`}>
                <Camera className="w-3 h-3 text-white/80" />
              </div>
            ))}
          </div>
        </div>
        {/* Home indicator */}
        <div className="h-8 bg-gray-900 dark:bg-gray-800 flex items-end justify-center pb-2">
          <div className="w-12 h-1 bg-gray-600 rounded-full" />
        </div>
      </div>

      {/* Upload arrow animations */}
      <div className="absolute left-[55%] top-1/3 flex flex-col gap-1 z-30">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1 h-4 rounded-full bg-primary/40"
            style={{ animationDelay: `${i * 0.2}s`, animation: "bounce 1.5s infinite" }}
          />
        ))}
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

// Pricing card
function PricingCard({ plan, price, features, popular, cta }: {
  plan: string; price: string; features: string[]; popular?: boolean; cta?: string;
}) {
  return (
    <div className={`relative rounded-2xl p-8 flex flex-col gap-4 h-full transition-all duration-200 ${
      popular
        ? "bg-gradient-to-br from-primary to-purple-700 text-white shadow-2xl shadow-primary/30 scale-105"
        : "bg-card border border-border hover:shadow-md"
    }`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
          Most Popular
        </div>
      )}
      <div>
        <div className={`text-sm font-semibold uppercase tracking-wide mb-1 ${popular ? "text-white/70" : "text-muted-foreground"}`}>{plan}</div>
        <div className={`font-display font-bold text-4xl ${popular ? "text-white" : "text-foreground"}`}>{price}</div>
        {price !== "$0" && <div className={`text-sm mt-1 ${popular ? "text-white/60" : "text-muted-foreground"}`}>per event</div>}
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

// Testimonial card
function TestimonialCard({ quote, name, event, delay }: { quote: string; name: string; event: string; delay: number }) {
  return (
    <AnimatedSection delay={delay}>
      <div className="p-6 rounded-xl border border-border bg-card flex flex-col gap-4 h-full">
        <div className="flex gap-1">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-foreground text-sm leading-relaxed flex-1">"{quote}"</p>
        <div>
          <div className="font-display font-semibold text-sm text-foreground">{name}</div>
          <div className="text-xs text-muted-foreground">{event}</div>
        </div>
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

  const { data: user } = useQuery<{ id: number; email: string; name: string; eventsCount: number } | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ scrollBehavior: "smooth" }}>
      {/* Font import */}
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap');
        .font-display { font-family: 'Clash Display', 'Satoshi', sans-serif; }
        @keyframes floatUp {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float-anim { animation: floatUp 3s ease-in-out infinite; }
      `}</style>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center px-6 lg:px-12">
        <div className="flex items-center gap-2 mr-8">
          <LensLogo size={28} />
          <span className="font-display font-bold text-lg text-foreground">LensParty</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 flex-1">
          <button onClick={() => scrollTo("features")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</button>
          <button onClick={() => scrollTo("pricing")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
          <button onClick={() => scrollTo("how-it-works")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</button>
          {user && (
            <Link href="/my-events">
              <span className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors cursor-pointer" data-testid="link-my-events">My Events</span>
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {user ? (
            <Link href="/my-events">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold" data-testid="button-nav-my-events">
                My Events
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium" data-testid="link-sign-in">Sign In</span>
              </Link>
              <Link href="/login">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold" data-testid="button-nav-create">
                  Get Started Free
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
              <span className="text-xs font-semibold text-primary font-display">Free QR Photo Sharing</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-foreground leading-tight">
              Every Guest.<br />
              Every Angle.<br />
              <span className="gradient-text">One Album.</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              Free QR code photo sharing for your events. Guests scan, upload, and relive moments — no app needed.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login">
                <Button
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground font-display font-semibold px-6 py-5 text-base shadow-lg shadow-primary/25"
                  data-testid="button-hero-create"
                >
                  Get Started Free
                </Button>
              </Link>
              <Button
                variant="outline"
                className="font-display font-semibold px-6 py-5 text-base"
                onClick={() => scrollTo("how-it-works")}
                data-testid="button-hero-how"
              >
                See How It Works
              </Button>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-500" />No credit card</div>
              <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-500" />Free forever plan</div>
              <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-500" />Setup in 30 seconds</div>
            </div>
          </div>

          {/* Mockup */}
          <div className="float-anim">
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 font-display">Simple Process</div>
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">Get your event photo album set up in under a minute.</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-10">
            <StepCard number="1" icon={Calendar} title="Create Your Event" desc="Name your event, pick a date, customize your gallery theme. Takes 30 seconds." delay={100} />
            <StepCard number="2" icon={QrCode} title="Share QR Code" desc="Print it, display it, text it. Guests scan with any phone camera — no app download needed." delay={200} />
            <StepCard number="3" icon={Images} title="Collect Memories" desc="Photos pour in from every angle. Browse, like, and download your complete album." delay={300} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 font-display">Everything You Need</div>
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">Packed With Features</h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">Professional-grade tools that just work, at a fraction of the cost of alternatives.</p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={Smartphone} title="No App Required" desc="Guests scan a QR code and upload directly from their browser. Zero friction." delay={0} />
            <FeatureCard icon={ScanFace} title="AI Face Search" desc="Find every photo of a specific person instantly. Built-in, not an add-on." delay={80} />
            <FeatureCard icon={MonitorPlay} title="Live Slideshow" desc="Display photos in real-time on any TV or projector. New uploads animate in live." delay={160} />
            <FeatureCard icon={Mic} title="Audio & Video Guestbook" desc="Guests leave voice and video messages alongside their photos." delay={240} />
            <FeatureCard icon={ShieldCheck} title="AI Smart Moderation" desc="Auto-filter inappropriate content so you can relax and enjoy your event." delay={320} />
            <FeatureCard icon={Palette} title="Beautiful Gallery Themes" desc="20+ customizable themes. Your gallery, your style." delay={400} />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 lg:px-12 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 font-display">Simple Pricing</div>
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">Plans for Every Event</h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">Start free, upgrade when you need more. No surprise charges.</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <AnimatedSection delay={0}>
              <PricingCard
                plan="Free"
                price="$0"
                cta="Start Free"
                features={[
                  "1 event",
                  "Up to 100 photos",
                  "50 guests",
                  "30-day upload window",
                  "6-month storage",
                  "Basic gallery theme",
                  "LensParty watermark",
                ]}
              />
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <PricingCard
                plan="Pro"
                price="$19.99"
                popular
                cta="Get Pro"
                features={[
                  "Unlimited photos & guests",
                  "AI face search",
                  "Audio & video guestbook",
                  "Live slideshow",
                  "20+ gallery themes",
                  "12-month upload window",
                  "24-month storage",
                  "No watermark",
                ]}
              />
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <PricingCard
                plan="Business"
                price="$39.99"
                cta="Get Business"
                features={[
                  "Everything in Pro",
                  "5 concurrent events",
                  "White-label branding",
                  "RSVP management",
                  "Analytics dashboard",
                  "Print ordering",
                  "AI video highlights",
                  "Priority support",
                ]}
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 font-display">Competitive Edge</div>
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">How We Compare</h2>
            <p className="text-muted-foreground text-base max-w-md mx-auto">See why thousands of hosts choose LensParty over the alternatives.</p>
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
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 font-display">Loved by Hosts</div>
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">What People Are Saying</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <TestimonialCard
              quote="Used LensParty for our wedding — 347 photos from guests we never would have seen otherwise."
              name="Sarah & James"
              event="Wedding"
              delay={0}
            />
            <TestimonialCard
              quote="Set up took 2 minutes. Our guests loved it. The live slideshow was the highlight of the reception."
              name="Maria K."
              event="Birthday Party"
              delay={80}
            />
            <TestimonialCard
              quote="We use LensParty for all our corporate events. The free tier alone beats what we were paying $50 for."
              name="David Chen"
              event="Event Planner"
              delay={160}
            />
            <TestimonialCard
              quote="The AI face search is incredible. Found every photo of my parents in seconds."
              name="Priya M."
              event="Anniversary Party"
              delay={240}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 lg:px-12">
        <div className="max-w-2xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 font-display">Got Questions?</div>
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">Frequently Asked</h2>
          </AnimatedSection>
          <AnimatedSection delay={50} className="flex flex-col gap-3">
            <FaqItem
              question="Do guests need to download an app?"
              answer="No app required. Guests simply scan the QR code with their phone's camera and upload directly from their browser. It works on any modern smartphone — iOS, Android, or anything else."
            />
            <FaqItem
              question="How does the free plan work?"
              answer="The free plan lets you create 1 event with up to 100 photos and 50 guests. Your gallery stays active for 6 months with a 30-day upload window. It's fully functional — great for smaller gatherings."
            />
            <FaqItem
              question="How long are photos stored?"
              answer="Free plan stores photos for 6 months. Pro plan stores them for 24 months, and Business extends to 36 months. You can always download a full ZIP backup at any time."
            />
            <FaqItem
              question="Can I download all photos at once?"
              answer="Yes! The host dashboard has a 'Download All' button that packages every photo into a ZIP file. Guests can also download individual photos directly from the gallery."
            />
            <FaqItem
              question="Is it available in other languages?"
              answer="The guest upload interface auto-detects the user's browser language and adapts accordingly. We currently support English, Spanish, French, Portuguese, and German, with more on the way."
            />
            <FaqItem
              question="How does the AI face search work?"
              answer="After uploading a reference selfie, our AI scans all event photos to find ones that contain that person's face. Results appear in seconds. The feature is available on Pro and Business plans and runs entirely on our secure servers — no data is shared with third parties."
            />
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-primary via-purple-700 to-accent/80">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl text-white mb-4">Ready to capture every moment?</h2>
          <p className="text-white/80 text-base mb-8">Create your first event for free. No credit card needed.</p>
          <Link href="/login">
            <Button
              className="bg-white text-primary hover:bg-white/90 font-display font-bold px-8 py-5 text-base shadow-xl"
              data-testid="button-cta-create"
            >
              Get Started Free
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
            <button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors">Features</button>
            <button onClick={() => scrollTo("pricing")} className="hover:text-foreground transition-colors">Pricing</button>
            <button onClick={() => scrollTo("faq")} className="hover:text-foreground transition-colors">FAQ</button>
          </div>
          <div className="text-sm text-muted-foreground">© 2026 LensParty. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
