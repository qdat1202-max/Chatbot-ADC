import React, { useState, useMemo } from 'react';
import { 
  Bot, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  Zap, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Sparkles, 
  Tag, 
  FileText, 
  ArrowUpRight, 
  TrendingUp, 
  Layers, 
  Eye, 
  X, 
  Check, 
  Calendar, 
  Cpu,
  BarChart2,
  SlidersHorizontal
} from 'lucide-react';
import { 
  ChatbotSessionRecord, 
  EquipmentModel, 
  IssueNatureType, 
  ChatbotPerformanceStats 
} from '../types';
import { 
  calculateChatbotStats, 
  ISSUE_NATURE_CONFIG,
  MODEL_FAULTS_CATALOG 
} from '../utils/nlpClassifier';
import { exportChatbotSessionsToExcel, exportChatbotSessionsToCSV } from '../utils/excel';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend 
} from 'recharts';

interface ChatbotAnalyticsViewProps {
  sessions: ChatbotSessionRecord[];
  onRefresh?: () => void;
  onAddSimulatedSession?: (session: ChatbotSessionRecord) => void;
}

const FAULT_COLORS: Record<string, string> = {
  'E101': '#DC2626',      // Red: Va chạm/nghẽn kim hút
  'E205': '#D97706',      // Amber: Tràn trạm rửa cuvette
  'E301': '#EA580C',      // Orange: Lệch nhiệt ủ / halogen
  'LIS-EXC': '#4F46E5',   // Indigo: LIS EXC
  'QC-EXC': '#059669',    // Emerald: Calib/QC EXC
  'H101': '#2563EB',      // Blue: Tắc lỗ đếm vi mô sapphire
  'H102': '#3B82F6',      // Light Blue: Bọt khí buồng đo
  'H204': '#10B981',      // Emerald: Rò rỉ van áp lực âm
  'H301': '#0D9488',      // Teal: Thuốc thử lyse/CRP
  'LIS-Z3': '#6366F1',    // Indigo: LIS Z3
  'Z501': '#7C3AED',      // Purple: Bọt khí buồng laser 5TP
  'Z502': '#9333EA',      // Violet: Bơm syringe chân không
  'Z503': '#A855F7',      // Purple light: Diode laser suy hao
  'DIFF-ERR': '#C084FC',  // Lavender: Lỗi tán xạ Scattergram
  'FS101': '#0891B2',     // Cyan: Kẹt khay nạp thẻ cassette
  'FS-BAR-01': '#EC4899', // Pink: Lỗi quét barcode
  'FS-CAL-01': '#F43F5E', // Rose: Lỗi thẻ nhớ IC Card
  'LIS-FS': '#475569'     // Slate: LIS FS-205
};

