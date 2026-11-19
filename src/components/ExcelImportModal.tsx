import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  RefreshCw,
  Building,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { SupportTicket } from '../types';
import { parseExcelFile, mapRowsToTickets, downloadTicketExcelTemplate } from '../utils/excel';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTickets: (tickets: Omit<SupportTicket, 'id' | 'ticketCode' | 'createdAt' | 'status' | 'source'>[]) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportTickets
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedTickets, setParsedTickets] = useState<Omit<SupportTicket, 'id' | 'ticketCode' | 'createdAt' | 'status' | 'source'>[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setParseError(null);
    setIsSuccess(false);

    try {
      const rawRows = await parseExcelFile(file);
      if (!rawRows || rawRows.length === 0) {
        setParseError('File Excel không có dữ liệu hoặc không đúng định dạng bảng tính.');
        setParsedTickets([]);
      } else {
        const tickets = mapRowsToTickets(rawRows);
        if (tickets.length === 0) {
          setParseError('Không tìm thấy dòng dữ liệu phiếu hợp lệ. Vui lòng tải file mẫu để kiểm tra tiêu đề các cột.');
        } else {
          setParsedTickets(tickets);
        }
      }
    } catch (err: any) {
      setParseError(`Lỗi khi đọc file Excel: ${err?.message || 'Định dạng không hợp lệ'}`);
      setParsedTickets([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedTickets.length === 0) return;
    onImportTickets(parsedTickets);
    setImportedCount(parsedTickets.length);
    setIsSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setParsedTickets([]);
    setParseError(null);
    setIsSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Thêm Nhanh Phiếu Sự Cố Bằng File Excel</h3>
              <p className="text-[11px] text-emerald-200/80">Nhập hàng loạt yêu cầu hỗ trợ kỹ thuật từ bảng tính (.xlsx, .xls, .csv)</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 min-h-0 overflow-y-auto space-y-4 text-xs">
          {/* Success Banner */}
          {isSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Đã thêm thành công {importedCount} phiếu vào hệ thống!</p>
                <p className="text-[11px] text-emerald-700">Các phiếu mới đã xuất hiện trong Bảng Điều Phối với mã định danh tự động.</p>
              </div>
            </div>
          )}

          {/* Top Info & Template Download */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Mẫu file chuẩn bị nhập liệu
              </span>
              <p className="text-slate-500 text-[11px]">
                Nếu chưa có file, bạn hãy tải file mẫu chuẩn gồm sẵn các cột: Bệnh viện, Model máy, SĐT, Mã lỗi, Mô tả sự cố.
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadTicketExcelTemplate()}
              className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-emerald-300 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải File Mẫu Excel (.xlsx)</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              id="ticket-excel-file-input"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="ticket-excel-file-input"
              className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-emerald-500 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 text-xs">
                {selectedFile ? selectedFile.name : 'Nhấp để chọn file Excel hoặc CSV từ máy tính'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {selectedFile 
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB · Nhấp để đổi file khác`
                  : 'Hỗ trợ định dạng .xlsx, .xls, .csv (tự động nhận diện cột tiếng Việt)'}
              </span>
            </label>
          </div>

          {/* Parsing State */}
          {isParsing && (
            <div className="flex items-center justify-center gap-2 py-4 text-slate-600">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Đang đọc và phân tích cấu trúc bảng tính Excel...</span>
            </div>
          )}

          {/* Error Banner */}
          {parseError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="text-[11px]">
                <p className="font-bold">Không thể xử lý file:</p>
                <p>{parseError}</p>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedTickets.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Xem trước dữ liệu ({parsedTickets.length} phiếu hợp lệ)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Trạng thái mặc định: <span className="font-bold text-amber-700">Chờ nhận</span>
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 w-8">#</th>
                      <th className="py-2 px-3">Bệnh Viện / Đơn Vị</th>
                      <th className="py-2 px-3">Dòng Máy</th>
                      <th className="py-2 px-3">Mã Lỗi</th>
                      <th className="py-2 px-3">Ưu Tiên</th>
                      <th className="py-2 px-3">Hiện Tượng / Sự Cố</th>
                      <th className="py-2 px-3">Liên Hệ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {parsedTickets.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800 max-w-[150px] truncate" title={t.hospitalClinic}>
                          {t.hospitalClinic}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-700 whitespace-nowrap">
                          {t.equipmentModel}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-700 whitespace-nowrap">
                          {t.errorCode || '-'}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.priority === 'urgent'
                              ? 'bg-red-100 text-red-700'
                              : t.priority === 'normal'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {t.priority === 'urgent' ? 'Khẩn' : t.priority === 'normal' ? 'Thường' : 'Lịch'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 max-w-[200px] truncate" title={t.issueDescription}>
                          {t.issueDescription}
                        </td>
                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                          {t.contactPerson} ({t.phone})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 cursor-pointer transition-colors"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {parsedTickets.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setParsedTickets([]);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-3 py-2 text-slate-600 hover:bg-slate-200/60 rounded-lg font-medium cursor-pointer transition-colors"
              >
                Chọn Lại File
              </button>
            )}

            <button
              type="button"
              disabled={parsedTickets.length === 0 || isSuccess}
              onClick={handleConfirmImport}
              className={`px-5 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs transition-all ${
                parsedTickets.length === 0 || isSuccess
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác Nhận Thêm {parsedTickets.length > 0 ? `${parsedTickets.length} Phiếu` : ''} Vào Hệ Thống</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
