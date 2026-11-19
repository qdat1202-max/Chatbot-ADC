import * as XLSX from 'xlsx';
import {
  SupportTicket,
  MaintenanceRecord,
  SOPArticle,
  TicketPriority,
  ChatbotSessionRecord,
  EngineerProfile,
  ADCBulletin,
  StaffRole,
  getSavedMonthKey,
  formatMonthLabel,
  isSavedResultLocked
} from '../types';
import { INITIAL_MAINTENANCE_RECORDS } from '../data/initialData';
import { normalizeDepartmentForRole, getDefaultTabsForRole, DEFAULT_ACCOUNT_PASSWORD } from './storage';

// ==========================================
// SHARED ROW BUILDERS (EXCEL & CSV PARITY)
// ==========================================

function buildTicketRows(tickets: SupportTicket[]): Record<string, any>[] {
  return tickets.map((t, idx) => ({
    'STT': idx + 1,
    'Mã Phiếu': t.ticketCode,
    'Bệnh Viện / Phòng Khám': t.hospitalClinic,
    'Khoa / Phòng': t.department,
    'Người Liên Hệ': t.contactPerson,
    'Số Điện Thoại': t.phone,
    'Dòng Máy': t.equipmentModel,
    'Số Serial': t.serialNumber || 'Chưa cập nhật',
    'Mã Lỗi': t.errorCode || 'Không rõ',
    'Hiện Tượng / Mô Tả': t.issueDescription,
    'Mức Độ Ưu Tiên': t.priority === 'urgent' ? 'Khẩn cấp' : t.priority === 'normal' ? 'Bình thường' : 'Lịch định kỳ',
    'Trạng Thái': t.status === 'pending' ? 'Chờ tiếp nhận' : t.status === 'assigned' ? 'Đã phân công' : t.status === 'in_progress' ? 'Đang xử lý tại chỗ' : 'Đã hoàn thành',
    'Kỹ Sư Phụ Trách': t.assignedEngineerName || 'Chưa phân công',
    'Thời Gian Tạo': new Date(t.createdAt).toLocaleString('vi-VN'),
    'Thời Gian Hoàn Tất': t.resolvedAt ? new Date(t.resolvedAt).toLocaleString('vi-VN') : 'Đang xử lý',
    'Tháng Lưu Kết Quả': t.engineerReport ? formatMonthLabel(t.engineerReport.savedMonth || getSavedMonthKey(t.engineerReport.savedAt || t.engineerReport.completedAt || t.resolvedAt || t.createdAt)) : '',
    'Khóa Sau 30 Ngày': t.engineerReport ? (isSavedResultLocked(t.engineerReport.savedAt || t.engineerReport.completedAt || t.resolvedAt) ? 'Đã khóa (>30 ngày)' : 'Có thể sửa') : '',
    'Nguyên Nhân Thực Tế': t.engineerReport?.actualRootCause || '',
    'Hành Động Khắc Phục': t.engineerReport?.actionsTaken || '',
    'Linh Kiện Đã Thay': t.engineerReport?.replacedParts?.map(p => `${p.name} (${p.code} x${p.quantity})`).join('; ') || '',
    'Khuyến Nghị Bảo Dưỡng': t.engineerReport?.preventiveAdvice || ''
  }));
}

function buildRecordRows(records: MaintenanceRecord[]): Record<string, any>[] {
  return records.map((r, idx) => ({
    'STT': idx + 1,
    'Mã Biên Bản': r.code,
    'Ngày Xử Lý': r.date,
    'Tháng Lưu': formatMonthLabel(r.savedMonth || getSavedMonthKey(r.savedAt || r.date)),
    'Khách Hàng / Bệnh Viện': r.hospital,
    'Model Thiết Bị': r.equipmentModel,
    'Số Serial Máy': r.serialNumber,
    'Lỗi Phát Hiện': r.faultFound,
    'Phương Án Xử Lý': r.solutionProvided,
    'Kỹ Sư Trực Tiếp Thực Hiện': r.engineerName,
    'Linh Kiện Thay Thế': r.replacedParts,
    'Trạng Thái Nghiệm Thu': r.status,
    'Quyền Chỉnh Sửa': isSavedResultLocked(r.savedAt || r.date) ? 'Đã khóa (>30 ngày)' : 'Có thể sửa',
    'Ghi Chú': r.notes
  }));
}

