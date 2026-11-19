/**
 * Phase 0 Security Verification Suite for /engineers/{engineerId}, /system_settings/{settingId},
 * /sop_articles/{sopId}, and /sop_pdf_chunks/{chunkId}.
 * Validates that every "Dirty Dozen" adversarial payload violates the security contract and would
 * receive PERMISSION_DENIED under firestore.rules.
 */

export interface MockAuthContext {
  uid: string;
  email?: string;
  email_verified?: boolean;
}

const ADMIN_EMAIL = 'qdat1202@gmail.com';
const VALID_ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
const VALID_ROLES = ['director', 'css', 'warehouse', 'sales', 'field_engineer'] as const;
const VALID_STATUSES = ['available', 'on_site', 'off_duty'] as const;
const VALID_MODELS = ['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'] as const;
const VALID_CATEGORIES = [
  'Cơ khí & Kim hút',
  'Quang học & Cảm biến',
  'Hóa chất & Buồng đếm',
  'Điện tử & Nhiệt độ',
  'Phần mềm & Kết nối'
] as const;

const ENGINEER_REQUIRED_KEYS = [
  'id', 'name', 'role', 'department', 'phone', 'email', 'status',
  'activeTicketsCount', 'area', 'specialties', 'allowedTabs',
  'ownerUid', 'createdAt', 'updatedAt'
];
const ENGINEER_ALLOWED_KEYS = [...ENGINEER_REQUIRED_KEYS, 'username'];

const SOP_REQUIRED_KEYS = [
  'id', 'equipmentModel', 'category', 'errorCode', 'title',
  'symptom', 'rootCause', 'resolutionSteps', 'safetyWarnings',
  'updatedAtDate', 'ownerUid', 'createdAt', 'updatedAt'
];
const SOP_ALLOWED_KEYS = [
  ...SOP_REQUIRED_KEYS,
  'componentLocation', 'isCommon', 'sourceFile', 'pdfAttachment'
];

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && VALID_ID_REGEX.test(id);
}

function isVerifiedUser(auth: MockAuthContext | null): auth is MockAuthContext {
  return auth !== null && auth.email_verified === true;
}

function isAdmin(auth: MockAuthContext | null): boolean {
  return isVerifiedUser(auth) && auth.email === ADMIN_EMAIL;
}

function isValidEngineerPayload(data: Record<string, unknown>, docId: string): boolean {
  const keys = Object.keys(data);
  if (!ENGINEER_REQUIRED_KEYS.every((k) => keys.includes(k))) return false;
  if (!keys.every((k) => ENGINEER_ALLOWED_KEYS.includes(k))) return false;
  if (!isValidId(data.id) || data.id.length < 2 || data.id !== docId) return false;
  if (typeof data.name !== 'string' || data.name.length < 1 || data.name.length > 120) return false;
  if (typeof data.role !== 'string' || !VALID_ROLES.includes(data.role as (typeof VALID_ROLES)[number])) return false;
  if (typeof data.department !== 'string' || data.department.length < 1 || data.department.length > 80) return false;
  if (typeof data.phone !== 'string' || data.phone.length < 4 || data.phone.length > 32) return false;
  if (typeof data.email !== 'string' || data.email.length > 160) return false;
  if (typeof data.status !== 'string' || !VALID_STATUSES.includes(data.status as (typeof VALID_STATUSES)[number])) return false;
  if (typeof data.activeTicketsCount !== 'number' || data.activeTicketsCount < 0 || data.activeTicketsCount > 10000) return false;
  if (typeof data.area !== 'string' || data.area.length > 160) return false;
  if (!Array.isArray(data.specialties) || data.specialties.length > 10) return false;
  if (data.specialties.length > 0 && (typeof data.specialties[0] !== 'string' || data.specialties[0].length > 64)) return false;
  if (!Array.isArray(data.allowedTabs) || data.allowedTabs.length < 1 || data.allowedTabs.length > 20) return false;
  if (typeof data.allowedTabs[0] !== 'string' || data.allowedTabs[0].length > 32) return false;
  if ('username' in data && (typeof data.username !== 'string' || data.username.length > 80)) return false;
  if (!isValidId(data.ownerUid)) return false;
  return true;
}

function isValidSOPPayload(data: Record<string, unknown>, docId: string): boolean {
  const keys = Object.keys(data);
  if (!SOP_REQUIRED_KEYS.every((k) => keys.includes(k))) return false;
  if (!keys.every((k) => SOP_ALLOWED_KEYS.includes(k))) return false;
  if (!isValidId(data.id) || data.id.length < 2 || data.id !== docId) return false;
  if (typeof data.equipmentModel !== 'string' || !VALID_MODELS.includes(data.equipmentModel as (typeof VALID_MODELS)[number])) return false;
  if (typeof data.category !== 'string' || !VALID_CATEGORIES.includes(data.category as (typeof VALID_CATEGORIES)[number])) return false;
  if (typeof data.errorCode !== 'string' || data.errorCode.length > 40) return false;
  if (typeof data.title !== 'string' || data.title.length < 1 || data.title.length > 240) return false;
  if (typeof data.symptom !== 'string' || data.symptom.length > 2000) return false;
  if (typeof data.rootCause !== 'string' || data.rootCause.length > 2000) return false;
  if (!Array.isArray(data.resolutionSteps) || data.resolutionSteps.length > 40) return false;
  if (!Array.isArray(data.safetyWarnings) || data.safetyWarnings.length > 20) return false;
  if (typeof data.updatedAtDate !== 'string' || data.updatedAtDate.length > 32) return false;
  if (!isValidId(data.ownerUid)) return false;
  return true;
}

