import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatBnCurrency, parseBnNum, toBnNum } from '../utils/formatters';
import { SetBudgetModal } from './SetBudgetModal';

interface ExpenseViewProps {
  onOpenQuickEntry: () => void;
}

export const ExpenseView: React.FC<ExpenseViewProps> = ({ onOpenQuickEntry }) => {
  const {
    transactions,
    monthExpense,
    monthlyBudget,
    budgetUsedPercent,
    expenseCategories,
    setActiveTab,
    deleteTransaction,
  } = useFinance();

  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  // Filter only expenses
  const expenseList = transactions.filter((t) => t.type === 'expense');

  // Filter based on chips, selected category, and search query
  const filteredExpenses = expenseList.filter((item) => {
    if (selectedCategory && item.category !== selectedCategory) {
      return false;
    }
    if (filterType === 'today') {
      if (!(item.dateLabelBn.includes('আজ') || item.date === '2025-03-03')) {
        return false;
      }
    } else if (filterType === 'large') {
      if (item.amount < 1000) {
        return false;
      }
    }

    // Filter by search query (category, description/title/subtitle/notes, payment method, amount)
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

  // Today's total
  const todayTotal = expenseList
    .filter((i) => i.dateLabelBn.includes('আজ') || i.date === '2025-03-03')
    .reduce((sum, item) => sum + item.amount, 0);

  const todayCount = expenseList.filter(
    (i) => i.dateLabelBn.includes('আজ') || i.date === '2025-03-03'
  ).length;

  return (
    <div className="flex flex-col w-full space-y-4 pb-8 select-none animate-in fade-in duration-300">
      {/* Overview Cards Section */}
      <div className="relative w-full rounded-xl bg-gradient-to-br from-[#005232] via-[#006d44] to-[#006d44] p-4 text-white shadow-md overflow-hidden">
        <div className="absolute -right-6 -bottom-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none blur-2xl"></div>
        <div className="absolute right-3 top-3 w-16 h-16 rounded-full bg-[#9cf5c1]/10 pointer-events-none"></div>

        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-[#9cf5c1]">account_balance_wallet</span>
            </span>
            <span className="text-[12px] text-[#80d8a6] tracking-wide font-medium">
              সর্বমোট খরচের খতিয়ান
            </span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/15 text-[#9cf5c1] font-medium border border-white/10">
            মার্চ ২০২৫
          </span>
        </div>

        <div className="relative z-10 mb-4">
          <span className="text-[12px] text-[#80d8a6] block mb-0.5 font-medium">মোট খরচ</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[1.75rem] font-bold tracking-tight text-white">
              ৳ {formatBnCurrency(158300 + (monthExpense - 32500))}
            </span>
            <span className="text-[12px] text-[#9cf5c1] flex items-center font-medium">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span> ১২% কমেছে
            </span>
          </div>
        </div>

        {/* Sub Cards Grid */}
        <div className="grid grid-cols-2 gap-2 relative z-10">
          <div className="bg-white/15 backdrop-blur-md rounded-lg p-3 flex flex-col justify-between border border-white/10">
            <div className="flex items-center justify-between text-[#80d8a6]">
              <span className="text-[11px] font-medium">এই মাসের খরচ</span>
              <span className="material-symbols-outlined text-[16px] text-[#ffb59a]">trending_down</span>
            </div>
            <div className="mt-1">
              <span className="text-[1.125rem] font-bold text-white">
                ৳ {formatBnCurrency(monthExpense)}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-[#ffdbcf] rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-[10px] text-[#ffdbcf] whitespace-nowrap font-bold">৬৫%</span>
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-lg p-3 flex flex-col justify-between border border-white/10">
            <div className="flex items-center justify-between text-[#80d8a6]">
              <span className="text-[11px] font-medium">আজকের খরচ</span>
              <span className="material-symbols-outlined text-[16px] text-[#92f1fe]">today</span>
            </div>
            <div className="mt-1">
              <span className="text-[1.125rem] font-bold text-white">
                ৳ {formatBnCurrency(todayTotal > 0 ? todayTotal : 4250)}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[11px] text-[#9cf5c1] font-medium">
                  {todayCount > 0 ? `${todayCount}টি সফল লেনদেন` : '৩টি সফল লেনদেন'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Budget Alert Notification Bar */}
      <div
        onClick={() => setBudgetModalOpen(true)}
        className="flex items-start gap-2.5 p-3 rounded-xl bg-[#ffdbcf] text-[#380d00] shadow-sm border border-[#ffb59a]/30 cursor-pointer hover:bg-[#ffcfbe]/80 transition-colors"
        title="বাজেট পরিবর্তন করতে ট্যাপ করুন"
      >
        <div className="w-8 h-8 rounded-full bg-[#a93900] text-white flex items-center justify-center shrink-0 shadow-xs">
          <span className="material-symbols-outlined text-[18px]">warning</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#812a00]">বাজেট সতর্কতা!</span>
            <span className="text-[11px] font-bold text-[#802a00] bg-[#ffcfbe] px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>{toBnNum(budgetUsedPercent)}% পূর্ণ</span>
              <span className="material-symbols-outlined text-[13px]">edit</span>
            </span>
          </div>
          <p className="text-[11px] text-[#802a00] mt-0.5 leading-relaxed">
            মাসিক বাজেট সীমা <span className="font-bold text-[#812a00]">৳ {formatBnCurrency(monthlyBudget)}</span> এর মধ্যে <span className="font-bold text-[#812a00]">৳ {formatBnCurrency(monthExpense)}</span> খরচ হয়েছে।
          </p>
        </div>
      </div>

      {/* Header & Add Button */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-[1.125rem] font-bold text-[#171d1b]">ব্যয় ক্যাটাগরি</h2>
          <p className="text-[12px] text-[#3f4942]">চলতি মাসের খাতভিত্তিক বিশ্লেষণ</p>
        </div>
        <button
          onClick={onOpenQuickEntry}
          className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#812a00] text-white shadow-md active:scale-95 transition-transform hover:bg-[#a93900] cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="text-[13px] font-semibold">+ খরচ যোগ করুন</span>
        </button>
      </div>

      {/* Expense Categories Grid (8 Cards Bento) */}
      <div className="grid grid-cols-2 gap-2.5">
        {expenseCategories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          const bgMap: Record<string, string> = {
            tertiary: 'bg-[#ffdbcf] text-[#812a00]',
            primary: 'bg-[#9cf5c1] text-[#005232]',
            secondary: 'bg-[#8feefc] text-[#006972]',
            outline: 'bg-[#e4e9e5] text-[#3f4942]',
            error: 'bg-[#ffdad6] text-[#ba1a1a]',
          };
          const barMap: Record<string, string> = {
            tertiary: 'bg-[#812a00]',
            primary: 'bg-[#005232]',
            secondary: 'bg-[#006972]',
            outline: 'bg-[#6f7a71]',
            error: 'bg-[#ba1a1a]',
          };

          return (
            <div
              key={cat.name}
              onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
              className={`p-3 rounded-xl bg-white shadow-sm flex flex-col justify-between border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#005232] ring-2 ring-[#9cf5c1] bg-[#f5fbf6]'
                  : 'border-[#eaefeb] hover:border-[#bec9bf]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    bgMap[cat.colorType] || 'bg-[#eaefeb] text-[#171d1b]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    bgMap[cat.colorType]
                  }`}
                >
                  {cat.percentage}%
                </span>
              </div>
              <div>
                <span className="text-[12px] font-medium text-[#171d1b] block truncate">
                  {cat.name}
                </span>
                <span
                  className={`text-[1.125rem] font-bold ${
                    cat.colorType === 'tertiary' ? 'text-[#812a00]' : 'text-[#171d1b]'
                  }`}
                >
                  ৳ {formatBnCurrency(cat.amount)}
                </span>
              </div>
              <div className="w-full bg-[#e4e9e5] h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`${barMap[cat.colorType] || 'bg-[#005232]'} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${cat.percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expense Feed Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[1.125rem] font-bold text-[#171d1b]">দৈনিক খরচের তালিকা</h3>
            {selectedCategory && (
              <span className="text-[11px] bg-[#9cf5c1] text-[#002111] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                {selectedCategory}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory(null);
                  }}
                  className="hover:font-bold"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="text-[12px] text-[#005232] font-semibold flex items-center gap-0.5 hover:underline cursor-pointer"
            type="button"
          >
            রিপোর্ট দেখুন <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2.5">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#6f7a71] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="খরচ খুঁজুন (ক্যাটাগরি, বিবরণ বা পরিমাণ)..."
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
                "{searchQuery}" এর জন্য {toBnNum(filteredExpenses.length)}টি লেনদেন পাওয়া গেছে
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#812a00] hover:underline font-semibold"
              >
                অনুসন্ধান মুছুন
              </button>
            </div>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'all', label: 'সকল খরচ' },
            { id: 'today', label: 'আজকে' },
            { id: 'week', label: 'এই সপ্তাহ' },
            { id: 'month', label: 'এই মাস' },
            { id: 'large', label: 'বড় লেনদেন (>৳১০০০)' },
          ].map((chip) => {
            const isActive = filterType === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setFilterType(chip.id)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium shrink-0 shadow-xs cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#005232] text-white shadow-sm font-semibold'
                    : 'bg-[#eaefeb] text-[#3f4942] hover:bg-[#e4e9e5]'
                }`}
                type="button"
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Grouped Transactions List */}
        <div className="mt-2 space-y-2">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border border-dashed border-[#bec9bf] p-4">
              <span className="material-symbols-outlined text-[36px] text-[#6f7a71]">
                {searchQuery ? 'search_off' : 'receipt_long'}
              </span>
              <p className="text-[13px] font-medium text-[#171d1b] mt-1.5">
                {searchQuery
                  ? `"${searchQuery}" এর সাথে মিলে এমন কোনো খরচ পাওয়া যায়নি`
                  : 'কোনো লেনদেন পাওয়া যায়নি'}
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
            filteredExpenses.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white shadow-sm border border-[#eaefeb] hover:border-[#bec9bf] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">{item.categoryIcon}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[14px] font-semibold text-[#171d1b] truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#3f4942]">
                      <span className="truncate">{item.subtitle || item.category}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 rounded bg-[#eaefeb] text-[10px] font-medium text-[#171d1b]">
                        {item.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2 flex items-center gap-2">
                  <div>
                    <span className="text-[1.125rem] font-bold text-[#812a00] block">
                      -৳ {formatBnCurrency(item.amount)}
                    </span>
                    <span className="text-[10px] text-[#6f7a71]">
                      {item.timeBn || item.dateLabelBn}
                    </span>
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
            ))
          )}
        </div>
      </div>

      {/* Set Budget Modal */}
      <SetBudgetModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
      />
    </div>
  );
};
