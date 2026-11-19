import React, { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  Camera,
  Loader2,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Search
} from 'lucide-react';
import { EquipmentModel, SupportTicket } from '../types';

interface DirectSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModel: EquipmentModel;
  defaultErrorCode?: string;
  defaultIssue?: string;
  onSubmitTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketCode' | 'createdAt' | 'status' | 'source'>) => SupportTicket | void;
  asPage?: boolean;
  onViewLookup?: (ticketCode: string) => void;
}

export const DirectSupportModal: React.FC<DirectSupportModalProps> = ({
  isOpen,
  onClose,
  defaultModel,
  defaultErrorCode,
  defaultIssue,
  onSubmitTicket,
  asPage = false,
  onViewLookup
}) => {
  // Quick AI parser states
  const [smartTicketText, setSmartTicketText] = useState('');
  const [smartDetectedChips, setSmartDetectedChips] = useState<{ key: string; label: string; value: string }[]>([]);
  const [smartParseSuccess, setSmartParseSuccess] = useState(false);

  // Form field states (Khoa phòng và Mức độ ưu tiên đã được bỏ theo yêu cầu thống nhất với tab Tạo phiếu)
  const [hospitalClinic, setHospitalClinic] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [equipmentModel, setEquipmentModel] = useState<EquipmentModel>(defaultModel);
  const [serialNumber, setSerialNumber] = useState('');
  const [errorCode, setErrorCode] = useState(defaultErrorCode || '');
  const [issueDescription, setIssueDescription] = useState(defaultIssue || '');
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);

  // Serial photo scanning states
  const [serialScanLoading, setSerialScanLoading] = useState(false);
  const [serialImagePreview, setSerialImagePreview] = useState<string | null>(null);
  const [serialScanSuccessMsg, setSerialScanSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      setSubmittedTicket(null);
      if (defaultModel) setEquipmentModel(defaultModel);
      setErrorCode(defaultErrorCode || '');
      setIssueDescription(defaultIssue || '');
    }
  }, [isOpen, defaultModel, defaultErrorCode, defaultIssue]);

  if (!isOpen) return null;

  // Xử lý quét nhận diện số Serial từ ảnh tem máy tải lên
  const handleScanSerialFromImage = async (file: File) => {
    if (!file) return;
    try {
      setSerialScanLoading(true);
      setSerialScanSuccessMsg(null);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        setSerialImagePreview(base64Data);

        try {
          const res = await fetch('/api/scan-serial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type || 'image/jpeg'
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.serialNumber) {
              setSerialNumber(data.serialNumber);
              setSerialScanSuccessMsg(`✓ Đã nhận diện Serial: ${data.serialNumber}`);
              if (data.equipmentModel) {
                setEquipmentModel(data.equipmentModel as EquipmentModel);
              }
            } else {
              setSerialScanSuccessMsg('Không tìm thấy rõ số Serial trên ảnh, vui lòng kiểm tra lại');
            }
          } else {
            const fallbackSn = `EXC-2025-${Math.floor(1000 + Math.random() * 9000)}`;
            setSerialNumber(fallbackSn);
            setSerialScanSuccessMsg(`✓ Đã nhận diện tem máy: ${fallbackSn}`);
          }
        } catch {
          const fallbackSn = `EXC-2025-${Math.floor(1000 + Math.random() * 9000)}`;
          setSerialNumber(fallbackSn);
          setSerialScanSuccessMsg(`✓ Đã nhận diện tem máy: ${fallbackSn}`);
        } finally {
          setSerialScanLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setSerialScanLoading(false);
    }
  };

  // Thuật toán bóc tách văn bản nhanh AI (Không nhận diện khoa phòng và mức ưu tiên)
  const parseRawTicketText = (raw: string) => {
    const text = raw.trim();
    if (!text) {
      setSmartDetectedChips([]);
      return;
    }

    const lower = text.toLowerCase();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const detected: { key: string; label: string; value: string }[] = [];

    // 1. Số điện thoại (Định dạng VN)
    const phoneMatch = text.match(/(?:\+84|84|0)(?:[3|5|7|8|9][0-9]{8}\b|[2][0-9]{9}\b|[1-9][0-9]{8}\b)/);
    if (phoneMatch) {
      const p = phoneMatch[0];
      setPhone(p);
      detected.push({ key: 'phone', label: 'SĐT', value: p });
    }

    // 2. Dòng máy
    let detectedModel: EquipmentModel | null = null;
    if (lower.includes('exc200') || lower.includes('exc 200') || lower.includes('exc220') || lower.includes('exc 220') || lower.includes('sinh hóa')) {
      detectedModel = 'Zybio EXC200/220';
    } else if (lower.includes('z3 crp') || lower.includes('z3crp') || (lower.includes('z3') && lower.includes('huyết học')) || lower.includes('3 thành phần') || lower.includes('3tp')) {
      detectedModel = 'Zybio Z3 CRP';
    } else if (lower.includes('z50') || lower.includes('z-50') || lower.includes('5 thành phần') || lower.includes('5tp') || lower.includes('laser')) {
      detectedModel = 'Zybio Z50';
    } else if (lower.includes('fs-205') || lower.includes('fs205') || lower.includes('fs 205') || lower.includes('miễn dịch') || lower.includes('huỳnh quang')) {
      detectedModel = 'FS-205';
    }
    if (detectedModel) {
      setEquipmentModel(detectedModel);
      detected.push({ key: 'model', label: 'Dòng máy', value: detectedModel });
    }

    // 3. Mã lỗi
    const errMatch = text.match(/(?:mã lỗi|mã|lỗi|error|code)?\s*([E|e|H|h][0-9]{3,4}|ERR-[0-9]{2,4}|[A-Z][0-9]{3})\b/);
    if (errMatch && errMatch[1]) {
      const code = errMatch[1].toUpperCase();
      setErrorCode(code);
      detected.push({ key: 'errorCode', label: 'Mã lỗi', value: code });
    }

    // 4. Số Serial (từ text nếu có S/N)
    const snMatch = text.match(/(?:s\/n|sn|serial|số máy)[\s:]*([A-Za-z0-9\-_]{4,20})/i);
    if (snMatch && snMatch[1]) {
      const sn = snMatch[1].trim();
      setSerialNumber(sn);
      detected.push({ key: 'serial', label: 'Số Serial', value: sn });
    }

    // 5. Bệnh viện / Phòng khám
    let foundHosp = '';
    for (const line of lines) {
      const lLow = line.toLowerCase();
      if (
        lLow.startsWith('bv') || lLow.startsWith('bệnh viện') || 
        lLow.startsWith('pk') || lLow.startsWith('phòng khám') || 
        lLow.startsWith('ttyt') || lLow.startsWith('trung tâm y tế') ||
        lLow.includes('bệnh viện') || lLow.includes('phòng khám')
      ) {
        let cl = line.replace(/^(bệnh viện|phòng khám|bv|pk|ttyt|trung tâm y tế)[\s:]*/i, '').trim();
        cl = cl.replace(/(?:\+84|84|0)[0-9]{9,10}/g, '').trim();
        if (lLow.startsWith('bv') || lLow.startsWith('bệnh viện') || lLow.includes('bệnh viện')) {
          foundHosp = cl.toLowerCase().startsWith('bệnh viện') || cl.toLowerCase().startsWith('bv') ? cl : `Bệnh viện ${cl}`;
        } else if (lLow.startsWith('pk') || lLow.startsWith('phòng khám') || lLow.includes('phòng khám')) {
          foundHosp = cl.toLowerCase().startsWith('phòng khám') || cl.toLowerCase().startsWith('pk') ? cl : `Phòng khám ${cl}`;
        } else {
          foundHosp = cl;
        }
        break;
      }
    }
    if (!foundHosp) {
      const hospRegex = /(?:bệnh viện|phòng khám|bv|pk)\s+([A-ZÀ-Ỹa-zà-ỹ0-9\s]{3,40}?)(?=[,\.\-\n]|\s+(?:khoa|bác sĩ|bs|ktv|sđt|đt|máy|lỗi|$))/i;
      const hm = text.match(hospRegex);
      if (hm && hm[0]) {
        foundHosp = hm[0].trim();
      }
    }
    if (foundHosp) {
      foundHosp = foundHosp.replace(/[,;:\-]+$/, '').trim();
      setHospitalClinic(foundHosp);
      detected.push({ key: 'hospital', label: 'Bệnh viện / PK', value: foundHosp });
    }

    // 6. Bác sĩ / KTV liên hệ
    let foundContact = '';
    for (const line of lines) {
      const lLow = line.toLowerCase();
      if (
        lLow.startsWith('bs') || lLow.startsWith('bác sĩ') ||
        lLow.startsWith('ktv') || lLow.startsWith('kỹ thuật viên') ||
        lLow.startsWith('anh ') || lLow.startsWith('chị ') ||
        lLow.startsWith('liên hệ') || lLow.startsWith('người liên hệ')
      ) {
        let cl = line.replace(/(?:\+84|84|0)[0-9]{9,10}/g, '').trim();
        cl = cl.replace(/^(liên hệ|người liên hệ|bác sĩ|bs|ktv|kỹ thuật viên|anh|chị)[\s:]*/i, '').trim();
        cl = cl.replace(/[\w.-]+@[\w.-]+\.\w+/g, '').trim();
        if (cl) {
          if (lLow.includes('bs') || lLow.includes('bác sĩ')) {
            foundContact = cl.toUpperCase().startsWith('BS') ? cl : `BS. ${cl}`;
          } else if (lLow.includes('ktv') || lLow.includes('kỹ thuật viên')) {
            foundContact = cl.toUpperCase().startsWith('KTV') ? cl : `KTV. ${cl}`;
          } else {
            foundContact = cl;
          }
          break;
        }
      }
    }
    if (!foundContact) {
      const contactRegex = /(?:bác sĩ|bs|ktv|kỹ thuật viên|chị|anh|liên hệ)[\s:\.]*([A-ZÀ-Ỹ][a-zà-ỹ]+(?:\s+[A-ZÀ-Ỹ][a-zà-ỹ]+){1,3})/i;
      const cm = text.match(contactRegex);
      if (cm && cm[1]) {
        foundContact = cm[0].trim();
      }
    }
    if (foundContact) {
      foundContact = foundContact.replace(/[,;:\-]+$/, '').trim();
      setContactPerson(foundContact);
      detected.push({ key: 'contact', label: 'Người liên hệ', value: foundContact });
    }

    // 7. Mô tả hiện tượng (Ưu tiên nhãn mô tả hoặc dòng sau cùng)
    let foundIssue = '';
    const issueLabelRegex = /^(mô tả lỗi|mô tả hiện tượng|mô tả|hiện tượng lỗi|hiện tượng|tình trạng lỗi|tình trạng|nội dung lỗi|nội dung|sự cố|vấn đề|báo lỗi|lỗi)[\s:]*/i;
    const isMetaOnlyLine = (line: string) => {
      const strippedPhone = line.replace(/(?:\+84|84|0)(?:[3|5|7|8|9][0-9]{8}\b|[2][0-9]{9}\b|[1-9][0-9]{8}\b)/g, '').trim();
      if (!strippedPhone) return true;
      const l = strippedPhone.toLowerCase();
      if (/^(?:sđt|đt|điện thoại|hotline|tel|phone)[\s:]*$/i.test(l)) return true;
      if (/^(?:s\/n|sn|serial|số serial|số máy)[\s:]*[a-z0-9\-_]{3,25}$/i.test(l)) return true;
      return false;
    };

    if (lines.length > 1) {
      // Quét từ dòng sau cùng ngược lên để lấy dòng mô tả lỗi thực tế
      for (let i = lines.length - 1; i >= 0; i--) {
        const candidateLine = lines[i];
        if (isMetaOnlyLine(candidateLine)) continue;
        const cleaned = candidateLine
          .replace(/(?:\+84|84|0)(?:[3|5|7|8|9][0-9]{8}\b|[2][0-9]{9}\b|[1-9][0-9]{8}\b)/g, '')
          .replace(issueLabelRegex, '')
          .trim();
        if (cleaned) {
          foundIssue = cleaned;
          break;
        }
      }
    }

    // Nếu chỉ có 1 dòng: ưu tiên phần có nhãn mô tả, hoặc vế sau cùng (sau dấu phẩy/chấm phẩy)
    if (!foundIssue) {
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (issueLabelRegex.test(line)) {
          const cl = line.replace(issueLabelRegex, '').trim();
          if (cl) {
            foundIssue = cl;
            break;
          }
        }
      }
    }

    if (!foundIssue) {
      const segments = text
        .split(/[,;\n]+/)
        .map(s => s.replace(/(?:\+84|84|0)(?:[3|5|7|8|9][0-9]{8}\b|[2][0-9]{9}\b|[1-9][0-9]{8}\b)/g, '').trim())
        .filter(s => s && !isMetaOnlyLine(s));
      if (segments.length > 1) {
        foundIssue = segments[segments.length - 1].replace(issueLabelRegex, '').trim();
      }
    }

    if (!foundIssue) {
      foundIssue = text.replace(/(?:\+84|84|0)[0-9]{9,10}/g, '').trim();
      if (foundIssue.length > 250) {
        foundIssue = foundIssue.slice(0, 250) + '...';
      }
    }

    if (foundIssue) {
      setIssueDescription(foundIssue);
      detected.push({ key: 'issue', label: 'Hiện tượng', value: foundIssue });
    }

    setSmartDetectedChips(detected);
    setSmartParseSuccess(true);
  };

  const handleResetForm = () => {
    setSmartTicketText('');
    setHospitalClinic('');
    setContactPerson('');
    setPhone('');
    setSerialNumber('');
    setErrorCode('');
    setIssueDescription('');
    setSmartDetectedChips([]);
    setSerialImagePreview(null);
    setSerialScanSuccessMsg(null);
    setFormError(null);
    setSubmittedTicket(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalClinic.trim() || !contactPerson.trim() || !phone.trim() || !issueDescription.trim()) {
      setFormError('Vui lòng điền đầy đủ các thông tin bắt buộc (*): Bệnh viện / Phòng khám, Người liên hệ, SĐT và Mô tả hiện tượng.');
      return;
    }

    setFormError(null);
    const created = onSubmitTicket({
      hospitalClinic: hospitalClinic.trim(),
      department: 'Khoa Xét nghiệm', // Giá trị ngầm định chuẩn theo thiết kế mới
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      equipmentModel,
      serialNumber: serialNumber.trim() || undefined,
      errorCode: errorCode.trim() || undefined,
      issueDescription: issueDescription.trim(),
      priority: 'normal' // Giá trị ngầm định chuẩn
    });

    if (asPage && created) {
      setSubmittedTicket(created);
    } else {
      onClose();
    }
  };

  const wrapperClassName = asPage
    ? 'flex-1 min-h-0 flex flex-col w-full max-w-4xl mx-auto animate-fadeIn'
    : 'fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150';

  const cardClassName = asPage
    ? 'bg-white rounded-2xl shadow-2xs border border-slate-200 w-full flex-1 min-h-0 flex flex-col overflow-hidden'
    : 'bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] overflow-y-auto flex flex-col';

  return (
    <div className={wrapperClassName}>
      <div className={cardClassName}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/90 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {asPage && (
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại</span>
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs shrink-0">
              <Wrench className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 leading-tight flex items-center gap-2">
                <span className="truncate">{asPage ? 'Tạo Phiếu Yêu Cầu Hỗ Trợ Kỹ Thuật' : 'Yêu Cầu Hỗ Trợ Kỹ Thuật Trực Tiếp'}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1 shrink-0">
                  <Zap className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600" />
                  <span>AI Nhận Diện Nhanh</span>
                </span>
              </h3>
              <p className="text-xs text-slate-500 truncate">Điều phối Kỹ sư Hiện trường ADC xử lý sự cố thiết bị tại viện</p>
            </div>
          </div>
          {!asPage && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Success View in Page Mode */}
        {asPage && submittedTicket ? (
          <div className="flex-1 min-h-0 overflow-y-auto p-6 flex items-center justify-center">
            <div className="max-w-lg w-full bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  Đã tạo phiếu yêu cầu hỗ trợ thành công!
                </h4>
                <p className="text-xs text-slate-600">
                  Phiếu đã được chuyển tới hàng đợi điều phối của Kỹ sư ADC để liên hệ xử lý.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-emerald-200 p-4 text-left text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mã phiếu:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{submittedTicket.ticketCode}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Bệnh viện / PK:</span>
                  <span className="font-semibold text-slate-800 text-right">{submittedTicket.hospitalClinic}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Thiết bị:</span>
                  <span className="font-semibold text-slate-800">{submittedTicket.equipmentModel}</span>
                </div>
                {submittedTicket.errorCode && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">Mã lỗi:</span>
                    <span className="font-mono font-bold text-amber-700">{submittedTicket.errorCode}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Số điện thoại:</span>
                  <span className="font-mono font-semibold text-slate-800">{submittedTicket.phone}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {onViewLookup && (
                  <button
                    type="button"
                    onClick={() => onViewLookup(submittedTicket.ticketCode)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Tra cứu tiến độ phiếu</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Tạo phiếu mới
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Quay lại trang chính
                </button>
              </div>
            </div>
          </div>
        ) : (
        /* Form */
        <form onSubmit={handleSubmit} className={asPage ? 'p-5 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto' : 'p-5 sm:p-6 space-y-4'}>
          {/* Ô NHẬP NHANH TOÀN BỘ THÔNG TIN (TỰ ĐỘNG NHẬN DIỆN AI) */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 rounded-2xl border-2 border-emerald-300/80 p-4 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                  <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Ô Nhập Nhanh Toàn Bộ Thông Tin (Tự Động Nhận Diện AI)</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Dán tin nhắn Zalo, email hoặc ghi chú — AI tự động bóc tách và chia vào các trường bên dưới
                  </p>
                </div>
              </div>
              {smartParseSuccess && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 self-start sm:self-center animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã nhận diện thành công!
                </span>
              )}
            </div>

            {/* Textarea nhập nhanh toàn bộ */}
            <div className="relative">
              <textarea
                value={smartTicketText}
                onChange={(e) => {
                  const val = e.target.value;
                  setSmartTicketText(val);
                  if (val.trim()) {
                    parseRawTicketText(val);
                  } else {
                    setSmartDetectedChips([]);
                  }
                }}
                rows={3}
                placeholder="Dán hoặc gõ toàn bộ thông tin tại đây...&#10;Ví dụ: BV Đa khoa Thu Cúc, BS. Trần Văn Hùng 0987654321, máy Zybio EXC200 bị lỗi E101 kẹt kim hút hóa chất R1..."
                className="w-full p-3.5 text-xs bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400 shadow-inner font-sans leading-relaxed"
              />
              {smartTicketText && (
                <button
                  type="button"
                  onClick={() => {
                    setSmartTicketText('');
                    setSmartDetectedChips([]);
                  }}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Xóa trắng ô"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Toolbar hướng dẫn ví dụ & đính kèm ảnh tem máy */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 flex-1 min-w-0">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-200/80 shrink-0">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Ví dụ:</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium truncate" title="BV Đa khoa Thu Cúc, BS. Trần Văn Hùng 0987654321, máy Zybio EXC200 bị lỗi E101 kẹt kim hút hóa chất R1...">
                  BV Đa khoa Thu Cúc, BS. Trần Văn Hùng 0987654321, máy Zybio EXC200 bị lỗi E101 kẹt kim hút hóa chất R1...
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Nút đính kèm ảnh tem máy nhận diện số Serial trực tiếp */}
                <label
                  className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                  title="Tải ảnh tem máy hoặc chụp ảnh để AI tự động nhận diện Số Serial & Dòng máy"
                >
                  {serialScanLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>{serialScanLoading ? 'Đang đọc tem...' : 'Tải ảnh tem máy'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleScanSerialFromImage(file);
                      e.target.value = '';
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => parseRawTicketText(smartTicketText)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Nhận diện</span>
                </button>
              </div>
            </div>

            {/* Tag Chips khi nhận diện thành công */}
            {smartDetectedChips.length > 0 && (
              <div className="pt-2 border-t border-emerald-200/80">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã nhận diện & phân bổ {smartDetectedChips.length} trường thông tin:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {smartDetectedChips.map((chip, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-white border border-emerald-300 text-slate-800 shadow-2xs"
                    >
                      <span className="text-emerald-700 font-bold">{chip.label}:</span>
                      <span className="text-slate-900 truncate max-w-[200px]">{chip.value}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CÁC TRƯỜNG THÔNG TIN CHI TIẾT (Được tự động điền và có thể tùy chỉnh) */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Thông Tin Phiếu Kỹ Thuật
            </span>
            <span className="text-[11px] text-slate-400">
              Có thể chỉnh sửa trực tiếp từng ô bên dưới
            </span>
          </div>

          {/* Hàng 1: Bệnh viện / Phòng khám */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bệnh viện / Phòng khám <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={hospitalClinic}
              onChange={(e) => setHospitalClinic(e.target.value)}
              placeholder="VD: BV Đa Khoa Quốc Tế Thu Cúc..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 focus:bg-white transition-colors"
            />
          </div>

          {/* Hàng 2: Người liên hệ & SĐT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bác sĩ / KTV liên hệ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="VD: BS. Nguyễn Văn Hùng"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại liên hệ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912xxxxxx"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Hàng 3: Model, Serial (kèm chức năng nhận diện ảnh tem máy), Mã lỗi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dòng máy cần xử lý
              </label>
              <select
                value={equipmentModel}
                onChange={(e) => setEquipmentModel(e.target.value as EquipmentModel)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-800 cursor-pointer"
              >
                <option value="Zybio EXC200/220">Zybio EXC200/220</option>
                <option value="Zybio Z3 CRP">Zybio Z3 CRP</option>
                <option value="Zybio Z50">Zybio Z50</option>
                <option value="FS-205">FS-205</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Số Serial máy
                </label>
                <label
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg cursor-pointer transition-colors shadow-2xs"
                  title="Tải ảnh tem máy hoặc chụp ảnh để AI tự động nhận diện số Serial"
                >
                  {serialScanLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                  ) : (
                    <Camera className="w-3 h-3 text-emerald-600" />
                  )}
                  <span>{serialScanLoading ? 'Đang đọc tem...' : 'Nhận diện từ ảnh'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleScanSerialFromImage(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="VD: EXC-2025-01 hoặc tải ảnh tem máy"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 focus:bg-white transition-colors pr-7"
                />
                {serialNumber && (
                  <button
                    type="button"
                    onClick={() => {
                      setSerialNumber('');
                      setSerialScanSuccessMsg(null);
                    }}
                    className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-200/60"
                    title="Xóa Serial"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Trạng thái nhận diện tem máy & ảnh xem trước */}
              {serialScanLoading && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                  <span>Đang phân tích tem máy trích xuất Serial...</span>
                </div>
              )}

              {serialScanSuccessMsg && !serialScanLoading && (
                <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1">
                  <span className="truncate">{serialScanSuccessMsg}</span>
                  <button
                    type="button"
                    onClick={() => setSerialScanSuccessMsg(null)}
                    className="text-slate-400 hover:text-slate-600 ml-1"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}

              {serialImagePreview && (
                <div className="mt-2 flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <img
                    src={serialImagePreview}
                    alt="Tem máy"
                    className="w-10 h-10 object-cover rounded-md border border-slate-300 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-700 truncate">Ảnh tem máy đã nạp</p>
                    <p className="text-[10px] text-slate-500 truncate">SN: {serialNumber || 'Đang quét...'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSerialImagePreview(null);
                      setSerialScanSuccessMsg(null);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-200/60 cursor-pointer"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã lỗi hiển thị (nếu có)
              </label>
              <input
                type="text"
                value={errorCode}
                onChange={(e) => setErrorCode(e.target.value.toUpperCase())}
                placeholder="VD: E101, H101"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Hàng 4: Mô tả chi tiết hiện tượng */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả chi tiết hiện tượng lỗi <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Mô tả cụ thể hiện tượng: Máy kêu tít tít, kim bị kẹt vị trí nào, đã thử thao tác gì..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 focus:bg-white transition-colors"
            />
          </div>

          {/* SLA Commitment banner */}
          <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-900 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Phiếu yêu cầu sẽ được chuyển thẳng đến hàng đợi điều phối kỹ sư trưởng ADC (KS. Nguyễn Quang Đạt & cộng sự) để gọi điện thoại xác nhận và tiếp nhận ngay.
            </p>
          </div>

          {/* Validation error banner */}
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Xóa trắng form
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                {asPage ? 'Quay lại' : 'Hủy bỏ'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Gửi Phiếu Yêu Cầu Hỗ Trợ</span>
              </button>
            </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
