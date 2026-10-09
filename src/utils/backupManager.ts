import {
  AppFinancialData,
  BackupMetadata,
  BackupValidationResult,
  HisabGoBackupFile,
  RestoreStrategy,
  BACKUP_SCHEMA_VERSION,
} from '../types/backup';
import { Transaction, BankLoan, PersonalPartyDebt, NotificationItem } from '../types/finance';

const APP_VERSION = '1.2.0';
const MAX_BACKUP_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit for safety
const RECOVERY_SNAPSHOT_KEY = 'hisab_go_pre_restore_snapshot';

/**
 * Creates a structured, versioned backup payload from current application data.
 */
export function createBackupPayload(data: AppFinancialData): HisabGoBackupFile {
  const metadata: BackupMetadata = {
    appName: 'Hisab Go',
    appVersion: APP_VERSION,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    itemCounts: {
      transactions: data.transactions.length,
      bankLoans: data.bankLoans.length,
      personalDebts: data.personalDebts.length,
      notifications: data.notifications.length,
    },
  };

  return {
    metadata,
    data: {
      transactions: data.transactions,
      bankLoans: data.bankLoans,
      personalDebts: data.personalDebts,
      notifications: data.notifications,
      monthlyBudget: data.monthlyBudget,
    },
  };
}

/**
 * Triggers a browser download of the versioned JSON backup file.
 */
export function downloadBackupFile(data: AppFinancialData): void {
  const payload = createBackupPayload(data);
  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  const filename = `HisabGo_Backup_${dateStr}_${timeStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates raw JSON string or parsed object for schema, version, size, and field integrity.
 */
export function validateBackupFile(fileContent: string, fileSize?: number): BackupValidationResult {
  if (fileSize && fileSize > MAX_BACKUP_SIZE_BYTES) {
    return {
      isValid: false,
      error: `ফাইলের আকার অনুমোদিত সীমার বেশি (${(MAX_BACKUP_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB সর্বোচ্চ)।`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fileContent);
  } catch {
    return {
      isValid: false,
      error: 'ফাইলটি সঠিক JSON ফরম্যাটে নেই বা ফাইলটি ত্রুটিপূর্ণ।',
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      isValid: false,
      error: 'ব্যাকআপ ফাইলের গঠন সঠিক নয় (অবজেক্ট পাওয়া যায়নি)।',
    };
  }

  const obj = parsed as Record<string, unknown>;

  // Check top-level keys
  if (!obj.metadata || typeof obj.metadata !== 'object') {
    return {
      isValid: false,
      error: 'ব্যাকআপ ফাইলে প্রয়োজনীয় মেটাডাটা (metadata) অনুপস্থিত।',
    };
  }

  if (!obj.data || typeof obj.data !== 'object') {
    return {
      isValid: false,
      error: 'ব্যাকআপ ফাইলে আর্থিক ডাটা (data) অনুপস্থিত।',
    };
  }

  const meta = obj.metadata as Record<string, unknown>;
  const data = obj.data as Record<string, unknown>;

  // Schema version check
  if (typeof meta.schemaVersion !== 'number') {
    return {
      isValid: false,
      error: 'ব্যাকআপ স্কিমা ভার্সন (schemaVersion) অনুপস্থিত বা ভুল।',
    };
  }

  if (meta.schemaVersion > BACKUP_SCHEMA_VERSION) {
    return {
      isValid: false,
      error: `এই ব্যাকআপ ফাইলটি একটি নতুন ভার্সনে (${meta.schemaVersion}) তৈরি করা। অনুগ্রহ করে অ্যাপ আপডেট করুন।`,
    };
  }

  // Validate data arrays & types
  if (!Array.isArray(data.transactions)) {
    return {
      isValid: false,
      error: 'লেনদেন ডাটা (transactions) অ্যারে ফরম্যাটে নেই।',
    };
  }

  if (!Array.isArray(data.bankLoans)) {
    return {
      isValid: false,
      error: 'ব্যাংক লোন ডাটা (bankLoans) অ্যারে ফরম্যাটে নেই।',
    };
  }

  if (!Array.isArray(data.personalDebts)) {
    return {
      isValid: false,
      error: 'ব্যক্তিগত ঋণ/পাওনা ডাটা (personalDebts) অ্যারে ফরম্যাটে নেই।',
    };
  }

  // Validate transaction items
  for (let i = 0; i < data.transactions.length; i++) {
    const tx = data.transactions[i];
    if (!tx || typeof tx !== 'object' || typeof tx.id !== 'string' || typeof tx.amount !== 'number' || !tx.type) {
      return {
        isValid: false,
        error: `লেনদেন তালিকায় #${i + 1} নম্বর এন্ট্রির ফরম্যাট ত্রুটিপূর্ণ (আইডি, টাকার পরিমাণ বা ধরন ভুল)।`,
      };
    }
  }

  // Validate bank loans
  for (let i = 0; i < data.bankLoans.length; i++) {
    const loan = data.bankLoans[i];
    if (!loan || typeof loan !== 'object' || typeof loan.id !== 'string' || typeof loan.bankName !== 'string') {
      return {
        isValid: false,
        error: `ব্যাংক ঋণ তালিকায় #${i + 1} নম্বর এন্ট্রির ফরম্যাট ত্রুটিপূর্ণ।`,
      };
    }
  }

  // Validate personal debts
  for (let i = 0; i < data.personalDebts.length; i++) {
    const debt = data.personalDebts[i];
    if (!debt || typeof debt !== 'object' || typeof debt.id !== 'string' || typeof debt.personName !== 'string') {
      return {
        isValid: false,
        error: `ব্যক্তিগত দেনা/পাওনা তালিকায় #${i + 1} নম্বর এন্ট্রির ফরম্যাট ত্রুটিপূর্ণ।`,
      };
    }
  }

  const notifications = Array.isArray(data.notifications) ? (data.notifications as NotificationItem[]) : [];
  const monthlyBudget = typeof data.monthlyBudget === 'number' && data.monthlyBudget > 0 ? data.monthlyBudget : 45000;

  const validData: AppFinancialData = {
    transactions: data.transactions as Transaction[],
    bankLoans: data.bankLoans as BankLoan[],
    personalDebts: data.personalDebts as PersonalPartyDebt[],
    notifications,
    monthlyBudget,
  };

  const validMeta: BackupMetadata = {
    appName: (meta.appName as 'Hisab Go') || 'Hisab Go',
    appVersion: (meta.appVersion as string) || '1.0.0',
    schemaVersion: meta.schemaVersion,
    exportedAt: (meta.exportedAt as string) || new Date().toISOString(),
    itemCounts: {
      transactions: validData.transactions.length,
      bankLoans: validData.bankLoans.length,
      personalDebts: validData.personalDebts.length,
      notifications: validData.notifications.length,
    },
  };

  return {
    isValid: true,
    metadata: validMeta,
    data: validData,
  };
}

