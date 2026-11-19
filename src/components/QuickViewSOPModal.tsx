import React, { useState } from 'react';
import {
  X,
  Wrench,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Layers,
  FileCheck,
  FileText,
  Eye,
  Download
} from 'lucide-react';
import { SOPArticle, EquipmentModel } from '../types';
import { PdfViewerModal } from './PdfViewerModal';
import { downloadPdfAttachment, formatFileSize } from '../utils/pdfStorage';

interface QuickViewSOPModalProps {
  sop: SOPArticle | null;
  onClose: () => void;
  onAskAI: (query: string) => void;
  onRequestSupport: (errorCode: string, issue: string) => void;
}

export const QuickViewSOPModal: React.FC<QuickViewSOPModalProps> = ({
  sop,
  onClose,
  onAskAI,
  onRequestSupport
}) => {
  const [copied, setCopied] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [viewingPdf, setViewingPdf] = useState(false);
  const [pdfNotice, setPdfNotice] = useState<string | null>(null);

  if (!sop) return null;

  const toggleStep = (index: number) => {
    setCheckedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleCopy = () => {
    const text = `[SOP ADC] Dòng máy: ${sop.equipmentModel}\nMã lỗi: ${sop.errorCode} - ${sop.title}\nHiện tượng: ${sop.symptom}\nNguyên nhân: ${sop.rootCause}\nQuy trình xử lý:\n${sop.resolutionSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\nLưu ý an toàn: ${sop.safetyWarnings.join('; ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allStepsCompleted = sop.resolutionSteps.length > 0 && 
    sop.resolutionSteps.every((_, idx) => !!checkedSteps[idx]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {sop.errorCode && sop.errorCode.trim() !== '' && (
                  <span className="px-2.5 py-0.5 bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 font-mono font-bold text-xs rounded-md shadow-xs">
                    MÃ LỖI: {sop.errorCode}
                  </span>
                )}
                <span className="px-2 py-0.5 bg-white/15 text-emerald-100 text-xs rounded-md font-medium">
                  {sop.equipmentModel}
                </span>
                <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-200 text-[11px] rounded-md">
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

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm text-slate-700">
          
          {/* Quick Notice Banner */}
          <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">Nội dung liên kết kỹ thuật & hướng dẫn xử lý chuẩn (SOP)</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 px-2 py-1 rounded bg-white border border-emerald-300 shadow-2xs cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép SOP'}</span>
            </button>
          </div>

          {/* Attached PDF File or Source File Badge */}
          {sop.pdfAttachment ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-950 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-rose-950">Tài liệu PDF đính kèm:</span>
                    <span className="font-mono text-rose-800 font-bold truncate max-w-[230px]">
                      {sop.pdfAttachment.fileName}
                    </span>
                  </div>
                  <p className="text-[10px] text-rose-700">
                    {formatFileSize(sop.pdfAttachment.fileSize)} · Tải lên: {sop.pdfAttachment.uploadedAt}
                  </p>
                  {pdfNotice && (
                    <p className="text-[10px] text-amber-800 font-semibold mt-0.5">{pdfNotice}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setPdfNotice(null);
                    setViewingPdf(true);
                  }}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem PDF</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await downloadPdfAttachment(sop.pdfAttachment!);
                    if (!ok) {
                      setPdfNotice('Không tìm thấy dữ liệu PDF cục bộ trên trình duyệt này.');
                    }
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải PDF</span>
                </button>
              </div>
            </div>
          ) : sop.sourceFile ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold text-rose-950">Quy trình theo file tải lên: </span>
                  <span className="font-mono text-rose-800 font-bold">{sop.sourceFile}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-rose-800 border border-rose-200">
                {sop.resolutionSteps.length} bước chi tiết
              </span>
            </div>
          ) : null}

          {/* Section: Symptoms & Root Cause */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Hiện tượng nhận biết:</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-5">
                {sop.symptom}
              </p>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Nguyên nhân kỹ thuật gốc rễ:</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed pl-5">
                {sop.rootCause}
              </p>
            </div>
          </div>

          {/* Location info if available */}
          {sop.componentLocation && (
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-2.5 text-xs text-blue-900 flex items-center gap-2">
              <span className="font-bold shrink-0">📍 Vị trí linh kiện:</span>
              <span>{sop.componentLocation}</span>
            </div>
          )}

          {/* Section: Step-by-step SOP resolution */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Quy trình từng bước khắc phục sự cố:</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                (Nhấn tick để theo dõi tiến trình)
              </span>
            </div>

            <div className="space-y-2">
              {sop.resolutionSteps.map((step, idx) => {
                const isChecked = !!checkedSteps[idx];
                const cleanStep = step.replace(/^Bước \d+:\s*/, '');
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50/60 border-emerald-300 text-slate-800'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
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

            {allStepsCompleted && (
              <div className="bg-emerald-100 border border-emerald-300 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-900 font-medium animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã thực hiện xong các bước SOP! Vui lòng chạy mẫu chuẩn (QC) kiểm tra lại.</span>
              </div>
            )}
          </div>

          {/* Section: Safety Warnings */}
          {sop.safetyWarnings.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-red-950">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>Cảnh báo an toàn bắt buộc cho KTV:</span>
              </div>
              <ul className="space-y-1 pl-5 list-disc text-red-800 text-[11px] leading-relaxed">
                {sop.safetyWarnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onAskAI(`Mã lỗi ${sop.errorCode}: ${sop.title}. Hãy hướng dẫn chi tiết cách xử lý và lưu ý an toàn.`);
              }}
              className="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Bot className="w-4 h-4 text-emerald-700" />
              <span>Hỏi Trợ lý AI 24/7</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onRequestSupport(sop.errorCode, `Hỗ trợ sự cố ${sop.errorCode} - ${sop.title}`);
              }}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow-md"
            >
              <Wrench className="w-4 h-4 text-white" />
              <span>Yêu cầu Kỹ sư ADC hỗ trợ</span>
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
