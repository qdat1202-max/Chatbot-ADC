import React, { useState } from 'react';
import {
  X,
  BookOpen,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  Edit,
  Layers,
  MapPin,
  Clock,
  Printer,
  FileText,
  BadgeCheck,
  Plus,
  Eye,
  Download
} from 'lucide-react';
import { SOPArticle } from '../types';
import { PdfViewerModal } from './PdfViewerModal';
import { downloadPdfAttachment, formatFileSize } from '../utils/pdfStorage';

interface SOPDetailModalProps {
  sop: SOPArticle | null;
  onClose: () => void;
  onEdit?: (sop: SOPArticle) => void;
  onEditErrorCode?: (sop: SOPArticle) => void;
}

export const SOPDetailModal: React.FC<SOPDetailModalProps> = ({
  sop,
  onClose,
  onEdit,
  onEditErrorCode
}) => {
  const [copied, setCopied] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [viewingPdf, setViewingPdf] = useState(false);
  const [pdfNotice, setPdfNotice] = useState<string | null>(null);

  if (!sop) return null;

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleCopy = () => {
    const text = `[SOP ADC] Thiết bị: ${sop.equipmentModel}\nMã lỗi: ${sop.errorCode} - ${sop.title}\nPhân loại: ${sop.category}\nHiện tượng: ${sop.symptom}\nNguyên nhân: ${sop.rootCause}\nQuy trình xử lý:\n${sop.resolutionSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\nLưu ý an toàn: ${sop.safetyWarnings.join('; ')}\nVị trí linh kiện: ${sop.componentLocation || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {sop.errorCode && sop.errorCode.trim() !== '' ? (
                  <button
                    type="button"
                    onClick={() => onEditErrorCode && onEditErrorCode(sop)}
                    className="px-2.5 py-0.5 bg-emerald-500/30 border border-emerald-400/50 hover:bg-emerald-500/50 text-emerald-100 font-mono font-bold text-xs rounded-md shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                    title={onEditErrorCode ? "Bấm để điều chỉnh mã lỗi theo danh mục hãng" : undefined}
                  >
                    <span>MÃ LỖI: {sop.errorCode}</span>
                    {onEditErrorCode && <Edit className="w-2.5 h-2.5 opacity-70" />}
                  </button>
                ) : (
                  onEditErrorCode && (
                    <button
                      type="button"
                      onClick={() => onEditErrorCode(sop)}
                      className="px-2.5 py-0.5 bg-white/10 hover:bg-white/20 text-emerald-200 text-xs rounded-md border border-dashed border-emerald-300/40 cursor-pointer flex items-center gap-1 transition-colors"
                      title="Quy trình chưa có mã lỗi. Quản trị viên bấm để gán mã lỗi chuẩn chính hãng nếu có"
                    >
                      <span>(Không có mã lỗi)</span>
                      <Plus className="w-3 h-3" />
                    </button>
                  )
                )}
                <span className="px-2.5 py-0.5 bg-white/15 text-emerald-100 text-xs rounded-md font-medium">
                  {sop.equipmentModel}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-400/20 text-emerald-200 text-[11px] rounded-md">
                  {sop.category}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                {sop.title}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700">
          
          {/* Action Toolbar */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-900">Chi tiết quy trình kỹ thuật chuẩn (SOP)</span>
              <span className="text-slate-400">·</span>
              <span className="text-[11px] text-slate-500 font-mono">Cập nhật: {sop.updatedAt}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 shadow-2xs cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>

              {onEditErrorCode && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditErrorCode(sop);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 hover:bg-amber-100 shadow-2xs cursor-pointer transition-colors"
                  title="Quản trị viên tự điều chỉnh mã lỗi theo tài liệu hãng"
                >
                  <BadgeCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sửa Mã Lỗi</span>
                </button>
              )}

              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(sop);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 shadow-2xs cursor-pointer transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Sửa SOP</span>
                </button>
              )}
            </div>
          </div>

          {/* Attached PDF File (Full Viewer & Download) */}
          {sop.pdfAttachment ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-950 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-rose-950">Tài liệu PDF đính kèm:</span>
                    <span className="font-mono text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded font-bold truncate max-w-[260px]">
                      {sop.pdfAttachment.fileName}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Dung lượng: <strong>{formatFileSize(sop.pdfAttachment.fileSize)}</strong> · Đính kèm ngày: {sop.pdfAttachment.uploadedAt}
                  </p>
                  {pdfNotice && (
                    <p className="text-[11px] text-amber-800 font-semibold mt-1">{pdfNotice}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setPdfNotice(null);
                    setViewingPdf(true);
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem PDF</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await downloadPdfAttachment(sop.pdfAttachment!);
                    if (!ok) {
                      setPdfNotice('Không tìm thấy file PDF cục bộ trên trình duyệt này. Vui lòng đính kèm lại.');
                    }
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải PDF</span>
                </button>
              </div>
            </div>
          ) : sop.sourceFile ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-950 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-950">Quy trình chi tiết theo file tải lên:</span>
                    <span className="font-mono text-rose-800 bg-rose-100/70 px-2 py-0.5 rounded font-bold">{sop.sourceFile}</span>
                  </div>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Các bước bên dưới được giải mã chi tiết từ tài liệu kỹ thuật y sinh gốc
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold bg-white px-2.5 py-1 rounded-lg border border-rose-200 text-rose-800 shadow-2xs shrink-0">
                {sop.resolutionSteps.length} bước xử lý
              </span>
            </div>
          ) : null}

          {/* Diagnostic: Symptoms & Root Cause */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Hiện tượng & Dấu hiệu nhận biết:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed pl-5 whitespace-pre-line">
                {sop.symptom}
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Nguyên nhân kỹ thuật gốc rễ:</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed pl-5 whitespace-pre-line">
                {sop.rootCause}
              </p>
            </div>
          </div>

          {/* Component Location */}
          {sop.componentLocation && (
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <strong className="mr-1.5">Vị trí cơ cấu / linh kiện trên máy:</strong>
                <span>{sop.componentLocation}</span>
              </div>
            </div>
          )}

          {/* Full Resolution Steps */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Toàn bộ quy trình khắc phục từng bước ({sop.resolutionSteps.length} bước):</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                (Nhấn tick để theo dõi các bước đã thực hiện)
              </span>
            </div>

            <div className="space-y-2">
              {sop.resolutionSteps.map((step, idx) => {
                const isChecked = !!completedSteps[idx];
                const cleanStep = step.replace(/^Bước \d+:\s*/, '');
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-300 text-slate-700'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked 
                          ? 'bg-emerald-600 text-white' 
                          : 'border border-slate-300 bg-white hover:border-emerald-500'
                      }`}
                    >
                      {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="text-[10px] text-slate-400 font-bold">{idx + 1}</span>}
                    </button>
                    <div className="flex-1 text-xs leading-relaxed">
                      <span className="font-bold text-slate-900 mr-1.5">Bước {idx + 1}:</span>
                      <span className={isChecked ? 'line-through text-slate-500' : 'text-slate-800'}>
                        {cleanStep}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Safety Warnings */}
          {sop.safetyWarnings.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-950 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>Cảnh báo an toàn tuyệt đối cho Kỹ sư & KTV:</span>
              </div>
              <ul className="space-y-1 pl-5 list-disc text-red-800 text-xs leading-relaxed">
                {sop.safetyWarnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Kho tri thức kỹ thuật ADC Medical Tech 24/7</span>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(sop);
                }}
                className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-colors cursor-pointer"
              >
                Chỉnh sửa SOP
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>

      <PdfViewerModal
        attachment={viewingPdf ? sop.pdfAttachment || null : null}
        sopTitle={sop.title}
        onClose={() => setViewingPdf(false)}
      />
    </div>
  );
};
