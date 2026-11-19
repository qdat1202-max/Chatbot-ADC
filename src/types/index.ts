export type EquipmentModel = 
  | 'Zybio EXC200/220'
  | 'Zybio Z3 CRP'
  | 'Zybio Z50'
  | 'FS-205';

export type TicketPriority = 'urgent' | 'normal' | 'scheduled';
export type TicketStatus = 'pending' | 'assigned' | 'in_progress' | 'completed';
export type StaffRole = 
  | 'director' 
  | 'css' 
  | 'warehouse' 
  | 'sales' 
  | 'field_engineer';

export type DepartmentType = 
  | 'Ban Giám Đốc'
  | 'Phòng CSS'
  | 'Bộ Phận Kho'
  | 'Phòng Kinh Doanh'
  | 'Phòng Kỹ Thuật';

export type AdminTabType = 
  | 'overview' 
  | 'dispatch' 
  | 'create_ticket' 
  | 'sop_mgmt' 
  | 'records' 
  | 'bulletins' 
  | 'analytics' 
  | 'settings' 
  | 'excel' 
  | 'staff' 
  | 'chatbot_analytics' 
  | 'learning';

export interface AdminTabMeta {
  id: AdminTabType;
  label: string;
  shortLabel: string;
  description: string;
  iconName: string;
  badge?: string;
  recommendedRoles?: StaffRole[];
}

export interface SOPPdfAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface SOPArticle {
  id: string;
  equipmentModel: EquipmentModel;
  category: 'Cơ khí & Kim hút' | 'Quang học & Cảm biến' | 'Hóa chất & Buồng đếm' | 'Điện tử & Nhiệt độ' | 'Phần mềm & Kết nối';
  errorCode: string;
  title: string;
  symptom: string;
  rootCause: string;
  resolutionSteps: string[];
  safetyWarnings: string[];
  componentLocation?: string;
  isCommon?: boolean;
  updatedAt: string;
  sourceFile?: string; // Tên file PDF / tài liệu kỹ thuật nguồn
  pdfAttachment?: SOPPdfAttachment; // File PDF đính kèm lưu trữ cục bộ (IndexedDB)
}

export interface ReplacedPart {
  name: string;
  code: string;
  quantity: number;
}

export interface EngineerReport {
  actualRootCause: string;
  actionsTaken: string;
  replacedParts: ReplacedPart[];
  preventiveAdvice: string;
  completedAt: string;
  engineerName: string;
  customerRepresentative?: string;
  savedAt?: string;
  savedMonth?: string; // YYYY-MM
}

export type EscalationTriggerType = 
  | 'keyword_match' 
  | 'high_complexity' 
  | 'bot_unresolved' 
  | 'unhelpful_feedback'
  | 'direct_request'
  | 'manual';

export interface ChatEscalationCard {
  type: EscalationTriggerType;
  title: string;
  description: string;
  safetyAlerts?: string[];
  commitmentMinutes: number; // 15
  ticketCode?: string;
  isSubmitted?: boolean;
  submittedAt?: string;
  prefillData?: {
    hospitalClinic?: string;
    contactPerson?: string;
    phone?: string;
    issueDescription?: string;
    errorCode?: string;
    serialNumber?: string;
  };
}

export interface SupportTicket {
  id: string;
  ticketCode: string; // e.g. TICK-2026-001
  hospitalClinic: string;
  department: string;
  contactPerson: string;
  phone: string;
  equipmentModel: EquipmentModel;
  serialNumber?: string;
  issueDescription: string;
  errorCode?: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedEngineerId?: string;
  assignedEngineerName?: string;
  createdAt: string;
  resolvedAt?: string;
  source: 'customer_portal' | 'internal_sales';
  engineerReport?: EngineerReport;
  notes?: string;
  escalationReason?: EscalationTriggerType;
  escalationCommitmentMinutes?: number;
}

