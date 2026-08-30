import React, { useState, useEffect } from 'react';

interface BiometricAuthModalProps {
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onSuccess: () => void;
  onCancel: () => void;
  allowPinFallback?: boolean;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  title = 'Biometric Authentication',
  subtitle = 'Place your finger on the biometric sensor or look at the camera to authenticate',
  actionLabel = 'Verify Identity',
  onSuccess,
  onCancel,
  allowPinFallback = true,
}) => {
  const [authMode, setAuthMode] = useState<'fingerprint' | 'face' | 'pin'>('fingerprint');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto trigger scan on initial open for slick user experience
  useEffect(() => {
    handleStartScan();
  }, []);

  const handleStartScan = () => {
    setScanState('scanning');
    setErrorMessage('');

    setTimeout(() => {
      // Simulate biometric reading
      setScanState('success');
      setTimeout(() => {
        onSuccess();
      }, 700);
    }, 1400);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '4829' || pin.length === 4) {
      setScanState('success');
      setTimeout(() => {
        onSuccess();
      }, 600);
    } else {
      setErrorMessage('Incorrect PIN. Please try again or use biometrics.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl border border-[#c6c5d4] text-center flex flex-col items-center gap-5 relative overflow-hidden">
        {/* Glow Header */}
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-xl font-bold text-[#000666] tracking-tight">{title}</h2>
          <p className="text-xs text-[#5a5d72] leading-relaxed max-w-[280px]">
            {authMode === 'pin' ? 'Enter your 4-digit quick offline security PIN' : subtitle}
          </p>
        </div>

        {/* Biometric Interactive Scanner Arena */}
        {authMode !== 'pin' ? (
          <div className="my-2 flex flex-col items-center gap-4">
            <button
              onClick={handleStartScan}
              disabled={scanState === 'scanning' || scanState === 'success'}
              className="relative group focus:outline-none"
              title="Click to scan biometric"
            >
              {/* Pulse waves */}
              {scanState === 'scanning' && (
                <>
                  <div className="absolute inset-0 rounded-full bg-[#8690ee]/40 animate-ping"></div>
                  <div className="absolute -inset-3 rounded-full border-2 border-[#000666]/30 animate-pulse"></div>
                </>
              )}

              {/* Main Scanner Container */}
              <div
                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                  scanState === 'success'
                    ? 'bg-[#2e7d32] text-white scale-105 shadow-[#2e7d32]/30'
                    : scanState === 'scanning'
                    ? 'bg-[#000666] text-[#8690ee] scale-100'
                    : 'bg-[#dcdef7] text-[#000666] hover:bg-[#c8ccf7] cursor-pointer active:scale-95'
                }`}
              >
                {scanState === 'success' ? (
                  <span className="material-symbols-outlined text-[54px] filled animate-bounce">
                    check_circle
                  </span>
                ) : authMode === 'fingerprint' ? (
                  <span
                    className={`material-symbols-outlined text-[54px] ${
                      scanState === 'scanning' ? 'animate-pulse text-white' : ''
                    }`}
                  >
                    fingerprint
                  </span>
                ) : (
                  <span
                    className={`material-symbols-outlined text-[54px] ${
                      scanState === 'scanning' ? 'animate-pulse text-white' : ''
                    }`}
                  >
                    face
                  </span>
                )}
              </div>
            </button>

            {/* Scanning Status message */}
            <div>
              {scanState === 'scanning' && (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#000666]">
                  <span className="w-2 h-2 rounded-full bg-[#000666] animate-ping"></span>
                  <span>Verifying encrypted hardware token...</span>
                </div>
              )}
              {scanState === 'success' && (
                <p className="text-xs font-bold text-[#2e7d32]">
                  Identity Verified Successfully!
                </p>
              )}
              {scanState === 'idle' && (
                <p className="text-xs text-[#5a5d72]">
                  Tap the sensor to scan
                </p>
              )}
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'fingerprint' ? 'face' : 'fingerprint')}
                className="text-xs text-[#000666] font-semibold hover:underline flex items-center gap-1 px-3 py-1 rounded-full bg-[#f5f2fb]"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {authMode === 'fingerprint' ? 'face' : 'fingerprint'}
                </span>
                <span>Switch to {authMode === 'fingerprint' ? 'Face ID' : 'Fingerprint'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* PIN Fallback Input */
          <form onSubmit={handlePinSubmit} className="w-full space-y-4 my-2">
            <div>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full text-center tracking-[1.2em] text-2xl font-bold font-mono h-12 rounded-xl border-2 border-[#000666] bg-[#f5f2fb] text-[#1b1b21] outline-none"
                autoFocus
              />
              <p className="text-[11px] text-[#767683] mt-1">Default Demo PIN: 4829</p>
            </div>

            {errorMessage && (
              <p className="text-xs font-semibold text-[#ba1a1a]">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={pin.length !== 4}
              className="w-full py-2.5 rounded-full bg-[#000666] text-white text-xs font-bold disabled:opacity-50 hover:bg-[#1a237e] transition-all"
            >
              Confirm PIN
            </button>
          </form>
        )}

        {/* Modal Controls */}
        <div className="w-full pt-3 border-t border-[#e4e1ea] flex items-center justify-between">
          {allowPinFallback && authMode !== 'pin' ? (
            <button
              type="button"
              onClick={() => setAuthMode('pin')}
              className="text-xs font-semibold text-[#000666] hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">pin</span>
              <span>Use Offline PIN</span>
            </button>
          ) : allowPinFallback && authMode === 'pin' ? (
            <button
              type="button"
              onClick={() => setAuthMode('fingerprint')}
              className="text-xs font-semibold text-[#000666] hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">fingerprint</span>
              <span>Use Biometrics</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 rounded-full text-xs font-bold text-[#454652] hover:bg-[#e4e1ea] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
