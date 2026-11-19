import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  Flame, 
  Clock, 
  PhoneCall, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  ThumbsDown, 
  UserCheck, 
  Building2, 
  User, 
  Phone, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Zap,
  Check
} from 'lucide-react';
import { SupportTicket, SOPArticle, EngineerProfile, TicketStatus } from '../types';

interface EmergencyIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  urgentTickets: SupportTicket[];
  sops: SOPArticle[];
  engineers: EngineerProfile[];
  dutyEngineerName: string;
  dutyEngineerPhone: string;
  onAssignEngineer: (ticket: SupportTicket, engineerId: string) => void;
  onUpdateStatus: (ticket: SupportTicket, status: TicketStatus) => void;
  onNavigateToDispatch: (ticketCode: string) => void;
}

export const EmergencyIncidentModal: React.FC<EmergencyIncidentModalProps> = ({
  isOpen,
  onClose,
  urgentTickets,
  sops,
  engineers,
  dutyEngineerName,
  dutyEngineerPhone,
  onAssignEngineer,
  onUpdateStatus,
  onNavigateToDispatch
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Keep index within bounds if list changes
  useEffect(() => {
    if (currentIndex >= urgentTickets.length) {
      setCurrentIndex(Math.max(0, urgentTickets.length - 1));
    }
  }, [urgentTickets.length, currentIndex]);

  const currentTicket = urgentTickets[currentIndex] || urgentTickets[0];

  const technicalEngineers = engineers.filter(
    e => e.role === 'field_engineer' || (e.department || '').toLowerCase().includes('kỹ thuật')
  );

  // Sync selected engineer with current ticket's assigned engineer or duty engineer
  useEffect(() => {
    if (currentTicket) {
      if (currentTicket.assignedEngineerId) {
        setSelectedEngineerId(currentTicket.assignedEngineerId);
      } else {
        const dutyEng = technicalEngineers.find(e => e.name === dutyEngineerName);
        setSelectedEngineerId(dutyEng ? dutyEng.id : (technicalEngineers[0]?.id || ''));
      }
    }
  }, [currentTicket, dutyEngineerName, engineers]);

  // Live 15-minute SLA Countdown timer calculated from ticket.createdAt or 15 mins default
  useEffect(() => {
    if (!currentTicket) return;

    const ticketCreatedTime = new Date(currentTicket.createdAt).getTime();
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - ticketCreatedTime) / 1000);
      const remaining = Math.max(0, 15 * 60 - elapsedSeconds);
      setSecondsRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTicket]);

  if (!isOpen || !currentTicket) return null;

  // Find matching SOP for this ticket
  const matchingSOP = sops.find(s => 
    s.equipmentModel === currentTicket.equipmentModel && (
      (Boolean(currentTicket.errorCode) && s.errorCode.toLowerCase() === currentTicket.errorCode?.toLowerCase()) ||
      currentTicket.issueDescription.toLowerCase().includes(s.errorCode.toLowerCase()) ||
      (currentTicket.issueDescription.toLowerCase().includes('kim') && s.title.toLowerCase().includes('kim')) ||
      (currentTicket.issueDescription.toLowerCase().includes('cuvette') && s.title.toLowerCase().includes('cuvette')) ||
      (currentTicket.issueDescription.toLowerCase().includes('buồng đếm') && s.title.toLowerCase().includes('buồng đếm')) ||
      (currentTicket.issueDescription.toLowerCase().includes('nhiệt') && s.title.toLowerCase().includes('nhiệt'))
    )
  );

  const getReasonConfig = (reason?: string) => {
    switch (reason) {
      case 'keyword_match':
        return {
          title: 'SỰ CỐ PHẦN CỨNG KHẨN CẤP (keyword_match)',
          subtitle: 'Phát hiện từ khóa nguy hiểm / an toàn y sinh: Cháy, nổ, rò điện, mùi khét, vỡ cuvette, hỏng bo mạch, tràn hóa chất',
          badgeBg: 'bg-red-600 text-white',
          borderAccent: 'border-red-500',
          icon: <Flame className="w-5 h-5 text-white animate-pulse" />
        };
      case 'high_complexity':
        return {
          title: 'MỨC ĐỘ PHỨC TẠP CAO (high_complexity)',
          subtitle: 'Mô tả chứa nhiều triệu chứng kỹ thuật kết hợp không thuộc một quy trình SOP đơn lẻ',
          badgeBg: 'bg-purple-700 text-white',
          borderAccent: 'border-purple-500',
          icon: <Layers className="w-5 h-5 text-white" />
        };
      case 'bot_unresolved':
        return {
          title: 'CHATBOT CHƯA GIẢI QUYẾT (bot_unresolved)',
          subtitle: 'Không tìm thấy SOP sau số lần cấu hình hoặc khách hàng phản hồi không khắc phục được',
          badgeBg: 'bg-amber-600 text-white',
          borderAccent: 'border-amber-500',
          icon: <AlertTriangle className="w-5 h-5 text-white" />
        };
      case 'unhelpful_feedback':
        return {
          title: 'PHẢN HỒI CHƯA HIỆU QUẢ (unhelpful_feedback)',
          subtitle: 'Khách hàng nhấn nút Chưa hiệu quả tại phòng xét nghiệm',
          badgeBg: 'bg-rose-700 text-white',
          borderAccent: 'border-rose-500',
          icon: <ThumbsDown className="w-5 h-5 text-white" />
        };
      default:
        return {
          title: 'ĐÁNH DẤU SỰ CỐ KHẨN CẤP CẦN XỬ LÝ',
          subtitle: 'Phiếu hỗ trợ kỹ thuật ưu tiên cao nhất trong ca trực',
          badgeBg: 'bg-red-600 text-white',
          borderAccent: 'border-red-500',
          icon: <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
        };
    }
  };

  const reasonConfig = getReasonConfig(currentTicket.escalationReason);
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleQuickAssign = () => {
    if (!selectedEngineerId) {
      alert('Vui lòng chọn kỹ sư phụ trách!');
      return;
    }
    onAssignEngineer(currentTicket, selectedEngineerId);
    setDispatchSuccessMsg('✓ Đã điều phối kỹ sư thành công! Hệ thống đã kích hoạt tiến trình xử lý.');
    setTimeout(() => setDispatchSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0 cursor-pointer" 
        onClick={onClose}
        title="Bấm để tạm ẩn popup cảnh báo" 
      />

      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border-2 border-red-500 z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* TOP ALERT HEADER (Emergency Flashing Banner) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white shrink-0 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shadow-inner shrink-0 border border-white/20">
              {reasonConfig.icon}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-red-700 shadow-2xs">
                  🚨 CẢNH BÁO KHẨN CẤP
                </span>
                <span className="font-mono font-bold text-xs bg-red-950/60 text-red-200 px-2 py-0.5 rounded border border-red-400/40">
                  {currentTicket.ticketCode}
                </span>
                {urgentTickets.length > 1 && (
                  <span className="text-[11px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-md">
                    Sự cố {currentIndex + 1} / {urgentTickets.length}
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-white mt-1 leading-tight truncate">
                {reasonConfig.title}
              </h3>
              <p className="text-[11px] text-red-100/90 truncate max-w-xl">
                {reasonConfig.subtitle}
              </p>
            </div>
          </div>

          {/* SLA Countdown Timer & Close Button */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex flex-col items-center justify-center bg-red-950/70 border border-red-400/40 px-3 py-1 rounded-xl text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-red-200 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                <span>Cam kết 15 phút:</span>
              </span>
              <span className={`font-mono text-base font-black ${secondsRemaining > 300 ? 'text-amber-300' : 'text-white animate-pulse'}`}>
                {timerStr}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Tạm đóng popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Multi-Ticket Navigator Bar (If more than 1 urgent ticket) */}
        {urgentTickets.length > 1 && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[11px] font-bold text-red-900 shrink-0">
                Danh sách {urgentTickets.length} sự cố khẩn cấp:
              </span>
              {urgentTickets.map((t, idx) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    idx === currentIndex
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'bg-white text-red-700 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  {t.ticketCode} - {t.hospitalClinic.slice(0, 15)}...
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                className="p-1 rounded bg-white hover:bg-slate-100 disabled:opacity-30 border border-slate-200 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={currentIndex === urgentTickets.length - 1}
                onClick={() => setCurrentIndex(prev => Math.min(urgentTickets.length - 1, prev + 1))}
                className="p-1 rounded bg-white hover:bg-slate-100 disabled:opacity-30 border border-slate-200 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* MODAL MAIN CONTENT (FOCUSED ON SOLVING THE PROBLEM) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1 bg-slate-50">
          
          {dispatchSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{dispatchSuccessMsg}</span>
            </div>
          )}

          {/* Grid 2 Cột: Thông tin khách hàng & Hiện tượng sự cố */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Box 1: Khách hàng & Cơ sở y tế */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Bệnh Viện / Phòng Khám Yêu Cầu</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(currentTicket.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {currentTicket.hospitalClinic}
                </p>
                <p className="text-[11px] text-slate-500">{currentTicket.department || 'Khoa Xét Nghiệm'}</p>
              </div>

              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Người liên hệ:</span>
                  <span className="font-bold text-slate-800 text-xs">{currentTicket.contactPerson}</span>
                </div>

                <a
                  href={`tel:${currentTicket.phone}`}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer active:scale-95"
                  title="Nhấn để gọi điện trực tiếp cho nhân viên phụ trách tại viện"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Gọi {currentTicket.phone}</span>
                </a>
              </div>
            </div>

            {/* Box 2: Thiết bị & Mô tả hiện tượng khẩn cấp */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Wrench className="w-4 h-4 text-red-600" />
                  <span>Thiết Bị & Chi Tiết Sự Cố</span>
                </span>
                <span className="px-2 py-0.2 rounded font-bold font-mono text-[10px] bg-red-100 text-red-800 border border-red-200">
                  Ưu tiên: KHẨN CẤP
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {currentTicket.equipmentModel}
                </span>
                {currentTicket.serialNumber && (
                  <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    S/N: {currentTicket.serialNumber}
                  </span>
                )}
                {currentTicket.errorCode && (
                  <span className="font-mono font-bold text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                    Mã lỗi: {currentTicket.errorCode}
                  </span>
                )}
              </div>

              {/* Mô tả hiện tượng trong khung cảnh báo nổi bật */}
              <div className="p-2.5 rounded-lg bg-red-50/80 border border-red-200 text-red-950 space-y-1">
                <span className="font-bold text-[11px] text-red-900 block">Mô tả hiện tượng khẩn cấp:</span>
                <p className="text-xs font-semibold leading-relaxed">
                  {currentTicket.issueDescription}
                </p>
              </div>
            </div>
          </div>

          {/* TRỌNG TÂM: GIẢI PHÁP ĐIỀU PHỐI & QUY TRÌNH XỬ LÝ VẤN ĐỀ TỨC THỜI */}
          <div className="bg-white p-4 rounded-xl border-2 border-emerald-500 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Hành Động Giải Quyết Vấn Đề Ngay Lập Tức</span>
              </span>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Cam kết hỗ trợ ≤ 15 phút
              </span>
            </div>

            {/* Bước 1: Điều phối kỹ sư xuất phát */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  1. Phân công Kỹ sư ADC tiếp nhận ca khẩn cấp:
                </label>
                <select
                  value={selectedEngineerId}
                  onChange={(e) => setSelectedEngineerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Chọn kỹ sư điều phối --</option>
                  {technicalEngineers.map(eng => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col justify-end pt-1 md:pt-0">
                <button
                  type="button"
                  onClick={handleQuickAssign}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Xác Nhận Điều Phối Kỹ Sư</span>
                </button>
              </div>
            </div>

            {/* Bước 2: Hướng dẫn SOP tương ứng & An toàn y sinh để chỉ đạo kỹ sư/bệnh viện */}
            {matchingSOP ? (
              <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-xs text-emerald-950">
                      Quy Trình Khắc Phục Chuẩn (SOP [{matchingSOP.errorCode}]) - {matchingSOP.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold font-mono">
                    {matchingSOP.category}
                  </span>
                </div>

                <p className="text-[11px] text-slate-700">
                  <strong>Nguyên nhân cốt lõi:</strong> {matchingSOP.rootCause}
                </p>

                {/* Các bước xử lý chuẩn */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10.5px] font-bold text-slate-800 block">Các bước xử lý kỹ thuật cần hướng dẫn viện ngay:</span>
                  {matchingSOP.resolutionSteps.slice(0, 3).map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-1.5 text-[11px] text-slate-800 bg-white p-1.5 rounded border border-emerald-100">
                      <span className="font-mono font-bold text-emerald-700 shrink-0">#{sIdx + 1}</span>
                      <span>{step.replace(/^Bước \d+:\s*/, '')}</span>
                    </div>
                  ))}
                </div>

                {matchingSOP.safetyWarnings.length > 0 && (
                  <div className="bg-amber-100/80 border border-amber-300 p-2 rounded-lg text-amber-950 text-[10.5px] flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Cảnh báo an toàn:</strong> {matchingSOP.safetyWarnings.join('; ')}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-100 border border-slate-200 p-3 rounded-xl text-slate-700 text-xs space-y-1">
                <span className="font-bold block">Chỉ đạo an toàn y sinh chung cho sự cố này:</span>
                <p className="text-[11px]">
                  1. Yêu cầu bệnh viện ngắt nguồn điện chính máy {currentTicket.equipmentModel} ngay lập tức.<br/>
                  2. Đeo găng tay y sinh, cách ly khu vực máy, tránh để nhân viên tiếp xúc hóa chất hoặc mảnh vỡ.<br/>
                  3. Kỹ sư mang theo hộp đồ nghề chuyên dụng, bo mạch dự phòng và bộ thông kim áp lực cao.
                </p>
              </div>
            )}

            {/* Bước 3: Cập nhật trạng thái tức thời */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-600 mr-1">Cập nhật trạng thái:</span>
                <button
                  type="button"
                  onClick={() => onUpdateStatus(currentTicket, 'assigned')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                    currentTicket.status === 'assigned'
                      ? 'bg-amber-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ● Đang di chuyển
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus(currentTicket, 'in_progress')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                    currentTicket.status === 'in_progress'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ● Đang xử lý tại chỗ
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus(currentTicket, 'completed')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                    currentTicket.status === 'completed'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ✓ Đã nghiệm thu hoàn thành
                </button>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${dutyEngineerPhone || '0988234567'}`}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Gọi KS Trực 24/7 ({dutyEngineerName || 'Nguyễn Quang Đạt'})</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    onNavigateToDispatch(currentTicket.ticketCode);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở Sổ Điều Phối</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>Chế độ điều phối khẩn cấp: Giám sát 24/7 toàn bộ ca trực phòng xét nghiệm</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold cursor-pointer transition-colors"
          >
            Đóng Popup Cảnh Báo
          </button>
        </div>

      </div>
    </div>
  );
};
