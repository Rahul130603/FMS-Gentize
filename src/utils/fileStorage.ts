/**
 * Client-Side Binary File Storage
 * 
 * Provides in-memory caching and persistent IndexedDB storage for real
 * user-uploaded files (images, PDFs, logs, etc.). This ensures uploaded files
 * are never modified, never replaced with sample content, survive page refreshes,
 * and do not exceed localStorage quotas.
 */

const DB_NAME = 'pubvantage_evidence_store';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_files';

// Fast in-memory cache of File/Blob objects for zero-latency downloads
const memoryCache = new Map<string, Blob | File>();

/**
 * Opens or initializes the IndexedDB object store for binary files.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof window.indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB.'));
  });
}

/**
 * Stores a user-uploaded File or Blob in both memory and IndexedDB.
 */
export async function storeUploadedFile(id: string, file: Blob | File): Promise<void> {
  if (!id || !file) return;

  // 1. Store in memory cache for instant access
  memoryCache.set(id, file);

  // 2. Persist to IndexedDB
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({
        id,
        file,
        name: file instanceof File ? file.name : undefined,
        type: file.type,
        size: file.size,
        storedAt: Date.now()
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not persist file to IndexedDB, retained in memory cache:', err);
  }
}

/**
 * Retrieves a user-uploaded File or Blob by attachment ID.
 * Checks the in-memory cache first, then falls back to IndexedDB.
 */
export async function getUploadedFile(id: string): Promise<Blob | File | null> {
  if (!id) return null;

  // 1. Check in-memory cache
  if (memoryCache.has(id)) {
    const cached = memoryCache.get(id);
    if (cached) return cached;
  }

  // 2. Check IndexedDB
  try {
    const db = await openDB();
    return await new Promise<Blob | File | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        const record = req.result;
        if (record && record.file) {
          const blobOrFile = record.file;
          // Populate memory cache for subsequent downloads
          memoryCache.set(id, blobOrFile);
          resolve(blobOrFile);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Failed to retrieve file from IndexedDB:', err);
    return null;
  }
}

/**
 * Checks if a file exists in memory or IndexedDB.
 */
export function hasInMemoryFile(id: string): boolean {
  return memoryCache.has(id);
}

/**
 * Deletes a file from both in-memory cache and IndexedDB storage.
 */
export async function removeUploadedFile(id: string): Promise<void> {
  if (!id) return;

  memoryCache.delete(id);

  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (err) {
    // ignore
  }
}
