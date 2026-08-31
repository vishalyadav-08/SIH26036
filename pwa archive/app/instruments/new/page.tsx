"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Gauge,
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { registerInstrument } from "@/services/instruments/instruments.service";
import { InstrumentType, RegisterInstrumentDto } from "@/types/instrument";

const INSTRUMENT_TYPES: { label: string; value: InstrumentType }[] = [
  { label: "Electronic Scale (Digital Weighing)", value: "ELECTRONIC_SCALE" },
  { label: "Platform Scale (Industrial)", value: "PLATFORM_SCALE" },
  { label: "Counter Scale (Retail)", value: "COUNTER_SCALE" },
  { label: "Weighbridge (Heavy Vehicles)", value: "WEIGHBRIDGE" },
  { label: "Spring Balance (Mechanical)", value: "SPRING_BALANCE" },
  { label: "Measuring Tape / Length Standard", value: "MEASURING_TAPE" },
];

export default function RegisterInstrumentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterInstrumentDto>({
    instrumentNumber: "INS-2026-0045",
    serialNumber: "",
    instrumentType: "ELECTRONIC_SCALE",
    manufacturer: "",
    model: "",
    capacity: 50,
    capacityUnit: "kg",
    location: "Main Business Premises",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.instrumentNumber.trim()) {
      setError("Instrument Number / ID is required.");
      return;
    }
    if (!formData.manufacturer.trim()) {
      setError("Manufacturer name is required.");
      return;
    }
    if (!formData.model.trim()) {
      setError("Model identifier is required.");
      return;
    }
    if (!formData.capacity || Number(formData.capacity) <= 0) {
      setError("Rated capacity must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerInstrument(formData);
      setSuccessMsg(`Instrument ${formData.instrumentNumber} registered successfully! Redirecting...`);
      setTimeout(() => {
        router.push("/app/instruments");
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register instrument.";
      setError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/app/instruments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Registered Instruments</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Register New Metrological Instrument
        </h1>
        <p className="text-xs text-slate-600">
          Add an instrument to your official business inventory for statutory calibration and verification tracking
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Registration Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Gauge className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Instrument Technical Specifications
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Instrument ID */}
          <div className="space-y-1.5">
            <label
              htmlFor="instrumentNumber"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Instrument Number / ID: *
            </label>
            <input
              type="text"
              id="instrumentNumber"
              required
              value={formData.instrumentNumber}
              onChange={(e) =>
                setFormData({ ...formData, instrumentNumber: e.target.value })
              }
              placeholder="e.g. INS-2026-0045"
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Serial Number */}
          <div className="space-y-1.5">
            <label
              htmlFor="serialNumber"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Factory Serial Number:
            </label>
            <input
              type="text"
              id="serialNumber"
              value={formData.serialNumber || ""}
              onChange={(e) =>
                setFormData({ ...formData, serialNumber: e.target.value })
              }
              placeholder="e.g. SN-8842-X19"
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Instrument Category */}
          <div className="sm:col-span-2 space-y-1.5">
            <label
              htmlFor="instrumentType"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Instrument Category / Type: *
            </label>
            <select
              id="instrumentType"
              required
              value={formData.instrumentType}
              onChange={(e) =>
                setFormData({ ...formData, instrumentType: e.target.value })
              }
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {INSTRUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Manufacturer */}
          <div className="space-y-1.5">
            <label
              htmlFor="manufacturer"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Manufacturer Name: *
            </label>
            <input
              type="text"
              id="manufacturer"
              required
              value={formData.manufacturer}
              onChange={(e) =>
                setFormData({ ...formData, manufacturer: e.target.value })
              }
              placeholder="e.g. Precision Weights Synth"
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <label
              htmlFor="model"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Model Designation: *
            </label>
            <input
              type="text"
              id="model"
              required
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              placeholder="e.g. PWS-Retail 50"
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Rated Capacity */}
          <div className="space-y-1.5">
            <label
              htmlFor="capacity"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Rated Capacity (Max): *
            </label>
            <input
              type="number"
              id="capacity"
              required
              min="0.01"
              step="any"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: Number(e.target.value) })
              }
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Capacity Unit */}
          <div className="space-y-1.5">
            <label
              htmlFor="capacityUnit"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Measurement Unit: *
            </label>
            <select
              id="capacityUnit"
              required
              value={formData.capacityUnit}
              onChange={(e) =>
                setFormData({ ...formData, capacityUnit: e.target.value })
              }
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="kg">kg (Kilograms)</option>
              <option value="g">g (Grams)</option>
              <option value="t">t (Metric Tonnes)</option>
              <option value="L">L (Litres)</option>
              <option value="m">m (Metres)</option>
            </select>
          </div>

          {/* Physical Location */}
          <div className="sm:col-span-2 space-y-1.5">
            <label
              htmlFor="location"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Premises Location / Counter / Bay:
            </label>
            <input
              type="text"
              id="location"
              value={formData.location || ""}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g. Checkout Counter 1, Retail Front"
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            href="/app/instruments"
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isSubmitting ? "Registering..." : "Complete Registration"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
