import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { formatBnCurrency, toBnNum } from '../utils/formatters';
import { SetBudgetModal } from './SetBudgetModal';
import { BudgetWarningBanner } from './BudgetWarningBanner';

interface DashboardViewProps {
  onOpenQuickEntry: (type?: 'income' | 'expense' | 'debt') => void;
  onOpenSetBudget?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenQuickEntry,
  onOpenSetBudget,
}) => {
  const {
    currentBalance,
    monthIncome,
    monthExpense,
    netSavings,
    totalInstitutionalDebt,
    totalReceivables,
    totalPayables,
    transactions,
    setActiveTab,
    bankLoans,
    personalDebts,
    monthlyBudget,
    budgetUsedPercent,
    budgetRemaining,
    expenseCategories,
  } = useFinance();

  const [localBudgetModalOpen, setLocalBudgetModalOpen] = useState(false);
  const [chartViewMode, setChartViewMode] = useState<'trends' | 'weekly'>('trends');

  const handleOpenBudgetModal = () => {
    if (onOpenSetBudget) {
      onOpenSetBudget();
    } else {
      setLocalBudgetModalOpen(true);
    }
  };

  // 6-Month Income & Spending Trend Data
  const monthlyTrendsData = [
    { month: 'অক্টোবর', income: 70000, expense: 28000 },
    { month: 'নভেম্বর', income: 75000, expense: 30500 },
    { month: 'ডিসেম্বর', income: 80000, expense: 35000 },
    { month: 'জানুয়ারি', income: 72000, expense: 29000 },
    { month: 'ফেব্রুয়ারি', income: 78000, expense: 31000 },
    { month: 'মার্চ', income: monthIncome, expense: monthExpense },
  ];

  // Category Expenses Pie Chart Data (খাতভিত্তিক ব্যয় বন্টন)
  const categoryPalette = [
    '#a93900', // খাবার ও রেস্তোরাঁ
    '#005232', // বাসা ভাড়া ও মেরামত
    '#006972', // যাতায়াত ও জ্বালানি
    '#d97706', // পরিবার ও সন্তান
    '#ba1a1a', // চিকিৎসা ও ওষুধ
    '#0284c7', // কেনাকাটা ও পোশাক
    '#059669', // ইউটিলিটি বিল
    '#6f7a71', // অন্যান্য ব্যয়
  ];

  const categoryPieData = expenseCategories.map((c, index) => ({
    name: c.name,
    value: c.amount,
    percentage: c.percentage,
    icon: c.icon,
    color: categoryPalette[index % categoryPalette.length],
  }));

  const totalCategoryExpenseSum = categoryPieData.reduce((acc, curr) => acc + curr.value, 0);

  // Get 5 latest transactions
  const latestTransactions = transactions.slice(0, 5);

  const activeLoansCount = bankLoans.length;
  const receivablesCount = personalDebts.filter((d) => d.type === 'receivable').length;

  return (
    <div className="flex flex-col w-full gap-5 select-none pb-8 animate-in fade-in duration-300">
      {/* Greeting & Status Badge */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex flex-col">
          <span className="text-[1.125rem] font-bold text-[#171d1b]">শুভ সকাল, তানভীর আহমেদ!</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`w-2 h-2 rounded-full ${
                budgetUsedPercent >= 90 ? 'bg-[#ba1a1a] animate-ping' : 'bg-[#80d8a6] animate-pulse'
              }`}
            ></span>
            <span
              className={`text-[11px] font-medium ${
                budgetUsedPercent >= 100
                  ? 'text-[#ba1a1a] font-bold'
                  : budgetUsedPercent >= 90
                  ? 'text-[#d97706] font-bold'
                  : 'text-[#006972]'
              }`}
            >
              {budgetUsedPercent >= 100
                ? 'আর্থিক স্থিতি: বাজেট সীমা ছাড়িয়েছে!'
                : budgetUsedPercent >= 90
                ? 'আর্থিক স্থিতি: বাজেট সতর্কতা (৯০%+)'
                : 'আর্থিক স্থিতি: সন্তোষজনক ও সুরক্ষিত'}
            </span>
          </div>
        </div>
        <div
          className={`p-2 rounded-full flex items-center justify-center shadow-sm ${
            budgetUsedPercent >= 90 ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#eaefeb] text-[#005232]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {budgetUsedPercent >= 90 ? 'notification_important' : 'verified_user'}
          </span>
        </div>
      </div>

      {/* 90%+ Budget Warning Banner with Push Notification Support */}
      <BudgetWarningBanner onOpenSetBudget={handleOpenBudgetModal} />

      {/* Primary Balance Hero Card */}
      <div className="relative overflow-hidden rounded-xl bg-[#006d44] text-white shadow-lg p-5">
        {/* Ambient background blurs */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-[#9cf5c1]/10 pointer-events-none blur-xl"></div>
        <div className="absolute right-4 top-4 opacity-15">
          <span className="material-symbols-outlined text-[68px]">account_balance_wallet</span>
        </div>

        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium tracking-wide text-[#80d8a6] uppercase">বর্তমান ব্যালেন্স</span>
            <span className="text-[11px] bg-[#005232]/80 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
              মার্চ ২০২৫
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-[1.625rem] text-[#9cf5c1] font-bold">৳</span>
            <span className="text-[2.75rem] leading-none tracking-tight font-extrabold text-white">
              {formatBnCurrency(currentBalance)}
            </span>
          </div>

          {/* Hero Sub-metrics */}
          <div className="grid grid-cols-3 gap-2 pt-2.5 mt-1 bg-[#002111]/25 p-2.5 rounded-lg backdrop-blur-sm border border-white/5">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#80d8a6]">মোট আয়</span>
              <span className="text-[13px] font-bold text-[#9cf5c1] truncate">
                +৳ {formatBnCurrency(monthIncome)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#ffb59a]">মোট খরচ</span>
              <span className="text-[13px] font-bold text-[#ffdbcf] truncate">
                -৳ {formatBnCurrency(monthExpense)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#dee4e0]">নিট সাশ্রয়</span>
              <span className="text-[13px] font-bold text-white truncate">
                ৳ {formatBnCurrency(netSavings)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Circular Navigation */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] text-[#3f4942] font-semibold">এক নজরে দ্রুত কাজ</span>
        <div className="flex items-center justify-between overflow-x-auto py-1 no-scrollbar gap-2">
          {/* Quick Action 1: Income */}
          <button
            onClick={() => onOpenQuickEntry('income')}
            className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
            type="button"
          >
            <div className="w-13 h-13 p-3 rounded-full bg-[#9cf5c1] text-[#002111] flex items-center justify-center shadow-sm group-active:scale-95 transition-transform group-hover:bg-[#80d8a6]">
              <span className="material-symbols-outlined text-[24px]">add_circle</span>
            </div>
            <span className="text-[11px] text-[#171d1b] font-medium">+ আয়</span>
          </button>

          {/* Quick Action 2: Expense */}
          <button
            onClick={() => onOpenQuickEntry('expense')}
            className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
            type="button"
          >
            <div className="w-13 h-13 p-3 rounded-full bg-[#ffdad6] text-[#93000a] flex items-center justify-center shadow-sm group-active:scale-95 transition-transform group-hover:bg-[#ffb59a]/50">
              <span className="material-symbols-outlined text-[24px]">remove_circle</span>
            </div>
            <span className="text-[11px] text-[#171d1b] font-medium">− খরচ</span>
          </button>

          {/* Quick Action 3: Debt */}
          <button
            onClick={() => onOpenQuickEntry('debt')}
            className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
            type="button"
          >
            <div className="w-13 h-13 p-3 rounded-full bg-[#ffdbcf] text-[#380d00] flex items-center justify-center shadow-sm group-active:scale-95 transition-transform group-hover:bg-[#ffb59a]">
              <span className="material-symbols-outlined text-[24px]">real_estate_agent</span>
            </div>
            <span className="text-[11px] text-[#171d1b] font-medium">+ ঋণ/ধার</span>
          </button>

          {/* Quick Action 4: Receivable / Payable */}
          <button
            onClick={() => setActiveTab('debts')}
            className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
            type="button"
          >
            <div className="w-13 h-13 p-3 rounded-full bg-[#8feefc] text-[#006d77] flex items-center justify-center shadow-sm group-active:scale-95 transition-transform group-hover:bg-[#75d5e2]">
              <span className="material-symbols-outlined text-[24px]">swap_horizontal_circle</span>
            </div>
            <span className="text-[11px] text-[#171d1b] font-medium">পাওনা/দেনা</span>
          </button>

          {/* Quick Action 5: Reports */}
          <button
            onClick={() => setActiveTab('settings')}
            className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
            type="button"
          >
            <div className="w-13 h-13 p-3 rounded-full bg-[#e4e9e5] text-[#005232] flex items-center justify-center shadow-sm group-active:scale-95 transition-transform group-hover:bg-[#dee4e0]">
              <span className="material-symbols-outlined text-[24px]">analytics</span>
            </div>
            <span className="text-[11px] text-[#171d1b] font-medium">রিপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Secondary Summary Cards Grid (2x2) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: মোট ঋণ */}
        <div
          onClick={() => setActiveTab('debts')}
          className="bg-white p-4 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer border border-[#eaefeb]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#3f4942] font-medium">মোট ঋণ</span>
            <div className="w-7 h-7 rounded-full bg-[#ffdbcf]/50 flex items-center justify-center text-[#812a00]">
              <span className="material-symbols-outlined text-[16px]">account_balance</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-[1.125rem] font-bold text-[#171d1b] block">
              ৳ {formatBnCurrency(totalInstitutionalDebt)}
            </span>
            <span className="block text-[11px] text-[#812a00] font-medium mt-0.5">
              {activeLoansCount}টি সক্রিয় লোন
            </span>
          </div>
        </div>

        {/* Card 2: মোট পাওনা */}
        <div
          onClick={() => setActiveTab('debts')}
          className="bg-white p-4 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer border border-[#eaefeb]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#3f4942] font-medium">মোট পাওনা</span>
            <div className="w-7 h-7 rounded-full bg-[#8feefc] flex items-center justify-center text-[#006d77]">
              <span className="material-symbols-outlined text-[16px]">call_received</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-[1.125rem] font-bold text-[#006972] block">
              ৳ {formatBnCurrency(totalReceivables)}
            </span>
            <span className="block text-[11px] text-[#006972] font-medium mt-0.5">
              {receivablesCount} জনের কাছে প্রাপ্য
            </span>
          </div>
        </div>

        {/* Card 3: মোট দেনা */}
        <div
          onClick={() => setActiveTab('debts')}
          className="bg-white p-4 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer border border-[#eaefeb]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#3f4942] font-medium">মোট দেনা</span>
            <div className="w-7 h-7 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[16px]">call_made</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-[1.125rem] font-bold text-[#ba1a1a] block">
              ৳ {formatBnCurrency(totalPayables)}
            </span>
            <span className="block text-[11px] text-[#ba1a1a] font-medium mt-0.5">পরিশোধের বাকি</span>
          </div>
        </div>

        {/* Card 4: মাসিক বাজেট লক্ষ্য */}
        <div
          onClick={handleOpenBudgetModal}
          className={`bg-white p-4 rounded-xl shadow-sm flex flex-col justify-between border transition-all cursor-pointer group ${
            budgetUsedPercent >= 100
              ? 'border-[#ba1a1a] bg-[#fff5f5]/60 hover:shadow-md ring-1 ring-[#ba1a1a]/30'
              : budgetUsedPercent >= 90
              ? 'border-[#d97706] bg-[#fffdf0]/60 hover:shadow-md ring-1 ring-[#d97706]/30'
              : 'border-[#eaefeb] hover:border-[#9cf5c1] hover:shadow-md'
          }`}
          title="বাজেট পরিবর্তন করতে ক্লিক করুন"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[11px] text-[#3f4942] font-semibold truncate">বাজেট লক্ষ্য</span>
              <span className="material-symbols-outlined text-[13px] text-[#6f7a71] group-hover:text-[#005232] transition-colors shrink-0">
                tune
              </span>
              {budgetUsedPercent >= 90 && (
                <span className="material-symbols-outlined text-[13px] text-[#ba1a1a] animate-pulse shrink-0">
                  warning
                </span>
              )}
            </div>
            <span
              className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                budgetUsedPercent >= 100
                  ? 'bg-[#ffdad6] text-[#ba1a1a]'
                  : budgetUsedPercent >= 90
                  ? 'bg-[#fef3c7] text-[#b45309]'
                  : budgetUsedPercent >= 80
                  ? 'bg-[#ffdbcf] text-[#812a00]'
                  : 'bg-[#9cf5c1]/40 text-[#005232]'
              }`}
            >
              {toBnNum(budgetUsedPercent)}%
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-[#eaefeb] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  budgetUsedPercent >= 100
                    ? 'bg-[#ba1a1a]'
                    : budgetUsedPercent >= 90
                    ? 'bg-[#d97706]'
                    : budgetUsedPercent >= 80
                    ? 'bg-[#812a00]'
                    : 'bg-[#005232]'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, budgetUsedPercent))}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium leading-none">
              <span
                className={`truncate ${
                  budgetRemaining >= 0
                    ? budgetUsedPercent >= 90
                      ? 'text-[#b45309] font-bold'
                      : 'text-[#3f4942]'
                    : 'text-[#ba1a1a] font-bold'
                }`}
              >
                {budgetRemaining >= 0
                  ? `বাকি ৳ ${formatBnCurrency(budgetRemaining)}`
                  : `ছাড়িয়েছে ৳ ${formatBnCurrency(Math.abs(budgetRemaining))}`}
              </span>
              <span className="text-[10px] text-[#6f7a71] shrink-0 ml-1">
                / ৳ {formatBnCurrency(monthlyBudget)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends & Weekly Comparison Chart Widget */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-3 border border-[#eaefeb]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="text-[1.125rem] font-bold text-[#171d1b] truncate">
              {chartViewMode === 'trends'
                ? 'আয়-ব্যয় ট্রেন্ড (বিগত ৬ মাস)'
                : 'চলতি মাসের আয়-ব্যয় চিত্র'}
            </span>
            <span className="text-[12px] text-[#3f4942]">
              {chartViewMode === 'trends'
                ? 'মাসিক তুলনামূলক রেখাচিত্র (Line Chart)'
                : 'সাপ্তাহিক তুলনামূলক পর্যালোচনা (Bar Chart)'}
            </span>
          </div>

          {/* Toggle buttons between 6-month trends and weekly view */}
          <div className="flex items-center gap-1 bg-[#eff5f1] p-1 rounded-xl shrink-0">
            <button
              onClick={() => setChartViewMode('trends')}
              type="button"
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                chartViewMode === 'trends'
                  ? 'bg-white text-[#005232] shadow-xs'
                  : 'text-[#3f4942] hover:text-[#171d1b]'
              }`}
            >
              ৬ মাস
            </button>
            <button
              onClick={() => setChartViewMode('weekly')}
              type="button"
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                chartViewMode === 'weekly'
                  ? 'bg-white text-[#005232] shadow-xs'
                  : 'text-[#3f4942] hover:text-[#171d1b]'
              }`}
            >
              সাপ্তাহিক
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-3 text-[11px] font-medium pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#005232]"></span>
            <span className="text-[#3f4942]">আয় (Income)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#a93900]"></span>
            <span className="text-[#3f4942]">ব্যয় (Spending)</span>
          </div>
        </div>

        {/* Recharts 6-Month Line Chart */}
        {chartViewMode === 'trends' ? (
          <div className="w-full h-52 pt-2 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyTrendsData}
                margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#dee4e0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#6f7a71', fontSize: 10 }}
                  axisLine={{ stroke: '#dee4e0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6f7a71', fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `৳${toBnNum(Math.round(val / 1000))}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const incVal = Number(payload.find((p) => p.dataKey === 'income')?.value) || 0;
                      const expVal = Number(payload.find((p) => p.dataKey === 'expense')?.value) || 0;
                      const savVal = incVal - expVal;
                      return (
                        <div className="bg-white p-2.5 rounded-xl shadow-lg border border-[#dee4e0] text-[11px] space-y-1">
                          <p className="font-bold text-[#171d1b] border-b border-[#eaefeb] pb-1">
                            {label}
                          </p>
                          <div className="flex items-center justify-between gap-3 text-[#005232]">
                            <span className="flex items-center gap-1 font-medium">
                              <span className="w-2 h-2 rounded-full bg-[#005232]"></span>
                              আয়:
                            </span>
                            <span className="font-bold">+৳ {formatBnCurrency(incVal)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-[#a93900]">
                            <span className="flex items-center gap-1 font-medium">
                              <span className="w-2 h-2 rounded-full bg-[#a93900]"></span>
                              ব্যয়:
                            </span>
                            <span className="font-bold">-৳ {formatBnCurrency(expVal)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-[#006972] border-t border-[#eaefeb] pt-1">
                            <span className="font-medium">সাশ্রয়:</span>
                            <span className="font-bold">৳ {formatBnCurrency(savVal)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#005232"
                  strokeWidth={2.5}
                  dot={{ fill: '#005232', r: 3.5, strokeWidth: 1.5, stroke: '#ffffff' }}
                  activeDot={{ r: 5.5, fill: '#005232', stroke: '#9cf5c1', strokeWidth: 2 }}
                  name="আয়"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#a93900"
                  strokeWidth={2.5}
                  dot={{ fill: '#a93900', r: 3.5, strokeWidth: 1.5, stroke: '#ffffff' }}
                  activeDot={{ r: 5.5, fill: '#a93900', stroke: '#ffdbcf', strokeWidth: 2 }}
                  name="ব্যয়"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* Inline Bar Chart (SVG) */
          <div className="w-full pt-2">
            <svg
              aria-label="সাপ্তাহিক আয় ও ব্যয়ের তুলনামূলক বার চার্ট"
              className="w-full h-32 overflow-visible"
              viewBox="0 0 320 130"
            >
              {/* Grid lines */}
              <line stroke="#dee4e0" strokeDasharray="3 3" strokeWidth="0.8" x1="0" x2="320" y1="20" y2="20" />
              <line stroke="#dee4e0" strokeDasharray="3 3" strokeWidth="0.8" x1="0" x2="320" y1="60" y2="60" />
              <line stroke="#dee4e0" strokeWidth="1" x1="0" x2="320" y1="100" y2="100" />

              {/* Week 1 */}
              <rect fill="#005232" height="55" rx="3" width="16" x="25" y="45" className="hover:opacity-85 transition-opacity" />
              <rect fill="#a93900" height="35" rx="3" width="16" x="44" y="65" className="hover:opacity-85 transition-opacity" />
              <text fill="#6f7a71" fontSize="10" textAnchor="middle" x="42" y="118">সপ্তাহ ১</text>

              {/* Week 2 */}
              <rect fill="#005232" height="70" rx="3" width="16" x="100" y="30" className="hover:opacity-85 transition-opacity" />
              <rect fill="#a93900" height="45" rx="3" width="16" x="119" y="55" className="hover:opacity-85 transition-opacity" />
              <text fill="#6f7a71" fontSize="10" textAnchor="middle" x="117" y="118">সপ্তাহ ২</text>

              {/* Week 3 */}
              <rect fill="#005232" height="80" rx="3" width="16" x="175" y="20" className="hover:opacity-85 transition-opacity" />
              <rect fill="#a93900" height="25" rx="3" width="16" x="194" y="75" className="hover:opacity-85 transition-opacity" />
              <text fill="#6f7a71" fontSize="10" textAnchor="middle" x="192" y="118">সপ্তাহ ৩</text>

              {/* Week 4 */}
              <rect fill="#005232" height="50" rx="3" width="16" x="250" y="50" className="hover:opacity-85 transition-opacity" />
              <rect fill="#a93900" height="30" rx="3" width="16" x="269" y="70" className="hover:opacity-85 transition-opacity" />
              <text fill="#6f7a71" fontSize="10" textAnchor="middle" x="267" y="118">সপ্তাহ ৪</text>
            </svg>
          </div>
        )}
      </div>

      {/* Category Expenses Pie Chart Widget (বিভাগ অনুযায়ী খরচের পাই চার্ট) */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-3 border border-[#eaefeb]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="text-[1.125rem] font-bold text-[#171d1b] truncate">
              বিভাগ অনুযায়ী খরচের পাই চার্ট
            </span>
            <span className="text-[12px] text-[#3f4942]">
              খাবার, যাতায়াত, বিল ও অন্যান্য খাতের বণ্টন
            </span>
          </div>
          <button
            onClick={() => setActiveTab('expense')}
            className="text-[12px] text-[#005232] font-semibold hover:underline shrink-0 flex items-center gap-0.5 cursor-pointer"
            type="button"
          >
            <span>সব দেখুন</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        {/* Donut / Pie Chart with Center Stats */}
        <div className="relative w-full h-56 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryPieData}
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={86}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {categoryPieData.map((entry, index) => (
                  <Cell
                    key={`pie-cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2.5 rounded-xl shadow-lg border border-[#dee4e0] text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[#171d1b]">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: data.color }}
                          ></span>
                          <span>{data.name}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-[#3f4942]">
                          <span>খরচের পরিমাণ:</span>
                          <span className="font-bold text-[#171d1b]">
                            ৳ {formatBnCurrency(data.value)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-[#006972]">
                          <span>বাজেট অংশ:</span>
                          <span className="font-bold">{toBnNum(data.percentage)}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Donut Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-[#6f7a71] uppercase tracking-wider font-semibold">
              মোট ব্যয়
            </span>
            <span className="text-[15px] font-extrabold text-[#171d1b]">
              ৳ {formatBnCurrency(totalCategoryExpenseSum)}
            </span>
            <span className="text-[10px] text-[#006972] font-semibold bg-[#8feefc]/30 px-2 py-0.2 rounded-full mt-0.5">
              ৮টি বিভাগ
            </span>
          </div>
        </div>

        {/* Category Breakdown Chips / Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#eaefeb]">
          {categoryPieData.map((item) => (
            <div
              key={item.name}
              onClick={() => setActiveTab('expense')}
              className="flex items-center justify-between p-2 rounded-lg bg-[#f5fbf6] border border-[#eaefeb] hover:border-[#bec9bf] transition-colors cursor-pointer text-[11px]"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="truncate text-[#171d1b] font-medium">{item.name}</span>
              </div>
              <span className="font-bold text-[#3f4942] shrink-0 ml-1">
                {toBnNum(item.percentage)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Transactions Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[1.125rem] font-bold text-[#171d1b]">সর্বশেষ লেনদেন</span>
          <button
            onClick={() => setActiveTab('expense')}
            className="text-[13px] text-[#005232] font-semibold hover:underline cursor-pointer"
            type="button"
          >
            সব দেখুন
          </button>
        </div>

        {/* Transaction List Items */}
        <div className="flex flex-col gap-2">
          {latestTransactions.map((tx) => {
            const isInc = tx.type === 'income';
            return (
              <div
                key={tx.id}
                className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between border border-[#eaefeb] hover:border-[#9cf5c1] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                      isInc ? 'bg-[#9cf5c1] text-[#005232]' : 'bg-[#ffdad6] text-[#ba1a1a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{tx.categoryIcon}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] text-[#171d1b] font-semibold truncate">
                      {tx.title}
                    </span>
                    <span className="text-[12px] text-[#3f4942] truncate">
                      {tx.subtitle || tx.category} • {tx.dateLabelBn}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[14px] font-bold shrink-0 ml-2 ${
                    isInc ? 'text-[#005232]' : 'text-[#a93900]'
                  }`}
                >
                  {isInc ? '+' : '-'}৳ {formatBnCurrency(tx.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ambient Floating Action Button (দ্রুত হিসাব যোগ) */}
      <div className="fixed bottom-20 right-4 z-30">
        <button
          onClick={() => onOpenQuickEntry('expense')}
          aria-label="নতুন হিসাব যোগ করুন"
          className="flex items-center gap-2 bg-[#006d44] text-white pl-4 pr-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:bg-[#005232] active:scale-95 transition-all cursor-pointer font-medium"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">edit_note</span>
          <span className="text-[14px]">হিসাব লিখুন</span>
        </button>
      </div>

      {/* Set Budget Modal */}
      <SetBudgetModal
        isOpen={localBudgetModalOpen}
        onClose={() => setLocalBudgetModalOpen(false)}
      />
    </div>
  );
};
