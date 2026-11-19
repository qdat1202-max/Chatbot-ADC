import {
  SOPArticle,
  SupportTicket,
  EngineerProfile,
  MaintenanceRecord,
  SystemSettings,
  EquipmentModel,
  AuthUser,
  ChatbotSessionRecord,
  ADCBulletin,
  LearnedKnowledgeEntry,
  StaffRole,
  DepartmentType,
  AdminTabType,
  AccountRegistrationRequest
} from '../types';
import {
  INITIAL_SOPS,
  INITIAL_TICKETS,
  INITIAL_ENGINEERS,
  INITIAL_MAINTENANCE_RECORDS,
  INITIAL_SETTINGS
} from '../data/initialData';
import { INITIAL_BULLETINS } from '../data/initialBulletins';
import { INITIAL_LEARNED_KNOWLEDGE } from '../data/initialLearnedKnowledge';

export const ALL_ADMIN_TABS: AdminTabType[] = [
  'create_ticket',
  'bulletins',
  'dispatch',
  'sop_mgmt',
  'records',
  'staff',
  'analytics',
  'chatbot_analytics',
  'learning',
  'settings',
  'excel'
];

export const DEFAULT_ACCOUNT_PASSWORD = '286286';

export function normalizeStaffRole(rawRole: unknown): StaffRole {
  if (rawRole === 'director' || rawRole === 'admin') return 'director';
  if (rawRole === 'css' || rawRole === 'coordinator') return 'css';
  if (rawRole === 'warehouse') return 'warehouse';
  if (rawRole === 'sales') return 'sales';
  return 'field_engineer';
}

export function normalizeDepartmentForRole(role: StaffRole): DepartmentType {
  switch (role) {
    case 'director':
      return 'Ban Giám Đốc';
    case 'css':
      return 'Phòng CSS';
    case 'warehouse':
      return 'Bộ Phận Kho';
    case 'sales':
      return 'Phòng Kinh Doanh';
    case 'field_engineer':
    default:
      return 'Phòng Kỹ Thuật';
  }
}

export function getDefaultTabsForRole(role: StaffRole): AdminTabType[] {
  switch (role) {
    case 'sales':
      return ['dispatch', 'create_ticket', 'bulletins'];
    case 'css':
      return ['dispatch', 'create_ticket', 'bulletins', 'records', 'sop_mgmt', 'staff', 'analytics'];
    case 'warehouse':
      return ['dispatch', 'records', 'sop_mgmt', 'bulletins', 'excel'];
    case 'director':
      return [...ALL_ADMIN_TABS];
    case 'field_engineer':
    default:
      return ['dispatch', 'create_ticket', 'bulletins', 'sop_mgmt', 'records', 'learning'];
  }
}

const STORAGE_KEYS = {
  SOPS: 'adc_tbyt_sops_v1',
  TICKETS: 'adc_tbyt_tickets_v1',
  ENGINEERS: 'adc_tbyt_engineers_v1',
  RECORDS: 'adc_tbyt_records_v1',
  SETTINGS: 'adc_tbyt_settings_v1',
  AUTH_USER: 'adc_tbyt_auth_user_v1',
  CHAT_SESSIONS: 'adc_tbyt_chat_sessions_v1',
  BULLETINS: 'adc_tbyt_bulletins_v1',
  LEARNED_KNOWLEDGE: 'adc_tbyt_learned_knowledge_v1',
  ENGINEERS_SEEDED: 'adc_tbyt_engineers_seeded_v2',
  ENGINEERS_COMPANY_DEFAULT_SYNCED: 'adc_tbyt_engineers_company_default_v3',
  ENGINEERS_DEFAULT_PW_V4: 'adc_tbyt_engineers_default_pw_286286_v1',
  ENGINEERS_DISPATCH_GRANTED: 'adc_tbyt_engineers_dispatch_v1',
  CSS_STAFF_GRANTED: 'adc_tbyt_css_staff_v1',
  REGISTRATION_REQUESTS: 'adc_tbyt_registrations_v1',
  RFID_REMOVED_V1: 'adc_tbyt_rfid_removed_v1',
  REMEMBER_LOGIN: 'adc_tbyt_remember_login_v1'
};

function isRemovedRfidSop(s: any): boolean {
  if (!s) return false;
  const id = String(s.id || '').trim();
  const code = String(s.errorCode || '').trim().toUpperCase();
  return id === 'SOP-FS-002' || code === 'FS203';
}

function isRemovedRfidRecord(r: any): boolean {
  if (!r) return false;
  const id = String(r.id || '').trim();
  const code = String(r.code || '').trim().toUpperCase();
  return id === 'MREC-009' || code === '2026-XLKT-009';
}

