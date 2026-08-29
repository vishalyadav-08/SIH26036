"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface AuditHashBadgeProps {
  hash: string;
  label?: string;
}

export function AuditHashBadge({ hash, label }: AuditHashBadgeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const truncated =
    hash.length > 16
      ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`
      : hash;

  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
      {label && <span className="font-sans text-slate-400 font-medium">{label}:</span>}
      <span title={hash}>{truncated}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 cursor-pointer"
        title="Copy full SHA-256 hash"
        aria-label="Copy SHA-256 hash"
      >
        {copied ? (
          <Check className="w-3 h-3 text-emerald-600" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
      {copied && (
        <span role="status" className="sr-only">
          Hash copied to clipboard
        </span>
      )}
    </div>
  );
}
