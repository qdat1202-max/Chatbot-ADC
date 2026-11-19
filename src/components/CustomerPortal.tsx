import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Clock, 
  ShieldAlert, 
  RotateCcw, 
  Sparkles, 
  Phone, 
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Zap,
  ExternalLink,
  Tag,
  Megaphone,
  ShieldCheck,
  Pin,
  BookOpen,
  Check,
  Calendar,
  Info,
  Kanban,
  LayoutGrid,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Workflow,
  ArrowRight,
  Eye,
  Download,
  Paperclip
} from 'lucide-react';
import {
  EquipmentModel,
  SOPArticle,
  SupportTicket,
  SystemSettings,
  ChatMessage,
  NLPClassification,
  ADCBulletin,
  ChatMessageFeedback,
  EngineerProfile,
  AdvancedConversationFlow,
  ChatPdfCitation,
  ChatTicketMatch
} from '../types';
import { classifyMessageWithAI, localClassifyMessage } from '../utils/nlpClassifier';
import { saveChatSession } from '../utils/storage';
import { searchKnowledgeByKeywords, buildPdfCitationFromSOP } from '../utils/keywordSearch';
import { 
  getStoredLearnedKnowledge, 
  formatLearnedKnowledgeForPrompt, 
  findMatchingLearnedKnowledge, 
  recordFeedbackAndLearn 
} from '../utils/learningEngine';
import { 
  checkEmergencyKeywordMatch, 
  checkCustomerUnresolvedPhrase, 
  checkHighComplexity, 
  buildEscalationCard 
} from '../utils/escalationDetector';
import { 
  ADVANCED_CONVERSATION_FLOWS, 
  findMatchingConversationFlow, 
  findMatchingBranch 
} from '../data/advancedConversationFlows';
import { DirectSupportModal } from './DirectSupportModal';
import { QuickViewSOPModal } from './QuickViewSOPModal';
import { ChatEscalationCardView } from './ChatEscalationCardView';
import { ConversationFlowsModal } from './ConversationFlowsModal';
import { PdfViewerModal } from './PdfViewerModal';
import { formatFileSize, downloadPdfAttachment } from '../utils/pdfStorage';

interface CustomerPortalProps {
  sops: SOPArticle[];
  tickets: SupportTicket[];
  engineers?: EngineerProfile[];
  settings: SystemSettings;
  bulletins?: ADCBulletin[];
  onAddTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketCode' | 'createdAt' | 'status' | 'source'>) => SupportTicket;
  onUpdateSOPs?: (sops: SOPArticle[]) => void;
}

