import { Transaction, BankLoan, PersonalPartyDebt, NotificationItem } from './finance';

export const BACKUP_SCHEMA_VERSION = 1;

export interface AppFinancialData {
  transactions: Transaction[];
  bankLoans: BankLoan[];
  personalDebts: PersonalPartyDebt[];
  notifications: NotificationItem[];
  monthlyBudget: number;
}

export interface BackupMetadata {
  appName: 'Hisab Go';
  appVersion: string;
  schemaVersion: number;
  exportedAt: string; // ISO 8601 string
  itemCounts: {
    transactions: number;
    bankLoans: number;
    personalDebts: number;
    notifications: number;
  };
}

export interface HisabGoBackupFile {
  metadata: BackupMetadata;
  data: AppFinancialData;
}

export interface BackupValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  metadata?: BackupMetadata;
  data?: AppFinancialData;
}

export type RestoreStrategy = 'replace' | 'merge';
