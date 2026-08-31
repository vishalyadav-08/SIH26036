"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Scale,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  Building2,
  Store,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { GuestGuard } from "@/components/auth/GuestGuard";
import { readApiError } from "@/lib/api-error";
import {
  signupWithGoogle,
  signupWithPassword,
} from "@/services/auth/auth.service";
import { signupSchema, SignupFormData, SIGNUP_DEFAULTS } from "@/schemas/auth/auth.schema";

const inputBase =
  "block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/20";

function fieldClass(hasError: boolean) {
  return `${inputBase} ${
    hasError
      ? "border-rose-300 bg-rose-50/40 focus:border-rose-500"
      : "border-slate-300 bg-white focus:border-blue-600"
  }`;
}

function SignupForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: SIGNUP_DEFAULTS,
  });

  const finish = () => {
    setSucceeded(true);
    // A new account is always a BUSINESS account, so there is only one place
    // to land.
    setTimeout(() => router.push("/app"), 900);
  };

  const onSubmit = async (data: SignupFormData) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      await signupWithPassword({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        phone: data.phone || undefined,
        legalName: data.legalName,
        tradeName: data.tradeName || undefined,
        contactName: data.contactName,
        address: data.address,
      });

      finish();
    } catch (err) {
      setAuthError(readApiError(err, "Could not create your account."));
      setIsSubmitting(false);
    }
  };

  /**
   * Google supplies the identity, not the business. Validate the business
   * fields before sending the token, or the request fails after the user has
   * already picked a Google account — which reads as "Google is broken".
   */
  const onGoogleCredential = async (idToken: string) => {
    setAuthError(null);

    const ok = await trigger(["legalName", "contactName", "address"]);

    if (!ok) {
      setAuthError(
        "Add your business name, contact person, and address first, then continue with Google."
      );
      return;
    }

    setIsSubmitting(true);

    const values = getValues();

    try {
      await signupWithGoogle({
        idToken,
        legalName: values.legalName,
        tradeName: values.tradeName || undefined,
        contactName: values.contactName,
        address: values.address,
        phone: values.phone || undefined,
      });

      finish();
    } catch (err) {
      setAuthError(readApiError(err, "Could not register with Google."));
      setIsSubmitting(false);
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

      {/* Main Registration Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs">
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Register Your Business
            </h1>
            <p className="text-sm text-slate-600">
              For shop and instrument owners. Officer and Administrator accounts
              are issued by the department.
            </p>
          </div>

          {succeeded ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-900">
                Account created
              </p>
              <p className="text-xs text-slate-600">
                Taking you to your dashboard…
              </p>
            </div>
          ) : (
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
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Business details
                </p>

                {/* Legal name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="legalName"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    Legal Business Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      id="legalName"
                      type="text"
                      autoComplete="organization"
                      placeholder="Synthetic Retail Ltd"
                      className={fieldClass(Boolean(errors.legalName))}
                      {...register("legalName")}
                    />
                  </div>
                  {errors.legalName && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.legalName.message}
                    </p>
                  )}
                </div>

                {/* Trade name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="tradeName"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    Trade Name <span className="text-slate-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Store className="w-4 h-4" />
                    </div>
                    <input
                      id="tradeName"
                      type="text"
                      placeholder="Demo Store"
                      className={fieldClass(Boolean(errors.tradeName))}
                      {...register("tradeName")}
                    />
                  </div>
                </div>

                {/* Contact person */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="contactName"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    Contact Person
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="contactName"
                      type="text"
                      autoComplete="name"
                      placeholder="Demo Owner"
                      className={fieldClass(Boolean(errors.contactName))}
                      {...register("contactName")}
                    />
                  </div>
                  {errors.contactName && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.contactName.message}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="address"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    Business Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      id="address"
                      type="text"
                      autoComplete="street-address"
                      placeholder="Shop address, district"
                      className={fieldClass(Boolean(errors.address))}
                      {...register("address")}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    Phone <span className="text-slate-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="0000000000"
                      className={fieldClass(Boolean(errors.phone))}
                      {...register("phone")}
                    />
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-100" />

                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Your sign-in
                </p>

                {/* Full name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="displayName"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    Your Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="displayName"
                      type="text"
                      placeholder="Demo Business Owner"
                      className={fieldClass(Boolean(errors.displayName))}
                      {...register("displayName")}
                    />
                  </div>
                  {errors.displayName && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.displayName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
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
                      placeholder="owner@example.test"
                      className={fieldClass(Boolean(errors.email))}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      className={`${fieldClass(Boolean(errors.password))} pr-10`}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
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

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      className={fieldClass(Boolean(errors.confirmPassword))}
                      {...register("confirmPassword")}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-rose-600 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-medium text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating account…</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Google */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    or
                  </span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <GoogleAuthButton
                  text="signup_with"
                  disabled={isSubmitting}
                  onCredential={onGoogleCredential}
                />

                <p className="text-center text-[11px] text-slate-500">
                  Google provides your name and email. Business details above
                  are still required.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
                Already registered?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  Sign in
                </Link>
              </div>
            </div>
          )}

          {/* Prototype Scope Disclaimer */}
          <p className="text-[11px] text-slate-500 text-center leading-relaxed max-w-sm mx-auto">
            Prototype scope. Synthetic data only. Self-registration creates a
            Business account; authorization is enforced by the backend API.
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

export default function SignupPage() {
  return (
    <GuestGuard>
      <SignupForm />
    </GuestGuard>
  );
}
