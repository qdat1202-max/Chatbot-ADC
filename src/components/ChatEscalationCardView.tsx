import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  PhoneCall, 
  CheckCircle2, 
  Wrench, 
  Zap, 
  ChevronRight, 
  Copy, 
  Check, 
  ExternalLink,
  Flame,
  Layers,
  HelpCircle,
  ThumbsDown,
  User,
  Building2,
  Phone
} from 'lucide-react';
import { ChatEscalationCard, EquipmentModel, SupportTicket, formatShortStaffName } from '../types';

interface ChatEscalationCardViewProps {
  card: ChatEscalationCard;
  equipmentModel: EquipmentModel;
  dutyEngineerName: string;
  dutyEngineerPhone: string;
  onOpenLookup?: (ticketCode: string) => void;
  onSubmitDispatch: (ticketData: Omit<SupportTicket, 'id' | 'ticketCode' | 'createdAt' | 'status' | 'source'>) => SupportTicket;
}

export const ChatEscalationCardView: React.FC<ChatEscalationCardViewProps> = ({
  card,
  equipmentModel,
  dutyEngineerName,
  dutyEngineerPhone,
  onOpenLookup,
  onSubmitDispatch
}) => {
  const [isSubmitted, setIsSubmitted] = useState<boolean>(Boolean(card.isSubmitted));
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);
  const [submittedTime, setSubmittedTime] = useState<number>(
    card.submittedAt ? new Date(card.submittedAt).getTime() : 0
  );
  const [copiedCode, setCopiedCode] = useState(false);

  // Form states
  const [hospitalClinic, setHospitalClinic] = useState(card.prefillData?.hospitalClinic || 'Bệnh viện Đa khoa Quốc tế');
  const [contactPerson, setContactPerson] = useState(card.prefillData?.contactPerson || 'KTV Trực Máy');
  const [phone, setPhone] = useState(card.prefillData?.phone || '0988 123 456');
  const [issueDescription, setIssueDescription] = useState(
    card.prefillData?.issueDescription || `Sự cố trên máy xét nghiệm ${equipmentModel}`
  );

  // 15-minute SLA Countdown timer
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);

  useEffect(() => {
    if (!isSubmitted || !submittedTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - submittedTime) / 1000);
      const remaining = Math.max(0, 15 * 60 - elapsed);
      setSecondsRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, submittedTime]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleConfirmSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hospitalClinic.trim() || !contactPerson.trim() || !phone.trim()) {
      alert('Vui lòng điền đầy đủ Tên Bệnh viện/Phòng khám, Người liên hệ và Số điện thoại!');
      return;
    }

    const newTicket = onSubmitDispatch({
      hospitalClinic: hospitalClinic.trim(),
      department: 'Khoa Xét nghiệm',
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      equipmentModel: equipmentModel,
      serialNumber: card.prefillData?.serialNumber,
      errorCode: card.prefillData?.errorCode,
      issueDescription: issueDescription.trim(),
      priority: 'urgent',
      escalationReason: card.type,
      escalationCommitmentMinutes: 15
    });

    setCreatedTicket(newTicket);
    setIsSubmitted(true);
    setSubmittedTime(Date.now());
    card.isSubmitted = true;
    card.ticketCode = newTicket.ticketCode;
    card.submittedAt = new Date().toISOString();
  };

  // Header styling by escalation type
  const getTypeConfig = () => {
    switch (card.type) {
      case 'keyword_match':
        return {
          badgeText: 'SỰ CỐ PHẦN CỨNG KHẨN CẤP (keyword_match)',
          badgeBg: 'bg-red-600 text-white',
          borderAccent: 'border-red-500',
          bgGradient: 'from-red-50 via-rose-50 to-amber-50',
          icon: <Flame className="w-4 h-4 text-white animate-pulse" />,
          statusColor: 'text-red-700'
        };
      case 'high_complexity':
        return {
          badgeText: 'MỨC ĐỘ PHỨC TẠP CAO (high_complexity)',
          badgeBg: 'bg-purple-700 text-white',
          borderAccent: 'border-purple-400',
          bgGradient: 'from-purple-50 via-indigo-50 to-blue-50',
          icon: <Layers className="w-4 h-4 text-white" />,
          statusColor: 'text-purple-700'
        };
      case 'bot_unresolved':
        return {
          badgeText: 'CHATBOT CHƯA GIẢI QUYẾT / THẤT BẠI LẶP LẠI (bot_unresolved)',
          badgeBg: 'bg-amber-600 text-white',
          borderAccent: 'border-amber-400',
          bgGradient: 'from-amber-50 via-orange-50 to-yellow-50',
          icon: <AlertTriangle className="w-4 h-4 text-white" />,
          statusColor: 'text-amber-800'
        };
      case 'unhelpful_feedback':
        return {
          badgeText: 'PHẢN HỒI CHƯA HIỆU QUẢ (unhelpful_feedback)',
          badgeBg: 'bg-rose-700 text-white',
          borderAccent: 'border-rose-400',
          bgGradient: 'from-rose-50 via-red-50 to-pink-50',
          icon: <ThumbsDown className="w-4 h-4 text-white" />,
          statusColor: 'text-rose-800'
        };
      default:
        return {
          badgeText: 'ĐIỀU PHỐI KỸ THUẬT ƯU TIÊN CAO',
          badgeBg: 'bg-blue-600 text-white',
          borderAccent: 'border-blue-400',
          bgGradient: 'from-blue-50 to-slate-50',
          icon: <Wrench className="w-4 h-4 text-white" />,
          statusColor: 'text-blue-800'
        };
    }
  };

  const config = getTypeConfig();
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className={`mt-2 rounded-xl border-2 ${config.borderAccent} bg-gradient-to-b ${config.bgGradient} p-3 shadow-sm text-slate-800 transition-all`}>
      {/* Top Banner: Escalation Badge & 15-Minute Commitment */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2 pb-2 border-b border-slate-200/80">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-2xs ${config.badgeBg}`}>
          {config.icon}
          <span>{config.badgeText}</span>
        </span>

        {/* 15-Minute SLA Badge */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-emerald-800 border border-emerald-300 font-bold text-[10px] shadow-2xs">
          <Clock className="w-3 h-3 text-emerald-600 animate-spin" style={{ animationDuration: '4s' }} />
          <span>CAM KẾT PHẢN HỒI: ≤ 15 PHÚT</span>
        </span>
      </div>

      {/* Title & Description */}
      <div className="mb-2.5">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <span>{card.title}</span>
        </h4>
        <p className="text-[11px] text-slate-700 mt-0.5 leading-relaxed">
          {card.description}
        </p>
      </div>

      {/* Safety Alerts Box (Always prominent, critical for keyword_match) */}
      {card.safetyAlerts && card.safetyAlerts.length > 0 && (
        <div className="mb-3 p-2.5 rounded-lg bg-red-100/90 border border-red-300 text-red-950 text-[11px] shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-red-900 text-xs">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>QUY TRÌNH AN TOÀN Y SINH & THIẾT BỊ BẮT BUỘC:</span>
          </div>
          <ul className="space-y-1 pl-1 pt-0.5">
            {card.safetyAlerts.map((alert, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-[10.5px] leading-tight">
                <span className="font-bold text-red-700 shrink-0">•</span>
                <span className="font-medium">{alert}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* State A: Before submission -> Automatic Call-back Request Form */}
      {!isSubmitted ? (
        <div className="bg-white/95 backdrop-blur-xs rounded-xl p-3 border border-slate-300 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Form Yêu Cầu Gọi Lại & Tự Động Tạo Phiếu (TICK-xxxx)</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-bold">
              Ưu tiên: KHẨN CẤP
            </span>
          </div>

          <form onSubmit={handleConfirmSubmit} className="space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                  Bệnh viện / Phòng khám:
                </label>
                <div className="relative">
                  <Building2 className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                  <input
                    type="text"
                    required
                    value={hospitalClinic}
                    onChange={(e) => setHospitalClinic(e.target.value)}
                    placeholder="VD: BV Đa khoa Quốc tế"
                    className="w-full pl-6 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                  Người phụ trách / Bác sĩ / KTV:
                </label>
                <div className="relative">
                  <User className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="VD: KTV. Lan"
                    className="w-full pl-6 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                Số điện thoại nhận cuộc gọi kỹ sư:
              </label>
              <div className="relative">
                <Phone className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0988 123 456"
                  className="w-full pl-6 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-emerald-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                Tóm tắt sự cố (Tự động chuyển tiếp):
              </label>
              <textarea
                rows={2}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                className="w-full p-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 resize-none font-medium"
              />
            </div>

            <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Kỹ sư ADC cam kết phản hồi trong vòng <strong>15 phút</strong>.</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white rounded-lg font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Tạo Phiếu Điều Phối Ưu Tiên Cao (TICK-xxxx)</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* State B: After submission -> Live SLA Countdown & Dispatch Confirmation */
        <div className="bg-white rounded-xl p-3 border-2 border-emerald-500 shadow-sm space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-900">
                ĐÃ TẠO PHIẾU ĐIỀU PHỐI ƯU TIÊN CAO THÀNH CÔNG!
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold font-mono">
              Ưu tiên: KHẨN CẤP
            </span>
          </div>

          {/* Ticket Code & Live Countdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            {/* Left: Ticket Code */}
            <div>
              <span className="text-[10px] text-slate-500 block">Mã phiếu điều phối:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                  {createdTicket?.ticketCode || card.ticketCode || 'TICK-2026-001'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(createdTicket?.ticketCode || card.ticketCode || 'TICK-2026-001')}
                  className="p-1 text-slate-500 hover:text-slate-800 bg-white rounded border border-slate-200 cursor-pointer"
                  title="Sao chép mã phiếu"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-600 mt-1 block">
                {hospitalClinic} ({contactPerson} - {phone})
              </span>
            </div>

            {/* Right: Live SLA Countdown Clock (15:00) */}
            <div className="flex flex-col items-center justify-center bg-white p-2 rounded-lg border border-emerald-200 shadow-2xs text-center">
              <span className="text-[10px] font-semibold text-emerald-800 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>Cam kết Kỹ sư gọi lại trước:</span>
              </span>
              <div className={`text-xl font-black font-mono tracking-wider my-0.5 ${secondsRemaining > 300 ? 'text-emerald-700' : 'text-red-600 animate-bounce'}`}>
                {timerStr}
              </div>
              <span className="text-[9px] text-slate-500">
                (Cam kết phản hồi trong vòng 15 phút)
              </span>
            </div>
          </div>

          {/* Duty Engineer Quick Contact */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
              <span className="text-slate-500">Kỹ sư trực hiện trường:</span>
              <strong className="text-emerald-900 font-bold">{formatShortStaffName(dutyEngineerName || 'KS. Nguyễn Quang Đạt')}</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href={`tel:${dutyEngineerPhone || '0988234567'}`}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Gọi trực tiếp ({dutyEngineerPhone || '0988 234 567'})</span>
              </a>

              {onOpenLookup && (
                <button
                  type="button"
                  onClick={() => onOpenLookup(createdTicket?.ticketCode || card.ticketCode || '')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Tra cứu tiến độ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