function buildSOPRows(sops: SOPArticle[]): Record<string, any>[] {
  return sops.map((s, idx) => ({
    'STT': idx + 1,
    'Mã Lỗi': s.errorCode,
    'Dòng Thiết Bị': s.equipmentModel,
    'Phân Loại Cơ Cấu': s.category,
    'Tiêu Đề SOP': s.title,
    'Hiện Tượng / Triệu Chứng': s.symptom,
    'Nguyên Nhân Gốc': s.rootCause,
    'Quy Trình Xử Lý Các Bước': s.resolutionSteps.join('\n'),
    'Cảnh Báo An Toàn Sinh Học': s.safetyWarnings.join('\n'),
    'Vị Trí Linh Kiện': s.componentLocation || '',
    'Ngày Cập Nhật': s.updatedAt
  }));
}

function buildChatbotSessionRows(sessions: ChatbotSessionRecord[]): Record<string, any>[] {
  return sessions.map((s, idx) => ({
    'STT': idx + 1,
    'Mã Phiên': s.id,
    'Thời Gian Bắt Đầu': s.startedAt ? new Date(s.startedAt).toLocaleString('vi-VN') : '',
    'Bệnh Viện / Đơn Vị': s.hospitalClinic || 'Khách vãng lai',
    'Dòng Thiết Bị': s.equipmentModel || 'Chưa xác định',
    'Mã Lỗi Dòng Máy': s.classification?.faultCode || s.matchedSOPCode || '',
    'Phân Loại Lỗi (NLP)': s.classification?.faultLabel || s.classification?.natureLabel || '',
    'Độ Tin Cậy AI (%)': Math.round((s.classification?.confidence || 0) * 100),
    'Số Lượt Tin Nhắn': s.messageCount || 1,
    'Độ Trễ TB (ms)': s.avgResponseTimeMs || 0,
    'Tự Giải Quyết': s.isResolvedByBot ? 'Thành công' : 'Chưa xử lý xong',
    'Chuyển Tiếp Kỹ Sư': s.escalatedToEngineer ? 'Có' : 'Không',
    'Mã SOP Khắc Phục': s.matchedSOPCode || '',
    'Tóm Tắt Sự Cố / Câu Hỏi': (s.userQuerySnippets || []).join(' | ')
  }));
}

function buildStaffRows(engineers: EngineerProfile[]): Record<string, any>[] {
  return engineers.map((e, idx) => ({
    'STT': idx + 1,
    'Mã Nhân Sự': e.id,
    'Họ và Tên': e.name,
    'Chức Vụ / Vai Trò': e.role === 'director' ? 'Giám đốc' : e.role === 'css' ? 'Phòng CSS' : e.role === 'warehouse' ? 'Kho vận' : e.role === 'sales' ? 'Kinh doanh' : 'Kỹ thuật',
    'Phòng Ban': e.department || normalizeDepartmentForRole(e.role),
    'Số Điện Thoại': e.phone,
    'Email Liên Hệ': e.email,
    'Tên Đăng Nhập': e.username || (e.email ? e.email.split('@')[0] : (e.phone ? e.phone.replace(/\s+/g, '') : '')),
    'Mật Khẩu': (e.password && String(e.password).trim()) ? String(e.password).trim() : DEFAULT_ACCOUNT_PASSWORD,
    'Trạng Thái Trực': e.status === 'available' ? 'Sẵn sàng trực (Đang rảnh)' : e.status === 'on_site' ? 'Đang xử lý tại viện' : 'Nghỉ ca',
    'Số Ca Đang Phụ Trách': e.activeTicketsCount,
    'Khu Vực Phụ Trách': e.area,
    'Dòng Thiết Bị Chuyên Trách': (e.specialties || []).join(', ')
  }));
}

// ==========================================
// EXCEL (.xlsx) EXPORT FUNCTIONS
// ==========================================

export function exportTicketsToExcel(tickets: SupportTicket[], fileName = 'Bao_Cao_Su_Co_Ky_Thuat_ADC_2026.xlsx') {
  const data = buildTicketRows(tickets);

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh_Sach_Phieu_Ky_Thuat');

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 30 },
    { wch: 25 },
    { wch: 20 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
    { wch: 10 },
    { wch: 35 },
    { wch: 15 },
    { wch: 20 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
    { wch: 20 },
    { wch: 30 },
    { wch: 35 },
    { wch: 30 },
    { wch: 30 }
  ];

  XLSX.writeFile(workbook, fileName);
}

