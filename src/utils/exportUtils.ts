export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;

  const keys = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
  const headerRow = keys.join(',');

  const rows = data.map(item => {
    return keys.map(key => {
      const val = item[key] ?? '';
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    }).join(',');
  });

  const csvContent = [headerRow, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function exportToJSON(data: any[], filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function triggerPrint() {
  window.print();
}

import { Attachment } from '../types/common';

/**
 * Formats a raw byte count into a human-readable size (KB / MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
  return Math.max(1, Math.round(bytes / 1024)) + ' KB';
}

/**
 * Infers standard MIME type based on file extension.
 */
export function inferMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'pdf':
      return 'application/pdf';
    case 'json':
      return 'application/json';
    case 'xml':
      return 'application/xml';
    case 'log':
    case 'txt':
      return 'text/plain';
    case 'patch':
    case 'diff':
      return 'text/x-diff';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Reads a File object from input and returns its Base64 Data URL.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as string'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a Data URL (base64 or percent-encoded) into a real binary Blob.
 */
export function dataUrlToBlob(dataUrl: string, defaultMime: string = 'application/octet-stream'): Blob {
  const parts = dataUrl.split(',');
  if (parts.length < 2) {
    return new Blob([dataUrl], { type: defaultMime });
  }

  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : defaultMime;

  if (parts[0].includes(';base64')) {
    try {
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (e) {
      console.warn('Failed to decode base64 data, fallback to raw text Blob', e);
      return new Blob([parts[1]], { type: mime });
    }
  } else {
    // Percent-encoded text
    try {
      const text = decodeURIComponent(parts[1]);
      return new Blob([text], { type: mime });
    } catch (e) {
      return new Blob([parts[1]], { type: mime });
    }
  }
}

import { getUploadedFile } from './fileStorage';

/**
 * Downloads an attachment to the user's browser, preserving original binary content,
 * original filename, and correct MIME type.
 * 
 * Strict rules:
 * - For user uploads (source === 'upload'): always downloads the exact uploaded file/blob.
 * - Never synthesizes or substitutes fake diagnostic evidence for uploaded files.
 * - Shows "The original file is unavailable." if original file binary is missing.
 */
export async function downloadAttachment(
  attachment: Attachment | null | undefined,
  onToast?: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void
): Promise<boolean> {
  if (!attachment) {
    if (onToast) onToast('Download failed', 'The original file is unavailable.', 'error');
    return false;
  }

  let blob: Blob | null = null;

  // 1. In-memory File or Blob reference (available during current browser session)
  if (attachment.file instanceof Blob) {
    blob = attachment.file;
  }

  // 2. Persistent client-side IndexedDB binary storage (survives page refreshes)
  if (!blob && attachment.id) {
    try {
      const stored = await getUploadedFile(attachment.id);
      if (stored instanceof Blob) {
        blob = stored;
      }
    } catch (err) {
      console.warn('Could not read binary file from storage:', err);
    }
  }

  // 3. Encoded data payload (Data URL or base64 data)
  if (!blob && attachment.fileData) {
    try {
      const mime = attachment.type || inferMimeType(attachment.name);
      if (attachment.fileData.startsWith('data:')) {
        blob = dataUrlToBlob(attachment.fileData, mime);
      } else {
        blob = new Blob([attachment.fileData], { type: mime });
      }
    } catch (err) {
      console.warn('Could not decode fileData to Blob:', err);
    }
  }

  // 4. Sample or remote static file asset URL (e.g. /sample-evidence/...)
  if (!blob && attachment.url && attachment.url !== '#' && !attachment.url.startsWith('javascript:')) {
    try {
      const metaEnv = (import.meta as unknown as { env?: { BASE_URL?: string } }).env;
      const resolvedUrl = attachment.url.startsWith('/') && metaEnv?.BASE_URL && metaEnv.BASE_URL !== '/'
        ? `${metaEnv.BASE_URL.replace(/\/$/, '')}${attachment.url}`
        : attachment.url;

      const response = await fetch(resolvedUrl);
      if (response.ok) {
        blob = await response.blob();
      } else {
        console.warn(`Static asset fetch returned status ${response.status} for ${resolvedUrl}`);
      }
    } catch (err) {
      console.warn('Could not fetch asset from attachment.url:', err);
    }
  }

  // 5. If no real binary data exists, fail cleanly with appropriate message
  if (!blob) {
    const errorMsg = attachment.source === 'sample'
      ? 'The sample evidence file is unavailable.'
      : 'The original file is unavailable.';
    if (onToast) onToast('Download failed', errorMsg, 'error');
    return false;
  }

  // 6. Trigger native browser download using the exact File/Blob
  try {
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', attachment.name || 'download');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      try {
        URL.revokeObjectURL(downloadUrl);
      } catch (e) {
        // ignore
      }
    }, 4000);

    if (onToast) {
      onToast(`Downloading ${attachment.name}...`, undefined, 'info');
    }
    return true;
  } catch (err) {
    console.error('Failed to trigger browser download:', err);
    if (onToast) onToast('Download failed', 'The original file is unavailable.', 'error');
    return false;
  }
}