function ensureLegacyRfidCleaned(): void {
  try {
    if (localStorage.getItem(STORAGE_KEYS.RFID_REMOVED_V1) === '1') return;

    const rawSops = localStorage.getItem(STORAGE_KEYS.SOPS);
    if (rawSops) {
      const parsedSops = JSON.parse(rawSops);
      if (Array.isArray(parsedSops)) {
        const filteredSops = parsedSops.filter(s => !isRemovedRfidSop(s));
        if (filteredSops.length !== parsedSops.length) {
          localStorage.setItem(STORAGE_KEYS.SOPS, JSON.stringify(filteredSops));
        }
      }
    }

    const rawRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (rawRecords) {
      const parsedRecords = JSON.parse(rawRecords);
      if (Array.isArray(parsedRecords)) {
        const filteredRecords = parsedRecords.filter(r => !isRemovedRfidRecord(r));
        if (filteredRecords.length !== parsedRecords.length) {
          localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(filteredRecords));
        }
      }
    }

    const rawSessions = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
    if (rawSessions) {
      const parsedSessions = JSON.parse(rawSessions);
      if (Array.isArray(parsedSessions)) {
        let changed = false;
        const cleanedSessions = parsedSessions.map((s: any) => {
          if (s && s.matchedSOPId === 'SOP-FS-002') {
            changed = true;
            const { matchedSOPId: _removed, ...rest } = s;
            return rest;
          }
          return s;
        });
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(cleanedSessions));
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.RFID_REMOVED_V1, '1');
  } catch {
    // Ignore storage migration failures
  }
}

export const DEFAULT_ADMIN_USER: AuthUser = {
  id: 'ENG-DIR-001',
  name: 'Lê Thanh Tùng',
  username: 'tung',
  role: 'director',
  roleTitle: 'Giám đốc',
  department: 'Ban Giám Đốc',
  phone: '0868 595 700',
  email: 'tung@adctbyt.vn',
  avatar: 'Tùng',
  area: 'Ban Giám Đốc ADC (Toàn quốc)',
  loginTime: '08:00 Hôm nay',
  allowedTabs: [...ALL_ADMIN_TABS]
};

// Ensure SOP items have unique IDs, no duplicates by equipmentModel + errorCode,
// and strictly REMOVE any made-up / invented fake error codes on imported or auto-analyzed SOPs.
export function deduplicateSOPs(sops: SOPArticle[]): SOPArticle[] {
  if (!Array.isArray(sops)) return [];
  const seenIds = new Set<string>();
  const seenModelCodes = new Set<string>();
  const result: SOPArticle[] = [];

  for (let i = 0; i < sops.length; i++) {
    const sop = sops[i];
    if (!sop) continue;

    // Check duplicate by model + errorCode
    const model = (sop.equipmentModel || '').trim();
    let code = (sop.errorCode || '').trim().toUpperCase();

    // STRICT CHECK: Remove made-up/invented fake placeholder tokens
    // Only strip pure placeholders like SOP-NEW, N/A, KHÔNG, NONE, or dummy strings
    // NEVER strip genuine official manufacturer error codes (E101, E205, H108, Z501, FS101, etc.)
    if (code === 'SOP-NEW' || code === 'N/A' || code === 'KHÔNG' || code === 'NONE' || code === 'NULL' || code.includes('THUCCHIEN') || code.startsWith('AUTO') || code.startsWith('SOP-')) {
      code = '';
    }

    const modelCodeKey = `${model}___${code}`;

    if (code && seenModelCodes.has(modelCodeKey)) {
      continue;
    }
    if (code) {
      seenModelCodes.add(modelCodeKey);
    }

    // Clean title if it contains fake code references
    let title = sop.title || '';
    if (!code && title) {
      title = title.replace(/^Quy trình xử lý sự cố (E\d+|H\d+|Z\d+|FS\d+|SOP-\w+):\s*/i, 'Quy trình: ');
      title = title.replace(/\s+theo file [^:]+:\s*/i, ': ');
    }

    // Ensure unique ID
    let finalId = sop.id ? String(sop.id).trim() : '';
    if (!finalId || seenIds.has(finalId)) {
      finalId = `SOP-${code || 'TECH'}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}-${i}`;
    }
    seenIds.add(finalId);

    result.push({
      ...sop,
      id: finalId,
      errorCode: code,
      title: title
    });
  }

  return result;
}

