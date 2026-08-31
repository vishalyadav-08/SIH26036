import React, { useState } from 'react';
import { OfficerProfile } from '../types';
import { BiometricAuthModal } from './BiometricAuthModal';

interface LoginScreenProps {
  onLogin: () => void;
  profile: OfficerProfile;
  onUpdateLanguage: (lang: 'en' | 'hi') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  profile,
  onUpdateLanguage,
}) => {
  const [officerId, setOfficerId] = useState(profile.badgeNumber);
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>(profile.language);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  const handleLangChange = (newLang: 'en' | 'hi') => {
    setLang(newLang);
    onUpdateLanguage(newLang);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f2fb]">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#c6c5d4]/40 flex flex-col gap-6">
        {/* Branding Section */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-20 h-20 rounded-full bg-[#1a237e] flex items-center justify-center mb-1 shadow-inner">
            <span
              className="material-symbols-outlined text-[40px] text-[#8690ee] filled"
            >
              shield_person
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-[#000666] tracking-tight">
              MapanSetu
            </h1>
            <p className="text-base font-medium text-[#5a5d72]">
              {lang === 'hi' ? 'फील्ड ऑफिसर पोर्टल' : 'Field Officer Portal'}
            </p>
          </div>

          <div className="mt-1 bg-[#dcdef7] px-3.5 py-1 rounded-full">
            <span className="text-[11px] font-bold text-[#5e6177] uppercase tracking-wider">
              SIH 2026 PROTOTYPE
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full mt-2">
          {/* Officer ID Field */}
          <div className="relative bg-[#e4e1ea]/70 rounded-t-lg border-b-2 border-[#767683] hover:border-[#1b1b21] focus-within:border-[#000666] focus-within:bg-[#dcdef7]/20 transition-all">
            <input
              id="officerId"
              type="text"
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              className="block w-full px-4 pt-6 pb-2 bg-transparent border-none text-[#1b1b21] font-medium text-base focus:ring-0 focus:outline-none z-10 relative"
              placeholder=" "
              required
            />
            <label
              htmlFor="officerId"
              className={`absolute left-4 transition-all pointer-events-none origin-top-left ${
                officerId ? 'top-1.5 text-xs text-[#000666] font-semibold' : 'top-4 text-sm text-[#454652]'
              }`}
            >
              {lang === 'hi' ? 'अधिकारी आईडी (Officer ID)' : 'Officer ID'}
            </label>
          </div>

          {/* Password Field */}
          <div className="relative bg-[#e4e1ea]/70 rounded-t-lg border-b-2 border-[#767683] hover:border-[#1b1b21] focus-within:border-[#000666] focus-within:bg-[#dcdef7]/20 transition-all mt-1">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 pt-6 pb-2 pr-12 bg-transparent border-none text-[#1b1b21] font-medium text-base focus:ring-0 focus:outline-none z-10 relative"
              placeholder=" "
              required
            />
            <label
              htmlFor="password"
              className={`absolute left-4 transition-all pointer-events-none origin-top-left ${
                password ? 'top-1.5 text-xs text-[#000666] font-semibold' : 'top-4 text-sm text-[#454652]'
              }`}
            >
              {lang === 'hi' ? 'पासवर्ड (Password)' : 'Password'}
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#454652] hover:text-[#1b1b21] z-20 p-1"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility' : 'visibility_off'}
              </span>
            </button>
          </div>

          {/* Quick Demo Pre-fills */}
          <div className="flex items-center justify-between text-xs text-[#454652] pt-1">
            <button
              type="button"
              onClick={() => {
                setOfficerId('LMO-2024-088');
                setPassword('Demo@123');
              }}
              className="text-[#000666] font-semibold hover:underline"
            >
              Fill Demo Officer
            </button>
            <span className="text-[#767683]">PIN: 4829</span>
          </div>

          {/* Action Area */}
          <div className="mt-4 flex flex-col gap-2.5">
            <button
              type="submit"
              className="w-full h-12 bg-[#000666] hover:bg-[#1a237e] text-white font-semibold text-sm rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px] filled">
                login
              </span>
              <span>{lang === 'hi' ? 'पासवर्ड से साइन इन करें' : 'Sign In with Password'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBiometricModal(true)}
              className="w-full h-11 bg-[#dcdef7] hover:bg-[#c8ccf7] text-[#000666] font-bold text-xs rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">
                fingerprint
              </span>
              <span>{lang === 'hi' ? 'बायोमेट्रिक से तुरंत लॉगिन करें' : 'Quick Biometric Sign In'}</span>
            </button>
          </div>
        </form>

        {/* Footer / Language Selector */}
        <div className="flex justify-center items-center gap-3 pt-4 border-t border-[#c6c5d4]/40 w-full mt-2">
          <span className="material-symbols-outlined text-[#454652] text-[20px]">
            language
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleLangChange('en')}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                lang === 'en'
                  ? 'bg-[#000666] text-white'
                  : 'text-[#454652] hover:bg-[#e4e1ea]'
              }`}
            >
              English
            </button>
            <span className="text-[#c6c5d4]">|</span>
            <button
              type="button"
              onClick={() => handleLangChange('hi')}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                lang === 'hi'
                  ? 'bg-[#000666] text-white'
                  : 'text-[#454652] hover:bg-[#e4e1ea]'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Biometric Login Modal */}
      {showBiometricModal && (
        <BiometricAuthModal
          title="Officer Biometric Sign In"
          subtitle="Place your registered finger on the sensor or use Face ID to authenticate"
          onSuccess={() => {
            setShowBiometricModal(false);
            onLogin();
          }}
          onCancel={() => setShowBiometricModal(false)}
        />
      )}
    </div>
  );
};
