'use client';

import React, { useState } from 'react';
import { UserRole } from '@/lib/types';
import { Language, translations } from '@/lib/translations';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Scale, 
  ArrowRight, 
  Store, 
  Search,
  CheckCircle2
} from 'lucide-react';

interface LoginViewProps {
  language: Language;
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ language, onLoginSuccess }) => {
  const t = translations[language];
  const [email, setEmail] = useState('demo@retailstore.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('merchant');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(selectedRole);
  };

  const handleRoleQuickSelect = (role: UserRole, defaultEmail: string) => {
    setSelectedRole(role);
    setEmail(defaultEmail);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-slate-100/70">
      <div className="w-full max-w-md">
        {/* Main Card with blue accent bar on top */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-200 overflow-hidden">
          {/* Blue Top Accent Bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#000666] via-blue-600 to-[#1a237e]" />

          <div className="p-8">
            {/* Header Emblem */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#000666] text-white flex items-center justify-center shadow-md">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{t.signIn}</h1>
                <p className="text-xs text-slate-500">{t.signInSubtitle}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.emailAddress}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                    {t.password}
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to registered email in prototype mode.')}
                    className="text-xs font-medium text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Select Quick Chips */}
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Select Role Mode:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleQuickSelect('merchant', 'demo@retailstore.com')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      selectedRole === 'merchant'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <Store className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Merchant</div>
                      <div className="text-[10px] text-slate-500">Retail Store</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleQuickSelect('officer', 'officer@mapansetu.gov.in')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      selectedRole === 'officer'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Inspector</div>
                      <div className="text-[10px] text-slate-500">Officer Admin</div>
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-[#000666] hover:bg-[#1a237e] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-950/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.signIn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => onLoginSuccess('public')}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center justify-center gap-1.5 mx-auto"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Continue without signing in (Public Verification)</span>
              </button>
            </div>
          </div>

          {/* Secure Government Portal Footer Bar */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.securePortal} • 256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
