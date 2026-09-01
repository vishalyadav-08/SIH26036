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
  FileCheck2
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
  const [selectedRole, setSelectedRole] = useState<"BUSINESS" | "ADMIN" | "OFFICER" | null>(null);
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

      if (loggedUser.role !== selectedRole) {
        setAuthError(`Invalid credentials for ${selectedRole} role.`);
        setIsSubmitting(false);
        return;
      }

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
      if (!authError) setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    const email =
      selectedRole === "BUSINESS"
        ? "business@example.test"
        : selectedRole === "ADMIN"
        ? "admin@example.test"
        : "officer@example.test";
    setValue("email", email, { shouldValidate: true });
    setValue("password", "synthetic-password", { shouldValidate: true });
    setAuthError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 flex justify-between items-center w-full px-4 sm:px-8 py-3 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          <div aria-hidden="true" className="w-12 h-16 bg-slate-50 border border-slate-200 flex items-center justify-center rounded-lg">
            <StateEmblem size="sm" />
          </div>
          <div className="text-xl font-bold text-blue-700 uppercase tracking-tight">
            MapanSetu
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Department Single Sign-On
            </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 md:p-12 max-w-screen-2xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full max-w-6xl items-center">
          
          {/* Left Column: Identity & Explanation */}
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
                Welcome to <span className="text-blue-600">MapanSetu</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                The official portal for business registration and compliance management. Securely access your enterprise dashboard to manage certificates, track applications, and maintain regulatory standing with the Government of India.
              </p>
            </div>
            
            <div className="hidden md:flex gap-4 items-start mt-4">
              <Shield className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">Secure & Authorized</h3>
                <p className="text-base text-slate-600">Access your official business records with state-of-the-art encryption and authenticated protocols.</p>
              </div>
            </div>
            
            <div className="hidden md:flex gap-4 items-start">
              <FileCheck2 className="w-8 h-8 text-blue-600 shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">Compliance Management</h3>
                <p className="text-base text-slate-600">Streamline your regulatory requirements and certificate renewals in one centralized platform.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Login Card / Role Selection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-lg">
            {!selectedRole ? (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Select Your Role</h2>
                  <p className="text-base text-slate-600">Please choose your portal to continue.</p>
                </div>
                
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("BUSINESS")}
                    className="w-full flex items-center gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Business</h3>
                      <p className="text-xs text-slate-500 mt-0.5">For merchants and enterprises</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 ml-auto shrink-0 group-hover:text-blue-600 transition-colors" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("OFFICER")}
                    className="w-full flex items-center gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-500 hover:ring-1 hover:ring-emerald-500 transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Field Officer</h3>
                      <p className="text-xs text-slate-500 mt-0.5">For inspectors and LMOs</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 ml-auto shrink-0 group-hover:text-emerald-600 transition-colors" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("ADMIN")}
                    className="w-full flex items-center gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Administrator</h3>
                      <p className="text-xs text-slate-500 mt-0.5">For supervisors and department heads</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 ml-auto shrink-0 group-hover:text-indigo-600 transition-colors" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8 relative">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(null);
                      setAuthError(null);
                    }}
                    className="absolute -left-2 -top-2 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                    aria-label="Back to role selection"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="text-center mt-2">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      {selectedRole === "BUSINESS" ? "Business Login" : selectedRole === "ADMIN" ? "Admin Login" : "Officer Login"}
                    </h2>
                    <p className="text-base text-slate-600">Please enter your authorized credentials.</p>
                  </div>
                </div>

                {authError && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="p-4 mb-6 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-800"
                  >
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="font-semibold text-sm text-slate-900">Email Address</label>
                    <div className="relative rounded-lg">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Mail className="w-5 h-5" />
                      </span>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your official email"
                        {...register("email")}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg text-base text-slate-900 focus:outline-none transition-colors ${
                          errors.email ? "border-rose-500 focus:ring-1 focus:ring-rose-500 focus:border-rose-500" : "border-slate-300 focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-rose-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="password" className="font-semibold text-sm text-slate-900">Password</label>
                    <div className="relative rounded-lg">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Lock className="w-5 h-5" />
                      </span>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your secure password"
                        {...register("password")}
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg text-base text-slate-900 focus:outline-none transition-colors font-mono ${
                          errors.password ? "border-rose-500 focus:ring-1 focus:ring-rose-500 focus:border-rose-500" : "border-slate-300 focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-rose-600 mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-2">
                      <input id="remember" type="checkbox" className="border-slate-300 rounded text-blue-600 focus:ring-blue-600 w-4 h-4 cursor-pointer" />
                      <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">Remember me</label>
                    </div>
                    <a href="#" className="text-sm font-semibold text-blue-600 hover:underline">Forgot Password?</a>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full text-white font-bold text-base py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 mt-4 flex items-center justify-center gap-2 ${
                      selectedRole === "BUSINESS" ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600 disabled:bg-blue-400" :
                      selectedRole === "ADMIN" ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-600 disabled:bg-indigo-400" :
                      "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600 disabled:bg-emerald-400"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <span>Login</span>
                    )}
                  </button>
                </form>

                {/* Demo Credentials Quick Fill */}
                <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                  <p className="text-sm text-slate-600 mb-4">
                    Prototype evaluation?
                  </p>
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className={`inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-lg border font-bold text-sm transition-colors cursor-pointer ${
                      selectedRole === "BUSINESS" ? "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700" :
                      selectedRole === "ADMIN" ? "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700" :
                      "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700"
                    }`}
                  >
                    Use Demo Credentials
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
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