export function getStoredSOPs(): SOPArticle[] {
  ensureLegacyRfidCleaned();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOPS);
    if (!raw) {
      const initial = deduplicateSOPs(INITIAL_SOPS);
      localStorage.setItem(STORAGE_KEYS.SOPS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    const cleaned = deduplicateSOPs(parsed);

    // Merge missing SOPs from INITIAL_SOPS
    const existingIds = new Set(cleaned.map(s => s.id));
    const existingTitles = new Set(cleaned.map(s => s.title));
    let hasNew = false;
    for (const sop of INITIAL_SOPS) {
      if (!existingIds.has(sop.id) && !existingTitles.has(sop.title)) {
        cleaned.push(sop);
        hasNew = true;
      }
    }

    if (hasNew || JSON.stringify(cleaned) !== raw) {
      localStorage.setItem(STORAGE_KEYS.SOPS, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return deduplicateSOPs(INITIAL_SOPS);
  }
}

export function saveSOPs(sops: SOPArticle[]): void {
  const cleaned = deduplicateSOPs(sops);
  localStorage.setItem(STORAGE_KEYS.SOPS, JSON.stringify(cleaned));
}

export function getStoredTickets(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TICKETS;
  }
}

export function saveTickets(tickets: SupportTicket[]): void {
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
}

export function getStoredEngineers(): EngineerProfile[] {
  const withDefaultPasswords = INITIAL_ENGINEERS.map(e => ({
    ...e,
    password: e.password && String(e.password).trim() ? String(e.password).trim() : DEFAULT_ACCOUNT_PASSWORD
  }));
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENGINEERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ENGINEERS, JSON.stringify(withDefaultPasswords));
      localStorage.setItem(STORAGE_KEYS.ENGINEERS_SEEDED, '1');
      localStorage.setItem(STORAGE_KEYS.ENGINEERS_COMPANY_DEFAULT_SYNCED, '1');
      localStorage.setItem(STORAGE_KEYS.ENGINEERS_DEFAULT_PW_V4, '1');
      return withDefaultPasswords;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const companyDefaultSynced = localStorage.getItem(STORAGE_KEYS.ENGINEERS_COMPANY_DEFAULT_SYNCED) === '1';
      const alreadySeeded = localStorage.getItem(STORAGE_KEYS.ENGINEERS_SEEDED) === '1';
      let hasChanges = false;
      let updated: EngineerProfile[] = [...parsed];

      if (!companyDefaultSynced) {
        const legacyReplacedIds = new Set(['ENG-001', 'ENG-CSS-002']);
        const initialById = new Map(withDefaultPasswords.map(e => [e.id, e]));
        const existingById = new Map<string, EngineerProfile>(
          parsed.map((e: EngineerProfile) => [e.id, e])
        );
        const syncedDefaults = withDefaultPasswords.map(defEng => {
          const prev = existingById.get(defEng.id);
          return {
            ...defEng,
            password: prev?.password && String(prev.password).trim() ? String(prev.password).trim() : defEng.password
          };
        });
        const customAdditions = parsed.filter(
          (e: EngineerProfile) => e && e.id && !initialById.has(e.id) && !legacyReplacedIds.has(e.id)
        );
        updated = [...syncedDefaults, ...customAdditions];
        localStorage.setItem(STORAGE_KEYS.ENGINEERS_COMPANY_DEFAULT_SYNCED, '1');
        localStorage.setItem(STORAGE_KEYS.ENGINEERS_SEEDED, '1');
        hasChanges = true;
      } else if (!alreadySeeded) {
        // One-time merge of default department accounts for pre-existing storage
        const existingIds = new Set(parsed.map((e: any) => e.id));
        for (const initEng of withDefaultPasswords) {
          if (!existingIds.has(initEng.id)) {
            updated.push(initEng);
            hasChanges = true;
          }
        }
        localStorage.setItem(STORAGE_KEYS.ENGINEERS_SEEDED, '1');
      }

      const dispatchGranted = localStorage.getItem(STORAGE_KEYS.ENGINEERS_DISPATCH_GRANTED) === '1';
      const cssStaffGranted = localStorage.getItem(STORAGE_KEYS.CSS_STAFF_GRANTED) === '1';
      const defaultPwV4Migrated = localStorage.getItem(STORAGE_KEYS.ENGINEERS_DEFAULT_PW_V4) === '1';

      // Ensure every account has valid role (one of 5 roles), department & allowedTabs
      const fullyNormalized = updated.map((p: EngineerProfile) => {
        const matched = withDefaultPasswords.find(i => i.id === p.id);
        const rawRole = (p.role || matched?.role || 'field_engineer') as string;
        const resolvedRole = normalizeStaffRole(rawRole);
        const rawDept = typeof p.department === 'string' ? p.department.trim() : '';
        const resolvedDepartment = rawDept || (matched?.department ? String(matched.department) : normalizeDepartmentForRole(resolvedRole));
        let resolvedAllowedTabs = (p.allowedTabs && p.allowedTabs.length > 0)
          ? [...p.allowedTabs]
          : [...(matched?.allowedTabs || getDefaultTabsForRole(resolvedRole))];

        if (!dispatchGranted && !resolvedAllowedTabs.includes('dispatch')) {
          resolvedAllowedTabs = ['dispatch', ...resolvedAllowedTabs];
          hasChanges = true;
        }

        if (!cssStaffGranted && resolvedRole === 'css' && !resolvedAllowedTabs.includes('staff')) {
          resolvedAllowedTabs = [...resolvedAllowedTabs, 'staff'];
          hasChanges = true;
        }

        const rawPw = p.password ? String(p.password).trim() : '';
        const shouldMigrateLegacyDefaultPw = !defaultPwV4Migrated && (!rawPw || rawPw === '26286');
        const resolvedPassword = shouldMigrateLegacyDefaultPw
          ? DEFAULT_ACCOUNT_PASSWORD
          : rawPw || DEFAULT_ACCOUNT_PASSWORD;

        if (
          rawRole !== resolvedRole ||
          p.department !== resolvedDepartment ||
          !p.allowedTabs ||
          p.allowedTabs.length === 0 ||
          !rawPw ||
          shouldMigrateLegacyDefaultPw
        ) {
          hasChanges = true;
        }

        return {
          ...p,
          role: resolvedRole,
          department: resolvedDepartment,
          allowedTabs: resolvedAllowedTabs,
          password: resolvedPassword
        };
      });

      if (!dispatchGranted) {
        localStorage.setItem(STORAGE_KEYS.ENGINEERS_DISPATCH_GRANTED, '1');
      }
      if (!cssStaffGranted) {
        localStorage.setItem(STORAGE_KEYS.CSS_STAFF_GRANTED, '1');
      }
      if (!defaultPwV4Migrated) {
        localStorage.setItem(STORAGE_KEYS.ENGINEERS_DEFAULT_PW_V4, '1');
      }

      if (hasChanges) {
        localStorage.setItem(STORAGE_KEYS.ENGINEERS, JSON.stringify(fullyNormalized));
      }
      return fullyNormalized;
    }
    return withDefaultPasswords;
  } catch {
    return withDefaultPasswords;
  }
}