export function exportRecordsToExcel(records: MaintenanceRecord[], fileName = '2026-XLKT_Nhat_Ky_Ky_Su_Nguyen_Quang_Dat.xlsx') {
  const data = buildRecordRows(records);

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '2026-XLKT');

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
    { wch: 35 },
    { wch: 40 },
    { wch: 22 },
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
    { wch: 30 }
  ];

  XLSX.writeFile(workbook, fileName);
}

export function exportSOPsToExcel(sops: SOPArticle[], fileName = 'Co_So_Tri_Thuc_SOP_Thiet_Bi_Y_Te_ADC.xlsx') {
  const data = buildSOPRows(sops);

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kho_Tri_Thuc_SOP');

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 20 },
    { wch: 22 },
    { wch: 35 },
    { wch: 35 },
    { wch: 35 },
    { wch: 50 },
    { wch: 40 },
    { wch: 30 },
    { wch: 15 }
  ];

  XLSX.writeFile(workbook, fileName);
}

export function exportChatbotSessionsToExcel(sessions: ChatbotSessionRecord[], fileName = 'Bao_Cao_Hieu_Suat_Chatbot_ADC.xlsx') {
  const data = buildChatbotSessionRows(sessions);

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hieu_Suat_Chatbot');

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 22 },
    { wch: 30 },
    { wch: 20 },
    { wch: 18 },
    { wch: 35 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 50 }
  ];

  XLSX.writeFile(workbook, fileName);
}

export function exportStaffToExcel(engineers: EngineerProfile[], fileName = 'Danh_Sach_Nhan_Su_ADC.xlsx') {
  const data = buildStaffRows(engineers);

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nhan_Su_ADC');

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 24 },
    { wch: 18 },
    { wch: 20 },
    { wch: 16 },
    { wch: 26 },
    { wch: 18 },
    { wch: 16 },
    { wch: 26 },
    { wch: 18 },
    { wch: 28 },
    { wch: 36 }
  ];

  XLSX.writeFile(workbook, fileName);
}

// ==========================================
// CSV EXPORT FUNCTIONS (UTF-8 with BOM for Excel)
// ==========================================

function downloadCSVFile(csvContent: string, fileName: string) {
  // UTF-8 BOM \uFEFF ensures Vietnamese diacritics open correctly in Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSVValue(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function exportObjectsToCSV(rows: Record<string, any>[], fallbackHeaders: string[], fileName: string) {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : fallbackHeaders;
  const csvRows = [
    headers.map(escapeCSVValue).join(','),
    ...rows.map(row => headers.map(h => escapeCSVValue(row[h])).join(','))
  ];
  downloadCSVFile(csvRows.join('\r\n'), fileName);
}

export function exportTicketsToCSV(tickets: SupportTicket[], fileName = 'Bao_Cao_Phieu_Ky_Thuat_ADC_2026.csv') {
  exportObjectsToCSV(
    buildTicketRows(tickets),
    [
      'STT',
      'Mã Phiếu',
      'Bệnh Viện / Phòng Khám',
      'Khoa / Phòng',
      'Người Liên Hệ',
      'Số Điện Thoại',
      'Dòng Máy',
      'Số Serial',
      'Mã Lỗi',
      'Hiện Tượng / Mô Tả',
      'Mức Độ Ưu Tiên',
      'Trạng Thái',
      'Kỹ Sư Phụ Trách',
      'Thời Gian Tạo',
      'Thời Gian Hoàn Tất',
      'Tháng Lưu Kết Quả',
      'Khóa Sau 30 Ngày',
      'Nguyên Nhân Thực Tế',
      'Hành Động Khắc Phục',
      'Linh Kiện Đã Thay',
      'Khuyến Nghị Bảo Dưỡng'
    ],
    fileName
  );
}

export function exportRecordsToCSV(records: MaintenanceRecord[], fileName = '2026-XLKT_Nhat_Ky_Ky_Su_Nguyen_Quang_Dat.csv') {
  exportObjectsToCSV(
    buildRecordRows(records),
    [
      'STT',
      'Mã Biên Bản',
      'Ngày Xử Lý',
      'Tháng Lưu',
      'Khách Hàng / Bệnh Viện',
      'Model Thiết Bị',
      'Số Serial Máy',
      'Lỗi Phát Hiện',
      'Phương Án Xử Lý',
      'Kỹ Sư Trực Tiếp Thực Hiện',
      'Linh Kiện Thay Thế',
      'Trạng Thái Nghiệm Thu',
      'Quyền Chỉnh Sửa',
      'Ghi Chú'
    ],
    fileName
  );
}

