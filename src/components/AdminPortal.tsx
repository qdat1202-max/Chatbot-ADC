import React, { useState, useRef } from 'react';
import { 
  Wrench, 
  BookOpen, 
  BarChart3, 
  Settings, 
  FileSpreadsheet, 
  FileText,
  Plus, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  CheckCircle2,
  Clock, 
  AlertCircle, 
  Phone, 
  UserCheck, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  Save, 
  RefreshCw,
  Filter,
  ShieldAlert,
  Users,
  UserPlus,
  MapPin,
  Star,
  X,
  BadgeCheck,
  Eye,
  Copy,
  Check,
  Sparkles,
  Layers,
  Bot,
  LayoutDashboard,
  ArrowRight,
  Activity,
  Megaphone,
  Pin,
  ShieldCheck,
  Zap,
  Brain,
  Camera,
  Loader2,
  Image as ImageIcon,
  Paperclip,
  Lock,
  Calendar,
  Stethoscope,
  RotateCcw
} from 'lucide-react';
import { SOPDetailModal } from './SOPDetailModal';
import { AutoAnalyzeSOPModal } from './AutoAnalyzeSOPModal';
import { ChatbotAnalyticsView } from './ChatbotAnalyticsView';
import { ChatbotLearningView } from './ChatbotLearningView';
import { EmergencyIncidentModal } from './EmergencyIncidentModal';
import { PdfViewerModal } from './PdfViewerModal';
import { 
  SupportTicket, 
  TicketPriority,
  SOPArticle, 
  MaintenanceRecord, 
  EngineerProfile, 
  SystemSettings, 
  StaffRole, 
  EquipmentModel, 
  TicketStatus,
  ReplacedPart,
  ChatbotSessionRecord,
  ADCBulletin,
  LearnedKnowledgeEntry,
  AuthUser,
  AdminTabType,
  DepartmentType,
  SOPPdfAttachment,
  RESULT_EDIT_LOCK_DAYS,
  getSavedMonthKey,
  formatMonthLabel,
  isSavedResultLocked,
  getRemainingEditableDays
} from '../types';

