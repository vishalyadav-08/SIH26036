"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Image as ImageIcon,
  MapPin,
  FileText,
  CloudUpload,
  CloudOff,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  initializeInspectionDraft,
  inspectionsService,
  sha256Hex,
  ServerEvidence,
} from "@/services/inspections/inspections.service";
import {
  getInspectionDraft,
  saveInspectionDraft,
  isOfflineSimulated,
} from "@/lib/offline-storage";
import { deleteEvidenceBlob, getEvidenceFile, putEvidenceBlob } from "@/lib/evidence-store";
import { EvidenceItem, EvidenceType, InspectionDraft } from "@/types/inspection";
import { InspectionStepper } from "@/components/field/InspectionStepper";

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
const MAX_BYTES = 10 * 1024 * 1024;

const CATEGORIES: { value: EvidenceType; label: string }[] = [
  { value: "NAMEPLATE_PHOTO", label: "Nameplate / serial plate" },
  { value: "SEAL_PHOTO", label: "Verification seal" },
  { value: "MACHINE_PHOTO", label: "Instrument" },
  { value: "SITE_PHOTO", label: "Site / premises" },
  { value: "DOCUMENT", label: "Supporting document (PDF)" },
];

function isOffline() {
  return typeof navigator !== "undefined" && (!navigator.onLine || isOfflineSimulated());
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** One position fix, or null when the device cannot provide one. Never 0,0. */
function currentPosition(): Promise<GeolocationPosition | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60_000 }
    );
  });
}

function fromServer(item: ServerEvidence): EvidenceItem {
  return {
    id: item.id,
    serverId: item.id,
    type: item.evidenceType,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.sizeBytes,
    mimeType: item.mimeType,
    latitude: item.latitude === null ? undefined : Number(item.latitude),
    longitude: item.longitude === null ? undefined : Number(item.longitude),
    gpsAccuracyMeters: item.gpsAccuracyMeters ?? undefined,
    capturedAt: item.capturedAt ?? item.uploadedAt,
    notes: item.notes || undefined,
    sha256: item.sha256,
    uploadState: "UPLOADED",
  };
}

function errorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { message?: string } } })?.response?.data;

  return data?.message || (err instanceof Error ? err.message : "Upload failed.");
}

