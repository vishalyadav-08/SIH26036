/**
 * Device-side store for evidence bytes captured while offline.
 *
 * localStorage cannot hold photos, so blobs live in IndexedDB keyed by the
 * evidence item id the draft already carries. A blob stays here until the
 * server has confirmed it (multipart upload or a SYNCED UPLOAD_EVIDENCE
 * operation), or the officer removes the item. Nothing in here is an
 * uploaded artifact until the API says so.
 */

const DB_NAME = "mapansetu_evidence";
const STORE = "blobs";
const VERSION = 1;

export interface StoredEvidenceBlob {
  id: string;
  applicationId: string;
  name: string;
  type: string;
  size: number;
  blob: Blob;
  storedAt: string;
}

function hasIndexedDb() {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("applicationId", "applicationId", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  if (!hasIndexedDb()) return Promise.reject(new Error("IndexedDB unavailable"));

  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = action(tx.objectStore(STORE));

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
      })
  );
}

export async function putEvidenceBlob(id: string, applicationId: string, file: File | Blob) {
  const record: StoredEvidenceBlob = {
    id,
    applicationId,
    name: (file as File).name ?? "evidence",
    type: file.type,
    size: file.size,
    blob: file,
    storedAt: new Date().toISOString(),
  };

  await run("readwrite", (store) => store.put(record));
}

export async function getEvidenceBlob(id: string): Promise<StoredEvidenceBlob | null> {
  try {
    return (await run<StoredEvidenceBlob | undefined>("readonly", (s) => s.get(id))) ?? null;
  } catch {
    return null;
  }
}

/** The stored bytes as a File, so upload code can treat both paths the same. */
export async function getEvidenceFile(id: string): Promise<File | null> {
  const stored = await getEvidenceBlob(id);
  if (!stored) return null;

  return new File([stored.blob], stored.name, { type: stored.type });
}

export async function deleteEvidenceBlob(id: string) {
  try {
    await run("readwrite", (store) => store.delete(id));
  } catch {
    // Nothing to remove, or no IndexedDB in this context.
  }
}

export async function listEvidenceBlobIds(applicationId: string): Promise<string[]> {
  try {
    const keys = await run<IDBValidKey[]>("readonly", (store) =>
      store.index("applicationId").getAllKeys(applicationId)
    );

    return keys.map(String);
  } catch {
    return [];
  }
}

/** Base64 for the sync payload. Chunked so large photos do not blow the stack. */
export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;

  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }

  return btoa(binary);
}
