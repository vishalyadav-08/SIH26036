'use client';

import React, { useState } from 'react';
import { Instrument, InstrumentStatus } from '@/lib/types';
import { Language, translations } from '@/lib/translations';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  QrCode, 
  Scale, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

interface InstrumentsViewProps {
  language: Language;
  instruments: Instrument[];
  onSelectInstrument: (id: string) => void;
  onOpenRegisterInstrument: () => void;
}

export const InstrumentsView: React.FC<InstrumentsViewProps> = ({
  language,
  instruments,
  onSelectInstrument,
  onOpenRegisterInstrument,
}) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredInstruments = instruments.filter((inst) => {
    const matchesSearch =
      inst.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inst.status === statusFilter;
    const matchesType =
      typeFilter === 'ALL' || inst.type.toLowerCase().includes(typeFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Scale className="w-4 h-4 text-blue-700" />
            <span>National Metrology Device Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.instruments}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Manage and monitor registered measuring devices and digital passports.
          </p>
        </div>

        <button
          onClick={onOpenRegisterInstrument}
          className="px-4 py-2.5 bg-[#000666] hover:bg-[#1a237e] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-950/20 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.registerInstBtn}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Serial Number, or Manufacturer..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666] focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666] cursor-pointer appearance-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active (Valid)</option>
                <option value="EXPIRED">Expired</option>
                <option value="PENDING">Pending</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1 shrink-0">Filter by Type:</span>
          {['ALL', 'Weighing', 'Scale', 'Fuel', 'Flow', 'Weighbridge'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors shrink-0 cursor-pointer ${
                typeFilter === type
                  ? 'bg-blue-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'ALL' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Instruments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Instrument ID</th>
                <th className="px-5 py-3.5">Serial Number</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Manufacturer</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Next Due</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInstruments.length > 0 ? (
                filteredInstruments.map((inst) => (
                  <tr
                    key={inst.id}
                    onClick={() => onSelectInstrument(inst.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 group-hover:text-blue-700">
                      {inst.id}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600">
                      {inst.serialNumber}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {inst.type}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {inst.manufacturer}
                    </td>
                    <td className="px-5 py-4">
                      {inst.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          ACTIVE
                        </span>
                      )}
                      {inst.status === 'EXPIRED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3" />
                          EXPIRED
                        </span>
                      )}
                      {inst.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                          <Clock className="w-3 h-3" />
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">
                      {inst.nextDue}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectInstrument(inst.id);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectInstrument(inst.id);
                          }}
                          className="px-2.5 py-1 bg-[#000666] hover:bg-[#1a237e] text-white font-semibold rounded-lg transition-colors flex items-center gap-1 text-[11px] shadow-xs"
                        >
                          <QrCode className="w-3 h-3 text-emerald-400" />
                          <span>Passport</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No instruments found matching your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & pagination */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredInstruments.length}</span> registered devices
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