export function saveEngineers(engineers: EngineerProfile[]): void {
  localStorage.setItem(STORAGE_KEYS.ENGINEERS, JSON.stringify(engineers));
  localStorage.setItem(STORAGE_KEYS.ENGINEERS_SEEDED, '1');
  localStorage.setItem(STORAGE_KEYS.ENGINEERS_COMPANY_DEFAULT_SYNCED, '1');
  localStorage.setItem(STORAGE_KEYS.ENGINEERS_DEFAULT_PW_V4, '1');
  localStorage.setItem(STORAGE_KEYS.ENGINEERS_DISPATCH_GRANTED, '1');
  localStorage.setItem(STORAGE_KEYS.CSS_STAFF_GRANTED, '1');
}

export function getStoredRecords(): MaintenanceRecord[] {
  ensureLegacyRfidCleaned();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_MAINTENANCE_RECORDS));
      return INITIAL_MAINTENANCE_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Merge any missing initial records
      const existingCodes = new Set(parsed.map((r: any) => r.code));
      let hasNew = false;
      const merged = [...parsed];
      for (const rec of INITIAL_MAINTENANCE_RECORDS) {
        if (!existingCodes.has(rec.code)) {
          merged.push(rec);
          hasNew = true;
        }
      }
      if (hasNew) {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
    return INITIAL_MAINTENANCE_RECORDS;
  } catch {
    return INITIAL_MAINTENANCE_RECORDS;
  }
}

export function resetRecordsToDefaults(): MaintenanceRecord[] {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_MAINTENANCE_RECORDS));
  return INITIAL_MAINTENANCE_RECORDS;
}

export function saveRecords(records: MaintenanceRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

export function getStoredSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.announcement || parsed.announcement.includes('tiếp nhận mọi yêu cầu sự cố')) {
      parsed.announcement = INITIAL_SETTINGS.announcement;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
    }
    if (!parsed.chatbotWelcomeMessage || parsed.chatbotWelcomeMessage.includes('Bạn đang gặp sự cố với dòng máy')) {
      parsed.chatbotWelcomeMessage = INITIAL_SETTINGS.chatbotWelcomeMessage;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
    }
    if (!parsed.smartForwardingRules) {
      parsed.smartForwardingRules = INITIAL_SETTINGS.smartForwardingRules;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: SystemSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function isRememberLoginEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_LOGIN) === '1';
  } catch {
    return false;
  }
}