/**
 * Saves a pre-restore recovery snapshot in localStorage so users can rollback if needed.
 */
export function savePreRestoreSnapshot(currentData: AppFinancialData): void {
  try {
    const payload = createBackupPayload(currentData);
    localStorage.setItem(RECOVERY_SNAPSHOT_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save recovery snapshot:', err);
  }
}

/**
 * Checks if a pre-restore recovery snapshot exists.
 */
export function getPreRestoreSnapshot(): HisabGoBackupFile | null {
  try {
    const item = localStorage.getItem(RECOVERY_SNAPSHOT_KEY);
    if (!item) return null;
    const parsed = JSON.parse(item);
    return parsed as HisabGoBackupFile;
  } catch {
    return null;
  }
}

/**
 * Merges backup data with current data safely without duplicates.
 */
export function mergeFinancialData(
  current: AppFinancialData,
  incoming: AppFinancialData,
  strategy: RestoreStrategy
): AppFinancialData {
  if (strategy === 'replace') {
    return { ...incoming };
  }

  // Merge strategy: Union by id, keeping incoming if updated or preserving both
  const txMap = new Map<string, Transaction>();
  current.transactions.forEach((tx) => txMap.set(tx.id, tx));
  incoming.transactions.forEach((tx) => txMap.set(tx.id, tx));

  const loanMap = new Map<string, BankLoan>();
  current.bankLoans.forEach((loan) => loanMap.set(loan.id, loan));
  incoming.bankLoans.forEach((loan) => loanMap.set(loan.id, loan));

  const debtMap = new Map<string, PersonalPartyDebt>();
  current.personalDebts.forEach((debt) => debtMap.set(debt.id, debt));
  incoming.personalDebts.forEach((debt) => debtMap.set(debt.id, debt));

  const notifMap = new Map<string, NotificationItem>();
  current.notifications.forEach((n) => notifMap.set(n.id, n));
  incoming.notifications.forEach((n) => notifMap.set(n.id, n));

  return {
    transactions: Array.from(txMap.values()),
    bankLoans: Array.from(loanMap.values()),
    personalDebts: Array.from(debtMap.values()),
    notifications: Array.from(notifMap.values()),
    monthlyBudget: incoming.monthlyBudget > 0 ? incoming.monthlyBudget : current.monthlyBudget,
  };
}
