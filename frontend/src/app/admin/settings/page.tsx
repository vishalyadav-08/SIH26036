"use client";

import {
  Server,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Status & Cryptographic Configuration
        </h1>
        <p className="text-xs text-slate-600">
          Environment parameters, cryptographic specifications, and node health
        </p>
      </div>

      {/* Environment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-700">
            <Server className="w-5 h-5" />
            <h2 className="text-sm font-bold text-slate-900">Prototype Environment</h2>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Edition:</span>
              <span className="font-mono font-bold text-slate-900">SIH26036 Prototype</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Core Node:</span>
              <span className="font-mono text-slate-700">mapansetu-supervisor-01</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">API Gateway:</span>
              <span className="font-mono text-emerald-700 font-bold">ONLINE (:8080)</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-700">
            <KeyRound className="w-5 h-5" />
            <h2 className="text-sm font-bold text-slate-900">Cryptographic Standard</h2>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Signature Algorithm:</span>
              <span className="font-mono font-bold text-slate-900">RSA-PSS / SHA-256</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Key Custody:</span>
              <span className="font-mono text-slate-700">Secure Backend Vault</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Audit Hash Algorithm:</span>
              <span className="font-mono font-bold text-slate-900">SHA-256 Sequential</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supervisor Session Info */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900">
          Active Supervisor Session
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
          <div>
            <span className="text-slate-500 block">Logged In As:</span>
            <span className="font-bold text-slate-900">{user?.displayName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Supervisor Role:</span>
            <span className="font-mono font-bold text-indigo-700">
              {user?.role}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Account Email:</span>
            <span className="font-mono text-slate-700">{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