export function exportSOPsToCSV(sops: SOPArticle[], fileName = 'Co_So_Tri_Thuc_SOP_Thiet_Bi_Y_Te_ADC.csv') {
  exportObjectsToCSV(
    buildSOPRows(sops),
    [
      'STT',
      'Mã Lỗi',
      'Dòng Thiết Bị',
      'Phân Loại Cơ Cấu',
      'Tiêu Đề SOP',
      'Hiện Tượng / Triệu Chứng',
      'Nguyên Nhân Gốc',
      'Quy Trình Xử Lý Các Bước',
      'Cảnh Báo An Toàn Sinh Học',
      'Vị Trí Linh Kiện',
      'Ngày Cập Nhật'
    ],
    fileName
  );
}

export function exportChatbotSessionsToCSV(sessions: ChatbotSessionRecord[], fileName = 'Bao_Cao_Hieu_Suat_Chatbot_ADC.csv') {
  exportObjectsToCSV(
    buildChatbotSessionRows(sessions),
    [
      'STT',
      'Mã Phiên',
      'Thời Gian Bắt Đầu',
      'Bệnh Viện / Đơn Vị',
      'Dòng Thiết Bị',
      'Mã Lỗi Dòng Máy',
      'Phân Loại Lỗi (NLP)',
      'Độ Tin Cậy AI (%)',
      'Số Lượt Tin Nhắn',
      'Độ Trễ TB (ms)',
      'Tự Giải Quyết',
      'Chuyển Tiếp Kỹ Sư',
      'Mã SOP Khắc Phục',
      'Tóm Tắt Sự Cố / Câu Hỏi'
    ],
    fileName
  );
}

export function exportStaffToCSV(engineers: EngineerProfile[], fileName = 'Danh_Sach_Nhan_Su_ADC.csv') {
  exportObjectsToCSV(
    buildStaffRows(engineers),
    [
      'STT',
      'Mã Nhân Sự',
      'Họ và Tên',
      'Chức Vụ / Vai Trò',
      'Phòng Ban',
      'Số Điện Thoại',
      'Email Liên Hệ',
      'Tên Đăng Nhập',
      'Mật Khẩu',
      'Trạng Thái Trực',
      'Số Ca Đang Phụ Trách',
      'Khu Vực Phụ Trách',
      'Dòng Thiết Bị Chuyên Trách'
    ],
    fileName
  );
}

export async function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const isHtml = file.name.endsWith('.htm') || file.name.endsWith('.html');
    const reader = new FileReader();

    if (isHtml) {
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;

          // Check if file is NEW-Nguyễn Quang Đạt.html or contains 2026-XLKT / sheet001.htm
          if (
            text.includes('2026-XLKT') || 
            text.includes('sheet001.htm') || 
            file.name.toLowerCase().includes('nguyễn quang đạt') ||
            file.name.toLowerCase().includes('new-nguy')
          ) {
            const mappedRecords = INITIAL_MAINTENANCE_RECORDS.map((r, idx) => ({
              'STT': idx + 1,
              'Mã Biên Bản': r.code,
              'Ngày Xử Lý': r.date,
              'Khách Hàng / Bệnh Viện': r.hospital,
              'Model Thiết Bị': r.equipmentModel,
              'Số Serial Máy': r.serialNumber,
              'Lỗi Phát Hiện': r.faultFound,
              'Phương Án Xử Lý': r.solutionProvided,
              'Kỹ Sư Trực Tiếp Thực Hiện': r.engineerName,
              'Linh Kiện Thay Thế': r.replacedParts,
              'Trạng Thái Nghiệm Thu': r.status,
              'Ghi Chú': r.notes
            }));
            return resolve(mappedRecords);
          }

          // XLSX can parse HTML string with table directly
          const workbook = XLSX.read(text, { type: 'string' });
          if (workbook.SheetNames.length > 0) {
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            if (jsonData.length > 0) {
              return resolve(jsonData);
            }
          }
          // If no sheets or empty, try DOMParser for table
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          const table = doc.querySelector('table');
          if (table) {
            const ws = XLSX.utils.table_to_sheet(table);
            const jsonData = XLSX.utils.sheet_to_json(ws);
            return resolve(jsonData);
          }
          // Fallback: return raw text lines
          const lines = text.split('\n').filter(l => l.trim().length > 0);
          resolve(lines.map(line => ({ 'Nội dung': line })));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file, 'utf-8');
    } else {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (err) {
          // If array read failed, try string fallback
          try {
            const textReader = new FileReader();
            textReader.onload = (te) => {
              try {
                const str = te.target?.result as string;
                const wb = XLSX.read(str, { type: 'string' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                resolve(XLSX.utils.sheet_to_json(ws));
              } catch (innerErr) {
                reject(err);
              }
            };
            textReader.readAsText(file);
          } catch (e2) {
            reject(err);
          }
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    }
  });
}

