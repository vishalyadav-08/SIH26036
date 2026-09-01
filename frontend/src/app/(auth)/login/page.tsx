"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Shield,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { GuestGuard } from "@/components/auth/GuestGuard";
import { loginSchema, LoginFormData } from "@/schemas/auth/auth.schema";
import { StateEmblem } from "@/components/ui/StateEmblem";
import { SiteFooter } from "@/components/layout/SiteFooter";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get("redirect");

  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const loggedUser = await login({
        email: data.email,
        password: data.password,
      });

      // Handle post-login redirection based on role & query param
      const defaultWorkspace =
        loggedUser.role === "BUSINESS"
          ? "/app"
          : loggedUser.role === "OFFICER"
          ? "/field"
          : "/admin";

      if (redirectParam && redirectParam.startsWith("/")) {
        if (
          loggedUser.role === "BUSINESS" &&
          (redirectParam.startsWith("/admin") || redirectParam.startsWith("/field"))
        ) {
          router.replace("/app");
        } else if (
          loggedUser.role === "OFFICER" &&
          (redirectParam.startsWith("/app") || redirectParam.startsWith("/admin"))
        ) {
          router.replace("/field");
        } else if (
          loggedUser.role === "ADMIN" &&
          (redirectParam.startsWith("/app") || redirectParam.startsWith("/field"))
        ) {
          router.replace("/admin");
        } else {
          router.replace(redirectParam);
        }
      } else {
        router.replace(defaultWorkspace);
      }
    } catch {
      setAuthError(
        "Invalid email or password. Please check your credentials and try again."
      );
      setValue("password", "");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = (email: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", "synthetic-password", { shouldValidate: true });
    setAuthError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc] text-[#111c2d]">
      {/* Top Government Navigation */}
      <header className="bg-white border-b border-[#cbd5e1] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#004e9f] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Portal</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#f0f3ff] text-[#004e9f] border border-[#004e9f]/20">
              Department Single Sign-On
            </span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <StateEmblem size="md" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#004e9f] tracking-tight">
              Sign In to MapanSetu
            </h1>
            <p className="text-xs sm:text-sm text-[#414753]">
              Authorized Portal Access for Businesses, Officers &amp; Administrators
            </p>
          </div>

          {/* Login Card Form */}
          <div className="bg-white rounded-lg p-6 sm:p-8 border border-[#cbd5e1] shadow-xs space-y-5">
            {authError && (
              <div
                role="alert"
                aria-live="polite"
                className="p-3 rounded bg-[#fff1f2] border border-[#fecdd3] flex items-start gap-2.5 text-xs text-[#9f1239]"
              >
                <AlertCircle className="w-4 h-4 text-[#e11d48] shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-[#111c2d]"
                >
                  Official Email Address <span className="text-[#b91c1c]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#727784]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@organization.com"
                    {...register("email")}
                    className={`block w-full pl-9 pr-3 py-2 text-xs text-[#111c2d] rounded border ${
                      errors.email
                        ? "border-[#b91c1c] focus:ring-[#b91c1c]"
                        : "border-[#cbd5e1] focus:ring-[#004e9f]"
                    } bg-[#f8fafc] placeholder-[#727784] focus:bg-white focus:outline-none focus:ring-2`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-[#b91c1c] mt-0.5">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#111c2d]"
                >
                  Password <span className="text-[#b91c1c]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#727784]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    {...register("password")}
                    className={`block w-full pl-9 pr-10 py-2 text-xs text-[#111c2d] rounded border ${
                      errors.password
                        ? "border-[#b91c1c] focus:ring-[#b91c1c]"
                        : "border-[#cbd5e1] focus:ring-[#004e9f]"
                    } bg-[#f8fafc] placeholder-[#727784] focus:bg-white focus:outline-none focus:ring-2 font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#727784] hover:text-[#111c2d] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-[#b91c1c] mt-0.5">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#004e9f] hover:bg-[#003366] disabled:bg-[#004e9f]/50 text-white font-bold text-xs rounded transition-colors shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:ring-offset-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials Quick Fill */}
            <div className="pt-3 border-t border-[#cbd5e1] space-y-2">
              <span className="text-[11px] font-bold text-[#414753] uppercase tracking-wider block">
                Quick 1-Click Evaluation Accounts:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials("business@example.test")}
                  className="flex items-center gap-2 p-2 rounded bg-[#f0f3ff] hover:bg-[#dee8ff] border border-[#cbd5e1] text-left transition-colors cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-[#004e9f] shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-[#111c2d] truncate">
                      Business
                    </div>
                    <div className="text-[10px] text-[#414753] font-mono truncate">
                      business@...
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoCredentials("admin@example.test")}
                  className="flex items-center gap-2 p-2 rounded bg-[#f0f3ff] hover:bg-[#dee8ff] border border-[#cbd5e1] text-left transition-colors cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-[#3a5f94] shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-[#111c2d] truncate">
                      Admin
                    </div>
                    <div className="text-[10px] text-[#414753] font-mono truncate">
                      admin@...
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoCredentials("officer@example.test")}
                  className="flex items-center gap-2 p-2 rounded bg-[#f0f3ff] hover:bg-[#dee8ff] border border-[#cbd5e1] text-left transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#15803d] shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-[#111c2d] truncate">
                      Officer
                    </div>
                    <div className="text-[10px] text-[#414753] font-mono truncate">
                      officer@...
                    </div>
                  </div>
                </button>
              </div>

              <div className="text-[11px] text-[#727784] text-center pt-0.5">
                Password: <span className="font-mono font-semibold text-[#111c2d]">synthetic-password</span>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg border border-[#cbd5e1] shadow-xs space-y-4 animate-pulse">
        <div className="h-10 w-10 bg-slate-200 rounded mx-auto" />
        <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
        <div className="h-4 w-64 bg-slate-200 rounded mx-auto" />
        <div className="space-y-3 pt-4">
          <div className="h-10 bg-slate-200 rounded" />
          <div className="h-10 bg-slate-200 rounded" />
          <div className="h-10 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GuestGuard>
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </GuestGuard>
  );
}
