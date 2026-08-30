'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Scale, Mail, Lock, Eye, EyeOff, ArrowRight, Search } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md">
      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-200 overflow-hidden">
        {/* Blue top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#000666] via-blue-600 to-[#1a237e]" aria-hidden="true" />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-7">
            <div className="w-10 h-10 rounded-xl bg-[#000666] text-white flex items-center justify-center shadow-md" aria-hidden="true">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Sign in to MapanSetu</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Access your Business or Admin portal
              </p>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-5" action="/app" method="get" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"
                  aria-hidden="true"
                >
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666] focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-blue-700 hover:text-blue-900 transition-colors"
                  onClick={() => alert('Password reset is handled by the authentication service.')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"
                  aria-hidden="true"
                >
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666] focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full mt-1 py-3 px-4 bg-[#000666] hover:bg-[#1a237e] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-950/20 flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          {/* Public verification link */}
          <div className="mt-5 pt-5 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-semibold transition-colors"
            >
              <Search className="w-3.5 h-3.5" aria-hidden="true" />
              Continue without signing in — Public Verification
            </Link>
          </div>
        </div>

        {/* Secure portal footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
          <Lock className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          <span>Secure Portal • 256-Bit SSL Encrypted</span>
        </div>
      </div>

      {/* Below-card note */}
      <p className="text-center text-[11px] text-slate-400 mt-4 leading-relaxed">
        Your role (Business / Admin) is determined by your account.{' '}
        <br />
        This is an SIH 2026 prototype — not a live government service.
      </p>
    </div>
  );
}
