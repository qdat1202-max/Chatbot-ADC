import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  Upload, 
  ArrowRight, 
  BookOpen, 
  RefreshCw, 
  Check, 
  Wrench,
  ShieldCheck,
  ChevronRight,
  Layers,
  FileText,
  Edit2,
  Paperclip
} from 'lucide-react';
import { MaintenanceRecord, SOPArticle, EquipmentModel, SOPPdfAttachment } from '../types';
import { analyzeRecordsToSOPs } from '../utils/excel';
import { parseAnyDocument } from '../utils/documentParser';
import { savePdfAttachment, fileToBase64, formatFileSize } from '../utils/pdfStorage';
import { INITIAL_MAINTENANCE_RECORDS } from '../data/initialData';
import { getOfficialCodesForModel } from '../data/officialErrorCodes';

interface AutoAnalyzeSOPModalProps {
  records: MaintenanceRecord[];
  initialRecord?: MaintenanceRecord | null;
  defaultMode?: 'records' | 'upload' | 'paste';
  onClose: () => void;
  onAddSOPs: (sops: SOPArticle[]) => void;
  onNavigateToSOPTab?: () => void;
}

export const AutoAnalyzeSOPModal: React.FC<AutoAnalyzeSOPModalProps> = ({
  records,
  initialRecord,
  defaultMode,
  onClose,
  onAddSOPs,
  onNavigateToSOPTab
}) => {
  const [sourceMode, setSourceMode] = useState<'records' | 'upload' | 'paste'>(
    defaultMode || (initialRecord ? 'records' : 'records')
  );
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>(
    initialRecord ? [initialRecord.id] : records.map(r => r.id)
  );
  const [pastedText, setPastedText] = useState('');
  const [uploadedRecords, setUploadedRecords] = useState<any[]>([]);
  const [uploadedRawText, setUploadedRawText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileType, setUploadedFileType] = useState<'excel' | 'doc' | 'text' | 'pdf' | null>(null);
  const [uploadedSummary, setUploadedSummary] = useState('');
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);
  const [uploadedPdfAttachment, setUploadedPdfAttachment] = useState<SOPPdfAttachment | null>(null);
  const [pdfDirectModel, setPdfDirectModel] = useState<EquipmentModel>('Zybio EXC200/220');
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analyzedSOPs, setAnalyzedSOPs] = useState<SOPArticle[]>([]);
  const [selectedSOPIds, setSelectedSOPIds] = useState<Set<string>>(new Set());
  const [analysisSource, setAnalysisSource] = useState<string>('');
  const [isDone, setIsDone] = useState(false);
  const [editingErrorCodeSOPId, setEditingErrorCodeSOPId] = useState<string | null>(null);

  const handleUpdateSOPErrorCode = (sopId: string, newCode: string) => {
    setAnalyzedSOPs(prev => prev.map(s => s.id === sopId ? { ...s, errorCode: newCode.trim().toUpperCase() } : s));
  };

  // Toggle selection of records to analyze
  const toggleRecordSelection = (id: string) => {
    setSelectedRecordIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllRecords = () => {
    setSelectedRecordIds(records.map(r => r.id));
  };

  const deselectAllRecords = () => {
    setSelectedRecordIds([]);
  };

  // Handle PDF, Excel, Word (.docx, .doc), and text file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      setUploadedFileName(file.name);
      const res = await parseAnyDocument(file);
      setUploadedFileType(res.fileType);
      setUploadedSummary(res.summary);

      if (res.fileType === 'pdf') {
        const attachment = await savePdfAttachment(file);
        setUploadedPdfFile(file);
        setUploadedPdfAttachment(attachment);
        setUploadedRecords([]);
        setUploadedRawText(res.rawText || '');
        return;
      }

      setUploadedPdfFile(null);
      setUploadedPdfAttachment(null);

      if (res.records && res.records.length > 0) {
        // Map raw rows into records format
        const formatted = res.records.map((row: any, idx: number) => ({
          id: `UPLOAD-${idx}`,
          code: row['Mã Biên Bản'] || row['Mã BB'] || row['Code'] || `2026-XLKT-UP${idx + 1}`,
          date: row['Ngày Xử Lý'] || row['Ngày'] || new Date().toISOString().split('T')[0],
          hospital: row['Khách Hàng / Bệnh Viện'] || row['Bệnh viện'] || row['Hospital'] || 'Bệnh viện / Phòng khám',
          equipmentModel: (row['Model Thiết Bị'] || row['Model'] || row['Thiết Bị'] || 'Zybio EXC200/220') as EquipmentModel,
          serialNumber: row['Số Serial Máy'] || row['Serial'] || '',
          faultFound: row['Lỗi Phát Hiện'] || row['Hiện tượng'] || row['Lỗi'] || row['Nội dung'] || JSON.stringify(row),
          solutionProvided: row['Phương Án Xử Lý'] || row['Giải pháp'] || row['Xử lý'] || 'Kiểm tra bảo dưỡng',
          engineerName: row['Kỹ Sư'] || row['Kỹ sư thực hiện'] || 'Nguyễn Quang Đạt',
          replacedParts: row['Linh Kiện Thay Thế'] || row['Linh kiện'] || '',
          status: 'Đã nghiệm thu' as const,
          notes: row['Ghi Chú'] || ''
        }));
        setUploadedRecords(formatted);
      } else {
        setUploadedRecords([]);
      }

      if (res.rawText) {
        setUploadedRawText(res.rawText);
      } else {
        setUploadedRawText('');
      }
    } catch (err: any) {
      setUploadError(`Lỗi đọc file: ${err.message}`);
    }
  };

  // Direct 1-click PDF attachment to Kho SOP (no AI parsing required)
  const handleDirectAttachPdfToSOP = () => {
    if (!uploadedPdfAttachment) {
      setUploadError('Vui lòng chọn tệp PDF trước.');
      return;
    }

    const baseTitle = uploadedPdfAttachment.fileName.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
    const newSop: SOPArticle = {
      id: `SOP-PDF-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      equipmentModel: pdfDirectModel,
      category: 'Cơ khí & Kim hút',
      errorCode: '',
      title: `Tài liệu kỹ thuật PDF: ${baseTitle || uploadedPdfAttachment.fileName}`,
      symptom: `Tra cứu hướng dẫn chuẩn theo tài liệu PDF gốc "${uploadedPdfAttachment.fileName}".`,
      rootCause: 'Tham chiếu trực tiếp hướng dẫn vận hành / Service Manual đính kèm.',
      resolutionSteps: [
        `Bước 1: Mở tệp PDF đính kèm "${uploadedPdfAttachment.fileName}" (${formatFileSize(uploadedPdfAttachment.fileSize)}) trong mục Xem PDF.`,
        'Bước 2: Đối chiếu mã lỗi, sơ đồ cơ cấu và thông số chuẩn của nhà sản xuất.',
        'Bước 3: Thực hiện kiểm tra an toàn sinh học và chạy mẫu QC sau xử lý.'
      ],
      safetyWarnings: [
        'Bắt buộc đeo găng tay y tế và tắt nguồn thiết bị trước khi tháo lắp phần cứng.'
      ],
      sourceFile: uploadedPdfAttachment.fileName,
      pdfAttachment: uploadedPdfAttachment,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onAddSOPs([newSop]);
    setSelectedSOPIds(new Set([newSop.id]));
    setIsDone(true);
  };

  // Perform AI analysis
  const handleStartAnalysis = async () => {
    setUploadError(null);
    setIsAnalyzing(true);
    setAnalysisStep('Đang trích xuất dữ liệu sự cố và lịch sử sửa chữa...');

    try {
      if (sourceMode === 'upload' && uploadedFileType === 'pdf') {
        if (!uploadedPdfAttachment || !uploadedPdfFile) {
          setUploadError('Vui lòng tải lên tệp PDF (.pdf) trước.');
          setIsAnalyzing(false);
          return;
        }

        setAnalysisStep('Đang đọc tài liệu PDF bằng Gemini AI & liên kết file PDF gốc vào SOP...');
        let pdfBase64 = '';
        if (uploadedPdfFile.size <= 15 * 1024 * 1024) {
          pdfBase64 = await fileToBase64(uploadedPdfFile);
        }

        let apiSops: SOPArticle[] = [];
        let source = 'pdf-fallback';
        try {
          const response = await fetch('/api/analyze-pdf-sop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: uploadedPdfAttachment.fileName,
              pdfBase64,
              fallbackText: uploadedRawText
            })
          });
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data.sops) && data.sops.length > 0) {
              apiSops = data.sops;
              source = data.source || 'gemini';
            }
          }
        } catch (fetchErr) {
          console.warn('PDF AI analysis fallback triggered:', fetchErr);
        }

        const uniqueSOPs: SOPArticle[] = (apiSops.length > 0
          ? apiSops
          : [
              {
                id: '',
                equipmentModel: pdfDirectModel,
                category: 'Cơ khí & Kim hút' as const,
                errorCode: '',
                title: `Quy trình theo tài liệu PDF: ${uploadedPdfAttachment.fileName.replace(/\.pdf$/i, '')}`,
                symptom: `Hướng dẫn xử lý và bảo trì từ tài liệu PDF "${uploadedPdfAttachment.fileName}".`,
                rootCause: 'Tham khảo thông số chuẩn và quy trình tháo lắp trong tài liệu PDF đính kèm.',
                resolutionSteps: [
                  `Bước 1: Xem tài liệu PDF đính kèm "${uploadedPdfAttachment.fileName}".`,
                  'Bước 2: Kiểm tra lỗi và vệ sinh cụm cơ cấu liên quan.',
                  'Bước 3: Chạy mẫu trắng/IQC kiểm tra độ ổn định.'
                ],
                safetyWarnings: ['Tuân thủ quy định an toàn sinh học y tế và ngắt nguồn trước khi thao tác.'],
                updatedAt: new Date().toISOString().split('T')[0]
              }
            ]
        ).map((s, idx) => ({
          ...s,
          id: `SOP-PDF-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}-${idx}`,
          sourceFile: uploadedPdfAttachment.fileName,
          pdfAttachment: uploadedPdfAttachment,
          updatedAt: s.updatedAt || new Date().toISOString().split('T')[0]
        }));

        setAnalyzedSOPs(uniqueSOPs);
        setAnalysisSource(source);
        setSelectedSOPIds(new Set(uniqueSOPs.map(s => s.id)));
        setAnalysisStep('');
        return;
      }

      let targetRecords: any[] = [];
      let rawText = '';

      if (sourceMode === 'records') {
        targetRecords = records.filter(r => selectedRecordIds.includes(r.id));
        if (targetRecords.length === 0) {
          setUploadError('Vui lòng chọn ít nhất 1 biên bản kỹ thuật để phân tích.');
          setIsAnalyzing(false);
          return;
        }
      } else if (sourceMode === 'upload') {
        if (uploadedRecords.length === 0 && !uploadedRawText.trim()) {
          setUploadError('Vui lòng tải lên file PDF, Excel hoặc Word/Doc (.pdf, .xlsx, .docx, .doc, .txt) trước.');
          setIsAnalyzing(false);
          return;
        }
        targetRecords = uploadedRecords;
        rawText = uploadedRawText;
      } else {
        if (!pastedText.trim()) {
          setUploadError('Vui lòng dán nội dung nhật ký kỹ thuật để phân tích.');
          setIsAnalyzing(false);
          return;
        }
        rawText = pastedText;
      }

      setAnalysisStep('Mô hình Gemini AI đang chuẩn hóa mã lỗi chuẩn, nguyên nhân gốc rễ và quy trình từng bước...');
      
      const result = await analyzeRecordsToSOPs(targetRecords, rawText, uploadedFileName);
      
      const uniqueSOPs = result.sops.map((s, idx) => ({
        ...s,
        id: `SOP-AI-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}-${idx}`
      }));

      setAnalyzedSOPs(uniqueSOPs);
      setAnalysisSource(result.source);
      // Select all by default
      setSelectedSOPIds(new Set(uniqueSOPs.map(s => s.id)));
      setAnalysisStep('');
    } catch (err: any) {
      setUploadError(`Lỗi phân tích: ${err.message || 'Không thể phân tích dữ liệu'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add selected SOPs to knowledge base
  const handleCommitSOPs = () => {
    const sopsToAdd = analyzedSOPs.filter(s => selectedSOPIds.has(s.id));
    if (sopsToAdd.length === 0) {
      alert('Vui lòng chọn ít nhất 1 quy trình SOP để thêm vào kho tri thức.');
      return;
    }

    onAddSOPs(sopsToAdd);
    setIsDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  Tự Động Phân Tích & Thêm Vào Kho Tri Thức SOP
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono px-2 py-0.5 rounded-full font-semibold">
                  AI ADC 24/7
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Chuyển hóa dữ liệu thực chiến (Sổ tay 2026-XLKT của KS. Nguyễn Quang Đạt) thành quy trình thao tác chuẩn y tế
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isDone ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Đã thêm thành công {selectedSOPIds.size} quy trình SOP vào Kho Tri Thức!
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Toàn bộ quy trình đã được chuẩn hóa với mã lỗi, hiện tượng, các bước xử lý và cảnh báo an toàn sinh học. Trợ lý AI và đội ngũ kỹ thuật có thể tra cứu ngay lập tức.
              </p>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Đóng cửa sổ
                </button>
                {onNavigateToSOPTab && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToSOPTab();
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Xem Kho Tri Thức SOP Ngay</span>
                  </button>
                )}
              </div>
            </div>
          ) : analyzedSOPs.length === 0 ? (
            <>
              {/* Source Selector Tabs */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSourceMode('records')}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    sourceMode === 'records'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Sổ Tay 2026-XLKT Hiện Có ({records.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('upload')}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    sourceMode === 'upload'
                      ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tải lên tài liệu PDF (.pdf), Excel (.xlsx, .xls) hoặc Word / Nhật ký (.docx, .doc, .txt)"
                >
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4 text-rose-600" />
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span>Nạp File PDF / Tài Liệu</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 font-bold">
                    .pdf / .xlsx
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('paste')}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    sourceMode === 'paste'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wrench className="w-4 h-4 text-purple-600" />
                  <span>Dán Văn Bản Nhật Ký</span>
                </button>
              </div>

              {/* Source 1: Current 2026-XLKT Records */}
              {sourceMode === 'records' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      Đã chọn <strong>{selectedRecordIds.length}</strong> / {records.length} biên bản kỹ thuật:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllRecords}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline"
                      >
                        Chọn tất cả
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={deselectAllRecords}
                        className="text-slate-500 hover:text-slate-800 cursor-pointer underline"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/50">
                    {records.map(rec => {
                      const isSelected = selectedRecordIds.includes(rec.id);
                      return (
                        <div
                          key={rec.id}
                          onClick={() => toggleRecordSelection(rec.id)}
                          className={`p-3 text-xs flex items-start gap-3 cursor-pointer transition-colors ${
                            isSelected ? 'bg-emerald-50/60' : 'hover:bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent div
                            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono font-bold text-slate-900">{rec.code}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                                {rec.equipmentModel}
                              </span>
                              <span className="text-[11px] text-slate-500 truncate">{rec.hospital}</span>
                              <span className="text-[10px] text-slate-400 ml-auto">{rec.date}</span>
                            </div>
                            <p className="text-slate-700 font-medium line-clamp-1">{rec.faultFound}</p>
                            <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                              <strong>Xử lý:</strong> {rec.solutionProvided}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Source 2: File Upload (Excel, Word/Doc) */}
              {sourceMode === 'upload' && (
                <div className="space-y-3">
                  {/* Preset quick-load banner for NEW-Nguyễn Quang Đạt.html */}
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50/90 border border-emerald-200/90 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-emerald-950 block">
                          Tệp có sẵn: NEW-Nguyễn Quang Đạt.html
                        </span>
                        <span className="text-[11px] text-emerald-800">
                          Sổ tay thực chiến 2026-XLKT ({INITIAL_MAINTENANCE_RECORDS.length} biên bản kỹ thuật tại bệnh viện/phòng khám)
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFileName('NEW-Nguyễn Quang Đạt.html');
                        setUploadedFileType('excel');
                        setUploadedSummary(`Sổ tay thực chiến 2026-XLKT của KS. Nguyễn Quang Đạt: Toàn bộ ${INITIAL_MAINTENANCE_RECORDS.length} biên bản xử lý kỹ thuật y tế chuẩn hóa tại các bệnh viện và phòng khám`);
                        setUploadedRecords(INITIAL_MAINTENANCE_RECORDS);
                        setUploadedRawText('');
                      }}
                      className="py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Nạp ngay {INITIAL_MAINTENANCE_RECORDS.length} ca vào phân tích</span>
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-5 text-center transition-colors bg-slate-50/40">
                    <input
                      type="file"
                      id="sop-modal-file"
                      accept=".pdf, application/pdf, .xlsx, .xls, .htm, .html, .csv, .docx, .doc, .txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="sop-modal-file"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/80 flex items-center justify-center shadow-2xs">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center shadow-2xs">
                          <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center shadow-2xs">
                          <Upload className="w-6 h-6" />
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {uploadedFileName ? uploadedFileName : 'Chọn hoặc thả file PDF (.pdf), Excel (.xlsx) hoặc Word (.docx)'}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
                          Đính kèm trực tiếp tài liệu PDF Service Manual vào Kho SOP hoặc để AI bóc tách quy trình từ file PDF, Excel, Word
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold border border-rose-200">
                          PDF: .pdf (Đính kèm gốc)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                          Excel: .xlsx, .xls, .htm
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                          Word: .docx, .doc, .txt
                        </span>
                      </div>
                    </label>
                  </div>

                  {uploadError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {uploadedFileName && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          {uploadedFileType === 'pdf' ? (
                            <FileText className="w-4 h-4 text-rose-600" />
                          ) : uploadedFileType === 'doc' ? (
                            <FileText className="w-4 h-4 text-blue-600" />
                          ) : (
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          )}
                          <span className="font-bold text-slate-800">{uploadedFileName}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            uploadedFileType === 'pdf'
                              ? 'bg-rose-100 text-rose-800'
                              : uploadedFileType === 'doc'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {uploadedFileType === 'pdf'
                              ? `Tài liệu PDF · ${uploadedPdfAttachment ? formatFileSize(uploadedPdfAttachment.fileSize) : ''}`
                              : uploadedFileType === 'doc'
                              ? 'Tài liệu Word'
                              : 'Bảng tính Excel'}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700">✓ Sẵn sàng lưu / phân tích</span>
                      </div>
                      
                      {uploadedSummary && (
                        <p className="text-[11px] text-slate-600 font-medium">
                          {uploadedSummary}
                        </p>
                      )}

                      {uploadedFileType === 'pdf' && uploadedPdfAttachment && (
                        <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl flex flex-wrap items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-rose-950">Model máy áp dụng:</span>
                            <select
                              value={pdfDirectModel}
                              onChange={(e) => setPdfDirectModel(e.target.value as EquipmentModel)}
                              className="px-2 py-1 text-[11px] border border-rose-200 rounded-lg bg-white font-semibold text-slate-800"
                            >
                              <option value="Zybio EXC200/220">Zybio EXC200/220</option>
                              <option value="Zybio Z3 CRP">Zybio Z3 CRP</option>
                              <option value="Zybio Z50">Zybio Z50</option>
                              <option value="FS-205">FS-205</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={handleDirectAttachPdfToSOP}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>Đính Kèm PDF Trực Tiếp Vào Kho SOP</span>
                          </button>
                        </div>
                      )}

                      {uploadedRawText && (
                        <div className="p-2 bg-white rounded-lg border border-slate-200/80 text-[11px] text-slate-600 max-h-24 overflow-y-auto font-sans whitespace-pre-line">
                          {uploadedRawText.slice(0, 300)}...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Source 3: Paste Text */}
              {sourceMode === 'paste' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Dán nội dung nhật ký kỹ thuật, bảng dữ liệu hoặc báo cáo sự cố:
                  </label>
                  <textarea
                    rows={6}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Ví dụ: Máy xét nghiệm Zybio EXC200 báo lỗi trạm rửa E205, nước dâng tràn đĩa phản ứng. Kỹ sư Nguyễn Quang Đạt tháo kim rửa thông tắc muối kết tủa bằng dây 0.15mm, ngâm dung dịch tẩy ADC-Cleanser và thay ống hút xả..."
                    className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                  <p className="text-[11px] text-slate-400">
                    AI sẽ tự động nhận diện thiết bị, phân loại cơ cấu, bóc tách triệu chứng, nguyên nhân và lập quy trình chuẩn.
                  </p>
                </div>
              )}

              {/* Action Start Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={handleStartAnalysis}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{analysisStep || 'Đang phân tích tự động...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Bắt Đầu Phân Tích & Chuyển Thành SOP Chuẩn</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Results Review Step */
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đã phân tích thành công {analyzedSOPs.length} quy trình SOP</span>
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Nguồn phân tích: {analysisSource === 'gemini' ? 'Gemini 3.8 Flash (Chuyên sâu y tế)' : 'Bộ trích xuất y sinh ADC'} · Hãy tích chọn các quy trình bạn muốn đưa vào kho tri thức.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedSOPIds(new Set(analyzedSOPs.map(s => s.id)))}
                    className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline text-[11px]"
                  >
                    Chọn tất cả ({analyzedSOPs.length})
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSOPIds(new Set())}
                    className="text-slate-500 hover:text-slate-700 cursor-pointer underline text-[11px]"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              {/* Analyzed SOP Cards List */}
              <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                {analyzedSOPs.map((sop, idx) => {
                  const isChecked = selectedSOPIds.has(sop.id);
                  return (
                    <div
                      key={`${sop.id}-${idx}`}
                      className={`p-4 rounded-xl border text-xs transition-all ${
                        isChecked 
                          ? 'bg-white border-emerald-500 shadow-xs' 
                          : 'bg-slate-50/70 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedSOPIds(prev => {
                                const next = new Set(prev);
                                if (next.has(sop.id)) next.delete(sop.id);
                                else next.add(sop.id);
                                return next;
                              });
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          {/* Error Code Editor - Admin freely adjusts, never fabricated */}
                          {editingErrorCodeSOPId === sop.id ? (
                            <div className="flex items-center gap-1.5 bg-amber-50 p-1 rounded-md border border-amber-300">
                              <select
                                value={sop.errorCode || ''}
                                onChange={(e) => handleUpdateSOPErrorCode(sop.id, e.target.value)}
                                className="text-xs font-mono font-bold px-1.5 py-0.5 rounded border border-slate-300 bg-white"
                              >
                                <option value="">(Không có mã lỗi)</option>
                                {getOfficialCodesForModel(sop.equipmentModel).map(c => (
                                  <option key={c.code} value={c.code}>
                                    {c.code} - {c.name.slice(0, 30)}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={sop.errorCode || ''}
                                onChange={(e) => handleUpdateSOPErrorCode(sop.id, e.target.value)}
                                placeholder="Tự nhập..."
                                className="text-xs font-mono uppercase px-1.5 py-0.5 rounded border border-slate-300 bg-white w-20"
                              />
                              <button
                                type="button"
                                onClick={() => setEditingErrorCodeSOPId(null)}
                                className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded cursor-pointer hover:bg-emerald-700"
                              >
                                Xong
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditingErrorCodeSOPId(sop.id)}
                              title="Bấm để điều chỉnh mã lỗi theo danh mục hãng (không tự bịa mã)"
                              className={`font-mono font-bold text-xs px-2 py-0.5 rounded border cursor-pointer transition-colors flex items-center gap-1 ${
                                sop.errorCode && sop.errorCode.trim() !== ''
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-dashed border-slate-300 hover:bg-slate-200 text-[10px]'
                              }`}
                            >
                              <span>{sop.errorCode && sop.errorCode.trim() !== '' ? sop.errorCode : 'Không mã lỗi'}</span>
                              <Edit2 className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          )}
                          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {sop.equipmentModel}
                          </span>
                          <span className="text-[10px] text-slate-500 border border-slate-200 px-1.5 py-0.2 rounded">
                            {sop.category}
                          </span>
                          {sop.sourceFile && (
                            <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                              📄 {sop.sourceFile}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                          {sop.resolutionSteps.length} bước xử lý chi tiết
                        </span>
                      </div>

                      <h5 className="font-bold text-slate-900 mb-1 leading-snug text-sm">
                        {sop.title}
                      </h5>

                      <p className="text-[11px] text-slate-600 mb-1">
                        <strong className="text-slate-700">Triệu chứng:</strong> {sop.symptom}
                      </p>

                      <p className="text-[11px] text-amber-900 bg-amber-50/60 p-2 rounded-lg border border-amber-200/50 mb-2.5">
                        <strong>Nguyên nhân kỹ thuật:</strong> {sop.rootCause}
                      </p>

                      {/* Chi tiết tất cả các bước theo file tải lên */}
                      <div className="space-y-1.5 mb-2.5 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                          <span>Toàn bộ quy trình {sop.resolutionSteps.length} bước theo file:</span>
                          <span className="text-emerald-700 font-medium lowercase font-sans">
                            {sop.sourceFile ? `trích xuất từ ${sop.sourceFile}` : 'chuẩn hóa AI'}
                          </span>
                        </div>
                        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                          {sop.resolutionSteps.map((st, sIdx) => {
                            const cleanStep = st.replace(/^Bước \d+:\s*/i, '');
                            return (
                              <div key={sIdx} className="text-[11px] text-slate-800 flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                                <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded shrink-0 border border-emerald-200 text-[10px]">
                                  Bước {sIdx + 1}
                                </span>
                                <span className="leading-relaxed font-medium">{cleanStep}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Safety Warnings preview */}
                      {sop.safetyWarnings && sop.safetyWarnings.length > 0 && (
                        <div className="text-[10px] text-red-900 bg-red-50/80 p-2 rounded-lg border border-red-200/60 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-bold">Lưu ý an toàn: </span>
                            <span>{sop.safetyWarnings.join(' • ')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAnalyzedSOPs([])}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  ← Phân tích lại
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleCommitSOPs}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Lưu {selectedSOPIds.size} Quy Trình Vào Kho SOP</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
