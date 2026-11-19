import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Wrench, 
  ShieldAlert, 
  PhoneCall, 
  MessageSquare, 
  LayoutDashboard, 
  HelpCircle,
  Stethoscope,
  Building2,
  User,
  Users,
  LogOut,
  LogIn,
  ShieldCheck,
  ChevronDown,
  Download,
  CheckCircle2,
  Eye,
  Shield,
  FileSpreadsheet,
  BookOpen,
  BarChart3,
  Megaphone,
  Settings,
  Plus,
  Sparkles,
  Database,
  Lock,
  Calendar,
  Camera,
  Upload,
  RotateCcw,
  X,
  Image as ImageIcon
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  subscribeFirebaseAuth,
  signInWithGoogle,
  signOutFirebase,
  subscribeEngineersCloud,
  syncEngineersToCloud,
  subscribeSystemSettingsCloud,
  saveSystemSettingsToCloud,
  isVerifiedCloudAdmin,
  CloudEngineerSnapshotMeta
} from './firebase';
import { 
  SupportTicket, 
  SOPArticle, 
  MaintenanceRecord, 
  EngineerProfile, 
  SystemSettings,
  AuthUser,
  ADCBulletin,
  getSavedMonthKey,
  formatMonthLabel,
  isSavedResultLocked
} from './types';
import { 
  getStoredSOPs, 
  saveSOPs, 
  deduplicateSOPs,
  getStoredTickets, 
  saveTickets, 
  getStoredRecords, 
  saveRecords, 
  getStoredEngineers, 
  saveEngineers, 
  getStoredSettings, 
  saveSettings,
  getStoredAuthUser,
  saveAuthUser,
  isRememberLoginEnabled,
  getStoredBulletins,
  saveBulletins,
  resetToDefaults,
  resetRecordsToDefaults,
  ALL_ADMIN_TABS,
  getDefaultTabsForRole,
  processLogoImageFile
} from './utils/storage';
import {
  exportTicketsToExcel,
  exportTicketsToCSV,
  exportRecordsToExcel,
  exportRecordsToCSV,
  exportSOPsToExcel,
  exportSOPsToCSV
} from './utils/excel';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminPortal, AdminTabType } from './components/AdminPortal';
import { LoginModal } from './components/LoginModal';