export function simulateEngineerWrite(
  op: 'create' | 'update',
  auth: MockAuthContext | null,
  docId: string,
  incoming: Record<string, unknown>,
  serverTimeSentinel: symbol,
  existing?: Record<string, unknown>
): 'ALLOW' | 'PERMISSION_DENIED' {
  if (!isVerifiedUser(auth) || !isValidId(docId)) return 'PERMISSION_DENIED';
  if (!isValidEngineerPayload(incoming, docId)) return 'PERMISSION_DENIED';

  if (op === 'create') {
    if (incoming.ownerUid !== auth.uid) return 'PERMISSION_DENIED';
    if (incoming.createdAt !== serverTimeSentinel || incoming.updatedAt !== serverTimeSentinel) return 'PERMISSION_DENIED';
    if (!isAdmin(auth) && incoming.role !== 'field_engineer') return 'PERMISSION_DENIED';
    return 'ALLOW';
  }

  if (!existing) return 'PERMISSION_DENIED';
  if (incoming.ownerUid !== existing.ownerUid || incoming.createdAt !== existing.createdAt) return 'PERMISSION_DENIED';
  if (incoming.updatedAt !== serverTimeSentinel) return 'PERMISSION_DENIED';

  const changedKeys = Object.keys(incoming).filter((k) => JSON.stringify(incoming[k]) !== JSON.stringify(existing[k]));
  if (isAdmin(auth)) {
    const adminAllowed = new Set(['name', 'role', 'department', 'phone', 'email', 'status', 'activeTicketsCount', 'area', 'specialties', 'allowedTabs', 'username', 'updatedAt']);
    return changedKeys.every((k) => adminAllowed.has(k)) ? 'ALLOW' : 'PERMISSION_DENIED';
  }
  if (existing.ownerUid === auth.uid) {
    const ownerAllowed = new Set(['status', 'activeTicketsCount', 'updatedAt']);
    return changedKeys.every((k) => ownerAllowed.has(k)) ? 'ALLOW' : 'PERMISSION_DENIED';
  }
  return 'PERMISSION_DENIED';
}

export function simulateSOPWrite(
  op: 'create' | 'update',
  auth: MockAuthContext | null,
  docId: string,
  incoming: Record<string, unknown>,
  serverTimeSentinel: symbol,
  existing?: Record<string, unknown>
): 'ALLOW' | 'PERMISSION_DENIED' {
  if (!isVerifiedUser(auth) || !isValidId(docId)) return 'PERMISSION_DENIED';
  if (!isValidSOPPayload(incoming, docId)) return 'PERMISSION_DENIED';

  if (op === 'create') {
    if (incoming.ownerUid !== auth.uid) return 'PERMISSION_DENIED';
    if (incoming.createdAt !== serverTimeSentinel || incoming.updatedAt !== serverTimeSentinel) return 'PERMISSION_DENIED';
    return 'ALLOW';
  }

  if (!existing) return 'PERMISSION_DENIED';
  if (incoming.ownerUid !== existing.ownerUid || incoming.createdAt !== existing.createdAt) return 'PERMISSION_DENIED';
  if (incoming.updatedAt !== serverTimeSentinel) return 'PERMISSION_DENIED';
  if (!isAdmin(auth) && existing.ownerUid !== auth.uid) return 'PERMISSION_DENIED';

  const changedKeys = Object.keys(incoming).filter((k) => JSON.stringify(incoming[k]) !== JSON.stringify(existing[k]));
  const allowedUpdate = new Set([
    'equipmentModel', 'category', 'errorCode', 'title', 'symptom', 'rootCause',
    'resolutionSteps', 'safetyWarnings', 'componentLocation', 'isCommon',
    'sourceFile', 'pdfAttachment', 'updatedAtDate', 'updatedAt'
  ]);
  return changedKeys.every((k) => allowedUpdate.has(k)) ? 'ALLOW' : 'PERMISSION_DENIED';
}

export function simulateEngineerRead(
  auth: MockAuthContext | null,
  existing: Record<string, unknown>
): 'ALLOW' | 'PERMISSION_DENIED' {
  if (!isVerifiedUser(auth)) return 'PERMISSION_DENIED';
  if (isAdmin(auth) || existing.ownerUid === auth.uid) return 'ALLOW';
  return 'PERMISSION_DENIED';
}

