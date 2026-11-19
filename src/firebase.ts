import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  query,
  where,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { EngineerProfile, SystemSettings, StaffRole, AdminTabType } from './types';
import { normalizeStaffRole, normalizeDepartmentForRole, getDefaultTabsForRole } from './utils/storage';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const CLOUD_ADMIN_EMAIL = 'qdat1202@gmail.com';
const ENGINEERS_COLLECTION = 'engineers';
const SETTINGS_COLLECTION = 'system_settings';
const SETTINGS_DOC_ID = 'main';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export function isVerifiedCloudAdmin(user: User | null): boolean {
  return Boolean(user && user.emailVerified && user.email === CLOUD_ADMIN_EMAIL);
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

export function subscribeFirebaseAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

function sanitizeDocId(rawId: string, fallbackPrefix: string): string {
  const cleaned = String(rawId || '')
    .trim()
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .slice(0, 128);
  if (cleaned.length >= 2) return cleaned;
  return `${fallbackPrefix}_${Date.now()}`.slice(0, 128);
}

function clampString(val: unknown, maxLen: number, fallback = ''): string {
  const str = typeof val === 'string' ? val.trim() : fallback;
  return str.slice(0, maxLen);
}

export interface CloudEngineerSnapshotMeta {
  ids: Set<string>;
  ownerById: Map<string, string>;
  createdAtById: Map<string, Timestamp | unknown>;
}

function buildEngineerWriteFields(eng: EngineerProfile) {
  const safeId = sanitizeDocId(eng.id, 'ENG');
  const safeRole: StaffRole = normalizeStaffRole(eng.role);
  const safeDept = clampString(eng.department || normalizeDepartmentForRole(safeRole), 80, normalizeDepartmentForRole(safeRole));
  const safeName = clampString(eng.name, 120, 'Nhân sự ADC') || 'Nhân sự ADC';
  const rawPhone = clampString(eng.phone, 32, '0000');
  const safePhone = rawPhone.length >= 4 ? rawPhone : rawPhone.padEnd(4, '0');
  const safeEmail = clampString(eng.email, 160, '');
  const safeStatus: 'available' | 'on_site' | 'off_duty' =
    eng.status === 'on_site' || eng.status === 'off_duty' ? eng.status : 'available';
  const safeTicketsCount = Math.min(10000, Math.max(0, Math.round(Number(eng.activeTicketsCount) || 0)));
  const safeArea = clampString(eng.area, 160, '');
  const safeSpecialties = Array.isArray(eng.specialties)
    ? eng.specialties
        .filter((s) => typeof s === 'string' && s.trim().length > 0)
        .slice(0, 10)
        .map((s) => String(s).trim().slice(0, 64))
    : [];
  const rawTabs = Array.isArray(eng.allowedTabs) && eng.allowedTabs.length > 0
    ? eng.allowedTabs
    : getDefaultTabsForRole(safeRole);
  const safeTabs: string[] = rawTabs
    .filter((t) => typeof t === 'string' && t.trim().length > 0)
    .slice(0, 20)
    .map((t) => String(t).trim().slice(0, 32));
  if (safeTabs.length === 0) {
    safeTabs.push('dispatch');
  }
  const safeUsername = clampString(eng.username, 80, '');

  return {
    id: safeId,
    name: safeName,
    role: safeRole,
    department: safeDept,
    phone: safePhone,
    email: safeEmail,
    status: safeStatus,
    activeTicketsCount: safeTicketsCount,
    area: safeArea,
    specialties: safeSpecialties,
    allowedTabs: safeTabs,
    username: safeUsername
  };
}

export function subscribeEngineersCloud(
  user: User,
  onData: (engineers: EngineerProfile[], meta: CloudEngineerSnapshotMeta) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const isAdminUser = isVerifiedCloudAdmin(user);
  const targetQuery = isAdminUser
    ? collection(db, ENGINEERS_COLLECTION)
    : query(collection(db, ENGINEERS_COLLECTION), where('ownerUid', '==', user.uid));

  return onSnapshot(
    targetQuery,
    (snapshot) => {
      const ids = new Set<string>();
      const ownerById = new Map<string, string>();
      const createdAtById = new Map<string, Timestamp | unknown>();
      const list: EngineerProfile[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const role = normalizeStaffRole(data.role);
        const eng: EngineerProfile = {
          id: typeof data.id === 'string' ? data.id : docSnap.id,
          name: typeof data.name === 'string' ? data.name : 'Nhân sự ADC',
          role,
          department: typeof data.department === 'string' ? data.department : normalizeDepartmentForRole(role),
          phone: typeof data.phone === 'string' ? data.phone : '',
          email: typeof data.email === 'string' ? data.email : '',
          status:
            data.status === 'on_site' || data.status === 'off_duty' ? data.status : 'available',
          activeTicketsCount: typeof data.activeTicketsCount === 'number' ? data.activeTicketsCount : 0,
          area: typeof data.area === 'string' ? data.area : '',
          specialties: Array.isArray(data.specialties) ? data.specialties : [],
          allowedTabs:
            Array.isArray(data.allowedTabs) && data.allowedTabs.length > 0
              ? data.allowedTabs
              : getDefaultTabsForRole(role),
          username: typeof data.username === 'string' && data.username ? data.username : undefined
        };
        ids.add(docSnap.id);
        if (typeof data.ownerUid === 'string') {
          ownerById.set(docSnap.id, data.ownerUid);
        }
        if (data.createdAt !== undefined) {
          createdAtById.set(docSnap.id, data.createdAt);
        }
        list.push(eng);
      });

      onData(list, { ids, ownerById, createdAtById });
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, ENGINEERS_COLLECTION);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function syncEngineersToCloud(
  engineers: EngineerProfile[],
  user: User,
  cloudMeta: CloudEngineerSnapshotMeta | null
): Promise<void> {
  if (!user.emailVerified) {
    throw new Error('Tài khoản Google chưa xác minh email để đồng bộ Cloud.');
  }

  const knownIds = cloudMeta?.ids ?? new Set<string>();
  const nextIds = new Set<string>();
  const batch = writeBatch(db);
  let opCount = 0;

  for (const eng of engineers) {
    const fields = buildEngineerWriteFields(eng);
    nextIds.add(fields.id);
    const ref = doc(db, ENGINEERS_COLLECTION, fields.id);

    if (knownIds.has(fields.id)) {
      const { id: _ignoreId, ...updatableFields } = fields;
      batch.update(ref, {
        ...updatableFields,
        updatedAt: serverTimestamp()
      });
    } else {
      batch.set(ref, {
        ...fields,
        ownerUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    opCount++;
  }

  if (cloudMeta) {
    for (const existingId of cloudMeta.ids) {
      if (!nextIds.has(existingId)) {
        batch.delete(doc(db, ENGINEERS_COLLECTION, existingId));
        opCount++;
      }
    }
  }

  if (opCount === 0) return;

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, ENGINEERS_COLLECTION);
  }
}

export function subscribeSystemSettingsCloud(
  user: User,
  onData: (partialSettings: Partial<SystemSettings> | null, exists: boolean) => void,
  onError: (err: Error) => void
): Unsubscribe {
  if (!isVerifiedCloudAdmin(user)) {
    onData(null, false);
    return () => {};
  }

  const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  return onSnapshot(
    ref,
    (docSnap) => {
      if (!docSnap.exists()) {
        onData(null, false);
        return;
      }
      const data = docSnap.data();
      onData(
        {
          companyName: typeof data.companyName === 'string' ? data.companyName : undefined,
          supportHours: typeof data.supportHours === 'string' ? data.supportHours : undefined,
          dutyEngineerName: typeof data.dutyEngineerName === 'string' ? data.dutyEngineerName : undefined,
          dutyEngineerPhone: typeof data.dutyEngineerPhone === 'string' ? data.dutyEngineerPhone : undefined,
          hotline: typeof data.hotline === 'string' && data.hotline ? data.hotline : undefined,
          hotlineDisplay: typeof data.hotlineDisplay === 'string' && data.hotlineDisplay ? data.hotlineDisplay : undefined,
          zaloNumber: typeof data.zaloNumber === 'string' && data.zaloNumber ? data.zaloNumber : undefined,
          announcement: typeof data.announcement === 'string' && data.announcement ? data.announcement : undefined
        },
        true
      );
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function saveSystemSettingsToCloud(
  settings: SystemSettings,
  user: User,
  existsInCloud: boolean
): Promise<void> {
  if (!isVerifiedCloudAdmin(user)) return;

  const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  const rawDutyPhone = clampString(settings.dutyEngineerPhone, 32, '0968 220 800');
  const safeDutyPhone = rawDutyPhone.length >= 4 ? rawDutyPhone : rawDutyPhone.padEnd(4, '0');
  const payload = {
    companyName: clampString(settings.companyName, 160, 'Công ty Cổ phần Thiết Bị Y Tế ADC') || 'Công ty Cổ phần Thiết Bị Y Tế ADC',
    supportHours: clampString(settings.supportHours, 120, 'Hỗ trợ kỹ thuật trực tuyến 24/7') || 'Hỗ trợ kỹ thuật trực tuyến 24/7',
    dutyEngineerName: clampString(settings.dutyEngineerName, 120, 'Nguyễn Quang Đạt') || 'Nguyễn Quang Đạt',
    dutyEngineerPhone: safeDutyPhone,
    hotline: clampString(settings.hotline, 32, ''),
    hotlineDisplay: clampString(settings.hotlineDisplay, 40, ''),
    zaloNumber: clampString(settings.zaloNumber, 32, ''),
    announcement: clampString(settings.announcement, 500, '')
  };

  try {
    const batch = writeBatch(db);
    if (existsInCloud) {
      batch.update(ref, {
        ...payload,
        updatedAt: serverTimestamp()
      });
    } else {
      batch.set(ref, {
        id: SETTINGS_DOC_ID,
        ...payload,
        ownerUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`);
  }
}
