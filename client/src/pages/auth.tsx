import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { Link } from "wouter";

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

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  email: string;
  password: string;
  name: string;
}

function LoginForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: () => {
      navigate("/my-events");
    },
    onError: (err: any) => {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => loginMutation.mutate(data))} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-email" className="font-display font-semibold text-sm">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            className={`pl-9 ${errors.email ? "border-destructive" : ""}`}
            {...register("email", { required: "Email is required" })}
            data-testid="input-login-email"
          />
        </div>
        {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-password" className="font-display font-semibold text-sm">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            id="login-password"
            type="password"
            placeholder="Your password"
            className={`pl-9 ${errors.password ? "border-destructive" : ""}`}
            {...register("password", { required: "Password is required" })}
            data-testid="input-login-password"
          />
        </div>
        {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground font-display font-bold py-5 text-base shadow-lg shadow-primary/20 mt-2"
        disabled={loginMutation.isPending}
        data-testid="button-login"
      >
        {loginMutation.isPending ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing In...</>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>();

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return res.json();
    },
    onSuccess: () => {
      navigate("/my-events");
    },
    onError: (err: any) => {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => registerMutation.mutate(data))} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="register-name" className="font-display font-semibold text-sm">Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            id="register-name"
            placeholder="Your name"
            className={`pl-9 ${errors.name ? "border-destructive" : ""}`}
            {...register("name", { required: "Name is required" })}
            data-testid="input-register-name"
          />
        </div>
        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="register-email" className="font-display font-semibold text-sm">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            className={`pl-9 ${errors.email ? "border-destructive" : ""}`}
            {...register("email", { required: "Email is required" })}
            data-testid="input-register-email"
          />
        </div>
        {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="register-password" className="font-display font-semibold text-sm">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            id="register-password"
            type="password"
            placeholder="At least 6 characters"
            className={`pl-9 ${errors.password ? "border-destructive" : ""}`}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" },
            })}
            data-testid="input-register-password"
          />
        </div>
        {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground font-display font-bold py-5 text-base shadow-lg shadow-primary/20 mt-2"
        disabled={registerMutation.isPending}
        data-testid="button-register"
      >
        {registerMutation.isPending ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Account...</>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}

export default function AuthPage() {
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
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <LensLogo size={28} />
              </div>
              <h1 className="font-display font-bold text-xl text-foreground text-center">Welcome to LensParty</h1>
              <p className="text-muted-foreground text-sm text-center mt-1.5">Sign in to manage your events</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="font-display font-semibold" data-testid="tab-login">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="font-display font-semibold" data-testid="tab-register">
                  Create Account
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
