"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Scale,
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
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { readApiError } from "@/lib/api-error";
import { getDefaultRouteForRole } from "@/lib/roleRouting";
import { GuestGuard } from "@/components/auth/GuestGuard";
import { loginSchema, LoginFormData } from "@/schemas/auth/auth.schema";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get("redirect");

  const { login, loginWithGoogle } = useAuth();
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
      const workspace = getDefaultRouteForRole(loggedUser.role);

      router.replace(
        redirectParam && redirectParam.startsWith(workspace)
          ? redirectParam
          : workspace
      );
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;

      if (status === 401) {
        // Documented generic invalid credentials error (no account enumeration)
        setAuthError(
          "Invalid email or password. Please check your credentials and try again."
        );
        setValue("password", "");
      } else if (status === 429) {
        setAuthError("Too many sign-in attempts. Wait a minute and try again.");
      } else {
        // Anything else is not the user's fault: server down, wrong backend
        // URL, validation. Say so instead of blaming the password.
        setAuthError(readApiError(err, "Sign-in failed. Please try again."));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Google hands back an ID token; the API decides whether it maps to an
   * account. A Google identity with no MapanSetu account is refused here —
   * signing in must never create one.
   */
  const handleGoogleCredential = async (idToken: string) => {
    setAuthError(null);

    try {
      const signedIn = await loginWithGoogle(idToken);

      router.push(getDefaultRouteForRole(signedIn.role));
    } catch (err) {
      setAuthError(readApiError(err, "Google sign-in failed."));
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Verification Portal</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              SIH26036 Prototype
            </span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs">
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In to MapanSetu
            </h1>
            <p className="text-sm text-slate-600">
              Authorized access for Businesses, Officers, and Administrators
            </p>
          </div>

          {/* Login Card Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            {authError && (
              <div
                role="alert"
                aria-live="polite"
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@organization.com"
                    {...register("email")}
                    className={`block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border ${
                      errors.email
                        ? "border-rose-500 focus:ring-rose-500 focus:border-rose-500"
                        : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    } bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 transition-all`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    {...register("password")}
                    className={`block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border ${
                      errors.password
                        ? "border-rose-500 focus:ring-rose-500 focus:border-rose-500"
                        : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    } bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 transition-all font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    // Keep focus (and the caret) in the field while toggling.
                    onMouseDown={(e) => e.preventDefault()}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 z-10 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-medium text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Google sign-in */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  or
                </span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <GoogleAuthButton
                text="signin_with"
                disabled={isSubmitting}
                onCredential={handleGoogleCredential}
              />

              <p className="text-center text-[11px] text-slate-500">
                Google sign-in works for an account that already exists.{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  Create one
                </Link>{" "}
                if you are new.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
              New shop owner?{" "}
              <Link
                href="/signup"
                className="font-semibold text-blue-600 hover:text-blue-800"
              >
                Register your business
              </Link>
            </div>
          </div>

          {/* Prototype Scope Disclaimer */}
          <p className="text-[11px] text-slate-500 text-center leading-relaxed max-w-sm mx-auto">
            Prototype scope. Synthetic credentials only. Access authorization is
            enforced by the backend API.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MapanSetu — SIH26036 Prototype</span>
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Public Certificate Verification
          </Link>
        </div>
      </footer>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-pulse">
        <div className="h-10 w-10 bg-slate-200 rounded-xl mx-auto" />
        <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
        <div className="h-4 w-64 bg-slate-200 rounded mx-auto" />
        <div className="space-y-3 pt-4">
          <div className="h-10 bg-slate-200 rounded-xl" />
          <div className="h-10 bg-slate-200 rounded-xl" />
          <div className="h-10 bg-slate-200 rounded-xl" />
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
