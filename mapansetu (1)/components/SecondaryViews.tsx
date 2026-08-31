'use client';

import React from 'react';
import { Officer, AuditLog } from '@/lib/types';
import { Language, translations } from '@/lib/translations';
import { 
  Users, 
  Calendar, 
  ShieldAlert, 
  BookOpen, 
  HelpCircle, 
  Settings, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  FileText, 
  Scale, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

/* =========================================================
   1. OFFICERS MANAGEMENT VIEW
   ========================================================= */
export const OfficersView: React.FC<{ officers: Officer[] }> = ({ officers }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Legal Metrology Officers Directory
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Certified field inspectors, designations, and active workload assignments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {officers.map((officer) => (
          <div key={officer.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-sm">
                {officer.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  officer.status === 'Available'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {officer.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{officer.name}</h3>
              <span className="text-[11px] font-mono text-slate-500 font-medium">{officer.badgeNumber}</span>
              <p className="text-xs text-slate-600 mt-1">{officer.designation}</p>
            </div>

            <div className="text-xs space-y-1 pt-2 border-t border-slate-100 text-slate-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{officer.jurisdiction}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{officer.contact}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Assigned Load:</span>
              <span className="font-bold text-blue-900">{officer.assignedCount} Inspections</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   2. SCHEDULES / INSPECTION CALENDAR VIEW
   ========================================================= */
export const SchedulesView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Field Inspection Calendar & Stamping Schedule
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          Daily and weekly verification slots organized by inspector zones.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                28 OCT
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Demo Retail Store • Class II Scale Verification</h4>
                <p className="text-xs text-slate-600 mt-0.5">Assigned to Insp. Sharma • Morning Slot (10:00 AM - 01:00 PM)</p>
                <span className="text-[11px] text-slate-500">Location: Sector 14, New Delhi - 110001</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full self-start sm:self-auto">
              Confirmed Slot
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                29 OCT
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Metro Logistics Hub • Platform 500kg Scale Stamping</h4>
                <p className="text-xs text-slate-600 mt-0.5">Assigned to Inspector Ramesh Kumar • Afternoon Slot (02:00 PM - 05:00 PM)</p>
                <span className="text-[11px] text-slate-500">Location: Okhla Industrial Area Ph-III, Delhi</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full self-start sm:self-auto">
              Ready for Stamping
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   3. AUDIT ACTIVITY VIEW
   ========================================================= */
export const AuditView: React.FC<{ auditLogs: AuditLog[] }> = ({ auditLogs }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Tamper-Proof Audit & Verification Log
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          Cryptographically recorded operational events and certificate minting records.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="divide-y divide-slate-100">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-4 flex items-start gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{log.title}</span>
                  <span className="text-xs text-slate-400 font-mono">{log.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{log.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                  <span>Actor: <strong className="text-slate-700">{log.actor}</strong></span>
                  <span>•</span>
                  <span className="font-mono uppercase">{log.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   4. RESOURCES & METROLOGY GUIDE VIEW
   ========================================================= */
export const ResourcesView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Legal Metrology Legal Framework & Reference Standards
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          Statutory Acts, OIML International Recommendations, and Model Approval Guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Legal Metrology Act, 2009</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The principal statute governing weights, measures, packaged commodities, and consumer protection across India.
          </p>
          <div className="pt-2 text-xs font-semibold text-blue-700">
            Mandatory verification every 12 months for commercial scales.
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">OIML R 76-1 Standards</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            International organization of legal metrology requirements for non-automatic weighing instruments (Class I, II, III, IV).
          </p>
          <div className="pt-2 text-xs font-semibold text-indigo-700">
            Defines maximum permissible error (MPE) and verification intervals (e).
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Model Approval Repository</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Centralized certificates of approval issued to manufacturers and importers prior to commercial deployment.
          </p>
          <div className="pt-2 text-xs font-semibold text-emerald-700">
            Ensures instruments cannot be modified or tampered post-factory.
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   5. HELP & GRIEVANCE REDRESSAL VIEW
   ========================================================= */
export const HelpView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-200">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Help Center & Consumer Redressal
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          Assistance for merchants, inspectors, and public citizens regarding weighing accuracy.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-2">How do I verify a certificate in a retail shop?</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Simply ask the merchant for their MapanSetu verification certificate or scan the QR code sticker affixed to the scale using your phone camera. You can also enter the certificate ID (e.g., CERT-DEMO-001) in the Public Verification portal.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-2">What happens if a scale has an expired certificate?</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Under Section 24 of the Legal Metrology Act 2009, using an unverified or expired measuring instrument is a punishable violation. Merchants must submit a renewal application through MapanSetu before the expiry date.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-2">National Consumer Helpline (NCH)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dial toll-free <strong>1915</strong> or register a grievance directly on consumerhelpline.gov.in.
          </p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   6. SETTINGS VIEW
   ========================================================= */
export const SettingsView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-200">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Configuration & Metrology Thresholds
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          Administrative parameters, automatic expiry notification triggers, and cryptographic keys.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">Notification Windows</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-medium mb-1">First Expiry Warning</label>
              <input
                type="text"
                defaultValue="30 Days before due date"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Final Urgent Reminder</label>
              <input
                type="text"
                defaultValue="7 Days before due date"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Cryptographic Digital Seal Key</h3>
          <div className="p-3 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-700 border border-slate-200 break-all">
            GOVT-LM-DELHI-RSA4096-2026-KEY-9821
          </div>
        </div>
      </div>
    </div>
  );
};
