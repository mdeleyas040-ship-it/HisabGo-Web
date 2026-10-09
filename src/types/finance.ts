export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'নগদ' | 'বিকাশ' | 'কার্ড' | 'ব্যাংক' | 'রকেট';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  subtitle?: string;
  amount: number;
  category: string;
  categoryIcon: string;
  date: string; // e.g. '2025-03-03'
  dateLabelBn: string; // e.g. 'আজ, ০৩ মার্চ'
  timeBn?: string; // e.g. 'সন্ধ্যা ৬:১৫'
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface BankLoan {
  id: string;
  bankName: string;
  accountNumber: string;
  icon: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  monthlyEmi: number;
  repaymentProgressPercent: number;
  nextEmiDateBn: string; // e.g. '১০ মার্চ ২০২৫'
}

export interface PersonalPartyDebt {
  id: string;
  type: 'receivable' | 'payable'; // receivable = পাওনা (পাবো), payable = দেনা (দিতে হবে)
  personName: string;
  initialChar: string;
  amount: number;
  description: string;
  dueDateBn: string;
  phone?: string;
}

export interface ExpenseCategorySummary {
  name: string;
  icon: string;
  percentage: number;
  amount: number;
  colorType: 'tertiary' | 'primary' | 'secondary' | 'outline' | 'error';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeBn: string;
  type: 'alert' | 'info' | 'success';
  read: boolean;
}
