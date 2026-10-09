import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  Transaction,
  BankLoan,
  PersonalPartyDebt,
  NotificationItem,
  ExpenseCategorySummary,
} from '../types/finance';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_BANK_LOANS,
  INITIAL_PERSONAL_DEBTS,
  INITIAL_NOTIFICATIONS,
  EXPENSE_CATEGORIES_DATA,
} from '../data/initialData';
import { AppFinancialData, RestoreStrategy } from '../types/backup';
import {
  downloadBackupFile,
  mergeFinancialData,
  savePreRestoreSnapshot,
  getPreRestoreSnapshot,
} from '../utils/backupManager';
import { auth, googleProvider, checkFirebaseConfig } from '../utils/firebase';
import { uploadUserDataToCloud, fetchUserDataFromCloud } from '../utils/cloudSync';

export type TabType = 'dashboard' | 'income' | 'expense' | 'debts' | 'settings';

interface FinanceContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  bankLoans: BankLoan[];
  addBankLoan: (loan: Omit<BankLoan, 'id'>) => void;
  deleteBankLoan: (id: string) => void;
  payEmiInstallment: (loanId: string) => void;
  personalDebts: PersonalPartyDebt[];
  addPersonalDebt: (debt: Omit<PersonalPartyDebt, 'id'>) => void;
  deletePersonalDebt: (id: string) => void;
  markDebtPaid: (debtId: string) => void;
  notifications: NotificationItem[];
  addNotification: (title: string, message: string, type?: 'alert' | 'info' | 'success') => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  expenseCategories: ExpenseCategorySummary[];
  quickEntryOpen: boolean;
  setQuickEntryOpen: (open: boolean) => void;
  quickEntryType: 'income' | 'expense' | 'debt';
  setQuickEntryType: (type: 'income' | 'expense' | 'debt') => void;
  toast: { message: string; icon: string; visible: boolean };
  showToast: (message: string, icon?: string) => void;
  resetAllData: () => void;
  exportTransactionsCSV: () => void;
  monthlyBudget: number;
  setMonthlyBudget: (amount: number) => void;
  budgetUsedPercent: number;
  budgetRemaining: number;
  isBudgetExceeded90: boolean;
  isBudgetExceeded100: boolean;
  pushNotificationPermission: NotificationPermission | 'unsupported';
  requestPushPermission: () => Promise<boolean>;
  sendBudgetPushNotification: (forceCustomMessage?: string) => void;
  // Backup & Restore
  downloadBackup: () => void;
  restoreFinancialData: (incomingData: AppFinancialData, strategy: RestoreStrategy) => boolean;
  rollbackToSnapshot: () => boolean;
  hasPreRestoreSnapshot: () => boolean;
  // Firebase Auth & Cloud Sync
  currentUser: User | null;
  isCloudSyncing: boolean;
  cloudSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  cloudSyncError: string | null;
  lastCloudSyncTime: string | null;
  firebaseConfigStatus: { isConfigured: boolean; missingKeys: string[] };
  signInWithGoogle: () => Promise<void>;
  signOutFirebase: () => Promise<void>;
  syncWithCloud: () => Promise<void>;
  uploadLocalToCloud: () => Promise<void>;
  downloadCloudToLocal: () => Promise<void>;
  // Computed values
  currentBalance: number;
  monthIncome: number;
  monthExpense: number;
  netSavings: number;
  totalReceivables: number;
  totalPayables: number;
  totalInstitutionalDebt: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('amar_hisab_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [bankLoans, setBankLoans] = useState<BankLoan[]>(() => {
    const saved = localStorage.getItem('amar_hisab_bank_loans');
    return saved ? JSON.parse(saved) : INITIAL_BANK_LOANS;
  });

  const [personalDebts, setPersonalDebts] = useState<PersonalPartyDebt[]>(() => {
    const saved = localStorage.getItem('amar_hisab_personal_debts');
    return saved ? JSON.parse(saved) : INITIAL_PERSONAL_DEBTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('amar_hisab_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(() => {
    const saved = localStorage.getItem('amar_hisab_monthly_budget');
    return saved ? Number(saved) : 45000;
  });

  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  const [quickEntryType, setQuickEntryType] = useState<'income' | 'expense' | 'debt'>('expense');

  const [toast, setToast] = useState<{ message: string; icon: string; visible: boolean }>({
    message: '',
    icon: 'check_circle',
    visible: false,
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('amar_hisab_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('amar_hisab_bank_loans', JSON.stringify(bankLoans));
  }, [bankLoans]);

  useEffect(() => {
    localStorage.setItem('amar_hisab_personal_debts', JSON.stringify(personalDebts));
  }, [personalDebts]);

  useEffect(() => {
    localStorage.setItem('amar_hisab_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('amar_hisab_monthly_budget', monthlyBudget.toString());
  }, [monthlyBudget]);

  const setMonthlyBudget = (amount: number) => {
    const validAmount = Math.max(1000, amount);
    setMonthlyBudgetState(validAmount);
    showToast(`মাসিক খরচের বাজেট ৳ ${validAmount.toLocaleString('en-US')} নির্ধারণ করা হয়েছে`, 'savings');
  };

  const showToast = (message: string, icon = 'check_circle') => {
    setToast({ message, icon, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(
      tx.type === 'income' ? 'নতুন আয় সফলভাবে যুক্ত হয়েছে' : 'নতুন খরচ সফলভাবে যুক্ত হয়েছে',
      tx.type === 'income' ? 'trending_up' : 'trending_down'
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
    showToast('লেনদেন রেকর্ড মুছে ফেলা হয়েছে', 'delete');
  };

  const addBankLoan = (loan: Omit<BankLoan, 'id'>) => {
    const newLoan: BankLoan = {
      ...loan,
      id: `loan-${Date.now()}`,
    };
    setBankLoans((prev) => [newLoan, ...prev]);
    showToast('নতুন ব্যাংক ঋণ হিসাব যুক্ত হয়েছে', 'account_balance');
  };

  const deleteBankLoan = (id: string) => {
    setBankLoans((prev) => prev.filter((l) => l.id !== id));
    showToast('ঋণের হিসাবটি সফলভাবে মুছে ফেলা হয়েছে', 'delete');
  };

  const payEmiInstallment = (loanId: string) => {
    const loan = bankLoans.find((l) => l.id === loanId);
    if (!loan) return;

    const installment = loan.monthlyEmi;
    const newPaid = loan.paidAmount + installment;
    const newRemaining = Math.max(0, loan.remainingAmount - installment);
    const newProgress = Math.min(100, Math.round((newPaid / loan.originalAmount) * 100));

    setBankLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              paidAmount: newPaid,
              remainingAmount: newRemaining,
              repaymentProgressPercent: newProgress,
            }
          : l
      )
    );

    // Also record an expense transaction
    addTransaction({
      type: 'expense',
      title: `${loan.bankName} কিস্তি`,
      subtitle: `মাসিক ইএমআই পরিশোধ • ঋণ ${loan.accountNumber}`,
      amount: installment,
      category: 'ঋণ কিস্তি',
      categoryIcon: 'account_balance',
      date: '2025-03-03',
      dateLabelBn: 'আজ, ০৩ মার্চ',
      timeBn: 'এইমাত্র',
      paymentMethod: 'ব্যাংক',
      notes: 'মাসিক কিস্তি পরিশোধ সম্পন্ন',
    });

    showToast(`${loan.bankName} এর কিস্তি (৳ ${installment}) পরিশোধ করা হয়েছে!`, 'payments');
  };

  const addPersonalDebt = (debt: Omit<PersonalPartyDebt, 'id'>) => {
    const newDebt: PersonalPartyDebt = {
      ...debt,
      id: `debt-${Date.now()}`,
    };
    setPersonalDebts((prev) => [newDebt, ...prev]);
    showToast(
      debt.type === 'receivable' ? 'নতুন পাওনার হিসাব যুক্ত হয়েছে' : 'নতুন দেনার হিসাব যুক্ত হয়েছে',
      debt.type === 'receivable' ? 'call_received' : 'call_made'
    );
  };

  const deletePersonalDebt = (id: string) => {
    setPersonalDebts((prev) => prev.filter((d) => d.id !== id));
    showToast('হিসাবটি মুছে ফেলা হয়েছে', 'delete');
  };

  const markDebtPaid = (debtId: string) => {
    const item = personalDebts.find((d) => d.id === debtId);
    if (!item) return;

    if (item.type === 'payable') {
      // Record payment
      addTransaction({
        type: 'expense',
        title: `${item.personName}-কে দেনা পরিশোধ`,
        subtitle: item.description,
        amount: item.amount,
        category: 'দেনা পরিশোধ',
        categoryIcon: 'handshake',
        date: '2025-03-03',
        dateLabelBn: 'আজ, ০৩ মার্চ',
        timeBn: 'এইমাত্র',
        paymentMethod: 'নগদ',
      });
      showToast(`${item.personName}-কে ৳ ${item.amount} পরিশোধ সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে`, 'done_all');
    } else {
      // Received payment
      addTransaction({
        type: 'income',
        title: `${item.personName} থেকে পাওনা আদায়`,
        subtitle: item.description,
        amount: item.amount,
        category: 'ধার ফেরত',
        categoryIcon: 'handshake',
        date: '2025-03-03',
        dateLabelBn: 'আজ, ০৩ মার্চ',
        timeBn: 'এইমাত্র',
        paymentMethod: 'নগদ',
      });
      showToast(`${item.personName} থেকে ৳ ${item.amount} প্রাপ্তি হিসেবে যোগ করা হয়েছে`, 'done_all');
    }

    setPersonalDebts((prev) => prev.filter((d) => d.id !== debtId));
  };

  const addNotification = (title: string, message: string, type: 'alert' | 'info' | 'success' = 'info') => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timeBn: 'এইমাত্র',
      type,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('সকল বিজ্ঞপ্তি পড়া হয়েছে', 'notifications_active');
  };

  const resetAllData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBankLoans(INITIAL_BANK_LOANS);
    setPersonalDebts(INITIAL_PERSONAL_DEBTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setMonthlyBudgetState(45000);
    localStorage.clear();
    showToast('সকল হিসাব প্রাথমিক অবস্থায় ফিরিয়ে আনা হয়েছে', 'restart_alt');
  };

  // ----------------------------------------------------
  // BACKUP & RESTORE METHODS
  // ----------------------------------------------------
  const downloadBackup = () => {
    try {
      const dataToBackup: AppFinancialData = {
        transactions,
        bankLoans,
        personalDebts,
        notifications,
        monthlyBudget,
      };
      downloadBackupFile(dataToBackup);
      showToast('JSON ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে', 'download');
    } catch (err) {
      console.error('Backup download error:', err);
      showToast('ব্যাকআপ ডাউনলোড করতে ব্যর্থ হয়েছে', 'error');
    }
  };

  const restoreFinancialData = (incomingData: AppFinancialData, strategy: RestoreStrategy): boolean => {
    try {
      // 1. Save safety snapshot of current data before applying changes
      const currentData: AppFinancialData = {
        transactions,
        bankLoans,
        personalDebts,
        notifications,
        monthlyBudget,
      };
      savePreRestoreSnapshot(currentData);

      // 2. Compute final data based on merge or replace strategy
      const finalData = mergeFinancialData(currentData, incomingData, strategy);

      // 3. Atomically update React state
      setTransactions(finalData.transactions);
      setBankLoans(finalData.bankLoans);
      setPersonalDebts(finalData.personalDebts);
      setNotifications(finalData.notifications);
      setMonthlyBudgetState(finalData.monthlyBudget);

      // 4. Save to localStorage
      localStorage.setItem('amar_hisab_transactions', JSON.stringify(finalData.transactions));
      localStorage.setItem('amar_hisab_bank_loans', JSON.stringify(finalData.bankLoans));
      localStorage.setItem('amar_hisab_personal_debts', JSON.stringify(finalData.personalDebts));
      localStorage.setItem('amar_hisab_notifications', JSON.stringify(finalData.notifications));
      localStorage.setItem('amar_hisab_monthly_budget', finalData.monthlyBudget.toString());

      return true;
    } catch (err) {
      console.error('Restore error:', err);
      return false;
    }
  };

  const rollbackToSnapshot = (): boolean => {
    try {
      const snapshot = getPreRestoreSnapshot();
      if (!snapshot || !snapshot.data) {
        showToast('কোনো পূর্বের সেফগার স্ন্যাপশট পাওয়া যায়নি', 'warning');
        return false;
      }

      setTransactions(snapshot.data.transactions);
      setBankLoans(snapshot.data.bankLoans);
      setPersonalDebts(snapshot.data.personalDebts);
      setNotifications(snapshot.data.notifications);
      setMonthlyBudgetState(snapshot.data.monthlyBudget);

      localStorage.setItem('amar_hisab_transactions', JSON.stringify(snapshot.data.transactions));
      localStorage.setItem('amar_hisab_bank_loans', JSON.stringify(snapshot.data.bankLoans));
      localStorage.setItem('amar_hisab_personal_debts', JSON.stringify(snapshot.data.personalDebts));
      localStorage.setItem('amar_hisab_notifications', JSON.stringify(snapshot.data.notifications));
      localStorage.setItem('amar_hisab_monthly_budget', snapshot.data.monthlyBudget.toString());

      showToast('পূর্বের অবস্থায় সফলভাবে রোলব্যাক করা হয়েছে', 'history');
      return true;
    } catch (err) {
      console.error('Rollback error:', err);
      showToast('রোলব্যাক ব্যর্থ হয়েছে', 'error');
      return false;
    }
  };

  const hasPreRestoreSnapshot = (): boolean => {
    return getPreRestoreSnapshot() !== null;
  };

  // ----------------------------------------------------
  // FIREBASE AUTH & CLOUD SYNC STATE & METHODS
  // ----------------------------------------------------
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('hisab_go_last_cloud_sync_time');
  });

  const firebaseConfigStatus = checkFirebaseConfig();

  // Listen to Auth State
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      showToast('ফায়ারবেস অথেনটিকেশন কনফিগার করা নেই', 'warning');
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('গুগল অ্যাকাউন্ট দিয়ে সফলভাবে সাইন-ইন করা হয়েছে', 'verified');
    } catch (err: unknown) {
      console.error('Google Sign In Error:', err);
      const msg = err instanceof Error ? err.message : 'লগইন ব্যর্থ হয়েছে';
      showToast(`লগইন ব্যর্থ: ${msg}`, 'error');
    }
  };

  const signOutFirebase = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      showToast('লগআউট সফল হয়েছে', 'logout');
    } catch (err) {
      console.error('Sign Out Error:', err);
      showToast('লগআউট করতে সমস্যা হয়েছে', 'error');
    }
  };

  const uploadLocalToCloud = async () => {
    if (!currentUser) {
      showToast('প্রথমে গুগল অ্যাকাউন্ট দিয়ে লগইন করুন', 'login');
      return;
    }
    setIsCloudSyncing(true);
    setCloudSyncStatus('syncing');
    setCloudSyncError(null);

    const localData: AppFinancialData = {
      transactions,
      bankLoans,
      personalDebts,
      notifications,
      monthlyBudget,
    };

    const res = await uploadUserDataToCloud(currentUser.uid, localData);
    setIsCloudSyncing(false);

    if (res.success) {
      setCloudSyncStatus('success');
      const now = new Date().toISOString();
      setLastCloudSyncTime(now);
      localStorage.setItem('hisab_go_last_cloud_sync_time', now);
      showToast('ক্লাউডে সকল ডাটা সফলভাবে সংরক্ষিত হয়েছে', 'cloud_done');
    } else {
      setCloudSyncStatus('error');
      setCloudSyncError(res.error || 'ক্লাউড আপলোড ব্যর্থ');
      showToast(res.error || 'ক্লাউড আপলোড ব্যর্থ', 'error');
    }
  };

  const downloadCloudToLocal = async () => {
    if (!currentUser) {
      showToast('প্রথমে গুগল অ্যাকাউন্ট দিয়ে লগইন করুন', 'login');
      return;
    }
    setIsCloudSyncing(true);
    setCloudSyncStatus('syncing');
    setCloudSyncError(null);

    const res = await fetchUserDataFromCloud(currentUser.uid);
    setIsCloudSyncing(false);

    if (res.success && res.data) {
      // Restore through safe merge
      restoreFinancialData(res.data, 'replace');
      setCloudSyncStatus('success');
      const now = new Date().toISOString();
      setLastCloudSyncTime(now);
      localStorage.setItem('hisab_go_last_cloud_sync_time', now);
      showToast('ক্লাউড থেকে সফলভাবে ডাটা সিঙ্ক করা হয়েছে', 'cloud_done');
    } else if (res.success && !res.data) {
      setCloudSyncStatus('idle');
      showToast('ক্লাউডে এখনো কোনো ডাটা পাওয়া যায়নি', 'info');
    } else {
      setCloudSyncStatus('error');
      setCloudSyncError(res.error || 'ক্লাউড ফেচ ব্যর্থ');
      showToast(res.error || 'ক্লাউড ফেচ ব্যর্থ', 'error');
    }
  };

  const syncWithCloud = async () => {
    if (!currentUser) {
      showToast('প্রথমে গুগল অ্যাকাউন্ট দিয়ে লগইন করুন', 'login');
      return;
    }
    setIsCloudSyncing(true);
    setCloudSyncStatus('syncing');
    setCloudSyncError(null);

    // 1. Fetch remote data
    const res = await fetchUserDataFromCloud(currentUser.uid);
    if (!res.success) {
      setIsCloudSyncing(false);
      setCloudSyncStatus('error');
      setCloudSyncError(res.error || 'সিঙ্ক ব্যর্থ');
      showToast(res.error || 'সিঙ্ক ব্যর্থ', 'error');
      return;
    }

    const currentLocal: AppFinancialData = {
      transactions,
      bankLoans,
      personalDebts,
      notifications,
      monthlyBudget,
    };

    if (!res.data) {
      // First time user in cloud, upload local
      const upRes = await uploadUserDataToCloud(currentUser.uid, currentLocal);
      setIsCloudSyncing(false);
      if (upRes.success) {
        setCloudSyncStatus('success');
        const now = new Date().toISOString();
        setLastCloudSyncTime(now);
        localStorage.setItem('hisab_go_last_cloud_sync_time', now);
        showToast('লোকাল ডাটা ক্লাউডে সুরক্ষিত করা হয়েছে', 'cloud_done');
      } else {
        setCloudSyncStatus('error');
        setCloudSyncError(upRes.error || 'আপলোড ব্যর্থ');
      }
      return;
    }

    // Two-way merge
    const merged = mergeFinancialData(currentLocal, res.data, 'merge');
    restoreFinancialData(merged, 'replace');

    // Update cloud with merged version
    const finalUpload = await uploadUserDataToCloud(currentUser.uid, merged);
    setIsCloudSyncing(false);

    if (finalUpload.success) {
      setCloudSyncStatus('success');
      const now = new Date().toISOString();
      setLastCloudSyncTime(now);
      localStorage.setItem('hisab_go_last_cloud_sync_time', now);
      showToast('উভয়মুখী সিঙ্ক্রোনাইজেশন সম্পূর্ণ হয়েছে!', 'cloud_done');
    } else {
      setCloudSyncStatus('error');
      setCloudSyncError(finalUpload.error || 'ক্লাউড আপডেট ব্যর্থ');
    }
  };

  const exportTransactionsCSV = () => {
    if (transactions.length === 0) {
      showToast('রপ্তানি করার মতো কোনো লেনদেন নেই', 'info');
      return;
    }

    const headers = [
      'আইডি (ID)',
      'তারিখ (Date)',
      'ধরন (Type)',
      'শিরোনাম (Title)',
      'ক্যাটাগরি (Category)',
      'পরিমাণ (Amount ৳)',
      'পেমেন্ট মাধ্যম (Payment Method)',
      'নোট (Notes)',
    ];

    const escapeCsv = (str: string | number | undefined) => {
      if (str === undefined || str === null) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = transactions.map((t) => [
      escapeCsv(t.id),
      escapeCsv(t.date || t.dateLabelBn),
      escapeCsv(t.type === 'income' ? 'আয় (Income)' : 'খরচ (Expense)'),
      escapeCsv(t.title),
      escapeCsv(t.category),
      escapeCsv(t.amount),
      escapeCsv(t.paymentMethod),
      escapeCsv(t.notes || t.subtitle || ''),
    ]);

    const csvContent = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    // UTF-8 BOM so Excel opens Bengali characters properly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `HisabGo_Transactions_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('সিএসভি (CSV) ফাইল সফলভাবে ডাউনলোড হয়েছে', 'download_done');
  };

  // Base metrics matching mockup screenshots exactly:
  // Base values from March 2025:
  // Initial Balance = 142500
  // Month Income = 85000
  // Month Expense = 32500
  // Net Savings = 52500
  const initialIncomeSum = INITIAL_TRANSACTIONS.filter((t) => t.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  const initialExpenseSum = INITIAL_TRANSACTIONS.filter((t) => t.type === 'expense').reduce((acc, c) => acc + c.amount, 0);

  const currentIncomeSum = transactions.filter((t) => t.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  const currentExpenseSum = transactions.filter((t) => t.type === 'expense').reduce((acc, c) => acc + c.amount, 0);

  const incomeDelta = currentIncomeSum - initialIncomeSum;
  const expenseDelta = currentExpenseSum - initialExpenseSum;

  const currentBalance = 142500 + incomeDelta - expenseDelta;
  const monthIncome = 85000 + incomeDelta;
  const monthExpense = 32500 + expenseDelta;
  const netSavings = monthIncome - monthExpense;

  const budgetUsedPercent = monthlyBudget > 0 ? Math.round((monthExpense / monthlyBudget) * 100) : 0;
  const budgetRemaining = monthlyBudget - monthExpense;
  const isBudgetExceeded90 = budgetUsedPercent >= 90;
  const isBudgetExceeded100 = budgetUsedPercent >= 100;

  const [pushNotificationPermission, setPushNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('আপনার ব্রাউজারে পুশ নোটিফিকেশন সমর্থিত নয়', 'notifications_off');
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      setPushNotificationPermission(permission);
      if (permission === 'granted') {
        showToast('পুশ নোটিফিকেশন সফলভাবে সক্রিয় করা হয়েছে!', 'notifications_active');
        if (isBudgetExceeded90) {
          sendBudgetPushNotification();
        }
        return true;
      } else if (permission === 'denied') {
        showToast('ব্রাউজারে নোটিফিকেশন অনুমতি প্রত্যাখ্যান করা হয়েছে', 'notifications_off');
        return false;
      }
      return false;
    } catch {
      showToast('নোটিফিকেশন অনুমতি চাইতে ব্যর্থ হয়েছে', 'error');
      return false;
    }
  };

  const sendBudgetPushNotification = (forceCustomMessage?: string) => {
    const title = isBudgetExceeded100
      ? '🚨 Hisab Go: বাজেট সীমা অতিক্রম করেছে!'
      : isBudgetExceeded90
      ? '⚠️ Hisab Go: মাসিক বাজেটের ৯০% খরচ সম্পন্ন!'
      : '📊 Hisab Go: বাজেট স্থিতি নোটিফিকেশন';

    const body =
      forceCustomMessage ||
      (isBudgetExceeded100
        ? `মাসিক বাজেট ৳ ${monthlyBudget.toLocaleString('en-US')} ছাড়িয়ে মোট ব্যয় ৳ ${monthExpense.toLocaleString('en-US')} (${budgetUsedPercent}%) হয়েছে!`
        : `মাসিক বাজেটের ${budgetUsedPercent}% খরচ হয়েছে। অবশিষ্ট আছে মাত্র ৳ ${Math.max(0, budgetRemaining).toLocaleString('en-US')}।`);

    // Vibration on supported mobile devices
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch {
        // ignore
      }
    }

    // Native Browser Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://lh3.googleusercontent.com/aida/AEtjO1WHoXSD2WJchPQiFLjtkFoudMCtqbWe2hXIR0t-eOnt0tc8KEc8JSq9cqRD9loya6P77eeymHGYQSe2KhcFz0ltfZVNRbEUSInfKxMxEV_X2OBQKFCpH3xqbDpc3XE8nDI0rEs_HaO6NYw6MaJXffQ_oSvkmjkJCy0cS6534K4bTJ415nS4OSujDv9EEEA3MM_svGc1WiDZBMa0uYMBjfXdPFOSjIiPfYNfNCbVwt7aNLcj759FQFBj9kQ',
        });
      } catch (err) {
        console.warn('Browser notification error:', err);
      }
    }

    // In-app notification list
    addNotification(title, body, 'alert');
    showToast('বাজেট সতর্কবার্তা নোটিফিকেশন পাঠানো হয়েছে', 'notifications_active');
  };

  // Monitor budget 90% and 100% threshold automatically
  useEffect(() => {
    if (isBudgetExceeded90) {
      const alertKey = isBudgetExceeded100
        ? `hisab_go_alert_100_${monthlyBudget}_${Math.floor(monthExpense / 1000)}`
        : `hisab_go_alert_90_${monthlyBudget}_${Math.floor(monthExpense / 1000)}`;

      const alreadySent = sessionStorage.getItem(alertKey);
      if (!alreadySent) {
        sessionStorage.setItem(alertKey, 'true');

        const title = isBudgetExceeded100
          ? '🚨 বাজেট সীমা অতিক্রান্ত হয়েছে!'
          : '⚠️ বাজেট সতর্কতা: ৯০% খরচ সম্পন্ন!';
        const message = isBudgetExceeded100
          ? `আপনার নির্ধারিত মাসিক বাজেট (৳ ${monthlyBudget.toLocaleString('en-US')}) অতিক্রম করে খরচ হয়েছে ৳ ${monthExpense.toLocaleString('en-US')} (${budgetUsedPercent}%)।`
          : `আপনার মাসিক বাজেটের ${budgetUsedPercent}% ব্যয় হয়ে গেছে। বাকি আছে মাত্র ৳ ${Math.max(0, budgetRemaining).toLocaleString('en-US')}।`;

        addNotification(title, message, 'alert');

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(title, {
              body: message,
              icon: 'https://lh3.googleusercontent.com/aida/AEtjO1WHoXSD2WJchPQiFLjtkFoudMCtqbWe2hXIR0t-eOnt0tc8KEc8JSq9cqRD9loya6P77eeymHGYQSe2KhcFz0ltfZVNRbEUSInfKxMxEV_X2OBQKFCpH3xqbDpc3XE8nDI0rEs_HaO6NYw6MaJXffQ_oSvkmjkJCy0cS6534K4bTJ415nS4OSujDv9EEEA3MM_svGc1WiDZBMa0uYMBjfXdPFOSjIiPfYNfNCbVwt7aNLcj759FQFBj9kQ',
            });
          } catch {
            // ignore
          }
        }
      }
    }
  }, [isBudgetExceeded90, isBudgetExceeded100, budgetUsedPercent, monthExpense, monthlyBudget, budgetRemaining]);

  const totalReceivables = personalDebts
    .filter((d) => d.type === 'receivable')
    .reduce((acc, c) => acc + c.amount, 0);

  const totalPayables = personalDebts
    .filter((d) => d.type === 'payable')
    .reduce((acc, c) => acc + c.amount, 0);

  const totalInstitutionalDebt = bankLoans.reduce((acc, c) => acc + c.remainingAmount, 0);

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        transactions,
        addTransaction,
        deleteTransaction,
        bankLoans,
        addBankLoan,
        deleteBankLoan,
        payEmiInstallment,
        personalDebts,
        addPersonalDebt,
        deletePersonalDebt,
        markDebtPaid,
        notifications,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        expenseCategories: EXPENSE_CATEGORIES_DATA,
        quickEntryOpen,
        setQuickEntryOpen,
        quickEntryType,
        setQuickEntryType,
        toast,
        showToast,
        resetAllData,
        exportTransactionsCSV,
        monthlyBudget,
        setMonthlyBudget,
        budgetUsedPercent,
        budgetRemaining,
        isBudgetExceeded90,
        isBudgetExceeded100,
        pushNotificationPermission,
        requestPushPermission,
        sendBudgetPushNotification,
        // Backup & Restore
        downloadBackup,
        restoreFinancialData,
        rollbackToSnapshot,
        hasPreRestoreSnapshot,
        // Firebase Auth & Cloud Sync
        currentUser,
        isCloudSyncing,
        cloudSyncStatus,
        cloudSyncError,
        lastCloudSyncTime,
        firebaseConfigStatus,
        signInWithGoogle,
        signOutFirebase,
        syncWithCloud,
        uploadLocalToCloud,
        downloadCloudToLocal,
        currentBalance,
        monthIncome,
        monthExpense,
        netSavings,
        totalReceivables,
        totalPayables,
        totalInstitutionalDebt,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