export const ChatbotAnalyticsView: React.FC<ChatbotAnalyticsViewProps> = ({
  sessions,
  onRefresh,
  onAddSimulatedSession
}) => {
  // Filters
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [faultFilter, setFaultFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'resolved' | 'escalated'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<ChatbotSessionRecord | null>(null);

  // Model selection for the Fault Breakdown Chart
  const [chartModelForFaults, setChartModelForFaults] = useState<string>('all');

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      if (modelFilter !== 'all' && s.equipmentModel !== modelFilter) return false;
      if (faultFilter !== 'all') {
        const sFaultCode = s.classification?.faultCode || s.matchedSOPCode || '';
        const sFaultLabel = s.classification?.faultLabel || '';
        if (sFaultCode !== faultFilter && !sFaultLabel.includes(faultFilter)) return false;
      }
      if (statusFilter === 'resolved' && !s.isResolvedByBot) return false;
      if (statusFilter === 'escalated' && !s.escalatedToEngineer) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inId = s.id.toLowerCase().includes(q);
        const inHospital = (s.hospitalClinic || '').toLowerCase().includes(q);
        const inModel = (s.equipmentModel || '').toLowerCase().includes(q);
        const inNature = (s.classification?.natureLabel || '').toLowerCase().includes(q);
        const inFault = (s.classification?.faultLabel || '').toLowerCase().includes(q);
        const inFaultCode = (s.classification?.faultCode || '').toLowerCase().includes(q);
        const inKeywords = (s.classification?.keywordsDetected || []).some(k => k.toLowerCase().includes(q));
        const inQueries = (s.userQuerySnippets || []).some(snippet => snippet.toLowerCase().includes(q));
        return inId || inHospital || inModel || inNature || inFault || inFaultCode || inKeywords || inQueries;
      }
      return true;
    });
  }, [sessions, modelFilter, faultFilter, statusFilter, searchQuery]);

  // Aggregate stats based on sessions
  const stats: ChatbotPerformanceStats = useMemo(() => {
    return calculateChatbotStats(filteredSessions);
  }, [filteredSessions]);

  // Data for Model Bar Chart
  const modelBarData = useMemo(() => {
    const models: EquipmentModel[] = ['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'];
    return models.map(m => {
      const match = filteredSessions.filter(s => s.equipmentModel === m);
      const resolved = match.filter(s => s.isResolvedByBot).length;
      const escalated = match.filter(s => s.escalatedToEngineer).length;
      return {
        model: m.replace('Zybio ', ''),
        fullName: m,
        tong: match.length,
        tuGiaiQuyet: resolved,
        chuyenKySu: escalated
      };
    });
  }, [filteredSessions]);

  // Data for Model Faults Breakdown Chart (Focus target requested by user: "đổi sang phân loại theo lỗi của dòng máy")
  const modelFaultsPieData = useMemo(() => {
    const targetSessions = chartModelForFaults === 'all'
      ? filteredSessions
      : filteredSessions.filter(s => s.equipmentModel === chartModelForFaults);

    const map: Record<string, { count: number; code: string; label: string; model: string }> = {};

    targetSessions.forEach(s => {
      const code = s.classification?.faultCode || s.matchedSOPCode || 'ERR';
      const label = s.classification?.faultLabel || `[${code}] Sự cố dòng máy ${s.equipmentModel || ''}`;
      const key = `${s.equipmentModel || ''}___${code}`;

      if (!map[key]) {
        map[key] = {
          count: 0,
          code,
          label,
          model: s.equipmentModel || ''
        };
      }
      map[key].count++;
    });

    return Object.values(map)
      .map(data => ({
        name: data.label,
        shortName: data.code,
        value: data.count,
        code: data.code,
        model: data.model
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSessions, chartModelForFaults]);

  // Dynamic Fault Filter Options for the Table dropdown
  const availableFaultOptions = useMemo(() => {
    const opts: { code: string; label: string; model: string }[] = [];
    const seen = new Set<string>();

    sessions.forEach(s => {
      const code = s.classification?.faultCode || s.matchedSOPCode;
      const label = s.classification?.faultLabel || `[${code}] Sự cố ${s.equipmentModel}`;
      if (code && !seen.has(code)) {
        seen.add(code);
        opts.push({ code, label, model: s.equipmentModel });
      }
    });

    return opts;
  }, [sessions]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredSessions.length === 0) {
      alert('Không có dữ liệu phiên chat để xuất!');
      return;
    }

    const headers = [
      'Mã Phiên',
      'Thời Gian',
      'Đơn Vị/Bệnh Viện',
      'Dòng Thiết Bị',
      'Mã Lỗi Dòng Máy',
      'Tên Phân Loại Lỗi (NLP)',
      'Độ Tin Cậy (%)',
      'Số Tin Nhắn',
      'Thời Gian Phản Hồi (ms)',
      'Giải Quyết Bởi Bot',
      'Chuyển Tiếp Kỹ Sư',
      'Mã SOP Khắc Phục',
      'Tóm Tắt Câu Hỏi'
    ];

    const rows = filteredSessions.map(s => [
      `"${s.id}"`,
      `"${s.startedAt || ''}"`,
      `"${(s.hospitalClinic || '').replace(/"/g, '""')}"`,
      `"${s.equipmentModel || ''}"`,
      `"${s.classification?.faultCode || s.matchedSOPCode || ''}"`,
      `"${(s.classification?.faultLabel || s.classification?.natureLabel || '').replace(/"/g, '""')}"`,
      `"${Math.round((s.classification?.confidence || 0) * 100)}%"`,
      `"${s.messageCount || 1}"`,
      `"${s.avgResponseTimeMs || 0}"`,
      `"${s.isResolvedByBot ? 'Có' : 'Không'}"`,
      `"${s.escalatedToEngineer ? 'Có' : 'Không'}"`,
      `"${s.matchedSOPCode || ''}"`,
      `"${(s.userQuerySnippets || []).join(' | ').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bao_Cao_Phan_Loai_Loi_Dong_May_ADC_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add demo sample session with explicit model error classification
  const handleSimulateNewChat = () => {
    if (!onAddSimulatedSession) return;
    const sampleHospitals = [
      'BV Đa khoa Hồng Ngọc',
      'BV Sản Nhi Bắc Ninh',
      'BV Phổi Trung Ương',
      'TT Y tế Thanh Ba - Phú Thọ',
      'BV Đa khoa Quốc tế Thu Cúc'
    ];

    const sampleFaults: { model: EquipmentModel; nature: IssueNatureType; natureLabel: string; faultCode: string; faultName: string; kw: string[]; query: string }[] = [
      {
        model: 'Zybio EXC200/220',
        nature: 'hardware',
        natureLabel: 'Phần cứng & Cơ khí',
        faultCode: 'E101',
        faultName: 'Va chạm & kẹt kim hút mẫu/thuốc thử',
        kw: ['E101', 'kim hút', 'va chạm', 'sample probe'],
        query: 'Máy Zybio EXC200 báo mã lỗi E101 va chạm kim hút mẫu vào khay'
      },
      {
        model: 'Zybio EXC200/220',
        nature: 'reagents_cuvette',
        natureLabel: 'Hóa chất & Buồng đếm',
        faultCode: 'E205',
        faultName: 'Tràn nước trạm rửa cuvette & nghẹt xả',
        kw: ['E205', 'tràn nước', 'trạm rửa', 'cuvette'],
        query: 'Nước trạm rửa cuvette máy sinh hóa tràn lênh láng dưới chân máy'
      },
      {
        model: 'Zybio Z3 CRP',
        nature: 'reagents_cuvette',
        natureLabel: 'Hóa chất & Buồng đếm',
        faultCode: 'H101',
        faultName: 'Nghẽn lỗ đếm vi mô sapphire WBC/RBC',
        kw: ['H101', 'lỗ đếm', 'aperture sapphire', 'clot'],
        query: 'Huyết học Z3 CRP báo nghẽn khẩu độ vi mô sapphire do clot mẫu'
      },
      {
        model: 'Zybio Z3 CRP',
        nature: 'hardware',
        natureLabel: 'Phần cứng & Cơ khí',
        faultCode: 'H204',
        faultName: 'Rò rỉ van áp lực âm & bơm hút lyse',
        kw: ['H204', 'van áp lực', 'rò rỉ', 'áp lực âm'],
        query: 'Máy Z3 CRP kêu tít tít van áp lực rò rỉ nước pha loãng'
      },
      {
        model: 'Zybio Z50',
        nature: 'optics_sensor',
        natureLabel: 'Quang học & Cảm biến',
        faultCode: 'Z501',
        faultName: 'Bọt khí buồng đếm dòng tế bào laser 5TP',
        kw: ['Z501', 'laser flow cell', 'bọt khí', 'scattergram'],
        query: 'Bọt khí vi mô buồng quang laser dòng tế bào 5 thành phần Z50'
      },
      {
        model: 'FS-205',
        nature: 'hardware',
        natureLabel: 'Phần cứng & Cơ khí',
        faultCode: 'FS101',
        faultName: 'Kẹt khay nạp thẻ test cassette huỳnh quang',
        kw: ['FS101', 'kẹt khay', 'cassette', 'dây curoa'],
        query: 'Khay nạp thẻ test cassette FS205 bị kẹt không đẩy ra ngoài'
      },
      {
        model: 'FS-205',
        nature: 'optics_sensor',
        natureLabel: 'Quang học & Cảm biến',
        faultCode: 'FS-BAR-01',
        faultName: 'Lỗi đầu đọc quang không nhận barcode thẻ chíp',
        kw: ['FS-BAR-01', 'barcode', 'đầu đọc quang', 'mã vạch'],
        query: 'Đầu đọc quang FS205 đưa thẻ test vào không nhận mã vạch QR'
      }
    ];

    const pickHosp = sampleHospitals[Math.floor(Math.random() * sampleHospitals.length)];
    const pickFault = sampleFaults[Math.floor(Math.random() * sampleFaults.length)];
    const isBotWin = Math.random() > 0.25;

    const newSim: ChatbotSessionRecord = {
      id: `SES-${Date.now().toString().slice(-6)}`,
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      equipmentModel: pickFault.model,
      messageCount: Math.floor(Math.random() * 3) + 2,
      avgResponseTimeMs: Math.floor(Math.random() * 350) + 600,
      isResolvedByBot: isBotWin,
      escalatedToEngineer: !isBotWin,
      classification: {
        equipmentModel: pickFault.model,
        issueNature: pickFault.nature,
        natureLabel: pickFault.natureLabel,
        confidence: Number((0.88 + Math.random() * 0.11).toFixed(2)),
        keywordsDetected: pickFault.kw,
        summaryNote: `Phân loại lỗi dòng máy: [${pickFault.faultCode}] ${pickFault.faultName}`,
        faultCode: pickFault.faultCode,
        faultLabel: `[${pickFault.faultCode}] ${pickFault.faultName}`
      },
      userQuerySnippets: [pickFault.query, isBotWin ? 'KTV đã làm theo SOP hướng dẫn thành công' : 'Cần kỹ sư ADC đến xử lý tại viện'],
      matchedSOPCode: pickFault.faultCode,
      hospitalClinic: pickHosp
    };

    onAddSimulatedSession(newSim);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <Bot className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Báo Cáo Hiệu Suất Chatbot ADC & Phân Loại Lỗi Dòng Máy
            </h3>
          </div>
        </div>

        {/* Action Buttons: Xuất Excel / CSV */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportChatbotSessionsToExcel(filteredSessions)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            title="Xuất toàn bộ báo cáo hiệu suất chatbot ra file Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Xuất Excel</span>
          </button>
          <button
            type="button"
            onClick={() => exportChatbotSessionsToCSV(filteredSessions)}
            className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            title="Xuất toàn bộ báo cáo hiệu suất chatbot ra file CSV (.csv)"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng số phiên */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Tổng Phiên Hội Thoại Chatbot</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.totalSessions}</span>
            <span className="text-xs text-slate-500 font-mono">phiên</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Tổng lượt tương tác:</span>
            <span className="font-mono font-bold text-slate-800">{stats.totalMessages} tin nhắn</span>
          </div>
        </div>

        {/* Card 2: Thời gian phản hồi TB */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Thời Gian Phản Hồi TB (Latency)</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-blue-600">{stats.avgResponseTimeMs}</span>
            <span className="text-xs text-blue-600 font-mono">mili-giây (ms)</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Tiêu chuẩn SLA:</span>
            <span className="font-mono font-bold text-emerald-600">&lt; 1,500 ms (Đạt chuẩn)</span>
          </div>
        </div>

        {/* Card 3: Tỷ lệ giải quyết tự động hoàn toàn */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Tỷ Lệ Tự Giải Quyết Bằng SOP</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">{stats.resolvedByBotRate}%</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
              Tự động 100%
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Khách hàng tự xử lý:</span>
            <span className="font-mono font-bold text-slate-800">
              {Math.round((stats.totalSessions * stats.resolvedByBotRate) / 100)} / {stats.totalSessions} ca
            </span>
          </div>
        </div>

        {/* Card 4: Tỷ lệ chuyển tiếp kỹ sư */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Tỷ Lệ Chuyển Tiếp Kỹ Sư Hiện Trường</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-amber-600">{stats.escalatedRate}%</span>
            <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-mono">
              Cần điều phối
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Phiếu hỗ trợ kích hoạt:</span>
            <span className="font-mono font-bold text-slate-800">
              {Math.round((stats.totalSessions * stats.escalatedRate) / 100)} ca khẩn cấp
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 1: Xu Hướng & Phân Bổ Thiết Bị */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CHART 1: Xu hướng phiên làm việc theo ngày */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Xu Hướng Phiên Làm Việc & Lượt Hỏi (7 Ngày Gần Nhất)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Biến động lượng yêu cầu và tỷ lệ khách hàng tự khắc phục qua trợ lý ADC
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyTrends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900/95 text-white p-2.5 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1 font-mono">
                            Ngày: {label}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <div key={`trend-${index}`} className="flex items-center justify-between gap-3">
                              <span style={{ color: entry.color }} className="font-medium">
                                {entry.name}:
                              </span>
                              <span className="font-mono font-bold">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <RechartsLegend wrapperStyle={{ paddingTop: 8, fontSize: 11 }} iconType="circle" />
                <Area type="monotone" dataKey="sessions" name="Số Phiên Chat" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorSessions)" />
                <Area type="monotone" dataKey="messages" name="Lượt Tin Nhắn" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorMessages)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Phân bổ theo dòng máy (Cấp 1) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                <span>Phân Bổ Yêu Cầu Theo Dòng Thiết Bị (Cấp 1)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                So sánh số ca tự giải quyết và số ca chuyển tiếp kỹ sư hiện trường
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelBarData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="model" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900/95 text-white p-2.5 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1 font-mono">
                            Model: {label}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <div key={`bar-${index}`} className="flex items-center justify-between gap-3">
                              <span style={{ color: entry.color }} className="font-medium">
                                {entry.name}:
                              </span>
                              <span className="font-mono font-bold">{entry.value} phiên</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <RechartsLegend wrapperStyle={{ paddingTop: 8, fontSize: 11 }} iconType="circle" />
                <Bar dataKey="tuGiaiQuyet" name="Tự Xử Lý Thành Công" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="chuyenKySu" name="Chuyển Tiếp Kỹ Sư" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2: Phân Loại Theo Lỗi Của Dòng Máy & Top Câu Hỏi Thường Gặp */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CHART 3: Phân loại theo Lỗi của dòng máy (TARGET ELEMENT) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Phân Loại Theo Lỗi Của Dòng Máy</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tỷ trọng các mã lỗi kỹ thuật đặc thù
                </p>
              </div>

              {/* Model Switcher for Error Breakdown */}
              <select
                value={chartModelForFaults}
                onChange={(e) => setChartModelForFaults(e.target.value)}
                className="text-[11px] font-semibold px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 outline-none cursor-pointer"
                title="Chọn dòng máy để xem phân bổ chi tiết các mã lỗi"
              >
                <option value="all">Tất cả dòng máy</option>
                <option value="Zybio EXC200/220">Zybio EXC200/220</option>
                <option value="Zybio Z3 CRP">Zybio Z3 CRP</option>
                <option value="Zybio Z50">Zybio Z50</option>
                <option value="FS-205">FS-205</option>
              </select>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              {modelFaultsPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={modelFaultsPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {modelFaultsPieData.map((entry, index) => {
                        const color = FAULT_COLORS[entry.code] || 
                          Object.entries(FAULT_COLORS).find(([k]) => entry.code.includes(k))?.[1] || 
                          Object.values(FAULT_COLORS)[index % Object.values(FAULT_COLORS).length];
                        return (
                          <Cell
                            key={`fault-cell-${index}`}
                            fill={color}
                          />
                        );
                      })}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0];
                          const total = modelFaultsPieData.reduce((acc, cur) => acc + cur.value, 0);
                          const pct = total > 0 ? Math.round(((item.value as number) / total) * 100) : 0;
                          return (
                            <div className="bg-slate-900/95 text-white p-2.5 rounded-xl border border-slate-700 text-xs shadow-xl space-y-1">
                              <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">{item.name}</p>
                              <div className="flex items-center justify-between gap-3 text-[11px]">
                                <span className="text-slate-400">Số ca ghi nhận:</span>
                                <span className="font-mono font-bold text-emerald-400">{item.value} phiên ({pct}%)</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400 py-12">Chưa có dữ liệu lỗi cho dòng máy này</div>
              )}
            </div>
          </div>

          {/* Fault Legend items with Model Error Badges */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] max-h-48 overflow-y-auto no-scrollbar">
            {modelFaultsPieData.slice(0, 6).map((entry, index) => {
              const total = modelFaultsPieData.reduce((acc, cur) => acc + cur.value, 0);
              const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
              const color = FAULT_COLORS[entry.code] || 
                Object.entries(FAULT_COLORS).find(([k]) => entry.code.includes(k))?.[1] || 
                Object.values(FAULT_COLORS)[index % Object.values(FAULT_COLORS).length];
              return (
                <div key={index} className="flex items-center justify-between gap-2 hover:bg-slate-50 p-1 rounded-md transition-colors">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-mono font-bold text-slate-900 shrink-0 text-[10px] px-1 py-0.2 bg-slate-100 rounded border border-slate-200">
                      {entry.code}
                    </span>
                    <span className="text-slate-700 truncate text-[11px]" title={entry.name}>
                      {entry.name.replace(/^\[.*?\]\s*/, '')}
                    </span>
                  </div>
                  <span className="font-mono text-slate-500 font-semibold shrink-0 text-[11px]">
                    {entry.value} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOP CÂU HỎI & CHỦ ĐỀ THƯỜNG GẶP NHẤT (2 Cols) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Top Câu Hỏi Thường Gặp & Mã Lỗi Dòng Máy Yêu Cầu Nhiều Nhất</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Trích xuất tự động từ tin nhắn của KTV và bệnh viện qua các phiên
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Xếp theo tần suất
              </span>
            </div>

            <div className="space-y-2">
              {stats.topQuestions.length > 0 ? (
                stats.topQuestions.map((q, idx) => (
                  <div
                    key={`q-${idx}`}
                    className="p-2.5 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex items-start gap-2">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-1">{q.query}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                          <span className="text-emerald-800 font-medium">{q.model}</span>
                          {q.faultCode && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200/60">
                                {q.faultCode}
                              </span>
                            </>
                          )}
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{q.nature}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 block text-xs">
                        {q.count} lần hỏi
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Chưa ghi nhận câu hỏi lặp lại trong kỳ phân tích
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Khuyến nghị tối ưu:</span>
            <span className="text-emerald-700 font-medium">
              Các lỗi E101, H101, E205, Z501 và FS101 đã có SOP chuẩn hóa, giúp kỹ thuật viên tự xử lý đạt &gt;75%
            </span>
          </div>
        </div>
      </div>

      {/* DETAILED SESSIONS TABLE (NHẬT KÝ PHÂN LOẠI & LƯU TRỮ PHIÊN CHAT) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Nhật Ký Phiên Hội Thoại & Phân Loại Lỗi Dòng Máy Thời Gian Thực</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Toàn bộ dữ liệu được lưu trữ tự động, có thể truy xuất để phân tích hiệu suất và cải thiện quy trình
            </p>
          </div>

          {/* Quick Count Badge */}
          <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            Hiển thị {filteredSessions.length} / {sessions.length} phiên
          </span>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo ID, Bệnh viện, mã lỗi..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Model Filter */}
          <div>
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="all">Tất cả dòng máy (Cấp 1)</option>
              <option value="Zybio EXC200/220">Zybio EXC200/220</option>
              <option value="Zybio Z3 CRP">Zybio Z3 CRP</option>
              <option value="Zybio Z50">Zybio Z50</option>
              <option value="FS-205">FS-205</option>
            </select>
          </div>

          {/* Fault of Model Filter */}
          <div>
            <select
              value={faultFilter}
              onChange={(e) => setFaultFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="all">Tất cả lỗi của dòng máy</option>
              {availableFaultOptions.map(opt => (
                <option key={opt.code} value={opt.code}>
                  {opt.code} - {opt.label.replace(/^\[.*?\]\s*/, '')}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="all">Tất cả trạng thái giải quyết</option>
              <option value="resolved">Tự giải quyết qua SOP thành công</option>
              <option value="escalated">Đã chuyển tiếp kỹ sư hiện trường</option>
            </select>
          </div>
        </div>

        {/* Sessions Data Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Mã Phiên / Ngày Giờ</th>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Đơn Vị & Dòng Máy</th>
                  <th className="px-3.5 py-2.5">Phân Loại Lỗi Dòng Máy (NLP)</th>
                  <th className="px-3.5 py-2.5 text-center whitespace-nowrap">Độ Tin Cậy</th>
                  <th className="px-3.5 py-2.5 text-center whitespace-nowrap">Độ Trễ</th>
                  <th className="px-3.5 py-2.5 text-center whitespace-nowrap">Kết Quả Xử Lý</th>
                  <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map((session, sIdx) => {
                  const faultCode = session.classification?.faultCode || session.matchedSOPCode;
                  const faultLabel = session.classification?.faultLabel || (faultCode ? `[${faultCode}] Sự cố kỹ thuật` : session.classification?.natureLabel);
                  const color = faultCode ? (FAULT_COLORS[faultCode] || '#2563EB') : '#64748B';

                  return (
                    <tr key={`${session.id}-${sIdx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3.5 py-2.5 whitespace-nowrap font-mono">
                        <span className="font-bold text-slate-800">{session.id}</span>
                        <div className="text-[10px] text-slate-400">
                          {session.startedAt ? session.startedAt.slice(0, 16).replace('T', ' ') : 'Hôm nay'}
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <div className="font-semibold text-slate-900">{session.hospitalClinic || 'Khách Hàng Vãng Lai'}</div>
                        <div className="text-[11px] text-emerald-800 font-medium">
                          {session.equipmentModel || 'Zybio EXC200/220'}
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5 max-w-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {faultCode && (
                            <span 
                              className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold text-white shrink-0"
                              style={{ backgroundColor: color }}
                            >
                              {faultCode}
                            </span>
                          )}
                          <span className="font-medium text-slate-800 text-[11px] truncate" title={faultLabel}>
                            {faultLabel?.replace(/^\[.*?\]\s*/, '')}
                          </span>
                        </div>
                        {session.classification?.keywordsDetected && session.classification.keywordsDetected.length > 0 && (
                          <div className="text-[10px] text-slate-400 mt-1 truncate">
                            Từ khóa y sinh: {session.classification.keywordsDetected.slice(0, 3).join(', ')}
                          </div>
                        )}
                      </td>

                      <td className="px-3.5 py-2.5 text-center whitespace-nowrap font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {Math.round((session.classification?.confidence || 0.88) * 100)}%
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5 text-center whitespace-nowrap font-mono text-slate-600">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>{session.avgResponseTimeMs || 820}ms</span>
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                        {session.isResolvedByBot ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Tự giải quyết (SOP)</span>
                          </span>
                        ) : session.escalatedToEngineer ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <Wrench className="w-3 h-3 text-amber-600" />
                            <span>Chuyển kỹ sư</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            <span>Đang tương tác</span>
                          </span>
                        )}
                      </td>

                      <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedSessionForDetail(session)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SESSION DETAIL MODAL */}
      {selectedSessionForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                  <Bot className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Chi Tiết Phiên Phân Loại: {selectedSessionForDetail.id}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Thời điểm: {selectedSessionForDetail.startedAt || 'Hôm nay'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSessionForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 text-[10px] block">Đơn Vị Yêu Cầu</span>
                <span className="font-semibold text-slate-800">
                  {selectedSessionForDetail.hospitalClinic || 'Khách hàng vãng lai'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Dòng Thiết Bị (Cấp 1)</span>
                <span className="font-semibold text-emerald-800">
                  {selectedSessionForDetail.equipmentModel}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Lỗi Dòng Máy (NLP Cấp 2)</span>
                <span className="font-semibold text-blue-700">
                  {selectedSessionForDetail.classification?.faultLabel || selectedSessionForDetail.classification?.natureLabel}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Độ Tin Cậy & Độ Trễ</span>
                <span className="font-mono font-bold text-slate-700">
                  {Math.round((selectedSessionForDetail.classification?.confidence || 0.85) * 100)}% · {selectedSessionForDetail.avgResponseTimeMs}ms
                </span>
              </div>
            </div>

            {/* Detected Keywords */}
            {selectedSessionForDetail.classification?.keywordsDetected && selectedSessionForDetail.classification.keywordsDetected.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Từ khóa y sinh NLP nhận diện:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSessionForDetail.classification.keywordsDetected.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-mono border border-slate-200">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* User Queries / Snippets */}
            <div>
              <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                Nội dung hội thoại & trích xuất câu hỏi:
              </span>
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                {(selectedSessionForDetail.userQuerySnippets || ['Hỏi thông tin hỗ trợ kỹ thuật']).map((query, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-emerald-600 font-bold shrink-0">[{idx + 1}]</span>
                    <span className="text-slate-700">{query}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution Outcome */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Kết quả xử lý:</span>
              {selectedSessionForDetail.isResolvedByBot ? (
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Đã tự giải quyết qua SOP {selectedSessionForDetail.matchedSOPCode && `(${selectedSessionForDetail.matchedSOPCode})`}
                </span>
              ) : (
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  Đã chuyển tiếp phiếu kỹ sư hiện trường
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
