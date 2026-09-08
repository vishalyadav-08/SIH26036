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
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Shield,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { GuestGuard } from "@/components/auth/GuestGuard";
import { loginSchema, LoginFormData } from "@/schemas/auth/auth.schema";
import { StateEmblem } from "@/components/ui/StateEmblem";

type RoleOption = "BUSINESS" | "LMO" | "GATC";

const DEMO_PRESETS: Record<
  RoleOption,
  { label: string; email: string; alias: string; desc: string }
> = {
  BUSINESS: {
    label: "Business",
    email: "info@shreebalaji.demo",
    alias: "business@mapansetu.in",
    desc: "Merchants & Manufacturers",
  },
  LMO: {
    label: "LMO",
    email: "vinod.sharma@lmo.up.gov.demo",
    alias: "lmo@mapansetu.in",
    desc: "Legal Metrology Officers",
  },
  GATC: {
    label: "GATCs",
    email: "gatc@up.gov.demo",
    alias: "admin@up.gov.demo",
    desc: "Test Centres & Supervisors",
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get("redirect");

  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleOption>("BUSINESS");
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
      email: DEMO_PRESETS.BUSINESS.email,
      password: "synthetic-password",
    },
  });

  const handleRoleSelect = (role: RoleOption) => {
    setSelectedRole(role);
    setValue("email", DEMO_PRESETS[role].email, { shouldValidate: true });
    setValue("password", "synthetic-password", { shouldValidate: true });
    setAuthError(null);
  };

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const loggedUser = await login({
        email: data.email.trim(),
        password: data.password,
      });

      // Role-based workspace routing (Zero role restriction blocking)
      const isBiz = loggedUser.role === "BUSINESS";
      const isLmo = loggedUser.role === "OFFICER" || loggedUser.role === "LMO";
      const isGatc = loggedUser.role === "ADMIN" || loggedUser.role === "GATC";

      let targetUrl = isBiz ? "/app" : isLmo ? "/field" : "/admin";

      if (redirectParam && redirectParam.startsWith("/")) {
        if (isBiz && redirectParam.startsWith("/app")) {
          targetUrl = redirectParam;
        } else if (isLmo && redirectParam.startsWith("/field")) {
          targetUrl = redirectParam;
        } else if (isGatc && redirectParam.startsWith("/admin")) {
          targetUrl = redirectParam;
        }
      }

      router.replace(targetUrl);
    } catch (err: unknown) {
      let message = "Invalid email or password. Please verify your credentials and try again.";
      if (typeof err === "object" && err !== null) {
        const anyErr = err as Record<string, unknown>;
        if (typeof anyErr.message === "string") {
          message = anyErr.message;
        } else if (typeof anyErr.detail === "string") {
          message = anyErr.detail;
        }
      }
      setAuthError(message);
      setValue("password", "");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 flex justify-between items-center w-full px-4 sm:px-8 py-3 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          <div
            aria-hidden="true"
            className="w-12 h-16 bg-slate-50 border border-slate-200 flex items-center justify-center rounded-lg"
          >
            <StateEmblem size="sm" />
          </div>
          <div>
            <div className="text-xl font-bold text-blue-700 uppercase tracking-tight">
              MapanSetu
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              National Legal Metrology Portal
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Unified Single Sign-On
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 md:p-12 max-w-screen-2xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full max-w-6xl items-center">
          {/* Left Column: Identity & Explanation */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                SIH26036 Working Prototype
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
                Welcome to <span className="text-blue-600">MapanSetu</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                The centralized portal for weighing and measuring instrument verification,
                compliance management, and tamper-evident certificate issuance under the Legal
                Metrology Act.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Business Portal</h3>
                  <p className="text-sm text-slate-600">
                    Register weights & measures, submit verification applications, and download digital certificates.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">LMO Field Portal</h3>
                  <p className="text-sm text-slate-600">
                    Legal Metrology Officers conduct calibration audits, stamp seals, and manage field inspections.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">GATCs Administration</h3>
                  <p className="text-sm text-slate-600">
                    Government Approved Test Centres oversee verification queues, manage officer rosters, and review evidence.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Unified Login Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6 text-left">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Account Sign In</h2>
              <p className="text-sm text-slate-600">
                Select a demo role below to quick-fill credentials or enter your official details.
              </p>
            </div>

            {/* Quick Demo Role Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {(["BUSINESS", "LMO", "GATC"] as RoleOption[]).map((roleKey) => {
                const preset = DEMO_PRESETS[roleKey];
                const isActive = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleRoleSelect(roleKey)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                      isActive
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/80 ring-1 ring-black/5"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className="text-[10px] font-normal text-slate-500 hidden sm:inline truncate max-w-full">
                      {preset.desc.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Error Banner */}
            {authError && (
              <div
                role="alert"
                aria-live="polite"
                className="p-4 mb-5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-800"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{authError}</span>
              </div>
            )}

            {/* Credential Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="email" className="font-semibold text-xs text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative rounded-lg">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter official email"
                    {...register("email")}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm text-slate-900 focus:outline-none transition-all ${
                      errors.email
                        ? "border-rose-500 focus:ring-2 focus:ring-rose-200"
                        : "border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 mt-0.5">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="font-semibold text-xs text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative rounded-lg">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    {...register("password")}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm text-slate-900 focus:outline-none transition-all font-mono ${
                      errors.password
                        ? "border-rose-500 focus:ring-2 focus:ring-rose-200"
                        : "border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600 mt-0.5">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white font-bold text-sm py-3 px-6 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 cursor-pointer shadow-md hover:shadow-lg"
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

            {/* Quick Demo Credentials Info Card */}
            <div className="mt-6 pt-5 border-t border-slate-200 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Live Backend Demo Account
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Password: synthetic-password
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">{DEMO_PRESETS[selectedRole].label}: </span>
                  <code className="font-mono text-blue-700 font-bold">{DEMO_PRESETS[selectedRole].email}</code>
                </div>
                <div className="text-[11px] text-slate-500">
                  Alias: <code className="font-mono text-slate-600">{DEMO_PRESETS[selectedRole].alias}</code>
                </div>
              </div>
            </div>
          </div>
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
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 p-8">
        <div className="space-y-6">
          <div className="h-12 w-3/4 bg-slate-200 rounded animate-pulse" />
          <div className="h-24 w-full bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="p-10 bg-white rounded-2xl border border-slate-200 shadow-lg space-y-4 animate-pulse">
          <div className="h-8 w-1/2 bg-slate-200 rounded" />
          <div className="space-y-4 pt-6">
            <div className="h-16 bg-slate-200 rounded-xl" />
            <div className="h-16 bg-slate-200 rounded-xl" />
            <div className="h-16 bg-slate-200 rounded-xl" />
          </div>
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