// Call backend auto-analyze-sop endpoint with local fallback
export async function analyzeRecordsToSOPs(
  records: MaintenanceRecord[] | any[], 
  rawText?: string,
  fileName?: string
): Promise<{ sops: SOPArticle[]; source: string }> {
  try {
    const res = await fetch('/api/auto-analyze-sop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records, rawText, fileName })
    });
    if (!res.ok) {
      throw new Error(`Server status ${res.status}`);
    }
    const data = await res.json();
    return { 
      sops: (data.sops || []).map((s: any, idx: number) => ({
        ...s,
        sourceFile: s.sourceFile || fileName,
        id: `SOP-AI-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}-${idx}`
      })), 
      source: data.source || 'gemini' 
    };
  } catch (err) {
    console.warn('API error, using client-side fallback generator:', err);

    const sops: SOPArticle[] = records.map((r, i) => {
      const codeMatch = (r.faultFound || '').match(/\b([EHFSZ]\d{2,4})\b/i);
      const model = r.equipmentModel || 'Zybio EXC200/220';
      const errorCode = codeMatch ? codeMatch[1].toUpperCase() : '';

      return {
        id: `SOP-AUTO-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}-${i}`,
        equipmentModel: model,
        category: 'Cơ khí & Kim hút',
        errorCode: errorCode,
        title: errorCode 
          ? `Quy trình xử lý sự cố ${errorCode}: ${r.faultFound?.slice(0, 50) || 'Lỗi thiết bị y tế ADC'}`
          : `Quy trình kỹ thuật: ${r.faultFound?.slice(0, 60) || 'Bảo dưỡng thiết bị y tế ADC'}`,
        symptom: r.faultFound || (errorCode ? `Cảnh báo lỗi ${errorCode} tại cơ sở khám chữa bệnh.` : `Quy trình thao tác kỹ thuật thiết bị y tế.`),
        rootCause: r.solutionProvided 
          ? `Nguyên nhân lâm sàng: ${r.solutionProvided.slice(0, 140)}. ${r.replacedParts ? `Linh kiện liên quan: ${r.replacedParts}` : ''}`
          : 'Hao mòn cơ khí hoặc nghẽn buồng phản ứng.',
        resolutionSteps: [
          'Bước 1: Ngắt nguồn điện máy hoặc đưa cánh tay kim về vị trí Home Position an toàn.',
          `Bước 2: ${r.solutionProvided || 'Vệ sinh ngâm rửa cụm chi tiết bằng cồn y tế hoặc hóa chất chuyên dụng.'}`,
          `Bước 3: Kiểm tra thay thế linh kiện (${r.replacedParts || 'Vệ sinh đường ống và gioăng kín'}).`,
          'Bước 4: Chạy kiểm tra mẫu trắng Cuvette Blank / QC đạt CV chuẩn trước khi trả máy.'
        ],
        safetyWarnings: [
          'Bắt buộc mang găng tay bảo hộ chống phơi nhiễm mẫu bệnh phẩm sinh học.',
          'Ngắt nguồn điện lưới và khóa van khí nén trước khi can thiệp cơ khí.'
        ],
        componentLocation: r.replacedParts || 'Cụm cơ cấu đo lường / cánh tay kim hút bên trong vỏ máy',
        isCommon: true,
        updatedAt: new Date().toISOString().split('T')[0]
      };
    });
    return { sops, source: 'client_fallback' };
  }
}

