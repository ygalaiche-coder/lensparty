import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

function LensLogo({ size = 24 }: { size?: number }) {
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

interface TocItem {
  id: string;
  title: string;
}

interface LegalPageProps {
  title: string;
  effectiveDate: string;
  tocItems: TocItem[];
  children: React.ReactNode;
}

export default function LegalPage({ title, effectiveDate, tocItems, children }: LegalPageProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    for (const item of tocItems) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [tocItems]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-background flex flex-col">
      <style>{`@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap');`}</style>

      {/* Header */}
      <header className="h-16 border-b border-border/50 bg-white/80 dark:bg-background/80 backdrop-blur-sm sticky top-0 z-50 flex items-center px-6">
        <Link href="/">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <LensLogo size={20} />
            <span className="font-[Clash_Display] font-bold text-base">LensParty</span>
          </button>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 flex gap-12">
        {/* Sidebar TOC — desktop only */}
        <aside className="hidden lg:block w-56 shrink-0">
          <nav className="sticky top-28">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 font-[Clash_Display]">
              On this page
            </div>
            <ul className="flex flex-col gap-1.5">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`text-sm text-left w-full px-3 py-1.5 rounded-md transition-colors ${
                      activeId === item.id
                        ? "text-primary bg-primary/5 font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 max-w-3xl">
          <div className="mb-10">
            <h1 className="font-[Clash_Display] font-bold text-4xl text-foreground mb-3">{title}</h1>
            <p className="text-muted-foreground text-sm font-[Satoshi]">Effective date: {effectiveDate}</p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none font-[Satoshi]
            prose-headings:font-[Clash_Display] prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:scroll-mt-24
            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-muted-foreground
            prose-li:text-[15px] prose-li:text-muted-foreground
            prose-strong:text-foreground
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          ">
            {children}
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-border/50 text-sm text-muted-foreground font-[Satoshi]">
            <p>
              Questions about this policy? Contact us at{" "}
              <a href="mailto:support@lensparty.com" className="text-primary hover:underline">
                support@lensparty.com
              </a>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