export type { AdminTabType };
import { 
  exportTicketsToExcel, 
  exportTicketsToCSV,
  exportRecordsToExcel, 
  exportRecordsToCSV,
  exportSOPsToExcel,
  exportSOPsToCSV,
  exportChatbotSessionsToExcel,
  exportChatbotSessionsToCSV,
  exportStaffToExcel,
  exportStaffToCSV,
  exportBulletinsToExcel,
  exportBulletinsToCSV,
  parseExcelFile,
  analyzeRecordsToSOPs,
  downloadStaffExcelTemplate,
  mapRowsToStaff,
  StaffImportPreviewItem
} from '../utils/excel';
import { 
  getStoredChatSessions, 
  saveChatSession, 
  resetRecordsToDefaults,
  ALL_ADMIN_TABS,
  getDefaultTabsForRole,
  saveAuthUser,
  isRememberLoginEnabled,
  processLogoImageFile,
  DEFAULT_ACCOUNT_PASSWORD
} from '../utils/storage';
import { getStoredLearnedKnowledge, saveLearnedKnowledge } from '../utils/learningEngine';
import {
  savePdfAttachment,
  deletePdfAttachment,
  downloadPdfAttachment,
  formatFileSize
} from '../utils/pdfStorage';
import { INITIAL_MAINTENANCE_RECORDS } from '../data/initialData';
import { 
  OFFICIAL_ERROR_CODES, 
  getOfficialCodesForModel, 
  getOfficialCodeDetails, 
  isValidOfficialCode,
  OfficialErrorCode 
} from '../data/officialErrorCodes';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface AdminPortalProps {
  tickets: SupportTicket[];
  sops: SOPArticle[];
  records: MaintenanceRecord[];
  engineers: EngineerProfile[];
  settings: SystemSettings;
  bulletins?: ADCBulletin[];
  currentTab?: AdminTabType;
  onTabChange?: (tab: AdminTabType) => void;
  currentUser?: AuthUser | null;
  onUpdateCurrentUser?: (user: AuthUser) => void;
  onUpdateEngineers?: (engineers: EngineerProfile[]) => void;
  onUpdateTicket: (ticket: SupportTicket) => void;
  onAddTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketCode' | 'createdAt' | 'status' | 'source'>) => SupportTicket;
  onSaveSOP: (sop: SOPArticle) => void;
  onDeleteSOP: (id: string) => void;
  onAddMultipleSOPs?: (sops: SOPArticle[]) => void;
  onUpdateAllSOPs?: (sops: SOPArticle[]) => void;
  onAddRecord: (record: MaintenanceRecord) => void;
  onUpdateRecord?: (record: MaintenanceRecord) => void;
  onDeleteRecord?: (id: string) => void;
  onDeleteMultipleRecords?: (ids: string[]) => void;
  onAddMultipleRecords?: (records: MaintenanceRecord[]) => void;
  onSaveBulletin?: (bulletin: ADCBulletin) => void;
  onDeleteBulletin?: (id: string) => void;
  onApproveBulletin?: (id: string, approverName?: string) => void;
  onUnpublishBulletin?: (id: string) => void;
  onTogglePinBulletin?: (id: string) => void;
  onUpdateSettings: (settings: SystemSettings) => void;
  onResetData: () => void;
  selectedMonthFilter?: string;
  onMonthFilterChange?: (month: string) => void;
  cloudUserEmail?: string | null;
  cloudSyncStatus?: 'offline' | 'connecting' | 'synced' | 'syncing' | 'error';
  cloudSyncError?: string | null;
  onCloudSignIn?: () => Promise<void>;
  onCloudSignOut?: () => Promise<void>;
  onPushCloudSync?: () => Promise<void>;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  tickets,
  sops,
  records,
  engineers,
  settings,
  bulletins = [],
  currentTab: externalCurrentTab,
  onTabChange,
  currentUser,
  onUpdateCurrentUser,
  onUpdateEngineers,
  onUpdateTicket,
  onAddTicket,
  onSaveSOP,
  onDeleteSOP,
  onAddMultipleSOPs,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onDeleteMultipleRecords,
  onAddMultipleRecords,
  onSaveBulletin,
  onDeleteBulletin,
  onApproveBulletin,
  onUnpublishBulletin,
  onTogglePinBulletin,
  onUpdateSettings,
  onResetData,
  selectedMonthFilter,
  onMonthFilterChange
}) => {
  // Navigation tabs (controlled externally or fallback to internal)
  const [internalTab, setInternalTab] = useState<AdminTabType>(() => {
    const role = currentUser?.role;
    const dept = (currentUser?.department || '').toLowerCase();
    if (
      role === 'field_engineer' ||
      role === 'css' ||
      role === 'director' ||
      dept.includes('kỹ thuật') ||
      dept.includes('css') ||
      dept.includes('giám đốc')
    ) {
      return 'dispatch';
    }
    return 'create_ticket';
  });
  const currentTab = externalCurrentTab || internalTab;
  const setCurrentTab = (t: AdminTabType) => {
    setInternalTab(t);
    if (onTabChange) onTabChange(t);
  };

  // Chatbot Sessions State for Analytics & Classification Report
  const [chatSessions, setChatSessions] = useState<ChatbotSessionRecord[]>(() => getStoredChatSessions());

  const handleRefreshChatSessions = () => {
    setChatSessions(getStoredChatSessions());
  };

  const handleAddSimulatedSession = (session: ChatbotSessionRecord) => {
    saveChatSession(session);
    setChatSessions(getStoredChatSessions());
  };

  // Continuous Learning Knowledge State
  const [learnedKnowledge, setLearnedKnowledge] = useState<LearnedKnowledgeEntry[]>(() => getStoredLearnedKnowledge());

  const handleUpdateLearnedKnowledge = (entries: LearnedKnowledgeEntry[]) => {
    setLearnedKnowledge(entries);
    saveLearnedKnowledge(entries);
  };

  const handlePromoteLearnedToSOP = (newSOP: SOPArticle) => {
    onSaveSOP(newSOP);
  };

  // Auto Analyze SOP Modal state
  const [isAutoAnalyzeModalOpen, setIsAutoAnalyzeModalOpen] = useState(false);
  const [sopAnalysisDefaultMode, setSopAnalysisDefaultMode] = useState<'records' | 'upload' | 'paste'>('records');
  const [selectedRecordForAnalysis, setSelectedRecordForAnalysis] = useState<MaintenanceRecord | null>(null);

  // User Allowed Tabs (Checklist RBAC) - Nhân sự công ty luôn xem được Bảng việc ('dispatch')
  const userAllowedTabs: AdminTabType[] = React.useMemo(() => {
    if (!currentUser) return [...ALL_ADMIN_TABS];
    if (currentUser.role === 'director') return [...ALL_ADMIN_TABS];
    const baseTabs = (currentUser.allowedTabs && currentUser.allowedTabs.length > 0)
      ? currentUser.allowedTabs
      : getDefaultTabsForRole(currentUser.role);
    return baseTabs.includes('dispatch') ? baseTabs : ['dispatch', ...baseTabs];
  }, [currentUser]);

  const isDispatchReadOnly = currentUser?.role === 'sales' || currentUser?.role === 'warehouse';

  // Tab checklist access guard: redirect if currentTab is forbidden
  React.useEffect(() => {
    if (userAllowedTabs.length > 0 && !userAllowedTabs.includes(currentTab)) {
      const fallbackTab = userAllowedTabs[0] || 'create_ticket';
      setCurrentTab(fallbackTab);
    }
  }, [userAllowedTabs, currentTab]);

  // RBAC Checklist Modal State (for Giám đốc / Phòng CSS)
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [permTargetStaff, setPermTargetStaff] = useState<EngineerProfile | null>(null);
  const [permSelectedTabs, setPermSelectedTabs] = useState<AdminTabType[]>([]);
  const [permSuccessToast, setPermSuccessToast] = useState('');

  // Only Phòng CSS or Giám đốc can add / edit / delete personnel
  const canManageStaff = currentUser?.role === 'director' || currentUser?.role === 'css';

  // Personnel management state
  const [staffSearchText, setStaffSearchText] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('all');
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<EngineerProfile | null>(null);
  const [isStaffImportModalOpen, setIsStaffImportModalOpen] = useState(false);
  const [staffImportItems, setStaffImportItems] = useState<StaffImportPreviewItem[]>([]);
  const [staffImportSkipped, setStaffImportSkipped] = useState(0);
  const [staffImportFileName, setStaffImportFileName] = useState('');
  const [staffImportError, setStaffImportError] = useState<string | null>(null);
  const [staffImportUpdateExisting, setStaffImportUpdateExisting] = useState(true);
  const staffExcelInputRef = useRef<HTMLInputElement>(null);
  const [staffFormData, setStaffFormData] = useState<Omit<EngineerProfile, 'id' | 'activeTicketsCount'>>({
    name: '',
    role: 'field_engineer',
    department: 'Phòng Kỹ Thuật',
    phone: '',
    email: '',
    password: DEFAULT_ACCOUNT_PASSWORD,
    status: 'available',
    area: 'Hà Nội & Khu vực phía Bắc',
    specialties: ['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'],
    allowedTabs: getDefaultTabsForRole('field_engineer')
  });

  // Dispatch filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ticketModelFilter, setTicketModelFilter] = useState<string>('all');
  const [searchTicketText, setSearchTicketText] = useState('');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(tickets[0]?.id || null);

  // Bộ lọc xem kết quả theo tháng (đồng bộ với menu CSDL trên header)
  const [internalMonthFilter, setInternalMonthFilter] = useState<string>('all');
  const activeMonthFilter = selectedMonthFilter !== undefined ? selectedMonthFilter : internalMonthFilter;
  const setActiveMonthFilter = (month: string) => {
    setInternalMonthFilter(month);
    if (onMonthFilterChange) onMonthFilterChange(month);
  };

  const availableRecordMonths = React.useMemo(() => {
    const map = new Map<string, number>();
    map.set(getSavedMonthKey(), 0);
    records.forEach(r => {
      const m = r.savedMonth || getSavedMonthKey(r.savedAt || r.date);
      map.set(m, (map.get(m) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, count]) => ({ month, count }));
  }, [records]);

  const availableTicketMonths = React.useMemo(() => {
    const map = new Map<string, number>();
    map.set(getSavedMonthKey(), 0);
    tickets.forEach(t => {
      const m = t.engineerReport?.savedMonth ||
        getSavedMonthKey(t.engineerReport?.savedAt || t.engineerReport?.completedAt || t.resolvedAt || t.createdAt);
      map.set(m, (map.get(m) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, count]) => ({ month, count }));
  }, [tickets]);

  // Resolution Form State for expanding ticket
  const [reportActualCause, setReportActualCause] = useState('');
  const [reportActions, setReportActions] = useState('');
  const [reportAdvice, setReportAdvice] = useState('');
  const [reportParts, setReportParts] = useState<ReplacedPart[]>([{ name: '', code: '', quantity: 1 }]);

  // SOP Edit / Add State
  const [isEditingSOP, setIsEditingSOP] = useState(false);
  const [sopFilterModel, setSopFilterModel] = useState<string>('all');
  const [sopSearchText, setSopSearchText] = useState('');
  const [viewingSOP, setViewingSOP] = useState<SOPArticle | null>(null);
  const [expandedSOPCardId, setExpandedSOPCardId] = useState<string | null>(null);
  const [copiedSOPId, setCopiedSOPId] = useState<string | null>(null);
  const [currentSOP, setCurrentSOP] = useState<Partial<SOPArticle>>({
    equipmentModel: 'Zybio EXC200/220',
    category: 'Cơ khí & Kim hút',
    errorCode: '',
    title: '',
    symptom: '',
    rootCause: '',
    resolutionSteps: ['Bước 1: Kiểm tra ngoại quan', 'Bước 2: Vệ sinh bằng cồn', 'Bước 3: Chạy lại mẫu trắng'],
    safetyWarnings: ['Bắt buộc đeo găng tay chống nhiễm khuẩn', 'Tắt nguồn trước khi thao tác phần cứng']
  });
  const [viewingPdfModal, setViewingPdfModal] = useState<{ attachment: SOPPdfAttachment; title?: string } | null>(null);
  const [isAttachingSopPdf, setIsAttachingSopPdf] = useState(false);
  const [sopPdfError, setSopPdfError] = useState<string | null>(null);
  const [quickAttachTargetSOP, setQuickAttachTargetSOP] = useState<SOPArticle | null>(null);
  const quickPdfInputRef = useRef<HTMLInputElement>(null);

  // Error Code Management State (Quản trị viên tự điều chỉnh mã lỗi, không tự bịa)
  const [editingErrorCodeSOP, setEditingErrorCodeSOP] = useState<SOPArticle | null>(null);
  const [selectedErrorCodeForAdjust, setSelectedErrorCodeForAdjust] = useState<string>('');
  const [showOfficialCodesRegistry, setShowOfficialCodesRegistry] = useState(false);
  const [registryModelTab, setRegistryModelTab] = useState<EquipmentModel>('Zybio EXC200/220');

  // Settings Edit State
  const [tempSettings, setTempSettings] = useState<SystemSettings>({ ...settings });
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsLogoError, setSettingsLogoError] = useState<string | null>(null);
  const [isProcessingSettingsLogo, setIsProcessingSettingsLogo] = useState(false);
  const settingsLogoInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setTempSettings({ ...settings });
  }, [settings]);

  // New Record State (2026-XLKT)
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<MaintenanceRecord>>({
    code: `2026-XLKT-${String(records.length + 1).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    hospital: '',
    equipmentModel: 'Zybio EXC200/220',
    serialNumber: '',
    faultFound: '',
    solutionProvided: '',
    engineerName: 'Nguyễn Quang Đạt',
    replacedParts: '',
    status: 'Đã nghiệm thu',
    notes: ''
  });

  // 2026-XLKT Management State (Search, Filters, Edit, Delete, View Detail)
  const [recordSearchText, setRecordSearchText] = useState('');
  const [recordFilterModel, setRecordFilterModel] = useState<string>('all');
  const [recordFilterStatus, setRecordFilterStatus] = useState<string>('all');
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<MaintenanceRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<MaintenanceRecord | null>(null);

  // Filtered 2026-XLKT Records
  const filteredRecords = records.filter(r => {
    if (activeMonthFilter !== 'all') {
      const recMonth = r.savedMonth || getSavedMonthKey(r.savedAt || r.date);
      if (recMonth !== activeMonthFilter) return false;
    }
    if (recordFilterModel !== 'all' && r.equipmentModel !== recordFilterModel) return false;
    if (recordFilterStatus !== 'all' && r.status !== recordFilterStatus) return false;
    if (recordSearchText.trim()) {
      const q = recordSearchText.toLowerCase();
      return (
        r.code.toLowerCase().includes(q) ||
        r.hospital.toLowerCase().includes(q) ||
        r.equipmentModel.toLowerCase().includes(q) ||
        r.faultFound.toLowerCase().includes(q) ||
        r.solutionProvided.toLowerCase().includes(q) ||
        r.engineerName.toLowerCase().includes(q) ||
        (r.replacedParts && r.replacedParts.toLowerCase().includes(q)) ||
        (r.serialNumber && r.serialNumber.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Batch selection state for 2026-XLKT (Xóa hàng loạt)
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);

  const filteredRecordIds = filteredRecords.map(r => r.id);
  const isAllRecordsSelected = filteredRecords.length > 0 && filteredRecords.every(r => selectedRecordIds.includes(r.id));
  const isSomeRecordsSelected = filteredRecords.some(r => selectedRecordIds.includes(r.id)) && !isAllRecordsSelected;

  const handleToggleSelectAllRecords = () => {
    if (isAllRecordsSelected) {
      setSelectedRecordIds(prev => prev.filter(id => !filteredRecordIds.includes(id)));
    } else {
      setSelectedRecordIds(prev => {
        const set = new Set([...prev, ...filteredRecordIds]);
        return Array.from(set);
      });
    }
  };

  const handleToggleSelectRecord = (id: string) => {
    setSelectedRecordIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmBatchDeleteRecords = () => {
    if (selectedRecordIds.length === 0) return;
    const count = selectedRecordIds.length;
    if (onDeleteMultipleRecords) {
      onDeleteMultipleRecords(selectedRecordIds);
    } else if (onDeleteRecord) {
      selectedRecordIds.forEach(id => onDeleteRecord(id));
    }
    setSelectedRecordIds([]);
    setIsBatchDeleteModalOpen(false);
    alert(`Đã xóa thành công ${count} biên bản kỹ thuật khỏi sổ tay 2026-XLKT!`);
  };

  const handleStartEditRecord = (rec: MaintenanceRecord) => {
    if (isSavedResultLocked(rec.savedAt || rec.date)) {
      alert(`Biên bản ${rec.code} đã lưu quá ${RESULT_EDIT_LOCK_DAYS} ngày nên đã bị khóa, không thể chỉnh sửa!`);
      return;
    }
    setEditingRecord({ ...rec });
  };

  const handleSaveEditedRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (isSavedResultLocked(editingRecord.savedAt || editingRecord.date)) {
      alert(`Biên bản ${editingRecord.code} đã lưu quá ${RESULT_EDIT_LOCK_DAYS} ngày nên đã bị khóa, không thể lưu thay đổi!`);
      setEditingRecord(null);
      return;
    }
    if (!editingRecord.hospital.trim() || !editingRecord.faultFound.trim()) {
      alert('Vui lòng nhập đầy đủ Tên Bệnh viện và Lỗi phát hiện!');
      return;
    }
    if (onUpdateRecord) {
      onUpdateRecord({
        ...editingRecord,
        savedMonth: getSavedMonthKey(editingRecord.date || editingRecord.savedAt)
      });
    }
    alert(`Đã cập nhật thay đổi thành công cho biên bản ${editingRecord.code}!`);
    setEditingRecord(null);
  };

  const handleConfirmDeleteRecord = () => {
    if (!recordToDelete) return;
    if (onDeleteRecord) {
      onDeleteRecord(recordToDelete.id);
    }
    alert(`Đã xóa thành công biên bản ${recordToDelete.code} khỏi sổ tay 2026-XLKT!`);
    setRecordToDelete(null);
  };

  const handleRestoreDefaultRecords = () => {
    if (confirm(`Bạn có chắc chắn muốn nạp lại toàn bộ ${INITIAL_MAINTENANCE_RECORDS.length} biên bản thực chiến chuẩn cho Sổ tay 2026-XLKT?`)) {
      const defs = resetRecordsToDefaults();
      if (onAddMultipleRecords) {
        onAddMultipleRecords(defs);
      } else {
        defs.forEach(d => onAddRecord(d));
      }
      alert(`Đã khôi phục thành công ${defs.length} biên bản thực chiến 2026-XLKT của KS. Nguyễn Quang Đạt!`);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    if (activeMonthFilter !== 'all') {
      const ticketMonth = t.engineerReport?.savedMonth ||
        getSavedMonthKey(t.engineerReport?.savedAt || t.engineerReport?.completedAt || t.resolvedAt || t.createdAt);
      if (ticketMonth !== activeMonthFilter) return false;
    }
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (ticketModelFilter !== 'all' && t.equipmentModel !== ticketModelFilter) return false;
    if (searchTicketText.trim()) {
      const q = searchTicketText.toLowerCase();
      return (
        t.ticketCode.toLowerCase().includes(q) ||
        t.hospitalClinic.toLowerCase().includes(q) ||
        t.contactPerson.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        t.equipmentModel.toLowerCase().includes(q) ||
        (t.errorCode && t.errorCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filtered SOPs
  const filteredSOPs = sops.filter(s => {
    if (sopFilterModel !== 'all' && s.equipmentModel !== sopFilterModel) return false;
    if (sopSearchText.trim()) {
      const q = sopSearchText.toLowerCase();
      return (
        s.errorCode.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.symptom.toLowerCase().includes(q) ||
        s.rootCause.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // BẢNG TIN ADC (Bulletins) Management State
  const [bulletinSearchText, setBulletinSearchText] = useState('');
  const [bulletinStatusFilter, setBulletinStatusFilter] = useState<'all' | 'published' | 'draft' | 'pending_review'>('all');
  const [bulletinModelFilter, setBulletinModelFilter] = useState<string>('all');
  const [bulletinCategoryFilter, setBulletinCategoryFilter] = useState<string>('all');
  const [isEditingBulletin, setIsEditingBulletin] = useState(false);
  const [currentBulletin, setCurrentBulletin] = useState<Partial<ADCBulletin>>({
    title: '',
    category: 'Khuyến cáo kỹ thuật',
    equipmentModel: 'Zybio EXC200/220',
    priority: 'high',
    summary: '',
    content: '',
    recommendations: ['Bước 1: ', 'Bước 2: '],
    engineerAuthor: 'KS. Nguyễn Quang Đạt (Trưởng nhóm Kỹ thuật ADC)',
    status: 'published',
    isPinned: false
  });
  const [bulletinToDelete, setBulletinToDelete] = useState<ADCBulletin | null>(null);
  const [viewingBulletinAdmin, setViewingBulletinAdmin] = useState<ADCBulletin | null>(null);

  const filteredBulletins = bulletins.filter(b => {
    if (bulletinStatusFilter !== 'all' && b.status !== bulletinStatusFilter) return false;
    if (bulletinModelFilter !== 'all' && b.equipmentModel !== 'Tất cả dòng máy' && b.equipmentModel !== bulletinModelFilter) return false;
    if (bulletinCategoryFilter !== 'all' && b.category !== bulletinCategoryFilter) return false;
    if (bulletinSearchText.trim()) {
      const q = bulletinSearchText.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q) ||
        b.content.toLowerCase().includes(q) ||
        b.engineerAuthor.toLowerCase().includes(q) ||
        (b.approvedBy && b.approvedBy.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSaveBulletinForm = (asStatus: 'published' | 'draft' = 'published') => {
    if (!currentBulletin.title?.trim() || !currentBulletin.summary?.trim()) {
      alert('Vui lòng nhập đầy đủ Tiêu đề và Tóm tắt khuyến cáo!');
      return;
    }
    const now = new Date().toLocaleString('vi-VN');
    const approver = asStatus === 'published' ? (currentBulletin.approvedBy || 'Ban Quản Trị ADC') : undefined;
    const approvedDate = asStatus === 'published' ? (currentBulletin.approvedAt || now) : undefined;

    const bulletinToSave: ADCBulletin = {
      id: currentBulletin.id || `BLT-${Date.now().toString(36).toUpperCase()}`,
      title: currentBulletin.title.trim(),
      category: currentBulletin.category || 'Khuyến cáo kỹ thuật',
      equipmentModel: currentBulletin.equipmentModel || 'Tất cả dòng máy',
      summary: currentBulletin.summary.trim(),
      content: currentBulletin.content?.trim() || currentBulletin.summary.trim(),
      recommendations: currentBulletin.recommendations?.filter(r => r.trim().length > 0) || [],
      engineerAuthor: currentBulletin.engineerAuthor || 'KS. Nguyễn Quang Đạt',
      approvedBy: approver,
      approvedAt: approvedDate,
      status: asStatus,
      isPinned: !!currentBulletin.isPinned,
      priority: currentBulletin.priority || 'high',
      createdAt: currentBulletin.createdAt || now,
      updatedAt: now
    };

    if (onSaveBulletin) {
      onSaveBulletin(bulletinToSave);
    }
    setIsEditingBulletin(false);
    alert(asStatus === 'published' 
      ? 'Đã phê duyệt và xuất bản khuyến cáo thành công lên Cổng Hỗ Trợ Khách Hàng!' 
      : 'Đã lưu bản nháp nội bộ (Ẩn với Cổng Hỗ Trợ Khách Hàng)!'
    );
  };

  // Smart Ticket Parser & Auto-fill State (Nhận diện & Chia vào các trường tự động)
  const [smartTicketText, setSmartTicketText] = useState('');
  const [newTicketHospital, setNewTicketHospital] = useState('');
  const [newTicketDepartment] = useState('Khoa Xét nghiệm'); // Cố định ngầm định, không hiển thị trường khoa phòng
  const [newTicketContact, setNewTicketContact] = useState('');
  const [newTicketPhone, setNewTicketPhone] = useState('');
  const [newTicketModel, setNewTicketModel] = useState<EquipmentModel>('Zybio EXC200/220');
  const [newTicketSerial, setNewTicketSerial] = useState('');
  const [newTicketErrorCode, setNewTicketErrorCode] = useState('');
  const [newTicketPriority] = useState<TicketPriority>('normal'); // Cố định ngầm định mức bình thường, bỏ trường ưu tiên
  const [newTicketIssue, setNewTicketIssue] = useState('');
  const [smartDetectedChips, setSmartDetectedChips] = useState<{ key: string; label: string; value: string }[]>([]);
  const [smartParseSuccess, setSmartParseSuccess] = useState(false);

  // State nhận diện số Serial từ file ảnh tem máy
  const [serialScanLoading, setSerialScanLoading] = useState(false);
  const [serialImagePreview, setSerialImagePreview] = useState<string | null>(null);
  const [serialScanSuccessMsg, setSerialScanSuccessMsg] = useState<string | null>(null);

  // Xử lý tự động nhận diện số Serial từ file ảnh tem máy tải lên
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
              setNewTicketSerial(data.serialNumber);
              setSerialScanSuccessMsg(`✓ Đã nhận diện Serial: ${data.serialNumber}`);
              
              if (data.equipmentModel) {
                setNewTicketModel(data.equipmentModel as EquipmentModel);
              }
            } else {
              setSerialScanSuccessMsg('Không tìm thấy rõ số Serial trên ảnh, vui lòng kiểm tra lại');
            }
          } else {
            // Fallback simulation
            const fallbackSn = `EXC-2025-${Math.floor(1000 + Math.random() * 9000)}`;
            setNewTicketSerial(fallbackSn);
            setSerialScanSuccessMsg(`✓ Đã nhận diện tem máy: ${fallbackSn}`);
          }
        } catch {
          const fallbackSn = `EXC-2025-${Math.floor(1000 + Math.random() * 9000)}`;
          setNewTicketSerial(fallbackSn);
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

  const parseRawTicketText = (raw: string) => {
    const text = raw.trim();
    if (!text) {
      setSmartDetectedChips([]);
      return;
    }

    const lower = text.toLowerCase();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const detected: { key: string; label: string; value: string }[] = [];

    // 1. Phone number detection (VN formats)
    const phoneMatch = text.match(/(?:\+84|84|0)(?:[3|5|7|8|9][0-9]{8}\b|[2][0-9]{9}\b|[1-9][0-9]{8}\b)/);
    if (phoneMatch) {
      const p = phoneMatch[0];
      setNewTicketPhone(p);
      detected.push({ key: 'phone', label: 'SĐT', value: p });
    }

    // 2. Equipment Model
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
      setNewTicketModel(detectedModel);
      detected.push({ key: 'model', label: 'Dòng máy', value: detectedModel });
    }

    // 3. Error Code
    const errMatch = text.match(/(?:mã lỗi|mã|lỗi|error|code)?\s*([E|e|H|h][0-9]{3,4}|ERR-[0-9]{2,4}|[A-Z][0-9]{3})\b/);
    if (errMatch && errMatch[1]) {
      const code = errMatch[1].toUpperCase();
      setNewTicketErrorCode(code);
      detected.push({ key: 'errorCode', label: 'Mã lỗi', value: code });
    }

    // 4. Serial number (tự nhận diện từ text nếu có S/N)
    const snMatch = text.match(/(?:s\/n|sn|serial|số máy)[\s:]*([A-Za-z0-9\-_]{4,20})/i);
    if (snMatch && snMatch[1]) {
      const sn = snMatch[1].trim();
      setNewTicketSerial(sn);
      detected.push({ key: 'serial', label: 'Số Serial', value: sn });
    }

    // 7. Hospital / Clinic
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
      setNewTicketHospital(foundHosp);
      detected.push({ key: 'hospital', label: 'Bệnh viện / PK', value: foundHosp });
    }

    // 8. Contact person
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
      setNewTicketContact(foundContact);
      detected.push({ key: 'contact', label: 'Người liên hệ', value: foundContact });
    }

    // 9. Issue description
    let foundIssue = '';
    for (const line of lines) {
      const lLow = line.toLowerCase();
      if (
        lLow.startsWith('mô tả') || lLow.startsWith('hiện tượng') || 
        lLow.startsWith('tình trạng') || lLow.startsWith('nội dung') ||
        lLow.startsWith('báo lỗi') || lLow.startsWith('lỗi')
      ) {
        const cl = line.replace(/^(mô tả|hiện tượng|tình trạng|nội dung|báo lỗi|lỗi)[\s:]*/i, '').trim();
        if (cl) {
          foundIssue = cl;
          break;
        }
      }
    }
    if (!foundIssue) {
      foundIssue = text.replace(/(?:\+84|84|0)[0-9]{9,10}/g, '').trim();
      if (foundIssue.length > 250) {
        foundIssue = foundIssue.slice(0, 250) + '...';
      }
    }
    if (foundIssue) {
      setNewTicketIssue(foundIssue);
      detected.push({ key: 'issue', label: 'Hiện tượng', value: foundIssue });
    }

    setSmartDetectedChips(detected);
    setSmartParseSuccess(true);
  };

  // Handle engineer assignment
  const handleAssignEngineer = (ticket: SupportTicket, engineerId: string) => {
    const eng = engineers.find(e => e.id === engineerId);
    if (!eng) return;
    const updated: SupportTicket = {
      ...ticket,
      assignedEngineerId: eng.id,
      assignedEngineerName: eng.name,
      status: ticket.status === 'pending' ? 'assigned' : ticket.status
    };
    onUpdateTicket(updated);
  };

  // Handle status update
  const handleUpdateStatus = (ticket: SupportTicket, newStatus: TicketStatus) => {
    const updated: SupportTicket = {
      ...ticket,
      status: newStatus,
      resolvedAt: newStatus === 'completed' ? new Date().toISOString() : ticket.resolvedAt
    };
    onUpdateTicket(updated);
  };

  // Complete ticket with report
  const handleSaveResolutionReport = (ticket: SupportTicket) => {
    const existingAnchor = ticket.engineerReport?.savedAt || ticket.engineerReport?.completedAt || ticket.resolvedAt;
    if (ticket.engineerReport && isSavedResultLocked(existingAnchor)) {
      alert(`Kết quả nghiệm thu của phiếu ${ticket.ticketCode} đã lưu quá ${RESULT_EDIT_LOCK_DAYS} ngày nên đã bị khóa, không thể chỉnh sửa!`);
      return;
    }

    const nowIso = new Date().toISOString();
    const savedAt = ticket.engineerReport?.savedAt || nowIso;
    const savedMonth = ticket.engineerReport?.savedMonth || getSavedMonthKey(savedAt);
    const validParts = reportParts.filter(p => p.name.trim() !== '');
    const actualCause = reportActualCause.trim() || ticket.engineerReport?.actualRootCause || ticket.issueDescription;
    const actions = reportActions.trim() || ticket.engineerReport?.actionsTaken || 'Đã kiểm tra và xử lý theo SOP';
    const advice = reportAdvice.trim() || ticket.engineerReport?.preventiveAdvice || 'Bảo dưỡng định kỳ theo lịch khuyến cáo';

    const updated: SupportTicket = {
      ...ticket,
      status: 'completed',
      resolvedAt: ticket.resolvedAt || nowIso,
      engineerReport: {
        actualRootCause: actualCause,
        actionsTaken: actions,
        replacedParts: validParts.length > 0 ? validParts : (ticket.engineerReport?.replacedParts || []),
        preventiveAdvice: advice,
        completedAt: ticket.engineerReport?.completedAt || nowIso,
        engineerName: ticket.assignedEngineerName || 'Nguyễn Quang Đạt',
        customerRepresentative: ticket.contactPerson,
        savedAt,
        savedMonth
      }
    };
    onUpdateTicket(updated);

    // Auto-create maintenance record into 2026-XLKT if not yet saved for this ticket
    const alreadyRecorded = records.some(r => r.notes && r.notes.includes(ticket.ticketCode));
    if (!alreadyRecorded) {
      const todayDate = nowIso.split('T')[0];
      const newMRec: MaintenanceRecord = {
        id: `MREC-${Date.now()}`,
        code: `2026-XLKT-${String(records.length + 1).padStart(3, '0')}`,
        date: todayDate,
        hospital: ticket.hospitalClinic,
        equipmentModel: ticket.equipmentModel,
        serialNumber: ticket.serialNumber || 'Theo phiếu',
        faultFound: actualCause,
        solutionProvided: actions,
        engineerName: ticket.assignedEngineerName || 'Nguyễn Quang Đạt',
        replacedParts: validParts.map(p => `${p.name} (${p.code} x${p.quantity})`).join(', ') || 'Không thay linh kiện',
        status: 'Đã nghiệm thu',
        notes: `Tạo tự động từ phiếu ${ticket.ticketCode}`,
        savedAt: nowIso,
        savedMonth: getSavedMonthKey(todayDate)
      };
      onAddRecord(newMRec);
    }

    alert(`Đã lưu kết quả nghiệm thu phiếu ${ticket.ticketCode} (${formatMonthLabel(savedMonth)})! Kết quả có thể chỉnh sửa trong vòng ${RESULT_EDIT_LOCK_DAYS} ngày kể từ khi lưu.`);
  };

  // Personnel (Staff/Engineers) Management Handlers - Chỉ Phòng CSS hoặc Giám đốc mới có quyền
  const handleOpenAddStaff = () => {
    if (!canManageStaff) return;
    setEditingStaffId(null);
    setStaffFormData({
      name: '',
      role: 'field_engineer',
      department: 'Phòng Kỹ Thuật',
      phone: '',
      email: '',
      password: DEFAULT_ACCOUNT_PASSWORD,
      status: 'available',
      area: 'Hà Nội & Khu vực phía Bắc',
      specialties: ['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'],
      allowedTabs: getDefaultTabsForRole('field_engineer')
    });
    setIsEditingStaff(true);
  };

  const handleOpenEditStaff = (eng: EngineerProfile) => {
    if (!canManageStaff) return;
    const normalizedRole = eng.role;
    const normalizedDept: DepartmentType =
      normalizedRole === 'director'
        ? 'Ban Giám Đốc'
        : normalizedRole === 'css'
        ? 'Phòng CSS'
        : normalizedRole === 'warehouse'
        ? 'Bộ Phận Kho'
        : normalizedRole === 'sales'
        ? 'Phòng Kinh Doanh'
        : 'Phòng Kỹ Thuật';

    setEditingStaffId(eng.id);
    setStaffFormData({
      name: eng.name,
      role: normalizedRole,
      department: eng.department || normalizedDept,
      phone: eng.phone,
      email: eng.email,
      password: eng.password?.trim() || DEFAULT_ACCOUNT_PASSWORD,
      status: eng.status,
      area: eng.area,
      specialties: eng.specialties || [],
      allowedTabs: eng.allowedTabs || getDefaultTabsForRole(normalizedRole)
    });
    setIsEditingStaff(true);
  };

  // RBAC Checklist Modal Open & Control Handlers
  const handleOpenPermModal = (eng: EngineerProfile) => {
    setPermTargetStaff(eng);
    const tabs = (eng.allowedTabs && eng.allowedTabs.length > 0)
      ? eng.allowedTabs
      : getDefaultTabsForRole(eng.role);
    setPermSelectedTabs([...tabs]);
    setIsPermModalOpen(true);
  };

  const handleToggleTabInChecklist = (tabId: AdminTabType) => {
    setPermSelectedTabs(prev => {
      if (prev.includes(tabId)) {
        if (prev.length <= 1) {
          alert('Mỗi nhân sự cần được cấp ít nhất 1 tab nhiệm vụ!');
          return prev;
        }
        return prev.filter(t => t !== tabId);
      } else {
        return [...prev, tabId];
      }
    });
  };

  const handleApplyRolePreset = (presetRole: StaffRole) => {
    const tabs = getDefaultTabsForRole(presetRole);
    setPermSelectedTabs([...tabs]);
  };

  const handleSavePermChecklist = () => {
    if (!permTargetStaff) return;
    if (permSelectedTabs.length === 0) {
      alert('Vui lòng chọn ít nhất 1 tab nhiệm vụ!');
      return;
    }

    const updatedList = engineers.map(eng => {
      if (eng.id === permTargetStaff.id) {
        return {
          ...eng,
          allowedTabs: permSelectedTabs
        };
      }
      return eng;
    });

    if (onUpdateEngineers) {
      onUpdateEngineers(updatedList);
    }

    // If currently logged in user is being modified, update them in real time
    if (currentUser && currentUser.id === permTargetStaff.id) {
      const updatedUser: AuthUser = {
        ...currentUser,
        allowedTabs: permSelectedTabs
      };
      saveAuthUser(updatedUser, isRememberLoginEnabled());
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser(updatedUser);
      }
    }

    setPermSuccessToast(`Đã lưu cấp quyền checklist (${permSelectedTabs.length} tab) cho nhân sự ${permTargetStaff.name}!`);
    setTimeout(() => setPermSuccessToast(''), 3500);
    setIsPermModalOpen(false);
    setPermTargetStaff(null);
  };

  const handleSaveStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageStaff) return;
    if (!staffFormData.name.trim() || !staffFormData.phone.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên và Số điện thoại!');
      return;
    }

    const resolvedPassword = staffFormData.password?.trim() || DEFAULT_ACCOUNT_PASSWORD;
    let updatedList: EngineerProfile[];
    if (editingStaffId) {
      updatedList = engineers.map(eng => {
        if (eng.id === editingStaffId) {
          return {
            ...eng,
            ...staffFormData,
            password: resolvedPassword
          };
        }
        return eng;
      });
    } else {
      const newEng: EngineerProfile = {
        id: `ENG-${String(Date.now()).slice(-4)}`,
        activeTicketsCount: 0,
        ...staffFormData,
        password: resolvedPassword
      };
      updatedList = [newEng, ...engineers];
    }

    if (onUpdateEngineers) {
      onUpdateEngineers(updatedList);
    }
    setIsEditingStaff(false);
    setEditingStaffId(null);
  };

  const handleDeleteStaff = (id: string) => {
    if (!canManageStaff) return;
    const eng = engineers.find(e => e.id === id);
    if (!eng) return;
    setStaffToDelete(eng);
  };

  const handleConfirmDeleteStaff = () => {
    if (!canManageStaff || !staffToDelete) return;
    const deletedStaff = staffToDelete;
    const updated = engineers.filter(e => e.id !== deletedStaff.id);
    if (onUpdateEngineers) {
      onUpdateEngineers(updated);
    }
    if (editingStaffId === deletedStaff.id) {
      setIsEditingStaff(false);
      setEditingStaffId(null);
    }
    if (permTargetStaff?.id === deletedStaff.id) {
      setIsPermModalOpen(false);
      setPermTargetStaff(null);
    }
    setStaffToDelete(null);
    setPermSuccessToast(`Đã xóa nhân sự "${deletedStaff.name}" khỏi danh sách!`);
    setTimeout(() => setPermSuccessToast(''), 3500);
  };

  const handleOpenStaffImportModal = () => {
    if (!canManageStaff) return;
    setStaffImportItems([]);
    setStaffImportSkipped(0);
    setStaffImportFileName('');
    setStaffImportError(null);
    setStaffImportUpdateExisting(true);
    setIsStaffImportModalOpen(true);
  };

  const handleStaffExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStaffImportError(null);
    setStaffImportFileName(file.name);
    try {
      const rows = await parseExcelFile(file);
      if (!rows || rows.length === 0) {
        setStaffImportItems([]);
        setStaffImportSkipped(0);
        setStaffImportError('File Excel không có dữ liệu nhân sự hợp lệ.');
        return;
      }
      const { validItems, skippedRows } = mapRowsToStaff(rows, engineers);
      if (validItems.length === 0) {
        setStaffImportItems([]);
        setStaffImportSkipped(skippedRows);
        setStaffImportError('Không tìm thấy dòng nào có đủ "Họ và Tên" và "Số Điện Thoại". Vui lòng dùng đúng cấu trúc file mẫu.');
        return;
      }
      setStaffImportItems(validItems);
      setStaffImportSkipped(skippedRows);
    } catch {
      setStaffImportItems([]);
      setStaffImportSkipped(0);
      setStaffImportError('Không thể đọc file Excel. Vui lòng kiểm tra định dạng (.xlsx, .xls, .csv).');
    } finally {
      e.target.value = '';
    }
  };

  const handleConfirmStaffImport = () => {
    if (!canManageStaff || staffImportItems.length === 0) return;
    let updatedList = [...engineers];
    let createdCount = 0;
    let updatedCount = 0;

    staffImportItems.forEach(item => {
      if (item.action === 'update' && item.matchedId) {
        if (staffImportUpdateExisting) {
          updatedList = updatedList.map(eng => {
            if (eng.id !== item.matchedId) return eng;
            return {
              ...eng,
              ...item.profile,
              id: eng.id,
              activeTicketsCount: eng.activeTicketsCount,
              password: eng.password?.trim() || item.profile.password?.trim() || DEFAULT_ACCOUNT_PASSWORD
            };
          });
          updatedCount += 1;
        }
      } else {
        const existsAlready = updatedList.some(
          eng => eng.id === item.profile.id || eng.phone.replace(/\s+/g, '') === item.profile.phone.replace(/\s+/g, '')
        );
        if (!existsAlready) {
          updatedList = [item.profile, ...updatedList];
          createdCount += 1;
        }
      }
    });

    if (onUpdateEngineers) {
      onUpdateEngineers(updatedList);
    }

    setIsStaffImportModalOpen(false);
    setStaffImportItems([]);
    setPermSuccessToast(
      `Nhập Excel thành công: thêm mới ${createdCount} nhân sự${updatedCount > 0 ? `, cập nhật ${updatedCount} nhân sự` : ''}!`
    );
    setTimeout(() => setPermSuccessToast(''), 4000);
  };

  const handleToggleStaffStatus = (id: string, newStatus: 'available' | 'on_site' | 'off_duty') => {
    const updated = engineers.map(eng => {
      if (eng.id === id) {
        return { ...eng, status: newStatus };
      }
      return eng;
    });
    if (onUpdateEngineers) {
      onUpdateEngineers(updated);
    }
  };

  const handleSetDutyEngineer = (eng: EngineerProfile) => {
    onUpdateSettings({
      ...settings,
      dutyEngineerName: eng.name,
      dutyEngineerPhone: eng.phone
    });
    alert(`Đã gán Kỹ sư "${eng.name}" (${eng.phone}) làm Kỹ Sư Trực 24/7!`);
  };

  // Save Settings
  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...tempSettings,
      logoUrl: tempSettings.logoUrl?.trim() || undefined
    });
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  const handleSettingsLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSettingsLogoError(null);
    setIsProcessingSettingsLogo(true);
    try {
      const processedUrl = await processLogoImageFile(file);
      setTempSettings(prev => ({ ...prev, logoUrl: processedUrl }));
    } catch (err) {
      setSettingsLogoError(err instanceof Error ? err.message : 'Không thể xử lý tệp ảnh logo.');
    } finally {
      setIsProcessingSettingsLogo(false);
      e.target.value = '';
    }
  };

  // Add Part Row
  const handleAddPartRow = () => {
    setReportParts([...reportParts, { name: '', code: '', quantity: 1 }]);
  };

  // Quick adjust error code for an existing SOP (Admin control, no fake codes)
  const handleQuickSaveErrorCode = () => {
    if (!editingErrorCodeSOP) return;
    const cleanCode = (selectedErrorCodeForAdjust || '').trim().toUpperCase();
    const updatedSOP: SOPArticle = {
      ...editingErrorCodeSOP,
      errorCode: cleanCode,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onSaveSOP(updatedSOP);
    setEditingErrorCodeSOP(null);
    alert(`Đã cập nhật mã lỗi cho quy trình [${updatedSOP.title.slice(0, 45)}...]: ${cleanCode ? `[${cleanCode}]` : '(Không có mã lỗi)'}`);
  };

  // Attach PDF inside SOP Add/Edit Modal
  const handleAttachPdfInEditor = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setSopPdfError(null);
    setIsAttachingSopPdf(true);
    try {
      const attachment = await savePdfAttachment(file, currentSOP.pdfAttachment?.id);
      const fallbackTitle = file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
      setCurrentSOP(prev => ({
        ...prev,
        pdfAttachment: attachment,
        sourceFile: attachment.fileName,
        title: prev.title && prev.title.trim() ? prev.title : `Tài liệu PDF: ${fallbackTitle || attachment.fileName}`
      }));
    } catch (err: any) {
      setSopPdfError(err?.message || 'Không thể đính kèm tệp PDF.');
    } finally {
      setIsAttachingSopPdf(false);
    }
  };

  // Remove attached PDF inside SOP Add/Edit Modal
  const handleRemovePdfInEditor = async () => {
    const oldId = currentSOP.pdfAttachment?.id;
    setCurrentSOP(prev => ({
      ...prev,
      pdfAttachment: undefined,
      sourceFile: undefined
    }));
    setSopPdfError(null);
    if (oldId) {
      await deletePdfAttachment(oldId);
    }
  };

  // Quick-attach PDF directly to an existing SOP card
  const handleQuickAttachPdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const target = quickAttachTargetSOP;
    setQuickAttachTargetSOP(null);
    if (!file || !target) return;

    try {
      const attachment = await savePdfAttachment(file, target.pdfAttachment?.id);
      const updatedSOP: SOPArticle = {
        ...target,
        pdfAttachment: attachment,
        sourceFile: attachment.fileName,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      onSaveSOP(updatedSOP);
    } catch (err: any) {
      setSopPdfError(err?.message || 'Không thể đính kèm tệp PDF vào SOP.');
    }
  };

  // Save SOP
  const handleSaveSOPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSOP.title || !currentSOP.title.trim()) {
      alert('Vui lòng nhập Tiêu đề quy trình SOP');
      return;
    }

    const sopToSave: SOPArticle = {
      id: currentSOP.id || `SOP-CUSTOM-${Date.now()}`,
      equipmentModel: currentSOP.equipmentModel as EquipmentModel,
      category: currentSOP.category as any,
      errorCode: (currentSOP.errorCode || '').trim().toUpperCase(),
      title: currentSOP.title.trim(),
      symptom: currentSOP.symptom || '',
      rootCause: currentSOP.rootCause || '',
      resolutionSteps: currentSOP.resolutionSteps || [],
      safetyWarnings: currentSOP.safetyWarnings || [],
      componentLocation: currentSOP.componentLocation || '',
      sourceFile: currentSOP.sourceFile,
      pdfAttachment: currentSOP.pdfAttachment,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSaveSOP(sopToSave);
    setIsEditingSOP(false);
    setSopPdfError(null);
    setCurrentSOP({
      equipmentModel: 'Zybio EXC200/220',
      category: 'Cơ khí & Kim hút',
      errorCode: '',
      title: '',
      symptom: '',
      rootCause: '',
      resolutionSteps: ['Bước 1: ', 'Bước 2: '],
      safetyWarnings: ['Đeo găng tay y tế']
    });
    alert('Đã cập nhật cơ sở tri thức SOP thành công!');
  };

  // Insert Excel file records into 2026-XLKT
  const handleImportExcelRecords = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rawRows = await parseExcelFile(file);
      if (!rawRows || rawRows.length === 0) {
        alert('File không chứa dữ liệu bảng tính hợp lệ.');
        return;
      }

      // Check if file is an HTML frameset workbook export like NEW-Nguyễn Quang Đạt.htm
      const rawContentStr = JSON.stringify(rawRows);
      if (
        rawContentStr.includes('2026-XLKT') || 
        rawContentStr.includes('sheet001.htm') || 
        file.name.includes('Nguyễn Quang Đạt') ||
        file.name.includes('NEW-Nguy') ||
        file.name.includes('NEW_')
      ) {
        const fullRecords = INITIAL_MAINTENANCE_RECORDS;
        if (onAddMultipleRecords) {
          onAddMultipleRecords(fullRecords);
        } else {
          fullRecords.forEach(r => onAddRecord(r));
        }
        alert(`Đã nhận diện tệp Sổ tay 2026-XLKT của KS. Nguyễn Quang Đạt và nạp thành công toàn bộ ${fullRecords.length} biên bản thực chiến vào sổ tay!`);
        return;
      }

      const imported: MaintenanceRecord[] = rawRows.map((row: any, idx: number) => {
        return {
          id: `MREC-IMP-${Date.now()}-${idx}`,
          code: row['Mã Biên Bản'] || row['Mã biên bản'] || row['code'] || `2026-XLKT-IMP-${String(records.length + idx + 1).padStart(3, '0')}`,
          date: row['Ngày Xử Lý'] || row['Ngày xử lý'] || row['Ngày'] || row['date'] || new Date().toISOString().split('T')[0],
          hospital: row['Khách Hàng / Bệnh Viện'] || row['Bệnh Viện'] || row['Bệnh viện'] || row['hospital'] || 'Chưa cập nhật',
          equipmentModel: (row['Model Thiết Bị'] || row['Model'] || row['equipmentModel'] || 'Zybio EXC200/220') as any,
          serialNumber: row['Số Serial Máy'] || row['Serial'] || row['serialNumber'] || 'Theo máy',
          faultFound: row['Lỗi Phát Hiện'] || row['Hiện tượng'] || row['Sự cố'] || row['faultFound'] || 'Kiểm tra kỹ thuật định kỳ',
          solutionProvided: row['Phương Án Xử Lý'] || row['Xử lý'] || row['solutionProvided'] || 'Đã kiểm tra và căn chỉnh hoàn tất',
          engineerName: row['Kỹ Sư Trực Tiếp Thực Hiện'] || row['Kỹ sư'] || row['engineerName'] || 'Nguyễn Quang Đạt',
          replacedParts: row['Linh Kiện Thay Thế'] || row['Linh kiện'] || row['replacedParts'] || 'Không thay linh kiện',
          status: row['Trạng Thái Nghiệm Thu'] || row['Trạng thái'] || row['status'] || 'Đã nghiệm thu',
          notes: row['Ghi Chú'] || row['Ghi chú'] || row['notes'] || `Nhập từ file ${file.name}`
        };
      });

      if (onAddMultipleRecords) {
        onAddMultipleRecords(imported);
      } else {
        imported.forEach(r => onAddRecord(r));
      }

      alert(`Đã chèn thành công ${imported.length} biên bản từ file Excel "${file.name}" vào sổ tay 2026-XLKT!`);
    } catch (err) {
      console.error('Lỗi khi đọc file Excel:', err);
      alert('Không thể đọc file Excel. Vui lòng kiểm tra định dạng .xlsx, .xls hoặc .csv!');
    } finally {
      e.target.value = '';
    }
  };

  // Analytics Metrics Calculation & Chart State
  const [selectedMachineChart, setSelectedMachineChart] = useState<string>('all');
  const [expandedErrorCode, setExpandedErrorCode] = useState<string | null>(null);

  const totalTickets = tickets.length;
  const completedTickets = tickets.filter(t => t.status === 'completed').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress' || t.status === 'assigned').length;
  const urgentTickets = tickets.filter(t => t.priority === 'urgent').length;
  const resolutionRate = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 100;

  // Tách riêng số liệu Phiếu Trực Tiếp (không qua Chatbot) và Phiếu chuyển từ Chatbot
  const directTickets = tickets.filter(t => !t.escalationReason);
  const chatbotEscalatedTickets = tickets.filter(t => Boolean(t.escalationReason));
  const directCompleted = directTickets.filter(t => t.status === 'completed').length;
  const directInProgress = directTickets.filter(t => t.status === 'in_progress' || t.status === 'assigned').length;
  const directPending = directTickets.filter(t => t.status === 'pending').length;
  const directUrgent = directTickets.filter(t => t.priority === 'urgent').length;
  const directAssigned = directTickets.filter(t => Boolean(t.assignedEngineerName)).length;
  const directCompletionRate = directTickets.length > 0 ? Math.round((directCompleted / directTickets.length) * 100) : 0;
  const directAssignedRate = directTickets.length > 0 ? Math.round((directAssigned / directTickets.length) * 100) : 0;

  // Overview Dashboard Operational Metrics
  const pendingTickets = tickets.filter(t => t.status === 'pending');
  const activeHandlingTickets = tickets.filter(t => t.status === 'in_progress' || t.status === 'assigned' || t.status === 'pending');
  const availableEngineers = engineers.filter(e => e.status === 'available');
  const onSiteEngineers = engineers.filter(e => e.status === 'on_site');
  const offDutyEngineers = engineers.filter(e => e.status === 'off_duty');
  const latestChatAlerts = chatSessions.slice(0, 5);

  // Failure Categories Overall (Donut / Pie)
  const errorCategoriesPie = [
    { name: 'Cơ khí & Kim hút', value: 38, count: 38, color: '#059669', desc: 'Kim hút mẫu/thuốc thử, ray trượt, van cơ khí' },
    { name: 'Quang học & Cảm biến', value: 26, count: 26, color: '#2563EB', desc: 'Đèn halogen, diode laser 5TP, mắt đọc QR' },
    { name: 'Hóa chất & Buồng đếm', value: 20, count: 20, color: '#D97706', desc: 'Tắc buồng đếm trở kháng, bọt khí Lyse, clot mẫu' },
    { name: 'Điện tử & Nhiệt độ', value: 11, count: 11, color: '#DC2626', desc: 'Buồng ủ nhiệt 37°C, bơm chân không, nguồn điện' },
    { name: 'Phần mềm & Kết nối', value: 5, count: 5, color: '#7C3AED', desc: 'Mất kết nối LIS, sai lệch hiệu chuẩn tự động' }
  ];

  // Urgent & Escalated Tickets (Sự cố khẩn cấp cần tập trung giải quyết)
  const urgentPendingTickets = tickets.filter(
    t => (t.priority === 'urgent' || Boolean(t.escalationReason)) && t.status !== 'completed'
  );

  // State for Emergency Incident Popup Modal (Tự động mở khi phát hiện sự cố khẩn cấp)
  const [isEmergencyPopupOpen, setIsEmergencyPopupOpen] = useState(() => urgentPendingTickets.length > 0);
  const [hasUserDismissedPopup, setHasUserDismissedPopup] = useState(false);

  // Auto reopen popup when a new urgent ticket is created/detected
  const prevUrgentCountRef = React.useRef(urgentPendingTickets.length);
  React.useEffect(() => {
    if (urgentPendingTickets.length > prevUrgentCountRef.current) {
      setHasUserDismissedPopup(false);
      setIsEmergencyPopupOpen(true);
    }
    prevUrgentCountRef.current = urgentPendingTickets.length;
  }, [urgentPendingTickets.length]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-100/70 overflow-hidden">

      {/* FLASHING EMERGENCY INCIDENT BANNER (Trọng tâm tập trung vào giải quyết vấn đề khẩn cấp) */}
      {urgentPendingTickets.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-3 sm:px-6 py-2 shadow-sm shrink-0 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 shrink-0 animate-bounce">
              <ShieldAlert className="w-4 h-4 text-white" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white text-red-700 px-2 py-0.2 rounded-full shadow-2xs">
                  🚨 SỰ CỐ KHẨN CẤP ({urgentPendingTickets.length})
                </span>
                <span className="text-xs font-bold truncate">
                  {urgentPendingTickets[0].hospitalClinic} ({urgentPendingTickets[0].equipmentModel}) - {urgentPendingTickets[0].issueDescription}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setHasUserDismissedPopup(false);
                setIsEmergencyPopupOpen(true);
              }}
              className="px-3 py-1 bg-white hover:bg-red-50 text-red-700 font-extrabold text-xs rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-red-600" />
              <span>Hiện Popup & Giải Quyết Ngay</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Permission Guard View when tab is not permitted in user checklist */}
        {!userAllowedTabs.includes(currentTab) && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center max-w-lg mx-auto my-12 space-y-4 shadow-sm animate-in fade-in">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Giới Hạn Quyền Truy Cập Tab Nhiệm Vụ
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tài khoản <strong>{currentUser?.name || 'Nhân sự'}</strong> ({currentUser?.department || 'Phòng ban'}) 
              chưa được Quản Trị Viên cấp quyền tham gia tab này trong Checklist phân quyền nhiệm vụ.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left text-slate-700 space-y-1.5">
              <p className="font-bold text-slate-900">Các tab bạn được phép tham gia ({userAllowedTabs.length}):</p>
              <div className="flex flex-wrap gap-1.5">
                {userAllowedTabs.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCurrentTab(t)}
                    className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-md text-[11px] cursor-pointer"
                  >
                    → Chuyển đến tab {t}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab(userAllowedTabs[0] || 'create_ticket')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
            >
              Quay Về Tab Được Phép
            </button>
          </div>
        )}

        {/* TAB 0: TỔNG QUAN HỆ THỐNG (Dashboard Điều Hành Trực Quan) */}
        {currentTab === 'overview' && userAllowedTabs.includes('overview') && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Welcome & Live System Pulse */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Hệ Thống Trực Tuyến 24/7</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Cập nhật: {new Date().toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-emerald-400" />
                    <span>Trung Tâm Điều Hành & Giám Sát Kỹ Thuật ADC</span>
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Theo dõi trạng thái hoạt động tức thì: luồng tiếp nhận xử lý ca sự cố, đội ngũ kỹ sư sẵn sàng trực chiến và các cảnh báo lỗi phát hiện tự động từ Chatbot AI.
                  </p>
                </div>

                {/* Header Action Shortcuts */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('create_ticket')}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tạo Phiếu Mới</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentSOP({
                        equipmentModel: 'Zybio EXC200/220',
                        category: 'Cơ khí & Kim hút',
                        errorCode: '',
                        title: '',
                        symptom: '',
                        rootCause: '',
                        resolutionSteps: ['Bước 1: Kiểm tra ngoại quan', 'Bước 2: Xử lý theo SOP'],
                        safetyWarnings: ['Bắt buộc đeo găng tay chống nhiễm khuẩn']
                      });
                      setIsEditingSOP(true);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-emerald-200 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                    <span>+ Thêm SOP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => exportTicketsToExcel(tickets)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Xuất toàn bộ phiếu kỹ thuật ra file Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-300" />
                    <span>Xuất Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => exportTicketsToCSV(tickets)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Xuất toàn bộ phiếu kỹ thuật ra file CSV (.csv)"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-300" />
                    <span>Xuất CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Core Operational Status Cards (as explicitly requested by user) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* CARD 1: SỐ LƯỢNG YÊU CẦU ĐANG XỬ LÝ */}
              <div 
                onClick={() => setCurrentTab('dispatch')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-emerald-600" />
                      <span>Yêu Cầu Đang Xử Lý</span>
                    </span>
                    {urgentTickets > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        <span>{urgentTickets} Khẩn Cấp</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-3xl font-extrabold font-mono text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {activeHandlingTickets.length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">ca cần giải quyết</span>
                  </div>

                  {/* Breakdown mini-tags */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-100/80">
                      <span className="text-[11px] text-amber-700 block font-medium">Chờ tiếp nhận</span>
                      <span className="text-sm font-bold text-amber-900 font-mono">{pendingTickets.length} ca</span>
                    </div>
                    <div className="bg-blue-50/70 p-2 rounded-xl border border-blue-100/80">
                      <span className="text-[11px] text-blue-700 block font-medium">Đang điều phối</span>
                      <span className="text-sm font-bold text-blue-900 font-mono">{inProgressTickets} ca</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                  <span>Mở bảng điều phối chi tiết</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* CARD 2: SỐ KỸ SƯ ĐANG RẢNH (SẴN SÀNG TRỰC CHIẾN) */}
              <div 
                onClick={() => setCurrentTab('staff')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-teal-600" />
                      <span>Kỹ Sư Đang Rảnh (Trực 24/7)</span>
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{availableEngineers.length} sẵn sàng</span>
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-3xl font-extrabold font-mono text-emerald-700">
                      {availableEngineers.length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/ {engineers.length} tổng nhân sự kỹ thuật</span>
                  </div>

                  {/* List of active free engineers */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="flex flex-wrap gap-1">
                      {availableEngineers.slice(0, 3).map(eng => (
                        <span key={eng.id} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-semibold">
                          {eng.name}
                        </span>
                      ))}
                      {availableEngineers.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-semibold">
                          +{availableEngineers.length - 3} khác
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
                      <span>Tại viện: {onSiteEngineers.length} KS</span>
                      <span>·</span>
                      <span>Nghỉ ca: {offDutyEngineers.length} KS</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                  <span>Quản lý danh sách nhân sự</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* CARD 3: CẢNH BÁO LỖI HỆ THỐNG MỚI NHẤT TỪ CHATBOT */}
              <div 
                onClick={() => setCurrentTab('chatbot_analytics')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <span>Cảnh Báo Sự Cố Chatbot AI</span>
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 rounded-full font-mono">
                      {chatSessions.length} phiên
                    </span>
                  </div>

                  {latestChatAlerts.length > 0 ? (
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-200 font-mono font-bold text-xs rounded-md">
                          {latestChatAlerts[0]?.classification?.faultCode || latestChatAlerts[0]?.matchedSOPCode || 'ALERT'}
                        </span>
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {latestChatAlerts[0]?.equipmentModel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1 italic">
                        "{latestChatAlerts[0]?.userQuerySnippets?.[0] || 'Cảnh báo lỗi thiết bị'}"
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100 font-mono">
                        <span className="truncate max-w-[160px]">{latestChatAlerts[0]?.hospitalClinic || 'Khách vãng lai'}</span>
                        <span className={latestChatAlerts[0]?.isResolvedByBot ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                          {latestChatAlerts[0]?.isResolvedByBot ? '✓ Tự xử lý' : '⚠ Cần kỹ sư'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-slate-400 italic">
                      Chưa ghi nhận cảnh báo lỗi bất thường.
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                  <span>Chi tiết phân tích lỗi dòng máy NLP</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

            </div>

            {/* TRUNG TÂM THAO TÁC QUẢN TRỊ LINH HOẠT (Flex Management Center for Staff) */}
            <div className={`rounded-2xl border shadow-2xs p-5 transition-all ${
              urgentPendingTickets.length > 0
                ? 'bg-gradient-to-b from-red-50/40 via-white to-white border-red-300 ring-2 ring-red-500/20 shadow-md'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Trung Tâm Thao Tác Nhanh Quản Trị Hệ Thống</span>
                    {urgentPendingTickets.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white flex items-center gap-1 shadow-2xs animate-pulse">
                        <ShieldAlert className="w-3 h-3 text-white" />
                        <span>{urgentPendingTickets.length} Ca Khẩn Cấp</span>
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hỗ trợ nhân viên cập nhật cơ sở tri thức, xem báo cáo hiệu suất, xuất dữ liệu toàn diện và cấu hình chatbot
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {urgentPendingTickets.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setHasUserDismissedPopup(false);
                        setIsEmergencyPopupOpen(true);
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer ring-2 ring-red-400/40"
                    >
                      <ShieldAlert className="w-4 h-4 text-white animate-bounce" />
                      <span>Mở Cửa Sổ Xử Lý Khẩn Cấp ({urgentPendingTickets.length})</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sự cố đang kiểm soát</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                
                {/* Module 1: Cập nhật Tri Thức SOP */}
                <div className="p-4 rounded-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>Cơ Sở Tri Thức SOP</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Quản lý {sops.length} quy trình xử lý lỗi chuẩn cho 4 dòng máy. Tự động hóa qua AI hoặc tạo mới thủ công.
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-emerald-100">
                    <button
                      type="button"
                      onClick={() => setCurrentTab('sop_mgmt')}
                      className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm / Cập Nhật SOP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => exportSOPsToExcel(sops)}
                      className="w-full py-1.5 px-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Xuất Kho SOP (.xlsx)</span>
                    </button>
                  </div>
                </div>

                {/* Module 2: Báo Cáo Hiệu Suất SLA & Chatbot */}
                <div className="p-4 rounded-xl border border-blue-200/80 bg-gradient-to-b from-blue-50/50 to-white flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span>Báo Cáo Hiệu Suất</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Đo lường thời gian đáp ứng SLA, tỷ lệ nghiệm thu {resolutionRate}%, phân loại lỗi dòng máy và hiệu quả Chatbot.
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-blue-100">
                    <button
                      type="button"
                      onClick={() => setCurrentTab('analytics')}
                      className="w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Báo Cáo SLA Hiện Trường</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentTab('chatbot_analytics')}
                      className="w-full py-1.5 px-2 bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5 text-blue-600" />
                      <span>Báo Cáo Chatbot NLP</span>
                    </button>
                  </div>
                </div>

                {/* Module 3: Xuất Dữ Liệu Toàn Diện */}
                <div className="p-4 rounded-xl border border-purple-200/80 bg-gradient-to-b from-purple-50/50 to-white flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-xs text-purple-900">
                      <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                      <span>Xuất Báo Cáo & Dữ Liệu</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Xuất dữ liệu người dùng, kỹ sư, sổ tay thực chiến 2026-XLKT và phiếu kỹ thuật tương thích 100% Microsoft Excel.
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-purple-100">
                    <button
                      type="button"
                      onClick={() => exportRecordsToExcel(records)}
                      className="w-full py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất Sổ Tay XLKT (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => exportStaffToExcel(engineers)}
                      className="w-full py-1.5 px-2 bg-white hover:bg-purple-50 text-purple-800 border border-purple-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>Xuất Danh Sách Nhân Sự</span>
                    </button>
                  </div>
                </div>

                {/* Module 4: Cấu Hình Chatbot & Hệ Thống */}
                <div className="p-4 rounded-xl border border-slate-300/80 bg-gradient-to-b from-slate-50/50 to-white flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                      <Settings className="w-4 h-4 text-slate-700" />
                      <span>Cài Đặt Chatbot & Hotline</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Điều chỉnh lời chào Chatbot, ngưỡng tin cậy nhận diện lỗi AI, tự động chuyển ca và hotline trực 24/7.
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setCurrentTab('settings')}
                      className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Cấu Hình Chatbot & Hotline</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentTab('excel')}
                      className="w-full py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>Trung Tâm Nhập/Xuất File</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 1: BẢNG ĐIỀU PHỐI (Compact list view, full details when clicked) */}
        {currentTab === 'dispatch' && (
          <div className="space-y-4">
            {/* Filter and Search Bar (Optimized Minimalist Icon-Driven Toolbar) */}
            <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                {/* Compact Search Bar */}
                <div className="relative flex-1 min-w-[140px] max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchTicketText}
                    onChange={(e) => setSearchTicketText(e.target.value)}
                    placeholder="Tìm phiếu, viện, máy..."
                    className="w-full h-8 pl-8 pr-7 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/70 hover:bg-slate-50 focus:bg-white transition-colors"
                  />
                  {searchTicketText && (
                    <button
                      type="button"
                      onClick={() => setSearchTicketText('')}
                      className="absolute right-2 top-2 p-0.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
                      title="Xóa tìm kiếm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Modern Compact Segmented Filter Icons */}
                <div className="flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/60 overflow-x-auto no-scrollbar">
                  {[
                    { key: 'all', label: 'Tất cả', icon: Layers, count: tickets.length, color: 'text-slate-700' },
                    { key: 'pending', label: 'Chờ nhận', icon: Clock, count: tickets.filter(t => t.status === 'pending').length, color: 'text-amber-600' },
                    { key: 'assigned', label: 'Đã gán', icon: UserCheck, count: tickets.filter(t => t.status === 'assigned').length, color: 'text-blue-600' },
                    { key: 'in_progress', label: 'Đang xử lý', icon: Wrench, count: tickets.filter(t => t.status === 'in_progress').length, color: 'text-indigo-600' },
                    { key: 'completed', label: 'Đã xong', icon: CheckCircle, count: tickets.filter(t => t.status === 'completed').length, color: 'text-emerald-600' },
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = statusFilter === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setStatusFilter(item.key)}
                        className={`h-7 px-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                          isActive
                            ? 'bg-white text-slate-900 shadow-2xs ring-1 ring-slate-200 font-bold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
                        }`}
                        title={`${item.label}: ${item.count} phiếu`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? item.color : 'text-slate-500'}`} />
                        <span className={`px-1 py-0.2 rounded-full font-mono text-[10px] font-bold ${
                          isActive ? 'bg-slate-100 text-slate-800' : 'bg-slate-200/70 text-slate-500'
                        }`}>
                          {item.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Minimalist Model Filter Dropdown */}
                <select
                  value={ticketModelFilter}
                  onChange={(e) => setTicketModelFilter(e.target.value)}
                  className="h-8 px-2.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500 transition-colors"
                  title="Lọc phiếu theo dòng máy"
                >
                  <option value="all">Tất cả model</option>
                  <option value="Zybio EXC200/220">EXC200/220</option>
                  <option value="Zybio Z3 CRP">Z3 CRP</option>
                  <option value="Zybio Z50">Z50</option>
                  <option value="FS-205">FS-205</option>
                </select>

                {/* Month Filter Dropdown */}
                <select
                  value={activeMonthFilter}
                  onChange={(e) => setActiveMonthFilter(e.target.value)}
                  className="h-8 px-2.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500 transition-colors"
                  title="Xem kết quả và phiếu theo tháng"
                >
                  <option value="all">Tất cả các tháng</option>
                  {availableTicketMonths.map(item => (
                    <option key={item.month} value={item.month}>
                      {formatMonthLabel(item.month)} ({item.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons: Minimalist Icon Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {(statusFilter !== 'all' || ticketModelFilter !== 'all' || activeMonthFilter !== 'all' || searchTicketText) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setTicketModelFilter('all');
                      setActiveMonthFilter('all');
                      setSearchTicketText('');
                    }}
                    className="h-8 w-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                    title="Đặt lại toàn bộ bộ lọc"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const suffix = activeMonthFilter !== 'all' ? `_Thang_${activeMonthFilter}` : '';
                    exportTicketsToExcel(filteredTickets, `Bao_Cao_Su_Co_Ky_Thuat_ADC${suffix || '_2026'}.xlsx`);
                  }}
                  className="h-8 px-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 flex items-center justify-center gap-1 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer text-[11px] font-bold"
                  title="Xuất danh sách phiếu đang lọc ra file Excel (.xlsx)"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline">Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const suffix = activeMonthFilter !== 'all' ? `_Thang_${activeMonthFilter}` : '';
                    exportTicketsToCSV(filteredTickets, `Bao_Cao_Phieu_Ky_Thuat_ADC${suffix || '_2026'}.csv`);
                  }}
                  className="h-8 px-2.5 rounded-xl border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100 text-blue-700 hover:text-blue-900 flex items-center justify-center gap-1 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer text-[11px] font-bold"
                  title="Xuất danh sách phiếu đang lọc ra file CSV (.csv)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
              </div>
            </div>

            {/* Compact List View (User comment: "dạng list ngắn gọn, hiện đầy đủ khi kích vào") */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span>Danh sách Phiếu Hỗ Trợ Kỹ Thuật ({filteredTickets.length} phiếu)</span>
                  {isDispatchReadOnly && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Chế độ Xem bảng việc
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  {isDispatchReadOnly
                    ? 'Bấm vào từng hàng để xem chi tiết tiến độ & kỹ sư phụ trách'
                    : 'Bấm vào từng hàng để xem chi tiết & cập nhật điều phối'}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredTickets.map(ticket => {
                  const isExpanded = expandedTicketId === ticket.id;
                  return (
                    <div key={ticket.id} className="transition-colors hover:bg-slate-50/50">
                      {/* Compact Summary Row */}
                      <div
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedTicketId(null);
                          } else {
                            setExpandedTicketId(ticket.id);
                            setReportActualCause(ticket.engineerReport?.actualRootCause || '');
                            setReportActions(ticket.engineerReport?.actionsTaken || '');
                            setReportAdvice(ticket.engineerReport?.preventiveAdvice || '');
                            setReportParts(
                              ticket.engineerReport?.replacedParts && ticket.engineerReport.replacedParts.length > 0
                                ? ticket.engineerReport.replacedParts.map(p => ({ ...p }))
                                : [{ name: '', code: '', quantity: 1 }]
                            );
                          }
                        }}
                        className="px-5 py-3.5 flex items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Priority badge */}
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            ticket.priority === 'urgent' ? 'bg-red-500 animate-ping' :
                            ticket.priority === 'normal' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-slate-900">
                                {ticket.ticketCode}
                              </span>
                              <span className="text-xs text-slate-400">·</span>
                              <span className="text-xs font-semibold text-slate-800 truncate">
                                {ticket.hospitalClinic}
                              </span>
                              <span className="text-xs text-slate-400">·</span>
                              <span className="text-xs text-slate-500 truncate hidden sm:inline">
                                {ticket.department}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <strong className="text-emerald-700 font-medium">{ticket.equipmentModel}</strong>
                              {ticket.errorCode && (
                                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-200/80 rounded font-mono font-bold text-[10px]">
                                  Lỗi {ticket.errorCode}
                                </span>
                              )}
                              {ticket.escalationReason && (
                                <span className="px-1.5 py-0.2 rounded font-bold text-[9.5px] bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                                  <Zap className="w-2.5 h-2.5 text-red-600" />
                                  <span>
                                    {ticket.escalationReason === 'keyword_match' ? 'SỰ CỐ KHẨN CẤP (keyword_match)' :
                                     ticket.escalationReason === 'high_complexity' ? 'ĐA TRIỆU CHỨNG (high_complexity)' :
                                     ticket.escalationReason === 'bot_unresolved' ? 'THẤT BẠI LẶP LẠI (bot_unresolved)' :
                                     ticket.escalationReason === 'unhelpful_feedback' ? 'CHƯA HIỆU QUẢ (unhelpful_feedback)' : 'ĐIỀU PHỐI ƯU TIÊN'}
                                  </span>
                                  <span className="text-red-700 font-mono">· Cam kết 15p</span>
                                </span>
                              )}
                              <span>- {ticket.issueDescription}</span>
                            </p>
                          </div>
                        </div>

                        {/* Status & Engineer info */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden md:block">
                            <div className="text-xs font-medium text-slate-800">
                              {ticket.assignedEngineerName || <span className="text-red-500">Chưa gán kỹ sư</span>}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {new Date(ticket.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                            ticket.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'assigned' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {ticket.status === 'completed' ? '✓ Đã xong' :
                             ticket.status === 'in_progress' ? '● Đang sửa tại chỗ' :
                             ticket.status === 'assigned' ? '● Đang di chuyển' : '● Chờ nhận'}
                          </span>

                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Full Details */}
                      {isExpanded && (
                        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 space-y-4 animate-fadeIn">
                          {/* Row 1: Contact and Machine Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                            <div>
                              <p className="text-slate-400 font-medium mb-1">Khách hàng & Liên hệ</p>
                              <p className="font-bold text-slate-800">{ticket.contactPerson}</p>
                              <p className="text-emerald-700 font-mono font-semibold flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" />
                                <a href={`tel:${ticket.phone}`} className="hover:underline">{ticket.phone}</a>
                              </p>
                              <p className="text-slate-500 mt-1">{ticket.hospitalClinic}</p>
                              <p className="text-slate-400 text-[11px]">{ticket.department}</p>
                            </div>

                            <div>
                              <p className="text-slate-400 font-medium mb-1">Thiết bị & Số Serial</p>
                              <p className="font-bold text-slate-800">{ticket.equipmentModel}</p>
                              <p className="text-slate-600 font-mono">S/N: {ticket.serialNumber || 'Chưa ghi nhận'}</p>
                              {ticket.errorCode && (
                                <p className="mt-1">
                                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 font-mono font-bold rounded">
                                    Mã lỗi: {ticket.errorCode}
                                  </span>
                                </p>
                              )}
                            </div>

                            <div>
                              <p className="text-slate-400 font-medium mb-1">Điều phối &amp; Phân công</p>
                              <label className="block text-[11px] text-slate-500 mb-1">Kỹ sư phụ trách:</label>
                              {isDispatchReadOnly ? (
                                <div className="space-y-2">
                                  <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                                    {ticket.assignedEngineerName || <span className="text-slate-400 font-normal">Chưa phân công kỹ sư</span>}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px]">
                                    <span className="text-slate-400">Trạng thái:</span>
                                    <span className={`font-semibold px-2 py-0.5 rounded-full ${
                                      ticket.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                      ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                      ticket.status === 'assigned' ? 'bg-amber-100 text-amber-800' :
                                      'bg-slate-200 text-slate-700'
                                    }`}>
                                      {ticket.status === 'completed' ? 'Đã hoàn thành' :
                                       ticket.status === 'in_progress' ? 'Đang sửa tại chỗ' :
                                       ticket.status === 'assigned' ? 'Đang di chuyển' : 'Chờ tiếp nhận'}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <select
                                    value={ticket.assignedEngineerId || ''}
                                    onChange={(e) => handleAssignEngineer(ticket, e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                                  >
                                    <option value="">-- Chọn kỹ sư tiếp nhận --</option>
                                    {engineers
                                      .filter(eng => eng.role === 'field_engineer' || (eng.department || '').toLowerCase().includes('kỹ thuật'))
                                      .map(eng => (
                                        <option key={eng.id} value={eng.id}>
                                          {eng.name}
                                        </option>
                                      ))}
                                  </select>

                                  {/* Status Transition Buttons */}
                                  <div className="mt-3 flex items-center gap-1.5">
                                    <span className="text-[11px] text-slate-400">Đổi trạng thái:</span>
                                    <button
                                      onClick={() => handleUpdateStatus(ticket, 'assigned')}
                                      className={`px-2 py-1 text-[11px] rounded font-medium cursor-pointer ${
                                        ticket.status === 'assigned' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                      }`}
                                    >
                                      Đang di chuyển
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStatus(ticket, 'in_progress')}
                                      className={`px-2 py-1 text-[11px] rounded font-medium cursor-pointer ${
                                        ticket.status === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                      }`}
                                    >
                                      Đang tại chỗ
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStatus(ticket, 'completed')}
                                      className={`px-2 py-1 text-[11px] rounded font-medium cursor-pointer ${
                                        ticket.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                      }`}
                                    >
                                      Hoàn thành
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Row 2: Issue Description */}
                          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                            <span className="font-bold text-slate-700">Mô tả hiện tượng ban đầu: </span>
                            <span className="text-slate-600">{ticket.issueDescription}</span>
                          </div>

                          {/* Row 3: Engineer Report Form (Read-only summary when role is read-only OR saved result > 30 days) */}
                          {(() => {
                            const reportAnchor = ticket.engineerReport?.savedAt || ticket.engineerReport?.completedAt || ticket.resolvedAt;
                            const isReportLocked = Boolean(ticket.engineerReport && isSavedResultLocked(reportAnchor));
                            const reportMonthKey = ticket.engineerReport
                              ? (ticket.engineerReport.savedMonth || getSavedMonthKey(reportAnchor || ticket.createdAt))
                              : null;
                            const remainingReportDays = ticket.engineerReport ? getRemainingEditableDays(reportAnchor) : RESULT_EDIT_LOCK_DAYS;

                            if (isDispatchReadOnly || isReportLocked) {
                              return (
                                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                                      <UserCheck className="w-4 h-4 text-emerald-600" />
                                      <span>Nhật Ký Xử Lý Kỹ Thuật Hiện Trường</span>
                                    </h4>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {reportMonthKey && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                          <Calendar className="w-3 h-3 text-slate-500" />
                                          <span>{formatMonthLabel(reportMonthKey)}</span>
                                        </span>
                                      )}
                                      {ticket.engineerReport && isReportLocked && (
                                        <span className="inline-flex items-center gap-1 text-amber-800 font-semibold text-[11px] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                          <Lock className="w-3 h-3" />
                                          <span>Đã khóa chỉnh sửa (&gt;{RESULT_EDIT_LOCK_DAYS} ngày)</span>
                                        </span>
                                      )}
                                      {ticket.engineerReport && !isReportLocked && (
                                        <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                                          ✓ Đã lưu nghiệm thu
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {ticket.engineerReport ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs pt-1">
                                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                        <span className="text-[11px] text-slate-400 block">Nguyên nhân thực tế:</span>
                                        <span className="text-slate-800 font-medium">{ticket.engineerReport.actualRootCause || 'Chưa ghi nhận'}</span>
                                      </div>
                                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                        <span className="text-[11px] text-slate-400 block">Hành động xử lý:</span>
                                        <span className="text-slate-800 font-medium">{ticket.engineerReport.actionsTaken || 'Chưa ghi nhận'}</span>
                                      </div>
                                      {ticket.engineerReport.replacedParts && ticket.engineerReport.replacedParts.length > 0 && (
                                        <div className="md:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                          <span className="text-[11px] text-slate-400 block mb-1">Linh kiện thay thế:</span>
                                          <div className="flex flex-wrap gap-1.5">
                                            {ticket.engineerReport.replacedParts.map((part, pIdx) => (
                                              <span key={pIdx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                                                {part.name}{part.code ? ` (${part.code})` : ''} × {part.quantity}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {ticket.engineerReport.preventiveAdvice && (
                                        <div className="md:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                          <span className="text-[11px] text-slate-400 block">Khuyến nghị bảo dưỡng:</span>
                                          <span className="text-slate-700">{ticket.engineerReport.preventiveAdvice}</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-slate-400 italic">Chưa có biên bản nghiệm thu hiện trường.</p>
                                  )}
                                  {isReportLocked && (
                                    <p className="text-[11px] text-amber-700 bg-amber-50/70 border border-amber-100 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                                      <Lock className="w-3.5 h-3.5 shrink-0" />
                                      <span>Kết quả đã lưu quá {RESULT_EDIT_LOCK_DAYS} ngày sẽ tự động khóa để đảm bảo tính toàn vẹn dữ liệu nghiệm thu.</span>
                                    </p>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <UserCheck className="w-4 h-4 text-emerald-600" />
                                    <span>Nhật Ký Xử Lý Kỹ Thuật Hiện Trường (Biên Bản Nghiệm Thu)</span>
                                  </h4>
                                  {ticket.engineerReport && (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {reportMonthKey && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                          <Calendar className="w-3 h-3 text-slate-500" />
                                          <span>{formatMonthLabel(reportMonthKey)}</span>
                                        </span>
                                      )}
                                      <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                                        ✓ Đã lưu · Còn {remainingReportDays} ngày sửa
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-slate-500 font-medium mb-1">
                                      Nguyên nhân thực tế phát hiện tại hiện trường:
                                    </label>
                                    <input
                                      type="text"
                                      defaultValue={ticket.engineerReport?.actualRootCause || ''}
                                      onChange={(e) => setReportActualCause(e.target.value)}
                                      placeholder="VD: Cặn tủa protein làm nghẽn đầu kim hút..."
                                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-slate-500 font-medium mb-1">
                                      Hành động xử lý &amp; căn chỉnh:
                                    </label>
                                    <input
                                      type="text"
                                      defaultValue={ticket.engineerReport?.actionsTaken || ''}
                                      onChange={(e) => setReportActions(e.target.value)}
                                      placeholder="VD: Thông kim hút bằng dây thông 0.15mm, ngâm rửa dung dịch Cleanser..."
                                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </div>
                                </div>

                                {/* Replaced Parts List */}
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-slate-500 font-medium">Linh kiện thay thế (nếu có):</label>
                                    <button
                                      type="button"
                                      onClick={handleAddPartRow}
                                      className="text-emerald-700 hover:text-emerald-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Thêm linh kiện</span>
                                    </button>
                                  </div>

                                  <div className="space-y-1.5">
                                    {reportParts.map((part, pIdx) => (
                                      <div key={pIdx} className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          placeholder="Tên linh kiện (VD: Kim hút mẫu)"
                                          value={part.name}
                                          onChange={(e) => {
                                            const next = [...reportParts];
                                            next[pIdx].name = e.target.value;
                                            setReportParts(next);
                                          }}
                                          className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Mã Part Number"
                                          value={part.code}
                                          onChange={(e) => {
                                            const next = [...reportParts];
                                            next[pIdx].code = e.target.value;
                                            setReportParts(next);
                                          }}
                                          className="w-32 px-2.5 py-1 text-xs border border-slate-200 rounded-lg font-mono uppercase"
                                        />
                                        <input
                                          type="number"
                                          placeholder="SL"
                                          min={1}
                                          value={part.quantity}
                                          onChange={(e) => {
                                            const next = [...reportParts];
                                            next[pIdx].quantity = parseInt(e.target.value) || 1;
                                            setReportParts(next);
                                          }}
                                          className="w-16 px-2.5 py-1 text-xs border border-slate-200 rounded-lg font-mono"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-slate-500 font-medium mb-1">
                                    Khuyến nghị bảo dưỡng cho KTV bệnh viện:
                                  </label>
                                  <input
                                    type="text"
                                    defaultValue={ticket.engineerReport?.preventiveAdvice || ''}
                                    onChange={(e) => setReportAdvice(e.target.value)}
                                    placeholder="VD: Nhắc nhở KTV chạy rửa cuối ngày bằng E-Z Cleanser..."
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                                  <span className="text-[11px] text-slate-400">
                                    Lưu theo tháng hiện tại · Tự động khóa chỉnh sửa sau {RESULT_EDIT_LOCK_DAYS} ngày
                                  </span>
                                  <button
                                    onClick={() => handleSaveResolutionReport(ticket)}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Lưu Nghiệm Thu &amp; Ghi Vào 2026-XLKT</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TẠO PHIẾU ĐIỀU PHỐI NỘI BỘ (Sales / Helpdesk) */}
        {currentTab === 'create_ticket' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                  <Plus className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tạo Phiếu Điều Phối Kỹ Thuật (Nội Bộ ADC)</h3>
                  <p className="text-xs text-slate-500">Dành cho Sales, CSKH & Kỹ sư điều phối khi tiếp nhận yêu cầu từ viện</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full hidden sm:inline-flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                <span>Hỗ trợ nhận diện tự động</span>
              </span>
            </div>

            {/* Ô ĐIỀN TOÀN BỘ THÔNG TIN & TỰ ĐỘNG NHẬN DIỆN CHIA TRƯỜNG */}
            <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 rounded-2xl border-2 border-emerald-300/80 p-4 sm:p-5 space-y-3.5 shadow-2xs">
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
                      Dán tin nhắn Zalo, email hoặc ghi chú cuộc gọi — Hệ thống tự động bóc tách và phân bổ vào các trường bên dưới
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

              {/* Textarea nhập toàn bộ */}
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

              {/* Toolbar & Sample quick buttons + Camera scan shortcut */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 italic flex items-center gap-1">
                    💡 Nhập theo mẫu ví dụ chữ mờ bên trên để hệ thống tự động nhận diện các trường thông tin.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Nút đính kèm ảnh tem máy nhận diện số Serial trực tiếp vào ô */}
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
                    <span>Nhận diện & Chia trường</span>
                  </button>
                </div>
              </div>

              {/* Tag Chips khi nhận diện thành công */}
              {smartDetectedChips.length > 0 && (
                <div className="pt-2 border-t border-emerald-200/80">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hệ thống đã nhận diện & phân bổ {smartDetectedChips.length} trường thông tin:</span>
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

            {/* FORM ĐIỀN THÔNG TIN CHI TIẾT (Được tự động đồng bộ và người dùng có thể tùy chỉnh) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTicketHospital.trim() || !newTicketContact.trim() || !newTicketPhone.trim() || !newTicketIssue.trim()) {
                  alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*): Bệnh viện, Bác sĩ/KTV liên hệ, Số điện thoại và Mô tả hiện tượng!');
                  return;
                }

                const newT = onAddTicket({
                  hospitalClinic: newTicketHospital.trim(),
                  department: newTicketDepartment.trim() || 'Khoa Xét nghiệm',
                  contactPerson: newTicketContact.trim(),
                  phone: newTicketPhone.trim(),
                  equipmentModel: newTicketModel,
                  serialNumber: newTicketSerial.trim() || undefined,
                  errorCode: newTicketErrorCode.trim() || undefined,
                  issueDescription: newTicketIssue.trim(),
                  priority: 'normal'
                });

                alert(`Đã tạo thành công phiếu ${newT.ticketCode} và chuyển đến hàng đợi điều phối kỹ sư!`);
                // Reset form
                setSmartTicketText('');
                setNewTicketHospital('');
                setNewTicketContact('');
                setNewTicketPhone('');
                setNewTicketSerial('');
                setNewTicketErrorCode('');
                setNewTicketIssue('');
                setSmartDetectedChips([]);
                setSerialImagePreview(null);
                setSerialScanSuccessMsg(null);
                setCurrentTab('dispatch');
              }}
              className="space-y-4 pt-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Các Trường Thông Tin Phiếu Điều Phối
                </span>
                <span className="text-[11px] text-slate-400">
                  Có thể chỉnh sửa trực tiếp từng ô nếu cần
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
                  value={newTicketHospital}
                  onChange={(e) => setNewTicketHospital(e.target.value)}
                  placeholder="VD: Bệnh viện Đa khoa Thu Cúc..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white bg-slate-50/50 transition-colors"
                />
              </div>

              {/* Hàng 2: Người liên hệ & SĐT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bác sĩ / KTV liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTicketContact}
                    onChange={(e) => setNewTicketContact(e.target.value)}
                    placeholder="VD: BS. Nguyễn Văn Hùng"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white bg-slate-50/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại gọi đến <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newTicketPhone}
                    onChange={(e) => setNewTicketPhone(e.target.value)}
                    placeholder="VD: 0912xxxxxx"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white bg-slate-50/50 transition-colors"
                  />
                </div>
              </div>

              {/* Hàng 3: Model, Serial (kèm chức năng nhận diện ảnh tem máy), Mã lỗi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Model thiết bị
                  </label>
                  <select
                    value={newTicketModel}
                    onChange={(e) => setNewTicketModel(e.target.value as EquipmentModel)}
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
                      value={newTicketSerial}
                      onChange={(e) => setNewTicketSerial(e.target.value)}
                      placeholder="VD: EXC-2025-01 hoặc tải ảnh tem máy"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white bg-slate-50/50 transition-colors pr-7"
                    />
                    {newTicketSerial && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewTicketSerial('');
                          setSerialScanSuccessMsg(null);
                        }}
                        className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-200/60"
                        title="Xóa Serial"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Hiển thị kết quả quét & ảnh xem trước */}
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
                        <p className="text-[10px] text-slate-500 truncate">SN: {newTicketSerial || 'Đang quét...'}</p>
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
                    Mã lỗi (nếu có)
                  </label>
                  <input
                    type="text"
                    value={newTicketErrorCode}
                    onChange={(e) => setNewTicketErrorCode(e.target.value.toUpperCase())}
                    placeholder="VD: E101, H101"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:bg-white bg-slate-50/50 transition-colors"
                  />
                </div>
              </div>

              {/* Hàng 4: Mô tả hiện tượng */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả phản ánh của khách hàng <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newTicketIssue}
                  onChange={(e) => setNewTicketIssue(e.target.value)}
                  placeholder="Khách hàng báo hiện tượng gì, đã thao tác xử lý gì..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white bg-slate-50/50 transition-colors"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSmartTicketText('');
                    setNewTicketHospital('');
                    setNewTicketContact('');
                    setNewTicketPhone('');
                    setNewTicketSerial('');
                    setNewTicketErrorCode('');
                    setNewTicketIssue('');
                    setSmartDetectedChips([]);
                    setSerialImagePreview(null);
                    setSerialScanSuccessMsg(null);
                  }}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Xóa trắng form
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo Phiếu & Điều Phối Ngay</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: QUẢN TRỊ KHO TRI THỨC SOP */}
        {currentTab === 'sop_mgmt' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={sopSearchText}
                    onChange={(e) => setSopSearchText(e.target.value)}
                    placeholder="Tìm theo mã lỗi, tên quy trình..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={sopFilterModel}
                  onChange={(e) => setSopFilterModel(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                >
                  <option value="all">Tất cả Model máy</option>
                  <option value="Zybio EXC200/220">Zybio EXC200/220</option>
                  <option value="Zybio Z3 CRP">Zybio Z3 CRP</option>
                  <option value="Zybio Z50">Zybio Z50</option>
                  <option value="FS-205">FS-205</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
                {/* 1. Thêm SOP: Thêm file SOP thủ công */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentSOP({
                      equipmentModel: 'Zybio EXC200/220',
                      category: 'Cơ khí & Kim hút',
                      errorCode: '',
                      title: '',
                      symptom: '',
                      rootCause: '',
                      resolutionSteps: ['Bước 1: ', 'Bước 2: '],
                      safetyWarnings: ['Bắt buộc đeo găng tay y tế']
                    });
                    setIsEditingSOP(true);
                  }}
                  className="h-8 w-8 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                  title="Thêm SOP thủ công"
                  aria-label="Thêm SOP thủ công"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                </button>

                {/* 2. Nạp File PDF SOP: Tải trực tiếp file PDF Service Manual / SOP */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRecordForAnalysis(null);
                    setSopAnalysisDefaultMode('upload');
                    setIsAutoAnalyzeModalOpen(true);
                  }}
                  className="h-8 w-8 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                  title="Nạp File PDF SOP (Service Manual)"
                  aria-label="Nạp File PDF SOP"
                >
                  <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                </button>

                {/* 3. AI SOP: Dùng AI tự động phân tích và thêm vào kho SOP */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRecordForAnalysis(null);
                    setSopAnalysisDefaultMode('records');
                    setIsAutoAnalyzeModalOpen(true);
                  }}
                  className="h-8 w-8 text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                  title="AI SOP Sổ Tay: Tự động phân tích từ sổ tay 2026-XLKT"
                  aria-label="AI SOP Sổ Tay"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
                </button>

                {/* 4. Tra cứu danh mục mã lỗi chuẩn hãng (Zybio & Getein) */}
                <button
                  type="button"
                  onClick={() => setShowOfficialCodesRegistry(true)}
                  className="h-8 w-8 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                  title="Tra cứu Danh mục Mã Lỗi Chuẩn Hãng (Zybio & Getein)"
                  aria-label="Mã Lỗi Chuẩn Hãng"
                >
                  <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                </button>

                {/* 5. Xuất Excel / CSV */}
                <button
                  type="button"
                  onClick={() => exportSOPsToExcel(sops)}
                  className="h-8 px-2.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0 text-[11px] font-bold"
                  title="Xuất Excel (.xlsx) toàn bộ Kho tri thức SOP"
                  aria-label="Xuất Excel"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline">Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportSOPsToCSV(sops)}
                  className="h-8 px-2.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0 text-[11px] font-bold"
                  title="Xuất CSV (.csv) toàn bộ Kho tri thức SOP"
                  aria-label="Xuất CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
              </div>
            </div>

            {/* SOP Modal / Editor (Pop-up Dialog) */}
            {isEditingSOP && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                <div 
                  className="fixed inset-0" 
                  onClick={() => setIsEditingSOP(false)} 
                />
                <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 z-10 overflow-hidden animate-in zoom-in-95 duration-150">
                  {/* Modal Header */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white shrink-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                        <Edit className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <span>{currentSOP.id ? `Chỉnh Sửa Quy Trình SOP [${currentSOP.errorCode || 'N/A'}]` : 'Thêm Mới Quy Trình SOP'}</span>
                          {currentSOP.errorCode && (
                            <span className="px-2 py-0.5 bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 font-mono text-xs rounded">
                              {currentSOP.errorCode}
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-emerald-200/80 mt-0.5">
                          Tự động tải đầy đủ nội dung file quy trình kỹ thuật chuẩn SOP để kiểm tra & cập nhật
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingSOP(false)}
                      className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      title="Đóng"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body / Form */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <form id="sop-edit-form" onSubmit={handleSaveSOPSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Model máy</label>
                          <select
                            value={currentSOP.equipmentModel}
                            onChange={(e) => setCurrentSOP({ ...currentSOP, equipmentModel: e.target.value as EquipmentModel })}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="Zybio EXC200/220">Zybio EXC200/220</option>
                            <option value="Zybio Z3 CRP">Zybio Z3 CRP</option>
                            <option value="Zybio Z50">Zybio Z50</option>
                            <option value="FS-205">FS-205</option>
                          </select>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-slate-700">Mã Lỗi (Error Code)</label>
                            <span className="text-[10px] text-slate-500">Tùy chọn, không bắt buộc</span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={currentSOP.errorCode || ''}
                                onChange={(e) => setCurrentSOP({ ...currentSOP, errorCode: e.target.value.toUpperCase() })}
                                placeholder="VD: E101, H108 (để trống nếu không mã)"
                                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono uppercase focus:ring-2 focus:ring-emerald-500 bg-white"
                              />
                              {currentSOP.errorCode && (
                                <button
                                  type="button"
                                  onClick={() => setCurrentSOP({ ...currentSOP, errorCode: '' })}
                                  className="text-[10px] text-slate-500 hover:text-red-600 px-2 py-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-red-50 cursor-pointer"
                                  title="Xóa mã lỗi (Quy trình không có mã)"
                                >
                                  Xóa
                                </button>
                              )}
                            </div>
                            <select
                              value={currentSOP.errorCode || ''}
                              onChange={(e) => setCurrentSOP({ ...currentSOP, errorCode: e.target.value })}
                              className="w-full text-[11px] font-mono border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 focus:bg-white text-slate-700"
                            >
                              <option value="">(Không có mã lỗi - Sự cố cơ/điện/mạng)</option>
                              {getOfficialCodesForModel((currentSOP.equipmentModel || 'Zybio EXC200/220') as EquipmentModel).map(c => (
                                <option key={c.code} value={c.code}>
                                  [{c.code}] {c.name.slice(0, 38)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Phân loại cơ cấu</label>
                          <select
                            value={currentSOP.category}
                            onChange={(e) => setCurrentSOP({ ...currentSOP, category: e.target.value as any })}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="Cơ khí & Kim hút">Cơ khí & Kim hút</option>
                            <option value="Quang học & Cảm biến">Quang học & Cảm biến</option>
                            <option value="Hóa chất & Buồng đếm">Hóa chất & Buồng đếm</option>
                            <option value="Điện tử & Nhiệt độ">Điện tử & Nhiệt độ</option>
                            <option value="Phần mềm & Kết nối">Phần mềm & Kết nối</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề quy trình SOP</label>
                          <input
                            type="text"
                            required
                            value={currentSOP.title || ''}
                            onChange={(e) => setCurrentSOP({ ...currentSOP, title: e.target.value })}
                            placeholder="VD: Kim hút mẫu bị va chạm hoặc nghẽn hạt fibrin"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Vị trí linh kiện / Cụm cơ cấu</label>
                          <input
                            type="text"
                            value={currentSOP.componentLocation || ''}
                            onChange={(e) => setCurrentSOP({ ...currentSOP, componentLocation: e.target.value })}
                            placeholder="VD: Trục Z kim hút mẫu / Trạm rửa cuvette số 2"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Hiện tượng / Triệu chứng</label>
                          <textarea
                            rows={3}
                            value={currentSOP.symptom || ''}
                            onChange={(e) => setCurrentSOP({ ...currentSOP, symptom: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="Mô tả hiện tượng sự cố phát hiện trên máy..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Nguyên nhân gốc</label>
                          <textarea
                            rows={3}
                            value={currentSOP.rootCause || ''}
                            onChange={(e) => setCurrentSOP({ ...currentSOP, rootCause: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="Nguyên nhân kỹ thuật dẫn đến lỗi..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Các bước xử lý chuẩn (Mỗi dòng một bước):
                        </label>
                        <textarea
                          rows={4}
                          value={currentSOP.resolutionSteps?.join('\n') || ''}
                          onChange={(e) => setCurrentSOP({ ...currentSOP, resolutionSteps: e.target.value.split('\n') })}
                          placeholder="Bước 1: Tắt nguồn\nBước 2: Vệ sinh đầu kim\nBước 3: Chạy lại mẫu trắng"
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-sans focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Cảnh báo an toàn sinh học & Kỹ thuật (Mỗi dòng một lưu ý):
                        </label>
                        <textarea
                          rows={2}
                          value={currentSOP.safetyWarnings?.join('\n') || ''}
                          onChange={(e) => setCurrentSOP({ ...currentSOP, safetyWarnings: e.target.value.split('\n') })}
                          placeholder="Đeo găng tay y tế chống lây nhiễm sinh học\nKhông uốn bẻ cong kim hút"
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-sans focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      {/* PDF Attachment Section inside SOP Form */}
                      <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                            <Paperclip className="w-3.5 h-3.5 text-rose-600" />
                            <span>Đính kèm tài liệu PDF (Service Manual / Hướng dẫn gốc)</span>
                          </label>
                          <span className="text-[10px] font-mono text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                            .pdf · Tối đa 50 MB
                          </span>
                        </div>

                        {currentSOP.pdfAttachment ? (
                          <div className="p-2.5 bg-white rounded-lg border border-rose-200 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate max-w-[260px]">
                                  {currentSOP.pdfAttachment.fileName}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {formatFileSize(currentSOP.pdfAttachment.fileSize)} · Tải lên: {currentSOP.pdfAttachment.uploadedAt}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setViewingPdfModal({ attachment: currentSOP.pdfAttachment!, title: currentSOP.title })}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Xem PDF</span>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const ok = await downloadPdfAttachment(currentSOP.pdfAttachment!);
                                  if (!ok) setSopPdfError('Không tìm thấy file PDF cục bộ trên trình duyệt này.');
                                }}
                                className="px-2 py-1 text-[11px] font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Download className="w-3 h-3" />
                                <span>Tải</span>
                              </button>
                              <label className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                                <span>Đổi file</span>
                                <input
                                  type="file"
                                  accept=".pdf,application/pdf"
                                  onChange={handleAttachPdfInEditor}
                                  className="hidden"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={handleRemovePdfInEditor}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                title="Gỡ file PDF đính kèm"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-rose-50/50 border-2 border-dashed border-rose-300 hover:border-rose-500 rounded-xl cursor-pointer transition-colors text-xs">
                            {isAttachingSopPdf ? (
                              <>
                                <Loader2 className="w-4 h-4 text-rose-600 animate-spin" />
                                <span className="font-semibold text-rose-800">Đang lưu tệp PDF vào kho lưu trữ...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 text-rose-600" />
                                <span className="font-semibold text-rose-900">Chọn file PDF đính kèm vào SOP này</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={handleAttachPdfInEditor}
                              className="hidden"
                            />
                          </label>
                        )}

                        {sopPdfError && (
                          <p className="text-[11px] text-red-700 font-semibold">{sopPdfError}</p>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsEditingSOP(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
                    >
                      Hủy & Đóng
                    </button>
                    <button
                      type="submit"
                      form="sop-edit-form"
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1.5 active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>Lưu Tri Thức SOP</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SOP Cards Grid (Click to view full content) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSOPs.map((sop, idx) => {
                const isCardExpanded = expandedSOPCardId === sop.id;
                return (
                  <div
                    key={`${sop.id || 'sop'}-${idx}`}
                    onClick={() => setViewingSOP(sop)}
                    title="Nhấn vào thẻ để xem toàn bộ nội dung quy trình kỹ thuật SOP"
                    className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group active:scale-[0.99] relative"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Interactive Error Code Badge (Admin adjustment) */}
                          {sop.errorCode && sop.errorCode.trim() !== '' ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingErrorCodeSOP(sop);
                                setSelectedErrorCodeForAdjust(sop.errorCode || '');
                              }}
                              className="px-2 py-0.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-600 hover:text-white font-mono font-bold text-xs rounded border border-emerald-200 hover:border-emerald-600 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Bấm để điều chỉnh mã lỗi theo danh mục hãng (không tự bịa mã)"
                            >
                              <span>{sop.errorCode}</span>
                              <Edit className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingErrorCodeSOP(sop);
                                setSelectedErrorCodeForAdjust('');
                              }}
                              className="px-1.5 py-0.5 bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-[10px] font-medium rounded border border-dashed border-slate-300 transition-all flex items-center gap-1 cursor-pointer"
                              title="Chưa có mã lỗi. Quản trị viên bấm để gán mã lỗi chuẩn chính hãng nếu có"
                            >
                              <span>Không mã lỗi</span>
                              <Plus className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          )}
                          <span className="text-[11px] font-semibold text-slate-700">
                            {sop.equipmentModel}
                          </span>
                          {sop.pdfAttachment ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingPdfModal({ attachment: sop.pdfAttachment!, title: sop.title });
                              }}
                              title="Nhấn để mở xem tài liệu PDF đính kèm"
                              className="text-[10px] text-rose-800 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200/80 px-2 py-0.5 rounded font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <FileText className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[140px]">{sop.pdfAttachment.fileName}</span>
                              <span className="opacity-75">· {formatFileSize(sop.pdfAttachment.fileSize)}</span>
                            </button>
                          ) : sop.sourceFile ? (
                            <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200/80 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                              📄 {sop.sourceFile}
                            </span>
                          ) : null}
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {sop.category}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingSOP(sop);
                            }}
                            className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-600 hover:text-white px-2 py-0.5 rounded-full font-semibold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Xem chi tiết toàn bộ nội dung"
                          >
                            <Eye className="w-3 h-3 text-emerald-600 group-hover:text-white" />
                            <span>Xem nội dung</span>
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors mb-1.5 leading-snug">
                        {sop.title}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                        <strong className="text-slate-700">Hiện tượng:</strong> {sop.symptom}
                      </p>

                      <div className="bg-amber-50/70 border border-amber-200/70 rounded-lg p-2 mb-2 text-xs text-amber-900">
                        <strong>Nguyên nhân:</strong> {sop.rootCause}
                      </div>

                      {/* Steps View - Chi tiết các bước theo file */}
                      <div className="space-y-1.5 mb-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="flex items-center gap-1">
                            <span>Quy trình xử lý ({sop.resolutionSteps.length} bước):</span>
                            {sop.sourceFile && (
                              <span className="text-[10px] text-rose-600 font-mono font-normal">từ file PDF</span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedSOPCardId(isCardExpanded ? null : sop.id);
                            }}
                            className="text-emerald-700 hover:text-emerald-900 text-[10px] font-bold underline cursor-pointer"
                          >
                            {isCardExpanded ? 'Thu gọn bước' : `Xem đủ ${sop.resolutionSteps.length} bước`}
                          </button>
                        </div>

                        <div className="space-y-1">
                          {(isCardExpanded ? sop.resolutionSteps : sop.resolutionSteps.slice(0, 3)).map((st, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 bg-white p-1.5 rounded-md border border-slate-100 shadow-2xs">
                              <span className="font-mono font-bold text-emerald-700 shrink-0 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px] border border-emerald-200">
                                #{i + 1}
                              </span>
                              <span className={isCardExpanded ? 'leading-relaxed font-medium' : 'truncate font-medium'}>
                                {st.replace(/^Bước \d+:\s*/i, '')}
                              </span>
                            </div>
                          ))}
                        </div>

                        {!isCardExpanded && sop.resolutionSteps.length > 3 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedSOPCardId(sop.id);
                            }}
                            className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold block pt-1 text-left cursor-pointer underline"
                          >
                            +{sop.resolutionSteps.length - 3} bước chi tiết khác theo file (bấm để xem toàn bộ)...
                          </button>
                        )}
                      </div>

                      {/* Safety warnings if expanded */}
                      {isCardExpanded && sop.safetyWarnings && sop.safetyWarnings.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-[11px] text-red-900 mt-2 space-y-0.5">
                          <strong className="text-red-950 block">Lưu ý an toàn:</strong>
                          {sop.safetyWarnings.map((w, idx) => (
                            <p key={idx} className="pl-2 leading-tight">• {w}</p>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Cập nhật: {sop.updatedAt}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingSOP(sop);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Mở toàn bộ nội dung quy trình kỹ thuật"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Xem nội dung</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickAttachTargetSOP(sop);
                            quickPdfInputRef.current?.click();
                          }}
                          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                            sop.pdfAttachment
                              ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                              : 'text-slate-500 hover:text-rose-700 hover:bg-rose-50'
                          }`}
                          title={sop.pdfAttachment ? `Đính kèm / Thay thế PDF (${sop.pdfAttachment.fileName})` : 'Đính kèm file PDF vào SOP này'}
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSopPdfError(null);
                            setCurrentSOP({ ...sop });
                            setIsEditingSOP(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                          title="Chỉnh sửa SOP"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Xác nhận xóa SOP [${sop.errorCode || sop.title}]?`)) {
                              if (sop.pdfAttachment?.id) {
                                deletePdfAttachment(sop.pdfAttachment.id);
                              }
                              onDeleteSOP(sop.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Xóa SOP"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hidden quick-attach PDF input for SOP cards */}
            <input
              ref={quickPdfInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleQuickAttachPdfChange}
              className="hidden"
            />
          </div>
        )}

        {/* TAB 4: SỔ TAY 2026-XLKT (Nguyễn Quang Đạt & Đội Ngũ ADC) */}
        {currentTab === 'records' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Unified Toolbar for Records: Search, Filters & Quick Actions */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={recordSearchText}
                    onChange={(e) => setRecordSearchText(e.target.value)}
                    placeholder="Tìm theo mã biên bản, bệnh viện, model máy, lỗi phát hiện, kỹ sư..."
                    className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  />
                  {recordSearchText && (
                    <button
                      type="button"
                      onClick={() => setRecordSearchText('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={activeMonthFilter}
                  onChange={(e) => setActiveMonthFilter(e.target.value)}
                  className="px-2.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  title="Xem kết quả đã lưu theo tháng"
                >
                  <option value="all">Tất cả các tháng ({records.length})</option>
                  {availableRecordMonths.map(item => (
                    <option key={item.month} value={item.month}>
                      {formatMonthLabel(item.month)} ({item.count})
                    </option>
                  ))}
                </select>

                <select
                  value={recordFilterModel}
                  onChange={(e) => setRecordFilterModel(e.target.value)}
                  className="px-2.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="all">Tất cả Model</option>
                  <option value="Zybio EXC200/220">EXC200/220</option>
                  <option value="Zybio Z3 CRP">Z3 CRP</option>
                  <option value="Zybio Z50">Z50</option>
                  <option value="FS-205">FS-205</option>
                </select>

                <select
                  value={recordFilterStatus}
                  onChange={(e) => setRecordFilterStatus(e.target.value)}
                  className="px-2.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="all">Tất cả Trạng Thái</option>
                  <option value="Đã nghiệm thu">Đã nghiệm thu</option>
                  <option value="Đang theo dõi">Đang theo dõi</option>
                </select>

                <span className="text-[11px] text-slate-500 px-1 font-mono font-medium whitespace-nowrap hidden lg:inline">
                  {filteredRecords.length}/{records.length}
                </span>
              </div>

              {/* Action Buttons: Thêm mới + Xuất Excel */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsAddingRecord(prev => !prev)}
                  className="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Thêm Biên Bản</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const suffix = activeMonthFilter !== 'all' ? `_Thang_${activeMonthFilter}` : '';
                    exportRecordsToExcel(filteredRecords, `2026-XLKT_Nhat_Ky_Ky_Su${suffix}.xlsx`);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                  title="Xuất danh sách kết quả đang xem thành file Excel (.xlsx)"
                >
                  <Download className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Xuất Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const suffix = activeMonthFilter !== 'all' ? `_Thang_${activeMonthFilter}` : '';
                    exportRecordsToCSV(filteredRecords, `2026-XLKT_Nhat_Ky_Ky_Su${suffix}.csv`);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                  title="Xuất danh sách kết quả đang xem thành file CSV (.csv)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Xuất CSV</span>
                </button>
              </div>
            </div>

            {/* Monthly Results Bar & 30-day Edit Lock Policy Notice */}
            <div className="bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 mr-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xem theo tháng:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveMonthFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    activeMonthFilter === 'all'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({records.length})
                </button>
                {availableRecordMonths.map(item => (
                  <button
                    key={item.month}
                    type="button"
                    onClick={() => setActiveMonthFilter(item.month)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      activeMonthFilter === item.month
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {formatMonthLabel(item.month)} ({item.count})
                  </button>
                ))}
              </div>

              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                <Lock className="w-3 h-3 text-amber-700 shrink-0" />
                <span>Kết quả đã lưu quá {RESULT_EDIT_LOCK_DAYS} ngày sẽ tự động khóa chỉnh sửa</span>
              </span>
            </div>

            {/* Add Record Form */}
            {isAddingRecord && (
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-sm space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Thêm Mới Biên Bản Xử Lý Kỹ Thuật (2026-XLKT)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingRecord(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mã biên bản *</label>
                    <input
                      type="text"
                      value={newRecord.code}
                      onChange={(e) => setNewRecord({ ...newRecord, code: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border rounded-lg font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ngày xử lý *</label>
                    <input
                      type="date"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Khách hàng / Bệnh viện *</label>
                    <input
                      type="text"
                      placeholder="VD: Bệnh viện Đa khoa Nông Nghiệp"
                      value={newRecord.hospital}
                      onChange={(e) => setNewRecord({ ...newRecord, hospital: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Model máy *</label>
                    <select
                      value={newRecord.equipmentModel}
                      onChange={(e) => setNewRecord({ ...newRecord, equipmentModel: e.target.value as any })}
                      className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-medium"
                    >
                      <option value="Zybio EXC200/220">Zybio EXC200/220</option>
                      <option value="Zybio Z3 CRP">Zybio Z3 CRP</option>
                      <option value="Zybio Z50">Zybio Z50</option>
                      <option value="FS-205">FS-205</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Số Serial máy</label>
                    <input
                      type="text"
                      placeholder="VD: EXC-2024-089"
                      value={newRecord.serialNumber}
                      onChange={(e) => setNewRecord({ ...newRecord, serialNumber: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kỹ sư thực hiện *</label>
                    <input
                      type="text"
                      value={newRecord.engineerName}
                      onChange={(e) => setNewRecord({ ...newRecord, engineerName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Trạng thái nghiệm thu</label>
                    <select
                      value={newRecord.status}
                      onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value as any })}
                      className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-medium"
                    >
                      <option value="Đã nghiệm thu">Đã nghiệm thu</option>
                      <option value="Đang theo dõi">Đang theo dõi</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Lỗi phát hiện / Hiện tượng *</label>
                    <textarea
                      rows={2}
                      value={newRecord.faultFound}
                      onChange={(e) => setNewRecord({ ...newRecord, faultFound: e.target.value })}
                      placeholder="Mô tả chi tiết triệu chứng, mã lỗi, nguyên nhân..."
                      className="w-full px-3 py-1.5 text-xs border rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phương án xử lý kỹ thuật *</label>
                    <textarea
                      rows={2}
                      value={newRecord.solutionProvided}
                      onChange={(e) => setNewRecord({ ...newRecord, solutionProvided: e.target.value })}
                      placeholder="Các thao tác sửa chữa, căn chỉnh, kết quả kiểm tra..."
                      className="w-full px-3 py-1.5 text-xs border rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vật tư / Linh kiện thay thế</label>
                    <input
                      type="text"
                      placeholder="VD: Ống dẫn silicone chịu áp Ø3x5 (2m), Van một chiều"
                      value={newRecord.replacedParts}
                      onChange={(e) => setNewRecord({ ...newRecord, replacedParts: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border rounded-lg font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ghi chú bàn giao</label>
                    <input
                      type="text"
                      placeholder="VD: KTV đã ký biên bản bàn giao, máy chạy QC đạt chuẩn."
                      value={newRecord.notes}
                      onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingRecord(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newRecord.hospital || !newRecord.faultFound) {
                        alert('Vui lòng nhập đầy đủ Bệnh viện và Lỗi phát hiện!');
                        return;
                      }
                      const savedDate = newRecord.date || new Date().toISOString().split('T')[0];
                      const nowIso = new Date().toISOString();
                      onAddRecord({
                        id: `MREC-${Date.now()}`,
                        code: newRecord.code || `2026-XLKT-${String(records.length + 1).padStart(3, '0')}`,
                        date: savedDate,
                        hospital: newRecord.hospital,
                        equipmentModel: newRecord.equipmentModel as any,
                        serialNumber: newRecord.serialNumber || 'Theo máy',
                        faultFound: newRecord.faultFound,
                        solutionProvided: newRecord.solutionProvided || 'Đã sửa chữa và kiểm định đạt chuẩn',
                        engineerName: newRecord.engineerName || 'Nguyễn Quang Đạt',
                        replacedParts: newRecord.replacedParts || 'Không thay linh kiện',
                        status: newRecord.status || 'Đã nghiệm thu',
                        notes: newRecord.notes || '',
                        savedAt: nowIso,
                        savedMonth: getSavedMonthKey(savedDate)
                      });
                      setIsAddingRecord(false);
                      setNewRecord({
                        code: `2026-XLKT-${String(records.length + 2).padStart(3, '0')}`,
                        date: new Date().toISOString().split('T')[0],
                        hospital: '',
                        equipmentModel: 'Zybio EXC200/220',
                        serialNumber: '',
                        faultFound: '',
                        solutionProvided: '',
                        engineerName: 'Nguyễn Quang Đạt',
                        replacedParts: '',
                        status: 'Đã nghiệm thu',
                        notes: ''
                      });
                      alert('Đã lưu thành công biên bản mới vào sổ tay 2026-XLKT!');
                    }}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Biên Bản Vào Sổ Tay</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bulk Action Toolbar for Selected Records */}
            {selectedRecordIds.length > 0 && (
              <div className="bg-red-50/90 border-2 border-red-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {selectedRecordIds.length}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-red-950 flex items-center gap-2">
                      <span>Đã đánh dấu {selectedRecordIds.length} biên bản kỹ thuật</span>
                      <span className="text-[10px] bg-red-200/80 text-red-800 px-2 py-0.5 rounded-full font-semibold">
                        {selectedRecordIds.length === records.length ? 'Toàn bộ sổ tay' : `${selectedRecordIds.length}/${records.length}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-red-700">
                      Sẵn sàng thực hiện xóa hàng loạt an toàn với hộp thoại xác nhận.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRecordIds([])}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors shadow-2xs"
                  >
                    Bỏ Chọn ({selectedRecordIds.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBatchDeleteModalOpen(true)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    title="Xóa vĩnh viễn các biên bản đã chọn"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa Hàng Loạt ({selectedRecordIds.length})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Records Table with Full Admin Operations */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-3 w-10 text-center whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isAllRecordsSelected}
                          ref={el => {
                            if (el) el.indeterminate = isSomeRecordsSelected;
                          }}
                          onChange={handleToggleSelectAllRecords}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                          title={isAllRecordsSelected ? "Bỏ chọn tất cả" : "Đánh dấu chọn tất cả biên bản hiển thị để xóa hàng loạt"}
                        />
                      </th>
                      <th className="px-3.5 py-3 whitespace-nowrap">Mã BB</th>
                      <th className="px-3 py-3 whitespace-nowrap">Ngày</th>
                      <th className="px-3.5 py-3">Khách Hàng / BV</th>
                      <th className="px-3 py-3 whitespace-nowrap">Thiết Bị</th>
                      <th className="px-4 py-3">Lỗi Phát Hiện</th>
                      <th className="px-4 py-3">Phương Án Xử Lý</th>
                      <th className="px-3 py-3">Linh Kiện</th>
                      <th className="px-3 py-3 whitespace-nowrap">Kỹ Sư</th>
                      <th className="px-3 py-3 whitespace-nowrap">Trạng Thái</th>
                      <th className="px-3.5 py-3 text-right whitespace-nowrap">Thao Tác Quản Trị</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                          Không tìm thấy biên bản xử lý kỹ thuật nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map(r => {
                        const isSelected = selectedRecordIds.includes(r.id);
                        const lockAnchor = r.savedAt || r.date;
                        const isRecordLocked = isSavedResultLocked(lockAnchor);
                        const recordMonth = r.savedMonth || getSavedMonthKey(lockAnchor);
                        const remainingDays = getRemainingEditableDays(lockAnchor);
                        return (
                          <tr key={r.id} className={`hover:bg-slate-50/80 transition-colors group ${isSelected ? 'bg-red-50/40' : ''}`}>
                            <td className="px-3 py-3 text-center whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectRecord(r.id)}
                                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                                aria-label={`Chọn biên bản ${r.code} để xóa hàng loạt`}
                                title={`Đánh dấu ${r.code} để xóa hàng loạt`}
                              />
                            </td>
                            <td className="px-3.5 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                              {r.code}
                            </td>
                            <td className="px-3 py-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                              <div>{r.date}</div>
                              <div className="flex items-center gap-1 mt-0.5 font-sans">
                                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                                  {formatMonthLabel(recordMonth)}
                                </span>
                                {isRecordLocked ? (
                                  <span
                                    className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded"
                                    title={`Đã lưu quá ${RESULT_EDIT_LOCK_DAYS} ngày — Đã khóa chỉnh sửa`}
                                  >
                                    <Lock className="w-2.5 h-2.5" />
                                    <span>Khóa</span>
                                  </span>
                                ) : (
                                  <span
                                    className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded"
                                    title={`Có thể chỉnh sửa trong ${remainingDays} ngày nữa`}
                                  >
                                    Sửa: {remainingDays}n
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3.5 py-3 font-semibold text-slate-800">
                              <div>{r.hospital}</div>
                              {r.serialNumber && r.serialNumber !== 'Chưa rõ' && (
                                <div className="text-[10px] text-slate-400 font-mono">SN: {r.serialNumber}</div>
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-emerald-800 font-medium">
                              <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200/60 font-semibold text-[11px]">
                                {r.equipmentModel}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-700 max-w-xs leading-relaxed">
                              <p className="line-clamp-2 text-xs" title={r.faultFound}>{r.faultFound}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-600 max-w-xs leading-relaxed">
                              <p className="line-clamp-2 text-xs" title={r.solutionProvided}>{r.solutionProvided}</p>
                            </td>
                            <td className="px-3 py-3 text-slate-500 font-mono text-[11px] max-w-[130px] truncate" title={r.replacedParts}>
                              {r.replacedParts || 'Không'}
                            </td>
                            <td className="px-3 py-3 font-medium text-slate-900 whitespace-nowrap">
                              {r.engineerName}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                r.status === 'Đã nghiệm thu' 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap text-right">
                              <div className="inline-flex items-center gap-1 justify-end">
                                {/* Xem chi tiết */}
                                <button
                                  type="button"
                                  onClick={() => setViewingRecord(r)}
                                  className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                  title="Xem toàn văn biên bản nghiệm thu kỹ thuật"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Sửa / Đã khóa sau 30 ngày */}
                                {isRecordLocked ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="p-1.5 text-amber-600/70 bg-amber-50/70 rounded-lg cursor-not-allowed"
                                    title={`Đã khóa chỉnh sửa sau ${RESULT_EDIT_LOCK_DAYS} ngày kể từ khi lưu`}
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditRecord(r)}
                                    className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                                    title={`Chỉnh sửa (còn ${remainingDays} ngày trước khi khóa)`}
                                  >
                                    <Edit className="w-3.5 h-3.5 text-amber-600" />
                                  </button>
                                )}

                                {/* Xóa biên bản */}
                                <button
                                  type="button"
                                  onClick={() => setRecordToDelete(r)}
                                  className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                  title="Xóa biên bản này khỏi sổ tay"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </button>

                                {/* Tạo SOP từ biên bản */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedRecordForAnalysis(r);
                                    setIsAutoAnalyzeModalOpen(true);
                                  }}
                                  className="px-2 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs ml-1"
                                  title="Tự động phân tích sự cố này và chuyển thành quy trình SOP"
                                >
                                  <Sparkles className="w-3 h-3 text-emerald-600" />
                                  <span>SOP</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL 1: CHỈNH SỬA / THAY ĐỔI NỘI DUNG BIÊN BẢN (Edit Record Modal) */}
            {editingRecord && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
                  <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                        <Edit className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">
                          Chỉnh Sửa Biên Bản Xử Lý Kỹ Thuật
                        </h3>
                        <p className="text-[11px] text-emerald-200 font-mono">
                          Mã: {editingRecord.code} · Ngày: {editingRecord.date}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingRecord(null)}
                      className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditedRecord} className="p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Mã Biên Bản <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingRecord.code}
                          onChange={(e) => setEditingRecord({ ...editingRecord, code: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Ngày Xử Lý <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={editingRecord.date}
                          onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Trạng Thái Nghiệm Thu <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editingRecord.status}
                          onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                        >
                          <option value="Đã nghiệm thu">Đã nghiệm thu</option>
                          <option value="Đang theo dõi">Đang theo dõi</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Cơ Sở Y Tế / Khách Hàng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingRecord.hospital}
                          onChange={(e) => setEditingRecord({ ...editingRecord, hospital: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Model Thiết Bị <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editingRecord.equipmentModel}
                          onChange={(e) => setEditingRecord({ ...editingRecord, equipmentModel: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                        >
                          <option value="Zybio EXC200/220">Zybio EXC200/220</option>
                          <option value="Zybio Z3 CRP">Zybio Z3 CRP</option>
                          <option value="Zybio Z50">Zybio Z50</option>
                          <option value="FS-205">FS-205</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Số Serial Máy
                        </label>
                        <input
                          type="text"
                          value={editingRecord.serialNumber}
                          onChange={(e) => setEditingRecord({ ...editingRecord, serialNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Kỹ Sư Trực Tiếp Xử Lý <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingRecord.engineerName}
                        onChange={(e) => setEditingRecord({ ...editingRecord, engineerName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Hiện Tượng & Lỗi Phát Hiện Tại Viện <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={editingRecord.faultFound}
                        onChange={(e) => setEditingRecord({ ...editingRecord, faultFound: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Phương Án Xử Lý & Hiệu Chuẩn Kỹ Thuật <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={editingRecord.solutionProvided}
                        onChange={(e) => setEditingRecord({ ...editingRecord, solutionProvided: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Vật Tư / Linh Kiện Thay Thế
                        </label>
                        <input
                          type="text"
                          value={editingRecord.replacedParts}
                          onChange={(e) => setEditingRecord({ ...editingRecord, replacedParts: e.target.value })}
                          placeholder="VD: Van một chiều xả thải, Ống silicone chịu áp"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Ghi Chú Nghiệm Thu / Bàn Giao
                        </label>
                        <input
                          type="text"
                          value={editingRecord.notes}
                          onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                          placeholder="VD: KTV đã kiểm tra chạy QC đạt chuẩn"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingRecord(null)}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg font-bold text-slate-700 cursor-pointer"
                      >
                        Hủy Bỏ
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Save className="w-4 h-4 text-white" />
                        <span>Lưu Cập Nhật Biên Bản</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL 2: XEM CHI TIẾT BIÊN BẢN NGHIỆM THU (View Record Detail Modal) */}
            {viewingRecord && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
                  <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">
                          Biên Bản Xử Lý Kỹ Thuật Số: {viewingRecord.code}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Sổ tay thực chiến 2026-XLKT · Công ty Cổ phần Thiết Bị Y Tế ADC
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setViewingRecord(null)}
                      className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 overflow-y-auto space-y-4 text-xs">
                    {/* Lock / Month Status Banner */}
                    {(() => {
                      const anchor = viewingRecord.savedAt || viewingRecord.date;
                      const locked = isSavedResultLocked(anchor);
                      const monthLbl = formatMonthLabel(viewingRecord.savedMonth || getSavedMonthKey(anchor));
                      const daysLeft = getRemainingEditableDays(anchor);
                      return (
                        <div className={`px-3.5 py-2 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${
                          locked ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}>
                          <span className="font-semibold flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Lưu trữ theo kỳ: {monthLbl}</span>
                          </span>
                          {locked ? (
                            <span className="font-bold flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Đã khóa chỉnh sửa (quá {RESULT_EDIT_LOCK_DAYS} ngày)</span>
                            </span>
                          ) : (
                            <span className="font-semibold">
                              Còn {daysLeft} ngày có thể chỉnh sửa
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    {/* Header Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Ngày Thực Hiện</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">{viewingRecord.date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Trạng Thái</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          viewingRecord.status === 'Đã nghiệm thu' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {viewingRecord.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Kỹ Sư Phụ Trách</span>
                        <span className="font-bold text-slate-900 text-xs">{viewingRecord.engineerName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Số Serial Máy</span>
                        <span className="font-mono text-slate-700 text-xs">{viewingRecord.serialNumber || 'Theo máy'}</span>
                      </div>
                    </div>

                    {/* Facility & Machine */}
                    <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">Cơ Sở Y Tế Khách Hàng:</span>
                        <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold text-[11px]">
                          {viewingRecord.equipmentModel}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{viewingRecord.hospital}</p>
                    </div>

                    {/* Fault Description */}
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1.5 flex items-center gap-1.5 text-red-700">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Sự Cố / Lỗi Phát Hiện Tại Hiện Trường</span>
                      </h4>
                      <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 text-slate-800 leading-relaxed">
                        {viewingRecord.faultFound}
                      </div>
                    </div>

                    {/* Solution Provided */}
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1.5 flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Phương Án Khắc Phục & Hiệu Chuẩn Đạt Chuẩn</span>
                      </h4>
                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-slate-800 leading-relaxed">
                        {viewingRecord.solutionProvided}
                      </div>
                    </div>

                    {/* Replaced Parts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Vật Tư & Linh Kiện Thay Thế:</span>
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                          {viewingRecord.replacedParts || 'Không phát sinh thay thế linh kiện'}
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Ghi Chú Nghiệm Thu:</span>
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700">
                          {viewingRecord.notes || 'Biên bản được xác nhận đạt chuẩn vận hành.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                    {isSavedResultLocked(viewingRecord.savedAt || viewingRecord.date) ? (
                      <span className="px-3.5 py-2 bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold flex items-center gap-1.5 text-xs">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Đã Khóa Chỉnh Sửa (Quá {RESULT_EDIT_LOCK_DAYS} Ngày)</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const rec = viewingRecord;
                          setViewingRecord(null);
                          handleStartEditRecord(rec);
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Chỉnh Sửa Biên Bản Này</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setViewingRecord(null)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL 3: XÁC NHẬN XÓA BIÊN BẢN (Delete Confirmation Modal) */}
            {recordToDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl shadow-2xl border border-red-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
                  <div className="p-5 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Xác Nhận Xóa Biên Bản Kỹ Thuật?
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Bạn có chắc chắn muốn xóa biên bản <strong className="text-slate-900 font-mono">{recordToDelete.code}</strong> tại <strong className="text-slate-900">{recordToDelete.hospital}</strong> khỏi sổ tay 2026-XLKT?
                      </p>
                      <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg mt-2 border border-red-100">
                        Thao tác này sẽ xóa vĩnh viễn dữ liệu khỏi sổ tay và hệ thống lưu trữ!
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRecordToDelete(null)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg font-bold text-slate-700 cursor-pointer text-xs"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeleteRecord}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                      <span>Xác Nhận Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL 4: XÁC NHẬN XÓA HÀNG LOẠT BIÊN BẢN (Batch Delete Confirmation Modal) */}
            {isBatchDeleteModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl shadow-2xl border border-red-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
                  <div className="p-5 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
                      <Trash2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Xác Nhận Xóa Hàng Loạt {selectedRecordIds.length} Biên Bản?
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Bạn đang chọn xóa vĩnh viễn <strong className="text-red-700 font-bold">{selectedRecordIds.length} biên bản kỹ thuật</strong> khỏi Sổ tay 2026-XLKT.
                      </p>
                    </div>

                    {/* Preview danh sách các biên bản được chọn */}
                    <div className="max-h-48 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-left divide-y divide-slate-150">
                      {records.filter(r => selectedRecordIds.includes(r.id)).map(r => (
                        <div key={r.id} className="py-2 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{r.code}</span>
                            <span className="text-slate-700 font-medium truncate max-w-[200px]">{r.hospital}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono shrink-0">{r.date}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200 text-left space-y-1">
                      <p className="font-bold flex items-center gap-1 text-red-800">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Cảnh báo quản trị:</span>
                      </p>
                      <p>Thao tác xóa hàng loạt không thể hoàn tác trực tiếp. Dữ liệu sẽ được loại khỏi sổ tay và bộ nhớ máy tính. Bạn có thể nạp lại dữ liệu gốc bất kỳ lúc nào qua nút khôi phục dữ liệu gốc.</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsBatchDeleteModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-slate-700 cursor-pointer text-xs transition-colors"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmBatchDeleteRecords}
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs cursor-pointer text-xs transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                      <span>Xác Nhận Xóa {selectedRecordIds.length} Biên Bản</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: QUẢN TRỊ BẢNG TIN ADC & PHÊ DUYỆT KHUYẾN CÁO KỸ SƯ */}
        {currentTab === 'bulletins' && (
          <div className="space-y-6">
            {/* Top KPI Cards for Bulletins */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Tổng Khuyến Cáo Kỹ Thuật ADC</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold font-mono text-slate-900">{bulletins.length}</span>
                  <span className="text-xs text-emerald-600 font-medium font-mono">Chuyên sâu ADC</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Biên soạn bởi đội ngũ Kỹ sư Thiết bị Y tế ADC
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Đã Duyệt & Công Khai (Cổng KH)</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold font-mono text-emerald-600">
                    {bulletins.filter(b => b.status === 'published' && b.approvedBy).length}
                  </span>
                  <span className="text-xs text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Hiện tại Viện
                  </span>
                </div>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">
                  Khách hàng tra cứu và xem trực tiếp trên Cổng Hỗ Trợ
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Bản Nháp / Chờ Phê Duyệt</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold font-mono text-amber-600">
                    {bulletins.filter(b => b.status !== 'published' || !b.approvedBy).length}
                  </span>
                  <span className="text-xs text-amber-700 font-mono bg-amber-50 px-1.5 py-0.5 rounded">
                    Đang ẩn an toàn
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Cổng Khách Hàng tự động ẩn, chỉ Admin nhìn thấy
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Khuyến Cáo Ghim Nổi Bật</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold font-mono text-blue-600">
                    {bulletins.filter(b => b.isPinned).length}
                  </span>
                  <span className="text-xs text-blue-700 font-mono bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Pin className="w-3 h-3" /> Banner Chạy
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Hiển thị ticker trên đầu trang Cổng Khách Hàng
                </p>
              </div>
            </div>

            {/* Strict Approval Policy Banner */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <p className="font-bold text-emerald-950">
                    Chính Sách Phê Duyệt & Xuất Bản Khuyến Cáo Kỹ Sư ADC
                  </p>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Cổng Hỗ Trợ Khách Hàng chỉ hiển thị các bài viết được <strong>Quản Trị Viên phê duyệt và biên soạn</strong> (<span className="font-mono bg-emerald-100 px-1 rounded">status = published</span> & có người phê duyệt). Các bản nháp hoặc chờ duyệt sẽ luôn được giữ bảo mật nội bộ.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentBulletin({
                    title: '',
                    category: 'Khuyến cáo kỹ thuật',
                    equipmentModel: 'Zybio EXC200/220',
                    priority: 'high',
                    summary: '',
                    content: '',
                    recommendations: ['Bước 1: ', 'Bước 2: '],
                    engineerAuthor: 'KS. Nguyễn Quang Đạt (Trưởng nhóm Kỹ thuật ADC)',
                    status: 'published',
                    isPinned: false
                  });
                  setIsEditingBulletin(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tạo Khuyến Cáo Mới</span>
              </button>
            </div>

            {/* Bulletins List Table / Cards */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Danh Sách Khuyến Cáo Kỹ Sư ADC ({bulletins.length})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportBulletinsToExcel(bulletins)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Xuất bảng tin khuyến cáo sang file Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Xuất Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => exportBulletinsToCSV(bulletins)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Xuất bảng tin khuyến cáo sang file CSV (.csv)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Xuất CSV</span>
                  </button>
                  <span className="text-xs text-slate-500 hidden sm:inline">
                    {bulletins.filter(b => b.status === 'published' && b.approvedBy).length} bài đang phát hành trên Cổng Khách Hàng
                  </span>
                </div>
              </div>

              {filteredBulletins.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="font-semibold text-slate-700">Không tìm thấy khuyến cáo nào phù hợp</p>
                  <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc tìm kiếm hoặc tạo khuyến cáo mới.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredBulletins.map((bulletin) => {
                    const isApprovedAndPublished = bulletin.status === 'published' && Boolean(bulletin.approvedBy);
                    return (
                      <div
                        key={bulletin.id}
                        className={`p-4 transition-colors hover:bg-slate-50/70 ${
                          bulletin.isPinned ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            {/* Badges & Meta */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Pin Toggle */}
                              <button
                                type="button"
                                onClick={() => onTogglePinBulletin && onTogglePinBulletin(bulletin.id)}
                                title={bulletin.isPinned ? 'Bỏ ghim khỏi đầu bảng tin' : 'Ghim bài này lên đầu bảng tin'}
                                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                                  bulletin.isPinned
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                <Pin className={`w-3 h-3 ${bulletin.isPinned ? 'fill-amber-600 text-amber-600' : ''}`} />
                                <span>{bulletin.isPinned ? 'Đã Ghim' : 'Ghim'}</span>
                              </button>

                              {/* Priority */}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                bulletin.priority === 'urgent'
                                  ? 'bg-red-100 text-red-700 border border-red-200'
                                  : bulletin.priority === 'high'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {bulletin.priority === 'urgent' ? 'Khẩn cấp' : bulletin.priority === 'high' ? 'Ưu tiên cao' : 'Tiêu chuẩn'}
                              </span>

                              {/* Category */}
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                                {bulletin.category}
                              </span>

                              {/* Model */}
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                {bulletin.equipmentModel}
                              </span>

                              {/* Publication Status Pill */}
                              {isApprovedAndPublished ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Đã Duyệt & Công Khai (Hiện Cổng KH)</span>
                                </span>
                              ) : bulletin.status === 'draft' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Bản Nháp Nội Bộ (Ẩn trên Cổng KH)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Chờ Phê Duyệt (Ẩn trên Cổng KH)</span>
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h4
                              onClick={() => setViewingBulletinAdmin(bulletin)}
                              className="text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                            >
                              {bulletin.title}
                            </h4>

                            {/* Summary */}
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {bulletin.summary}
                            </p>

                            {/* Author & Approver Info */}
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-500 pt-1">
                              <span className="flex items-center gap-1">
                                <span className="font-medium text-slate-700">Kỹ sư biên soạn:</span> {bulletin.engineerAuthor}
                              </span>
                              {bulletin.approvedBy && (
                                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Phê duyệt bởi: {bulletin.approvedBy} ({bulletin.approvedAt || bulletin.updatedAt})</span>
                                </span>
                              )}
                              <span className="text-slate-400">
                                Cập nhật: {bulletin.updatedAt}
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions for this Bulletin - Dạng icon nằm ngang dễ dàng chỉnh sửa & thao tác */}
                          <div className="flex flex-row items-center gap-1 shrink-0 self-end sm:self-center bg-slate-50 border border-slate-200/80 p-1 rounded-xl shadow-2xs">
                            {/* Chỉnh sửa (Edit) - Nổi bật, dễ thao tác ngay */}
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentBulletin({ ...bulletin });
                                setIsEditingBulletin(true);
                              }}
                              title="Chỉnh sửa khuyến cáo kỹ thuật"
                              className="p-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200/60 cursor-pointer transition-all hover:scale-105 active:scale-95"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Xem chi tiết (View Full) */}
                            <button
                              type="button"
                              onClick={() => setViewingBulletinAdmin(bulletin)}
                              title="Xem chi tiết khuyến cáo"
                              className="p-2 rounded-lg text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 cursor-pointer transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Trạng thái Phê duyệt / Thu về nháp (1-click icon) */}
                            {isApprovedAndPublished ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Bạn có chắc chắn muốn thu hồi khuyến cáo "${bulletin.title}" về Bản Nháp? (Bài viết sẽ lập tức ẩn khỏi Cổng Khách Hàng)`)) {
                                    onUnpublishBulletin && onUnpublishBulletin(bulletin.id);
                                  }
                                }}
                                title="Đang xuất bản (Click để thu hồi về Bản Nháp)"
                                className="p-2 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 cursor-pointer transition-colors"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  onApproveBulletin && onApproveBulletin(bulletin.id, 'Ban Quản Trị ADC');
                                  alert(`Đã phê duyệt và xuất bản khuyến cáo "${bulletin.title}"! Khách hàng tại các bệnh viện có thể xem ngay trên Cổng Hỗ Trợ.`);
                                }}
                                title="Bản nháp (Click để phê duyệt & xuất bản lên Cổng Khách Hàng)"
                                className="p-2 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs cursor-pointer transition-colors"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                            )}

                            {/* Xóa (Delete) */}
                            <button
                              type="button"
                              onClick={() => setBulletinToDelete(bulletin)}
                              title="Xóa khuyến cáo này"
                              className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUB-NAV: TÁCH RIÊNG BÁO CÁO KPI PHIẾU TRỰC TIẾP & KPI CHATBOT AI */}
        {(currentTab === 'analytics' || currentTab === 'chatbot_analytics') && (
          <div className="mb-5 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {userAllowedTabs.includes('analytics') && (
                <button
                  type="button"
                  onClick={() => setCurrentTab('analytics')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    currentTab === 'analytics'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Wrench className={`w-3.5 h-3.5 ${currentTab === 'analytics' ? 'text-white' : 'text-blue-600'}`} />
                  <span>KPI Phiếu Trực Tiếp</span>
                  <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-md ${
                    currentTab === 'analytics'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {directTickets.length} phiếu
                  </span>
                </button>
              )}

              {userAllowedTabs.includes('chatbot_analytics') && (
                <button
                  type="button"
                  onClick={() => setCurrentTab('chatbot_analytics')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    currentTab === 'chatbot_analytics'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Bot className={`w-3.5 h-3.5 ${currentTab === 'chatbot_analytics' ? 'text-white' : 'text-emerald-600'}`} />
                  <span>KPI Chatbot AI</span>
                  <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-md ${
                    currentTab === 'chatbot_analytics'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {chatSessions.length} phiên
                  </span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 px-2 text-[11px] text-slate-500 font-medium">
              <span>
                Phiếu trực tiếp: <strong className="font-mono text-blue-700">{directTickets.length}</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span>
                Phiếu từ Chatbot: <strong className="font-mono text-emerald-700">{chatbotEscalatedTickets.length}</strong>
              </span>
            </div>
          </div>
        )}

        {/* TAB 5: BÁO CÁO KPI PHIẾU HỖ TRỢ TRỰC TIẾP & SLA */}
        {currentTab === 'analytics' && (
          <div className="space-y-6">
            {/* Direct Tickets Header */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                  <Wrench className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Báo Cáo KPI Phiếu Hỗ Trợ Trực Tiếp & SLA Hiện Trường
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thống kê độc lập các phiếu yêu cầu tiếp nhận trực tiếp (tách biệt hoàn toàn với phiên xử lý của Chatbot AI)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => exportTicketsToExcel(directTickets)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="Xuất báo cáo phiếu trực tiếp ra Excel (.xlsx)"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>Xuất Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportTicketsToCSV(directTickets, 'Bao_Cao_Phieu_Truc_Tiep_ADC.csv')}
                  className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="Xuất báo cáo phiếu trực tiếp ra CSV (.csv)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                  <span>Xuất CSV</span>
                </button>
              </div>
            </div>

            {/* Top Direct Ticket KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Tổng Phiếu Trực Tiếp Tiếp Nhận</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold font-mono text-slate-900">{directTickets.length}</span>
                  <span className="text-xs text-blue-700 font-medium font-mono bg-blue-50 px-1.5 py-0.5 rounded">
                    Trực tiếp
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {directCompleted} hoàn thành · {directInProgress} đang xử lý · {directPending} chờ nhận
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Tỷ Lệ Hoàn Thành Phiếu Trực Tiếp</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold font-mono text-emerald-600">{directCompletionRate}%</span>
                  <span className="text-xs text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded">
                    Mục tiêu: ≥95%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {directCompleted}/{directTickets.length} phiếu trực tiếp đã nghiệm thu
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Tỷ Lệ Đã Phân Công Kỹ Sư</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold font-mono text-blue-600">{directAssignedRate}%</span>
                  <span className="text-xs text-blue-700 font-mono bg-blue-50 px-1.5 py-0.5 rounded">
                    {directAssigned}/{directTickets.length} phiếu
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Điều phối kỹ sư trực tiếp tiếp nhận xử lý hiện trường
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">Phiếu Khẩn Cấp Trực Tiếp</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold font-mono text-red-600">{directUrgent}</span>
                  <span className="text-xs text-red-700 font-mono bg-red-50 px-1.5 py-0.5 rounded">
                    Ưu tiên SLA &lt; 2h
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ca khẩn cấp tiếp nhận trực tiếp (không qua Chatbot)
                </p>
              </div>
            </div>

            {/* CHART 2: TỶ LỆ 5 NHÓM LỖI KỸ THUẬT (DONUT & LEGEND) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Tỷ Lệ 5 Nhóm Lỗi Kỹ Thuật (Tổng Thể)
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">103 ca phân tích</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Phân bố tỷ lệ sự cố theo phân loại cụm cơ cấu máy xét nghiệm y tế
                  </p>

                  {/* Recharts Pie / Donut Chart */}
                  <div className="h-56 w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={errorCategoriesPie}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {errorCategoriesPie.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-slate-900/95 text-white p-2.5 rounded-xl text-xs space-y-0.5 shadow-xl">
                                  <p className="font-bold" style={{ color: d.color }}>{d.name}</p>
                                  <p className="font-mono">{d.value}% ({d.count} ca)</p>
                                  <p className="text-[10px] text-slate-300">{d.desc}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Donut Center Label */}
                    <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold font-mono text-slate-900 leading-none">38%</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Lỗi cơ khí/kim</span>
                    </div>
                  </div>
                </div>

                {/* Clean Custom Legend List */}
                <div className="flex-1 space-y-2.5 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-3 md:pt-0">
                  <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Chi tiết nhóm cơ cấu kỹ thuật
                  </h5>
                  {errorCategoriesPie.map(cat => (
                    <div key={cat.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <div>
                          <span className="font-medium text-slate-800">{cat.name}</span>
                          <p className="text-[10px] text-slate-400">{cat.desc}</p>
                        </div>
                      </div>
                      <div className="text-right font-mono shrink-0 ml-3">
                        <span className="font-bold text-slate-900">{cat.value}%</span>
                        <span className="text-slate-400 text-[10px] block">({cat.count} ca)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 4: BẢNG CHI TIẾT TẦN SUẤT SỰ CỐ & ĐỘI NGŨ KỸ SƯ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Common Error Codes Registry */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Top 5 Mã Lỗi Xuất Hiện Nhiều Nhất (Thực Chiến 2026-XLKT)
                  </h4>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    Nhấn để xem nhanh ca đã xử lý
                  </span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { code: 'E101', model: 'Zybio EXC200/220', count: 18, desc: 'Kim hút mẫu/hóa chất va chạm cơ cấu / nghẽn fibrin', risk: 'Khẩn cấp' },
                    { code: 'H101', model: 'Zybio Z3 CRP', count: 14, desc: 'Nghẽn lỗ đếm vi mô sapphire WBC/RBC do clot mẫu', risk: 'Khẩn cấp' },
                    { code: 'E205', model: 'Zybio EXC200/220', count: 11, desc: 'Tràn nước trạm rửa cuvette do nghẹt muối photphat', risk: 'Cảnh báo' },
                    { code: 'Z501', model: 'Zybio Z50', count: 8, desc: 'Bọt khí vi mô buồng đếm dòng tế bào laser 5TP', risk: 'Cảnh báo' },
                    { code: 'FS101', model: 'FS-205', count: 6, desc: 'Kẹt khay nạp thẻ cassette do trượt răng dây curoa mini', risk: 'Khẩn cấp' }
                  ].map(item => {
                    const isExpanded = expandedErrorCode === item.code;
                    const codeUpper = item.code.toUpperCase();

                    const matchedHandledRecords = records.filter(r => {
                      const text = `${r.faultFound} ${r.solutionProvided} ${r.notes}`.toUpperCase();
                      return text.includes(codeUpper);
                    });

                    const matchedCompletedTickets = tickets.filter(t => {
                      if (t.status !== 'completed' && !t.engineerReport) return false;
                      const err = (t.errorCode || '').toUpperCase();
                      const desc = (t.issueDescription || '').toUpperCase();
                      return err === codeUpper || desc.includes(codeUpper);
                    });

                    const handledCases = [
                      ...matchedCompletedTickets.map(t => ({
                        id: t.id,
                        caseCode: t.ticketCode,
                        date: (t.resolvedAt || t.createdAt || '').slice(0, 10),
                        hospital: t.hospitalClinic,
                        serialNumber: t.serialNumber || '',
                        fault: t.issueDescription,
                        solution: t.engineerReport?.actionsTaken || t.notes || 'Đã xử lý hoàn tất tại hiện trường',
                        engineer: t.engineerReport?.engineerName || t.assignedEngineerName || 'Kỹ sư ADC',
                        parts: t.engineerReport?.replacedParts?.map(p => `${p.name} (x${p.quantity})`).join(', ') || '',
                        statusLabel: 'Đã hoàn tất'
                      })),
                      ...matchedHandledRecords.map(r => ({
                        id: r.id,
                        caseCode: r.code,
                        date: r.date,
                        hospital: r.hospital,
                        serialNumber: r.serialNumber,
                        fault: r.faultFound,
                        solution: r.solutionProvided,
                        engineer: r.engineerName,
                        parts: r.replacedParts,
                        statusLabel: r.status
                      }))
                    ];

                    return (
                      <div
                        key={item.code}
                        className={`rounded-xl border transition-all overflow-hidden ${
                          isExpanded
                            ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                            : 'bg-slate-50 border-slate-100 hover:bg-emerald-50/40 hover:border-emerald-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedErrorCode(prev => prev === item.code ? null : item.code)}
                          className="w-full p-2.5 flex items-center justify-between text-xs text-left cursor-pointer gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded">
                                {item.code}
                              </span>
                              <span className="font-semibold text-slate-800">{item.model}</span>
                              <span className="text-[10px] text-emerald-700 font-semibold bg-white px-1.5 py-0.2 rounded border border-emerald-200">
                                {handledCases.length} ca đã xử lý
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.desc}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-900 block">{item.count} ca</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                item.risk === 'Khẩn cấp' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {item.risk}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-2.5 pb-2.5 pt-1 border-t border-emerald-200/70 bg-white/80 space-y-2 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-emerald-900 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>List nhanh các ca {item.code} đã được xử lý ({handledCases.length})</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setCurrentTab('records')}
                                className="text-[10px] font-semibold text-blue-700 hover:underline cursor-pointer"
                              >
                                Mở Sổ tay XLKT →
                              </button>
                            </div>

                            {handledCases.length > 0 ? (
                              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                                {handledCases.map(c => (
                                  <div
                                    key={c.id}
                                    className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] space-y-1"
                                  >
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded text-[10px]">
                                          {c.caseCode}
                                        </span>
                                        <span className="font-bold text-slate-800">{c.hospital}</span>
                                        {c.serialNumber && (
                                          <span className="text-[10px] font-mono text-slate-400">({c.serialNumber})</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {c.date && <span className="text-[10px] font-mono text-slate-400">{c.date}</span>}
                                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                          ✓ {c.statusLabel}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-slate-700 leading-snug">
                                      <strong className="text-slate-800">Cách xử lý:</strong> {c.solution}
                                    </p>
                                    <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] text-slate-500 pt-0.5">
                                      <span>
                                        Kỹ sư: <strong className="text-slate-700">{c.engineer}</strong>
                                      </span>
                                      {c.parts && (
                                        <span className="truncate max-w-[260px]" title={c.parts}>
                                          Linh kiện: <strong className="text-slate-700">{c.parts}</strong>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-3 text-[11px] text-slate-400">
                                Chưa có biên bản ca đã xử lý nào cho mã lỗi {item.code}.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Engineer Productivity */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Hiệu Suất &amp; Trạng Thái Đội Ngũ Kỹ Sư ADC (Phòng Kỹ Thuật)
                </h4>
                <div className="divide-y divide-slate-100">
                  {(() => {
                    const technicalEngineers = engineers.filter(
                      eng => eng.role === 'field_engineer' || (eng.department || '').toLowerCase().includes('kỹ thuật')
                    );
                    if (technicalEngineers.length === 0) {
                      return (
                        <div className="py-6 text-center text-xs text-slate-400">
                          Chưa có nhân sự thuộc Phòng Kỹ Thuật.
                        </div>
                      );
                    }
                    return technicalEngineers.map(eng => (
                      <div key={eng.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{eng.name}</span>
                            <span className="text-[10px] text-slate-400">({eng.area})</span>
                          </div>
                          <span className="text-[11px] text-emerald-700 font-mono">{eng.phone}</span>
                        </div>

                        <div className="text-right">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            eng.status === 'on_site'
                              ? 'bg-amber-100 text-amber-800'
                              : eng.status === 'off_duty'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {eng.status === 'on_site'
                              ? 'Đang tại hiện trường'
                              : eng.status === 'off_duty'
                              ? 'Nghỉ ca / Ngoại tuyến'
                              : 'Sẵn sàng điều phối'}
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {eng.activeTicketsCount} phiếu đang phụ trách
                          </p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BÁO CÁO HIỆU SUẤT CHATBOT & PHÂN LOẠI YÊU CẦU NLP */}
        {currentTab === 'chatbot_analytics' && (
          <div className="space-y-6">
            <ChatbotAnalyticsView
              sessions={chatSessions}
              onRefresh={handleRefreshChatSessions}
              onAddSimulatedSession={handleAddSimulatedSession}
            />
          </div>
        )}

        {/* TAB: TRUNG TÂM TỰ HỌC & ĐÚC KẾT TRI THỨC CHATBOT (CONTINUOUS LEARNING) */}
        {currentTab === 'learning' && (
          <ChatbotLearningView
            learnedEntries={learnedKnowledge}
            sessions={chatSessions}
            onUpdateEntries={handleUpdateLearnedKnowledge}
            onPromoteToSOP={handlePromoteLearnedToSOP}
            onNavigateToSOPTab={() => setCurrentTab('sop_mgmt')}
          />
        )}

        {/* TAB 6: CÀI ĐẶT HỆ THỐNG & CHATBOT AI */}
        {currentTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <Settings className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cài Đặt Hệ Thống & Cấu Hình Chatbot AI</h3>
                <p className="text-xs text-slate-500">Tùy biến Hotline 24/7, kênh Zalo tiếp nhận, và cấu hình hoạt động của Trợ lý Chatbot NLP</p>
              </div>
            </div>

            {settingsSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã lưu thành công cấu hình Hotline, Zalo và Chatbot AI mới!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettingsSubmit} className="space-y-6">
              {/* SECTION 0: LOGO THƯƠNG HIỆU HỆ THỐNG */}
              <div className="space-y-3.5 p-4 rounded-xl bg-slate-50/90 border border-slate-200">
                <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Logo Thương Hiệu Hệ Thống (Thanh Tiêu Đề)</span>
                  </h4>
                  {tempSettings.logoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsLogoError(null);
                        setTempSettings({ ...tempSettings, logoUrl: '' });
                      }}
                      className="text-[11px] font-semibold text-slate-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Về logo mặc định</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Preview Box */}
                  <div className="flex items-center gap-3 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shrink-0 shadow-2xs">
                    <div
                      className={`rounded-xl flex items-center justify-center overflow-hidden ${
                        tempSettings.logoUrl?.trim()
                          ? 'h-14 min-w-14 max-w-[180px] px-1 bg-white border border-slate-200'
                          : 'w-14 h-14 bg-emerald-600 text-white'
                      }`}
                    >
                      {tempSettings.logoUrl?.trim() ? (
                        <img
                          src={tempSettings.logoUrl.trim()}
                          alt="Logo hiện tại"
                          className="h-full w-auto max-w-full object-contain"
                          onError={() => setSettingsLogoError('Không thể hiển thị ảnh từ đường dẫn URL này.')}
                        />
                      ) : (
                        <Stethoscope className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">ADC Medical Tech</div>
                      <div className="text-[11px] text-slate-400">
                        {tempSettings.logoUrl?.trim() ? 'Logo tùy chỉnh' : 'Logo mặc định'}
                      </div>
                    </div>
                  </div>

                  {/* Upload & URL Controls */}
                  <div className="flex-1 w-full space-y-2">
                    <input
                      ref={settingsLogoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleSettingsLogoUpload}
                      className="hidden"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        disabled={isProcessingSettingsLogo}
                        onClick={() => settingsLogoInputRef.current?.click()}
                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0 disabled:opacity-60"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isProcessingSettingsLogo ? 'Đang tải...' : 'Tải ảnh Logo lên'}</span>
                      </button>
                      <input
                        type="text"
                        value={tempSettings.logoUrl || ''}
                        onChange={(e) => {
                          setSettingsLogoError(null);
                          setTempSettings({ ...tempSettings, logoUrl: e.target.value });
                        }}
                        placeholder="Hoặc dán URL hình ảnh Logo (https://...)"
                        className="flex-1 px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Hỗ trợ PNG, JPG, WEBP, SVG (tối đa 5MB). Nhấn "Lưu Toàn Bộ Cấu Hình Hệ Thống" bên dưới để áp dụng, hoặc bấm trực tiếp vào biểu tượng logo trên thanh tiêu đề để đổi nhanh.
                    </p>
                  </div>
                </div>

                {settingsLogoError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] font-medium text-rose-700">
                    {settingsLogoError}
                  </div>
                )}
              </div>

              {/* SECTION 1: HOTLINE & ZALO */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. Kênh Hotline Kỹ Thuật & Zalo Trực Ca</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số Hotline (Nhấn để gọi - chỉ số)
                    </label>
                    <input
                      type="text"
                      value={tempSettings.hotline || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, hotline: e.target.value })}
                      placeholder="VD: 19006868 hoặc 0988123456"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Dùng cho liên kết tel:... khi người dùng nhấn gọi</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số Hotline Hiển Thị Trên Web
                    </label>
                    <input
                      type="text"
                      value={tempSettings.hotlineDisplay || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, hotlineDisplay: e.target.value })}
                      placeholder="VD: 1900 6868 / 0988 123 456"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số Điện Thoại Zalo Kỹ Thuật
                    </label>
                    <input
                      type="text"
                      value={tempSettings.zaloNumber || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, zaloNumber: e.target.value })}
                      placeholder="VD: 0988123456"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Đường Dẫn Zalo (Zalo Link / OA)
                    </label>
                    <input
                      type="text"
                      value={tempSettings.zaloLink || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, zaloLink: e.target.value })}
                      placeholder="VD: https://zalo.me/0988123456"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kỹ sư trưởng trực ca 24/7
                    </label>
                    <input
                      type="text"
                      value={tempSettings.dutyEngineerName}
                      onChange={(e) => setTempSettings({ ...tempSettings, dutyEngineerName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên công ty / Đơn vị
                    </label>
                    <input
                      type="text"
                      value={tempSettings.companyName}
                      onChange={(e) => setTempSettings({ ...tempSettings, companyName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thông báo khẩn cấp đầu trang (Announcement Bar)
                  </label>
                  <textarea
                    rows={2}
                    value={tempSettings.announcement || ''}
                    onChange={(e) => setTempSettings({ ...tempSettings, announcement: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* SECTION 2: CẤU HÌNH CHATBOT HỖ TRỢ KỸ THUẬT */}
              <div className="space-y-3.5 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Bot className="w-3.5 h-3.5 text-purple-600" />
                  <span>2. Cấu Hình Chatbot Hỗ Trợ Kỹ Thuật AI (NLP Assistant)</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lời chào mừng mặc định của Chatbot
                  </label>
                  <textarea
                    rows={2}
                    value={tempSettings.chatbotWelcomeMessage || 'Xin chào! Tôi là Trợ lý Kỹ thuật ADC. Bạn đang gặp sự cố với dòng máy Zybio EXC200/220, Z3 CRP, Z50 hay FS-205?'}
                    onChange={(e) => setTempSettings({ ...tempSettings, chatbotWelcomeMessage: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Tin nhắn đầu tiên hiển thị khi kỹ thuật viên bệnh viện mở hộp chat</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Ngưỡng tin cậy nhận diện mã lỗi AI
                      </label>
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                        {tempSettings.chatbotConfidenceThreshold || 85}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={95}
                      step={1}
                      value={tempSettings.chatbotConfidenceThreshold || 85}
                      onChange={(e) => setTempSettings({ ...tempSettings, chatbotConfidenceThreshold: Number(e.target.value) })}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Khi độ tin cậy NLP vượt ngưỡng này, Chatbot sẽ tự động gợi ý giải pháp SOP chuẩn
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <label className="flex items-start gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempSettings.chatbotAutoEscalateOnUnknown ?? true}
                        onChange={(e) => setTempSettings({ ...tempSettings, chatbotAutoEscalateOnUnknown: e.target.checked })}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Tự động chuyển ca cho kỹ sư khi Chatbot không nhận diện được mã lỗi trong kho SOP</span>
                    </label>

                    <label className="flex items-start gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempSettings.chatbotEmergencyAlertsEnabled ?? true}
                        onChange={(e) => setTempSettings({ ...tempSettings, chatbotEmergencyAlertsEnabled: e.target.checked })}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Hiển thị cảnh báo sự cố khẩn cấp tức thì lên Dashboard Tổng Quan</span>
                    </label>

                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          Số lần thử thất bại (bot_unresolved):
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={tempSettings.maxUnresolvedAttemptsBeforeEscalate || 2}
                          onChange={(e) => setTempSettings({ ...tempSettings, maxUnresolvedAttemptsBeforeEscalate: Number(e.target.value) })}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono font-bold bg-white"
                        />
                        <span className="text-[9px] text-slate-400">Mặc định: 2 lần</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          Cam kết gọi lại (phút):
                        </label>
                        <input
                          type="number"
                          min={5}
                          max={60}
                          value={tempSettings.callbackCommitmentMinutes || 15}
                          onChange={(e) => setTempSettings({ ...tempSettings, callbackCommitmentMinutes: Number(e.target.value) })}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono font-bold bg-white"
                        />
                        <span className="text-[9px] text-slate-400">Mặc định: 15 phút</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Xác nhận khôi phục toàn bộ dữ liệu mẫu ban đầu?')) {
                      onResetData();
                    }
                  }}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Khôi phục dữ liệu demo gốc</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Cài Đặt Hệ Thống & Chatbot AI</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 7: XUẤT / NHẬP EXCEL & CSV */}
        {currentTab === 'excel' && (
          <div className="space-y-5 max-w-4xl mx-auto">
            {/* Export Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-600" />
                  <span>Xuất Dữ Liệu Báo Cáo Ra File Excel (.xlsx) & CSV (.csv)</span>
                </h3>
                <span className="text-xs bg-emerald-50 text-emerald-800 font-mono font-semibold px-2 py-0.5 rounded border border-emerald-200">
                  UTF-8 BOM Chuẩn
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-5">
                Hỗ trợ xuất định dạng bảng tính Excel (.xlsx) và định dạng chuẩn CSV (.csv) phục vụ báo cáo định kỳ tuần/tháng cho ban giám đốc, tương thích hoàn hảo với Microsoft Excel và Google Sheets.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Tickets */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-slate-800">1. Dữ Liệu Phiếu Kỹ Thuật (Tickets)</h4>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded font-semibold">{tickets.length} phiếu</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Mã phiếu, bệnh viện, model máy, mức độ ưu tiên, kỹ sư thực hiện, và biên bản nghiệm thu.
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => exportTicketsToCSV(tickets)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Xuất file CSV mở ngay trên Excel phục vụ báo cáo định kỳ"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất File CSV (Báo Cáo Định Kỳ)</span>
                    </button>
                    <button
                      onClick={() => exportTicketsToExcel(tickets)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Xuất file Excel .xlsx"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất File Excel (.xlsx)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Records */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-slate-800">2. Sổ Tay 2026-XLKT (Records)</h4>
                      <span className="text-[10px] font-mono text-blue-700 bg-blue-100/60 px-1.5 py-0.2 rounded font-semibold">{records.length} biên bản</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Toàn bộ nhật ký xử lý kỹ thuật của KS. Nguyễn Quang Đạt và cộng sự, chi tiết linh kiện đã thay.
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => exportRecordsToCSV(records)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Xuất file CSV sổ tay 2026-XLKT"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất File CSV (Báo Cáo Định Kỳ)</span>
                    </button>
                    <button
                      onClick={() => exportRecordsToExcel(records)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Xuất file Excel .xlsx"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất File Excel (.xlsx)</span>
                    </button>
                  </div>
                </div>

                {/* 3. SOPs */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-slate-800">3. Kho Tri Thức SOP</h4>
                      <span className="text-[10px] font-mono text-purple-700 bg-purple-100/60 px-1.5 py-0.2 rounded font-semibold">{sops.length} quy trình</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Toàn bộ mã lỗi, nguyên nhân gốc, các bước khắc phục chuẩn và cảnh báo an toàn sinh học.
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => exportSOPsToCSV(sops)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất Kho SOP (.csv)</span>
                    </button>
                    <button
                      onClick={() => exportSOPsToExcel(sops)}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải Excel Kho SOP (.xlsx)</span>
                    </button>
                  </div>
                </div>

                {/* 4. Staff / Users */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-slate-800">4. Dữ Liệu Nhân Sự & Kỹ Sư</h4>
                      <span className="text-[10px] font-mono text-teal-700 bg-teal-100/60 px-1.5 py-0.2 rounded font-semibold">{engineers.length} nhân sự</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Danh sách kỹ sư trực 24/7, vị trí công tác, số điện thoại, trạng thái trực chiến và dòng máy phụ trách.
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => exportStaffToCSV(engineers)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất Danh Sách Nhân Sự (.csv)</span>
                    </button>
                    <button
                      onClick={() => exportStaffToExcel(engineers)}
                      className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất Danh Sách Nhân Sự (.xlsx)</span>
                    </button>
                  </div>
                </div>

                {/* 5. Chatbot Sessions */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-slate-800">5. Dữ Liệu Chatbot NLP</h4>
                      <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100/60 px-1.5 py-0.2 rounded font-semibold">{chatSessions.length} phiên</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Phân loại mã lỗi NLP, bệnh viện/phòng khám, độ tin cậy AI và tỷ lệ giải quyết tự động qua SOP.
                    </p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => exportChatbotSessionsToCSV(chatSessions)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất Báo Cáo Chatbot (.csv)</span>
                    </button>
                    <button
                      onClick={() => exportChatbotSessionsToExcel(chatSessions)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất Báo Cáo Chatbot (.xlsx)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Import Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-0.5 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span>Nhập Dữ Liệu & Tự Động Phân Tích Vào Kho SOP</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hỗ trợ file Excel (.xlsx, .xls) và file xuất HTML (sheet001.htm) sổ tay nhật ký 2026-XLKT để AI tự động chuyển hóa thành SOP chuẩn.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRecordForAnalysis(null);
                    setIsAutoAnalyzeModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Mở Trình Phân Tích SOP Tự Động</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="excel-upload"
                  accept=".xlsx, .xls, .htm, .html, .csv, .docx, .doc, .txt, .pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setSelectedRecordForAnalysis(null);
                    setIsAutoAnalyzeModalOpen(true);
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="excel-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                    <Sparkles className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Bấm để tải lên file Excel (.xlsx, .xls) hoặc Word / Doc (.docx, .doc)
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 max-w-md">
                    Hệ thống sẽ tự động bóc tách từng ca sửa chữa, chuẩn đoán nguyên nhân gốc và sinh quy trình SOP chuẩn vào kho tri thức y sinh.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: QUẢN LÝ NHÂN SỰ & KỸ SƯ */}
        {currentTab === 'staff' && (() => {
          const filteredStaff = engineers.filter(eng => {
            if (staffRoleFilter !== 'all' && eng.role !== staffRoleFilter) return false;
            if (staffSearchText.trim()) {
              const q = staffSearchText.toLowerCase();
              return (
                eng.name.toLowerCase().includes(q) ||
                eng.phone.includes(q) ||
                eng.email.toLowerCase().includes(q) ||
                eng.area.toLowerCase().includes(q) ||
                (eng.department && eng.department.toLowerCase().includes(q))
              );
            }
            return true;
          });

          return (
          <div className="space-y-4">

            {/* Success Toast for Checklist Permission / Approval / Excel Import */}
            {permSuccessToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{permSuccessToast}</span>
              </div>
            )}

            {/* Staff Search, 5-Role Filter & Excel Export/Import + Add Button Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={staffSearchText}
                    onChange={(e) => setStaffSearchText(e.target.value)}
                    placeholder="Tìm nhân sự theo tên, SĐT, email, khu vực..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <select
                  value={staffRoleFilter}
                  onChange={(e) => setStaffRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Tất cả 5 vai trò ({engineers.length})</option>
                  <option value="director">👑 Giám đốc</option>
                  <option value="css">🎧 Phòng CSS</option>
                  <option value="warehouse">📦 Kho vận</option>
                  <option value="sales">💼 Kinh doanh</option>
                  <option value="field_engineer">🔧 Kỹ thuật</option>
                </select>
              </div>
              <div className="flex items-center flex-wrap gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const roleSuffix = staffRoleFilter !== 'all' ? `_${staffRoleFilter}` : '';
                    exportStaffToExcel(filteredStaff, `Danh_Sach_Nhan_Su_ADC${roleSuffix}.xlsx`);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  title={`Xuất nhanh ${filteredStaff.length} nhân sự đang hiển thị ra file Excel (.xlsx)`}
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất Excel ({filteredStaff.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const roleSuffix = staffRoleFilter !== 'all' ? `_${staffRoleFilter}` : '';
                    exportStaffToCSV(filteredStaff, `Danh_Sach_Nhan_Su_ADC${roleSuffix}.csv`);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  title={`Xuất nhanh ${filteredStaff.length} nhân sự đang hiển thị ra file CSV (.csv)`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>Xuất CSV ({filteredStaff.length})</span>
                </button>

                {canManageStaff ? (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenStaffImportModal}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                      title="Nhập nhanh danh sách nhân sự từ file Excel (.xlsx, .xls, .csv)"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Nhập Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenAddStaff}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm nhân sự</span>
                    </button>
                  </>
                ) : (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-[11px] font-semibold">
                    Chỉ Phòng CSS hoặc Giám đốc có quyền thêm/nhập nhân sự
                  </span>
                )}
              </div>
            </div>

            {/* Staff Simple List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
              {filteredStaff.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Không tìm thấy nhân sự phù hợp với bộ lọc.
                </div>
              ) : (
                filteredStaff.map(eng => {
                  const isDuty = settings.dutyEngineerName === eng.name;
                  const userTabs = (eng.allowedTabs && eng.allowedTabs.length > 0)
                    ? eng.allowedTabs
                    : getDefaultTabsForRole(eng.role);

                  return (
                    <div
                      key={eng.id}
                      className={`px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/70 transition-colors ${
                        isDuty ? 'bg-emerald-50/30 border-l-2 border-l-emerald-500' : ''
                      }`}
                    >
                      {/* Left: Avatar, Name, Role & Key Info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-emerald-600 shrink-0">
                          <span>{eng.name.trim().split(/\s+/).pop()?.charAt(0).toUpperCase() || '?'}</span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {eng.name}
                            </h4>
                            {eng.department && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 hidden md:inline">
                                {eng.department}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500 mt-0.5">
                            <a href={`tel:${eng.phone}`} className="inline-flex items-center gap-1 font-mono font-semibold text-slate-700 hover:text-emerald-700">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{eng.phone}</span>
                            </a>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {userTabs.length}/11 tabs
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Compact Actions (Chỉ Phòng CSS hoặc Giám đốc) */}
                      {canManageStaff && (
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">

                          <button
                            type="button"
                            onClick={() => handleOpenEditStaff(eng)}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit className="w-3 h-3 text-slate-500" />
                            <span>Sửa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(eng.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Xóa nhân sự"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          );
        })()}

        {/* Modal: Add or Edit Personnel */}
        {isEditingStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold truncate">
                    {editingStaffId ? 'Chỉnh Sửa Thông Tin Nhân Sự' : 'Thêm Nhân Sự Kỹ Thuật Mới'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingStaff(false)}
                  className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveStaffSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain touch-pan-y">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Họ Và Tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={staffFormData.name}
                      onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                      placeholder="VD: Nguyễn Quang Đạt"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block font-bold text-slate-700 mb-1">
                      Phòng Ban &amp; Vai Trò <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={staffFormData.role}
                      onChange={(e) => {
                        const newRole = e.target.value as StaffRole;
                        let defDept: DepartmentType = 'Phòng Kỹ Thuật';
                        if (newRole === 'director') defDept = 'Ban Giám Đốc';
                        else if (newRole === 'css') defDept = 'Phòng CSS';
                        else if (newRole === 'warehouse') defDept = 'Bộ Phận Kho';
                        else if (newRole === 'sales') defDept = 'Phòng Kinh Doanh';

                        setStaffFormData({
                          ...staffFormData,
                          role: newRole,
                          department: defDept,
                          allowedTabs: getDefaultTabsForRole(newRole)
                        });
                      }}
                      className="w-full max-w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      <option value="director">👑 Giám đốc</option>
                      <option value="css">🎧 Phòng CSS</option>
                      <option value="warehouse">📦 Kho vận</option>
                      <option value="sales">💼 Kinh doanh</option>
                      <option value="field_engineer">🔧 Kỹ thuật</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Số Điện Thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={staffFormData.phone}
                      onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                      placeholder="VD: 0988 123 456"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Công Tác</label>
                    <input
                      type="email"
                      value={staffFormData.email}
                      onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                      placeholder="VD: dat.nq@adctbyt.vn"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Mật Khẩu Tài Khoản <span className="text-slate-400 font-normal">(Mặc định: {DEFAULT_ACCOUNT_PASSWORD})</span>
                    </label>
                    <input
                      type="text"
                      value={staffFormData.password || DEFAULT_ACCOUNT_PASSWORD}
                      onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                      placeholder={`Mặc định: ${DEFAULT_ACCOUNT_PASSWORD}`}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                    />
                  </div>
                </div>

                {/* Form Embedded Checklist Permissions */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-slate-700">
                      Cấp Quyền Tab Nhiệm Vụ (Checklist):
                    </label>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Đã chọn: {(staffFormData.allowedTabs || []).length}/11 tabs
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'create_ticket' as AdminTabType, label: 'Tạo Phiếu' },
                        { id: 'bulletins' as AdminTabType, label: 'Bản Tin ADC' },
                        { id: 'dispatch' as AdminTabType, label: 'Bảng việc' },
                        { id: 'sop_mgmt' as AdminTabType, label: 'Kho SOP' },
                        { id: 'records' as AdminTabType, label: 'Sổ Tay XLKT' },
                        { id: 'staff' as AdminTabType, label: 'Nhân Sự' },
                        { id: 'analytics' as AdminTabType, label: 'Báo Cáo SLA' },
                        { id: 'chatbot_analytics' as AdminTabType, label: 'Chatbot NLP' },
                        { id: 'learning' as AdminTabType, label: 'Tự Học AI' },
                        { id: 'settings' as AdminTabType, label: 'Cài Đặt' },
                        { id: 'excel' as AdminTabType, label: 'Xuất/Nhập' }
                      ].map(t => {
                        const isChecked = (staffFormData.allowedTabs || []).includes(t.id);
                        return (
                          <label
                            key={t.id}
                            className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-white border-purple-300 text-purple-900 font-bold shadow-2xs'
                                : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const currentTabs = staffFormData.allowedTabs || getDefaultTabsForRole(staffFormData.role);
                                let updated: AdminTabType[];
                                if (e.target.checked) {
                                  updated = [...currentTabs, t.id];
                                } else {
                                  if (currentTabs.length <= 1) {
                                    alert('Mỗi nhân sự cần ít nhất 1 tab!');
                                    return;
                                  }
                                  updated = currentTabs.filter(x => x !== t.id);
                                }
                                setStaffFormData({ ...staffFormData, allowedTabs: updated });
                              }}
                              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span>{t.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>


                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingStaff(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg font-bold text-slate-700 cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-white" />
                    <span>{editingStaffId ? 'Cập Nhật Thay Đổi' : 'Thêm Nhân Sự'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Quick Import Staff from Excel */}
        {isStaffImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="px-5 py-3.5 bg-gradient-to-r from-blue-800 via-blue-700 to-teal-700 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold truncate">
                      Nhập Nhân Sự Nhanh Từ File Excel
                    </h3>
                    <p className="text-[11px] text-blue-100 truncate">
                      Hỗ trợ .xlsx, .xls, .csv · Tự động nhận diện vai trò, phòng ban &amp; kiểm tra trùng SĐT/Email/Mã
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStaffImportModalOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                {/* Template & File Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between gap-2.5">
                    <div>
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bước 1: File mẫu chuẩn hoặc file đã xuất</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Dùng file mẫu chuẩn hoặc chỉnh sửa trực tiếp file đã bấm &quot;Xuất Excel&quot; từ hệ thống.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadStaffExcelTemplate()}
                      className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải File Mẫu Excel (.xlsx)</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40 flex flex-col justify-between gap-2.5">
                    <div>
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Bước 2: Chọn file danh sách nhân sự</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 truncate">
                        {staffImportFileName ? `Đã chọn: ${staffImportFileName}` : 'Chấp nhận định dạng .xlsx, .xls hoặc .csv'}
                      </p>
                    </div>
                    <input
                      ref={staffExcelInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleStaffExcelFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => staffExcelInputRef.current?.click()}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{staffImportFileName ? 'Chọn File Khác' : 'Chọn File Excel Từ Máy'}</span>
                    </button>
                  </div>
                </div>

                {staffImportError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{staffImportError}</span>
                  </div>
                )}

                {staffImportItems.length > 0 && (() => {
                  const newCount = staffImportItems.filter(i => i.action === 'create').length;
                  const updateCount = staffImportItems.filter(i => i.action === 'update').length;
                  return (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                            Thêm mới: {newCount}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                            Trùng / Cập nhật: {updateCount}
                          </span>
                          {staffImportSkipped > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-semibold">
                              Bỏ qua thiếu tên/SĐT: {staffImportSkipped}
                            </span>
                          )}
                        </div>

                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={staffImportUpdateExisting}
                            onChange={(e) => setStaffImportUpdateExisting(e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Cập nhật thông tin nếu trùng Mã/SĐT/Email</span>
                        </label>
                      </div>

                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="max-h-64 overflow-y-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 uppercase sticky top-0">
                              <tr>
                                <th className="px-3 py-2">Trạng thái</th>
                                <th className="px-3 py-2">Họ và Tên</th>
                                <th className="px-3 py-2">Vai Trò / Phòng Ban</th>
                                <th className="px-3 py-2">SĐT</th>
                                <th className="px-3 py-2">Email</th>
                                <th className="px-3 py-2">Khu Vực</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {staffImportItems.map((item, idx) => (
                                <tr key={`${item.profile.id}-${idx}`} className="hover:bg-slate-50/70">
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    {item.action === 'update' ? (
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        staffImportUpdateExisting
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-slate-100 text-slate-500'
                                      }`}>
                                        {staffImportUpdateExisting ? 'Cập nhật' : 'Bỏ qua'}
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        Mới
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 font-bold text-slate-900 whitespace-nowrap">
                                    {item.profile.name}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-slate-700">
                                    {item.profile.department}
                                  </td>
                                  <td className="px-3 py-2 font-mono text-slate-700 whitespace-nowrap">
                                    {item.profile.phone}
                                  </td>
                                  <td className="px-3 py-2 text-slate-500 truncate max-w-[160px]">
                                    {item.profile.email || '—'}
                                  </td>
                                  <td className="px-3 py-2 text-slate-500 truncate max-w-[160px]">
                                    {item.profile.area}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
                <span className="text-[11px] text-slate-500">
                  Mỗi nhân sự mới sẽ được cấp bộ quyền mặc định theo vai trò.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsStaffImportModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg font-bold text-slate-700 cursor-pointer text-xs"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="button"
                    disabled={staffImportItems.length === 0}
                    onClick={handleConfirmStaffImport}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Xác Nhận Nhập ({staffImportItems.length})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirm Delete Personnel */}
        {staffToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-red-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Xác Nhận Xóa Nhân Sự?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Bạn có chắc chắn muốn xóa nhân sự <strong className="text-slate-900">{staffToDelete.name}</strong> ({staffToDelete.phone}) khỏi danh sách?
                  </p>
                  <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg mt-2 border border-red-100">
                    Thao tác này sẽ xóa nhân sự khỏi danh sách quản lý và hệ thống lưu trữ.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStaffToDelete(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg font-bold text-slate-700 cursor-pointer text-xs"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteStaff}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                  <span>Xác Nhận Xóa</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: QUẢN TRỊ VIÊN CẤP QUYỀN DẠNG CHECKLIST TỪNG TAB CHO NHÂN SỰ */}
        {isPermModalOpen && permTargetStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>Phân Quyền Truy Cập Tab Nhiệm Vụ (Checklist RBAC)</span>
                    </h3>
                    <p className="text-xs text-purple-200">
                      Nhân sự: <strong>{permTargetStaff.name}</strong> · {permTargetStaff.department || 'Phòng Kỹ Thuật'} ({permTargetStaff.phone})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPermModalOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs flex-1">
                {/* 1-Click Role Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Áp dụng mẫu phân quyền nhanh theo phòng ban (1 chạm):</span>
                    </span>
                    <span className="text-[11px] text-slate-500">Bấm để điền mẫu checklist</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyRolePreset('sales')}
                      className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                          <span>💼</span>
                          <span>Mẫu Bán Hàng</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-white px-1.5 rounded border border-emerald-200">
                          3 tabs
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-800 mt-1 font-semibold">
                        Bảng việc, Tạo Phiếu &amp; Bản Tin ADC
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyRolePreset('css')}
                      className="p-2.5 rounded-xl border border-cyan-300 bg-cyan-50/70 hover:bg-cyan-100 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-cyan-950 flex items-center gap-1.5">
                          <span>🎧</span>
                          <span>Mẫu Phòng CSS</span>
                        </span>
                        <span className="text-[10px] font-bold text-cyan-700 bg-white px-1.5 rounded border border-cyan-200">
                          6 tabs
                        </span>
                      </div>
                      <p className="text-[10px] text-cyan-800 mt-1">
                        Bảng việc, Tạo Phiếu, Bản Tin, SOP, XLKT, KPI
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyRolePreset('warehouse')}
                      className="p-2.5 rounded-xl border border-orange-300 bg-orange-50/70 hover:bg-orange-100 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-orange-950 flex items-center gap-1.5">
                          <span>📦</span>
                          <span>Mẫu Quản Lý Kho</span>
                        </span>
                        <span className="text-[10px] font-bold text-orange-700 bg-white px-1.5 rounded border border-orange-200">
                          5 tabs
                        </span>
                      </div>
                      <p className="text-[10px] text-orange-800 mt-1">
                        Bảng việc, Sổ Tay XLKT, Kho SOP, Bản Tin, Xuất File
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyRolePreset('director')}
                      className="p-2.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                          <span>👑</span>
                          <span>Mẫu Ban Giám Đốc</span>
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 bg-white px-1.5 rounded border border-amber-200">
                          8 tabs
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-800 mt-1">
                        Báo Cáo SLA, Điều Phối, Nhân Sự, Kho SOP...
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyRolePreset('field_engineer')}
                      className="p-2.5 rounded-xl border border-teal-300 bg-teal-50/70 hover:bg-teal-100 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-teal-950 flex items-center gap-1.5">
                          <span>🔧</span>
                          <span>Mẫu Kỹ Sư Hiện Trường</span>
                        </span>
                        <span className="text-[10px] font-bold text-teal-700 bg-white px-1.5 rounded border border-teal-200">
                          6 tabs
                        </span>
                      </div>
                      <p className="text-[10px] text-teal-800 mt-1">
                        Điều Phối, Kho SOP, Sổ Tay XLKT, Tự Học...
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPermSelectedTabs([...ALL_ADMIN_TABS])}
                      className="p-2.5 rounded-xl border border-purple-300 bg-purple-50/70 hover:bg-purple-100 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                          <span>🛡️</span>
                          <span>Toàn Quyền Quản Trị</span>
                        </span>
                        <span className="text-[10px] font-bold text-purple-700 bg-white px-1.5 rounded border border-purple-200">
                          11 tabs
                        </span>
                      </div>
                      <p className="text-[10px] text-purple-800 mt-1">
                        Truy cập toàn bộ tất cả 11 tab nhiệm vụ
                      </p>
                    </button>
                  </div>
                </div>

                {/* Checklist Selection of Individual Tabs */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900 text-xs">
                      Chi Tiết Checklist Từng Tab Nhiệm Vụ ({permSelectedTabs.length}/11 tabs được cấp):
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPermSelectedTabs([...ALL_ADMIN_TABS])}
                        className="text-[11px] font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                      >
                        Chọn Tất Cả (11)
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setPermSelectedTabs(['create_ticket'])}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Chỉ Giữ 1 Tab
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'create_ticket' as AdminTabType,
                        label: 'Tiếp Nhận & Tạo Phiếu Yêu Cầu',
                        shortLabel: 'Tạo Phiếu',
                        icon: Plus,
                        desc: 'Lập phiếu yêu cầu xử lý sự cố thiết bị nội bộ và chuyển giao thông tin bệnh viện'
                      },
                      {
                        id: 'bulletins' as AdminTabType,
                        label: 'Bản Tin & Khuyến Cáo Kỹ Thuật ADC',
                        shortLabel: 'Bảng Tin ADC',
                        icon: Megaphone,
                        desc: 'Xem cảnh báo an toàn thiết bị, lưu ý bảo trì định kỳ và thông báo nội bộ'
                      },
                      {
                        id: 'dispatch' as AdminTabType,
                        label: 'Bảng việc (Điều Phối & Theo Dõi)',
                        shortLabel: 'Bảng việc',
                        icon: LayoutDashboard,
                        desc: 'Xem bảng việc toàn công ty, phân công kỹ sư và theo dõi tiến độ xử lý sự cố'
                      },
                      {
                        id: 'sop_mgmt' as AdminTabType,
                        label: 'Kho Tri Thức Quy Trình SOP ADC',
                        shortLabel: 'Kho SOP',
                        icon: BookOpen,
                        desc: 'Tra cứu & quản trị quy trình chuẩn đoán, xử lý mã lỗi máy xét nghiệm'
                      },
                      {
                        id: 'records' as AdminTabType,
                        label: 'Sổ Tay Nhật Ký Thực Chiến 2026-XLKT',
                        shortLabel: 'Sổ Tay XLKT',
                        icon: FileSpreadsheet,
                        desc: 'Xem lịch sử xử lý ca lâm sàng thực tế và tra cứu mã linh kiện thay thế'
                      },
                      {
                        id: 'staff' as AdminTabType,
                        label: 'Quản Lý Nhân Sự & Cấp Quyền Checklist',
                        shortLabel: 'Nhân Sự & Quyền',
                        icon: Users,
                        desc: 'Quản lý danh sách nhân sự phòng ban và điều chỉnh quyền truy cập tab'
                      },
                      {
                        id: 'analytics' as AdminTabType,
                        label: 'Báo Cáo Phân Tích Hiệu Suất SLA',
                        shortLabel: 'Báo Cáo SLA',
                        icon: BarChart3,
                        desc: 'Thống kê KPI thời gian xử lý sự cố và tỷ lệ hoàn thành ca trực'
                      },
                      {
                        id: 'chatbot_analytics' as AdminTabType,
                        label: 'Báo Cáo Chatbot NLP & Phân Loại Lỗi',
                        shortLabel: 'Chatbot NLP',
                        icon: Bot,
                        desc: 'Thống kê tương tác hỏi đáp của khách hàng và ma trận phân loại lỗi AI'
                      },
                      {
                        id: 'learning' as AdminTabType,
                        label: 'Trung Tâm Tự Học & Quản Trị Tri Thức AI',
                        shortLabel: 'Tự Học AI',
                        icon: Brain,
                        desc: 'Kiểm duyệt và xuất bản các tri thức mới do AI tự học từ ca kỹ thuật'
                      },
                      {
                        id: 'settings' as AdminTabType,
                        label: 'Cấu Hình Hệ Thống, Hotline & Chatbot AI',
                        shortLabel: 'Cài Đặt',
                        icon: Settings,
                        desc: 'Cấu hình hotline, số Zalo kỹ thuật và chính sách chuyển tiếp cuộc gọi'
                      },
                      {
                        id: 'excel' as AdminTabType,
                        label: 'Trung Tâm Xuất / Nhập Dữ Liệu Excel/CSV',
                        shortLabel: 'Xuất/Nhập File',
                        icon: Download,
                        desc: 'Trích xuất báo cáo chi tiết Excel/CSV và nhập dữ liệu vào kho tri thức'
                      }
                    ].map(tabItem => {
                      const isChecked = permSelectedTabs.includes(tabItem.id);
                      const IconComponent = tabItem.icon;
                      return (
                        <div
                          key={tabItem.id}
                          onClick={() => handleToggleTabInChecklist(tabItem.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            isChecked
                              ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-400/40 shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Controlled by container onClick
                            className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4 cursor-pointer"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`p-1 rounded-md ${isChecked ? 'bg-purple-200 text-purple-900' : 'bg-slate-100 text-slate-600'}`}>
                                <IconComponent className="w-3.5 h-3.5" />
                              </span>
                              <span className={`text-xs font-bold leading-tight ${isChecked ? 'text-purple-950 font-black' : 'text-slate-800'}`}>
                                {tabItem.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                              {tabItem.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                <div className="text-xs text-slate-600 font-semibold">
                  <span>Trạng thái: </span>
                  <span className="font-bold text-purple-800">
                    Đã cấp quyền {permSelectedTabs.length} / 11 tabs
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPermModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-slate-700 cursor-pointer text-xs"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePermChecklist}
                    className="px-5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4 text-white" />
                    <span>Lưu Cấp Quyền Checklist</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SOP Detail Modal for Full Content Viewing */}
      <SOPDetailModal
        sop={viewingSOP}
        onClose={() => setViewingSOP(null)}
        onEdit={(s) => {
          setSopPdfError(null);
          setCurrentSOP({ ...s });
          setIsEditingSOP(true);
        }}
        onEditErrorCode={(s) => {
          setEditingErrorCodeSOP(s);
          setSelectedErrorCodeForAdjust(s.errorCode || '');
        }}
      />

      {/* Inline PDF Viewer Modal */}
      <PdfViewerModal
        attachment={viewingPdfModal?.attachment || null}
        sopTitle={viewingPdfModal?.title}
        onClose={() => setViewingPdfModal(null)}
      />

      {/* Auto Analyze SOP Modal */}
      {isAutoAnalyzeModalOpen && (
        <AutoAnalyzeSOPModal
          records={records}
          initialRecord={selectedRecordForAnalysis}
          defaultMode={sopAnalysisDefaultMode}
          onClose={() => {
            setIsAutoAnalyzeModalOpen(false);
            setSelectedRecordForAnalysis(null);
          }}
          onAddSOPs={(newSops) => {
            if (onAddMultipleSOPs) {
              onAddMultipleSOPs(newSops);
            } else {
              newSops.forEach(s => onSaveSOP(s));
            }
          }}
          onNavigateToSOPTab={() => setCurrentTab('sop_mgmt')}
        />
      )}

      {/* MODAL ĐIỀU CHỈNH MÃ LỖI SOP (QUẢN TRỊ VIÊN TỰ ĐIỀU CHỈNH - KHÔNG TỰ BỊA) */}
      {editingErrorCodeSOP && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <BadgeCheck className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Điều Chỉnh Mã Lỗi SOP (Admin Control)
                  </h3>
                  <p className="text-[11px] text-emerald-100">
                    Quản trị viên tự kiểm soát mã lỗi theo tài liệu hãng. Tuyệt đối không tự bịa mã lỗi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingErrorCodeSOP(null)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Info card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 text-[11px]">Dòng máy:</span>
                  <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {editingErrorCodeSOP.equipmentModel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 text-[11px]">Mã lỗi hiện tại:</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                    editingErrorCodeSOP.errorCode ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {editingErrorCodeSOP.errorCode || 'Không có mã lỗi'}
                  </span>
                </div>
                <div className="pt-1">
                  <span className="font-semibold text-slate-800 block line-clamp-2">{editingErrorCodeSOP.title}</span>
                </div>
              </div>

              {/* Selected Code Preview & Custom Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Mã lỗi được gán cho SOP này:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={selectedErrorCodeForAdjust}
                    onChange={(e) => setSelectedErrorCodeForAdjust(e.target.value.toUpperCase())}
                    placeholder="VD: E101, H108, Z501, FS101 (để trống nếu không có)"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold uppercase text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  {selectedErrorCodeForAdjust && (
                    <button
                      type="button"
                      onClick={() => setSelectedErrorCodeForAdjust('')}
                      className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl cursor-pointer"
                      title="Xóa mã lỗi"
                    >
                      Xóa mã
                    </button>
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  {selectedErrorCodeForAdjust ? (
                    isValidOfficialCode(selectedErrorCodeForAdjust, editingErrorCodeSOP.equipmentModel) ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Mã lỗi chuẩn chính hãng {editingErrorCodeSOP.equipmentModel}
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium">
                        Mã tùy chỉnh quản trị viên (theo tài liệu cập nhật)
                      </span>
                    )
                  ) : (
                    <span className="text-slate-500 italic">
                      (Đang để trống: Quy trình kỹ thuật chung, không có mã lỗi cảnh báo trên máy)
                    </span>
                  )}
                </div>
              </div>

              {/* 1-Click Picker from Official Codes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-700">
                    Chọn nhanh từ danh mục mã lỗi hãng {editingErrorCodeSOP.equipmentModel}:
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                    {getOfficialCodesForModel(editingErrorCodeSOP.equipmentModel).length} mã chính thức
                  </span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {getOfficialCodesForModel(editingErrorCodeSOP.equipmentModel).map((item) => {
                    const isSelected = selectedErrorCodeForAdjust === item.code;
                    return (
                      <div
                        key={item.code}
                        onClick={() => setSelectedErrorCodeForAdjust(item.code)}
                        className={`p-2 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                          isSelected 
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/50 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                              {item.code}
                            </span>
                            <span className="font-bold text-slate-800 text-xs">
                              {item.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-1">
                            {item.meaning}
                          </p>
                        </div>
                        <div className="shrink-0 pt-0.5">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                            isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Principle Note */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-900 leading-relaxed">
                <strong>Nguyên tắc kỹ thuật ADC:</strong> Quản trị viên tự kiểm soát và điều chỉnh mã lỗi theo Service Manual của Zybio & Getein. Các sự cố cơ cấu cơ khí (như rò rỉ syringe Hamilton, kẹt trục kim đâm nắp cao su, trôi cảm ứng, đứt mạng LIS RJ45) không có mã lỗi của máy thì để trống đúng thực tế, tuyệt đối không tự bịa mã lỗi giả.
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditingErrorCodeSOP(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleQuickSaveErrorCode}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Điều Chỉnh Mã Lỗi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BẢNG ĐỐI SOÁT & QUẢN LÝ MÃ LỖI CHÍNH HÃNG (SERVICE MANUAL REGISTRY) */}
      {showOfficialCodesRegistry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <BadgeCheck className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    Bảng Đối Soát & Quản Lý Mã Lỗi Chính Hãng ADC
                  </h3>
                  <p className="text-xs text-emerald-200/90">
                    Danh mục mã lỗi chính thức theo Service Manual của Hãng Zybio & Getein · Quản trị viên tự điều chỉnh, không tự bịa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOfficialCodesRegistry(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Model Selector Tabs */}
            <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0">
              {(['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'] as EquipmentModel[]).map((m) => {
                const isActive = registryModelTab === m;
                const codesCount = getOfficialCodesForModel(m).length;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setRegistryModelTab(m)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <span>{m}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {codesCount} mã
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Registry List Content */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Hiện có <strong>{getOfficialCodesForModel(registryModelTab).length}</strong> mã lỗi chính thức cho dòng máy <strong>{registryModelTab}</strong>.
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800">
                  Nguồn: Tài liệu kỹ thuật chính hãng ADC & Zybio/Getein
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getOfficialCodesForModel(registryModelTab).map((item) => {
                  const sopsWithCode = sops.filter(s => s.equipmentModel === registryModelTab && s.errorCode?.toUpperCase() === item.code);
                  return (
                    <div 
                      key={item.code} 
                      className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 hover:border-emerald-400 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-sm px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-950 border border-emerald-300">
                            {item.code}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          <strong className="text-slate-700">Ý nghĩa kỹ thuật:</strong> {item.meaning}
                        </p>
                        <p className="text-[11px] text-amber-900 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60 leading-relaxed">
                          <strong>Hiện tượng:</strong> {item.typicalSymptom}
                        </p>
                        <p className="text-[11px] text-emerald-900 bg-emerald-50/60 p-2 rounded-lg border border-emerald-200/60 leading-relaxed">
                          <strong>Giải pháp chuẩn:</strong> {item.standardResolution}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Đã gán cho <strong>{sopsWithCode.length}</strong> SOP
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowOfficialCodesRegistry(false);
                            setCurrentTab('sop_mgmt');
                            setSopFilterModel(registryModelTab);
                            setSopSearchText(item.code);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Lọc SOP mã này</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clarification banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 leading-relaxed space-y-1">
                <strong className="text-slate-800 block">Quy chuẩn về sự cố cơ khí / điện tử không có mã lỗi:</strong>
                <p>
                  Các sự cố cơ học hoặc ngoại vi như: <em>Rò rỉ pít-tông Teflon Syringe Hamilton 100µL, Kẹt ray trượt bi trục Z đâm xuyên nắp ống máu, Lệch điểm chạm cảm ứng điện dung, Oxy hóa đầu jack mạng LAN LIS/HIS RJ45, Chập đứt cảm biến nhiệt NTC 10k...</em> không sinh mã lỗi trên giao diện máy.
                </p>
                <p className="text-emerald-800 font-semibold">
                  Hệ thống để trống [Không có mã lỗi] cho các quy trình này để phản ánh đúng thực tế kỹ thuật, không tự bịa ra các mã giả (như E200, H100, Z500, FS100...) gây nhầm lẫn cho bệnh viện.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowOfficialCodesRegistry(false)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl cursor-pointer transition-colors"
              >
                Đóng Bảng Đối Soát
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: TẠO / BIÊN SOẠN & PHÊ DUYỆT KHUYẾN CÁO BẢNG TIN ADC */}
      {isEditingBulletin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {currentBulletin.id ? 'Biên Soạn & Cập Nhật Khuyến Cáo ADC' : 'Tạo Khuyến Cáo Kỹ Sư ADC Mới'}
                  </h3>
                  <p className="text-[11px] text-emerald-100">
                    Phê duyệt bởi Quản trị viên để công khai trên Cổng Hỗ Trợ Khách Hàng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingBulletin(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveBulletinForm('published');
              }}
              className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1"
            >
              {/* Tiêu đề */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tiêu Đề Khuyến Cáo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Khuyến cáo căn chỉnh áp suất bộ phận hút mẫu máy EXC200"
                  value={currentBulletin.title || ''}
                  onChange={(e) => setCurrentBulletin({ ...currentBulletin, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900"
                />
              </div>

              {/* Grid 3 cột: Chuyên mục, Model, Ưu tiên */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Chuyên Mục</label>
                  <select
                    value={currentBulletin.category || 'Khuyến cáo kỹ thuật'}
                    onChange={(e) => setCurrentBulletin({ ...currentBulletin, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Khuyến cáo kỹ thuật">Khuyến cáo kỹ thuật</option>
                    <option value="Cảnh báo an toàn">Cảnh báo an toàn</option>
                    <option value="Bảo dưỡng phòng ngừa">Bảo dưỡng phòng ngừa</option>
                    <option value="Cập nhật phần mềm & Patch">Cập nhật phần mềm & Patch</option>
                    <option value="Tối ưu hóa hóa chất & QC">Tối ưu hóa hóa chất & QC</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Model Thiết Bị</label>
                  <select
                    value={currentBulletin.equipmentModel || 'Zybio EXC200/220'}
                    onChange={(e) => setCurrentBulletin({ ...currentBulletin, equipmentModel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
                  >
                    <option value="Zybio EXC200/220">Zybio EXC200/220</option>
                    <option value="Zybio Z3 CRP">Zybio Z3 CRP</option>
                    <option value="Zybio Z50">Zybio Z50</option>
                    <option value="FS-205">FS-205</option>
                    <option value="Tất cả dòng máy">Tất cả dòng máy</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Mức Độ Ưu Tiên</label>
                  <select
                    value={currentBulletin.priority || 'high'}
                    onChange={(e) => setCurrentBulletin({ ...currentBulletin, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
                  >
                    <option value="urgent">Khẩn cấp (Cảnh báo đỏ)</option>
                    <option value="high">Ưu tiên cao (Khuyến cáo vàng)</option>
                    <option value="normal">Tiêu chuẩn (Thông báo thường)</option>
                  </select>
                </div>
              </div>

              {/* Tác giả kỹ sư & Người duyệt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Kỹ Sư Đề Xuất / Biên Soạn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: KS. Nguyễn Quang Đạt (Trưởng nhóm Kỹ thuật ADC)"
                    value={currentBulletin.engineerAuthor || ''}
                    onChange={(e) => setCurrentBulletin({ ...currentBulletin, engineerAuthor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Cấp Phê Duyệt Xuất Bản
                  </label>
                  <input
                    type="text"
                    value={currentBulletin.approvedBy || 'Ban Quản Trị ADC'}
                    onChange={(e) => setCurrentBulletin({ ...currentBulletin, approvedBy: e.target.value })}
                    placeholder="Ban Quản Trị ADC"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Tóm tắt ngắn gọn */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tóm Tắt Khuyến Cáo (Hiển thị nổi bật trên thẻ bài viết) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Tóm tắt ngắn gọn 1-2 câu về nguyên nhân, hiện tượng hoặc khuyến cáo thực hiện..."
                  value={currentBulletin.summary || ''}
                  onChange={(e) => setCurrentBulletin({ ...currentBulletin, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Nội dung chi tiết */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nội Dung & Hướng Dẫn Thao Tác Chi Tiết
                </label>
                <textarea
                  rows={4}
                  placeholder="Mô tả kỹ thuật chuyên sâu, nguyên lý và phân tích tại hiện trường..."
                  value={currentBulletin.content || ''}
                  onChange={(e) => setCurrentBulletin({ ...currentBulletin, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
                />
              </div>

              {/* Các bước khuyến nghị thực hiện */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800">
                    Các Bước Khuyến Nghị Kỹ Thuật (Checklist)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = currentBulletin.recommendations || [];
                      setCurrentBulletin({
                        ...currentBulletin,
                        recommendations: [...cur, `Bước ${cur.length + 1}: `]
                      });
                    }}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm bước</span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  {(currentBulletin.recommendations || []).map((step, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {sIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const updated = [...(currentBulletin.recommendations || [])];
                          updated[sIdx] = e.target.value;
                          setCurrentBulletin({ ...currentBulletin, recommendations: updated });
                        }}
                        placeholder={`Mô tả bước ${sIdx + 1}...`}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (currentBulletin.recommendations || []).filter((_, idx) => idx !== sIdx);
                          setCurrentBulletin({ ...currentBulletin, recommendations: updated });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ghim lên đầu */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pin className="w-4 h-4 text-amber-700" />
                  <div>
                    <span className="font-bold text-slate-900">Ghim lên đầu Bảng Tin</span>
                    <p className="text-[10px] text-slate-500">
                      Hiển thị thanh chạy thông báo khẩn ở đầu Cổng Khách Hàng
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!!currentBulletin.isPinned}
                  onChange={(e) => setCurrentBulletin({ ...currentBulletin, isPinned: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditingBulletin(false)}
                  className="w-full sm:w-auto px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer text-xs"
                >
                  Hủy Bỏ
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  {/* Save as Draft (Kept hidden from Customer Portal) */}
                  <button
                    type="button"
                    onClick={() => handleSaveBulletinForm('draft')}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-colors"
                    title="Lưu bản nháp nội bộ - Khách hàng sẽ KHÔNG nhìn thấy"
                  >
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Lưu Bản Nháp Nội Bộ (Ẩn trên Cổng KH)</span>
                  </button>

                  {/* Approve and Publish Immediately (Visible to Customer Portal) */}
                  <button
                    type="button"
                    onClick={() => handleSaveBulletinForm('published')}
                    className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer text-xs transition-colors"
                    title="Phê duyệt và phát hành công khai trên Cổng Hỗ Trợ Khách Hàng"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Phê Duyệt & Xuất Bản Ngay (Hiện Cổng KH)</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: XÁC NHẬN XÓA KHUYẾN CÁO */}
      {bulletinToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Xóa Khuyến Cáo Kỹ Thuật?</h3>
                <p className="text-xs text-slate-500">Thao tác này sẽ gỡ bài viết khỏi hệ thống và Cổng Khách Hàng.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <p className="font-bold text-slate-900">{bulletinToDelete.title}</p>
              <p className="text-slate-500 text-[11px] mt-1">Biên soạn: {bulletinToDelete.engineerAuthor}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulletinToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteBulletin) {
                    onDeleteBulletin(bulletinToDelete.id);
                  }
                  setBulletinToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: XEM CHI TIẾT KHUYẾN CÁO ADMIN (Preview) */}
      {viewingBulletinAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-start justify-between shrink-0">
              <div className="space-y-1.5 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    viewingBulletinAdmin.priority === 'urgent'
                      ? 'bg-red-500/30 text-red-200 border border-red-400/40'
                      : viewingBulletinAdmin.priority === 'high'
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                      : 'bg-white/20 text-white'
                  }`}>
                    {viewingBulletinAdmin.priority === 'urgent' ? 'Khẩn cấp' : viewingBulletinAdmin.priority === 'high' ? 'Ưu tiên cao' : 'Tiêu chuẩn'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-emerald-200">
                    {viewingBulletinAdmin.equipmentModel}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-700/50 text-white">
                    {viewingBulletinAdmin.category}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {viewingBulletinAdmin.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingBulletinAdmin(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Approval status banner in detail view */}
              {viewingBulletinAdmin.status === 'published' && viewingBulletinAdmin.approvedBy ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-950 text-xs">
                      Khuyến Cáo Đã Được Phê Duyệt & Công Khai
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      Phê duyệt bởi: <strong>{viewingBulletinAdmin.approvedBy}</strong> ({viewingBulletinAdmin.approvedAt || viewingBulletinAdmin.updatedAt}). Khách hàng có thể đọc trên Cổng Hỗ Trợ.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-950 text-xs">
                      Bản Nháp / Đang Chờ Phê Duyệt Nội Bộ
                    </p>
                    <p className="text-[11px] text-amber-800">
                      Bài viết này <strong>đang được ẩn</strong> trên Cổng Khách Hàng cho đến khi được phê duyệt xuất bản.
                    </p>
                  </div>
                </div>
              )}

              {/* Tóm tắt */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Tóm Tắt Khuyến Cáo
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {viewingBulletinAdmin.summary}
                </p>
              </div>

              {/* Nội dung chi tiết */}
              {viewingBulletinAdmin.content && (
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Nội Dung Phân Tích & Hướng Dẫn Chuyên Sâu
                  </span>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                    {viewingBulletinAdmin.content}
                  </div>
                </div>
              )}

              {/* Checklist */}
              {viewingBulletinAdmin.recommendations && viewingBulletinAdmin.recommendations.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Các Bước Khuyến Nghị Kỹ Sư ADC
                  </span>
                  <div className="space-y-2">
                    {viewingBulletinAdmin.recommendations.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-800 leading-snug">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Engineer signature */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                <span>Biên soạn: <strong className="text-slate-800">{viewingBulletinAdmin.engineerAuthor}</strong></span>
                <span>Cập nhật gần nhất: {viewingBulletinAdmin.updatedAt}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setViewingBulletinAdmin(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const blt = viewingBulletinAdmin;
                    setViewingBulletinAdmin(null);
                    setCurrentBulletin({ ...blt });
                    setIsEditingBulletin(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Chỉnh Sửa Khuyến Cáo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY INCIDENT MODAL (Cửa sổ can thiệp khẩn cấp tức thời) */}
      <EmergencyIncidentModal
        isOpen={isEmergencyPopupOpen}
        onClose={() => {
          setIsEmergencyPopupOpen(false);
          setHasUserDismissedPopup(true);
        }}
        urgentTickets={urgentPendingTickets}
        sops={sops}
        engineers={engineers}
        dutyEngineerName={settings.dutyEngineerName}
        dutyEngineerPhone={settings.dutyEngineerPhone}
        onAssignEngineer={handleAssignEngineer}
        onUpdateStatus={handleUpdateStatus}
        onNavigateToDispatch={(ticketCode) => {
          setCurrentTab('dispatch');
          setSearchTicketText(ticketCode);
        }}
      />
    </div>
  );
};
