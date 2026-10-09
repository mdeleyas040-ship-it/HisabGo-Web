import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatBnCurrency, parseBnNum, toBnNum } from '../utils/formatters';
import { PaymentMethod } from '../types/finance';

export const IncomeView: React.FC = () => {
  const {
    transactions,
    monthIncome,
    addTransaction,
    deleteTransaction,
    showToast,
  } = useFinance();

  const [filterPeriod, setFilterPeriod] = useState<string>('march');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Fast Entry Form States
  const [fastAmount, setFastAmount] = useState<string>('৩৫,০০০');
  const [fastSource, setFastSource] = useState<string>('ফ্রিল্যান্সিং');
  const [fastMethod, setFastMethod] = useState<PaymentMethod>('ব্যাংক');
  const [fastDate] = useState<string>('০৩ মার্চ ২০২৫');
  const [fastNote, setFastNote] = useState<string>('');
  
  // Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const incomeList = transactions.filter((t) => t.type === 'income');

  const filteredIncome = incomeList.filter((item) => {
    if (filterPeriod === 'march' && !item.date.startsWith('2025-03')) return false;
    if (filterPeriod === 'feb' && !item.date.startsWith('2025-02')) return false;
    if (filterPeriod === 'jan' && !item.date.startsWith('2025-01')) return false;

    // Filter by search query (category/source, description/title/subtitle/notes, payment method, amount)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchCat = item.category ? item.category.toLowerCase().includes(q) : false;
      const matchTitle = item.title ? item.title.toLowerCase().includes(q) : false;
      const matchSubtitle = item.subtitle ? item.subtitle.toLowerCase().includes(q) : false;
      const matchNotes = item.notes ? item.notes.toLowerCase().includes(q) : false;
      const matchMethod = item.paymentMethod ? item.paymentMethod.toLowerCase().includes(q) : false;

      // Amount checks (English digits, Bengali digits, formatted currency)
      const amountStrEn = item.amount.toString();
      const amountStrBn = toBnNum(item.amount);
      const formattedBn = formatBnCurrency(item.amount);
      const parsedQueryNum = parseBnNum(q);

      const matchAmount =
        amountStrEn.includes(q) ||
        amountStrBn.includes(q) ||
        formattedBn.includes(q) ||
        (parsedQueryNum > 0 && amountStrEn.includes(parsedQueryNum.toString()));

      if (!(matchCat || matchTitle || matchSubtitle || matchNotes || matchMethod || matchAmount)) {
        return false;
      }
    }

    return true;
  });

  const sourceCategoryIcons: Record<string, string> = {
    বেতন: 'corporate_fare',
    ফ্রিল্যান্সিং: 'laptop_mac',
    ব্যবসা: 'storefront',
    উপহার: 'featured_seasonal_and_gifts',
    ভাড়া: 'home',
    বিনিয়োগ: 'trending_up',
    অন্যান্য: 'payments',
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseBnNum(fastAmount);
    if (!parsed || parsed <= 0) {
      showToast('দয়া করে সঠিক টাকার পরিমাণ লিখুন', 'error');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    setIsSubmitting(true);
    const amountVal = parseBnNum(fastAmount);

    setTimeout(() => {
      addTransaction({
        type: 'income',
        title: fastSource === 'ফ্রিল্যান্সিং' ? 'সফটওয়্যার প্রজেক্ট ফি' : fastSource,
        subtitle: fastNote || `${fastSource} আয় • ${fastMethod}`,
        amount: amountVal,
        category: fastSource,
        categoryIcon: sourceCategoryIcons[fastSource] || 'payments',
        date: '2025-03-03',
        dateLabelBn: 'আজ, ০৩ মার্চ ২০২৫',
        timeBn: 'এইমাত্র',
        paymentMethod: fastMethod,
        notes: fastNote,
      });

      setIsSubmitting(false);
      setShowConfirmModal(false);
      setFastNote('');
    }, 600);
  };

  const allTimeIncome = 285000 + (monthIncome - 85000);
  const targetAmount = 100000;
  const targetPercent = Math.min(100, Math.round((monthIncome / targetAmount) * 100));
  const remainingTarget = Math.max(0, targetAmount - monthIncome);

  return (
    <div className="flex flex-col w-full space-y-4 pb-8 select-none animate-in fade-in duration-300">
      {/* Top Visual Banner & Highlights */}
      <div className="relative overflow-hidden rounded-xl bg-[#eff5f1] p-4 shadow-sm border border-[#dee4e0]">
        <div className="absolute -right-6 -bottom-8 w-28 h-28 rounded-full bg-[#9cf5c1]/30 pointer-events-none"></div>

        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-1.5 text-[#3f4942] text-[12px] font-medium">
            <span className="material-symbols-outlined text-[18px] text-[#005232]">account_balance_wallet</span>
            <span>সার্বিক সঞ্চয় ও আয় স্থিতি</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#9cf5c1] text-[#002111] text-[11px] font-bold">
            চলতি অর্থবছর
          </span>
        </div>

        {/* Total Income Card */}
        <div className="relative z-10">
          <p className="text-[#3f4942] text-[12px]">মোট সর্বমোট আয়</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[1.875rem] font-bold text-[#005232] tracking-tight">
              ৳ {formatBnCurrency(allTimeIncome)}
            </span>
            <span className="text-[#3f4942] text-xs">.০০</span>
          </div>

          {/* Source Distribution Chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-[#171d1b] text-[11px] font-medium shadow-xs border border-[#eaefeb]">
              <span className="w-2 h-2 rounded-full bg-[#005232]"></span>
              <span>চাকরি/বেতন (৭৫%)</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-[#171d1b] text-[11px] font-medium shadow-xs border border-[#eaefeb]">
              <span className="w-2 h-2 rounded-full bg-[#006972]"></span>
              <span>ফ্রিল্যান্সিং (১৫%)</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-[#171d1b] text-[11px] font-medium shadow-xs border border-[#eaefeb]">
              <span className="w-2 h-2 rounded-full bg-[#812a00]"></span>
              <span>বিনিয়োগ (১০%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row with 2 Metrics Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Monthly Income */}
        <div className="rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between border border-[#eaefeb]">
          <div className="w-8 h-8 rounded-lg bg-[#eaefeb] flex items-center justify-center text-[#005232] mb-1.5">
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          </div>
          <div>
            <p className="text-[#3f4942] text-[12px] font-medium">এই মাসের আয়</p>
            <p className="text-[#171d1b] text-[1.125rem] font-bold mt-0.5">
              ৳ {formatBnCurrency(monthIncome)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[#005232] text-[11px] font-semibold mt-1.5">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+১২% বিগত মাসের চেয়ে</span>
          </div>
        </div>

        {/* Monthly Average */}
        <div className="rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between border border-[#eaefeb]">
          <div className="w-8 h-8 rounded-lg bg-[#eaefeb] flex items-center justify-center text-[#006972] mb-1.5">
            <span className="material-symbols-outlined text-[18px]">query_stats</span>
          </div>
          <div>
            <p className="text-[#3f4942] text-[12px] font-medium">গড় মাসিক আয়</p>
            <p className="text-[#171d1b] text-[1.125rem] font-bold mt-0.5">৳ ৭৮,০০০</p>
          </div>
          <div className="flex items-center gap-1 text-[#3f4942] text-[11px] font-medium mt-1.5">
            <span className="material-symbols-outlined text-[14px]">history</span>
            <span>বিগত ৬ মাসের গড়</span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div>
        <button
          onClick={() => {
            const el = document.getElementById('fast-income-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full h-12 bg-[#006d44] text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform hover:bg-[#005232] cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>নতুন আয় যোগ করুন</span>
        </button>
      </div>

      {/* Monthly Income Filter & Trend Bar */}
      <div className="rounded-xl bg-[#eff5f1] p-4 space-y-3 shadow-sm border border-[#dee4e0]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#006972]">tune</span>
            <span className="text-[13px] text-[#171d1b] font-bold">সময়কাল নির্বাচন</span>
          </div>
          <span className="text-[#005232] text-[11px] font-bold">{toBnNum(targetPercent)}% লক্ষ্য পূরণ</span>
        </div>

        {/* Horizontal Scrolling Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {[
            { id: 'march', label: 'এই মাস (মার্চ)' },
            { id: 'feb', label: 'ফেব্রুয়ারি' },
            { id: 'jan', label: 'জানুয়ারি' },
            { id: 'all', label: 'সব উৎস' },
          ].map((chip) => {
            const isActive = filterPeriod === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setFilterPeriod(chip.id)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium shadow-xs whitespace-nowrap cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#005232] text-white font-bold'
                    : 'bg-white text-[#3f4942] hover:bg-[#eaefeb]'
                }`}
                type="button"
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Visual Income Timeline Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#3f4942]">
            <span>মাসিক লক্ষ্যমাত্রা: ৳ ১,০০,০০০</span>
            <span className="text-[#005232] font-semibold">
              {remainingTarget > 0 ? `বাকি ৳ ${formatBnCurrency(remainingTarget)}` : 'লক্ষ্য অর্জিত!'}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#dee4e0] overflow-hidden p-0.5">
            <div
              className="h-full bg-[#006d44] rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, targetPercent)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Income History List (আয়ের ইতিহাস) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-[1.125rem] font-bold text-[#171d1b]">আয়ের ইতিহাস</h2>
          <span className="text-[#006972] text-[12px] font-semibold flex items-center gap-0.5">
            <span>মোট {toBnNum(filteredIncome.length)}টি লেনদেন</span>
          </span>
        </div>

        {/* Search Bar for Income */}
        <div className="relative">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#6f7a71] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="আয় খুঁজুন (উৎস, বিবরণ বা পরিমাণ)..."
              className="w-full pl-9 pr-9 py-2 bg-white rounded-xl border border-[#dee4e0] text-[13px] text-[#171d1b] placeholder:text-[#6f7a71] focus:outline-none focus:border-[#005232] focus:ring-1 focus:ring-[#005232] shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-[#6f7a71] hover:text-[#171d1b] p-0.5 rounded-full hover:bg-[#eaefeb] transition-colors"
                title="মুছে ফেলুন"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="flex items-center justify-between text-[11px] text-[#3f4942] mt-1.5 px-1">
              <span>
                "{searchQuery}" এর জন্য {toBnNum(filteredIncome.length)}টি আয় পাওয়া গেছে
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#005232] hover:underline font-semibold"
              >
                অনুসন্ধান মুছুন
              </button>
            </div>
          )}
        </div>

        {filteredIncome.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-dashed border-[#bec9bf] p-4">
            <span className="material-symbols-outlined text-[36px] text-[#6f7a71]">
              {searchQuery ? 'search_off' : 'savings'}
            </span>
            <p className="text-[13px] font-medium text-[#171d1b] mt-1.5">
              {searchQuery
                ? `"${searchQuery}" এর সাথে মিলে এমন কোনো আয়ের হিসাব পাওয়া যায়নি`
                : 'কোনো আয়ের তথ্য পাওয়া যায়নি'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 bg-[#eaefeb] hover:bg-[#dee4e0] text-[#171d1b] text-[12px] font-medium rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>অনুসন্ধান রিসেট করুন</span>
              </button>
            )}
          </div>
        ) : (
          filteredIncome.map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] text-[#3f4942]">{item.dateLabelBn}</span>
                <span className="text-[11px] text-[#005232] font-semibold">
                  +৳ {formatBnCurrency(item.amount)}
                </span>
              </div>

              <div className="rounded-xl bg-white p-3.5 shadow-sm flex items-center justify-between border border-[#eaefeb] hover:border-[#9cf5c1] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#8feefc] text-[#006d77] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">{item.categoryIcon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#171d1b] text-[14px] font-semibold truncate">{item.title}</p>
                    <p className="text-[#3f4942] text-[12px] truncate">{item.subtitle}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2 flex items-center gap-2">
                  <div>
                    <span className="text-[#005232] text-[14px] font-bold block">
                      + ৳ {formatBnCurrency(item.amount)}
                    </span>
                    <p className="text-[#3f4942] text-[10px]">
                      {item.notes ? 'জমা সম্পন্ন' : 'স্বয়ংক্রিয় জমা'}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteTransaction(item.id)}
                    className="text-[#6f7a71] hover:text-[#ba1a1a] p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
                    title="মুছে ফেলুন"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete_outline</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fast Income Entry Sheet (সহজ আয় অন্তর্ভুক্তি) as shown in Image 6 */}
      <form
        id="fast-income-section"
        onSubmit={handleOpenConfirm}
        className="rounded-xl bg-[#eff5f1] p-4 shadow-sm space-y-3 mt-4 border border-[#dee4e0]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-[#9cf5c1] flex items-center justify-center text-[#005232]">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
            </div>
            <h3 className="text-[1.125rem] font-bold text-[#171d1b]">সহজ আয় অন্তর্ভুক্তি</h3>
          </div>
          <span className="text-[11px] text-[#3f4942] bg-white px-2 py-0.5 rounded-full font-medium">
            দ্রুত ফরম
          </span>
        </div>

        {/* Amount Entry Field */}
        <div className="rounded-xl bg-white p-3.5 shadow-xs space-y-1 border border-[#eaefeb]">
          <label className="text-[#3f4942] text-[11px] font-medium block">
            টাকার পরিমাণ (বাংলা বা ইংরেজি সংখ্যা)
          </label>
          <div className="flex items-baseline justify-between">
            <span className="text-[1.625rem] text-[#005232] font-bold">৳</span>
            <input
              className="w-full text-right bg-transparent text-[#005232] text-[1.625rem] font-bold outline-none placeholder:text-[#bec9bf]"
              placeholder="০.০০"
              type="text"
              value={fastAmount}
              onChange={(e) => setFastAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Income Source Selection Chips */}
        <div className="space-y-1.5">
          <label className="text-[#3f4942] text-[11px] font-semibold block">
            আয়ের উৎস নির্বাচন করুন
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {['বেতন', 'ফ্রিল্যান্সিং', 'ব্যবসা', 'উপহার', 'ভাড়া', 'অন্যান্য'].map((src) => {
              const isSelected = fastSource === src;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => setFastSource(src)}
                  className={`py-2 px-1 rounded-lg text-[13px] font-medium text-center shadow-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#006d44] text-white font-bold'
                      : 'bg-white text-[#171d1b] hover:bg-[#eaefeb]'
                  }`}
                >
                  {src}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Picker & Account Channel */}
        <div className="grid grid-cols-2 gap-2">
          {/* Date Picker */}
          <div className="rounded-xl bg-white p-2.5 shadow-xs space-y-0.5 border border-[#eaefeb]">
            <label className="text-[#3f4942] text-[10px] font-medium block">তারিখ</label>
            <div className="flex items-center justify-between text-[#171d1b] text-[12px] font-semibold">
              <span className="truncate">{fastDate}</span>
              <span className="material-symbols-outlined text-[16px] text-[#006972]">calendar_today</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-xl bg-white p-2.5 shadow-xs space-y-0.5 border border-[#eaefeb]">
            <label className="text-[#3f4942] text-[10px] font-medium block">জমার মাধ্যম</label>
            <div className="flex items-center justify-between text-[#171d1b] text-[12px] font-semibold">
              <span className="truncate">{fastMethod} একাউন্ট</span>
              <span className="material-symbols-outlined text-[16px] text-[#006972]">account_balance</span>
            </div>
          </div>
        </div>

        {/* Quick Method Select Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          {(['ব্যাংক', 'নগদ', 'বিকাশ', 'রকেট'] as PaymentMethod[]).map((m) => {
            const isSelected = fastMethod === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setFastMethod(m)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium shrink-0 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#8feefc] text-[#006d77] font-bold'
                    : 'bg-white text-[#3f4942] hover:bg-[#eaefeb]'
                }`}
              >
                {m === 'নগদ' ? 'নগদ টাকা' : m}
              </button>
            );
          })}
        </div>

        {/* Note Input */}
        <div className="rounded-xl bg-white p-2.5 shadow-xs space-y-0.5 border border-[#eaefeb]">
          <label className="text-[#3f4942] text-[10px] font-medium block">নোট বা বিবরণ (ঐচ্ছিক)</label>
          <input
            className="w-full bg-transparent text-[#171d1b] text-[13px] outline-none placeholder:text-[#bec9bf]"
            placeholder="যেমন: ক্লায়েন্টের বোনাস কিংবা বিবরণী"
            type="text"
            value={fastNote}
            onChange={(e) => setFastNote(e.target.value)}
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full h-12 rounded-xl bg-[#005232] text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform hover:bg-[#006d44] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>সংরক্ষণ করুন</span>
        </button>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#171d1b]/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 rounded-full bg-[#dee4e0] mx-auto"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005232] text-[24px]">
                  account_balance_wallet
                </span>
                <h3 className="text-[1.125rem] text-[#171d1b] font-bold">নতুন আয় নথিভুক্ত করুন</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-8 h-8 rounded-full bg-[#eaefeb] flex items-center justify-center text-[#3f4942] hover:bg-[#dee4e0]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-4 bg-[#eff5f1] rounded-xl space-y-1 text-center border border-[#dee4e0]">
              <span className="text-[#3f4942] text-[11px] font-medium">নিশ্চিত পরিমাণ</span>
              <div className="text-[1.75rem] text-[#005232] font-bold">
                ৳ {formatBnCurrency(parseBnNum(fastAmount))}.০০
              </div>
            </div>

            <div className="space-y-2 text-[#171d1b] text-[13px]">
              <div className="flex justify-between py-1 border-b border-[#eaefeb]">
                <span className="text-[#3f4942]">উৎস</span>
                <span className="font-semibold">{fastSource}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#eaefeb]">
                <span className="text-[#3f4942]">হিসাব মাধ্যম</span>
                <span className="font-semibold">{fastMethod} একাউন্ট</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#eaefeb]">
                <span className="text-[#3f4942]">তারিখ</span>
                <span className="font-semibold">{fastDate}</span>
              </div>
              {fastNote && (
                <div className="flex justify-between py-1">
                  <span className="text-[#3f4942]">নোট</span>
                  <span className="font-semibold truncate max-w-[180px]">{fastNote}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 h-11 rounded-xl bg-[#eaefeb] text-[#171d1b] text-[13px] font-semibold hover:bg-[#dee4e0]"
                type="button"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-[#005232] text-white text-[13px] font-semibold shadow-md hover:bg-[#006d44] flex items-center justify-center gap-1.5"
                type="button"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    <span>সংরক্ষিত হচ্ছে...</span>
                  </>
                ) : (
                  <span>চূড়ান্ত করুন</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
