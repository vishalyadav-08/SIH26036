import React from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const getBorder = () => {
    switch (type) {
      case 'success':
        return 'border-[#2e7d32] text-[#2e7d32]';
      case 'warning':
        return 'border-[#f9a825] text-[#f9a825]';
      case 'error':
        return 'border-[#ba1a1a] text-[#ba1a1a]';
      default:
        return 'border-[#8690ee] text-[#8690ee]';
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 left-4 md:left-auto md:max-w-md z-50 animate-bounce-short">
      <div className="bg-[#1b1b21] text-white px-4 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`material-symbols-outlined text-[20px] shrink-0 ${getBorder()}`}>
            {getIcon()}
          </span>
          <p className="text-sm font-medium text-white/95 truncate">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
};
