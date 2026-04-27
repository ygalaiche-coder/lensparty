import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Link, useSearch } from "wouter";
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

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const search = useSearch();
  const token = new URLSearchParams(search).get("token");
  const [success, setSuccess] = useState(false);
  const [expired, setExpired] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordForm>();
  const newPassword = watch("newPassword");

  const mutation = useMutation({
    mutationFn: async (data: ResetPasswordForm) => {
      const res = await apiRequest("POST", "/api/auth/reset-password", {
        token,
        newPassword: data.newPassword,
      });
      return res.json();
    },
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (err: any) => {
      if (err.message?.includes("Invalid or expired")) {
        setExpired(true);
      } else {
        toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
      }
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
            {/* No token */}
            {!token && (
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="font-display font-bold text-xl text-foreground">Invalid reset link</h2>
                <p className="text-muted-foreground text-sm">
                  This link is missing a reset token. Please request a new one.
                </p>
                <Link href="/forgot-password">
                  <Button className="mt-2 font-display font-semibold" data-testid="button-request-new">
                    Request New Link
                  </Button>
                </Link>
              </div>
            )}

            {/* Expired token */}
            {token && expired && (
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="font-display font-bold text-xl text-foreground">Invalid or expired reset link</h2>
                <p className="text-muted-foreground text-sm">
                  This reset link has expired or has already been used. Please request a new one.
                </p>
                <Link href="/forgot-password">
                  <Button className="mt-2 font-display font-semibold" data-testid="button-request-new">
                    Request New Link
                  </Button>
                </Link>
              </div>
            )}

            {/* Success */}
            {token && success && (
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="font-display font-bold text-xl text-foreground">Password updated!</h2>
                <p className="text-muted-foreground text-sm">
                  You can now sign in with your new password.
                </p>
                <Link href="/login">
                  <Button className="mt-2 bg-gradient-to-r from-primary to-purple-600 font-display font-semibold" data-testid="button-go-to-login">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {/* Reset form */}
            {token && !success && !expired && (
              <>
                <div className="flex flex-col items-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <LensLogo size={28} />
                  </div>
                  <h1 className="font-display font-bold text-xl text-foreground text-center">Set new password</h1>
                  <p className="text-muted-foreground text-sm text-center mt-1.5">
                    Choose a strong password for your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="new-password" className="font-display font-semibold text-sm">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        className={`pl-9 ${errors.newPassword ? "border-destructive" : ""}`}
                        {...register("newPassword", {
                          required: "Password is required",
                          minLength: { value: 8, message: "Password must be at least 8 characters" },
                        })}
                        data-testid="input-new-password"
                      />
                    </div>
                    {errors.newPassword ? (
                      <p className="text-destructive text-xs">{errors.newPassword.message}</p>
                    ) : (
                      <p className="text-muted-foreground text-xs">At least 8 characters</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="confirm-password" className="font-display font-semibold text-sm">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        className={`pl-9 ${errors.confirmPassword ? "border-destructive" : ""}`}
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) => value === newPassword || "Passwords do not match",
                        })}
                        data-testid="input-confirm-password"
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground font-display font-bold py-5 text-base shadow-lg shadow-primary/20 mt-2"
                    disabled={mutation.isPending}
                    data-testid="button-update-password"
                  >
                    {mutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</>
                    ) : (
                      "Update Password"
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