/**
 * Creates a valid minimal PDF file as a Base64 Data URL.
 */
export function createSamplePdfDataUrl(title: string, content: string): string {
  const safeTitle = title.replace(/[()\\]/g, '');
  const safeContent = content.replace(/[()\\]/g, '');
  const stream = `BT /F1 16 Tf 50 740 Td (${safeTitle}) Tj 0 -30 Td /F1 11 Tf (${safeContent}) Tj 0 -20 Td /F1 9 Tf (PubVantage Production Studio - Automated PDF Evidence Artifact) Tj ET`;
  const streamLen = stream.length;

  const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj
5 0 obj << /Length ${streamLen} >>
stream
${stream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000249 00000 n 
0000000328 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
${420 + streamLen}
%%EOF`;

  try {
    return 'data:application/pdf;base64,' + btoa(unescape(encodeURIComponent(pdf)));
  } catch (e) {
    return 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNjEyIDc5Ml0+PmVuZG9iagp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoxNzEKJSVFT0Y=';
  }
}

/**
 * Creates a valid PNG Data URL for sample screenshot attachments.
 */
export function createSamplePngDataUrl(title: string, subtitle: string = ''): string {
  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 380;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Dark theme background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 640, 380);

        // Header bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 640, 36);

        // Window control circles
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(20, 18, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(36, 18, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.beginPath(); ctx.arc(52, 18, 5, 0, Math.PI * 2); ctx.fill();

        // Header title
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText('PubVantage Production Studio — Evidence Capture', 75, 22);

        // Content Area Card
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(24, 56, 592, 300, 8);
        } else {
          ctx.rect(24, 56, 592, 300);
        }
        ctx.fill();
        ctx.stroke();

        // Badge
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(44, 80, 140, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('DIAGNOSTIC EVIDENCE', 52, 96);

        // Main Title
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.fillText(title, 44, 136);

        // Subtitle
        if (subtitle) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '12px system-ui, sans-serif';
          ctx.fillText(subtitle, 44, 160);
        }

        // Code / log simulation box
        ctx.fillStyle = '#090d16';
        ctx.fillRect(44, 180, 552, 140);
        ctx.fillStyle = '#34d399';
        ctx.font = '11px monospace';
        ctx.fillText('> [PRE-FLIGHT STAGE]: Automated EPUB 3.2 Inspector', 56, 208);
        ctx.fillText('> [ERROR CODE]: RSC-005 / WCAG-2.1 Conformance Fault', 56, 230);
        ctx.fillStyle = '#f87171';
        ctx.fillText('> [STATUS]: Flagged for Production Engineer Review', 56, 252);
        ctx.fillStyle = '#64748b';
        ctx.fillText('> Timestamp: 2026-09-05T11:00:00Z | Server Node: PRD-SCAN-1400', 56, 280);

        return canvas.toDataURL('image/png');
      }
    } catch (e) {
      console.warn('Canvas PNG generation failed, using fallback Base64', e);
    }
  }

  // Base64 1x1 fallback PNG
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}

/**
 * Creates a text/json/xml Data URL.
 */
export function createSampleTextDataUrl(content: string, mimeType: string = 'text/plain'): string {
  return `data:${mimeType};charset=utf-8,` + encodeURIComponent(content);
}