export interface EngineerProfile {
  id: string;
  name: string;
  role: StaffRole;
  department?: DepartmentType | string;
  phone: string;
  email: string;
  status: 'available' | 'on_site' | 'off_duty';
  activeTicketsCount: number;
  area: string;
  specialties?: EquipmentModel[];
  allowedTabs?: AdminTabType[];
  username?: string;
  password?: string;
}

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface AccountRegistrationRequest {
  id: string;
  name: string;
  username: string;
  password: string;
  role: StaffRole;
  department: DepartmentType;
  phone: string;
  email: string;
  area: string;
  note?: string;
  status: RegistrationStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewedByRole?: StaffRole;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface MaintenanceRecord {
  id: string;
  code: string; // e.g. XLKT-2026-012
  date: string;
  hospital: string;
  equipmentModel: EquipmentModel;
  serialNumber: string;
  faultFound: string;
  solutionProvided: string;
  engineerName: string; // KS Nguyễn Quang Đạt, etc.
  replacedParts: string;
  status: 'Đã nghiệm thu' | 'Đang theo dõi';
  notes: string;
  savedAt?: string;
  savedMonth?: string; // YYYY-MM
}

export interface SystemSettings {
  logoUrl?: string;
  hotline?: string;
  hotlineDisplay?: string;
  zaloNumber?: string;
  zaloLink?: string;
  companyName: string;
  supportHours: string;
  dutyEngineerName: string;
  dutyEngineerPhone: string;
  announcement?: string;
  chatbotWelcomeMessage?: string;
  chatbotConfidenceThreshold?: number;
  chatbotAutoEscalateOnUnknown?: boolean;
  chatbotEmergencyAlertsEnabled?: boolean;
  maxUnresolvedAttemptsBeforeEscalate?: number; // default 2
  callbackCommitmentMinutes?: number; // default 15
  smartForwardingRules?: SmartForwardingRulesConfig;
}

export type SmartForwardingRuleReason = 
  | 'direct_request' 
  | 'keyword_match' 
  | 'unhelpful_feedback' 
  | 'high_complexity' 
  | 'bot_unresolved';

export interface SmartForwardingRulesConfig {
  enabled: boolean;
  directRequestKeywords: string[];
  criticalKeywords: string[];
  maxUnresolvedAttempts: number;
  autoForwardOnUnhelpfulFeedback: boolean;
  routingPreference: 'specialist_first' | 'duty_engineer_first' | 'coordinator_first';
  autoCreateTicketOnCall: boolean;
}

export interface ChatCallForwardingInfo {
  triggerReason: SmartForwardingRuleReason;
  triggerReasonLabel: string;
  matchedRuleText: string;
  assignedEngineer: EngineerProfile;
  routingStrategy: 'specialist' | 'duty_engineer' | 'coordinator';
  strategyExplanation: string;
  timestamp: string;
  callStatus: 'initiated' | 'dialed' | 'ticket_created' | 'cancelled';
  callbackPhone?: string;
  hospitalClinic?: string;
}

export interface ChatMessageFeedback {
  messageId?: string;
  rating: 'helpful' | 'unhelpful';
  resolvedIssue?: boolean;
  comment?: string;
  userCorrection?: string;
  userTip?: string;
  submittedAt?: string;
  feedbackAt: string;
}

export interface ChatPdfCitation {
  sopId: string;
  sopTitle: string;
  errorCode?: string;
  equipmentModel: EquipmentModel;
  fileName: string;
  pdfAttachment?: SOPPdfAttachment;
  excerpt: string;
  matchedKeywords: string[];
}

export interface ChatTicketMatch {
  id: string;
  ticketCode: string;
  hospitalClinic: string;
  equipmentModel: EquipmentModel;
  errorCode?: string;
  issueDescription: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedEngineerName?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  matchedSOP?: SOPArticle;
  citedPdfs?: ChatPdfCitation[];
  matchedTickets?: ChatTicketMatch[];
  searchKeywordsUsed?: string[];
  aiSource?: string;
  suggestDirectSupport?: boolean;
  suggestTicketReason?: 'timeout' | 'sop_not_found';
  suggestedIssueText?: string;
  classification?: NLPClassification;
  responseTimeMs?: number;
  feedback?: ChatMessageFeedback;
  escalationCard?: ChatEscalationCard;
  guidedQuestion?: string;
  suggestedOptions?: string[];
  flowId?: string;
  flowCategory?: ConversationFlowCategory;
}

export type ConversationFlowCategory = 
  | 'complex_troubleshooting' // Kịch bản sự cố kỹ thuật phức tạp
  | 'detailed_guide'          // Hướng dẫn sử dụng & vận hành chi tiết
  | 'engineer_escalation';    // Chuyển tiếp cuộc gọi & kỹ sư trực tiếp

export interface ConversationFlowBranch {
  userChoice: string;
  replyText: string;
  nextQuestion?: string;
  nextOptions?: string[];
  safetyWarning?: string;
  autoEscalate?: boolean;
  escalationReason?: 'keyword_match' | 'high_complexity' | 'bot_unresolved' | 'direct_request';
}

export interface AdvancedConversationFlow {
  id: string;
  title: string;
  category: ConversationFlowCategory;
  categoryLabel: string;
  targetModels: (EquipmentModel | 'Tất cả dòng máy')[];
  triggerKeywords: string[];
  triggerErrorCodes?: string[];
  summary: string;
  initialQuestion: string;
  guidedOptions: string[];
  branches: ConversationFlowBranch[];
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: StaffRole;
  roleTitle: string;
  department?: DepartmentType | string;
  phone: string;
  email: string;
  avatar: string;
  area: string;
  loginTime: string;
  allowedTabs?: AdminTabType[];
}

// 2-level NLP Classification
export type IssueNatureType = 
  | 'hardware' 
  | 'software_lis' 
  | 'reagents_cuvette' 
  | 'optics_sensor' 
  | 'user_guide';

export interface NLPClassification {
  equipmentModel: EquipmentModel;
  issueNature: IssueNatureType;
  natureLabel: string;
  confidence: number; // 0.0 - 1.0
  keywordsDetected: string[];
  summaryNote?: string;
  faultCode?: string;      // Ví dụ: E101, H101, E205, Z501, FS101
  faultLabel?: string;     // Ví dụ: [E101] Va chạm kim hút mẫu, [H101] Nghẽn lỗ đếm sapphire
}

export interface ChatbotSessionRecord {
  id: string;
  startedAt: string;
  lastActivityAt: string;
  equipmentModel: EquipmentModel;
  messageCount: number;
  avgResponseTimeMs: number;
  isResolvedByBot: boolean;
  escalatedToEngineer: boolean;
  classification: NLPClassification;
  userQuerySnippets: string[];
  matchedSOPId?: string;
  matchedSOPCode?: string;
  hospitalClinic?: string;
  userPhone?: string;
  feedbackRating?: 'helpful' | 'unhelpful';
  feedbackComment?: string;
  userCorrectionTip?: string;
}

// Continuous Learning Engine Structured Types
export type LearningSourceType = 
  | 'user_feedback'         // Học từ phản hồi & kinh nghiệm thực tế của KTV bệnh viện
  | 'user_correction'       // Mẹo bổ sung do KTV đóng góp
  | 'resolved_session'      // Đúc kết tự động từ phiên hỗ trợ đã giải quyết thành công
  | 'resolved_chat'         // Đúc kết từ đoạn hội thoại hoàn tất
  | 'maintenance_record'    // Đúc kết từ sổ tay thực chiến 2026-XLKT
  | 'engineer_curated'      // Kỹ sư trưởng ADC thẩm định & bổ sung
  | 'auto_synthesis';       // AI tổng hợp từ cụm câu hỏi lặp lại nhiều lần

export type LearningStatusType = 'active' | 'pending_review' | 'promoted_to_sop' | 'archived';

export interface LearnedKnowledgeEntry {
  id: string; // VD: "LRN-2026-001"
  title: string; // VD: "Khắc phục kẹt kim hút do bọt khí và tủa protein vi lượng"
  equipmentModel: EquipmentModel | 'Tất cả dòng máy';
  errorCode?: string; // Mã lỗi nếu có (VD: E101, H101, FS101)
  category: 'Cơ khí & Kim hút' | 'Quang học & Cảm biến' | 'Hóa chất & Buồng đếm' | 'Điện tử & Nhiệt độ' | 'Phần mềm & Kết nối' | 'Kinh nghiệm thực chiến';
  triggerKeywords: string[]; // Các từ khóa/ngữ cảnh kích hoạt kiến thức này
  matchedKeywords?: string[];
  symptomPattern: string; // Hiện tượng/câu hỏi người dùng thường gặp
  symptomSummary?: string;
  learnedSolution: string; // Giải pháp tối ưu đã được kiểm chứng
  solutionSteps?: string[];
  rootCauseAnalysis?: string;
  safetyNotes?: string[];
  sourceSnippet?: string;
  preventionTip?: string; // Mẹo phòng ngừa cho KTV
  confidenceScore: number; // 0.0 - 1.0 (tăng khi có nhiều vote hữu ích)
  helpfulVotes: number; // Số lượt đánh giá hữu ích
  helpfulCount?: number;
  unhelpfulVotes: number; // Số lượt đánh giá chưa hiệu quả
  unhelpfulCount?: number;
  usageCount: number; // Số lần đã áp dụng để trả lời người dùng
  sourceSessionIds: string[]; // Các ID phiên trò chuyện nguồn
  learningSource: LearningSourceType;
  sourceType?: string;
  status: LearningStatusType;
  associatedSOPId?: string; // Nếu đã liên kết hoặc nâng cấp thành SOP
  learnedAt?: string;
  lastAppliedAt?: string; // Lần áp dụng gần nhất
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotPerformanceStats {
  totalSessions: number;
  totalMessages: number;
  avgResponseTimeMs: number;
  resolvedByBotRate: number;
  escalatedRate: number;
  byModel: Record<string, number>;
  byNature: Record<string, number>;
  byFault: Record<string, number>;
  byModelFault: Record<string, Record<string, number>>;
  topQuestions: { query: string; count: number; nature: string; model: string; faultCode?: string }[];
  dailyTrends: { date: string; sessions: number; messages: number; resolvedRate: number }[];
}

export type BulletinCategory = 
  | 'Khuyến cáo kỹ thuật' 
  | 'Cảnh báo sự cố' 
  | 'Hướng dẫn bảo dưỡng' 
  | 'Lưu ý vận hành' 
  | 'Thông báo khẩn';

export type BulletinStatus = 'published' | 'draft' | 'pending_review';
export type BulletinPriority = 'urgent' | 'high' | 'normal';

export interface ADCBulletin {
  id: string;
  title: string;
  category: BulletinCategory;
  equipmentModel: EquipmentModel | 'Tất cả dòng máy';
  summary: string;
  content: string;
  recommendations: string[];
  engineerAuthor: string;  // Kỹ sư ADC biên soạn / đề xuất (VD: KS. Nguyễn Quang Đạt)
  approvedBy?: string;     // Quản trị viên duyệt (VD: Ban Quản Trị ADC / Hoàng Văn Nam)
  approvedAt?: string;     // Thời điểm quản trị viên phê duyệt
  status: BulletinStatus;  // 'published' = Đã duyệt, hiện trên Cổng Khách Hàng; 'draft'/'pending_review' = Ẩn
  isPinned?: boolean;      // Ghim nổi bật
  priority: BulletinPriority;
  createdAt: string;
  updatedAt: string;
}

export const RESULT_EDIT_LOCK_DAYS = 30;

export function getSavedMonthKey(dateInput?: string): string {
  if (dateInput) {
    const trimmed = dateInput.trim();
    const ymMatch = trimmed.match(/^(\d{4})-(\d{2})/);
    if (ymMatch) {
      return `${ymMatch[1]}-${ymMatch[2]}`;
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
    }
  }
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthLabel(monthKey: string): string {
  if (!monthKey || monthKey === 'all') return 'Tất cả các tháng';
  const match = monthKey.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    return `Tháng ${match[2]}/${match[1]}`;
  }
  return monthKey;
}

export function parseSavedDateMs(dateInput?: string): number | null {
  if (!dateInput) return null;
  const trimmed = dateInput.trim();
  const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    return Number.isNaN(localDate.getTime()) ? null : localDate.getTime();
  }
  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

export function getSavedResultElapsedDays(dateInput?: string): number {
  const ms = parseSavedDateMs(dateInput);
  if (ms === null) return 0;
  const diffDays = (Date.now() - ms) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.floor(diffDays));
}

export function isSavedResultLocked(
  dateInput?: string,
  lockDays: number = RESULT_EDIT_LOCK_DAYS
): boolean {
  const ms = parseSavedDateMs(dateInput);
  if (ms === null) return false;
  const diffDays = (Date.now() - ms) / (1000 * 60 * 60 * 24);
  return diffDays > lockDays;
}

export function getRemainingEditableDays(
  dateInput?: string,
  lockDays: number = RESULT_EDIT_LOCK_DAYS
): number {
  const ms = parseSavedDateMs(dateInput);
  if (ms === null) return lockDays;
  const diffDays = (Date.now() - ms) / (1000 * 60 * 60 * 24);
  if (diffDays > lockDays) return 0;
  return Math.max(0, Math.ceil(lockDays - diffDays));
}

export function formatShortStaffName(fullName: string = ''): string {
  if (!fullName) return '';
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length <= 1) return trimmed;
  if (parts.length === 2) return `${parts[0].charAt(0)}. ${parts[1]}`;
  const initials = parts.slice(0, -1).map(p => p.charAt(0).toUpperCase() + '.').join(' ');
  return `${initials} ${parts[parts.length - 1]}`;
}

export function getStaffInitials(fullName: string = ''): string {
  if (!fullName) return 'ADC';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return parts.map(p => p.charAt(0).toUpperCase()).join('');
}
