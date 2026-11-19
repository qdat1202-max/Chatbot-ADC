import React, { useState } from 'react';
import { 
  Phone, 
  PhoneCall, 
  MessageSquare, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  ExternalLink,
  Send,
  Headphones
} from 'lucide-react';
import { ChatCallForwardingInfo, SupportTicket, formatShortStaffName, getStaffInitials } from '../types';

interface SmartCallForwardingCardProps {
  forwardingInfo: ChatCallForwardingInfo;
  equipmentModel: string;
  userQuery?: string;
  onConfirmCallback?: (hospital: string, phone: string, issue: string) => SupportTicket | void;
}

export const SmartCallForwardingCard: React.FC<SmartCallForwardingCardProps> = ({
  forwardingInfo,
  equipmentModel,
  userQuery,
  onConfirmCallback
}) => {
  const [isCallbackFormOpen, setIsCallbackFormOpen] = useState(false);
  const [callbackHospital, setCallbackHospital] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackDepartment, setCallbackDepartment] = useState('Khoa Xét nghiệm');
  const [callbackSubmittedTicket, setCallbackSubmittedTicket] = useState<string | null>(null);
  const [hasDialed, setHasDialed] = useState(false);

  const { assignedEngineer, triggerReasonLabel, matchedRuleText, triggerReason, strategyExplanation } = forwardingInfo;

  const handleDialClick = () => {
    setHasDialed(true);
  };

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim()) {
      alert('Vui lòng nhập số điện thoại để kỹ sư liên hệ lại!');
      return;
    }

    const hospitalName = callbackHospital.trim() || 'Cơ sở y tế trực tuyến';
    const contactPhone = callbackPhone.trim();
    const issueText = userQuery || `Yêu cầu chuyển tiếp cuộc gọi khẩn cấp trên máy ${equipmentModel}`;

    if (onConfirmCallback) {
      const ticket = onConfirmCallback(hospitalName, contactPhone, issueText);
      if (ticket && typeof ticket === 'object' && 'ticketCode' in ticket) {
        setCallbackSubmittedTicket((ticket as SupportTicket).ticketCode);
      } else {
        setCallbackSubmittedTicket(`TICK-${Date.now().toString().slice(-4)}`);
      }
    } else {
      setCallbackSubmittedTicket(`TICK-${Date.now().toString().slice(-4)}`);
    }

    setIsCallbackFormOpen(false);
  };

  // Color theme based on trigger urgency
  const isUrgent = triggerReason === 'keyword_match' || triggerReason === 'high_complexity';

  return (
    <div className={`mt-2.5 rounded-2xl border transition-all overflow-hidden shadow-sm ${
      isUrgent 
        ? 'bg-gradient-to-b from-rose-50/70 via-white to-rose-50/40 border-rose-300 ring-2 ring-rose-200/50' 
        : 'bg-gradient-to-b from-emerald-50/70 via-white to-teal-50/30 border-emerald-300 ring-2 ring-emerald-200/40'
    }`}>
      {/* Header Banner */}
      <div className={`px-3 py-2 flex items-center justify-between gap-2 border-b ${
        isUrgent 
          ? 'bg-rose-600 text-white border-rose-700' 
          : 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white border-emerald-800'
      }`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300" />
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider truncate">
            {isUrgent ? 'Chuyển Tiếp Cuộc Gọi Khẩn Cấp' : 'Chuyển Tiếp Cuộc Gọi Thông Minh'}
          </span>
        </div>
        <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
          <Headphones className="w-3 h-3" />
          <span>Kỹ Sư Trực Tuyến</span>
        </span>
      </div>

      <div className="p-3 space-y-2.5 text-xs text-slate-800">
        {/* Trigger Rule Pill */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
              isUrgent 
                ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {isUrgent ? <AlertTriangle className="w-3 h-3 text-rose-600" /> : <Zap className="w-3 h-3 text-emerald-600" />}
              <span>Quy tắc kích hoạt: {triggerReasonLabel}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {equipmentModel}
            </span>
          </div>

          {matchedRuleText && (
            <p className="text-[11px] text-slate-600 italic bg-white/80 px-2 py-1 rounded-lg border border-slate-200/60 leading-relaxed">
              💡 {matchedRuleText}
            </p>
          )}
        </div>

        {/* Assigned Available Engineer Card */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                {getStaffInitials(assignedEngineer.name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {formatShortStaffName(assignedEngineer.name)}
                  </h4>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Sẵn sàng trực</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate font-medium">
                  {assignedEngineer.role === 'css' 
                    ? 'Phòng CSS & Điều Phối Kỹ Thuật ADC' 
                    : `Kỹ Sư Hiện Trường (${assignedEngineer.specialties?.slice(0, 2).join(', ') || 'Chuyên sâu'})`}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="font-mono font-bold text-emerald-700 text-xs block">
                {assignedEngineer.phone}
              </span>
              <span className="text-[9px] text-slate-400 flex items-center justify-end gap-0.5">
                <Clock className="w-2.5 h-2.5 text-slate-400" />
                <span>Trực 24/7</span>
              </span>
            </div>
          </div>

          {/* Area & Strategy info */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1 truncate max-w-[220px]">
              <MapPin className="w-3 h-3 text-red-500 shrink-0" />
              <span className="truncate">{assignedEngineer.area}</span>
            </span>
            <span className="text-emerald-700 font-medium">
              SLA: Phản hồi &lt; 30 giây
            </span>
          </div>
        </div>

        {/* Callback Confirmation Banner if already submitted */}
        {callbackSubmittedTicket && (
          <div className="p-2.5 bg-emerald-100/90 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-[11px]">
                ĐÃ TẠO PHIẾU CHUYỂN TIẾP ƯU TIÊN: {callbackSubmittedTicket}
              </p>
              <p className="text-[10px] text-emerald-800">
                Kỹ sư {assignedEngineer.name} đã nhận được thông báo và sẽ chủ động gọi điện hỗ trợ Quý khách trong ít phút!
              </p>
            </div>
          </div>
        )}

        {/* Dialed Feedback Banner */}
        {hasDialed && !callbackSubmittedTicket && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[10px] flex items-center justify-between">
            <span>Đang thực hiện cuộc gọi tới <strong>{assignedEngineer.name} ({assignedEngineer.phone})</strong>...</span>
            <button
              onClick={() => setHasDialed(false)}
              className="text-blue-700 underline font-semibold ml-2 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Direct Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          {/* Button 1: Call Directly via Tel: */}
          <a
            href={`tel:${assignedEngineer.phone.replace(/\s+/g, '')}`}
            onClick={handleDialClick}
            className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-transform active:scale-95"
            title={`Bấm để gọi điện trực tiếp tới ${assignedEngineer.name}`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>Gọi Kỹ Sư Ngay</span>
          </a>

          {/* Button 2: Request Immediate Callback */}
          <button
            type="button"
            onClick={() => setIsCallbackFormOpen(prev => !prev)}
            className="py-2 px-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 hover:border-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Yêu Cầu Gọi Lại</span>
          </button>
        </div>

        {/* Inline Callback Form */}
        {isCallbackFormOpen && !callbackSubmittedTicket && (
          <form 
            onSubmit={handleCallbackSubmit}
            className="p-3 bg-white rounded-xl border border-emerald-300/80 shadow-xs space-y-2 animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kỹ sư {assignedEngineer.name} sẽ gọi lại cho bạn:</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCallbackFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <div>
                <input
                  type="tel"
                  required
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  placeholder="Số điện thoại của bạn (* bắt buộc)..."
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  autoFocus
                />
              </div>

              <div>
                <input
                  type="text"
                  value={callbackHospital}
                  onChange={(e) => setCallbackHospital(e.target.value)}
                  placeholder="Tên Bệnh viện / Phòng khám (VD: BV Đa khoa X)..."
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                Ưu tiên phản hồi trong 3-5 phút
              </span>
              <button
                type="submit"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Send className="w-3 h-3" />
                <span>Gửi Yêu Cầu</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
