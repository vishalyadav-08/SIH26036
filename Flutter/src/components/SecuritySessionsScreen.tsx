import React, { useState } from 'react';
import { OfficerProfile } from '../types';
import { BiometricAuthModal } from './BiometricAuthModal';

interface SecuritySessionsScreenProps {
  profile: OfficerProfile;
  onBack: () => void;
}

export const SecuritySessionsScreen: React.FC<SecuritySessionsScreenProps> = ({
  profile,
  onBack,
}) => {
  const [sessions, setSessions] = useState([
    {
      id: 'sess_1',
      device: 'Samsung Galaxy Tab Active 3',
      isCurrent: true,
      lastActive: 'Just now',
      ip: '192.168.1.42',
      location: 'Sector 7 Field Office',
      icon: 'tablet_android',
    },
    {
      id: 'sess_2',
      device: 'Field Laptop - Dell Latitude',
      isCurrent: false,
      lastActive: '2 hours ago',
      ip: '10.0.4.115',
      location: 'HQ Desk #14',
      icon: 'laptop_chromebook',
    },
  ]);

  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [autoLockMinutes, setAutoLockMinutes] = useState('15');
  const [pin, setPin] = useState('4829');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showBiometricTestModal, setShowBiometricTestModal] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleTerminateSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setToastMessage('Session terminated successfully');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleTerminateAllOthers = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setToastMessage('All remote sessions terminated');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length === 4) {
      setPin(newPinInput);
      setShowPinModal(false);
      setNewPinInput('');
      setToastMessage('Offline PIN changed successfully');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32 w-full space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#eae7ef] rounded-full active:scale-95 transition-all text-[#1b1b21]"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#000666] tracking-tight">
            Security & Sessions
          </h1>
          <p className="text-xs text-[#454652]">
            Device management and authentication settings for {profile.badgeNumber}
          </p>
        </div>
      </div>

      {/* Active Sessions List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1b1b21] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#000666]">
              devices
            </span>
            <span>Active Sessions ({sessions.length})</span>
          </h2>
          <span className="text-xs text-[#767683]">Authorized hardware</span>
        </div>

        <div className="space-y-3">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                sess.isCurrent
                  ? 'border-[#000666] ring-1 ring-[#000666]/30'
                  : 'border-[#c6c5d4]/70'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    sess.isCurrent
                      ? 'bg-[#dcdef7] text-[#000666]'
                      : 'bg-[#e4e1ea] text-[#454652]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {sess.icon}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1b1b21]">
                      {sess.device}
                    </h3>
                    {sess.isCurrent && (
                      <span className="bg-[#2e7d32]/10 text-[#2e7d32] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        This Device
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#454652] mt-1">
                    <span>IP: {sess.ip}</span>
                    <span>•</span>
                    <span>{sess.location}</span>
                    <span>•</span>
                    <span>Active: {sess.lastActive}</span>
                  </div>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  onClick={() => handleTerminateSession(sess.id)}
                  className="self-end sm:self-auto px-4 py-1.5 rounded-full border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6] text-xs font-semibold active:scale-95 transition-all"
                >
                  Terminate
                </button>
              )}
            </div>
          ))}
        </div>

        {sessions.length > 1 && (
          <button
            onClick={handleTerminateAllOthers}
            className="text-xs font-bold text-[#ba1a1a] hover:underline flex items-center gap-1 mt-1 pl-1"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Terminate All Other Remote Sessions</span>
          </button>
        )}
      </section>

      {/* Security & Authentication Policies */}
      <section className="bg-white rounded-2xl border border-[#c6c5d4]/70 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#e4e1ea] bg-[#f5f2fb]/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1b1b21] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#000666]">
              lock
            </span>
            <span>Authentication Policies</span>
          </h2>
          <button
            onClick={() => setShowBiometricTestModal(true)}
            className="text-xs font-bold text-[#000666] hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">fingerprint</span>
            <span>Test Sensor</span>
          </button>
        </div>

        <div className="divide-y divide-[#e4e1ea]">
          {/* Offline PIN */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#454652]">
                pin
              </span>
              <div>
                <span className="text-sm font-semibold text-[#1b1b21] block">
                  Offline Quick PIN
                </span>
                <span className="text-xs text-[#454652]">
                  Currently set to 4-digit code (••••)
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowPinModal(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#dcdef7] text-[#000666] hover:bg-[#dcdef7]/80 transition-colors"
            >
              Change PIN
            </button>
          </div>

          {/* Biometrics Toggle */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#454652]">
                fingerprint
              </span>
              <div>
                <span className="text-sm font-semibold text-[#1b1b21] block">
                  Biometric Fast Unlock
                </span>
                <span className="text-xs text-[#454652]">
                  Unlock offline database using fingerprint or face
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBiometricTestModal(true)}
                className="text-xs font-semibold px-2.5 py-1 rounded-md border border-[#c6c5d4] hover:bg-[#f5f2fb] text-[#454652]"
              >
                Scan Now
              </button>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={biometricsEnabled}
                  onChange={(e) => setBiometricsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#c6c5d4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#000666]"></div>
              </label>
            </div>
          </div>

          {/* Auto-Lock Interval */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#454652]">
                timer
              </span>
              <div>
                <span className="text-sm font-semibold text-[#1b1b21] block">
                  Auto-Lock Inactivity Timer
                </span>
                <span className="text-xs text-[#454652]">
                  Locks the screen when left unattended
                </span>
              </div>
            </div>
            <select
              value={autoLockMinutes}
              onChange={(e) => setAutoLockMinutes(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#f5f2fb] border border-[#c6c5d4] text-xs font-semibold text-[#1b1b21] outline-none"
            >
              <option value="5">5 Minutes</option>
              <option value="15">15 Minutes (Standard)</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
            </select>
          </div>
        </div>
      </section>

      {/* Change PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-xl border border-[#c6c5d4] animate-fade-in text-center">
            <h3 className="text-lg font-bold text-[#1b1b21] mb-1">Set 4-Digit PIN</h3>
            <p className="text-xs text-[#454652] mb-4">
              Used for rapid offline unlocking in remote field locations.
            </p>
            <form onSubmit={handleSavePin} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="0000"
                className="w-full text-center tracking-[1em] text-2xl font-bold font-mono h-12 rounded-xl border-2 border-[#000666] bg-[#f5f2fb] outline-none"
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#454652] hover:bg-[#e4e1ea] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newPinInput.length !== 4}
                  className="px-5 py-2 text-xs font-semibold bg-[#000666] text-white rounded-full disabled:opacity-50"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Biometric Sensor Test Modal */}
      {showBiometricTestModal && (
        <BiometricAuthModal
          title="Test Biometric Sensor"
          subtitle="Place your finger on the biometric sensor or look at the camera to verify hardware function"
          onSuccess={() => {
            setShowBiometricTestModal(false);
            setToastMessage('Biometric verification passed (Hardware token OK)');
            setTimeout(() => setToastMessage(null), 3000);
          }}
          onCancel={() => setShowBiometricTestModal(false)}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-24 right-4 bg-[#1b1b21] text-white px-4 py-2.5 rounded-2xl shadow-lg text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#2e7d32]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
};
