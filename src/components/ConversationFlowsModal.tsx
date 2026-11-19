import React, { useState, useEffect } from 'react';
import { 
  X, 
  Workflow, 
  FileText, 
  Copy, 
  Check, 
  Download, 
  ArrowRight, 
  Sparkles, 
  Wrench, 
  BookOpen, 
  PhoneCall, 
  ShieldAlert, 
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { AdvancedConversationFlow, ConversationFlowCategory, EquipmentModel } from '../types';
import { ADVANCED_CONVERSATION_FLOWS, getFlowsByCategory } from '../data/advancedConversationFlows';

interface ConversationFlowsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFlow: (flow: AdvancedConversationFlow, initialOption?: string) => void;
  selectedModel: EquipmentModel;
}

export const ConversationFlowsModal: React.FC<ConversationFlowsModalProps> = ({
  isOpen,
  onClose,
  onSelectFlow,
  selectedModel
}) => {
  const [activeTab, setActiveTab] = useState<'flows' | 'plan_doc'>('flows');
  const [selectedCategory, setSelectedCategory] = useState<ConversationFlowCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlowDetail, setSelectedFlowDetail] = useState<AdvancedConversationFlow | null>(null);
  
  // Plan.md doc state
  const [planMarkdown, setPlanMarkdown] = useState<string>('');
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);

  // Fetch plan.md from server endpoint
  useEffect(() => {
    if (activeTab === 'plan_doc' && !planMarkdown) {
      setIsLoadingDoc(true);
      fetch('/api/plan-content')
        .then(res => res.json())
        .then(data => {
          if (data?.content) {
            setPlanMarkdown(data.content);
          }
        })
        .catch(err => console.error('Failed to load plan.md:', err))
        .finally(() => setIsLoadingDoc(false));
    }
  }, [activeTab, planMarkdown]);

  if (!isOpen) return null;

  const filteredFlows = ADVANCED_CONVERSATION_FLOWS.filter(flow => {
    if (selectedCategory !== 'all' && flow.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = flow.title.toLowerCase().includes(q);
      const matchSummary = flow.summary.toLowerCase().includes(q);
      const matchKeywords = flow.triggerKeywords.some(k => k.toLowerCase().includes(q));
      const matchCodes = flow.triggerErrorCodes?.some(c => c.toLowerCase().includes(q));
      if (!matchTitle && !matchSummary && !matchKeywords && !matchCodes) return false;
    }
    return true;
  });

  const handleCopyDoc = () => {
    if (!planMarkdown) return;
    navigator.clipboard.writeText(planMarkdown).then(() => {
      setCopiedDoc(true);
      setTimeout(() => setCopiedDoc(false), 2000);
    });
  };

  const handleDownloadDoc = () => {
    if (!planMarkdown) return;
    const blob = new Blob([planMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plan.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Workflow className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  Luồng Hội Thoại Nâng Cao Chatbot ADC
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-bold">
                  plan.md v2026.1
                </span>
              </div>
              <p className="text-[11px] text-emerald-100">
                Kịch bản sự cố phức tạp · Hướng dẫn sử dụng chi tiết · Chuyển tiếp kỹ sư 15 phút
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="bg-white/10 p-0.5 rounded-lg flex items-center text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('flows')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'flows'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>Kịch bản ({ADVANCED_CONVERSATION_FLOWS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('plan_doc')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'plan_doc'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tài liệu plan.md</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'flows' ? (
          <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-slate-50/70">
            
            {/* Left Panel: Flow Categories & List */}
            <div className="w-full md:w-5/12 border-r border-slate-200 bg-white flex flex-col min-h-0">
              
              {/* Filter & Search Bar */}
              <div className="p-3 border-b border-slate-200 space-y-2 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo mã lỗi, hiện tượng, từ khóa..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('complex_troubleshooting')}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                      selectedCategory === 'complex_troubleshooting'
                        ? 'bg-purple-700 text-white'
                        : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                    }`}
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Sự cố phức tạp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('detailed_guide')}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                      selectedCategory === 'detailed_guide'
                        ? 'bg-blue-700 text-white'
                        : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                    }`}
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Hướng dẫn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('engineer_escalation')}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                      selectedCategory === 'engineer_escalation'
                        ? 'bg-red-700 text-white'
                        : 'bg-red-50 text-red-800 hover:bg-red-100'
                    }`}
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Chuyển tiếp</span>
                  </button>
                </div>
              </div>

              {/* Flows List */}
              <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
                {filteredFlows.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Không tìm thấy luồng hội thoại phù hợp với từ khóa.
                  </div>
                ) : (
                  filteredFlows.map(flow => {
                    const isSelected = selectedFlowDetail?.id === flow.id;
                    const isTargetingCurrentModel = flow.targetModels.includes('Tất cả dòng máy') || flow.targetModels.includes(selectedModel);

                    return (
                      <div
                        key={flow.id}
                        onClick={() => setSelectedFlowDetail(flow)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider ${
                            flow.category === 'complex_troubleshooting'
                              ? 'bg-purple-100 text-purple-800'
                              : flow.category === 'detailed_guide'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {flow.categoryLabel}
                          </span>
                          {flow.triggerErrorCodes?.[0] && (
                            <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              {flow.triggerErrorCodes[0]}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {flow.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {flow.summary}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                          <span className="truncate max-w-[170px]">
                            {flow.targetModels.join(', ')}
                          </span>
                          <span className="font-semibold text-emerald-700 flex items-center gap-0.5">
                            <span>{flow.guidedOptions.length} lựa chọn</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Selected Flow Detail & Branching Preview */}
            <div className="flex-1 min-h-0 flex flex-col bg-slate-50/60 p-4 sm:p-5 overflow-y-auto">
              {selectedFlowDetail ? (
                <div className="space-y-4">
                  {/* Flow Header Card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        selectedFlowDetail.category === 'complex_troubleshooting'
                          ? 'bg-purple-100 text-purple-800'
                          : selectedFlowDetail.category === 'detailed_guide'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedFlowDetail.categoryLabel}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        ID: {selectedFlowDetail.id}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1">
                      {selectedFlowDetail.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {selectedFlowDetail.summary}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                      <div className="text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">Dòng máy áp dụng:</span>{' '}
                        {selectedFlowDetail.targetModels.join(' · ')}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectFlow(selectedFlowDetail);
                          onClose();
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Kích hoạt luồng này trong Chat</span>
                      </button>
                    </div>
                  </div>

                  {/* Decision Tree / Initial Question & Guided Options */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <HelpCircle className="w-4 h-4 text-emerald-600" />
                      <span>Bước 1: Khởi động & Câu hỏi định hướng lâm sàng</span>
                    </div>
                    
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 font-medium leading-relaxed">
                      {selectedFlowDetail.initialQuestion}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Các lựa chọn tương tác 1 chạm (Click để thử trực tiếp):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedFlowDetail.guidedOptions.map((opt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              onSelectFlow(selectedFlowDetail, opt);
                              onClose();
                            }}
                            className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs text-slate-800 hover:text-emerald-950 transition-all font-medium flex items-center justify-between group cursor-pointer"
                          >
                            <span className="line-clamp-2">{opt}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Branches Detail Preview */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Workflow className="w-4 h-4 text-purple-600" />
                      <span>Cây phân nhánh chi tiết ({selectedFlowDetail.branches.length} nhánh xử lý)</span>
                    </div>

                    <div className="space-y-2.5">
                      {selectedFlowDetail.branches.map((branch, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              <span>{branch.userChoice}</span>
                            </span>
                            {branch.autoEscalate && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-red-600" />
                                <span>Chuyển tiếp Kỹ sư 15p</span>
                              </span>
                            )}
                          </div>

                          <div className="p-2.5 bg-white rounded-lg border border-slate-200/60 whitespace-pre-line text-[11px] text-slate-700 leading-relaxed font-sans">
                            {branch.replyText}
                          </div>

                          {branch.safetyWarning && (
                            <div className="p-2 bg-red-50 text-red-900 border border-red-200 rounded-lg text-[10px] font-semibold flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
                              <span>{branch.safetyWarning}</span>
                            </div>
                          )}

                          {branch.nextOptions && branch.nextOptions.length > 0 && (
                            <div className="text-[10px] text-slate-500 pt-1">
                              <span className="font-semibold text-slate-700">Lựa chọn bước tiếp theo:</span>{' '}
                              {branch.nextOptions.join(' | ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                    <Workflow className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">
                    Chọn một kịch bản từ danh sách bên trái
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Xem cấu trúc phân nhánh, câu hỏi định hướng, lưu ý an toàn y sinh và nút thử nghiệm trực tiếp trong hội thoại.
                  </p>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Tab 2: Full plan.md Markdown Document Viewer */
          <div className="flex-1 min-h-0 flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
            
            {/* Doc Actions Toolbar */}
            <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between shrink-0 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>/plan.md (Markdown Source)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyDoc}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedDoc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDoc ? 'Đã sao chép!' : 'Sao chép Markdown'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadDoc}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải về .md</span>
                </button>
              </div>
            </div>

            {/* Markdown Text Area */}
            <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed bg-slate-950/90 whitespace-pre-wrap select-text">
              {isLoadingDoc ? (
                <div className="flex items-center justify-center h-48 text-slate-400">
                  <span>Đang tải nội dung plan.md từ máy chủ...</span>
                </div>
              ) : planMarkdown ? (
                planMarkdown
              ) : (
                <div className="text-slate-400 italic">
                  Không thể tải nội dung file plan.md. Vui lòng kiểm tra lại kết nối.
                </div>
              )}
            </div>

          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Đang chọn thiết bị: <strong className="text-slate-700 font-semibold">{selectedModel}</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