const EQUIPMENT_MODELS: { id: EquipmentModel; name: string; type: string; badge: string }[] = [
  { id: 'Zybio EXC200/220', name: 'Zybio EXC200/220', type: 'Sinh Hóa Tự Động', badge: 'Hóa sinh' },
  { id: 'Zybio Z3 CRP', name: 'Zybio Z3 CRP', type: 'Huyết Học 3TP + CRP', badge: 'Huyết học' },
  { id: 'Zybio Z50', name: 'Zybio Z50', type: 'Huyết Học 5TP Laser', badge: '5 thành phần' },
  { id: 'FS-205', name: 'FS-205', type: 'Miễn Dịch Huỳnh Quang', badge: 'Miễn dịch' }
];

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  sops,
  tickets,
  settings,
  bulletins = [],
  onAddTicket,
  onUpdateSOPs
}) => {
  const [selectedModel, setSelectedModel] = useState<EquipmentModel>('Zybio EXC200/220');
  const [activeTab, setActiveTab] = useState<'sop' | 'bulletin' | 'lookup' | 'create_ticket'>('bulletin');
  const [previousTab, setPreviousTab] = useState<'sop' | 'bulletin' | 'lookup'>('bulletin');
  
  // Bulletin Filter & Layout State
  const [bulletinLayout, setBulletinLayout] = useState<'kanban' | 'list'>('kanban');
  const [bulletinFilterModel, setBulletinFilterModel] = useState<string>('all');
  const [bulletinFilterCategory, setBulletinFilterCategory] = useState<string>('all');
  const [bulletinSearchText, setBulletinSearchText] = useState<string>('');
  const [viewingBulletin, setViewingBulletin] = useState<ADCBulletin | null>(null);
  
  // Floating AI Chatbot State (Bottom-Right Widget) - Bắt buộc mở sẵn để tập trung hỗ trợ qua Chatbox
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [sopSearchText, setSopSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedSOPId, setExpandedSOPId] = useState<string | null>(null);
  
  // Direct Support Ticket Page / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultModel, setModalDefaultModel] = useState<EquipmentModel | undefined>();
  const [modalDefaultError, setModalDefaultError] = useState<string | undefined>();
  const [modalDefaultIssue, setModalDefaultIssue] = useState<string | undefined>();
  
  // Quick View SOP Modal State (Instant display of linked content on div click)
  const [quickViewSOP, setQuickViewSOP] = useState<SOPArticle | null>(null);
  const [viewingPdfForSop, setViewingPdfForSop] = useState<SOPArticle | null>(null);

  // Ticket Search State
  const [searchTicketQuery, setSearchTicketQuery] = useState('');

  // Chat State & Advanced Conversation Flow State
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: settings?.chatbotWelcomeMessage || `Xin chào Quý khách! Tôi là Trợ Lý Kỹ Thuật AI ADC 24/7.
Rất hân hạnh được hỗ trợ Quý Bệnh viện & Phòng Khám.`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const feedbackTipBoxRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Chatbot Session & NLP Tracking Refs
  const sessionIdRef = useRef<string>(`SES-${Date.now().toString(36).toUpperCase()}`);
  const sessionStartedAtRef = useRef<string>(new Date().toISOString());
  const sessionQueriesRef = useRef<string[]>([]);
  const sessionLatenciesRef = useRef<number[]>([]);
  const lastClassificationRef = useRef<NLPClassification | null>(null);
  // Counter for consecutive unresolved SOP attempts (defaults to 2 before escalation)
  const unresolvedSopAttemptsRef = useRef<number>(0);

  // Keep chat open and smoothly scroll down as the conversation progresses
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const container = chatMessagesContainerRef.current;
    if (!container || !isChatOpen) return;
    const rafId = requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [messages, isLoading, isChatOpen]);

  // Filter common SOPs for the selected model
  const availableSOPsForModel = sops.filter(s => s.equipmentModel === selectedModel);

  // Instant local SOP matcher (Hỗ trợ toàn diện 16 ca thực chiến từ NEW-Nguyễn Quang Đạt.html / Sổ tay 2026-XLKT)
  const findMatchingSOP = (query: string): SOPArticle | undefined => {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return undefined;

    // Helper to test if a SOP matches the query
    const matchSOP = (s: SOPArticle): boolean => {
      const code = (s.errorCode || '').toLowerCase().trim();
      const titleLower = (s.title || '').toLowerCase();
      const symptomLower = (s.symptom || '').toLowerCase();
      const rootLower = (s.rootCause || '').toLowerCase();
      const locLower = (s.componentLocation || '').toLowerCase();

      // 1. Error code match (only if code has at least 2 chars, e.g. E101, H108, Z501, FS101)
      if (code && code.length >= 2 && (cleanQuery.includes(code) || (cleanQuery.length >= 3 && code.includes(cleanQuery)))) {
        return true;
      }

      // 2. Direct title / keyword matching (avoid short substring false positives)
      if ((titleLower.length >= 6 && cleanQuery.includes(titleLower)) || (cleanQuery.length >= 10 && titleLower.includes(cleanQuery))) {
        return true;
      }

      // 3. Domain keywords from NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT)
      if (
        (cleanQuery.includes('van pinch') || cleanQuery.includes('pinch') || cleanQuery.includes('h108') || cleanQuery.includes('bẹp ống')) &&
        (titleLower.includes('pinch') || s.id === 'SOP-Z3-005')
      ) return true;

      if (
        (cleanQuery.includes('syringe') || cleanQuery.includes('hamilton') || cleanQuery.includes('rò rỉ bơm') || cleanQuery.includes('piston teflon')) &&
        (titleLower.includes('syringe') || s.id === 'SOP-EXC-005')
      ) return true;

      if (
        (cleanQuery.includes('cảm ứng') || cleanQuery.includes('touch calibration') || cleanQuery.includes('trôi điểm chạm') || cleanQuery.includes('lệch điểm')) &&
        (titleLower.includes('cảm ứng') || s.id === 'SOP-FS-003')
      ) return true;

      if (
        (cleanQuery.includes('lis') || cleanQuery.includes('his') || cleanQuery.includes('astm') || cleanQuery.includes('hl7') || cleanQuery.includes('rj45') || cleanQuery.includes('mất mạng')) &&
        (titleLower.includes('lis') || s.id === 'SOP-Z3-006')
      ) return true;

      if (
        (cleanQuery.includes('ntc') || cleanQuery.includes('buồng lyse') || (cleanQuery.includes('cảm biến nhiệt') && cleanQuery.includes('z50'))) &&
        (titleLower.includes('ntc') || s.id === 'SOP-Z50-004')
      ) return true;

      if (
        (cleanQuery.includes('đâm nắp') || cleanQuery.includes('kẹt trục z') || cleanQuery.includes('ray trượt bi')) &&
        (titleLower.includes('đâm xuyên nắp') || s.id === 'SOP-Z50-003')
      ) return true;

      if (
        (cleanQuery.includes('đèn halogen') || cleanQuery.includes('e310') || cleanQuery.includes('bóng halogen') || cleanQuery.includes('đo quang')) &&
        (titleLower.includes('halogen') || code === 'e310')
      ) return true;

      if (
        (cleanQuery.includes('laser') || cleanQuery.includes('z501') || cleanQuery.includes('tán xạ 3d')) &&
        (titleLower.includes('laser') || code === 'z501')
      ) return true;

      if (
        (cleanQuery.includes('bơm chân không') || cleanQuery.includes('z508') || cleanQuery.includes('áp suất yếu')) &&
        (titleLower.includes('chân không') || code === 'z508')
      ) return true;

      if (
        (cleanQuery.includes('tràn nước') || cleanQuery.includes('e205') || cleanQuery.includes('trạm rửa')) &&
        (titleLower.includes('trạm rửa') || code === 'e205')
      ) return true;

      if (
        (cleanQuery.includes('nhiệt độ') || cleanQuery.includes('e104') || cleanQuery.includes('37°c') || cleanQuery.includes('buồng ủ')) &&
        (titleLower.includes('37°c') || code === 'e104')
      ) return true;

      if (
        (cleanQuery.includes('clot') || cleanQuery.includes('máu đông') || cleanQuery.includes('h408')) &&
        (titleLower.includes('máu đông') || code === 'h408')
      ) return true;

      if (
        (cleanQuery.includes('buồng đếm') || cleanQuery.includes('h101') || cleanQuery.includes('wbc clog')) &&
        (titleLower.includes('buồng đếm') || code === 'h101')
      ) return true;

      if (
        (cleanQuery.includes('crp') || cleanQuery.includes('h305') || cleanQuery.includes('crp ***')) &&
        (titleLower.includes('crp') || code === 'h305')
      ) return true;

      if (
        (cleanQuery.includes('kẹt khay') || cleanQuery.includes('fs101') || cleanQuery.includes('cassette')) &&
        (titleLower.includes('cassette') || code === 'fs101')
      ) return true;

      return false;
    };

    // First search in selected model's available SOPs
    const matchedInModel = availableSOPsForModel.find(matchSOP);
    if (matchedInModel) return matchedInModel;

    // Cross-model fallback: search across all SOPs in case user asked about another machine
    const matchedGlobal = sops.find(matchSOP);
    if (matchedGlobal) return matchedGlobal;

    // Smart keyword search fallback ONLY for strong matches
    const kwResult = searchKnowledgeByKeywords(query, selectedModel, sops, tickets);
    return (kwResult.matchedSOPs[0]?.score || 0) >= 28 ? kwResult.bestSOP : undefined;
  };

  const handleSelectModel = (eq: typeof EQUIPMENT_MODELS[number]) => {
    setSelectedModel(eq.id);
    setIsChatOpen(true);
    unresolvedSopAttemptsRef.current = 0;

    const userTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: `Tôi cần hỗ trợ kỹ thuật về máy ${eq.name}`,
      timestamp: userTime
    };

    const sampleCodes: Record<EquipmentModel, string> = {
      'Zybio EXC200/220': 'E101, E205, E104',
      'Zybio Z3 CRP': 'H101, H202, H305',
      'Zybio Z50': 'Z501, Z502, Z503',
      'FS-205': 'FS101, FS102'
    };

    const botReply: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: 'bot',
      text: `Dạ, tôi đã chọn dòng máy ${eq.name} (${eq.type}).\n\nQuý khách vui lòng nhập mã lỗi (ví dụ: ${sampleCodes[eq.id]}) hoặc mô tả hiện tượng đang gặp phải để tôi hỗ trợ xử lý ngay!`,
      timestamp: userTime,
      responseTimeMs: 25
    };

    setMessages(prev => [...prev, userMsg, botReply]);
  };

  // Continuous Learning & Feedback State
  const [activeFeedbackTipMsgId, setActiveFeedbackTipMsgId] = useState<string | null>(null);
  const [feedbackTipInput, setFeedbackTipInput] = useState<string>('');
  const [feedbackBannerText, setFeedbackBannerText] = useState<string | null>(null);

  useEffect(() => {
    if (!activeFeedbackTipMsgId) return;
    const rafId = requestAnimationFrame(() => {
      feedbackTipBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    return () => cancelAnimationFrame(rafId);
  }, [activeFeedbackTipMsgId]);

  // Trigger: unhelpful_feedback
  // Khi người dùng nhấn nút "Chưa hiệu quả" ở đánh giá câu trả lời, chatbot lập tức đưa thẻ đề xuất tạo phiếu tự động
  // Form yêu cầu gọi lại tự động tạo phiếu điều phối ưu tiên cao (TICK-xxxx) và cam kết phản hồi trong vòng 15 phút.
  const handleFeedback = (messageId: string, rating: 'helpful' | 'unhelpful', userTip?: string) => {
    const feedback: ChatMessageFeedback = {
      messageId,
      rating,
      userTip: userTip?.trim() || undefined,
      userCorrection: userTip?.trim() || undefined,
      submittedAt: new Date().toISOString(),
      feedbackAt: new Date().toISOString()
    };

    setIsChatOpen(true);
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback } : m));

    const targetMsg = messages.find(m => m.id === messageId);
    const lastUserQuery = [...messages].reverse().find(m => m.sender === 'user')?.text || '';

    recordFeedbackAndLearn({
      feedback,
      equipmentModel: selectedModel,
      botResponseText: targetMsg?.text || '',
      userQuery: lastUserQuery,
      matchedSOPCode: targetMsg?.matchedSOP?.errorCode
    });

    if (userTip?.trim()) {
      setFeedbackBannerText('💡 Đã tiếp thu kinh nghiệm xử lý thực tế vào kho tri thức tự học của Chatbot ADC!');
    } else if (rating === 'helpful') {
      setFeedbackBannerText('✓ Cảm ơn đánh giá! Hệ thống đã ghi nhận phản hồi hữu ích.');
    } else {
      // unhelpful_feedback -> gợi ý "Cần kỹ sư ADC hỗ trợ trực tiếp"
      setFeedbackBannerText('Đã ghi nhận phản hồi chưa hiệu quả! Chatbot đã hiển thị gợi ý kết nối Kỹ sư ADC.');

      const suggestionMessage: ChatMessage = {
        id: `bot-unhelpful-${Date.now()}`,
        sender: 'bot',
        text: `Rất tiếc hướng dẫn trên chưa xử lý triệt để được sự cố trên máy ${selectedModel}. Quý khách vui lòng chọn gợi ý bên dưới để Kỹ sư ADC hỗ trợ trực tiếp ngay!`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        classification: targetMsg?.classification || (targetMsg?.matchedSOP?.errorCode ? {
          equipmentModel: selectedModel,
          issueNature: 'hardware',
          natureLabel: 'Cần hỗ trợ kỹ thuật',
          faultCode: targetMsg.matchedSOP.errorCode,
          confidence: 1,
          keywordsDetected: [targetMsg.matchedSOP.errorCode]
        } : undefined),
        guidedQuestion: 'Gợi ý tiếp theo:',
        suggestedOptions: ['Cần kỹ sư ADC hỗ trợ trực tiếp'],
        responseTimeMs: 20
      };

      setMessages(prev => [...prev, suggestionMessage]);
    }

    setActiveFeedbackTipMsgId(null);
    setFeedbackTipInput('');
    setTimeout(() => setFeedbackBannerText(null), 4000);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    setIsChatOpen(true);

    const userTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: userTime
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMessage('');

    // =========================================================================
    // 1. TRIGGER 1: SỰ CỐ PHẦN CỨNG KHẨN CẤP (keyword_match)
    // Phát hiện các từ khóa nghiêm trọng và an toàn y sinh ("cháy", "nổ", "rò điện", "mùi khét", "vỡ cuvette", "hỏng bo mạch", "tràn hóa chất").
    // Hệ thống ngắt hỏi đáp thông thường, phát cảnh báo an toàn và kích hoạt Tạo phiếu tự động:
    // Form yêu cầu gọi lại tự động tạo phiếu điều phối ưu tiên cao (TICK-xxxx) và cam kết phản hồi trong vòng 15 phút.
    // =========================================================================
    const emergencyCheck = checkEmergencyKeywordMatch(textToSend);
    if (emergencyCheck.isEmergency) {
      unresolvedSopAttemptsRef.current = 0;
      const emergencyCard = buildEscalationCard('keyword_match', selectedModel, textToSend, {
        safetyAlerts: emergencyCheck.safetyAlerts
      });

      const emergencyReply: ChatMessage = {
        id: `bot-emergency-${Date.now()}`,
        sender: 'bot',
        text: `🚨 CẢNH BÁO AN TOÀN Y SINH & SỰ CỐ PHẦN CỨNG NGHIÊM TRỌNG!
Hệ thống phát hiện từ khóa nguy hiểm ("${emergencyCheck.matchedKeywords.join(', ')}") trên thiết bị ${selectedModel}.
Hệ thống ngắt hỏi đáp thông thường ngay lập tức để bảo vệ an toàn cho kỹ thuật viên và ngăn ngừa hư hỏng toàn bộ thiết bị.

Vui lòng tuân thủ ngay các bước an toàn y sinh bên dưới và xác nhận Form yêu cầu gọi lại: Kỹ sư ADC cam kết phản hồi trong vòng 15 phút!`,
        timestamp: userTime,
        escalationCard: emergencyCard,
        responseTimeMs: 15
      };

      setMessages(prev => [...prev, emergencyReply]);
      return;
    }

    // =========================================================================
    // 2. TRIGGER 2: KHÁCH HÀNG PHẢN HỒI KHÔNG KHẮC PHỤC ĐƯỢC (bot_unresolved condition B)
    // Khách hàng phản hồi không khắc phục được sau khi thử các bước hướng dẫn
    // =========================================================================
    const isCustomerUnresolved = checkCustomerUnresolvedPhrase(textToSend);
    if (isCustomerUnresolved) {
      const unresolvedCard = buildEscalationCard('bot_unresolved', selectedModel, textToSend);
      const botReply: ChatMessage = {
        id: `bot-unresolved-${Date.now()}`,
        sender: 'bot',
        text: `⚠️ GHI NHẬN SỰ CỐ CHƯA ĐƯỢC KHẮC PHỤC SAU KHI THỬ CÁC BƯỚC HƯỚNG DẪN.
Để không làm gián đoạn ca chạy mẫu bệnh viện, Chatbot ADC dừng quy trình hỏi đáp thử sai và kích hoạt điều phối kỹ sư ưu tiên cao. Kỹ sư ADC cam kết gọi điện phản hồi trong vòng 15 phút!`,
        timestamp: userTime,
        escalationCard: unresolvedCard,
        responseTimeMs: 20
      };
      setMessages(prev => [...prev, botReply]);
      return;
    }

    // 3. Run comprehensive keyword search across SOPs, attached PDFs, and Support Tickets
    const kwSearch = searchKnowledgeByKeywords(textToSend, selectedModel, sops, tickets);
    const matchedSOP = findMatchingSOP(textToSend) || kwSearch.bestSOP;

    // =========================================================================
    // 3. TRIGGER 3: MỨC ĐỘ PHỨC TẠP CAO (high_complexity)
    // Tự động chuyển tiếp khi mô tả của khách hàng dài, chứa nhiều triệu chứng kết hợp mà không khớp một quy trình SOP đơn lẻ.
    // =========================================================================
    const complexityCheck = checkHighComplexity(textToSend, matchedSOP, availableSOPsForModel);
    if (complexityCheck.isHighComplexity) {
      const complexityCard = buildEscalationCard('high_complexity', selectedModel, textToSend, {
        errorCode: matchedSOP?.errorCode
      });

      const botReply: ChatMessage = {
        id: `bot-complex-${Date.now()}`,
        sender: 'bot',
        text: `⚡ PHÁT HIỆN SỰ CỐ ĐA TRIỆU CHỨNG PHỨC TẠP CAO!
Mô tả sự cố chứa nhiều nhóm triệu chứng kỹ thuật kết hợp (${complexityCheck.detectedSymptomGroups.join(' + ')}), không thuộc một quy trình SOP đơn lẻ.
Để tránh thao tác can thiệp thử sai gây hư hỏng lan sang các cụm linh kiện khác, hệ thống tự động kích hoạt điều phối Kỹ sư chuyên sâu ADC với cam kết gọi lại trong vòng 15 phút.`,
        timestamp: userTime,
        escalationCard: complexityCard,
        responseTimeMs: 30
      };
      setMessages(prev => [...prev, botReply]);
      return;
    }

    // =========================================================================
    // 4. TRIGGER 4: CHATBOT KHÔNG TÌM THẤY SOP SAU SỐ LẦN CẤU HÌNH (bot_unresolved condition A)
    // Bỏ qua bộ đếm khi người dùng đang tìm kiếm từ khóa PDF / tra cứu yêu cầu / hỏi đáp chung
    // =========================================================================
    const hasSearchMatches =
      Boolean(matchedSOP) ||
      kwSearch.citedPdfs.length > 0 ||
      kwSearch.matchedTickets.length > 0 ||
      kwSearch.isPdfIntent ||
      kwSearch.isTicketLookupIntent;

    const maxAttempts = settings?.maxUnresolvedAttemptsBeforeEscalate || 2;
    if (!hasSearchMatches) {
      unresolvedSopAttemptsRef.current += 1;
      if (unresolvedSopAttemptsRef.current >= maxAttempts) {
        unresolvedSopAttemptsRef.current = 0; // reset
        const botFailCard = buildEscalationCard('bot_unresolved', selectedModel, textToSend, {
          unresolvedCount: maxAttempts
        });

        const botReply: ChatMessage = {
          id: `bot-fail-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ CHATBOT KHÔNG TÌM THẤY QUY TRÌNH SOP PHÙ HỢP SAU ${maxAttempts} LẦN LIÊN TIẾP!
Sự cố của máy ${selectedModel} cần được kiểm tra trực tiếp. Hệ thống tự động kích hoạt tạo phiếu điều phối ưu tiên cao và cam kết Kỹ sư ADC phản hồi trong vòng 15 phút.`,
          timestamp: userTime,
          escalationCard: botFailCard,
          responseTimeMs: 25
        };
        setMessages(prev => [...prev, botReply]);
        return;
      }
    } else {
      unresolvedSopAttemptsRef.current = 0;
    }

    // =========================================================================
    // 5. ADVANCED CONVERSATION FLOW ENGINE (Skip when user explicitly searches PDFs or Tickets)
    // =========================================================================
    if (!kwSearch.isPdfIntent && !kwSearch.isTicketLookupIntent) {
      let matchedBranch: ReturnType<typeof findMatchingBranch> = null;
      let currentFlow = activeFlowId ? ADVANCED_CONVERSATION_FLOWS.find(f => f.id === activeFlowId) : null;
      if (currentFlow) {
        matchedBranch = findMatchingBranch(currentFlow, textToSend);
      }

      const matchedFlow = findMatchingConversationFlow(textToSend, selectedModel);
      if (!matchedBranch && matchedFlow) {
        currentFlow = matchedFlow;
        setActiveFlowId(matchedFlow.id);
        matchedBranch = findMatchingBranch(matchedFlow, textToSend);
      }

      if (matchedBranch && currentFlow) {
        if (matchedBranch.autoEscalate) {
          const escalationCard = buildEscalationCard(
            matchedBranch.escalationReason || 'direct_request',
            selectedModel,
            textToSend,
            { errorCode: currentFlow.triggerErrorCodes?.[0] }
          );
          const botReply: ChatMessage = {
            id: `bot-branch-esc-${Date.now()}`,
            sender: 'bot',
            text: matchedBranch.replyText,
            timestamp: userTime,
            escalationCard: escalationCard,
            guidedQuestion: matchedBranch.nextQuestion,
            suggestedOptions: matchedBranch.nextOptions,
            flowId: currentFlow.id,
            flowCategory: currentFlow.category,
            responseTimeMs: 15
          };
          setMessages(prev => [...prev, botReply]);
          return;
        }

        const botReply: ChatMessage = {
          id: `bot-branch-${Date.now()}`,
          sender: 'bot',
          text: matchedBranch.replyText,
          timestamp: userTime,
          guidedQuestion: matchedBranch.nextQuestion || 'Quý khách muốn thực hiện bước tiếp theo nào?',
          suggestedOptions: matchedBranch.nextOptions || currentFlow.guidedOptions,
          flowId: currentFlow.id,
          flowCategory: currentFlow.category,
          responseTimeMs: 20
        };
        setMessages(prev => [...prev, botReply]);
        return;
      } else if (matchedFlow && !matchedBranch) {
        setActiveFlowId(matchedFlow.id);
        const botReply: ChatMessage = {
          id: `bot-flow-init-${Date.now()}`,
          sender: 'bot',
          text: `[${matchedFlow.categoryLabel}] ${matchedFlow.title}\n\n${matchedFlow.summary}`,
          timestamp: userTime,
          guidedQuestion: matchedFlow.initialQuestion,
          suggestedOptions: matchedFlow.guidedOptions,
          flowId: matchedFlow.id,
          flowCategory: matchedFlow.category,
          responseTimeMs: 18
        };
        setMessages(prev => [...prev, botReply]);
        return;
      }
    }

    // Helper to merge Gemini citedSopIds + keyword search citedPdfs
    // Chỉ đính kèm danh sách tài liệu PDF khi người dùng chủ động yêu cầu tìm tài liệu PDF,
    // tránh đưa thêm tài liệu khác khi đang tập trung xử lý lỗi.
    const buildFinalPdfCitations = (citedIds: string[] = []): ChatPdfCitation[] => {
      if (!kwSearch.isPdfIntent) {
        return [];
      }

      const result: ChatPdfCitation[] = [];
      const seen = new Set<string>();

      const pushSop = (sop: SOPArticle, keywords: string[]) => {
        if (seen.has(sop.id)) return;
        const c = buildPdfCitationFromSOP(sop, keywords);
        if (c) {
          seen.add(sop.id);
          result.push(c);
        }
      };

      // 1. Prioritize SOPs explicitly cited by Gemini
      for (const id of citedIds) {
        const found = sops.find(s => s.id === id);
        if (found) pushSop(found, kwSearch.keywords);
      }

      // 2. Include matchedSOP if it has a PDF/sourceFile
      if (matchedSOP) {
        pushSop(matchedSOP, kwSearch.keywords);
      }

      // 3. Merge local keyword-matched PDFs
      for (const c of kwSearch.citedPdfs) {
        if (result.length >= 4) break;
        if (!seen.has(c.sopId)) {
          seen.add(c.sopId);
          result.push(c);
        }
      }

      return result.slice(0, 4);
    };

    const buildFinalTicketMatches = (citedCodes: string[] = []): ChatTicketMatch[] => {
      if (!kwSearch.isTicketLookupIntent) {
        return [];
      }
      const result: ChatTicketMatch[] = [];
      const seen = new Set<string>();
      for (const code of citedCodes) {
        const found = tickets.find(t => t.ticketCode.toLowerCase() === code.toLowerCase());
        if (found && !seen.has(found.id)) {
          seen.add(found.id);
          result.push({
            id: found.id,
            ticketCode: found.ticketCode,
            hospitalClinic: found.hospitalClinic,
            equipmentModel: found.equipmentModel,
            errorCode: found.errorCode,
            issueDescription: found.issueDescription,
            status: found.status,
            priority: found.priority,
            assignedEngineerName: found.assignedEngineerName,
            createdAt: found.createdAt
          });
        }
      }
      for (const m of kwSearch.matchedTickets) {
        if (result.length >= 4) break;
        if (!seen.has(m.id)) {
          seen.add(m.id);
          result.push(m);
        }
      }
      return result.slice(0, 4);
    };

    // =========================================================================
    // Normal Conversational / Gemini Keyword Search & PDF Citation Path
    // =========================================================================
    setIsLoading(true);
    const startTime = performance.now();

    // Fetch learned field knowledge from continuous learning storage
    const learnedKnowledgeList = getStoredLearnedKnowledge();
    const learnedContextStr = formatLearnedKnowledgeForPrompt(learnedKnowledgeList, selectedModel);
    const matchedLearned = findMatchingLearnedKnowledge(textToSend, selectedModel, learnedKnowledgeList);

    // Start NLP classification in parallel
    const classificationPromise = classifyMessageWithAI(textToSend, selectedModel);

    // Only pass strictly relevant SOP(s) matching the customer's question (never dump unrelated SOPs)
    const prioritizedSopMap = new Map<string, SOPArticle>();
    if (matchedSOP) {
      prioritizedSopMap.set(matchedSOP.id, matchedSOP);
    }
    kwSearch.matchedSOPs
      .filter(h => h.score >= 28 || kwSearch.isPdfIntent)
      .slice(0, kwSearch.isPdfIntent ? 5 : 2)
      .forEach(h => prioritizedSopMap.set(h.sop.id, h.sop));
    if (kwSearch.isPdfIntent) {
      sops.filter(s => Boolean(s.pdfAttachment) && s.equipmentModel === selectedModel).forEach(s => {
        if (!prioritizedSopMap.has(s.id)) prioritizedSopMap.set(s.id, s);
      });
    }

    const sopsPayload = Array.from(prioritizedSopMap.values())
      .slice(0, kwSearch.isPdfIntent ? 6 : 3)
      .map(s => ({
        id: s.id,
        equipmentModel: s.equipmentModel,
        category: s.category,
        errorCode: s.errorCode,
        title: s.title,
        symptom: s.symptom,
        rootCause: s.rootCause,
        resolutionSteps: s.resolutionSteps,
        safetyWarnings: s.safetyWarnings,
        sourceFile: s.sourceFile,
        hasPdfAttachment: Boolean(s.pdfAttachment),
        pdfFileName: s.pdfAttachment?.fileName || s.sourceFile || ''
      }));

    // Call server proxy /api/chat focused strictly on customer question with 1-minute (60s) timeout
    const CHAT_RESPONSE_TIMEOUT_MS = 60_000;
    const controller = new AbortController();
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, CHAT_RESPONSE_TIMEOUT_MS);

    const resolveClassificationSafely = async (): Promise<NLPClassification> => {
      try {
        return await Promise.race([
          classificationPromise,
          new Promise<NLPClassification>(resolve =>
            setTimeout(() => resolve(localClassifyMessage(textToSend, selectedModel)), 2500)
          )
        ]);
      } catch {
        return localClassifyMessage(textToSend, selectedModel);
      }
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: textToSend,
          equipmentModel: selectedModel,
          history: messages.map(m => ({ sender: m.sender, text: m.text })),
          sopsContext: sopsPayload,
          ticketsContext: kwSearch.isTicketLookupIntent ? kwSearch.matchedTickets : [],
          searchKeywords: kwSearch.keywords,
          learnedKnowledgeContext: learnedContextStr,
          isPdfIntent: kwSearch.isPdfIntent,
          isTicketLookupIntent: kwSearch.isTicketLookupIntent
        })
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);
      const isSlowResponse = didTimeout || latencyMs > CHAT_RESPONSE_TIMEOUT_MS;
      const classification = await resolveClassificationSafely();

      sessionQueriesRef.current.push(textToSend);
      sessionLatenciesRef.current.push(latencyMs);
      lastClassificationRef.current = classification;

      const isResolved = !!matchedSOP || kwSearch.citedPdfs.length > 0 || kwSearch.matchedTickets.length > 0;
      const avgLatency = Math.round(
        sessionLatenciesRef.current.reduce((a, b) => a + b, 0) / sessionLatenciesRef.current.length
      );

      // Save/update session record
      saveChatSession({
        id: sessionIdRef.current,
        startedAt: sessionStartedAtRef.current,
        lastActivityAt: new Date().toISOString(),
        equipmentModel: selectedModel,
        messageCount: sessionQueriesRef.current.length,
        avgResponseTimeMs: avgLatency,
        isResolvedByBot: isResolved,
        escalatedToEngineer: false,
        classification: classification,
        userQuerySnippets: [...sessionQueriesRef.current],
        matchedSOPId: matchedSOP?.id,
        matchedSOPCode: matchedSOP?.errorCode
      });

      if (response.ok) {
        const data = await response.json();
        const finalCitations = buildFinalPdfCitations(data.citedSopIds || []);
        const finalTickets = buildFinalTicketMatches(data.citedTicketCodes || []);
        const finalKeywords: string[] = Array.from(
          new Set([
            ...(Array.isArray(data.extractedKeywords) ? data.extractedKeywords : []),
            ...kwSearch.keywords
          ])
        ).slice(0, 6);

        const sanitizeChatText = (raw: string): string => {
          if (!raw) return raw;
          return raw
            .replace(/^\[Trích xuất Sổ tay 2026-XLKT[^\]]*\]\s*/gim, '')
            .replace(/^•\s*(Đơn vị áp dụng|Bệnh viện|Phòng khám|Số Serial|SN|Ngày sửa|Kỹ sư thực hiện):[^\n]*\n?/gim, '')
            .replace(/\s*\((?:Sổ tay\s*)?2026-XLKT-[A-Z0-9-]+\)/gi, '')
            .replace(/\[2026-XLKT-[A-Z0-9-]+\]\s*/gi, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        };

        const suggestedPdfSop: SOPArticle | undefined =
          finalCitations.length === 0
            ? matchedSOP?.pdfAttachment
              ? matchedSOP
              : matchedSOP?.errorCode
              ? sops.find(
                  s =>
                    Boolean(s.pdfAttachment) &&
                    s.errorCode?.trim().toLowerCase() === matchedSOP.errorCode.trim().toLowerCase() &&
                    s.equipmentModel === matchedSOP.equipmentModel
                )
              : kwSearch.matchedSOPs.find(h => h.score >= 45 && Boolean(h.sop.pdfAttachment))?.sop
            : undefined;

        const filteredSuggestedOptions = Array.isArray(data.suggestedOptions)
          ? data.suggestedOptions.filter((opt: string) => {
              const lower = (opt || '').toLowerCase();
              return !lower.includes('hỗ trợ trực tiếp') && !lower.includes('tận viện') && !lower.includes('gặp kỹ sư');
            })
          : undefined;

        const hasCitedSopFromServer =
          Array.isArray(data.citedSopIds) &&
          data.citedSopIds.some((id: string) => sops.some(s => s.id === id));
        const hasSopKeywordMatch =
          Boolean(matchedSOP) ||
          kwSearch.matchedSOPs.length > 0 ||
          finalCitations.length > 0 ||
          hasCitedSopFromServer;
        const noSopKeywordFound = !hasSopKeywordMatch && finalTickets.length === 0;
        const shouldSuggestTicket = isSlowResponse || noSopKeywordFound;

        const botReply: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: sanitizeChatText(data.reply),
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          matchedSOP: suggestedPdfSop,
          citedPdfs: finalCitations.length > 0 ? finalCitations : undefined,
          matchedTickets: finalTickets.length > 0 ? finalTickets : undefined,
          searchKeywordsUsed: finalKeywords.length > 0 ? finalKeywords : undefined,
          aiSource: data.source,
          suggestDirectSupport: shouldSuggestTicket,
          suggestTicketReason: isSlowResponse
            ? 'timeout'
            : noSopKeywordFound
            ? 'sop_not_found'
            : undefined,
          suggestedIssueText: textToSend,
          classification: classification,
          responseTimeMs: latencyMs,
          guidedQuestion: filteredSuggestedOptions && filteredSuggestedOptions.length > 0 ? data.guidedQuestion : undefined,
          suggestedOptions: filteredSuggestedOptions && filteredSuggestedOptions.length > 0 ? filteredSuggestedOptions : undefined
        };
        setMessages(prev => [...prev, botReply]);
      } else {
        throw new Error('Server response error');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      // Local Fallback if server call fails or exceeds 1-minute timeout
      const latencyMs = Math.round(performance.now() - startTime);
      const isTimeoutAbort =
        didTimeout ||
        (err instanceof DOMException && err.name === 'AbortError') ||
        latencyMs > CHAT_RESPONSE_TIMEOUT_MS;
      const classification = await resolveClassificationSafely();

      sessionQueriesRef.current.push(textToSend);
      sessionLatenciesRef.current.push(latencyMs);
      lastClassificationRef.current = classification;

      const avgLatency = Math.round(
        sessionLatenciesRef.current.reduce((a, b) => a + b, 0) / sessionLatenciesRef.current.length
      );

      saveChatSession({
        id: sessionIdRef.current,
        startedAt: sessionStartedAtRef.current,
        lastActivityAt: new Date().toISOString(),
        equipmentModel: selectedModel,
        messageCount: sessionQueriesRef.current.length,
        avgResponseTimeMs: avgLatency,
        isResolvedByBot: !isTimeoutAbort && (!!matchedSOP || !!matchedLearned || kwSearch.citedPdfs.length > 0),
        escalatedToEngineer: false,
        classification: classification,
        userQuerySnippets: [...sessionQueriesRef.current],
        matchedSOPId: matchedSOP?.id,
        matchedSOPCode: matchedSOP?.errorCode
      });

      const finalCitations = buildFinalPdfCitations();
      const finalTickets = buildFinalTicketMatches();
      const hasSopKeywordMatch =
        Boolean(matchedSOP) ||
        kwSearch.matchedSOPs.length > 0 ||
        finalCitations.length > 0;
      const noSopKeywordFound = !hasSopKeywordMatch && finalTickets.length === 0;
      const shouldSuggestTicket = isTimeoutAbort || noSopKeywordFound;

      let fallbackText = '';
      const fallbackOptions = [
        'Kiểm tra lại hiện tượng trên máy',
        'Đã thực hiện nhưng vẫn còn lỗi'
      ];
      if (isTimeoutAbort) {
        fallbackText = `⏱️ Thời gian chờ phản hồi đã vượt quá 1 phút (trên 60 giây) cho yêu cầu về máy ${selectedModel}: "${textToSend}".\n\nĐể không làm gián đoạn công việc tại phòng xét nghiệm, Quý khách vui lòng nhấn nút "Tạo phiếu yêu cầu hỗ trợ kỹ thuật" bên dưới để Kỹ sư ADC tiếp nhận và xử lý ngay.`;
      } else if (finalTickets.length > 0) {
        fallbackText = `Tìm thấy ${finalTickets.length} phiếu yêu cầu hỗ trợ khớp từ khóa "${kwSearch.keywords.join(', ') || textToSend}". Quý khách có thể xem chi tiết hoặc tra cứu tiến độ xử lý bên dưới:`;
      } else if (matchedSOP) {
        const stepsText = matchedSOP.resolutionSteps
          .map((step, i) => `${i + 1}. ${step.replace(/^Bước \d+:\s*/i, '')}`)
          .join('\n');
        fallbackText = matchedSOP.errorCode && matchedSOP.errorCode.trim() !== ''
          ? `[${matchedSOP.errorCode}] ${matchedSOP.title}\n\n• Nguyên nhân: ${matchedSOP.rootCause}\n• Các bước xử lý:\n${stepsText}`
          : `${matchedSOP.title}\n\n• Nguyên nhân: ${matchedSOP.rootCause}\n• Các bước xử lý:\n${stepsText}`;
      } else if (finalCitations.length > 0) {
        fallbackText = `Đã tìm thấy ${finalCitations.length} tài liệu PDF phù hợp với từ khóa "${kwSearch.keywords.join(', ') || textToSend}". Quý khách có thể nhấn "Xem PDF" để mở trực tiếp:`;
      } else if (matchedLearned) {
        const solutionText = matchedLearned.solutionSteps?.join('\n') || matchedLearned.learnedSolution || 'Kiểm tra và xử lý theo khuyến cáo';
        const safetyText = matchedLearned.safetyNotes?.join('; ') || matchedLearned.preventionTip || 'Đeo găng tay y tế bảo hộ';
        fallbackText = `Kinh nghiệm xử lý thực tế (${matchedLearned.title}):\n\n• Hiện tượng: ${matchedLearned.symptomSummary || matchedLearned.symptomPattern}\n• Nguyên nhân: ${matchedLearned.rootCauseAnalysis || 'Đúc kết từ thực tế'}\n• Hướng dẫn khắc phục:\n${solutionText}\n\n(Lưu ý an toàn: ${safetyText})`;
      } else {
        fallbackText = `Không tìm thấy từ khóa phù hợp trong kho SOP cho mô tả trên máy ${selectedModel}: "${textToSend}".\n\nQuý khách vui lòng mô tả chi tiết hơn mã lỗi hoặc hiện tượng đang gặp; hoặc nhấn "Tạo phiếu yêu cầu hỗ trợ kỹ thuật" bên dưới để Kỹ sư ADC hỗ trợ ngay.`;
      }

      const fallbackSuggestedPdfSop: SOPArticle | undefined =
        finalCitations.length === 0
          ? matchedSOP?.pdfAttachment
            ? matchedSOP
            : matchedSOP?.errorCode
            ? sops.find(
                s =>
                  Boolean(s.pdfAttachment) &&
                  s.errorCode?.trim().toLowerCase() === matchedSOP.errorCode.trim().toLowerCase() &&
                  s.equipmentModel === matchedSOP.equipmentModel
              )
            : kwSearch.matchedSOPs.find(h => h.score >= 45 && Boolean(h.sop.pdfAttachment))?.sop
          : undefined;

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        matchedSOP: fallbackSuggestedPdfSop,
        citedPdfs: finalCitations.length > 0 ? finalCitations : undefined,
        matchedTickets: finalTickets.length > 0 ? finalTickets : undefined,
        searchKeywordsUsed: kwSearch.keywords.length > 0 ? kwSearch.keywords : undefined,
        suggestDirectSupport: shouldSuggestTicket,
        suggestTicketReason: isTimeoutAbort
          ? 'timeout'
          : noSopKeywordFound
          ? 'sop_not_found'
          : undefined,
        suggestedIssueText: textToSend,
        classification: classification,
        responseTimeMs: latencyMs,
        guidedQuestion: 'Quý khách muốn thực hiện bước tiếp theo nào?',
        suggestedOptions: fallbackOptions
      };
      setMessages(prev => [...prev, botReply]);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleOpenDirectSupport = (errorCode?: string, issueDesc?: string, modelOverride?: EquipmentModel) => {
    const validModels: EquipmentModel[] = ['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'];
    const targetModel = modelOverride && validModels.includes(modelOverride) ? modelOverride : selectedModel;
    setModalDefaultModel(targetModel);
    setModalDefaultError(errorCode);
    setModalDefaultIssue(issueDesc || `Sự cố trên máy ${targetModel}`);
    setQuickViewSOP(null);
    setViewingBulletin(null);
    setIsModalOpen(false);
    setIsChatOpen(false);
    if (activeTab !== 'create_ticket') {
      setPreviousTab(activeTab);
    }
    setActiveTab('create_ticket');
  };

  const handleTicketSubmitted = (ticketData: Omit<SupportTicket, 'id' | 'ticketCode' | 'createdAt' | 'status' | 'source'>) => {
    const created = onAddTicket(ticketData);

    // Update current session: escalated to engineer
    const avgLatency = sessionLatenciesRef.current.length > 0
      ? Math.round(sessionLatenciesRef.current.reduce((a, b) => a + b, 0) / sessionLatenciesRef.current.length)
      : 750;

    saveChatSession({
      id: sessionIdRef.current,
      startedAt: sessionStartedAtRef.current,
      lastActivityAt: new Date().toISOString(),
      equipmentModel: selectedModel,
      messageCount: sessionQueriesRef.current.length || 1,
      avgResponseTimeMs: avgLatency,
      isResolvedByBot: false,
      escalatedToEngineer: true,
      classification: lastClassificationRef.current || {
        equipmentModel: selectedModel,
        issueNature: 'hardware',
        natureLabel: 'Phần cứng & Cơ khí',
        confidence: 0.95,
        keywordsDetected: ['hỗ trợ trực tiếp', 'kỹ sư']
      },
      userQuerySnippets: [...sessionQueriesRef.current],
      hospitalClinic: created.hospitalClinic,
      userPhone: created.phone,
      matchedSOPCode: created.errorCode
    });
    
    // Add confirmation message to chat
    const confirmMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text: `ĐÃ TIẾP NHẬN YÊU CẦU HỖ TRỢ TRỰC TIẾP!\n• Mã phiếu: ${created.ticketCode}\n• Bệnh viện: ${created.hospitalClinic} (${created.department})\n• Thiết bị: ${created.equipmentModel}\n• Mức độ: ${created.priority === 'urgent' ? 'Khẩn cấp (Ưu tiên số 1)' : 'Bình thường'}\n\nKỹ sư trực hiện trường (KS. Nguyễn Quang Đạt) đã nhận được thông báo và sẽ gọi điện cho Quý khách (${created.phone}) trong vòng 5-10 phút.`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, confirmMsg]);
    return created;
  };

  // Filtered tickets for lookup
  const searchedTickets = tickets.filter(t => {
    if (!searchTicketQuery.trim()) return false;
    const q = searchTicketQuery.toLowerCase();
    return (
      t.ticketCode.toLowerCase().includes(q) ||
      t.phone.includes(q) ||
      t.hospitalClinic.toLowerCase().includes(q)
    );
  });

  // CRITICAL REQUIREMENT: "cổng hỗ trợ khách hàng, chỉ hiện bảng tin do quản trị viên phê duyệt và biên soạn"
  const approvedBulletins = (bulletins || []).filter(
    b => b.status === 'published' && Boolean(b.approvedBy)
  );

  const latestApprovedBulletin = approvedBulletins.find(b => b.isPinned) || approvedBulletins[0];

  const availableBulletinCategories = [
    'all',
    'Khuyến cáo kỹ thuật',
    'Cảnh báo sự cố',
    'Hướng dẫn bảo dưỡng',
    'Lưu ý vận hành',
    'Thông báo khẩn'
  ];

  const displayedBulletins = approvedBulletins.filter(b => {
    if (bulletinFilterModel !== 'all' && b.equipmentModel !== 'Tất cả dòng máy' && b.equipmentModel !== bulletinFilterModel) {
      return false;
    }
    if (bulletinFilterCategory !== 'all' && b.category !== bulletinFilterCategory) {
      return false;
    }
    if (bulletinSearchText.trim()) {
      const q = bulletinSearchText.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q) ||
        b.content.toLowerCase().includes(q) ||
        b.engineerAuthor.toLowerCase().includes(q) ||
        (b.approvedBy && b.approvedBy.toLowerCase().includes(q)) ||
        b.recommendations.some(r => r.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Kanban Columns configuration for compact equipment-centric view
  const kanbanColumns = [
    {
      id: 'exc200',
      title: 'Zybio EXC200/220',
      subtitle: 'Sinh Hóa Tự Động',
      badge: 'Sinh Hóa',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      columnHeaderBg: 'bg-blue-50/90 border-blue-200 text-blue-900',
      dotColor: 'bg-blue-500',
      accentBorder: 'hover:border-blue-400',
      filter: (b: ADCBulletin) => b.equipmentModel === 'Zybio EXC200/220'
    },
    {
      id: 'z3crp',
      title: 'Zybio Z3 CRP',
      subtitle: 'Huyết Học 3TP + CRP',
      badge: 'Huyết Học 3TP',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      columnHeaderBg: 'bg-purple-50/90 border-purple-200 text-purple-900',
      dotColor: 'bg-purple-500',
      accentBorder: 'hover:border-purple-400',
      filter: (b: ADCBulletin) => b.equipmentModel === 'Zybio Z3 CRP'
    },
    {
      id: 'z50',
      title: 'Zybio Z50',
      subtitle: 'Huyết Học 5TP Laser',
      badge: 'Huyết Học 5TP',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      columnHeaderBg: 'bg-amber-50/90 border-amber-200 text-amber-900',
      dotColor: 'bg-amber-500',
      accentBorder: 'hover:border-amber-400',
      filter: (b: ADCBulletin) => b.equipmentModel === 'Zybio Z50'
    },
    {
      id: 'fs205_all',
      title: 'FS-205 & Khuyến Cáo Chung',
      subtitle: 'Miễn Dịch & Tất Cả Dòng Máy',
      badge: 'Chung & Miễn Dịch',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      columnHeaderBg: 'bg-emerald-50/90 border-emerald-200 text-emerald-900',
      dotColor: 'bg-emerald-500',
      accentBorder: 'hover:border-emerald-400',
      filter: (b: ADCBulletin) => b.equipmentModel === 'FS-205' || b.equipmentModel === 'Tất cả dòng máy'
    }
  ];

  // Categories and filtered SOPs for the main page
  const availableCategories = ['all', ...Array.from(new Set(availableSOPsForModel.map(s => s.category)))];

  const displayedSOPs = availableSOPsForModel.filter(s => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (sopSearchText.trim()) {
      const q = sopSearchText.toLowerCase();
      return (
        (Boolean(s.errorCode) && s.errorCode.toLowerCase().includes(q)) ||
        s.title.toLowerCase().includes(q) ||
        s.symptom.toLowerCase().includes(q) ||
        s.rootCause.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-2.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Featured Bulletin Notification Ticker (Shown on SOP and Lookup tab) */}
        {latestApprovedBulletin && activeTab !== 'bulletin' && activeTab !== 'create_ticket' && (
          <div 
            onClick={() => {
              setViewingBulletin(latestApprovedBulletin);
            }}
            className="mb-2 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border border-emerald-200/90 hover:border-emerald-400 rounded-xl p-2 px-3 flex items-center justify-between gap-2 shadow-2xs cursor-pointer transition-all shrink-0 group"
            title="Nhấn xem chi tiết khuyến cáo kỹ thuật chính thức từ Kỹ sư ADC"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shrink-0 shadow-2xs">
                <Megaphone className="w-3 h-3 text-white" />
                <span>BẢNG TIN ADC</span>
              </span>
              <p className="text-xs text-slate-800 font-semibold truncate group-hover:text-emerald-900">
                <span className="font-bold text-emerald-900">{latestApprovedBulletin.equipmentModel}:</span> {latestApprovedBulletin.title}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 shrink-0">
              <span className="hidden md:inline text-[11px] font-medium text-slate-500">{latestApprovedBulletin.engineerAuthor}</span>
              <span className="group-hover:translate-x-0.5 transition-transform">Xem khuyến cáo →</span>
            </div>
          </div>
        )}
        {activeTab === 'sop' ? (
          <div className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-hidden">
            {/* Filter by Faults / Categories of the selected equipment model */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0 py-1">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap shrink-0 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-600" />
                  <span>Phân loại lỗi {selectedModel.replace('Zybio ', '')}:</span>
                </span>
                {availableCategories.map(cat => {
                  const isSel = selectedCategory === cat;
                  const count = cat === 'all' 
                    ? availableSOPsForModel.length 
                    : availableSOPsForModel.filter(s => s.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                        isSel 
                          ? 'bg-emerald-600 text-white font-bold shadow-2xs' 
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>{cat === 'all' ? 'Tất cả mã lỗi' : cat}</span>
                      <span className={`text-[9px] px-1 rounded-full font-mono font-bold ${
                        isSel ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 shrink-0">

                {/* Search SOP in model */}
                <div className="relative min-w-[150px] max-w-xs shrink-0 hidden md:block">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={sopSearchText}
                    onChange={(e) => setSopSearchText(e.target.value)}
                    placeholder="Tìm mã lỗi (E101, H101...)..."
                    className="w-full pl-7 pr-6 py-1 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:border-emerald-500"
                  />
                  {sopSearchText && (
                    <button
                      onClick={() => setSopSearchText('')}
                      className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* SOP Grid List */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              {displayedSOPs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {displayedSOPs.map((sop, idx) => {
                    const isExpanded = expandedSOPId === sop.id;
                    return (
                      <div
                        key={`${sop.id || 'sop'}-${idx}`}
                        onClick={() => setQuickViewSOP(sop)}
                        title="Nhấn vào thẻ để xem nhanh toàn bộ nội dung quy trình kỹ thuật liên kết"
                        className="bg-white rounded-xl border border-slate-200 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-2 p-3 cursor-pointer group active:scale-[0.99]"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1.5 mb-1.5">
                            <div className="flex items-center gap-1.5">
                              {sop.errorCode && sop.errorCode.trim() !== '' && (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-mono font-bold text-xs rounded border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors">
                                  {sop.errorCode}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {sop.category}
                              </span>
                            </div>

                            {/* Clickable Quick View Badge */}
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
                              <Zap className="w-2.5 h-2.5 text-emerald-500 group-hover:text-white animate-pulse" />
                              <span>Xem nhanh liên kết</span>
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                            {sop.title}
                          </h4>

                          {sop.pdfAttachment && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingPdfForSop(sop);
                              }}
                              title="Nhấn để xem tài liệu PDF đính kèm"
                              className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-rose-800 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                            >
                              <FileText className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[165px]">{sop.pdfAttachment.fileName}</span>
                              <span className="opacity-75">· {formatFileSize(sop.pdfAttachment.fileSize)}</span>
                            </button>
                          )}

                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                            <strong className="text-slate-700">Hiện tượng:</strong> {sop.symptom}
                          </p>

                          <div className="bg-amber-50/70 border border-amber-200/70 rounded p-1.5 mt-2 text-[10px] text-amber-900 leading-tight">
                            <strong>Nguyên nhân:</strong> {sop.rootCause}
                          </div>

                          {/* Expanded Step Details if clicked */}
                          {isExpanded && (
                            <div 
                              onClick={(e) => e.stopPropagation()} 
                              className="mt-2.5 pt-2 border-t border-slate-100 space-y-2 animate-in fade-in duration-150"
                            >
                              <p className="text-[11px] font-bold text-slate-800">
                                Quy trình khắc phục chuẩn (SOP):
                              </p>
                              <div className="space-y-1">
                                {sop.resolutionSteps.map((step, idx) => (
                                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700 bg-slate-50 p-1.5 rounded">
                                    <span className="font-mono font-bold text-emerald-600 shrink-0">#{idx + 1}</span>
                                    <span>{step.replace(/^Bước \d+:\s*/, '')}</span>
                                  </div>
                                ))}
                              </div>

                              {sop.safetyWarnings.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded p-2 text-[10px] text-red-800 space-y-0.5">
                                  <div className="flex items-center gap-1 font-bold text-red-900">
                                    <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                                    <span>Lưu ý An Toàn:</span>
                                  </div>
                                  {sop.safetyWarnings.map((w, idx) => (
                                    <p key={idx} className="pl-4 leading-tight">• {w}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Card Action Footers */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedSOPId(isExpanded ? null : sop.id);
                            }}
                            className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Thu gọn' : 'Chi tiết SOP'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendMessage(`Mã lỗi ${sop.errorCode}: ${sop.title}`);
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            >
                              <Bot className="w-3 h-3 text-emerald-600" />
                              <span>Hỏi AI 24/7</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDirectSupport(sop.errorCode, sop.title);
                              }}
                              title="Yêu cầu hỗ trợ trực tiếp"
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs bg-white rounded-xl border border-slate-200 p-8">
                  Không tìm thấy quy trình SOP nào khớp với từ khóa "{sopSearchText}".
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'bulletin' ? (
          /* Tab: BẢNG TIN ADC (Khuyến Cáo Kỹ Sư ADC - DẠNG KANBAN NHỎ GỌN DỄ NHÌN) */
          <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden animate-fadeIn">
            {/* Header: Title */}
            <div className="bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Megaphone className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    Bảng Tin Khuyến Cáo Kỹ Thuật ADC
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                    Cảnh báo sự cố, quy trình bảo dưỡng và khuyến cáo chính thức từ đội ngũ kỹ sư ADC.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content: 1 Thanh Trượt Duy Nhất Xem Toàn Bộ Bảng Tin (Không chia theo dòng máy) */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              {displayedBulletins.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-3">
                  {displayedBulletins.map((b) => {
                    return (
                      <div
                        key={b.id}
                        onClick={() => setViewingBulletin(b)}
                        className={`bg-white rounded-2xl border p-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative active:scale-[0.99] ${
                          b.isPinned 
                            ? 'border-emerald-300 ring-2 ring-emerald-100/80 bg-gradient-to-b from-emerald-50/20 to-white' 
                            : 'border-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        <div>
                          {/* Tags row */}
                          <div className="flex items-center justify-between gap-1.5 mb-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {b.isPinned && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                                  <Pin className="w-2.5 h-2.5 text-amber-700" />
                                  <span>Ghim</span>
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-700 rounded-md">
                                {b.category}
                              </span>
                              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200 font-mono">
                                {b.equipmentModel}
                              </span>
                            </div>
                          </div>

                          {/* Title */}
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug line-clamp-2">
                            {b.title}
                          </h4>

                          {/* Summary */}
                          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                            {b.summary}
                          </p>

                          {/* Top Recommendations Preview */}
                          {b.recommendations && b.recommendations.length > 0 && (
                            <div className="mt-2.5 p-2 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
                              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Khuyến cáo cốt lõi của kỹ sư:</span>
                              </span>
                              <div className="space-y-1">
                                {b.recommendations.slice(0, 2).map((rec, rIdx) => (
                                  <div key={rIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                                    <span className="font-bold text-emerald-700 shrink-0">•</span>
                                    <span className="line-clamp-1">{rec}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Footer: Metadata */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate text-[11px]">
                              {b.engineerAuthor}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              Kỹ sư ADC Tech
                            </p>
                          </div>

                          <button
                            type="button"
                            className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <span>Chi tiết</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
                  <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">Không tìm thấy thông báo hoặc khuyến cáo nào phù hợp.</p>
                  <p className="text-[11px]">Toàn bộ các khuyến cáo và hướng dẫn kỹ thuật chính thức từ đội ngũ kỹ sư ADC.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'create_ticket' ? (
          <DirectSupportModal
            asPage
            isOpen={true}
            onClose={() => setActiveTab(previousTab)}
            defaultModel={modalDefaultModel || selectedModel}
            defaultErrorCode={modalDefaultError}
            defaultIssue={modalDefaultIssue}
            onSubmitTicket={handleTicketSubmitted}
            onViewLookup={(code) => {
              setSearchTicketQuery(code);
              setActiveTab('lookup');
            }}
          />
        ) : (
          /* Tab: Ticket Lookup & Tracking */
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 max-w-4xl mx-auto w-full h-full min-h-0 flex flex-col overflow-hidden">
            <div className="text-center max-w-md mx-auto mb-3 shrink-0">
              <h3 className="text-sm font-bold text-slate-900">
                Tra Cứu Tiến Độ Xử Lý Phiếu Hỗ Trợ
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Nhập mã phiếu (VD: TICK-2026-001) hoặc số điện thoại để theo dõi kỹ sư ADC.
              </p>

              <div className="mt-2.5 flex gap-2">
                <input
                  type="text"
                  value={searchTicketQuery}
                  onChange={(e) => setSearchTicketQuery(e.target.value)}
                  placeholder="Nhập mã phiếu hoặc số điện thoại..."
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={() => {}}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Tìm</span>
                </button>
              </div>
            </div>

            {/* Ticket Results Scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1">
              {searchTicketQuery.trim() ? (
                searchedTickets.length > 0 ? (
                  searchedTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs sm:text-sm text-emerald-800">
                            {ticket.ticketCode}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                            {ticket.equipmentModel}
                          </span>
                          {ticket.escalationReason && (
                            <span className="text-[9.5px] px-1.5 py-0.2 rounded font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5 text-red-600" />
                              <span>
                                {ticket.escalationReason === 'keyword_match' ? 'Sự cố khẩn cấp (15p)' :
                                 ticket.escalationReason === 'high_complexity' ? 'Đa triệu chứng phức tạp (15p)' :
                                 ticket.escalationReason === 'bot_unresolved' ? 'Chưa giải quyết (15p)' :
                                 ticket.escalationReason === 'unhelpful_feedback' ? 'Phản hồi chưa hiệu quả (15p)' : 'Điều phối ưu tiên'}
                              </span>
                            </span>
                          )}
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          ticket.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ticket.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : ticket.status === 'assigned'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}>
                          {ticket.status === 'completed' ? '✓ Đã hoàn tất' :
                           ticket.status === 'in_progress' ? '● Kỹ sư đang xử lý tại chỗ' :
                           ticket.status === 'assigned' ? '● Kỹ sư đang di chuyển' : '● Chờ tiếp nhận'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-slate-600">
                        <p><strong>Bệnh viện/Phòng khám:</strong> {ticket.hospitalClinic} ({ticket.department})</p>
                        <p><strong>Người liên hệ:</strong> {ticket.contactPerson} - {ticket.phone}</p>
                        <p><strong>Thiết bị:</strong> {ticket.equipmentModel} {ticket.serialNumber ? `(S/N: ${ticket.serialNumber})` : ''}</p>
                        <p><strong>Kỹ sư phụ trách:</strong> {ticket.assignedEngineerName || 'Đang phân công'}</p>
                      </div>

                      <div className="bg-white p-2 rounded border border-slate-200 text-xs text-slate-700">
                        <strong>Hiện tượng:</strong> {ticket.issueDescription}
                      </div>

                      {ticket.engineerReport && (
                        <div className="bg-emerald-50 border border-emerald-200 p-2 rounded text-xs text-emerald-900 space-y-1">
                          <p><strong>Biên bản nghiệm thu kỹ thuật:</strong></p>
                          <p>• Nguyên nhân: {ticket.engineerReport.actualRootCause}</p>
                          <p>• Xử lý: {ticket.engineerReport.actionsTaken}</p>
                          {ticket.engineerReport.replacedParts.length > 0 && (
                            <p>• Linh kiện thay thế: {ticket.engineerReport.replacedParts.map(p => `${p.name} (${p.code} x${p.quantity})`).join(', ')}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Không tìm thấy phiếu nào khớp với từ khóa "{searchTicketQuery}".
                  </div>
                )
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Vui lòng nhập mã phiếu hoặc số điện thoại để tra cứu tiến độ.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating AI Chatbot Launcher Icon (Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 select-none">
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md py-1.5 px-3 rounded-full shadow-lg border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer hover:shadow-xl hover:border-emerald-300 hover:scale-102 transition-all group"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Chatbot AI ADC 24/7</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">Online</span>
          </button>
        )}

        <button
          onClick={() => setIsChatOpen(prev => !prev)}
          aria-label="Chatbot AI"
          title="Trợ lý Kỹ thuật AI ADC 24/7"
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all cursor-pointer relative group ${
            isChatOpen
              ? 'bg-slate-800 text-white hover:bg-slate-900 rotate-90 scale-95'
              : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:scale-108 active:scale-95'
          }`}
        >
          {isChatOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <>
              <Bot className="w-6 h-6 text-white group-hover:rotate-6 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Window at Bottom Right */}
      {isChatOpen && (
        <div className="fixed bottom-19 right-5 z-50 w-[430px] max-w-[calc(100vw-28px)] h-[570px] max-h-[calc(100vh-90px)] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Chat Sub-header (CSS selector 2) */}
          <div className="px-4 py-2.5 border-b border-emerald-800/40 bg-gradient-to-r from-emerald-700 to-teal-700 text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white leading-tight">
                    Trợ Lý Kỹ Thuật AI ADC 24/7
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                </div>
                <p className="text-[10px] text-emerald-100">
                  {selectedModel} · SOP Chuẩn & 2026-XLKT
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsChatOpen(false)}
                title="Đóng khung chat"
                className="w-7 h-7 rounded-lg hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feedback & Learning Notification Toast */}
          {feedbackBannerText && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-1.5 text-[10px] text-emerald-800 flex items-center justify-between shrink-0 animate-in fade-in">
              <span className="font-semibold">{feedbackBannerText}</span>
              <button 
                onClick={() => setFeedbackBannerText(null)} 
                className="text-emerald-600 hover:text-emerald-900 cursor-pointer ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Chat Messages Scrollable (CSS selector 3) */}
          <div
            ref={chatMessagesContainerRef}
            className="flex-1 min-h-0 p-3 overflow-y-auto scroll-smooth space-y-2.5 bg-slate-50/50 text-[11px] sm:text-xs"
          >
            {messages.map(msg => {
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 scroll-mt-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender !== 'user' && (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        {msg.sender === 'system' ? <ShieldAlert className="w-3 h-3 text-emerald-700" /> : <Bot className="w-3 h-3 text-emerald-700" />}
                      </div>
                    )}

                    <div className={`max-w-[90%] rounded-xl p-2.5 text-[11px] sm:text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : msg.sender === 'system'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-tl-none font-sans'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs'
                    }`}>
                      <div className="whitespace-pre-line text-[11px] sm:text-xs leading-relaxed">
                        {msg.sender === 'bot'
                          ? msg.text
                              .replace(/^\[Trích xuất Sổ tay 2026-XLKT[^\]]*\]\s*/gim, '')
                              .replace(/^•\s*(Đơn vị áp dụng|Bệnh viện|Phòng khám|Số Serial|SN|Ngày sửa|Kỹ sư thực hiện):[^\n]*\n?/gim, '')
                              .replace(/\s*\((?:Sổ tay\s*)?2026-XLKT-[A-Z0-9-]+\)/gi, '')
                              .replace(/\[2026-XLKT-[A-Z0-9-]+\]\s*/gi, '')
                              .replace(/\n{3,}/g, '\n\n')
                              .trim()
                          : msg.text}
                      </div>

                      {/* Detected Search Keywords Pills */}
                      {msg.sender === 'bot' && msg.searchKeywordsUsed && msg.searchKeywordsUsed.length > 0 && (
                        <div className="mt-2 flex items-center flex-wrap gap-1">
                          <span className="text-[9.5px] font-semibold text-slate-500 flex items-center gap-0.5">
                            <Search className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Từ khóa:</span>
                          </span>
                          {msg.searchKeywordsUsed.map((kw, kIdx) => (
                            <span
                              key={kIdx}
                              className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[9.5px] font-medium"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Interactive Model Selection Buttons for Welcome Message */}
                      {msg.id === 'init-1' && (
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-col gap-1.5">
                          <div className="flex flex-wrap gap-1.5">
                            {EQUIPMENT_MODELS.map(eq => {
                              const isSelected = selectedModel === eq.id;
                              return (
                                <button
                                  key={eq.id}
                                  type="button"
                                  onClick={() => handleSelectModel(eq)}
                                  className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                                      : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border-slate-200 hover:border-emerald-300 font-medium'
                                  }`}
                                >
                                  <span>{eq.name}</span>
                                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                                    isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200/80 text-slate-600'
                                  }`}>
                                    {eq.badge}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                  {/* Gợi ý SOP đính kèm file PDF khi khớp đúng lỗi */}
                  {msg.matchedSOP && msg.matchedSOP.pdfAttachment && (!msg.citedPdfs || msg.citedPdfs.length === 0) && (
                    <div className="mt-2 pt-2 border-t border-emerald-200/80 bg-emerald-50/70 -mx-1 p-2 rounded-lg border border-emerald-200 space-y-1.5">
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Gợi ý SOP có file PDF đính kèm</span>
                        </span>
                        <div className="flex items-center gap-1">
                          {msg.matchedSOP.errorCode && msg.matchedSOP.errorCode.trim() !== '' && (
                            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-mono font-bold text-[9.5px] rounded border border-emerald-200">
                              {msg.matchedSOP.errorCode}
                            </span>
                          )}
                          <span className="text-[9px] bg-white text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                            {msg.matchedSOP.equipmentModel}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-emerald-200/80 p-2 space-y-1.5 shadow-2xs">
                        <p className="text-[11px] font-bold text-slate-900 leading-snug">
                          {msg.matchedSOP.title}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-rose-800 flex-wrap">
                          <FileText className="w-3 h-3 text-rose-600 shrink-0" />
                          <span className="font-mono font-semibold truncate max-w-[200px]">
                            {msg.matchedSOP.pdfAttachment.fileName}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            ({formatFileSize(msg.matchedSOP.pdfAttachment.fileSize)})
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-0.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setQuickViewSOP(msg.matchedSOP!)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Xem SOP</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewingPdfForSop(msg.matchedSOP!)}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Xem PDF</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadPdfAttachment(msg.matchedSOP!.pdfAttachment!)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            <span>Tải PDF</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Render Cited PDF Documents Card ONLY when user explicitly asked for PDF documents */}
                  {msg.citedPdfs && msg.citedPdfs.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-rose-200/80 bg-rose-50/70 -mx-1 p-2 rounded-lg border border-rose-200 space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-rose-950 flex items-center gap-1">
                          <Paperclip className="w-3 h-3 text-rose-600" />
                          <span>Tài liệu PDF trích dẫn ({msg.citedPdfs.length})</span>
                        </span>
                        <span className="text-[9px] text-rose-700 font-medium">
                          Nhấn để xem trực tiếp
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {msg.citedPdfs.map((cite, cIdx) => {
                          const targetSop = sops.find(s => s.id === cite.sopId);
                          return (
                            <div
                              key={`${cite.sopId}-${cIdx}`}
                              className="bg-white rounded-lg border border-rose-200/90 p-2 space-y-1 shadow-2xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <FileText className="w-3 h-3 text-rose-600 shrink-0" />
                                    <span className="font-mono font-bold text-[10px] text-rose-900 truncate max-w-[210px]">
                                      {cite.fileName}
                                    </span>
                                    {cite.pdfAttachment && (
                                      <span className="text-[9px] text-slate-500 font-mono">
                                        ({formatFileSize(cite.pdfAttachment.fileSize)})
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10.5px] font-bold text-slate-800 leading-snug mt-0.5">
                                    {cite.errorCode ? `[${cite.errorCode}] ` : ''}{cite.sopTitle}
                                  </p>
                                </div>
                                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">
                                  {cite.equipmentModel}
                                </span>
                              </div>

                              {cite.excerpt && (
                                <p className="text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 leading-relaxed line-clamp-2">
                                  “{cite.excerpt}”
                                </p>
                              )}

                              <div className="flex items-center justify-end gap-1.5 pt-0.5 flex-wrap">
                                {cite.pdfAttachment ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const sopObj: SOPArticle = targetSop || {
                                          id: cite.sopId,
                                          equipmentModel: cite.equipmentModel,
                                          category: 'Cơ khí & Kim hút',
                                          errorCode: cite.errorCode || '',
                                          title: cite.sopTitle,
                                          symptom: cite.excerpt,
                                          rootCause: '',
                                          resolutionSteps: [],
                                          safetyWarnings: [],
                                          updatedAt: cite.pdfAttachment!.uploadedAt,
                                          sourceFile: cite.fileName,
                                          pdfAttachment: cite.pdfAttachment
                                        };
                                        setViewingPdfForSop(sopObj);
                                      }}
                                      className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Xem PDF</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => downloadPdfAttachment(cite.pdfAttachment!)}
                                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>Tải PDF</span>
                                    </button>
                                  </>
                                ) : null}
                                {targetSop && (
                                  <button
                                    type="button"
                                    onClick={() => setQuickViewSOP(targetSop)}
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    <span>{cite.pdfAttachment ? 'Xem SOP' : 'Xem trích dẫn'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Render Matched Support Requests / Tickets (tìm kiếm yêu cầu theo keyword) */}
                  {msg.matchedTickets && msg.matchedTickets.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-blue-200/80 bg-blue-50/60 -mx-1 p-2 rounded-lg border border-blue-200 space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-blue-950 flex items-center gap-1">
                          <Search className="w-3 h-3 text-blue-600" />
                          <span>Yêu cầu hỗ trợ khớp từ khóa ({msg.matchedTickets.length})</span>
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {msg.matchedTickets.map((t) => (
                          <div
                            key={t.id}
                            className="bg-white rounded-lg border border-blue-200/80 p-2 space-y-1 shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                              <span className="font-mono font-bold text-[10px] text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                {t.ticketCode}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                t.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : t.status === 'in_progress'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {t.status === 'completed'
                                  ? 'Đã hoàn tất'
                                  : t.status === 'in_progress'
                                  ? 'Đang xử lý'
                                  : t.status === 'assigned'
                                  ? 'Đã phân công'
                                  : 'Chờ tiếp nhận'}
                              </span>
                            </div>
                            <p className="text-[10.5px] font-bold text-slate-800">
                              {t.hospitalClinic} · <span className="font-normal text-slate-600">{t.equipmentModel}</span>
                            </p>
                            <p className="text-[10px] text-slate-600 line-clamp-2">{t.issueDescription}</p>
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <span className="text-[9px] text-slate-500">
                                Kỹ sư: <strong>{t.assignedEngineerName || 'Đang điều phối'}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('lookup');
                                  setSearchTicketQuery(t.ticketCode);
                                }}
                                className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-[9.5px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span>Tra cứu phiếu</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Interactive Guided Options from Gemini */}
                  {msg.sender === 'bot' && msg.suggestedOptions && msg.suggestedOptions.length > 0 && !msg.escalationCard && (
                    <div className="mt-2 pt-1.5 border-t border-slate-100 space-y-1.5">
                      {msg.guidedQuestion && (
                        <p className="text-[10px] font-semibold text-slate-700">{msg.guidedQuestion}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {msg.suggestedOptions.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => {
                              if (opt.toLowerCase().includes('hỗ trợ trực tiếp') || opt.toLowerCase().includes('tận viện')) {
                                const lastUserText = [...messages].reverse().find(m => m.sender === 'user')?.text;
                                handleOpenDirectSupport(
                                  msg.matchedSOP?.errorCode || msg.classification?.faultCode,
                                  lastUserText || opt,
                                  msg.classification?.equipmentModel as EquipmentModel | undefined
                                );
                              } else {
                                handleSendMessage(opt);
                              }
                            }}
                            className="px-2 py-1 text-[10px] font-medium bg-emerald-50/80 hover:bg-emerald-600 text-emerald-900 hover:text-white border border-emerald-200 rounded-lg transition-colors cursor-pointer text-left"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Escalation Card (keyword_match / high_complexity / bot_unresolved / unhelpful_feedback) */}
                  {msg.escalationCard && (
                    <div className="mt-2 -mx-1 -mb-1">
                      <ChatEscalationCardView
                        card={msg.escalationCard}
                        equipmentModel={selectedModel}
                        dutyEngineerName={settings?.dutyEngineerName || 'KS. Nguyễn Quang Đạt'}
                        dutyEngineerPhone={settings?.dutyEngineerPhone || '0988 234 567'}
                        onOpenLookup={(code) => {
                          setActiveTab('lookup');
                          setSearchTicketQuery(code);
                        }}
                        onSubmitDispatch={(ticketData) => handleTicketSubmitted(ticketData)}
                      />
                    </div>
                  )}

                  {/* Suggest Creating Technical Support Ticket when response > 1 minute OR SOP keyword not found */}
                  {msg.suggestDirectSupport && !msg.escalationCard && msg.sender !== 'user' && (
                    <div className="mt-2 p-2 rounded-lg border border-amber-200 bg-amber-50/80 space-y-1.5">
                      <div className="flex items-start gap-1.5 text-[10.5px] text-amber-950 font-semibold leading-snug">
                        {msg.suggestTicketReason === 'timeout' ? (
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <span>
                          {msg.suggestTicketReason === 'timeout'
                            ? 'Thời gian phản hồi lâu hơn 1 phút. Gợi ý tạo phiếu yêu cầu hỗ trợ kỹ thuật để Kỹ sư ADC xử lý kịp thời.'
                            : 'Không tìm thấy từ khóa phù hợp trong kho SOP. Gợi ý tạo phiếu yêu cầu hỗ trợ kỹ thuật để Kỹ sư ADC hỗ trợ trực tiếp.'}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const lastUserText = [...messages].reverse().find(m => m.sender === 'user')?.text;
                            handleOpenDirectSupport(
                              msg.classification?.faultCode,
                              msg.suggestedIssueText || lastUserText,
                              msg.classification?.equipmentModel as EquipmentModel | undefined
                            );
                          }}
                          className="px-2.5 py-1 text-[10.5px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Wrench className="w-3 h-3 text-white" />
                          <span>Tạo phiếu yêu cầu hỗ trợ kỹ thuật</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* NLP Classification Metadata Badge */}
                  {msg.classification && msg.sender !== 'user' && !msg.escalationCard && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200/70 flex items-center flex-wrap gap-1.5 text-[9px]">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200/60">
                        <Tag className="w-2.5 h-2.5 text-emerald-600" />
                        <span>{msg.classification.equipmentModel}</span>
                      </span>
                      {msg.classification.faultLabel ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 font-semibold border border-amber-200/70">
                          <span>{msg.classification.faultLabel}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-medium border border-blue-200/60">
                          <span>{msg.classification.natureLabel}</span>
                        </span>
                      )}
                      <span className="text-slate-400 font-mono">
                        Độ tin cậy: {Math.round(msg.classification.confidence * 100)}%
                      </span>
                      {msg.responseTimeMs ? (
                        <span className="inline-flex items-center gap-0.5 text-slate-400 font-mono">
                          <Zap className="w-2.5 h-2.5 text-amber-500" />
                          {msg.responseTimeMs}ms
                        </span>
                      ) : null}
                    </div>
                  )}

                  {/* Continuous Learning Feedback Bar for Bot Messages (only if not an escalation or unhelpful prompt) */}
                  {msg.sender === 'bot' && msg.id !== 'init-1' && !msg.id.startsWith('bot-unhelpful-') && !msg.escalationCard && (
                    <div className="mt-2 pt-1.5 border-t border-slate-100">
                      {msg.feedback ? (
                        <div className="flex items-center justify-between text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          <span className="flex items-center gap-1 font-semibold text-emerald-700">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>{msg.feedback.rating === 'helpful' ? 'Đã phản hồi: Hữu ích' : 'Đã phản hồi: Chưa giải quyết'}</span>
                          </span>
                          {msg.feedback.userTip ? (
                            <span className="text-amber-800 font-medium truncate max-w-[160px]" title={msg.feedback.userTip}>
                              💡 "{msg.feedback.userTip}"
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[9px]">Đã ghi nhận</span>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between gap-1 text-[10px]">
                            <span className="text-slate-400">Câu trả lời có giúp ích không?</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleFeedback(msg.id, 'helpful')}
                                title="Câu trả lời hữu ích"
                                className="px-1.5 py-0.5 rounded bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <ThumbsUp className="w-2.5 h-2.5" />
                                <span className="text-[9px]">Hữu ích</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFeedback(msg.id, 'unhelpful')}
                                title="Chưa khắc phục được sự cố - Nhấn để điều phối kỹ sư"
                                className="px-1.5 py-0.5 rounded bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <ThumbsDown className="w-2.5 h-2.5" />
                                <span className="text-[9px]">Chưa hiệu quả</span>
                              </button>
                            </div>
                          </div>

                          {/* Inline Tip / Correction Box */}
                          {activeFeedbackTipMsgId === msg.id && (
                            <div
                              ref={feedbackTipBoxRef}
                              className="mt-2 p-2 bg-amber-50/90 rounded-lg border border-amber-200 space-y-1.5 animate-in fade-in duration-150"
                            >
                              <div className="flex items-center justify-between text-[10px] text-amber-900 font-bold">
                                <span className="flex items-center gap-1">
                                  <Lightbulb className="w-3 h-3 text-amber-600" />
                                  <span>Góp ý kinh nghiệm xử lý thực tế (AI tự học):</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveFeedbackTipMsgId(null)}
                                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <textarea
                                rows={2}
                                value={feedbackTipInput}
                                onChange={(e) => setFeedbackTipInput(e.target.value)}
                                placeholder="VD: Với lỗi này cần vệ sinh kim bằng cồn 70 độ và reset bo mạch điều khiển..."
                                className="w-full p-1.5 text-[10px] bg-white border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800"
                              />
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => setActiveFeedbackTipMsgId(null)}
                                  className="px-2 py-0.5 text-[9px] text-slate-500 hover:bg-white rounded cursor-pointer"
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  disabled={!feedbackTipInput.trim()}
                                  onClick={() => handleFeedback(msg.id, 'helpful', feedbackTipInput)}
                                  className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Lưu mẹo tự học</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`text-[9px] mt-1 font-mono ${
                    msg.sender === 'user' ? 'text-emerald-100 text-right' : 'text-slate-400'
                  }`}>
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
                );
              })}

            {isLoading && (
              <div className="flex gap-2 items-center text-slate-500 text-xs py-1">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                  <span className="text-[11px]">Trợ lý AI đang tra cứu SOP {selectedModel}...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar (CSS selector 1) */}
          <div className="p-2 border-t border-slate-200 bg-white shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Nhập từ khóa, mã lỗi, tên file PDF hoặc mã phiếu...`}
                disabled={isLoading}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>Gửi</span>
              </button>
            </form>

            <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400">
              <span>Enter để gửi · Gemini AI & Trích dẫn PDF</span>
              <button
                onClick={() => handleSendMessage('Hướng dẫn bảo trì đầu ngày')}
                className="text-emerald-700 hover:underline cursor-pointer"
              >
                Bảo trì đầu ngày
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Direct Support Modal (fallback) */}
      <DirectSupportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultModel={modalDefaultModel || selectedModel}
        defaultErrorCode={modalDefaultError}
        defaultIssue={modalDefaultIssue}
        onSubmitTicket={handleTicketSubmitted}
      />

      {/* Quick View SOP Modal - Instant display of linked content on div click */}
      <QuickViewSOPModal
        sop={quickViewSOP}
        onClose={() => setQuickViewSOP(null)}
        onAskAI={handleSendMessage}
        onRequestSupport={handleOpenDirectSupport}
      />

      {/* PDF Viewer Modal for Customer SOP cards */}
      <PdfViewerModal
        attachment={viewingPdfForSop?.pdfAttachment || null}
        sopTitle={viewingPdfForSop?.title}
        onClose={() => setViewingPdfForSop(null)}
      />

      {/* MODAL: XEM CHI TIẾT BẢNG TIN KHUYẾN CÁO KỸ THUẬT ADC */}
      {viewingBulletin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold">
                  <Megaphone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    Bảng Tin Khuyến Cáo Kỹ Thuật ADC
                  </h3>
                  <p className="text-[11px] text-emerald-100 font-mono">
                    Mã khuyến cáo: {viewingBulletin.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingBulletin(null)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Badges row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                  {viewingBulletin.equipmentModel}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                  {viewingBulletin.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                {viewingBulletin.title}
              </h3>

              {/* Author Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2 text-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                    ADC
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{viewingBulletin.engineerAuthor}</p>
                    <p className="text-[11px] text-slate-500">Kỹ sư phụ trách kỹ thuật ADC</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-600 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                  {viewingBulletin.equipmentModel}
                </span>
              </div>

              {/* Content Description */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Chi tiết vấn đề & bối cảnh thực tế:
                </h4>
                <div className="text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  {viewingBulletin.content}
                </div>
              </div>

              {/* Recommendations Checklist */}
              {viewingBulletin.recommendations && viewingBulletin.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Các bước khuyến cáo & Hướng dẫn kỹ thuật bắt buộc:</span>
                  </h4>
                  <div className="space-y-2">
                    {viewingBulletin.recommendations.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {sIdx + 1}
                        </span>
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${(settings.hotline || settings.dutyEngineerPhone || '0968220800').replace(/\s+/g, '')}`}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Gọi Kỹ Sư Trực: {settings.dutyEngineerPhone}</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const bul = viewingBulletin;
                    setViewingBulletin(null);
                    handleOpenDirectSupport(undefined, `Khuyến cáo ${bul.id}: ${bul.title}`);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Yêu Cầu Hỗ Trợ Khẩn</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingBulletin(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Đóng thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
