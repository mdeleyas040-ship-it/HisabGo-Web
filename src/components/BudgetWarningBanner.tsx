import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatBnCurrency, toBnNum } from '../utils/formatters';

interface BudgetWarningBannerProps {
  onOpenSetBudget: () => void;
}

export const BudgetWarningBanner: React.FC<BudgetWarningBannerProps> = ({ onOpenSetBudget }) => {
  const {
    monthlyBudget,
    monthExpense,
    budgetUsedPercent,
    budgetRemaining,
    isBudgetExceeded90,
    isBudgetExceeded100,
    pushNotificationPermission,
    requestPushPermission,
    sendBudgetPushNotification,
  } = useFinance();

  const [isDismissed, setIsDismissed] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  // If budget used is less than 90%, don't show the warning banner
  if (!isBudgetExceeded90) {
    return null;
  }

  const handlePushClick = async () => {
    setIsSendingNotif(true);
    if (pushNotificationPermission !== 'granted') {
      const granted = await requestPushPermission();
      if (granted) {
        sendBudgetPushNotification();
      }
    } else {
      sendBudgetPushNotification();
    }
    setTimeout(() => {
      setIsSendingNotif(false);
    }, 800);
  };

  // If minimized by the user, show compact alert bar
  if (isDismissed) {
    return (
      <div
        className={`w-full px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs transition-all shadow-xs ${
          isBudgetExceeded100
            ? 'bg-[#fff0ee] border-[#ffdad6] text-[#ba1a1a]'
            : 'bg-[#fffbeb] border-[#fde68a] text-[#b45309]'
        }`}
      >
        <div className="flex items-center gap-2 font-semibold">
          <span className="material-symbols-outlined text-[18px] animate-pulse">
            {isBudgetExceeded100 ? 'error' : 'warning'}
          </span>
          <span>
            {isBudgetExceeded100
              ? `বাজেট সীমা অতিক্রান্ত (${toBnNum(budgetUsedPercent)}%)`
              : `বাজেটের ৯০%+ খরচ সম্পন্ন (${toBnNum(budgetUsedPercent)}%)`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDismissed(false)}
            className="text-[11px] font-bold underline cursor-pointer"
            type="button"
          >
            বিস্তারিত দেখুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={`relative w-full rounded-2xl p-4 transition-all shadow-md overflow-hidden border ${
        isBudgetExceeded100
          ? 'bg-gradient-to-br from-[#fff2f0] via-[#ffe8e5] to-[#fff6f5] border-[#ff897d]/60 text-[#171d1b]'
          : 'bg-gradient-to-br from-[#fffdf5] via-[#fef3c7]/60 to-[#fffbeb] border-[#f59e0b]/50 text-[#171d1b]'
      } animate-in fade-in slide-in-from-top-2 duration-300`}
    >
      {/* Decorative background glow circle */}
      <div
        className={`absolute -right-8 -top-8 w-32 h-32 rounded-full pointer-events-none blur-2xl opacity-40 ${
          isBudgetExceeded100 ? 'bg-[#ba1a1a]' : 'bg-[#f59e0b]'
        }`}
      ></div>

      <div className="relative z-10 flex flex-col gap-3">
        {/* Banner Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                isBudgetExceeded100
                  ? 'bg-[#ba1a1a] text-white animate-bounce'
                  : 'bg-[#d97706] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {isBudgetExceeded100 ? 'crisis_alert' : 'notification_important'}
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wide ${
                    isBudgetExceeded100
                      ? 'bg-[#ba1a1a] text-white'
                      : 'bg-[#d97706] text-white'
                  }`}
                >
                  {isBudgetExceeded100 ? 'জরুরি বাজেট সতর্কতা' : 'বাজেট সতর্কতা'}
                </span>
                <span className="text-[11px] font-bold text-[#454945]">
                  {toBnNum(budgetUsedPercent)}% ব্যবহৃত
                </span>
              </div>
              <h3
                className={`text-[15px] font-bold leading-snug mt-0.5 ${
                  isBudgetExceeded100 ? 'text-[#93000a]' : 'text-[#92400e]'
                }`}
              >
                {isBudgetExceeded100
                  ? 'বাজেটের সীমা অতিক্রম করেছে!'
                  : 'মাসিক খরচের ৯০% সীমা অতিক্রান্ত!'}
              </h3>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            aria-label="বিজ্ঞপ্তি ছোট করুন"
            className="w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#5c605c] transition-colors shrink-0 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Informative text */}
        <p className="text-[12px] text-[#3f4942] leading-relaxed">
          {isBudgetExceeded100 ? (
            <>
              আপনার নির্ধারিত মাসিক বাজেট{' '}
              <strong className="text-[#171d1b]">৳ {formatBnCurrency(monthlyBudget)}</strong> ছাড়িয়ে মোট খরচ হয়েছে{' '}
              <strong className="text-[#ba1a1a]">৳ {formatBnCurrency(monthExpense)}</strong>। বাজেট অতিক্রান্ত ব্যয়{' '}
              <strong className="text-[#ba1a1a]">৳ {formatBnCurrency(Math.abs(budgetRemaining))}</strong>!
            </>
          ) : (
            <>
              আপনার নির্ধারিত মাসিক বাজেট{' '}
              <strong className="text-[#171d1b]">৳ {formatBnCurrency(monthlyBudget)}</strong> এর বিপরীতে ইতিমধ্যে{' '}
              <strong className="text-[#92400e]">৳ {formatBnCurrency(monthExpense)}</strong> খরচ হয়ে গেছে। চলতি মাসে বাকি আছে মাত্র{' '}
              <strong className="text-[#005232] font-bold">৳ {formatBnCurrency(budgetRemaining)}</strong>!
            </>
          )}
        </p>

        {/* Danger zone progress bar */}
        <div className="flex flex-col gap-1 bg-white/70 backdrop-blur-xs p-2.5 rounded-xl border border-black/5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#3f4942]">
            <span>বাজেট ব্যবহারের মাত্রা</span>
            <span
              className={
                isBudgetExceeded100 ? 'text-[#ba1a1a] font-bold' : 'text-[#b45309] font-bold'
              }
            >
              {toBnNum(budgetUsedPercent)}%
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[#eaefeb] overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isBudgetExceeded100
                  ? 'bg-gradient-to-r from-[#ea580c] to-[#ba1a1a]'
                  : 'bg-gradient-to-r from-[#f59e0b] to-[#d97706]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, budgetUsedPercent))}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#6f7a71] pt-0.5">
            <span>০%</span>
            <span className="font-bold text-[#b45309]">৯০% সতর্কতা সীমা</span>
            <span>১০০%+</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Push Notification Trigger Button */}
          <button
            onClick={handlePushClick}
            disabled={isSendingNotif}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[12px] font-bold transition-all shadow-xs cursor-pointer ${
              pushNotificationPermission === 'granted'
                ? 'bg-white hover:bg-neutral-50 text-[#171d1b] border border-[#d6dbd7]'
                : 'bg-[#171d1b] hover:bg-neutral-800 text-white'
            }`}
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] ${isSendingNotif ? 'animate-spin' : ''}`}>
              {isSendingNotif ? 'sync' : 'notifications_active'}
            </span>
            <span>
              {pushNotificationPermission === 'granted'
                ? 'পুশ নোটিফিকেশন পাঠান'
                : 'পুশ নোটিফিকেশন চালু করুন'}
            </span>
          </button>

          {/* Adjust budget button */}
          <button
            onClick={onOpenSetBudget}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#005232] hover:bg-[#003d24] text-white text-[12px] font-bold transition-all shadow-xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>বাজেট সংশোধন করুন</span>
          </button>
        </div>

        {/* Financial Tips Toggle */}
        <div className="pt-0.5">
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#006972] hover:underline cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">
              {showTips ? 'expand_less' : 'tips_and_updates'}
            </span>
            <span>
              {showTips ? 'পরামর্শ লুকান' : 'খরচ নিয়ন্ত্রণে জরুরি পরামর্শ দেখুন'}
            </span>
          </button>

          {showTips && (
            <div className="mt-2 p-3 bg-white/80 rounded-xl border border-black/5 text-[11px] text-[#3f4942] space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-start gap-1.5">
                <span className="text-[#d97706] font-bold">১.</span>
                <span>অপ্রয়োজনীয় রেস্তোরাঁ ও বাইরের খাবারে খরচ সীমিত রাখুন।</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-[#d97706] font-bold">২.</span>
                <span>অনলাইন কেনাকাটা বা শপিং কার্টের পেমেন্ট চলতি মাসের জন্য স্থগিত রাখুন।</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-[#d97706] font-bold">৩.</span>
                <span>দৈনন্দিন যাতায়াত ও বাজার করার ক্ষেত্রে বাজেট তালিকা কঠোরভাবে অনুসরণ করুন।</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
