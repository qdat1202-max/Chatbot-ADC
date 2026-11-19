import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  ThumbsUp, 
  ThumbsDown, 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Edit, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  X, 
  ArrowRight, 
  Layers, 
  Zap, 
  Save, 
  Clock, 
  MessageSquare,
  Award,
  ChevronDown
} from 'lucide-react';
import { 
  LearnedKnowledgeEntry, 
  EquipmentModel, 
  LearningStatusType, 
  LearningSourceType, 
  SOPArticle,
  ChatbotSessionRecord
} from '../types';
import { 
  promoteLearnedEntryToSOP, 
  runServerKnowledgeSynthesis 
} from '../utils/learningEngine';

interface ChatbotLearningViewProps {
  learnedEntries: LearnedKnowledgeEntry[];
  sessions: ChatbotSessionRecord[];
  onUpdateEntries: (entries: LearnedKnowledgeEntry[]) => void;
  onPromoteToSOP: (sop: SOPArticle) => void;
  onNavigateToSOPTab?: () => void;
}

export const ChatbotLearningView: React.FC<ChatbotLearningViewProps> = ({
  learnedEntries,
  sessions,
  onUpdateEntries,
  onPromoteToSOP,
  onNavigateToSOPTab
}) => {
  // Filters & Search
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Actions
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisMessage, setSynthesisMessage] = useState<string | null>(null);
  const [viewingEntry, setViewingEntry] = useState<LearnedKnowledgeEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<LearnedKnowledgeEntry | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Form State for Create/Edit
  const [formData, setFormData] = useState<Partial<LearnedKnowledgeEntry>>({
    title: '',
    equipmentModel: 'Zybio EXC200/220',
    category: 'Cơ khí & Kim hút',
    symptomSummary: '',
    rootCauseAnalysis: '',
    solutionSteps: ['Bước 1: '],
    safetyNotes: ['Đeo găng tay y tế bảo hộ'],
    sourceType: 'user_correction',
    status: 'active',
    confidenceScore: 0.85,
    matchedKeywords: []
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = learnedEntries.length;
    const active = learnedEntries.filter(e => e.status === 'active').length;
    const pending = learnedEntries.filter(e => e.status === 'pending_review').length;
    const promoted = learnedEntries.filter(e => e.status === 'promoted_to_sop').length;

    const totalHelpful = learnedEntries.reduce((acc, e) => acc + (e.helpfulCount || 0), 0);
    const totalUnhelpful = learnedEntries.reduce((acc, e) => acc + (e.unhelpfulCount || 0), 0);
    const totalVotes = totalHelpful + totalUnhelpful;
    const positiveRate = totalVotes > 0 ? Math.round((totalHelpful / totalVotes) * 100) : 95;

    const avgConfidence = total > 0 
      ? Math.round((learnedEntries.reduce((acc, e) => acc + e.confidenceScore, 0) / total) * 100)
      : 85;

    return { total, active, pending, promoted, positiveRate, avgConfidence, totalVotes };
  }, [learnedEntries]);

  // Filtered List
  const filteredEntries = useMemo(() => {
    return learnedEntries.filter(entry => {
      if (modelFilter !== 'all' && entry.equipmentModel !== modelFilter) return false;
      if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
      if (sourceFilter !== 'all' && entry.sourceType !== sourceFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = (entry.title || '').toLowerCase().includes(q);
        const inCode = (entry.errorCode || '').toLowerCase().includes(q);
        const inSymptom = (entry.symptomSummary || entry.symptomPattern || '').toLowerCase().includes(q);
        const inCause = (entry.rootCauseAnalysis || '').toLowerCase().includes(q);
        const inKeywords = (entry.matchedKeywords || entry.triggerKeywords || []).some(k => k.toLowerCase().includes(q));
        const stepsList = entry.solutionSteps || (entry.learnedSolution ? entry.learnedSolution.split('\n') : []);
        const inSteps = stepsList.some(s => s.toLowerCase().includes(q));
        return inTitle || inCode || inSymptom || inCause || inKeywords || inSteps;
      }
      return true;
    });
  }, [learnedEntries, modelFilter, statusFilter, sourceFilter, searchQuery]);

  // Trigger continuous learning synthesis
  const handleTriggerSynthesis = async () => {
    setIsSynthesizing(true);
    setSynthesisMessage(null);
    try {
      const result = await runServerKnowledgeSynthesis(sessions, learnedEntries);
      onUpdateEntries(result.updatedKnowledge);
      setSynthesisMessage(`Đã hoàn tất phân tích học hỏi tự động! Đã đúc kết ${result.newItemsCount} tri thức mới từ dữ liệu thực tế.`);
      setTimeout(() => setSynthesisMessage(null), 6000);
    } catch (err) {
      console.error(err);
      setSynthesisMessage('Có lỗi xảy ra trong quá trình đúc kết tri thức.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  // 1-Click Promote to SOP
  const handlePromote = (entry: LearnedKnowledgeEntry) => {
    const newSOP = promoteLearnedEntryToSOP(entry);
    onPromoteToSOP(newSOP);

    // Update entry status
    const updated = learnedEntries.map(e => 
      e.id === entry.id ? { ...e, status: 'promoted_to_sop' as LearningStatusType, updatedAt: new Date().toISOString() } : e
    );
    onUpdateEntries(updated);

    if (confirm(`Đã chuyển đổi thành công tri thức "${entry.title}" thành Quy trình SOP chính thức (Mã lỗi: ${newSOP.errorCode})!\n\nBạn có muốn chuyển sang tab "Kho SOP" để kiểm tra ngay?`)) {
      if (onNavigateToSOPTab) {
        onNavigateToSOPTab();
      }
    }
  };

  // Toggle Status
  const handleToggleStatus = (entry: LearnedKnowledgeEntry) => {
    const nextStatus: LearningStatusType = entry.status === 'active' ? 'archived' : 'active';
    const updated = learnedEntries.map(e => 
      e.id === entry.id ? { ...e, status: nextStatus, updatedAt: new Date().toISOString() } : e
    );
    onUpdateEntries(updated);
  };

  // Delete
  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tri thức tự học này?')) {
      const updated = learnedEntries.filter(e => e.id !== id);
      onUpdateEntries(updated);
    }
  };

  // Save Form (Create or Edit)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.symptomSummary || !formData.rootCauseAnalysis) {
      alert('Vui lòng điền đầy đủ tiêu đề, hiện tượng và nguyên nhân!');
      return;
    }

    if (editingEntry) {
      const updated = learnedEntries.map(item => {
        if (item.id === editingEntry.id) {
          return {
            ...item,
            ...formData,
            updatedAt: new Date().toISOString()
          } as LearnedKnowledgeEntry;
        }
        return item;
      });
      onUpdateEntries(updated);
      setEditingEntry(null);
    } else {
      const nowStr = new Date().toISOString();
      const keywords = formData.matchedKeywords && formData.matchedKeywords.length > 0 
        ? formData.matchedKeywords 
        : formData.title?.toLowerCase().split(/\s+/).filter(w => w.length > 2) || ['kỹ thuật'];
      const steps = formData.solutionSteps?.filter(s => s.trim()) || ['Kiểm tra và hiệu chỉnh thiết bị'];

      const newEntry: LearnedKnowledgeEntry = {
        id: `LKN-MANUAL-${Date.now().toString(36).toUpperCase()}`,
        title: formData.title || 'Kinh nghiệm kỹ thuật',
        equipmentModel: formData.equipmentModel || 'Zybio EXC200/220',
        errorCode: formData.errorCode || undefined,
        category: formData.category || 'Cơ khí & Kim hút',
        triggerKeywords: keywords,
        matchedKeywords: keywords,
        symptomPattern: formData.symptomSummary || formData.title || '',
        symptomSummary: formData.symptomSummary || '',
        learnedSolution: steps.join('\n'),
        solutionSteps: steps,
        rootCauseAnalysis: formData.rootCauseAnalysis || '',
        safetyNotes: formData.safetyNotes?.filter(s => s.trim()) || ['Đeo găng tay y tế'],
        sourceType: (formData.sourceType as LearningSourceType) || 'user_correction',
        learningSource: 'user_feedback',
        sourceSnippet: 'Nhập thủ công bởi Ban Quản Trị ADC',
        confidenceScore: formData.confidenceScore || 0.9,
        helpfulVotes: 1,
        helpfulCount: 1,
        unhelpfulVotes: 0,
        unhelpfulCount: 0,
        usageCount: 1,
        sourceSessionIds: [],
        status: (formData.status as LearningStatusType) || 'active',
        learnedAt: nowStr,
        lastAppliedAt: nowStr,
        createdAt: nowStr,
        updatedAt: nowStr
      };
      onUpdateEntries([newEntry, ...learnedEntries]);
      setIsCreatingNew(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Banner & Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Sparkles className="w-3 h-3 text-emerald-300 animate-pulse" />
                <span>ADC Continuous Learning AI</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Cơ chế tự học liên tục từ hội thoại & phản hồi KTV
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-400" />
              <span>Trung Tâm Tự Học & Quản Trị Tri Thức Chatbot ADC</span>
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tự động phân tích hội thoại đã xử lý, tổng hợp phản hồi lâm sàng (thumbs up/down, mẹo hiện trường của kỹ thuật viên) để tự động tinh chỉnh câu trả lời Chatbot theo thời gian thực và cho phép 1-click nâng cấp thành SOP chuẩn ADC.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={handleTriggerSynthesis}
              disabled={isSynthesizing}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                isSynthesizing 
                  ? 'bg-emerald-800/80 text-emerald-200 cursor-wait'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
              }`}
              title="Phân tích toàn bộ ca hội thoại và phản hồi để đúc kết tri thức mới"
            >
              <Zap className={`w-4 h-4 text-amber-300 ${isSynthesizing ? 'animate-spin' : ''}`} />
              <span>{isSynthesizing ? 'Đang Đúc Kết Tri Thức...' : '⚡ Đúc Kết Tự Học (AI Synthesis)'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData({
                  title: '',
                  equipmentModel: 'Zybio EXC200/220',
                  category: 'Cơ khí & Kim hút',
                  symptomSummary: '',
                  rootCauseAnalysis: '',
                  solutionSteps: ['Bước 1: Kiểm tra ngoại quan', 'Bước 2: Xử lý theo khuyến cáo'],
                  safetyNotes: ['Đeo găng tay y tế bảo hộ'],
                  sourceType: 'user_correction',
                  status: 'active',
                  confidenceScore: 0.9,
                  matchedKeywords: []
                });
                setIsCreatingNew(true);
              }}
              className="px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Tri Thức Mới</span>
            </button>
          </div>
        </div>

        {/* Synthesis Alert Message */}
        {synthesisMessage && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{synthesisMessage}</span>
          </div>
        )}
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Tổng Tri Thức Tự Học</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{metrics.total}</span>
            <span className="text-[10px] text-slate-400">quy tắc đã ghi nhận</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Đang Bật Chatbot 24/7</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">{metrics.active}</span>
            <span className="text-[10px] text-emerald-600 font-medium">áp dụng trực tiếp</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Độ Hài Lòng Của KTV</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-teal-600">{metrics.positiveRate}%</span>
            <span className="text-[10px] text-slate-400 font-mono">({metrics.totalVotes} đánh giá)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Độ Tin Cậy Trung Bình</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-600">{metrics.avgConfidence}%</span>
            <span className="text-[10px] text-slate-400 font-mono">Bayesian Score</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Đã Nâng Cấp Thành SOP</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-purple-600">{metrics.promoted}</span>
            <span className="text-[10px] text-purple-600 font-semibold">Quy trình chuẩn</span>
          </div>
        </div>
      </div>

      {/* 3. Workflow Visualizer (How Continuous Learning Works) */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-slate-700">
        <div className="flex items-center gap-2 font-bold text-emerald-900 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Quy trình Tự Học Liên Tục (Continuous Learning Pipeline) của Chatbot ADC:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-xl border border-emerald-200/60 shadow-2xs">
            <span className="font-bold text-emerald-800 text-[11px] block mb-1">1. Thu Thập Thực Chiến</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Thu nhận đánh giá Hữu ích/Chưa hiệu quả và các mẹo/kinh nghiệm thực tế do KTV gửi trực tiếp trên khung chat.
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-200/60 shadow-2xs">
            <span className="font-bold text-emerald-800 text-[11px] block mb-1">2. Đúc Kết & Trọng Số AI</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Thuật toán Bayesian Confidence chấm điểm độ tin cậy và Gemini 3.8 Flash tổng hợp triệu chứng, nguyên nhân và các bước xử lý.
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-200/60 shadow-2xs">
            <span className="font-bold text-emerald-800 text-[11px] block mb-1">3. Tự Động Nạp Vào Prompt</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Các tri thức Active lập tức được tiêm vào prompt hệ thống của Chatbot để trả lời chính xác ngay cho các ca gặp sự cố tương tự.
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-200/60 shadow-2xs">
            <span className="font-bold text-emerald-800 text-[11px] block mb-1">4. Nâng Cấp Thành SOP</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Kỹ sư trưởng xem xét và 1-click nâng cấp tri thức thực tế được đánh giá cao thành Quy trình SOP chính thức của ADC.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Filters & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề, mã lỗi, từ khóa, giải pháp..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Model Filter */}
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">Tất cả dòng máy</option>
            <option value="Zybio EXC200/220">Zybio EXC200/220 (Sinh hóa)</option>
            <option value="Zybio Z3 CRP">Zybio Z3 CRP (Huyết học)</option>
            <option value="Zybio Z50">Zybio Z50 (5TP Laser)</option>
            <option value="FS-205">FS-205 (Miễn dịch)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">🟢 Đang hoạt động (Active)</option>
            <option value="pending_review">🟡 Chờ xem xét (Pending)</option>
            <option value="promoted_to_sop">🟣 Đã thành SOP (Promoted)</option>
            <option value="archived">⚪ Lưu trữ (Archived)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Hiển thị <strong>{filteredEntries.length}</strong> / {learnedEntries.length} tri thức
        </div>
      </div>

      {/* 5. Knowledge Entries Cards / Table */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-2xs">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">Không tìm thấy tri thức tự học nào phù hợp</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Thử thay đổi bộ lọc tìm kiếm hoặc bấm nút "⚡ Đúc Kết Tự Học (AI Synthesis)" để hệ thống quét dữ liệu hội thoại và sinh tri thức mới.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map(entry => {
            const isPromoted = entry.status === 'promoted_to_sop';
            const isActive = entry.status === 'active';
            const confidencePercent = Math.round(entry.confidenceScore * 100);

            return (
              <div
                key={entry.id}
                className={`bg-white rounded-xl border p-4 shadow-2xs hover:shadow-xs transition-all ${
                  isActive 
                    ? 'border-slate-200' 
                    : isPromoted 
                    ? 'border-purple-200 bg-purple-50/10' 
                    : 'border-slate-200 opacity-75'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {entry.errorCode ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] rounded border border-emerald-200">
                          {entry.errorCode}
                        </span>
                      ) : null}

                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium text-[10px] rounded">
                        {entry.equipmentModel}
                      </span>

                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded font-medium">
                        {entry.category}
                      </span>

                      {/* Source Badge */}
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] rounded font-medium flex items-center gap-1 border border-amber-200/60">
                        <MessageSquare className="w-2.5 h-2.5 text-amber-600" />
                        <span>
                          {entry.sourceType === 'user_correction' ? 'Góp ý KTV' :
                           entry.sourceType === 'resolved_chat' ? 'Đúc kết hội thoại thành công' :
                           entry.sourceType === 'maintenance_record' ? 'Sổ tay 2026-XLKT' : 'Nhập chuyên gia'}
                        </span>
                      </span>

                      {/* Status Badge */}
                      {isActive ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>Đang Hoạt Động (Live Chat)</span>
                        </span>
                      ) : isPromoted ? (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] rounded-full font-bold flex items-center gap-1 border border-purple-200">
                          <Award className="w-3 h-3 text-purple-600" />
                          <span>Đã Nâng Cấp Thành SOP</span>
                        </span>
                      ) : entry.status === 'pending_review' ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded-full font-bold">
                          Chờ Duyệt
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full font-medium">
                          Đã Lưu Trữ
                        </span>
                      )}
                    </div>

                    {/* Title & Symptoms */}
                    <div>
                      <h4 
                        onClick={() => setViewingEntry(entry)}
                        className="text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                      >
                        {entry.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        <strong className="text-slate-700">Hiện tượng:</strong> {entry.symptomSummary || entry.symptomPattern}
                      </p>
                      <p className="text-xs text-amber-900 mt-0.5 line-clamp-1 bg-amber-50/60 p-1 rounded">
                        <strong>Nguyên nhân gốc:</strong> {entry.rootCauseAnalysis || 'Đúc kết từ thực chiến lâm sàng'}
                      </p>
                    </div>

                    {/* Solution Steps Preview */}
                    {(() => {
                      const entrySteps = entry.solutionSteps || (entry.learnedSolution ? entry.learnedSolution.split('\n') : ['Kiểm tra thiết bị']);
                      return (
                        <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 text-[11px] text-slate-700 space-y-1">
                          <div className="font-semibold text-slate-800 flex items-center gap-1 text-[10px] uppercase text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Kinh nghiệm & Các bước xử lý đã học ({entrySteps.length} bước):</span>
                          </div>
                          {entrySteps.slice(0, 2).map((st, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-1 line-clamp-1">
                              <span className="font-mono text-emerald-600 font-bold shrink-0">#{sIdx + 1}</span>
                              <span className="truncate">{st.replace(/^Bước \d+:\s*/, '')}</span>
                            </div>
                          ))}
                          {entrySteps.length > 2 && (
                            <button
                              onClick={() => setViewingEntry(entry)}
                              className="text-[10px] text-emerald-700 font-semibold hover:underline cursor-pointer"
                            >
                              + Xem thêm {entrySteps.length - 2} bước chi tiết...
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Meta info & Keywords */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-emerald-600" />
                        <strong className="text-emerald-700">{entry.helpfulVotes ?? entry.helpfulCount ?? 0}</strong> KTV thấy hữu ích
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsDown className="w-3 h-3 text-slate-400" />
                        <span>{entry.unhelpfulVotes ?? entry.unhelpfulCount ?? 0}</span>
                      </span>
                      <span className="font-mono">
                        Độ tin cậy: <strong className="text-slate-700">{confidencePercent}%</strong>
                      </span>
                      <span>Học lúc: {new Date(entry.learnedAt || entry.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-row lg:flex-col items-center gap-1.5 shrink-0 self-end lg:self-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-2 lg:pt-0 lg:pl-3 w-full lg:w-auto justify-end">
                    {/* 1-Click Promote to SOP Button */}
                    {!isPromoted && (
                      <button
                        type="button"
                        onClick={() => handlePromote(entry)}
                        className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white rounded-lg text-xs font-bold border border-purple-200 transition-colors cursor-pointer flex items-center gap-1"
                        title="Nâng cấp kinh nghiệm tự học thành Quy trình SOP chính thức trong Kho SOP"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Nâng Cấp SOP</span>
                      </button>
                    )}

                    {/* Toggle Active/Archive Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(entry)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                        isActive 
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                      title={isActive ? 'Tạm dừng áp dụng trong Chatbot' : 'Kích hoạt lại trong Chatbot'}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Tạm Dừng' : 'Kích Hoạt'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {/* View Detail */}
                      <button
                        type="button"
                        onClick={() => setViewingEntry(entry)}
                        title="Xem toàn văn chi tiết"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEntry(entry);
                          setFormData({ ...entry });
                        }}
                        title="Chỉnh sửa tri thức"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        title="Xóa tri thức"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: VIEW DETAIL */}
      {viewingEntry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    Chi Tiết Tri Thức Tự Học Chatbot
                  </h3>
                  <p className="text-[10px] text-emerald-100 font-mono">
                    ID: {viewingEntry.id} · Model: {viewingEntry.equipmentModel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingEntry(null)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tiêu đề kinh nghiệm</span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">{viewingEntry.title}</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block">Dòng máy:</span>
                  <span className="font-bold text-slate-800">{viewingEntry.equipmentModel}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Mã lỗi liên quan:</span>
                  <span className="font-bold font-mono text-emerald-700">{viewingEntry.errorCode || 'Lỗi hiện tượng chung'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Phân loại:</span>
                  <span className="font-bold text-slate-800">{viewingEntry.category}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Hiện tượng sự cố ghi nhận:</span>
                <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  {viewingEntry.symptomSummary}
                </p>
              </div>

              <div>
                <span className="font-bold text-amber-900 block mb-1">Nguyên nhân kỹ thuật đã đúc kết:</span>
                <p className="bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 text-amber-900 leading-relaxed">
                  {viewingEntry.rootCauseAnalysis}
                </p>
              </div>

              <div>
                <span className="font-bold text-emerald-900 block mb-1">Các bước xử lý chuẩn xác:</span>
                <div className="space-y-1.5">
                  {(viewingEntry.solutionSteps || (viewingEntry.learnedSolution ? viewingEntry.learnedSolution.split('\n') : ['Kiểm tra và xử lý'])).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step.replace(/^Bước \d+:\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {(viewingEntry.safetyNotes && viewingEntry.safetyNotes.length > 0) && (
                <div>
                  <span className="font-bold text-red-900 block mb-1">Lưu ý an toàn:</span>
                  <div className="bg-red-50 p-2.5 rounded-lg border border-red-200 text-red-800 space-y-1">
                    {viewingEntry.safetyNotes.map((note, nIdx) => (
                      <p key={nIdx}>• {note}</p>
                    ))}
                  </div>
                </div>
              )}

              {viewingEntry.sourceSnippet && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Trích dẫn nguồn gốc đúc kết:</span>
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                    "{viewingEntry.sourceSnippet}"
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-400">
                Độ tin cậy: {Math.round(viewingEntry.confidenceScore * 100)}% ({viewingEntry.helpfulCount} vote hữu ích)
              </span>

              <div className="flex items-center gap-2">
                {viewingEntry.status !== 'promoted_to_sop' && (
                  <button
                    onClick={() => {
                      handlePromote(viewingEntry);
                      setViewingEntry(null);
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Nâng Cấp Thành SOP Chuẩn</span>
                  </button>
                )}
                <button
                  onClick={() => setViewingEntry(null)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE / EDIT */}
      {(editingEntry || isCreatingNew) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm">
                {editingEntry ? 'Chỉnh Sửa Tri Thức Tự Học' : 'Thêm Tri Thức Tự Học Mới'}
              </h3>
              <button
                onClick={() => {
                  setEditingEntry(null);
                  setIsCreatingNew(false);
                }}
                className="w-7 h-7 rounded-lg hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tiêu Đề Tri Thức / Kinh Nghiệm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Kinh nghiệm xử lý kẹt khay nạp thẻ FS-205"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Dòng Máy</label>
                  <select
                    value={formData.equipmentModel}
                    onChange={(e) => setFormData({ ...formData, equipmentModel: e.target.value as EquipmentModel })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Zybio EXC200/220">Zybio EXC200/220</option>
                    <option value="Zybio Z3 CRP">Zybio Z3 CRP</option>
                    <option value="Zybio Z50">Zybio Z50</option>
                    <option value="FS-205">FS-205</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Mã Lỗi (nếu có)</label>
                  <input
                    type="text"
                    value={formData.errorCode || ''}
                    onChange={(e) => setFormData({ ...formData, errorCode: e.target.value.toUpperCase() })}
                    placeholder="VD: E101, H101, FS101"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Trạng Thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as LearningStatusType })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="active">🟢 Đang hoạt động (Active)</option>
                    <option value="pending_review">🟡 Chờ xem xét</option>
                    <option value="archived">⚪ Lưu trữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Mô Tả Hiện Tượng Sự Cố <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.symptomSummary || ''}
                  onChange={(e) => setFormData({ ...formData, symptomSummary: e.target.value })}
                  placeholder="Mô tả hiện tượng kỹ thuật quan sát được tại phòng xét nghiệm..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Phân Tích Nguyên Nhân Gốc <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.rootCauseAnalysis || ''}
                  onChange={(e) => setFormData({ ...formData, rootCauseAnalysis: e.target.value })}
                  placeholder="Nguyên nhân kỹ thuật đã xác định..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800">Các Bước Xử Lý Khắc Phục (SOP)</label>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      solutionSteps: [...(formData.solutionSteps || []), `Bước ${(formData.solutionSteps?.length || 0) + 1}: `]
                    })}
                    className="text-[11px] text-emerald-700 font-semibold hover:underline cursor-pointer"
                  >
                    + Thêm bước
                  </button>
                </div>
                <div className="space-y-1.5">
                  {(formData.solutionSteps || []).map((step, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-emerald-700 text-xs shrink-0 w-6">#{sIdx + 1}</span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const updated = [...(formData.solutionSteps || [])];
                          updated[sIdx] = e.target.value;
                          setFormData({ ...formData, solutionSteps: updated });
                        }}
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formData.solutionSteps || []).filter((_, i) => i !== sIdx);
                          setFormData({ ...formData, solutionSteps: updated });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingEntry(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Tri Thức</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
