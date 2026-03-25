import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, Images, Hash, Plus, LogOut, Loader2 } from "lucide-react";
import type { Event } from "@shared/schema";

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

type EventWithCount = Event & { photoCount: number };

export default function MyEventsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: user, isLoading: userLoading } = useQuery<{ id: number; email: string; name: string; eventsCount: number } | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: events, isLoading: eventsLoading } = useQuery<EventWithCount[]>({
    queryKey: ["/api/my/events"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
    },
    onError: (err: any) => {
      toast({ title: "Logout failed", description: err.message, variant: "destructive" });
    },
  });

  // Redirect to login if not authenticated
  if (!userLoading && !user) {
    navigate("/login");
    return null;
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <style>{`@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap');`}</style>

      {/* Header */}
      <header className="h-16 border-b border-border flex items-center px-6 gap-3">
        <Link href="/">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="button-back-home">
            <LensLogo size={22} />
            <span className="font-display font-bold text-base">LensParty</span>
          </button>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground" data-testid="text-user-name">{user?.name}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            {t("myEvents.logout")}
          </Button>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">{t("myEvents.title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("myEvents.subtitle")}</p>
          </div>
          <Link href="/create">
            <Button
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground font-display font-semibold shadow-lg shadow-primary/20"
              data-testid="button-create-event"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {t("myEvents.createNew")}
            </Button>
          </Link>
        </div>

        {eventsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !events || events.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="empty-state">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Images className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground mb-2">{t("myEvents.noEvents")}</h2>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              {t("myEvents.noEventsDesc")}
            </p>
            <Link href="/create">
              <Button
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground font-display font-semibold"
                data-testid="button-empty-create"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {t("myEvents.createFirst")}
              </Button>
            </Link>
          </div>
        ) : (
          /* Events grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="events-grid">
            {events.map((event) => (
              <Link key={event.id} href={`/event/${event.id}`}>
                <div
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
                  data-testid={`event-card-${event.id}`}
                >
                  <h3 className="font-display font-bold text-base text-foreground mb-3 line-clamp-1">{event.name}</h3>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground flex-1">
                    {event.eventDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{event.eventDate}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Images className="w-3.5 h-3.5" />
                      <span>{event.photoCount} {event.photoCount !== 1 ? t("myEvents.photos") : t("myEvents.photo")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5" />
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{event.code}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