export function getStoredAuthUser(): AuthUser | null {
  try {
    if (!isRememberLoginEnabled()) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      return null;
    }
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id) {
      if (parsed.id === 'usr-admin-01' || parsed.role === 'admin' || (parsed.id === 'ENG-DIR-001' && parsed.username === 'quyet.lv')) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(DEFAULT_ADMIN_USER));
        return DEFAULT_ADMIN_USER;
      }
      const normalizedRole = normalizeStaffRole(parsed.role);
      const normalizedDept = (parsed.department && String(parsed.department).trim()) ? String(parsed.department).trim() : normalizeDepartmentForRole(normalizedRole);
      const normalizedTabsBase = (!parsed.allowedTabs || parsed.allowedTabs.length === 0)
        ? getDefaultTabsForRole(normalizedRole)
        : !parsed.allowedTabs.includes('dispatch')
        ? ['dispatch', ...parsed.allowedTabs]
        : parsed.allowedTabs;
      const normalizedTabs = (normalizedRole === 'css' && !normalizedTabsBase.includes('staff'))
        ? [...normalizedTabsBase, 'staff']
        : normalizedTabsBase;
      const migratedUser: AuthUser = {
        ...parsed,
        role: normalizedRole,
        department: normalizedDept,
        roleTitle:
          normalizedRole === 'director'
            ? 'Giám đốc'
            : normalizedRole === 'css'
            ? 'Phòng CSS'
            : normalizedRole === 'warehouse'
            ? 'Kho vận'
            : normalizedRole === 'sales'
            ? 'Kinh doanh'
            : 'Kỹ thuật',
        allowedTabs: normalizedTabs
      };
      if (parsed.role !== normalizedRole || parsed.department !== normalizedDept) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(migratedUser));
      }
      return migratedUser;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveAuthUser(user: AuthUser | null, remember: boolean = false): void {
  if (user === null || !remember) {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_LOGIN);
  } else {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.REMEMBER_LOGIN, '1');
  }
}