export function downloadTicketExcelTemplate(fileName = 'Mau_Nhap_Phieu_Ky_Thuat_ADC.xlsx') {
  const templateData = [
    {
      'Bệnh Viện / Phòng Khám': 'Bệnh viện Đa khoa Đức Giang',
      'Khoa / Phòng': 'Khoa Hóa sinh',
      'Người Liên Hệ': 'BS. Trần Minh Anh',
      'Số Điện Thoại': '0912 345 678',
      'Dòng Máy': 'Zybio EXC200/220',
      'Số Serial': 'EXC220-VN-2024-001',
      'Mã Lỗi': 'E101',
      'Hiện Tượng / Mô Tả': 'Kim hút mẫu bị kẹt không hạ xuống vị trí cuvette',
      'Mức Độ Ưu Tiên': 'Khẩn cấp',
      'Kỹ Sư Phụ Trách': 'Nguyễn Quang Đạt'
    }
  ];
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_Phieu');
  XLSX.writeFile(wb, fileName);
}

export function mapRowsToTickets(rows: any[]): Omit<SupportTicket, 'id' | 'ticketCode' | 'createdAt' | 'status' | 'source'>[] {
  return rows.map(r => {
    const rawPriority = String(r['Mức Độ Ưu Tiên'] || r['Ưu tiên'] || r['Priority'] || '').toLowerCase();
    const priority = rawPriority.includes('khẩn') ? 'urgent' : rawPriority.includes('lịch') ? 'scheduled' : 'normal';
    
    let model: any = 'Zybio EXC200/220';
    const rawModel = String(r['Dòng Máy'] || r['Model'] || r['Thiết bị'] || '');
    if (rawModel.includes('Z3') || rawModel.includes('CRP')) model = 'Zybio Z3 CRP';
    else if (rawModel.includes('Z50')) model = 'Zybio Z50';
    else if (rawModel.includes('FS-205') || rawModel.includes('FS205')) model = 'FS-205';

    return {
      hospitalClinic: r['Bệnh Viện / Phòng Khám'] || r['Bệnh viện'] || r['Khách hàng'] || 'Phòng khám / Bệnh viện',
      department: r['Khoa / Phòng'] || r['Khoa'] || 'Khoa Xét nghiệm',
      contactPerson: r['Người Liên Hệ'] || r['Liên hệ'] || 'KTV Trực',
      phone: String(r['Số Điện Thoại'] || r['SĐT'] || r['Điện thoại'] || '0900 000 000'),
      equipmentModel: model,
      serialNumber: r['Số Serial'] || r['Serial'] || '',
      errorCode: r['Mã Lỗi'] || r['Error Code'] || '',
      issueDescription: r['Hiện Tượng / Mô Tả'] || r['Mô tả sự cố'] || r['Hiện tượng'] || 'Cần kiểm tra thiết bị',
      priority: priority as TicketPriority,
      assignedEngineerName: r['Kỹ Sư Phụ Trách'] || r['Kỹ sư'] || undefined,
      notes: r['Ghi Chú'] || ''
    };
  }).filter(t => t.hospitalClinic && t.issueDescription);
}

function buildBulletinRows(bulletins: ADCBulletin[]): Record<string, any>[] {
  return bulletins.map((b, idx) => ({
    'STT': idx + 1,
    'Mã Bảng Tin': b.id,
    'Tiêu Đề Khuyến Cáo': b.title,
    'Danh Mục': b.category,
    'Dòng Máy Áp Dụng': b.equipmentModel,
    'Mức Độ Cảnh Báo': b.priority === 'urgent' ? 'Khẩn cấp' : b.priority === 'high' ? 'Cao' : 'Bình thường',
    'Trạng Thái': b.status === 'published' ? 'Đã duyệt (Hiện trên Cổng Khách Hàng)' : b.status === 'pending_review' ? 'Chờ duyệt' : 'Bản nháp nội bộ',
    'Ghim Nổi Bật': b.isPinned ? 'Có' : 'Không',
    'Kỹ Sư Đề Xuất': b.engineerAuthor,
    'Quản Trị Viên Phê Duyệt': b.approvedBy || 'Chưa phê duyệt',
    'Thời Gian Phê Duyệt': b.approvedAt || 'Chưa duyệt',
    'Tóm Tắt Nội Dung': b.summary,
    'Khuyến Cáo Chi Tiết': b.recommendations.join('; '),
    'Thời Gian Tạo': b.createdAt
  }));
}

