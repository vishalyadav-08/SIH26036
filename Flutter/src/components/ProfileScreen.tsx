import React, { useState } from 'react';
import { OfficerProfile } from '../types';

interface ProfileScreenProps {
  profile: OfficerProfile;
  onUpdateLanguage: (lang: 'en' | 'hi') => void;
  onNavigateSecurity: () => void;
  onLogout: () => void;
  unsyncedCount: number;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onUpdateLanguage,
  onNavigateSecurity,
  onLogout,
  unsyncedCount,
}) => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangedToast, setPasswordChangedToast] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPasswordModal(false);
    setPasswordChangedToast(true);
    setTimeout(() => setPasswordChangedToast(false), 3000);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32 w-full space-y-6 animate-fade-in">
      {/* Officer Details Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#c6c5d4]/70 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-[#e4e1ea] shrink-0 shadow-sm bg-white">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex flex-col items-center sm:items-start flex-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1b1b21] tracking-tight">
            {profile.name}
          </h2>
          <p className="text-base text-[#5a5d72] mt-0.5">{profile.role}</p>

          <div className="mt-3 bg-[#dcdef7] text-[#171a2c] px-3.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-xs">
            <span className="material-symbols-outlined text-[16px]">badge</span>
            <span>{profile.badgeNumber}</span>
          </div>
        </div>
      </section>

      {/* Bento Grid for Stats and Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Operational Stats */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#c6c5d4]/70 flex flex-col gap-3">
          <h3 className="text-base font-bold text-[#1b1b21] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#000666]">
              analytics
            </span>
            <span>Operational Stats</span>
          </h3>

          <div className="flex justify-between items-center py-2 border-b border-[#e4e1ea]">
            <span className="text-sm text-[#454652]">Last Sync</span>
            <span className="text-sm font-semibold text-[#1b1b21] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#2e7d32]">
                cloud_done
              </span>
              <span>{profile.lastSync}</span>
            </span>
          </div>

          <div className="flex flex-col gap-1 py-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#454652]">Local Storage</span>
              <span className="font-semibold text-[#1b1b21]">
                {profile.storageUsedMB}MB / {profile.storageTotalMB}MB
              </span>
            </div>
            <div className="w-full bg-[#e4e1ea] rounded-full h-2 mt-1 overflow-hidden">
              <div
                className="bg-[#000666] h-2 rounded-full"
                style={{
                  width: `${(profile.storageUsedMB / profile.storageTotalMB) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#c6c5d4]/70 flex flex-col gap-3">
          <h3 className="text-base font-bold text-[#1b1b21] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#000666]">
              security
            </span>
            <span>Account Security</span>
          </h3>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f5f2fb] transition-colors group text-left border border-transparent hover:border-[#c6c5d4]/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#e4e1ea] flex items-center justify-center text-[#454652] group-hover:bg-[#dcdef7] group-hover:text-[#000666] transition-colors">
                <span className="material-symbols-outlined text-[18px]">password</span>
              </div>
              <span className="text-sm font-semibold text-[#1b1b21]">
                Change Password
              </span>
            </div>
            <span className="material-symbols-outlined text-[#767683] group-hover:translate-x-1 transition-transform text-[20px]">
              chevron_right
            </span>
          </button>

          <button
            onClick={onNavigateSecurity}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f5f2fb] transition-colors group text-left border border-transparent hover:border-[#c6c5d4]/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#e4e1ea] flex items-center justify-center text-[#454652] group-hover:bg-[#dcdef7] group-hover:text-[#000666] transition-colors">
                <span className="material-symbols-outlined text-[18px]">devices</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#1b1b21]">
                  Active Sessions & PIN
                </span>
                <span className="text-[11px] text-[#5a5d72]">
                  2 devices connected
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#767683] group-hover:translate-x-1 transition-transform text-[20px]">
              chevron_right
            </span>
          </button>
        </div>
      </section>

      {/* App Settings List */}
      <section className="bg-white rounded-2xl shadow-xs border border-[#c6c5d4]/70 overflow-hidden">
        <div className="p-4 border-b border-[#e4e1ea] bg-[#f5f2fb]/70">
          <h3 className="text-base font-bold text-[#1b1b21] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#000666]">
              settings
            </span>
            <span>App Settings</span>
          </h3>
        </div>

        <div className="flex flex-col divide-y divide-[#e4e1ea]/70">
          {/* Language Setting */}
          <div className="p-4 flex items-center justify-between hover:bg-[#f5f2fb] transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#454652]">
                translate
              </span>
              <div>
                <span className="text-sm font-semibold text-[#1b1b21] block">
                  Language / भाषा
                </span>
                <span className="text-xs text-[#5a5d72]">
                  Current: {profile.language === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateLanguage('en')}
                className={`text-xs px-3 py-1 rounded-md font-semibold ${
                  profile.language === 'en'
                    ? 'bg-[#000666] text-white'
                    : 'bg-[#e4e1ea] text-[#454652]'
                }`}
              >
                English
              </button>
              <button
                onClick={() => onUpdateLanguage('hi')}
                className={`text-xs px-3 py-1 rounded-md font-semibold ${
                  profile.language === 'hi'
                    ? 'bg-[#000666] text-white'
                    : 'bg-[#e4e1ea] text-[#454652]'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Offline Mode Setting */}
          <div
            onClick={onNavigateSecurity}
            className="p-4 flex items-center justify-between hover:bg-[#f5f2fb] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#454652]">
                wifi_off
              </span>
              <div>
                <span className="text-sm font-semibold text-[#1b1b21] block">
                  Offline Mode Cache
                </span>
                <span className="text-xs text-[#5a5d72]">
                  Manage downloaded regions & local storage
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#767683]">
              chevron_right
            </span>
          </div>
        </div>
      </section>

      {/* Log Out Action */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={() => setShowLogoutDialog(true)}
          className="flex items-center gap-2 px-8 py-3 rounded-full border-2 border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors active:scale-95 text-sm font-bold shadow-xs"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Log Out</span>
        </button>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-[#c6c5d4] animate-fade-in">
            <h3 className="text-lg font-bold text-[#1b1b21] mb-2">Change Officer Password</h3>
            <p className="text-xs text-[#454652] mb-4">
              Enter your new security password for MapanSetu Portal.
            </p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#454652] block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  className="w-full h-11 px-3 rounded-xl border border-[#767683] text-sm focus:border-[#000666] outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#454652] hover:bg-[#e4e1ea] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[#000666] text-white rounded-full hover:bg-[#1a237e]"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog matching mockup */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden border border-[#c6c5d4] animate-fade-in">
            <div className="p-6 pb-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mb-3 mx-auto">
                <span className="material-symbols-outlined text-[32px] filled">
                  warning
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#1b1b21] mb-2">
                Unsynced Work
              </h2>
              <p className="text-xs sm:text-sm text-[#454652] leading-relaxed">
                You have {unsyncedCount || 3} unsynced inspections. Logging out will keep them securely on this device, but they won't be available on the central metrology server until you log back in and sync. Are you sure you want to log out?
              </p>
            </div>
            <div className="p-4 bg-[#f5f2fb] flex justify-end gap-2 border-t border-[#e4e1ea]">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#000666] hover:bg-[#dcdef7] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutDialog(false);
                  onLogout();
                }}
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#ba1a1a] text-white hover:bg-[#ba1a1a]/90 shadow-xs transition-colors"
              >
                Log Out Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {passwordChangedToast && (
        <div className="fixed bottom-24 right-4 bg-[#2e7d32] text-white px-4 py-2.5 rounded-2xl shadow-lg text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Password updated successfully</span>
        </div>
      )}
    </main>
  );
};
