import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

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

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();

  const mutation = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      const res = await apiRequest("POST", "/api/auth/forgot-password", data);
      return res.json();
    },
    onSuccess: (_data, variables) => {
      setSentEmail(variables.email);
    },
    onError: (err: any) => {
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <style>{`@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap');`}</style>

      <header className="h-16 border-b border-border flex items-center px-6 gap-3">
        <Link href="/">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="button-back-home">
            <LensLogo size={22} />
            <span className="font-display font-bold text-base">LensParty</span>
          </button>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            {sentEmail ? (
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="font-display font-bold text-xl text-foreground">Check your email!</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We've sent a password reset link to <strong className="text-foreground">{sentEmail}</strong>.
                  The link expires in 24 hours.
                </p>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="mt-2 font-display font-semibold"
                    data-testid="button-back-to-login"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6" data-testid="button-back-to-login">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </button>
                </Link>

                <div className="flex flex-col items-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <LensLogo size={28} />
                  </div>
                  <h1 className="font-display font-bold text-xl text-foreground text-center">Forgot your password?</h1>
                  <p className="text-muted-foreground text-sm text-center mt-1.5">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="forgot-email" className="font-display font-semibold text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="you@example.com"
                        className={`pl-9 ${errors.email ? "border-destructive" : ""}`}
                        {...register("email", { required: "Email is required" })}
                        data-testid="input-forgot-email"
                      />
                    </div>
                    {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground font-display font-bold py-5 text-base shadow-lg shadow-primary/20 mt-2"
                    disabled={mutation.isPending}
                    data-testid="button-send-reset"
                  >
                    {mutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
