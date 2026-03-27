import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Loader2, Sparkles, Crown } from "lucide-react";
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

interface PlansResponse {
  enabled: boolean;
  plans: {
    pro: { name: string; price: number; priceDisplay: string; features: string[] };
    business: { name: string; price: number; priceDisplay: string; features: string[] };
  };
  publishableKey: string | null;
}

export default function UpgradePage() {
  const params = useParams<{ eventId: string }>();
  const eventId = parseInt(params.eventId || "0");
  const { toast } = useToast();

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ["/api/events", eventId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/events/${eventId}`);
      return res.json();
    },
    enabled: !!eventId,
  });

  const { data: plansData, isLoading: plansLoading } = useQuery<PlansResponse>({
    queryKey: ["/api/plans"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const checkoutMutation = useMutation({
    mutationFn: async (plan: "pro" | "business") => {
      const res = await apiRequest("POST", "/api/checkout", { plan, eventId });
      return res.json() as Promise<{ url: string }>;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (err: any) => {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    },
  });

  const isLoading = eventLoading || plansLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">Event not found</p>
          <Link href="/my-events"><Button>Back to Events</Button></Link>
        </div>
      </div>
    );
  }

  const paymentsEnabled = plansData?.enabled ?? false;
  const plans = plansData?.plans;
  const currentPlan = event.plan || "free";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <style>{`@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap');`}</style>

      {/* Header */}
      <header className="h-16 border-b border-border flex items-center px-6 gap-3">
        <Link href="/">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="button-back-event">
            <ArrowLeft className="w-4 h-4" />
            <LensLogo size={20} />
            <span className="font-display font-bold text-sm">LensParty</span>
          </button>
        </Link>
      </header>

      <div className="flex-1 px-4 py-10 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">Upgrade {event.name}</h1>
          <p className="text-muted-foreground text-sm">Unlock premium features for your event</p>
          {currentPlan !== "free" && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-green-500/10 text-green-600 text-xs font-semibold px-3 py-1 rounded-full">
              <Check className="w-3 h-3" />
              Currently on {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            </div>
          )}
        </div>

        {!paymentsEnabled ? (
          <div className="text-center py-16" data-testid="payments-disabled">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground mb-2">Coming Soon</h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Premium plans are launching soon. Your event will continue to work on the free tier.
            </p>
            <Link href={`/event/${eventId}`}>
              <Button variant="outline" className="mt-6" data-testid="button-back-to-event">
                Back to Event
              </Button>
            </Link>
          </div>
        ) : plans ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pro Plan */}
            <div className={`relative rounded-2xl p-8 flex flex-col gap-4 h-full transition-all duration-200 ${
              currentPlan === "pro"
                ? "bg-green-500/5 border-2 border-green-500/30"
                : "bg-gradient-to-br from-primary to-purple-700 text-white shadow-2xl shadow-primary/30"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className={`w-5 h-5 ${currentPlan === "pro" ? "text-green-600" : "text-white/80"}`} />
                <span className={`text-sm font-semibold uppercase tracking-wide ${currentPlan === "pro" ? "text-green-600" : "text-white/70"}`}>Pro</span>
              </div>
              <div className={`font-display font-bold text-4xl ${currentPlan === "pro" ? "text-foreground" : "text-white"}`}>
                {plans.pro.priceDisplay}
              </div>
              <div className={`text-sm ${currentPlan === "pro" ? "text-muted-foreground" : "text-white/60"}`}>per event</div>
              <ul className="flex flex-col gap-2.5 flex-1">
                {plans.pro.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2.5 text-sm ${currentPlan === "pro" ? "text-foreground" : "text-white/90"}`}>
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${currentPlan === "pro" ? "text-green-500" : "text-white"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              {currentPlan === "pro" ? (
                <div className="w-full mt-2 py-3 text-center text-sm font-display font-semibold text-green-600 bg-green-500/10 rounded-lg" data-testid="badge-current-pro">
                  Current Plan
                </div>
              ) : (
                <Button
                  className="w-full mt-2 bg-white text-primary hover:bg-white/90 font-display font-bold"
                  onClick={() => checkoutMutation.mutate("pro")}
                  disabled={checkoutMutation.isPending}
                  data-testid="button-upgrade-pro"
                >
                  {checkoutMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Upgrade to Pro
                </Button>
              )}
            </div>

            {/* Business Plan */}
            <div className={`relative rounded-2xl p-8 flex flex-col gap-4 h-full transition-all duration-200 ${
              currentPlan === "business"
                ? "bg-green-500/5 border-2 border-green-500/30"
                : "bg-card border border-border hover:shadow-md"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Crown className={`w-5 h-5 ${currentPlan === "business" ? "text-green-600" : "text-primary"}`} />
                <span className={`text-sm font-semibold uppercase tracking-wide ${currentPlan === "business" ? "text-green-600" : "text-muted-foreground"}`}>Business</span>
              </div>
              <div className={`font-display font-bold text-4xl ${currentPlan === "business" ? "text-foreground" : "text-foreground"}`}>
                {plans.business.priceDisplay}
              </div>
              <div className="text-sm text-muted-foreground">per event</div>
              <ul className="flex flex-col gap-2.5 flex-1">
                {plans.business.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${currentPlan === "business" ? "text-green-500" : "text-primary"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              {currentPlan === "business" ? (
                <div className="w-full mt-2 py-3 text-center text-sm font-display font-semibold text-green-600 bg-green-500/10 rounded-lg" data-testid="badge-current-business">
                  Current Plan
                </div>
              ) : (
                <Button
                  className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold"
                  onClick={() => checkoutMutation.mutate("business")}
                  disabled={checkoutMutation.isPending}
                  data-testid="button-upgrade-business"
                >
                  {checkoutMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Upgrade to Business
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
