"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, Gauge, Save } from "lucide-react";

import { readApiError } from "@/lib/api-error";
import { useInstrument, useUpdateInstrument } from "@/hooks/useInstruments";
import { Instrument, InstrumentType, RegisterInstrumentDto } from "@/types/instrument";

const INSTRUMENT_TYPES: { label: string; value: InstrumentType }[] = [
  { label: "Electronic Scale (Digital Weighing)", value: "ELECTRONIC_SCALE" },
  { label: "Platform Scale (Industrial)", value: "PLATFORM_SCALE" },
  { label: "Counter Scale (Retail)", value: "COUNTER_SCALE" },
  { label: "Weighbridge (Heavy Vehicles)", value: "WEIGHBRIDGE" },
  { label: "Spring Balance (Mechanical)", value: "SPRING_BALANCE" },
  { label: "Measuring Tape / Length Standard", value: "MEASURING_TAPE" },
];

export default function EditInstrumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: instrument, isPending: loading, error: loadError } = useInstrument(id);
  const update = useUpdateInstrument(id);

  const [formData, setFormData] = useState<RegisterInstrumentDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const saving = update.isPending;

  useEffect(() => {
    if (!instrument) return;

    // Pre-fill from the server record so an untouched field is submitted
    // exactly as stored, rather than blanked.
    setFormData({
      instrumentNumber: instrument.instrumentNumber,
      serialNumber: instrument.serialNumber ?? "",
      instrumentType: instrument.instrumentType,
      manufacturer: instrument.manufacturer,
      model: instrument.model,
      capacity: instrument.capacity,
      capacityUnit: instrument.capacityUnit,
      location: instrument.location ?? "",
    });
  }, [instrument]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) return;

    setError(null);

    update.mutate(formData, {
      onSuccess: () => {
        setSuccessMsg("Changes saved.");
        setTimeout(() => router.push(`/app/instruments/${id}`), 900);
      },
      // The server rejects a duplicate instrument number or serial with 409;
      // readApiError surfaces that message rather than a generic failure.
      onError: (err) => setError(readApiError(err)),
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading instrument…</div>
    );
  }

  if (!formData || !instrument) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm text-rose-700">
          {error ?? (loadError ? readApiError(loadError) : "Instrument not found.")}
        </p>
        <Link href="/app/instruments" className="text-sm underline underline-offset-4">
          Back to instruments
        </Link>
      </div>
    );
  }

  const field =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <Link
        href={`/app/instruments/${id}`}
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to instrument
      </Link>

      <div className="flex items-start gap-3">
        <span className="rounded-xl border border-neutral-200 bg-neutral-50 p-2">
          <Gauge className="h-5 w-5 text-neutral-700" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit instrument</h1>
          <p className="text-sm text-neutral-600">
            {instrument.instrumentNumber} · {instrument.status.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium">Instrument number</span>
          <input
            className={field}
            value={formData.instrumentNumber}
            onChange={(e) =>
              setFormData({ ...formData, instrumentNumber: e.target.value })
            }
            required
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium">Serial number</span>
          <input
            className={field}
            value={formData.serialNumber}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            required
          />
        </label>

        <label className="space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium">Instrument type</span>
          <select
            className={field}
            value={formData.instrumentType}
            onChange={(e) =>
              setFormData({ ...formData, instrumentType: e.target.value })
            }
          >
            {INSTRUMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium">Manufacturer</span>
          <input
            className={field}
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            required
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium">Model</span>
          <input
            className={field}
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            required
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium">Capacity</span>
          <input
            className={field}
            type="number"
            step="0.001"
            min="0.001"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            required
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium">Capacity unit</span>
          <input
            className={field}
            value={formData.capacityUnit}
            onChange={(e) => setFormData({ ...formData, capacityUnit: e.target.value })}
            required
          />
        </label>

        <label className="space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium">Location</span>
          <input
            className={field}
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </label>

        <div className="flex items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save changes"}
          </button>

          <Link
            href={`/app/instruments/${id}`}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