export const SEED_CHAT_SESSIONS: ChatbotSessionRecord[] = [
  {
    id: 'SES-2026-001',
    startedAt: '2026-10-17T08:15:00.000Z',
    lastActivityAt: '2026-10-17T08:22:00.000Z',
    equipmentModel: 'Zybio EXC200/220',
    messageCount: 4,
    avgResponseTimeMs: 780,
    isResolvedByBot: true,
    escalatedToEngineer: false,
    classification: {
      equipmentModel: 'Zybio EXC200/220',
      issueNature: 'hardware',
      natureLabel: 'Phần cứng & Cơ khí',
      confidence: 0.96,
      keywordsDetected: ['kim hút', 'kẹt kim', 'E101', 'motor'],
      summaryNote: 'Kim hút mẫu bị kẹt không hạ xuống đĩa cuvette',
      faultCode: 'E101',
      faultLabel: '[E101] Va chạm & kẹt kim hút mẫu/thuốc thử'
    },
    userQuerySnippets: ['Máy EXC200 báo lỗi E101 kẹt kim hút', 'Đã vệ sinh đầu kim, cần reset motor'],
    matchedSOPId: 'SOP-EXC-001',
    matchedSOPCode: 'E101',
    hospitalClinic: 'BV Đa khoa Đức Giang'
  },
  {
    id: 'SES-2026-002',
    startedAt: '2026-10-18T09:30:00.000Z',
    lastActivityAt: '2026-10-18T09:42:00.000Z',
    equipmentModel: 'Zybio Z3 CRP',
    messageCount: 5,
    avgResponseTimeMs: 820,
    isResolvedByBot: true,
    escalatedToEngineer: false,
    classification: {
      equipmentModel: 'Zybio Z3 CRP',
      issueNature: 'reagents_cuvette',
      natureLabel: 'Hóa chất & Buồng đếm',
      confidence: 0.94,
      keywordsDetected: ['buồng đếm', 'H102', 'bọt khí', 'lyse'],
      summaryNote: 'Buồng đếm RBC/PLT có bọt khí gây sai lệch kết quả',
      faultCode: 'H101',
      faultLabel: '[H101] Nghẽn lỗ đếm vi mô sapphire WBC/RBC'
    },
    userQuerySnippets: ['Máy Z3 CRP báo mã lỗi H102', 'Cảnh báo bọt khí buồng đo tiểu cầu'],
    matchedSOPId: 'SOP-Z3-001',
    matchedSOPCode: 'H102',
    hospitalClinic: 'Trung tâm Y tế Ba Đình'
  },
  {
    id: 'SES-2026-003',
    startedAt: '2026-10-19T10:10:00.000Z',
    lastActivityAt: '2026-10-19T10:25:00.000Z',
    equipmentModel: 'Zybio Z50',
    messageCount: 6,
    avgResponseTimeMs: 910,
    isResolvedByBot: false,
    escalatedToEngineer: true,
    classification: {
      equipmentModel: 'Zybio Z50',
      issueNature: 'optics_sensor',
      natureLabel: 'Quang học & Cảm biến',
      confidence: 0.91,
      keywordsDetected: ['laser', 'sensor', 'Z503', 'quang học'],
      summaryNote: 'Cảm biến phân tán laser buồng WOC báo tín hiệu suy giảm',
      faultCode: 'Z503',
      faultLabel: '[Z503] Suy hao công suất nguồn diode laser quang học'
    },
    userQuerySnippets: ['Z50 báo lỗi Z503 laser flow cell', 'Đã chạy rửa nhưng tín hiệu sensor vẫn báo đỏ, cần kỹ sư'],
    matchedSOPId: 'SOP-Z50-002',
    matchedSOPCode: 'Z503',
    hospitalClinic: 'BV Phụ sản Hà Nội'
  },
  {
    id: 'SES-2026-004',
    startedAt: '2026-10-20T11:05:00.000Z',
    lastActivityAt: '2026-10-20T11:15:00.000Z',
    equipmentModel: 'FS-205',
    messageCount: 3,
    avgResponseTimeMs: 690,
    isResolvedByBot: true,
    escalatedToEngineer: false,
    classification: {
      equipmentModel: 'FS-205',
      issueNature: 'software_lis',
      natureLabel: 'Phần mềm & Kết nối LIS',
      confidence: 0.92,
      keywordsDetected: ['kết nối', 'lis', 'mạng', 'cổng com'],
      summaryNote: 'Mất truyền dữ liệu kết quả xét nghiệm sang hệ thống LIS bệnh viện',
      faultCode: 'LIS-FS',
      faultLabel: '[LIS-FS] Mất tín hiệu truyền dữ liệu LIS/HIS'
    },
    userQuerySnippets: ['Máy FS-205 không truyền được kết quả sang phần mềm LIS', 'Kiểm tra cổng COM và IP'],
    matchedSOPCode: 'FS-LIS-01',
    hospitalClinic: 'Phòng khám Đa khoa Medlatec'
  },
  {
    id: 'SES-2026-005',
    startedAt: '2026-10-21T14:20:00.000Z',
    lastActivityAt: '2026-10-21T14:35:00.000Z',
    equipmentModel: 'Zybio EXC200/220',
    messageCount: 4,
    avgResponseTimeMs: 740,
    isResolvedByBot: true,
    escalatedToEngineer: false,
    classification: {
      equipmentModel: 'Zybio EXC200/220',
      issueNature: 'user_guide',
      natureLabel: 'Hướng dẫn vận hành & Hỏi đáp',
      confidence: 0.88,
      keywordsDetected: ['cuvette blank', 'mẫu trắng', 'hướng dẫn', 'quy trình'],
      summaryNote: 'Quy trình chạy mẫu trắng Cuvette Blank kiểm chuẩn quang học',
      faultCode: 'QC-EXC',
      faultLabel: '[QC-EXC] Lệch kiểm chuẩn Calib/Blank sinh hóa'
    },
    userQuerySnippets: ['Hướng dẫn chạy cuvette blank đầu ca máy EXC200', 'Độ hấp thụ quang bao nhiêu là đạt?'],
    matchedSOPId: 'SOP-EXC-003',
    matchedSOPCode: 'BLANK-01',
    hospitalClinic: 'BV Đa khoa Hà Đông'
  },
  {
    id: 'SES-2026-006',
    startedAt: '2026-10-22T08:00:00.000Z',
    lastActivityAt: '2026-10-22T08:18:00.000Z',
    equipmentModel: 'Zybio EXC200/220',
    messageCount: 5,
    avgResponseTimeMs: 760,
    isResolvedByBot: true,
    escalatedToEngineer: false,
    classification: {
      equipmentModel: 'Zybio EXC200/220',
      issueNature: 'hardware',
      natureLabel: 'Phần cứng & Cơ khí',
      confidence: 0.95,
      keywordsDetected: ['trạm rửa', 'tràn nước', 'bơm xả', 'E205'],
      summaryNote: 'Trạm rửa kim bị tràn nước do tắc đường ống hút xả',
      faultCode: 'E205',
      faultLabel: '[E205] Tràn nước trạm rửa cuvette & nghẹt xả'
    },
    userQuerySnippets: ['Báo lỗi E205 trạm rửa nước dâng tràn đĩa', 'Thông tắc bằng dây thông 0.15mm'],
    matchedSOPId: 'SOP-EXC-002',
    matchedSOPCode: 'E205',
    hospitalClinic: 'BV Quân Y 103'
  },
  {
    id: 'SES-2026-007',
    startedAt: '2026-10-22T13:40:00.000Z',
    lastActivityAt: '2026-10-22T13:58:00.000Z',
    equipmentModel: 'Zybio Z3 CRP',
    messageCount: 6,
    avgResponseTimeMs: 890,
    isResolvedByBot: false,
    escalatedToEngineer: true,
    classification: {
      equipmentModel: 'Zybio Z3 CRP',
      issueNature: 'hardware',
      natureLabel: 'Phần cứng & Cơ khí',
      confidence: 0.93,
      keywordsDetected: ['van điện từ', 'rò rỉ', 'áp lực', 'kỹ sư'],
      summaryNote: 'Van điện từ V1 rò rỉ dung dịch pha loãng áp lực không đều',
      faultCode: 'H204',
      faultLabel: '[H204] Rò rỉ van áp lực âm & bơm hút lyse'
    },
    userQuerySnippets: ['Z3 CRP kêu tít tít van áp lực rò rỉ nước', 'Cần kỹ sư ADC đến thay van ngay'],
    matchedSOPId: 'SOP-Z3-002',
    matchedSOPCode: 'H204',
    hospitalClinic: 'BV Đa khoa Hoàn Mỹ'
  },
  {
    id: 'SES-2026-008',
    startedAt: '2026-10-23T07:15:00.000Z',
    lastActivityAt: '2026-10-23T07:28:00.000Z',
    equipmentModel: 'FS-205',
    messageCount: 3,
    avgResponseTimeMs: 650,
    isResolvedByBot: true,
    escalatedToEngineer: false,
    classification: {
      equipmentModel: 'FS-205',
      issueNature: 'optics_sensor',
      natureLabel: 'Quang học & Cảm biến',
      confidence: 0.94,
      keywordsDetected: ['barcode', 'đầu đọc', 'mã vạch', 'không nhận test'],
      summaryNote: 'Đầu đọc barcode không quét được thẻ chíp test card',
      faultCode: 'FS-BAR-01',
      faultLabel: '[FS-BAR-01] Lỗi đầu đọc quang không nhận barcode thẻ chíp'
    },
    userQuerySnippets: ['Máy FS205 đưa thẻ test vào không nhận barcode', 'Lau sạch mắt đọc quang'],
    matchedSOPId: 'SOP-FS-001',
    matchedSOPCode: 'FS-BAR-01',
    hospitalClinic: 'Trung tâm Chẩn đoán Y khoa Medilife'
  }
];