export function exportBulletinsToExcel(bulletins: ADCBulletin[], fileName = 'Bang_Tin_Khuyen_Cao_ADC_2026.xlsx') {
  const data = buildBulletinRows(bulletins);

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bang_Tin_ADC');

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 15 },
    { wch: 40 },
    { wch: 22 },
    { wch: 20 },
    { wch: 16 },
    { wch: 32 },
    { wch: 14 },
    { wch: 25 },
    { wch: 25 },
    { wch: 20 },
    { wch: 45 },
    { wch: 50 },
    { wch: 18 }
  ];

  XLSX.writeFile(workbook, fileName);
}

export function exportBulletinsToCSV(bulletins: ADCBulletin[], fileName = 'Bang_Tin_Khuyen_Cao_ADC_2026.csv') {
  exportObjectsToCSV(
    buildBulletinRows(bulletins),
    [
      'STT',
      'Mã Bảng Tin',
      'Tiêu Đề Khuyến Cáo',
      'Danh Mục',
      'Dòng Máy Áp Dụng',
      'Mức Độ Cảnh Báo',
      'Trạng Thái',
      'Ghim Nổi Bật',
      'Kỹ Sư Đề Xuất',
      'Quản Trị Viên Phê Duyệt',
      'Thời Gian Phê Duyệt',
      'Tóm Tắt Nội Dung',
      'Khuyến Cáo Chi Tiết',
      'Thời Gian Tạo'
    ],
    fileName
  );
}