export default function InspectionEvidencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [draft, setDraft] = useState<InspectionDraft | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [category, setCategory] = useState<EvidenceType>("NAMEPLATE_PHOTO");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [serverInspectionId, setServerInspectionId] = useState<string | null>(null);

  // Files that are still only on this device (offline or refused). Held here
  // for the session and persisted in IndexedDB (evidence-store) so a reload
  // or a later sync can still send the same bytes.
  const pendingFiles = useRef<Map<string, File>>(new Map());
  // Object URLs for image thumbnails, keyed by item id. Mirrored in a ref so
  // effects can check and revoke without re-running on every change.
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const previewsRef = useRef(previews);
  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);
  const fileInput = useRef<HTMLInputElement>(null);

  const addPreview = (id: string, url: string) =>
    setPreviews((current) => ({ ...current, [id]: url }));

  const dropPreview = (id: string) => {
    const url = previewsRef.current[id];
    if (url) URL.revokeObjectURL(url);
    setPreviews((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const persist = useCallback(
    (next: EvidenceItem[], base?: InspectionDraft | null) => {
      setEvidenceList(next);
      const current = base ?? draft;
      if (current) saveInspectionDraft({ ...current, evidence: next });
    },
    [draft]
  );

  // Load the local draft, then reconcile with the server when reachable.
  useEffect(() => {
    let mounted = true;

    (async () => {
      let current = getInspectionDraft(resolvedParams.id);
      if (!current) {
        current = initializeInspectionDraft(resolvedParams.id, user?.id || "usr-demo-off-001");
      }
      if (!mounted) return;
      setDraft(current);
      setEvidenceList(current.evidence);

      // Bring back the bytes of anything captured earlier but not yet
      // confirmed by the server, so previews and retries survive a reload.
      for (const item of current.evidence) {
        if (item.serverId || item.uploadState === "UPLOADED") continue;
        const file = await getEvidenceFile(item.id);
        if (!file || !mounted) continue;
        pendingFiles.current.set(item.id, file);
        if (file.type.startsWith("image/")) addPreview(item.id, URL.createObjectURL(file));
      }

      if (isOffline()) return;

      try {
        const inspection = await inspectionsService.ensureForApplication(resolvedParams.id);
        if (!mounted) return;

        setServerInspectionId(inspection.id);

        const serverItems = inspection.evidence.map(fromServer);
        const localOnly = current.evidence.filter(
          (e) => !e.serverId && e.uploadState !== "UPLOADED"
        );
        const merged = [...serverItems, ...localOnly];

        const updated: InspectionDraft = {
          ...current,
          serverInspectionId: inspection.id,
          // The server's version is what a later offline decision must
          // quote as expectedServerVersion.
          version: inspection.version,
          evidence: merged,
        };
        saveInspectionDraft(updated);
        setDraft(updated);
        setEvidenceList(merged);
      } catch (err) {
        if (mounted) setNotice(`Working offline: ${errorMessage(err)}`);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [resolvedParams.id, user?.id]);

  // Thumbnails for uploaded images come through the authenticated file route.
  useEffect(() => {
    let cancelled = false;

    evidenceList.forEach(async (item) => {
      if (!item.serverId || !item.mimeType.startsWith("image/")) return;
      if (previewsRef.current[item.id]) return;

      try {
        const url = await inspectionsService.evidenceObjectUrl(item.serverId);
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        addPreview(item.id, url);
      } catch {
        // No preview; the metadata row still renders.
      }
    });

    return () => {
      cancelled = true;
    };
  }, [evidenceList]);

  useEffect(() => {
    return () => {
      Object.values(previewsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const uploadItem = async (item: EvidenceItem, file: File): Promise<EvidenceItem> => {
    if (!serverInspectionId) {
      return { ...item, uploadState: "PENDING" };
    }

    try {
      const stored = await inspectionsService.uploadEvidence(serverInspectionId, file, {
        evidenceType: item.type,
        capturedAt: item.capturedAt,
        latitude: item.latitude,
        longitude: item.longitude,
        gpsAccuracyMeters: item.gpsAccuracyMeters,
        notes: item.notes,
        sha256: item.sha256,
        clientOperationId: item.id,
      });

      pendingFiles.current.delete(item.id);
      // The server holds it now; the device copy has done its job.
      await deleteEvidenceBlob(item.id);

      // The local thumbnail stays valid; no need to refetch the bytes.
      return { ...fromServer(stored), id: item.id };
    } catch (err) {
      return { ...item, uploadState: "FAILED", uploadError: errorMessage(err) };
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setBusy(true);
    setNotice(null);

    try {
      const position = await currentPosition();
      const additions: EvidenceItem[] = [];

      for (const file of Array.from(files)) {
        if (file.size > MAX_BYTES) {
          setNotice(`${file.name} is over 10 MB and was not attached.`);
          continue;
        }

        const id = crypto.randomUUID();
        const item: EvidenceItem = {
          id,
          type: category,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          latitude: position?.coords.latitude,
          longitude: position?.coords.longitude,
          gpsAccuracyMeters: position ? Math.round(position.coords.accuracy) : undefined,
          capturedAt: new Date(file.lastModified || Date.now()).toISOString(),
          sha256: await sha256Hex(file),
          uploadState: "PENDING",
        };

        pendingFiles.current.set(id, file);
        if (file.type.startsWith("image/")) {
          addPreview(id, URL.createObjectURL(file));
        }

        // Persist first, upload second: if the upload fails or the tab dies,
        // the bytes are still on the device for the sync path.
        try {
          await putEvidenceBlob(id, resolvedParams.id, file);
        } catch {
          setNotice("This browser cannot store files offline; keep the tab open until uploaded.");
        }

        additions.push(isOffline() ? item : await uploadItem(item, file));
      }

      persist([...evidenceList, ...additions]);
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const retry = async (item: EvidenceItem) => {
    const file = pendingFiles.current.get(item.id) ?? (await getEvidenceFile(item.id));

    if (!file) {
      setNotice("The original file is no longer on this device. Capture it again.");
      return;
    }
    pendingFiles.current.set(item.id, file);

    setBusy(true);
    try {
      const result = await uploadItem(item, file);
      persist(evidenceList.map((e) => (e.id === item.id ? result : e)));
    } finally {
      setBusy(false);
    }
  };

  const removeEvidence = async (item: EvidenceItem) => {
    setBusy(true);
    setNotice(null);

    try {
      if (item.serverId) {
        await inspectionsService.deleteEvidence(item.serverId);
      }

      dropPreview(item.id);
      pendingFiles.current.delete(item.id);
      await deleteEvidenceBlob(item.id);

      persist(evidenceList.filter((e) => e.id !== item.id));
    } catch (err) {
      setNotice(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveAndContinue = () => {
    if (draft) {
      saveInspectionDraft({ ...draft, evidence: evidenceList });
      router.push(`/field/inspections/${resolvedParams.id}/review`);
    }
  };

  const uploadedCount = evidenceList.filter((e) => e.uploadState === "UPLOADED").length;
  const pendingCount = evidenceList.length - uploadedCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/field/inspections/${resolvedParams.id}/readings`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Readings</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Step 3: Photographic Evidence Capture
        </h1>
        <p className="text-xs text-slate-600">
          Attach nameplate, seal, and site photos. Files are hashed on the device and
          verified by the server on upload.
        </p>
      </div>

      <InspectionStepper applicationId={resolvedParams.id} currentStep="evidence" />

      {notice && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Capture controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="space-y-1.5 flex-1">
            <label
              htmlFor="evidence-category"
              className="text-xs font-bold text-slate-900 uppercase tracking-wider block"
            >
              Evidence category
            </label>
            <select
              id="evidence-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as EvidenceType)}
              className="block w-full sm:max-w-xs p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPT}
              capture="environment"
              multiple
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInput.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{busy ? "Working..." : "Capture / Attach"}</span>
            </button>
          </div>
        </div>

        {/* Status line */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
          {serverInspectionId ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <CloudUpload className="w-3.5 h-3.5" /> Connected: uploads go straight to the server
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
              <CloudOff className="w-3.5 h-3.5" /> Offline: files are saved on this device and sent
              with your decision from the Sync Center
            </span>
          )}
          <span>•</span>
          <span>
            {uploadedCount} uploaded, {pendingCount} pending
          </span>
        </div>

        {/* Evidence grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Attached Evidence ({evidenceList.length})
          </h3>

          {evidenceList.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
              <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">
                No evidence attached yet. Use Capture / Attach to add photos or a PDF.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {evidenceList.map((item) => {
                const preview = previews[item.id];
                const isPdf = item.mimeType === "application/pdf";
                const state = item.uploadState ?? (item.serverId ? "UPLOADED" : "PENDING");

                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={preview}
                          alt={item.fileName}
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          {isPdf ? <FileText className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
                        </div>
                      )}

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                            {item.type.replace(/_/g, " ")}
                          </span>
                          {state === "UPLOADED" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <CloudUpload className="w-3 h-3" /> UPLOADED
                            </span>
                          )}
                          {state === "PENDING" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <CloudOff className="w-3 h-3" /> PENDING
                            </span>
                          )}
                          {state === "FAILED" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3" /> REFUSED
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-bold text-slate-900 font-mono truncate">
                          {item.fileName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {formatBytes(item.fileSize)} • {item.mimeType || "unknown type"}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {item.latitude !== undefined && item.longitude !== undefined ? (
                            <span>
                              {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                              {item.gpsAccuracyMeters !== undefined && ` (±${item.gpsAccuracyMeters} m)`}
                            </span>
                          ) : (
                            <span>GPS not captured</span>
                          )}
                        </div>
                        {item.sha256 && (
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            sha256 {item.sha256.slice(0, 16)}…
                          </div>
                        )}
                        {state === "FAILED" && item.uploadError && (
                          <div className="text-[10px] text-rose-700">{item.uploadError}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 shrink-0">
                      {state !== "UPLOADED" && serverInspectionId && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => retry(item)}
                          title="Retry upload"
                          className="text-slate-400 hover:text-emerald-700 p-1 cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => removeEvidence(item)}
                        title="Remove"
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Link
            href={`/field/inspections/${resolvedParams.id}/readings`}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Previous: Readings
          </Link>

          <button
            type="button"
            onClick={handleSaveAndContinue}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Proceed to Step 4: Review & Decision</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