export function getStoredChatSessions(): ChatbotSessionRecord[] {
  ensureLegacyRfidCleaned();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(SEED_CHAT_SESSIONS));
      return SEED_CHAT_SESSIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(SEED_CHAT_SESSIONS));
      return SEED_CHAT_SESSIONS;
    }
    const enriched = parsed.map(s => {
      if (!s.classification?.faultLabel) {
        const seedMatch = SEED_CHAT_SESSIONS.find(seed => seed.id === s.id);
        if (seedMatch?.classification?.faultLabel) {
          return {
            ...s,
            classification: {
              ...s.classification,
              faultCode: seedMatch.classification.faultCode,
              faultLabel: seedMatch.classification.faultLabel
            }
          };
        }
        const code = s.matchedSOPCode || 'ERR';
        return {
          ...s,
          classification: {
            ...s.classification,
            faultCode: code,
            faultLabel: `[${code}] Sự cố ${s.equipmentModel || ''}`
          }
        };
      }
      return s;
    });
    return enriched;
  } catch {
    return SEED_CHAT_SESSIONS;
  }
}

export function saveChatSession(session: ChatbotSessionRecord): void {
  try {
    const sessions = getStoredChatSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    let updated: ChatbotSessionRecord[];
    if (existingIndex >= 0) {
      updated = [...sessions];
      updated[existingIndex] = session;
    } else {
      updated = [session, ...sessions];
    }
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save chat session:', err);
  }
}