export default function App() {
  // Global persistent states
  const [sops, setSops] = useState<SOPArticle[]>(() => getStoredSOPs());
  const [tickets, setTickets] = useState<SupportTicket[]>(() => getStoredTickets());
  const [records, setRecords] = useState<MaintenanceRecord[]>(() => getStoredRecords());
  const [engineers, setEngineers] = useState<EngineerProfile[]>(() => getStoredEngineers());
  const [settings, setSettings] = useState<SystemSettings>(() => getStoredSettings());
  const [bulletins, setBulletins] = useState<ADCBulletin[]>(() => getStoredBulletins());
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [rememberLogin, setRememberLogin] = useState<boolean>(() => isRememberLoginEnabled());

  const isDispatchLandingRole = (user: AuthUser | null): boolean => {
    if (!user) return false;
    const dept = (user.department || '').toLowerCase();
    return (
      user.role === 'field_engineer' ||
      user.role === 'css' ||
      user.role === 'director' ||
      dept.includes('kỹ thuật') ||
      dept.includes('css') ||
      dept.includes('giám đốc')
    );
  };

  // Current view: auto-open admin quickly if user enabled Remember Login, otherwise require login at startup
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>(() =>
    getStoredAuthUser() && isRememberLoginEnabled() ? 'admin' : 'customer'
  );
  const [adminTab, setAdminTab] = useState<AdminTabType>(() =>
    isDispatchLandingRole(getStoredAuthUser()) ? 'dispatch' : 'create_ticket'
  );
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTabMenu, setShowTabMenu] = useState(false);
  const [showCsdlMenu, setShowCsdlMenu] = useState(false);
  const [selectedResultMonth, setSelectedResultMonth] = useState<string>('all');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [logoDraftUrl, setLogoDraftUrl] = useState('');
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const logoFileInputRef = React.useRef<HTMLInputElement>(null);

  // Firebase Cloud Sync state (Preserves configured personnel across Dev & Published URLs)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'offline' | 'connecting' | 'synced' | 'syncing' | 'error'>('offline');
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const cloudMetaRef = React.useRef<CloudEngineerSnapshotMeta | null>(null);
  const cloudSettingsExistsRef = React.useRef<boolean>(false);
  const latestEngineersRef = React.useRef<EngineerProfile[]>(engineers);
  const latestSettingsRef = React.useRef<SystemSettings>(settings);
  const hasSeededEngineersRef = React.useRef<boolean>(false);
  const hasSeededSettingsRef = React.useRef<boolean>(false);

  useEffect(() => {
    latestEngineersRef.current = engineers;
  }, [engineers]);

  useEffect(() => {
    latestSettingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const unsub = subscribeFirebaseAuth((user) => {
      setFirebaseUser(user);
      setAuthReady(true);
      if (!user) {
        setCloudSyncStatus('offline');
        setCloudSyncError(null);
        cloudMetaRef.current = null;
        cloudSettingsExistsRef.current = false;
        hasSeededEngineersRef.current = false;
        hasSeededSettingsRef.current = false;
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !firebaseUser || !firebaseUser.emailVerified) {
      return;
    }

    setCloudSyncStatus('connecting');
    setCloudSyncError(null);

    const unsubEngineers = subscribeEngineersCloud(
      firebaseUser,
      async (cloudList, meta) => {
        cloudMetaRef.current = meta;

        if (cloudList.length === 0) {
          if (!hasSeededEngineersRef.current && latestEngineersRef.current.length > 0) {
            hasSeededEngineersRef.current = true;
            try {
              setCloudSyncStatus('syncing');
              await syncEngineersToCloud(latestEngineersRef.current, firebaseUser, null);
              setCloudSyncStatus('synced');
            } catch (err) {
              setCloudSyncStatus('error');
              setCloudSyncError(err instanceof Error ? err.message : 'Lỗi đồng bộ nhân sự lên Cloud.');
            }
          } else {
            setCloudSyncStatus('synced');
          }
          return;
        }

        hasSeededEngineersRef.current = true;
        const localById = new Map<string, EngineerProfile>(
          latestEngineersRef.current.map((e) => [e.id, e])
        );
        const cloudById = new Map<string, EngineerProfile>(
          cloudList.map((e) => [e.id, e])
        );
        const mergedList: EngineerProfile[] = [];

        for (const localEng of latestEngineersRef.current) {
          const cloudMatch = cloudById.get(localEng.id);
          if (cloudMatch) {
            mergedList.push(
              localEng.password ? { ...cloudMatch, password: localEng.password } : cloudMatch
            );
            cloudById.delete(localEng.id);
          }
        }
        for (const remaining of cloudById.values()) {
          const localMatch = localById.get(remaining.id);
          mergedList.push(
            localMatch?.password ? { ...remaining, password: localMatch.password } : remaining
          );
        }

        setEngineers(mergedList);
        saveEngineers(mergedList);
        setCloudSyncStatus('synced');
      },
      (err) => {
        setCloudSyncStatus('error');
        setCloudSyncError(err.message);
      }
    );

    const unsubSettings = subscribeSystemSettingsCloud(
      firebaseUser,
      async (partialSettings, exists) => {
        cloudSettingsExistsRef.current = exists;
        if (!exists) {
          if (!hasSeededSettingsRef.current && isVerifiedCloudAdmin(firebaseUser)) {
            hasSeededSettingsRef.current = true;
            try {
              await saveSystemSettingsToCloud(latestSettingsRef.current, firebaseUser, false);
            } catch (err) {
              console.warn('Cloud settings initial seed skipped:', err);
            }
          }
          return;
        }
        hasSeededSettingsRef.current = true;
        if (partialSettings) {
          const definedUpdates = Object.fromEntries(
            Object.entries(partialSettings).filter(([, v]) => v !== undefined)
          ) as Partial<SystemSettings>;
          if (Object.keys(definedUpdates).length > 0) {
            setSettings((prev) => ({ ...prev, ...definedUpdates }));
          }
        }
      },
      (err) => {
        console.warn('Cloud settings listener warning:', err.message);
      }
    );

    return () => {
      unsubEngineers();
      unsubSettings();
    };
  }, [authReady, firebaseUser]);

  // Sync to storage on state change
  useEffect(() => {
    saveSOPs(sops);
  }, [sops]);

  useEffect(() => {
    saveTickets(tickets);
  }, [tickets]);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  useEffect(() => {
    saveEngineers(engineers);
  }, [engineers]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveAuthUser(currentUser, rememberLogin);
  }, [currentUser, rememberLogin]);

  useEffect(() => {
    saveBulletins(bulletins);
  }, [bulletins]);

  // User Allowed Tabs (Checklist RBAC) - Nhân sự công ty luôn xem được Bảng việc ('dispatch')
  const userAllowedTabs: AdminTabType[] = React.useMemo(() => {
    if (!currentUser) return [...ALL_ADMIN_TABS];
    if (currentUser.role === 'director') return [...ALL_ADMIN_TABS];
    const baseTabs = (currentUser.allowedTabs && currentUser.allowedTabs.length > 0)
      ? currentUser.allowedTabs
      : getDefaultTabsForRole(currentUser.role);
    return baseTabs.includes('dispatch') ? baseTabs : ['dispatch', ...baseTabs];
  }, [currentUser]);

  const canManageLogo = Boolean(
    currentUser &&
    (currentUser.role === 'director' ||
      currentUser.role === 'css' ||
      userAllowedTabs.includes('settings'))
  );

  const handleOpenLogoModal = () => {
    if (!canManageLogo) return;
    setLogoDraftUrl(settings.logoUrl || '');
    setLogoUploadError(null);
    setIsLogoModalOpen(true);
  };

  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploadError(null);
    setIsProcessingLogo(true);
    try {
      const processedUrl = await processLogoImageFile(file);
      setLogoDraftUrl(processedUrl);
    } catch (err) {
      setLogoUploadError(err instanceof Error ? err.message : 'Không thể xử lý tệp ảnh logo.');
    } finally {
      setIsProcessingLogo(false);
      e.target.value = '';
    }
  };

  const handleSaveLogoModal = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = logoDraftUrl.trim();
    handleUpdateSettings({
      ...settings,
      logoUrl: cleaned || undefined
    });
    setIsLogoModalOpen(false);
  };

  const handleResetDefaultLogo = () => {
    setLogoDraftUrl('');
    setLogoUploadError(null);
    handleUpdateSettings({
      ...settings,
      logoUrl: undefined
    });
    setIsLogoModalOpen(false);
  };

  // Danh sách các tháng có kết quả lưu (từ Sổ tay 2026-XLKT và Ticket nghiệm thu)
  const availableResultMonths = React.useMemo(() => {
    const monthSet = new Set<string>([getSavedMonthKey()]);
    records.forEach(r => {
      monthSet.add(r.savedMonth || getSavedMonthKey(r.savedAt || r.date));
    });
    tickets.forEach(t => {
      if (t.engineerReport) {
        monthSet.add(
          t.engineerReport.savedMonth ||
          getSavedMonthKey(t.engineerReport.savedAt || t.engineerReport.completedAt || t.resolvedAt || t.createdAt)
        );
      } else {
        monthSet.add(getSavedMonthKey(t.resolvedAt || t.createdAt));
      }
    });
    return Array.from(monthSet).sort((a, b) => b.localeCompare(a));
  }, [records, tickets]);

  const recordsBySelectedMonth = React.useMemo(() => {
    if (selectedResultMonth === 'all') return records;
    return records.filter(r => (r.savedMonth || getSavedMonthKey(r.savedAt || r.date)) === selectedResultMonth);
  }, [records, selectedResultMonth]);

  const ticketsBySelectedMonth = React.useMemo(() => {
    if (selectedResultMonth === 'all') return tickets;
    return tickets.filter(t => {
      const m = t.engineerReport?.savedMonth ||
        getSavedMonthKey(t.engineerReport?.savedAt || t.engineerReport?.completedAt || t.resolvedAt || t.createdAt);
      return m === selectedResultMonth;
    });
  }, [tickets, selectedResultMonth]);

  // Tab checklist access guard
  useEffect(() => {
    if (viewMode === 'admin' && userAllowedTabs.length > 0 && !userAllowedTabs.includes(adminTab)) {
      setAdminTab(userAllowedTabs[0] || 'create_ticket');
    }
  }, [userAllowedTabs, adminTab, viewMode]);

  // Streamlined 7-item Menu Configuration (Hiding granular tabs into dropdown menu)
  const menuItems = [
    {
      id: 'dispatch' as AdminTabType,
      label: 'Bảng việc',
      tabKey: 'dispatch',
      isAllowed: userAllowedTabs.includes('dispatch') || userAllowedTabs.includes('overview')
    },
    {
      id: 'records' as AdminTabType,
      label: 'Danh sách',
      tabKey: 'records',
      isAllowed: userAllowedTabs.includes('records')
    },
    {
      id: 'create_ticket' as AdminTabType,
      label: 'Tạo Ticket',
      tabKey: 'create_ticket',
      isAllowed: userAllowedTabs.includes('create_ticket')
    },
    {
      id: (userAllowedTabs.includes('analytics') ? 'analytics' : 'chatbot_analytics') as AdminTabType,
      label: 'Báo cáo KPI',
      tabKey: 'analytics',
      isAllowed: userAllowedTabs.includes('analytics') || userAllowedTabs.includes('chatbot_analytics')
    },
    {
      id: 'sop_mgmt' as AdminTabType,
      label: 'Kho SOP & AI',
      tabKey: 'sop_mgmt',
      isAllowed: userAllowedTabs.includes('sop_mgmt') || userAllowedTabs.includes('learning')
    },
    {
      id: 'staff' as AdminTabType,
      label: 'Quản trị',
      tabKey: 'staff',
      isAllowed: userAllowedTabs.includes('staff') || userAllowedTabs.includes('settings') || userAllowedTabs.includes('excel')
    },
    {
      id: 'bulletins' as AdminTabType,
      label: 'Bản tin ADC',
      tabKey: 'bulletins',
      isAllowed: userAllowedTabs.includes('bulletins')
    }
  ];

  const getMenuButtonLabel = (): string => {
    if (adminTab === 'dispatch' || adminTab === 'overview') return 'Bảng việc';
    if (adminTab === 'records') return 'Danh sách';
    if (adminTab === 'create_ticket') return 'Tạo Ticket';
    if (adminTab === 'analytics' || adminTab === 'chatbot_analytics') return 'Báo cáo KPI';
    if (adminTab === 'sop_mgmt' || adminTab === 'learning') return 'Kho SOP & AI';
    if (adminTab === 'staff' || adminTab === 'settings' || adminTab === 'excel') return 'Quản trị';
    if (adminTab === 'bulletins') return 'Bản tin ADC';
    return 'Tạo Ticket';
  };

  const isMenuItemActive = (tabKey: string): boolean => {
    if (tabKey === 'dispatch') return adminTab === 'dispatch' || adminTab === 'overview';
    if (tabKey === 'records') return adminTab === 'records';
    if (tabKey === 'create_ticket') return adminTab === 'create_ticket';
    if (tabKey === 'analytics') return adminTab === 'analytics' || adminTab === 'chatbot_analytics';
    if (tabKey === 'sop_mgmt') return adminTab === 'sop_mgmt' || adminTab === 'learning';
    if (tabKey === 'staff') return adminTab === 'staff' || adminTab === 'settings' || adminTab === 'excel';
    if (tabKey === 'bulletins') return adminTab === 'bulletins';
    return false;
  };

  const handleEnterAdminPortal = () => {
    setViewMode('admin');
    if (currentUser && isDispatchLandingRole(currentUser) && userAllowedTabs.includes('dispatch')) {
      setAdminTab('dispatch');
    }
  };

  // Auth Handlers - Tự động chuyển sang Cổng Quản Trị & Mở Bảng việc cho Phòng kỹ thuật, CSS, Giám đốc
  const handleLogin = (user: AuthUser, remember: boolean = rememberLogin) => {
    const defaultRoleTabs = getDefaultTabsForRole(user.role);
    const fallbackTabs: AdminTabType[] = defaultRoleTabs.length > 0 ? defaultRoleTabs : ['dispatch', 'create_ticket', 'bulletins'];
    const rawTabs: AdminTabType[] = (user.allowedTabs && user.allowedTabs.length > 0)
      ? user.allowedTabs
      : fallbackTabs;
    const userTabs: AdminTabType[] = rawTabs.includes('dispatch') ? rawTabs : ['dispatch', ...rawTabs];

    const normalizedUser = { ...user, allowedTabs: userTabs };
    setRememberLogin(remember);
    saveAuthUser(normalizedUser, remember);
    setCurrentUser(normalizedUser);
    setShowUserMenu(false);
    setViewMode('admin');

    if (isDispatchLandingRole(normalizedUser) || userTabs.includes('dispatch')) {
      setAdminTab('dispatch');
    } else if (userTabs.includes('create_ticket')) {
      setAdminTab('create_ticket');
    } else if (userTabs.length > 0) {
      setAdminTab(userTabs[0]);
    } else {
      setAdminTab('dispatch');
    }
  };

  const handleLogout = () => {
    setRememberLogin(false);
    saveAuthUser(null, false);
    setCurrentUser(null);
    setShowUserMenu(false);
    setIsLoginModalOpen(false);
    if (viewMode === 'admin') {
      setViewMode('customer');
    }
  };

  // Handlers
  const handleAddTicket = (ticketData: Omit<SupportTicket, 'id' | 'ticketCode' | 'createdAt' | 'status' | 'source'>): SupportTicket => {
    const newCode = `TICK-2026-${String(tickets.length + 1).padStart(3, '0')}`;
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `TICK-${Date.now()}`,
      ticketCode: newCode,
      createdAt: new Date().toISOString(),
      status: 'pending',
      source: viewMode === 'customer' ? 'customer_portal' : 'internal_sales'
    };

    setTickets(prev => [newTicket, ...prev]);
    return newTicket;
  };

  const handleUpdateTicket = (updatedTicket: SupportTicket) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== updatedTicket.id) return t;
      const existingLockAnchor = t.engineerReport?.savedAt || t.engineerReport?.completedAt || t.resolvedAt;
      if (t.engineerReport && isSavedResultLocked(existingLockAnchor)) {
        return {
          ...updatedTicket,
          engineerReport: t.engineerReport
        };
      }
      return updatedTicket;
    }));
  };

  const handleSaveSOP = (sop: SOPArticle) => {
    setSops(prev => {
      const idx = prev.findIndex(s => s.id === sop.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = sop;
        return next;
      } else {
        return [sop, ...prev];
      }
    });
  };

  const handleDeleteSOP = (id: string) => {
    setSops(prev => prev.filter(s => s.id !== id));
  };

  const handleAddMultipleSOPs = (newSops: SOPArticle[]) => {
    setSops(prev => {
      const uniqueNew = newSops.map((s, idx) => ({
        ...s,
        id: `SOP-AUTO-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}-${idx}`
      }));
      return deduplicateSOPs([...uniqueNew, ...prev]);
    });
  };

  const handleUpdateAllSOPs = (newSops: SOPArticle[]) => {
    setSops(newSops);
  };

  const handleAddRecord = (record: MaintenanceRecord) => {
    const nowIso = new Date().toISOString();
    const stampedRecord: MaintenanceRecord = {
      ...record,
      savedAt: record.savedAt || nowIso,
      savedMonth: record.savedMonth || getSavedMonthKey(record.date || nowIso)
    };
    setRecords(prev => [stampedRecord, ...prev]);
  };

  const handleUpdateRecord = (updatedRecord: MaintenanceRecord) => {
    setRecords(prev => prev.map(r => {
      if (r.id !== updatedRecord.id) return r;
      if (isSavedResultLocked(r.savedAt || r.date)) {
        return r;
      }
      return {
        ...updatedRecord,
        savedAt: r.savedAt || updatedRecord.savedAt || new Date().toISOString(),
        savedMonth: getSavedMonthKey(updatedRecord.date || r.savedAt || r.date)
      };
    }));
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleDeleteMultipleRecords = (ids: string[]) => {
    const idSet = new Set(ids);
    setRecords(prev => prev.filter(r => !idSet.has(r.id)));
  };

  const handleAddMultipleRecords = (newRecords: MaintenanceRecord[]) => {
    const nowIso = new Date().toISOString();
    const stamped = newRecords.map(r => ({
      ...r,
      savedAt: r.savedAt || nowIso,
      savedMonth: r.savedMonth || getSavedMonthKey(r.date || nowIso)
    }));
    setRecords(prev => [...stamped, ...prev]);
  };

  const handleUpdateEngineers = (newEngineers: EngineerProfile[]) => {
    setEngineers(newEngineers);
    saveEngineers(newEngineers);
    if (firebaseUser && firebaseUser.emailVerified) {
      setCloudSyncStatus('syncing');
      setCloudSyncError(null);
      void syncEngineersToCloud(newEngineers, firebaseUser, cloudMetaRef.current)
        .then(() => {
          setCloudSyncStatus('synced');
        })
        .catch((err) => {
          setCloudSyncStatus('error');
          setCloudSyncError(err instanceof Error ? err.message : 'Lỗi đồng bộ Cloud.');
        });
    }
  };

  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    if (isVerifiedCloudAdmin(firebaseUser) && firebaseUser) {
      void saveSystemSettingsToCloud(newSettings, firebaseUser, cloudSettingsExistsRef.current)
        .catch((err) => {
          setCloudSyncStatus('error');
          setCloudSyncError(err instanceof Error ? err.message : 'Lỗi đồng bộ cài đặt Cloud.');
        });
    }
  };

  const handleCloudSignIn = async () => {
    setCloudSyncError(null);
    setCloudSyncStatus('connecting');
    try {
      await signInWithGoogle();
    } catch (err) {
      setCloudSyncStatus(firebaseUser ? 'error' : 'offline');
      setCloudSyncError(
        err instanceof Error ? err.message : 'Không thể đăng nhập Google để đồng bộ Cloud.'
      );
    }
  };

  const handleCloudSignOut = async () => {
    try {
      await signOutFirebase();
      setCloudSyncStatus('offline');
      setCloudSyncError(null);
    } catch (err) {
      setCloudSyncError(err instanceof Error ? err.message : 'Lỗi đăng xuất Cloud.');
    }
  };

  const handlePushCloudSync = async () => {
    if (!firebaseUser || !firebaseUser.emailVerified) {
      await handleCloudSignIn();
      return;
    }
    setCloudSyncStatus('syncing');
    setCloudSyncError(null);
    try {
      await syncEngineersToCloud(engineers, firebaseUser, cloudMetaRef.current);
      if (isVerifiedCloudAdmin(firebaseUser)) {
        await saveSystemSettingsToCloud(settings, firebaseUser, cloudSettingsExistsRef.current);
      }
      setCloudSyncStatus('synced');
    } catch (err) {
      setCloudSyncStatus('error');
      setCloudSyncError(err instanceof Error ? err.message : 'Lỗi đẩy dữ liệu lên Cloud.');
    }
  };

  const handleSaveBulletin = (bulletin: ADCBulletin) => {
    setBulletins(prev => {
      const idx = prev.findIndex(b => b.id === bulletin.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = bulletin;
        return next;
      }
      return [bulletin, ...prev];
    });
  };

  const handleDeleteBulletin = (id: string) => {
    setBulletins(prev => prev.filter(b => b.id !== id));
  };

  const handleApproveBulletin = (id: string, approverName: string = 'Ban Quản Trị ADC') => {
    const now = new Date().toLocaleString('vi-VN');
    setBulletins(prev => prev.map(b => {
      if (b.id === id) {
        return {
          ...b,
          status: 'published' as const,
          approvedBy: approverName,
          approvedAt: now,
          updatedAt: now
        };
      }
      return b;
    }));
  };

  const handleUnpublishBulletin = (id: string) => {
    const now = new Date().toLocaleString('vi-VN');
    setBulletins(prev => prev.map(b => {
      if (b.id === id) {
        return {
          ...b,
          status: 'draft' as const,
          approvedBy: undefined,
          approvedAt: undefined,
          updatedAt: now
        };
      }
      return b;
    }));
  };

  const handleTogglePinBulletin = (id: string) => {
    setBulletins(prev => prev.map(b => b.id === id ? { ...b, isPinned: !b.isPinned } : b));
  };

  const handleResetData = () => {
    resetToDefaults();
    const defaultEngineers = getStoredEngineers();
    const defaultSettings = getStoredSettings();
    setSops(getStoredSOPs());
    setTickets(getStoredTickets());
    setRecords(getStoredRecords());
    setEngineers(defaultEngineers);
    setSettings(defaultSettings);
    setBulletins(getStoredBulletins());
    if (firebaseUser && firebaseUser.emailVerified) {
      setCloudSyncStatus('syncing');
      void syncEngineersToCloud(defaultEngineers, firebaseUser, cloudMetaRef.current)
        .then(() => {
          if (isVerifiedCloudAdmin(firebaseUser)) {
            return saveSystemSettingsToCloud(defaultSettings, firebaseUser, cloudSettingsExistsRef.current);
          }
        })
        .then(() => setCloudSyncStatus('synced'))
        .catch((err) => {
          setCloudSyncStatus('error');
          setCloudSyncError(err instanceof Error ? err.message : 'Lỗi đồng bộ sau reset.');
        });
    }
    alert('Đã khôi phục dữ liệu ban đầu!');
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-50 flex flex-col text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Announcement bar */}
      {settings.announcement && (
        <div className="bg-emerald-950 text-emerald-200 text-[11px] py-1 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-emerald-900 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{settings.announcement}</span>
          <span className="hidden sm:inline text-emerald-400">·</span>
          <span className="hidden sm:inline font-semibold text-emerald-300">Trợ Lý Kỹ Thuật AI ADC 24/7 Trực Tuyến</span>
        </div>
      )}

      {/* Dynamic Top Bar: Streamlined for Admin dispatch mode or clean Customer portal mode */}
      {viewMode === 'admin' ? (
        <header className="bg-white border-b border-slate-200/90 shrink-0 z-40">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            {/* Brand Wordmark with Editable Admin Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div
                onClick={canManageLogo ? handleOpenLogoModal : undefined}
                title={canManageLogo ? 'Quản trị: Nhấn để thay đổi logo hệ thống' : undefined}
                className={`rounded-xl flex items-center justify-center shadow-xs relative overflow-hidden transition-all shrink-0 ${
                  settings.logoUrl
                    ? 'h-9 sm:h-12 min-w-9 sm:min-w-11 max-w-[130px] sm:max-w-[170px] px-1 bg-white border border-slate-200/90'
                    : 'w-9 h-9 sm:w-11 sm:h-11 bg-emerald-600 text-white'
                } ${
                  canManageLogo
                    ? 'cursor-pointer group hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1'
                    : ''
                }`}
              >
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.companyName || 'ADC Medical Tech'}
                    className="h-full w-auto max-w-full object-contain"
                  />
                ) : (
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
                {canManageLogo && (
                  <span className="absolute inset-0 bg-slate-900/55 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-none block truncate">
                  ADC Medical Tech
                </span>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">Hỗ trợ kỹ thuật &amp; điều phối 24/7</p>
              </div>
            </div>

            {/* Right Action Controls: CSDL, User Profile, Tab Menu Dropdown */}
            <div className="relative w-full sm:w-auto flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2.5 shrink-0">
              {/* 1. CSDL Dropdown Button */}
              <div className="sm:relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowCsdlMenu(prev => !prev);
                    setShowTabMenu(false);
                    setShowUserMenu(false);
                  }}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1 sm:gap-1.5 shadow-2xs cursor-pointer transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>CSDL</span>
                  {selectedResultMonth !== 'all' && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      {selectedResultMonth.split('-').reverse().join('/')}
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {showCsdlMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowCsdlMenu(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 sm:left-auto sm:right-0 sm:w-72 max-h-[calc(100vh-8.5rem)] overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                      <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Thao tác Cơ Sở Dữ Liệu
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Khóa sau 30 ngày</span>
                        </span>
                      </div>

                      {/* Lưu & Xem kết quả theo tháng */}
                      <div className="px-3 py-2 bg-slate-50/80 border-b border-slate-100 space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Lưu &amp; Xem kết quả theo tháng:</span>
                        </label>
                        <select
                          value={selectedResultMonth}
                          onChange={(e) => setSelectedResultMonth(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="all">
                            Tất cả các tháng ({records.length} biên bản · {tickets.length} phiếu)
                          </option>
                          {availableResultMonths.map(monthKey => {
                            const recCount = records.filter(r => (r.savedMonth || getSavedMonthKey(r.savedAt || r.date)) === monthKey).length;
                            const tickCount = tickets.filter(t => {
                              const tm = t.engineerReport?.savedMonth ||
                                getSavedMonthKey(t.engineerReport?.savedAt || t.engineerReport?.completedAt || t.resolvedAt || t.createdAt);
                              return tm === monthKey;
                            }).length;
                            return (
                              <option key={monthKey} value={monthKey}>
                                {formatMonthLabel(monthKey)} ({recCount} XLKT · {tickCount} phiếu)
                              </option>
                            );
                          })}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (userAllowedTabs.includes('records')) {
                              setAdminTab('records');
                            } else {
                              setAdminTab('dispatch');
                            }
                            setShowCsdlMenu(false);
                          }}
                          className="w-full px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>
                            Xem kết quả {selectedResultMonth === 'all' ? 'theo tháng' : formatMonthLabel(selectedResultMonth)}
                          </span>
                        </button>
                      </div>

                      <div className="px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-slate-700 font-medium">
                          <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Phiếu Ticket ({ticketsBySelectedMonth.length})</span>
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const suffix = selectedResultMonth !== 'all' ? `_Thang_${selectedResultMonth}` : '';
                              exportTicketsToExcel(
                                ticketsBySelectedMonth,
                                `Bao_Cao_Su_Co_Ky_Thuat_ADC${suffix || '_2026'}.xlsx`
                              );
                              setShowCsdlMenu(false);
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 font-mono text-[10px] font-bold cursor-pointer transition-colors"
                            title="Xuất Phiếu Ticket ra Excel (.xlsx)"
                          >
                            .xlsx
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const suffix = selectedResultMonth !== 'all' ? `_Thang_${selectedResultMonth}` : '';
                              exportTicketsToCSV(
                                ticketsBySelectedMonth,
                                `Bao_Cao_Phieu_Ky_Thuat_ADC${suffix || '_2026'}.csv`
                              );
                              setShowCsdlMenu(false);
                            }}
                            className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 font-mono text-[10px] font-bold cursor-pointer transition-colors"
                            title="Xuất Phiếu Ticket ra CSV (.csv)"
                          >
                            .csv
                          </button>
                        </div>
                      </div>

                      <div className="px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-slate-700 font-medium">
                          <Download className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Sổ tay 2026-XLKT ({recordsBySelectedMonth.length})</span>
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const suffix = selectedResultMonth !== 'all' ? `_Thang_${selectedResultMonth}` : '';
                              exportRecordsToExcel(
                                recordsBySelectedMonth,
                                `2026-XLKT_Nhat_Ky_Ky_Su${suffix}.xlsx`
                              );
                              setShowCsdlMenu(false);
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 font-mono text-[10px] font-bold cursor-pointer transition-colors"
                            title="Xuất Sổ tay 2026-XLKT ra Excel (.xlsx)"
                          >
                            .xlsx
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const suffix = selectedResultMonth !== 'all' ? `_Thang_${selectedResultMonth}` : '';
                              exportRecordsToCSV(
                                recordsBySelectedMonth,
                                `2026-XLKT_Nhat_Ky_Ky_Su${suffix}.csv`
                              );
                              setShowCsdlMenu(false);
                            }}
                            className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 font-mono text-[10px] font-bold cursor-pointer transition-colors"
                            title="Xuất Sổ tay 2026-XLKT ra CSV (.csv)"
                          >
                            .csv
                          </button>
                        </div>
                      </div>

                      <div className="px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-slate-700 font-medium">
                          <Download className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>Kho Quy Trình SOP ({sops.length})</span>
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              exportSOPsToExcel(sops);
                              setShowCsdlMenu(false);
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 font-mono text-[10px] font-bold cursor-pointer transition-colors"
                            title="Xuất Kho SOP ra Excel (.xlsx)"
                          >
                            .xlsx
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              exportSOPsToCSV(sops);
                              setShowCsdlMenu(false);
                            }}
                            className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 font-mono text-[10px] font-bold cursor-pointer transition-colors"
                            title="Xuất Kho SOP ra CSV (.csv)"
                          >
                            .csv
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={() => {
                          const defs = resetRecordsToDefaults();
                          setRecords(defs);
                          setShowCsdlMenu(false);
                          alert(`Đã nạp lại ${defs.length} biên bản thực chiến 2026-XLKT của KS. Nguyễn Quang Đạt!`);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                        <span>Nạp lại Biên bản gốc 2026-XLKT</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowCsdlMenu(false);
                          handleResetData();
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                      >
                        <Database className="w-3.5 h-3.5 text-red-500" />
                        <span>Khôi phục CSDL ban đầu (Reset)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* 2. User Profile Dropdown Button */}
              <div className="sm:relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(prev => !prev);
                    setShowTabMenu(false);
                    setShowCsdlMenu(false);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser?.name ? currentUser.name.trim().charAt(currentUser.name.trim().lastIndexOf(' ') + 1) || currentUser.name.charAt(0) : 'H'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-none">
                      {currentUser?.name || 'Hoàng Bảo Ngọc'}
                    </p>
                    <p className="text-[10px] font-semibold text-blue-700 leading-none mt-0.5">
                      {currentUser?.role === 'css' ? 'CSS' : currentUser?.role === 'sales' ? 'Kinh Doanh' : currentUser?.role === 'director' ? 'Giám Đốc' : currentUser?.role === 'warehouse' ? 'Kho' : currentUser?.role?.toUpperCase() || 'CSS'}
                    </p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 sm:left-auto sm:right-0 sm:w-80 max-h-[calc(100vh-8.5rem)] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      {currentUser && (
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                            {currentUser.name.trim().charAt(currentUser.name.trim().lastIndexOf(' ') + 1) || 'H'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-900 leading-tight truncate">
                                {currentUser.name}
                              </p>
                              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                                ● Trực tuyến
                              </span>
                            </div>
                            <p className="text-[11px] text-blue-700 font-semibold truncate mt-0.5">
                              {currentUser.department} ({currentUser.roleTitle})
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {currentUser.phone} · {currentUser.email}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="pt-2.5 space-y-1.5">
                        <button
                          onClick={() => {
                            setViewMode('customer');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span>Xem Cổng Hỗ Trợ Khách Hàng</span>
                        </button>

                        <button
                          onClick={() => {
                            handleLogout();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-500" />
                          <span>Đăng Xuất (Thoát tài khoản)</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 3. Streamlined Tab Navigation Menu Dropdown ("ẩn tab vào menu") */}
              <div className="sm:relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowTabMenu(prev => !prev);
                    setShowCsdlMenu(false);
                    setShowUserMenu(false);
                  }}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center gap-1.5 sm:gap-2 shadow-2xs cursor-pointer transition-all active:scale-95 max-w-[165px] sm:max-w-none"
                >
                  <span className="truncate">{getMenuButtonLabel()}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform shrink-0 ${showTabMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu Popup (Matching user screenshot) */}
                {showTabMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowTabMenu(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 sm:left-auto sm:right-0 sm:w-48 max-h-[calc(100vh-8.5rem)] overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                      {menuItems.map(item => {
                        if (!item.isAllowed) return null;
                        const active = isMenuItemActive(item.tabKey);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setAdminTab(item.id);
                              setShowTabMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                              active 
                                ? 'bg-blue-600 text-white font-bold' 
                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sub-banner right beneath header (Matching user screenshot) */}
          <div className="bg-blue-50/70 border-t border-b border-blue-100/90 text-blue-900 px-4 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-700 min-w-0">
              <Shield className="w-4 h-4 text-blue-700 shrink-0" />
              <span className="truncate">
                Vai trò đang xem: <strong className="text-blue-900 font-bold">{currentUser?.name || 'Hoàng Bảo Ngọc'}</strong> ·{' '}
                <span className="text-slate-600">
                  {currentUser?.department === 'Phòng CSS' 
                    ? 'Phòng CSS (Customer Services & Support - Hub Tiếp Nhận & Kỹ Thuật)' 
                    : currentUser?.department === 'Phòng Kinh Doanh'
                    ? 'Phòng Kinh Doanh (Bán hàng & Tiếp nhận yêu cầu)'
                    : currentUser?.department === 'Ban Giám Đốc'
                    ? 'Ban Giám Đốc (Lãnh đạo & Điều hành ADC)'
                    : currentUser?.department === 'Bộ Phận Kho'
                    ? 'Bộ Phận Kho (Quản lý thiết bị & linh kiện)'
                    : `${currentUser?.department || 'Phòng Kỹ Thuật'} (${currentUser?.roleTitle || 'Kỹ thuật'})`}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 shrink-0">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Xem toàn bộ ticket toàn công ty
              </span>
              <span className="flex items-center gap-1.5 text-blue-700 font-semibold">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                Ghi chú nội bộ CSS: Mở
              </span>
              <button
                onClick={() => setViewMode('customer')}
                className="text-slate-500 hover:text-slate-800 text-[11px] underline cursor-pointer"
              >
                Cổng Khách Hàng
              </button>
            </div>
          </div>
        </header>
      ) : (
        <header className="bg-white border-b border-slate-200/90 shrink-0 z-40">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div
                className={`rounded-xl flex items-center justify-center shadow-xs overflow-hidden shrink-0 ${
                  settings.logoUrl
                    ? 'h-9 sm:h-12 min-w-9 sm:min-w-11 max-w-[130px] sm:max-w-[170px] px-1 bg-white border border-slate-200/90'
                    : 'w-9 h-9 sm:w-11 sm:h-11 bg-emerald-600 text-white'
                }`}
              >
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.companyName || 'ADC Medical Tech'}
                    className="h-full w-auto max-w-full object-contain"
                  />
                ) : (
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-none block truncate">
                  ADC Medical Tech
                </span>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">Hỗ trợ kỹ thuật &amp; điều phối 24/7</p>
              </div>
            </div>

            {/* Zone 2: Navigation Links */}
            <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setViewMode('customer')}
                className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-emerald-700 border-b-2 border-emerald-600 pb-0.5"
              >
                Cổng Hỗ Trợ Khách Hàng &amp; KTV
              </button>
              <button
                onClick={handleEnterAdminPortal}
                className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-slate-600"
              >
                Bảng Điều Phối &amp; Quản Trị Nội Bộ
              </button>
            </nav>

            {/* Zone 3: Primary Action Toggle Button */}
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 shrink-0">
              <button
                onClick={handleEnterAdminPortal}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-600" />
                <span>Vào Cổng Quản Trị</span>
              </button>

              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
                title="Đăng nhập tài khoản nhân sự"
              >
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Router */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {viewMode === 'customer' ? (
          <CustomerPortal
            sops={sops}
            tickets={tickets}
            engineers={engineers}
            bulletins={bulletins}
            settings={settings}
            onAddTicket={handleAddTicket}
            onUpdateSOPs={handleUpdateAllSOPs}
          />
        ) : !currentUser ? (
          /* Authentication Gate when accessing Admin Portal while logged out */
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-100">
            <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Yêu Cầu Đăng Nhập Cổng Quản Trị ADC
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Khu vực nội bộ dành cho Ban Quản trị và Kỹ sư điều phối kỹ thuật. Vui lòng đăng nhập để quản lý nhân sự và phân công hỗ trợ.
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập Ngay</span>
                </button>
                <button
                  onClick={() => setViewMode('customer')}
                  className="w-full py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
                >
                  ← Quay lại Cổng Hỗ Trợ Khách Hàng
                </button>
              </div>
            </div>
          </div>
        ) : (
          <AdminPortal
            tickets={tickets}
            sops={sops}
            records={records}
            engineers={engineers}
            settings={settings}
            bulletins={bulletins}
            currentTab={adminTab}
            onTabChange={setAdminTab}
            currentUser={currentUser}
            onUpdateCurrentUser={setCurrentUser}
            onUpdateEngineers={handleUpdateEngineers}
            onUpdateTicket={handleUpdateTicket}
            onAddTicket={handleAddTicket}
            onSaveSOP={handleSaveSOP}
            onDeleteSOP={handleDeleteSOP}
            onAddMultipleSOPs={handleAddMultipleSOPs}
            onUpdateAllSOPs={handleUpdateAllSOPs}
            onAddRecord={handleAddRecord}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
            onDeleteMultipleRecords={handleDeleteMultipleRecords}
            onAddMultipleRecords={handleAddMultipleRecords}
            onSaveBulletin={handleSaveBulletin}
            onDeleteBulletin={handleDeleteBulletin}
            onApproveBulletin={handleApproveBulletin}
            onUnpublishBulletin={handleUnpublishBulletin}
            onTogglePinBulletin={handleTogglePinBulletin}
            onUpdateSettings={handleUpdateSettings}
            onResetData={handleResetData}
            selectedMonthFilter={selectedResultMonth}
            onMonthFilterChange={setSelectedResultMonth}
            cloudUserEmail={firebaseUser?.email || null}
            cloudSyncStatus={cloudSyncStatus}
            cloudSyncError={cloudSyncError}
            onCloudSignIn={handleCloudSignIn}
            onCloudSignOut={handleCloudSignOut}
            onPushCloudSync={handlePushCloudSync}
          />
        )}
      </main>

      {/* Account Login / Logout Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        engineers={engineers}
        onLogin={handleLogin}
        onLogout={handleLogout}
        initialRememberMe={rememberLogin}
      />

      {/* Admin Logo Customizer Modal */}
      {isLogoModalOpen && canManageLogo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Thay Đổi Logo Hệ Thống</h3>
                  <p className="text-[11px] text-slate-500">Hiển thị đồng bộ trên thanh tiêu đề Quản trị &amp; Khách hàng</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLogoModal} className="p-5 space-y-4">
              {/* Live Header Preview */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Xem trước trên thanh tiêu đề
                </span>
                <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-200 flex items-center gap-3">
                  <div
                    className={`rounded-xl flex items-center justify-center shadow-xs overflow-hidden shrink-0 ${
                      logoDraftUrl.trim()
                        ? 'h-12 min-w-12 max-w-[170px] px-1 bg-white border border-slate-200'
                        : 'w-12 h-12 bg-emerald-600 text-white'
                    }`}
                  >
                    {logoDraftUrl.trim() ? (
                      <img
                        src={logoDraftUrl.trim()}
                        alt="Xem trước logo"
                        className="h-full w-auto max-w-full object-contain"
                        onError={() => setLogoUploadError('Không thể tải ảnh từ đường dẫn này. Vui lòng kiểm tra lại URL hoặc tải ảnh trực tiếp.')}
                      />
                    ) : (
                      <Stethoscope className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-none block">
                      ADC Medical Tech
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Hỗ trợ kỹ thuật & điều phối 24/7
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload File */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Tải ảnh Logo từ máy tính
                </label>
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoFileSelect}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isProcessingLogo}
                    onClick={() => logoFileInputRef.current?.click()}
                    className="flex-1 px-3 py-2 rounded-lg border border-dashed border-emerald-400 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isProcessingLogo ? 'Đang xử lý ảnh...' : 'Chọn tệp ảnh (PNG, JPG, WEBP, SVG)'}</span>
                  </button>
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Hoặc nhập đường dẫn ảnh (URL)
                </label>
                <input
                  type="text"
                  value={logoDraftUrl}
                  onChange={(e) => {
                    setLogoUploadError(null);
                    setLogoDraftUrl(e.target.value);
                  }}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Khuyên dùng ảnh vuông nền trong suốt (PNG/SVG) để hiển thị sắc nét ở kích thước thanh tiêu đề.
                </p>
              </div>

              {logoUploadError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] font-medium text-rose-700">
                  {logoUploadError}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaultLogo}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Về mặc định</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLogoModalOpen(false)}
                    className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingLogo}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors disabled:opacity-60"
                  >
                    Lưu Logo
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