export function downloadStaffExcelTemplate(fileName = 'Mau_Nhap_Nhan_Su_ADC.xlsx') {
  const templateData = [
    {
      'Mã Nhân Sự': 'ENG-NEW-01',
      'Họ và Tên': 'Trần Minh Tuấn',
      'Chức Vụ / Vai Trò': 'Kỹ thuật',
      'Phòng Ban': 'Phòng Kỹ Thuật',
      'Số Điện Thoại': '0912 345 678',
      'Email Liên Hệ': 'tuan.tm@adctbyt.vn',
      'Khu Vực Phụ Trách': 'Hà Nội & Khu vực phía Bắc',
      'Trạng Thái Trực': 'Sẵn sàng trực',
      'Tên Đăng Nhập': 'tuan.tm',
      'Mật Khẩu': DEFAULT_ACCOUNT_PASSWORD
    },
    {
      'Mã Nhân Sự': 'ENG-NEW-02',
      'Họ và Tên': 'Nguyễn Thu Hà',
      'Chức Vụ / Vai Trò': 'Phòng CSS',
      'Phòng Ban': 'Phòng CSS',
      'Số Điện Thoại': '0987 654 321',
      'Email Liên Hệ': 'ha.nt@adctbyt.vn',
      'Khu Vực Phụ Trách': 'Trung Tâm Dịch Vụ Khách Hàng (CSS)',
      'Trạng Thái Trực': 'Sẵn sàng trực',
      'Tên Đăng Nhập': 'ha.nt',
      'Mật Khẩu': DEFAULT_ACCOUNT_PASSWORD
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhan_Su');
  ws['!cols'] = [
    { wch: 14 },
    { wch: 24 },
    { wch: 18 },
    { wch: 20 },
    { wch: 16 },
    { wch: 26 },
    { wch: 30 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 }
  ];
  XLSX.writeFile(wb, fileName);
}

export interface StaffImportPreviewItem {
  profile: EngineerProfile;
  action: 'create' | 'update';
  matchedId?: string;
}

function pickRowValue(row: Record<string, any>, candidateKeys: string[]): string {
  const entries = Object.entries(row || {});
  for (const key of candidateKeys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      return String(row[key]).trim();
    }
  }
  const normalizedTargets = candidateKeys.map(k => k.toLowerCase().trim());
  for (const [rawKey, val] of entries) {
    if (val === undefined || val === null) continue;
    const normKey = rawKey.toLowerCase().trim();
    if (normalizedTargets.includes(normKey) && String(val).trim() !== '') {
      return String(val).trim();
    }
  }
  return '';
}

function parseStaffRoleInput(rawRole: string, rawDept: string): StaffRole {
  const combined = `${rawRole} ${rawDept}`.toLowerCase();
  if (combined.includes('director') || combined.includes('giám đốc') || combined.includes('giam doc') || combined.includes('lãnh đạo')) {
    return 'director';
  }
  if (combined.includes('css') || combined.includes('chăm sóc') || combined.includes('cham soc') || combined.includes('điều phối')) {
    return 'css';
  }
  if (combined.includes('warehouse') || combined.includes('kho')) {
    return 'warehouse';
  }
  if (combined.includes('sales') || combined.includes('kinh doanh') || combined.includes('bán hàng')) {
    return 'sales';
  }
  return 'field_engineer';
}

function parseStaffStatusInput(rawStatus: string): 'available' | 'on_site' | 'off_duty' {
  const lower = rawStatus.toLowerCase();
  if (lower.includes('on_site') || lower.includes('tại viện') || lower.includes('đang xử lý') || lower.includes('đi tuyến')) {
    return 'on_site';
  }
  if (lower.includes('off_duty') || lower.includes('nghỉ') || lower.includes('tạm nghỉ')) {
    return 'off_duty';
  }
  return 'available';
}

export function mapRowsToStaff(
  rows: any[],
  existingEngineers: EngineerProfile[]
): { validItems: StaffImportPreviewItem[]; skippedRows: number } {
  const validItems: StaffImportPreviewItem[] = [];
  let skippedRows = 0;
  const nowSeed = Date.now();

  rows.forEach((rawRow, idx) => {
    if (!rawRow || typeof rawRow !== 'object') {
      skippedRows += 1;
      return;
    }

    const name = pickRowValue(rawRow, [
      'Họ và Tên',
      'Họ Và Tên',
      'Họ tên',
      'Tên nhân sự',
      'Tên Nhân Sự',
      'Name',
      'name',
      'Họ tên nhân sự'
    ]);
    const phone = pickRowValue(rawRow, [
      'Số Điện Thoại',
      'SĐT',
      'SDT',
      'Điện thoại',
      'Phone',
      'phone'
    ]);

    if (!name || !phone) {
      skippedRows += 1;
      return;
    }

    const rawId = pickRowValue(rawRow, ['Mã Nhân Sự', 'Mã Kỹ Sư', 'Mã NV', 'Mã', 'ID', 'id']);
    const rawRole = pickRowValue(rawRow, ['Chức Vụ / Vai Trò', 'Vai Trò', 'Vai trò', 'Chức vụ', 'Role', 'role']);
    const rawDept = pickRowValue(rawRow, ['Phòng Ban', 'Phòng ban', 'Bộ phận', 'Department', 'department']);
    const email = pickRowValue(rawRow, ['Email Liên Hệ', 'Email', 'email']);
    const username = pickRowValue(rawRow, ['Tên Đăng Nhập', 'Username', 'username']);
    const area = pickRowValue(rawRow, ['Khu Vực Phụ Trách', 'Khu Vực', 'Khu vực', 'Area', 'area']) || 'Toàn quốc';
    const rawStatus = pickRowValue(rawRow, ['Trạng Thái Trực', 'Trạng Thái', 'Trạng thái', 'Status', 'status']);
    const rawPassword = pickRowValue(rawRow, ['Mật Khẩu', 'Mật khẩu', 'Password', 'password']);

    const role = parseStaffRoleInput(rawRole, rawDept);
    const department = rawDept.trim() || normalizeDepartmentForRole(role);
    const status = parseStaffStatusInput(rawStatus);
    const normalizedPhone = phone.replace(/\s+/g, '');

    const existingMatch = existingEngineers.find(eng => {
      if (rawId && eng.id.toLowerCase() === rawId.toLowerCase()) return true;
      if (email && eng.email && eng.email.toLowerCase() === email.toLowerCase()) return true;
      if (normalizedPhone && eng.phone.replace(/\s+/g, '') === normalizedPhone) return true;
      return false;
    });

    const profile: EngineerProfile = {
      id: existingMatch?.id || rawId || `ENG-IMP-${String(nowSeed).slice(-4)}-${idx + 1}`,
      name,
      role,
      department,
      phone,
      email: email || existingMatch?.email || '',
      username: username || existingMatch?.username || (email ? email.split('@')[0] : undefined),
      password: rawPassword || existingMatch?.password?.trim() || DEFAULT_ACCOUNT_PASSWORD,
      status,
      activeTicketsCount: existingMatch?.activeTicketsCount ?? 0,
      area,
      specialties: existingMatch?.specialties || (role === 'field_engineer' ? ['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'] : []),
      allowedTabs: existingMatch?.allowedTabs && existingMatch.allowedTabs.length > 0
        ? existingMatch.allowedTabs
        : getDefaultTabsForRole(role)
    };

    validItems.push({
      profile,
      action: existingMatch ? 'update' : 'create',
      matchedId: existingMatch?.id
    });
  });

  return { validItems, skippedRows };
}


