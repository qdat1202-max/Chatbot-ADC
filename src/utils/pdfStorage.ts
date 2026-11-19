import { SOPPdfAttachment } from '../types';

const DB_NAME = 'adc_tbyt_pdf_db';
const DB_VERSION = 1;
const STORE_NAME = 'sop_pdfs';

// In-memory fallback in case IndexedDB is unavailable in sandboxed/private browsers
const memoryBlobMap = new Map<string, Blob>();

function openPdfDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      resolve(null);
      return;
    }
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('IndexedDB unavailable for PDF storage, using memory fallback:', request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('IndexedDB open threw error:', err);
      resolve(null);
    }
  });
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function savePdfAttachment(file: File, existingId?: string): Promise<SOPPdfAttachment> {
  const isPdf =
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    throw new Error('Vui lòng chọn tệp định dạng PDF (.pdf).');
  }

  const maxBytes = 50 * 1024 * 1024; // 50 MB limit
  if (file.size > maxBytes) {
    throw new Error('Dung lượng file PDF vượt quá 50 MB. Vui lòng nén hoặc chia nhỏ tài liệu.');
  }

  const id = existingId || `PDF-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
  const blob = new Blob([await file.arrayBuffer()], { type: 'application/pdf' });

  memoryBlobMap.set(id, blob);

  const db = await openPdfDatabase();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(blob, id);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          console.warn('Could not write PDF to IndexedDB:', tx.error);
          db.close();
          resolve();
        };
      } catch (err) {
        console.warn('IndexedDB transaction failed:', err);
        db.close();
        resolve();
      }
    });
  }

  return {
    id,
    fileName: file.name,
    fileSize: file.size,
    mimeType: 'application/pdf',
    uploadedAt: new Date().toISOString().split('T')[0]
  };
}

export async function getPdfBlob(id: string): Promise<Blob | null> {
  if (!id) return null;

  const memBlob = memoryBlobMap.get(id);
  if (memBlob) return memBlob;

  const db = await openPdfDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const res = req.result;
        db.close();
        if (res instanceof Blob) {
          memoryBlobMap.set(id, res);
          resolve(res);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => {
        db.close();
        resolve(null);
      };
    } catch {
      db.close();
      resolve(null);
    }
  });
}

export async function deletePdfAttachment(id: string): Promise<void> {
  if (!id) return;
  memoryBlobMap.delete(id);

  const db = await openPdfDatabase();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      db.close();
      resolve();
    }
  });
}

export async function downloadPdfAttachment(attachment: SOPPdfAttachment): Promise<boolean> {
  const blob = await getPdfBlob(attachment.id);
  if (!blob) return false;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = attachment.fileName || 'tai-lieu-sop.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return true;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Không thể đọc dữ liệu file PDF'));
    reader.readAsDataURL(file);
  });
}
