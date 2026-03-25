import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Calendar, ArrowLeft, Loader2, Camera } from "lucide-react";
import { Link } from "wouter";
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

interface FormData {
  name: string;
  eventDate: string;
  eventType: string;
  hostName: string;
  description: string;
}

export default function CreateEventPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [eventType, setEventType] = useState("other");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: "",
      eventDate: "",
      eventType: "other",
      hostName: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/events", {
        ...data,
        eventType,
        code: "", // will be overridden server-side
      });
      return res.json() as Promise<Event>;
    },
    onSuccess: (event) => {
      toast({ title: "Event created!", description: `Your event "${event.name}" is ready.` });
      navigate(`/event/${event.id}`);
    },
    onError: (err: any) => {
      toast({ title: "Failed to create event", description: err.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <style>{`@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap');`}</style>

      {/* Header */}
      <header className="h-16 border-b border-border flex items-center px-6 gap-3">
        <Link href="/">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4" />
            <LensLogo size={22} />
            <span className="font-display font-bold text-base">LensParty</span>
          </button>
        </Link>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            {/* Icon */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Camera className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-display font-bold text-xl text-foreground text-center">{t("createEvent.title")}</h1>
              <p className="text-muted-foreground text-sm text-center mt-1.5">{t("createEvent.subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              {/* Event Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="font-display font-semibold text-sm">
                  {t("createEvent.eventName")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder={t("createEvent.eventNamePlaceholder")}
                  {...register("name", { required: t("createEvent.required") })}
                  className={errors.name ? "border-destructive" : ""}
                  data-testid="input-event-name"
                />
                {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
              </div>

              {/* Event Date */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="eventDate" className="font-display font-semibold text-sm">
                  {t("createEvent.eventDate")}
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="eventDate"
                    type="date"
                    {...register("eventDate")}
                    className="pl-9"
                    data-testid="input-event-date"
                  />
                </div>
              </div>

              {/* Event Type */}
              <div className="flex flex-col gap-1.5">
                <Label className="font-display font-semibold text-sm">{t("createEvent.eventType")}</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger data-testid="select-event-type">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding">{t("createEvent.types.wedding")}</SelectItem>
                    <SelectItem value="birthday">{t("createEvent.types.birthday")}</SelectItem>
                    <SelectItem value="corporate">{t("createEvent.types.corporate")}</SelectItem>
                    <SelectItem value="baby-shower">{t("createEvent.types.babyShower")}</SelectItem>
                    <SelectItem value="graduation">{t("createEvent.types.graduation")}</SelectItem>
                    <SelectItem value="other">{t("createEvent.types.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Host Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="hostName" className="font-display font-semibold text-sm">
                  {t("createEvent.yourName")}
                </Label>
                <Input
                  id="hostName"
                  placeholder={t("createEvent.yourNamePlaceholder")}
                  {...register("hostName")}
                  data-testid="input-host-name"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description" className="font-display font-semibold text-sm">
                  {t("createEvent.description")} <span className="text-muted-foreground font-normal">({t("createEvent.optional")})</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder={t("createEvent.descriptionPlaceholder")}
                  rows={3}
                  {...register("description")}
                  className="resize-none"
                  data-testid="input-description"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground font-display font-bold py-5 text-base shadow-lg shadow-primary/20 mt-2"
                disabled={createMutation.isPending}
                data-testid="button-create-event"
              >
                {createMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("createEvent.creating")}</>
                ) : (
                  t("createEvent.createButton")
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {t("createEvent.freeNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