export function runDirtyDozenAssertions(): { passed: number; failed: number } {
  const SERVER_TIME = Symbol('request.time');
  const adminAuth: MockAuthContext = { uid: 'admin_uid_1', email: ADMIN_EMAIL, email_verified: true };
  const otherAuth: MockAuthContext = { uid: 'user_uid_2', email: 'other@example.com', email_verified: true };
  const baseDoc = {
    id: 'ENG-001',
    name: 'KS. Nguyễn Quang Đạt',
    role: 'field_engineer',
    department: 'Phòng Kỹ Thuật',
    phone: '0968220800',
    email: 'dat.nq@adctbyt.vn',
    status: 'available',
    activeTicketsCount: 0,
    area: 'Hà Nội',
    specialties: ['Zybio Z50'],
    allowedTabs: ['dispatch'],
    ownerUid: 'admin_uid_1',
    createdAt: SERVER_TIME,
    updatedAt: SERVER_TIME
  };
  const baseSop = {
    id: 'SOP-EXC-001',
    equipmentModel: 'Zybio EXC200/220',
    category: 'Cơ khí & Kim hút',
    errorCode: 'E101',
    title: 'Xử lý va chạm kim hút',
    symptom: 'Kim hút báo lỗi E101',
    rootCause: 'Lệch trục Z',
    resolutionSteps: ['Bước 1: Kiểm tra trục Z'],
    safetyWarnings: ['Đeo găng tay y tế'],
    updatedAtDate: '2026-11-18',
    ownerUid: 'admin_uid_1',
    createdAt: SERVER_TIME,
    updatedAt: SERVER_TIME
  };

  const cases: Array<[string, 'ALLOW' | 'PERMISSION_DENIED', 'ALLOW' | 'PERMISSION_DENIED']> = [
    ['1. Unauthenticated read', simulateEngineerRead(null, baseDoc), 'PERMISSION_DENIED'],
    ['2. Unverified admin email spoof', simulateEngineerWrite('create', { uid: 'spoof', email: ADMIN_EMAIL, email_verified: false }, 'ENG-001', { ...baseDoc, ownerUid: 'spoof' }, SERVER_TIME), 'PERMISSION_DENIED'],
    ['3. Cross-tenant PII read', simulateEngineerRead(otherAuth, baseDoc), 'PERMISSION_DENIED'],
    ['4. Shadow field injection', simulateEngineerWrite('create', adminAuth, 'ENG-001', { ...baseDoc, isSuperAdmin: true }, SERVER_TIME), 'PERMISSION_DENIED'],
    ['5. Identity spoofing on create', simulateEngineerWrite('create', otherAuth, 'ENG-001', { ...baseDoc, ownerUid: 'admin_uid_1' }, SERVER_TIME), 'PERMISSION_DENIED'],
    ['6. Immortal ownerUid tampering', simulateEngineerWrite('update', adminAuth, 'ENG-001', { ...baseDoc, ownerUid: 'user_uid_2' }, SERVER_TIME, baseDoc), 'PERMISSION_DENIED'],
    ['7. Client timestamp forgery', simulateEngineerWrite('create', adminAuth, 'ENG-001', { ...baseDoc, createdAt: '2026-01-01T00:00:00Z' }, SERVER_TIME), 'PERMISSION_DENIED'],
    ['8. Role privilege escalation', simulateEngineerWrite('create', otherAuth, 'ENG-002', { ...baseDoc, id: 'ENG-002', role: 'director', ownerUid: 'user_uid_2' }, SERVER_TIME), 'PERMISSION_DENIED'],
    ['9. ID poisoning (>128 chars)', simulateEngineerWrite('create', adminAuth, 'A'.repeat(130), { ...baseDoc, id: 'A'.repeat(130) }, SERVER_TIME), 'PERMISSION_DENIED'],
    ['10. Path/payload ID mismatch (SOP)', simulateSOPWrite('create', adminAuth, 'SOP-EXC-001', { ...baseSop, id: 'SOP-OTHER' }, SERVER_TIME), 'PERMISSION_DENIED'],
    ['11. Oversized array denial-of-wallet (SOP)', simulateSOPWrite('create', adminAuth, 'SOP-EXC-001', { ...baseSop, resolutionSteps: Array(45).fill('Step') }, SERVER_TIME), 'PERMISSION_DENIED'],
    ['12. Enum poisoning on SOP write', simulateSOPWrite('create', adminAuth, 'SOP-EXC-001', { ...baseSop, equipmentModel: 'UnknownModel' }, SERVER_TIME), 'PERMISSION_DENIED']
  ];

  let passed = 0;
  let failed = 0;
  for (const [label, actual, expected] of cases) {
    if (actual === expected) {
      passed++;
    } else {
      failed++;
      console.error(`FAILED: ${label} -> expected ${expected}, got ${actual}`);
    }
  }
  return { passed, failed };
}
