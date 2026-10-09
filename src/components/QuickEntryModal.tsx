import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { PaymentMethod } from '../types/finance';
import { parseBnNum, formatBnCurrency, toBnNum } from '../utils/formatters';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'income' | 'expense' | 'debt';
}

type EntryType = 'expense' | 'income' | 'debt';
type DebtKind = 'receivable' | 'payable';

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
}) => {
  const { addTransaction, addPersonalDebt, currentBalance, showToast } = useFinance();

  const [type, setType] = useState<EntryType>(initialType);
  const [debtKind, setDebtKind] = useState<DebtKind>('payable');
  const [personName, setPersonName] = useState('');
  
  // Amount state (stores numeric string in English digits internally for easy manipulation)
  const [rawAmount, setRawAmount] = useState('3450');
  const [showKeypad, setShowKeypad] = useState(true);

  // Selected date
  const [selectedDateOption, setSelectedDateOption] = useState<'today' | 'yesterday' | 'other'>('today');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Categories & Details
  const [category, setCategory] = useState('খাবার');
  const [description, setDescription] = useState('আগোরা সুপারশপ কাঁচাবাজার');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('নগদ');
  const [isSaving, setIsSaving] = useState(false);

  // Reset or preset on open or type change
  useEffect(() => {
    if (!isOpen) return;
    const t = initialType || 'expense';
    setType(t);
    if (t === 'income') {
      setCategory('বেতন');
      setDescription('মাসিক বেতন প্রাপ্তি');
      setRawAmount('35000');
    } else if (t === 'debt') {
      setCategory('দেনা');
      setDescription('জরুরি প্রয়োজন বাবদ ধার');
      setPersonName('রাকিব হাসান');
      setRawAmount('5000');
    } else {
      setCategory('খাবার');
      setDescription('আগোরা সুপারশপ কাঁচাবাজার');
      setRawAmount('3450');
    }
    setSelectedDateOption('today');
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const expenseCategories = [
    { name: 'খাবার', icon: 'restaurant', color: 'bg-orange-50 text-orange-600' },
    { name: 'কাঁচাবাজার', icon: 'shopping_cart', color: 'bg-emerald-50 text-emerald-600' },
    { name: 'যাতায়াত', icon: 'commute', color: 'bg-blue-50 text-blue-600' },
    { name: 'কেনাকাটা', icon: 'shopping_bag', color: 'bg-purple-50 text-purple-600' },
    { name: 'ইউটিলিটি বিল', icon: 'flash_on', color: 'bg-amber-50 text-amber-600' },
    { name: 'চিকিৎসা', icon: 'medical_services', color: 'bg-rose-50 text-rose-600' },
    { name: 'শিক্ষা', icon: 'school', color: 'bg-indigo-50 text-indigo-600' },
    { name: 'বিনোদন', icon: 'sports_esports', color: 'bg-cyan-50 text-cyan-600' },
    { name: 'বাসা ভাড়া', icon: 'home', color: 'bg-sky-50 text-sky-600' },
    { name: 'পরিবার', icon: 'family_restroom', color: 'bg-teal-50 text-teal-600' },
    { name: 'অন্যান্য', icon: 'more_horiz', color: 'bg-gray-50 text-gray-600' },
  ];

  const incomeCategories = [
    { name: 'বেতন', icon: 'corporate_fare', color: 'bg-emerald-50 text-emerald-700' },
    { name: 'ফ্রিল্যান্সিং', icon: 'laptop_mac', color: 'bg-teal-50 text-teal-700' },
    { name: 'ব্যবসা', icon: 'storefront', color: 'bg-blue-50 text-blue-700' },
    { name: 'লাভ/ডিভিডেন্ড', icon: 'trending_up', color: 'bg-indigo-50 text-indigo-700' },
    { name: 'বাড়ি ভাড়া', icon: 'home', color: 'bg-amber-50 text-amber-700' },
    { name: 'উপহার', icon: 'featured_seasonal_and_gifts', color: 'bg-pink-50 text-pink-700' },
    { name: 'বোনাস', icon: 'card_giftcard', color: 'bg-purple-50 text-purple-700' },
    { name: 'অন্যান্য', icon: 'savings', color: 'bg-gray-50 text-gray-700' },
  ];

  const debtCategories = [
    { name: 'ব্যক্তিগত ধার', icon: 'handshake', color: 'bg-amber-50 text-amber-700' },
    { name: 'ব্যাংক লোন', icon: 'account_balance', color: 'bg-blue-50 text-blue-700' },
    { name: 'অফিস অগ্রিম', icon: 'badge', color: 'bg-cyan-50 text-cyan-700' },
    { name: 'পরিবার থেকে', icon: 'diversity_1', color: 'bg-rose-50 text-rose-700' },
    { name: 'অন্যান্য ধার', icon: 'swap_horiz', color: 'bg-gray-50 text-gray-700' },
  ];

  const currentCategories =
    type === 'expense'
      ? expenseCategories
      : type === 'income'
      ? incomeCategories
      : debtCategories;

  // Numeric amount calculation
  const numericAmount = parseFloat(rawAmount) || 0;

  // Keypad Handlers
  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      setRawAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (val === 'clear') {
      setRawAmount('0');
    } else if (val === '00') {
      if (rawAmount !== '0' && rawAmount.length < 9) {
        setRawAmount((prev) => prev + '00');
      }
    } else {
      if (rawAmount === '0') {
        setRawAmount(val);
      } else if (rawAmount.length < 9) {
        setRawAmount((prev) => prev + val);
      }
    }
  };

  // Quick increment chips (+50, +100, +500, +1000, +5000)
  const handleQuickAdd = (increment: number) => {
    const current = parseFloat(rawAmount) || 0;
    setRawAmount(String(current + increment));
  };

  // Save Entry
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) {
      showToast('দয়া করে টাকার পরিমাণ লিখুন', 'error');
      return;
    }

    setIsSaving(true);
    const dateLabel =
      selectedDateOption === 'today'
        ? 'আজ, ০৩ মার্চ'
        : selectedDateOption === 'yesterday'
        ? 'গতকাল, ০২ মার্চ'
        : '০১ মার্চ ২০২৫';

    const dateVal =
      selectedDateOption === 'today'
        ? '2025-03-03'
        : selectedDateOption === 'yesterday'
        ? '2025-03-02'
        : '2025-03-01';

    const selectedCatObj = currentCategories.find((c) => c.name === category);

    setTimeout(() => {
      if (type === 'debt') {
        // Add to personal debts
        addPersonalDebt({
          type: debtKind,
          personName: personName.trim() || 'ব্যক্তিগত ঋণগ্রহীতা/দাতা',
          initialChar: (personName.trim() || 'ঋ')[0],
          amount: numericAmount,
          description: description || `${debtKind === 'payable' ? 'দেনা' : 'পাওনা'} হিসাব`,
          dueDateBn: '১৫ মার্চ ২০২৫',
        });
      } else {
        // Add expense or income transaction
        addTransaction({
          type: type as 'expense' | 'income',
          title: description || `${category} বাবদ`,
          subtitle: `${category} • ${paymentMethod}`,
          amount: numericAmount,
          category,
          categoryIcon:
            selectedCatObj?.icon || (type === 'income' ? 'trending_up' : 'trending_down'),
          date: dateVal,
          dateLabelBn: dateLabel,
          timeBn: 'এইমাত্র',
          paymentMethod,
          notes: description,
        });
      }

      setIsSaving(false);
      onClose();
    }, 350);
  };

  // Dynamic Theme Colors based on Type
  const theme = {
    expense: {
      accent: '#ba1a1a',
      accentBg: '#ffdad6',
      badgeBg: 'bg-[#ffdad6] text-[#93000a]',
      pillActive: 'bg-[#812a00] text-white shadow-md shadow-orange-950/20',
      heroBg: 'bg-gradient-to-b from-[#fff2ed] to-[#ffe8de] border-[#ffcdbc]',
      textColor: 'text-[#812a00]',
      btnBg: 'bg-[#812a00] hover:bg-[#9d3300]',
      title: 'নতুন খরচ হিসাব',
    },
    income: {
      accent: '#005232',
      accentBg: '#9cf5c1',
      badgeBg: 'bg-[#9cf5c1] text-[#003922]',
      pillActive: 'bg-[#005232] text-white shadow-md shadow-emerald-950/20',
      heroBg: 'bg-gradient-to-b from-[#eef9f2] to-[#e0f4e8] border-[#bfe7cf]',
      textColor: 'text-[#005232]',
      btnBg: 'bg-[#005232] hover:bg-[#006840]',
      title: 'নতুন আয় হিসাব',
    },
    debt: {
      accent: '#006874',
      accentBg: '#8feefc',
      badgeBg: 'bg-[#8feefc] text-[#004f58]',
      pillActive: 'bg-[#006874] text-white shadow-md shadow-cyan-950/20',
      heroBg: 'bg-gradient-to-b from-[#edf8fa] to-[#dcf2f5] border-[#bce4ea]',
      textColor: 'text-[#006874]',
      btnBg: 'bg-[#006874] hover:bg-[#00545e]',
      title: 'নতুন ঋণ/ধার হিসাব',
    },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#171d1b]/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-label="Close modal" />

      {/* Material 3 Expressive Bottom Sheet Container */}
      <div className="relative z-10 w-full max-w-lg bg-[#fbfdf9] rounded-t-[32px] shadow-2xl border-t border-white/60 transform transition-transform duration-300 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Top Sheet Grabber / Drag handle */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-[#cfd5d0] rounded-full"></div>
        </div>

        {/* Modal Header */}
        <div className="px-5 pt-1 pb-3 flex items-center justify-between border-b border-[#eaefeb] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${theme.badgeBg}`}>
              <span className="material-symbols-outlined text-[22px]">
                {type === 'expense' ? 'receipt_long' : type === 'income' ? 'savings' : 'handshake'}
              </span>
            </div>
            <div>
              <h3 className="text-[1.25rem] font-bold text-[#171d1b] leading-tight">
                নতুন হিসাব যোগ
              </h3>
              <p className="text-[11px] text-[#6f7a71]">
                {theme.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Date Pill Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="px-2.5 py-1.5 rounded-full bg-[#eaefeb] hover:bg-[#dee4e0] text-[#3f4942] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="তারিখ পরিবর্তন করুন"
              >
                <span className="material-symbols-outlined text-[15px] text-[#006d44]">calendar_today</span>
                <span>
                  {selectedDateOption === 'today'
                    ? 'আজ, ০৩ মার্চ'
                    : selectedDateOption === 'yesterday'
                    ? 'গতকাল, ০২ মার্চ'
                    : '০১ মার্চ ২০২৫'}
                </span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>

              {/* Date Dropdown */}
              {showDatePicker && (
                <div className="absolute right-0 top-9 w-40 bg-white rounded-xl shadow-xl border border-[#eaefeb] py-1 z-30 animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDateOption('today');
                      setShowDatePicker(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-[12px] flex items-center justify-between hover:bg-[#eaefeb] ${
                      selectedDateOption === 'today' ? 'text-[#005232] font-bold bg-[#f5fbf6]' : 'text-[#3f4942]'
                    }`}
                  >
                    <span>আজ (০৩ মার্চ)</span>
                    {selectedDateOption === 'today' && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDateOption('yesterday');
                      setShowDatePicker(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-[12px] flex items-center justify-between hover:bg-[#eaefeb] ${
                      selectedDateOption === 'yesterday' ? 'text-[#005232] font-bold bg-[#f5fbf6]' : 'text-[#3f4942]'
                    }`}
                  >
                    <span>গতকাল (০২ মার্চ)</span>
                    {selectedDateOption === 'yesterday' && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDateOption('other');
                      setShowDatePicker(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-[12px] flex items-center justify-between hover:bg-[#eaefeb] ${
                      selectedDateOption === 'other' ? 'text-[#005232] font-bold bg-[#f5fbf6]' : 'text-[#3f4942]'
                    }`}
                  >
                    <span>পূর্ববর্তী দিন</span>
                    {selectedDateOption === 'other' && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#eaefeb] hover:bg-[#dee4e0] text-[#3f4942] flex items-center justify-center transition-colors cursor-pointer"
              type="button"
              aria-label="বন্ধ করুন"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">

          {/* Segmented Type Switcher (Material 3 Expressive 3-Way) */}
          <div className="p-1 bg-[#eaefeb] rounded-2xl flex items-center gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('খাবার');
                setDescription('কাঁচাবাজার ও খাদ্যদ্রব্য');
              }}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                type === 'expense'
                  ? 'bg-white text-[#812a00] shadow-sm'
                  : 'text-[#6f7a71] hover:text-[#171d1b]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">remove_circle</span>
              <span>− খরচ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('বেতন');
                setDescription('মাসিক বেতন প্রাপ্তি');
              }}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                type === 'income'
                  ? 'bg-white text-[#005232] shadow-sm'
                  : 'text-[#6f7a71] hover:text-[#171d1b]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>+ আয়</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('debt');
                setCategory('ব্যক্তিগত ধার');
                setDescription('ধার হিসাব');
              }}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                type === 'debt'
                  ? 'bg-white text-[#006874] shadow-sm'
                  : 'text-[#6f7a71] hover:text-[#171d1b]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span>⇄ ঋণ/ধার</span>
            </button>
          </div>

          {/* Debt Kind Selection (Visible only when Debt is selected) */}
          {type === 'debt' && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#e0f2fe]/60 rounded-xl border border-sky-200 animate-in fade-in">
              <button
                type="button"
                onClick={() => setDebtKind('payable')}
                className={`py-2 px-3 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  debtKind === 'payable'
                    ? 'bg-[#ba1a1a] text-white shadow-sm'
                    : 'text-[#0369a1] hover:bg-sky-100'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">call_made</span>
                <span>দেনা (অন্যকে দিতে হবে)</span>
              </button>

              <button
                type="button"
                onClick={() => setDebtKind('receivable')}
                className={`py-2 px-3 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  debtKind === 'receivable'
                    ? 'bg-[#006874] text-white shadow-sm'
                    : 'text-[#0369a1] hover:bg-sky-100'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">call_received</span>
                <span>পাওনা (অন্যের কাছে পাবো)</span>
              </button>
            </div>
          )}

          {/* Amount Hero Section */}
          <div className={`p-4 rounded-2xl border text-center transition-all ${theme.heroBg}`}>
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6f7a71]">
                {type === 'expense'
                  ? 'খরচের পরিমাণ'
                  : type === 'income'
                  ? 'আয়ের পরিমাণ'
                  : debtKind === 'payable'
                  ? 'দেনার পরিমাণ'
                  : 'পাওনার পরিমাণ'}
              </span>

              {/* Keypad toggle / Clear */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeypad(!showKeypad)}
                  className="text-[11px] font-semibold text-[#006d44] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {showKeypad ? 'dialpad' : 'keyboard'}
                  </span>
                  <span>{showKeypad ? 'কীপ্যাড চালু' : 'কিবোর্ড মোড'}</span>
                </button>
                {rawAmount !== '0' && (
                  <button
                    type="button"
                    onClick={() => setRawAmount('0')}
                    className="text-[11px] font-semibold text-[#ba1a1a] hover:underline cursor-pointer"
                  >
                    মুছুন
                  </button>
                )}
              </div>
            </div>

            {/* Huge Currency Display */}
            <div className="flex items-center justify-center gap-1.5 py-1">
              <span className={`text-[2rem] font-bold ${theme.textColor}`}>৳</span>
              {showKeypad ? (
                <div
                  className={`text-[2.75rem] font-black tracking-tight leading-none select-none ${theme.textColor}`}
                >
                  {formatBnCurrency(numericAmount)}
                </div>
              ) : (
                <input
                  type="text"
                  value={rawAmount}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setRawAmount(clean || '0');
                  }}
                  className={`text-[2.75rem] font-black tracking-tight leading-none bg-transparent text-center outline-none max-w-[240px] ${theme.textColor}`}
                />
              )}
            </div>

            {/* Real-time Balance Context Indicator */}
            <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-medium text-[#3f4942]">
              <span className="material-symbols-outlined text-[14px] text-[#006d44]">info</span>
              {type === 'expense' ? (
                <span>
                  পরবর্তী অবশিষ্ট ব্যালেন্স: ৳ {formatBnCurrency(Math.max(0, currentBalance - numericAmount))}
                </span>
              ) : type === 'income' ? (
                <span>
                  পরবর্তী নতুন ব্যালেন্স: ৳ {formatBnCurrency(currentBalance + numericAmount)}
                </span>
              ) : (
                <span>
                  {debtKind === 'payable' ? 'দেনা তালিকায় নতুন ঋণ রেকর্ড হবে' : 'পাওনা তালিকায় নতুন প্রাপ্তি রেকর্ড হবে'}
                </span>
              )}
            </div>

            {/* Quick Increment Micro-Chips (+50, +100, +500, +1000, +5000) */}
            <div className="mt-3 flex items-center justify-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[50, 100, 500, 1000, 5000].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => handleQuickAdd(inc)}
                  className="px-2.5 py-1 rounded-full bg-white/80 hover:bg-white text-[#171d1b] font-bold text-[11px] shadow-xs border border-black/5 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  +{toBnNum(inc)}৳
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Bengali Numeric Keypad (Material 3 Touch Keypad) */}
          {showKeypad && (
            <div className="p-2.5 bg-[#eff5f1] rounded-2xl border border-[#dee4e0] shadow-inner">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '১', val: '1' },
                  { label: '২', val: '2' },
                  { label: '৩', val: '3' },
                  { label: '৪', val: '4' },
                  { label: '৫', val: '5' },
                  { label: '৬', val: '6' },
                  { label: '৭', val: '7' },
                  { label: '৮', val: '8' },
                  { label: '৯', val: '9' },
                  { label: '০০', val: '00' },
                  { label: '০', val: '0' },
                  { label: '⌫', val: 'backspace' },
                ].map((keyItem) => {
                  const isBackspace = keyItem.val === 'backspace';
                  return (
                    <button
                      key={keyItem.val}
                      type="button"
                      onClick={() => handleKeypadPress(keyItem.val)}
                      className={`h-11 rounded-xl text-[1.125rem] font-bold flex items-center justify-center active:scale-95 transition-all shadow-xs cursor-pointer ${
                        isBackspace
                          ? 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffcdbc]'
                          : 'bg-white text-[#171d1b] hover:bg-[#fbfdf9]'
                      }`}
                    >
                      {isBackspace ? (
                        <span className="material-symbols-outlined text-[20px]">backspace</span>
                      ) : (
                        keyItem.label
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Selector Carousel / Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-bold text-[#171d1b] flex items-center gap-1">
                <span>ক্যাটাগরি নির্বাচন</span>
                <span className="text-[11px] font-normal text-[#6f7a71]">({currentCategories.length}টি খাত)</span>
              </label>
              <span className="text-[11px] font-bold text-[#006d44] bg-[#eaefeb] px-2 py-0.5 rounded-full">
                বাছাই: {category}
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {currentCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`px-3.5 py-2 rounded-2xl text-[12px] font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? theme.pillActive
                        : 'bg-[#eaefeb] text-[#3f4942] hover:bg-[#dee4e0]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Person Name Input (For Debt) */}
          {type === 'debt' && (
            <div className="animate-in fade-in">
              <label className="text-[12px] font-bold text-[#171d1b] block mb-1">
                ব্যক্তির নাম / প্রতিষ্ঠান
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full bg-[#eaefeb] rounded-xl px-4 py-2.5 pl-10 text-[#171d1b] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#006874]/30 placeholder:text-[#6f7a71]"
                />
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6f7a71] text-[18px]">
                  person
                </span>
              </div>
            </div>
          )}

          {/* Description / Memo Field */}
          <div>
            <label className="text-[12px] font-bold text-[#171d1b] block mb-1">
              বিবরণ বা মেমো
            </label>
            <div className="relative">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="সংক্ষিপ্ত বিবরণ লিখুন..."
                className="w-full bg-[#eaefeb] rounded-xl px-4 py-2.5 pl-10 text-[#171d1b] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#005232]/30 placeholder:text-[#6f7a71]"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6f7a71] text-[18px]">
                edit_note
              </span>
            </div>
          </div>

          {/* Payment Method / Account Selector */}
          <div>
            <label className="text-[12px] font-bold text-[#171d1b] block mb-1.5">
              লেনদেনের মাধ্যম / একাউন্ট
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'নগদ', label: 'নগদ', icon: 'payments' },
                  { id: 'বিকাশ', label: 'বিকাশ', icon: 'account_balance_wallet' },
                  { id: 'ব্যাংক', label: 'ব্যাংক', icon: 'account_balance' },
                  { id: 'কার্ড', label: 'কার্ড', icon: 'credit_card' },
                ] as { id: PaymentMethod; label: string; icon: string }[]
              ).map((method) => {
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-[11px] font-bold cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-white border-[#005232] text-[#005232] shadow-xs ring-1 ring-[#005232]'
                        : 'bg-[#eaefeb] border-transparent text-[#3f4942] hover:bg-[#dee4e0]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] mb-0.5">{method.icon}</span>
                    <span>{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Bottom Fixed Actions */}
        <div className="p-4 bg-white border-t border-[#eaefeb] shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving || numericAmount <= 0}
            className={`w-full py-3.5 rounded-2xl text-white text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${theme.btnBg}`}
            type="button"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[22px]">check_circle</span>
                <span>
                  {type === 'expense'
                    ? `খরচ সংরক্ষণ করুন (৳ ${formatBnCurrency(numericAmount)})`
                    : type === 'income'
                    ? `আয় সংরক্ষণ করুন (৳ ${formatBnCurrency(numericAmount)})`
                    : `ঋণ সংরক্ষণ করুন (৳ ${formatBnCurrency(numericAmount)})`}
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