export function saveAllChatSessions(sessions: ChatbotSessionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.warn('Could not save all chat sessions:', err);
  }
}

export function getStoredBulletins(): ADCBulletin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BULLETINS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BULLETINS, JSON.stringify(INITIAL_BULLETINS));
      return INITIAL_BULLETINS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BULLETINS;
  } catch {
    return INITIAL_BULLETINS;
  }
}

export function saveBulletins(bulletins: ADCBulletin[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BULLETINS, JSON.stringify(bulletins));
  } catch (err) {
    console.warn('Could not save bulletins:', err);
  }
}

export function getStoredLearnedKnowledge(): LearnedKnowledgeEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEARNED_KNOWLEDGE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LEARNED_KNOWLEDGE, JSON.stringify(INITIAL_LEARNED_KNOWLEDGE));
      return INITIAL_LEARNED_KNOWLEDGE;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const existingIds = new Set(parsed.map((k: any) => k.id));
      let hasNew = false;
      const merged = [...parsed];
      for (const item of INITIAL_LEARNED_KNOWLEDGE) {
        if (!existingIds.has(item.id)) {
          merged.push(item);
          hasNew = true;
        }
      }
      if (hasNew) {
        localStorage.setItem(STORAGE_KEYS.LEARNED_KNOWLEDGE, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
    return INITIAL_LEARNED_KNOWLEDGE;
  } catch {
    return INITIAL_LEARNED_KNOWLEDGE;
  }
}

export function saveLearnedKnowledge(items: LearnedKnowledgeEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LEARNED_KNOWLEDGE, JSON.stringify(items));
  } catch (err) {
    console.warn('Could not save learned knowledge:', err);
  }
}

export function resetToDefaults(): void {
  const defaultEngineersWithPasswords = INITIAL_ENGINEERS.map(e => ({
    ...e,
    password: e.password && String(e.password).trim() ? String(e.password).trim() : DEFAULT_ACCOUNT_PASSWORD
  }));
  localStorage.setItem(STORAGE_KEYS.SOPS, JSON.stringify(INITIAL_SOPS));
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
  localStorage.setItem(STORAGE_KEYS.ENGINEERS, JSON.stringify(defaultEngineersWithPasswords));
  localStorage.setItem(STORAGE_KEYS.ENGINEERS_SEEDED, '1');
  localStorage.setItem(STORAGE_KEYS.ENGINEERS_COMPANY_DEFAULT_SYNCED, '1');
  localStorage.setItem(STORAGE_KEYS.ENGINEERS_DEFAULT_PW_V4, '1');
  localStorage.setItem(STORAGE_KEYS.ENGINEERS_DISPATCH_GRANTED, '1');
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_MAINTENANCE_RECORDS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  localStorage.removeItem(STORAGE_KEYS.REMEMBER_LOGIN);
  localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(SEED_CHAT_SESSIONS));
  localStorage.setItem(STORAGE_KEYS.BULLETINS, JSON.stringify(INITIAL_BULLETINS));
  localStorage.setItem(STORAGE_KEYS.LEARNED_KNOWLEDGE, JSON.stringify(INITIAL_LEARNED_KNOWLEDGE));
  localStorage.setItem(STORAGE_KEYS.RFID_REMOVED_V1, '1');
  localStorage.removeItem(STORAGE_KEYS.REGISTRATION_REQUESTS);
}

export function getStoredRegistrations(): AccountRegistrationRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTRATION_REQUESTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((r: AccountRegistrationRequest) => {
      const role = normalizeStaffRole(r.role);
      return {
        ...r,
        role,
        department: normalizeDepartmentForRole(role)
      };
    });
  } catch {
    return [];
  }
}

export function saveRegistrations(registrations: AccountRegistrationRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTRATION_REQUESTS, JSON.stringify(registrations));
  } catch (err) {
    console.warn('Could not save registration requests:', err);
  }
}

export function processLogoImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP, SVG).'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhẹ hơn.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc tệp hình ảnh.'));
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) {
        reject(new Error('Dữ liệu hình ảnh trống.'));
        return;
      }

      // SVG or compact raster images (<= 120KB) can be kept as-is
      if (file.type === 'image/svg+xml' || file.size <= 120 * 1024) {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Tệp hình ảnh bị lỗi hoặc không được hỗ trợ.'));
      img.onload = () => {
        const maxDim = 400;
        const scale = Math.min(1, maxDim / Math.max(img.width || maxDim, img.height || maxDim));
        const targetW = Math.max(1, Math.round((img.width || maxDim) * scale));
        const targetH = Math.max(1, Math.round((img.height || maxDim) * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}


