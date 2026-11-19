import * as XLSX from 'xlsx';
// @ts-ignore - mammoth is a cjs/browser bundle
import mammoth from 'mammoth';
import { parseExcelFile } from './excel';

export interface ParsedDocumentResult {
  fileType: 'excel' | 'doc' | 'text' | 'pdf';
  fileName: string;
  fileSize?: number;
  records?: any[];
  rawText?: string;
  summary: string;
}

export async function parseAnyDocument(file: File): Promise<ParsedDocumentResult> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    let extractedPreview = '';
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      // Lightweight extraction of readable text strings inside uncompressed PDF text operators if any
      const decoder = new TextDecoder('latin1');
      const rawStr = decoder.decode(bytes.slice(0, Math.min(bytes.length, 400000)));
      const matches = rawStr.match(/\(([\x20-\x7E]{4,120})\)/g);
      if (matches && matches.length > 0) {
        extractedPreview = matches
          .map(m => m.slice(1, -1))
          .filter(s => /[a-zA-Z0-9]/.test(s))
          .slice(0, 60)
          .join(' ')
          .trim();
      }
    } catch {
      extractedPreview = '';
    }

    const sizeKB = Math.max(1, Math.round(file.size / 1024));
    const sizeLabel = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(2)} MB` : `${sizeKB} KB`;

    return {
      fileType: 'pdf',
      fileName: file.name,
      fileSize: file.size,
      rawText: extractedPreview || `Tài liệu PDF đính kèm: ${file.name} (${sizeLabel})`,
      summary: `Tài liệu PDF (${sizeLabel}) đã sẵn sàng đính kèm vào Kho SOP hoặc trích xuất quy trình`
    };
  }

  // 2. Word Document (.docx)
  if (name.endsWith('.docx')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Extract raw text
      const rawRes = await mammoth.extractRawText({ arrayBuffer });
      const text = rawRes.value || '';

      // Try extract HTML tables if any
      const htmlRes = await mammoth.convertToHtml({ arrayBuffer });
      const html = htmlRes.value || '';

      // Check if html contains <table>
      let records: any[] = [];
      if (html.includes('<table')) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const table = doc.querySelector('table');
          if (table) {
            const ws = XLSX.utils.table_to_sheet(table);
            records = XLSX.utils.sheet_to_json(ws);
          }
        } catch (tableErr) {
          console.warn('Could not parse table from docx:', tableErr);
        }
      }

      return {
        fileType: 'doc',
        fileName: file.name,
        records: records.length > 0 ? records : undefined,
        rawText: text,
        summary: records.length > 0
          ? `Tài liệu Word chứa ${records.length} mục bảng và nội dung văn bản (${text.length} ký tự)`
          : `Tài liệu Word (.docx) chứa ${text.length} ký tự nội dung kỹ thuật`
      };
    } catch (err: any) {
      console.warn('Mammoth parse error, falling back to text read:', err);
      const text = await file.text();
      return {
        fileType: 'doc',
        fileName: file.name,
        rawText: text,
        summary: `Tài liệu Word (dạng text, ${text.length} ký tự)`
      };
    }
  }

  // 2. Legacy Word (.doc) or text/markdown
  if (name.endsWith('.doc') || name.endsWith('.txt') || name.endsWith('.md')) {
    try {
      const text = await file.text();
      // Clean non-printable characters for .doc binary fallback if any
      const cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').trim();
      return {
        fileType: name.endsWith('.doc') ? 'doc' : 'text',
        fileName: file.name,
        rawText: cleaned,
        summary: `Tài liệu văn bản (.${name.split('.').pop()}) chứa ${cleaned.length} ký tự`
      };
    } catch (err: any) {
      throw new Error(`Không thể đọc tài liệu: ${err.message}`);
    }
  }

  // 3. Excel (.xlsx, .xls, .csv, .htm, .html)
  try {
    const rows = await parseExcelFile(file);
    return {
      fileType: 'excel',
      fileName: file.name,
      records: rows,
      summary: `Bảng tính Excel chứa ${rows.length} hàng dữ liệu`
    };
  } catch (err: any) {
    // Fallback: read as raw text
    const text = await file.text();
    return {
      fileType: 'text',
      fileName: file.name,
      rawText: text,
      summary: `Tệp dữ liệu thô (${text.length} ký tự)`
    };
  }
}
