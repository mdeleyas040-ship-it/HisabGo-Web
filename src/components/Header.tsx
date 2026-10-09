import React, { useState } from 'react';
import { useFinance, TabType } from '../context/FinanceContext';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications, onOpenProfile }) => {
  const { activeTab, notifications, showToast } = useFinance();
  const [isSyncing, setIsSyncing] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabTitleMap: Record<TabType, string> = {
    dashboard: 'Dashboard',
    income: 'Income',
    expense: 'Expense',
    debts: 'Debts',
    settings: 'More',
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('মেঘ সিঙ্ক সম্পন্ন হয়েছে - ডেটা সুরক্ষিত', 'cloud_done');
    }, 900);
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-[#f5fbf6]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      {/* Mobile OS Status Bar */}
      <div className="h-6 px-4 flex items-center justify-between text-[#3f4942] text-[11px] font-medium select-none">
        <span className="font-semibold tracking-normal">৯:৪১</span>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">signal_cellular_4_bar</span>
          <span className="material-symbols-outlined text-[14px]">wifi</span>
          <span className="material-symbols-outlined text-[14px]">battery_full</span>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            alt="Hisab Go Logo"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1WHoXSD2WJchPQiFLjtkFoudMCtqbWe2hXIR0t-eOnt0tc8KEc8JSq9cqRD9loya6P77eeymHGYQSe2KhcFz0ltfZVNRbEUSInfKxMxEV_X2OBQKFCpH3xqbDpc3XE8nDI0rEs_HaO6NYw6MaJXffQ_oSvkmjkJCy0cS6534K4bTJ415nS4OSujDv9EEEA3MM_svGc1WiDZBMa0uYMBjfXdPFOSjIiPfYNfNCbVwt7aNLcj759FQFBj9kQ"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[1.125rem] leading-none text-[#171d1b]">Hisab Go</span>
              <span className="text-[#6f7a71] text-xs">•</span>
              <h1 className="font-semibold text-[1.125rem] leading-none text-[#005232]">
                {tabTitleMap[activeTab]}
              </h1>
            </div>
            <button
              onClick={handleManualSync}
              className="flex items-center gap-1 text-[#006972] text-[11px] font-medium mt-1 hover:underline text-left"
              type="button"
            >
              <span className={`material-symbols-outlined text-[13px] ${isSyncing ? 'animate-spin' : ''}`}>
                {isSyncing ? 'sync' : 'cloud_done'}
              </span>
              <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'মেঘ সিঙ্ক সক্রিয়'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenNotifications}
            aria-label="বিজ্ঞপ্তি"
            className="relative w-11 h-11 flex items-center justify-center rounded-full text-[#3f4942] hover:bg-[#eaefeb] active:bg-[#e4e9e5] transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-[#f5fbf6] animate-pulse"></span>
            )}
          </button>

          <button
            onClick={onOpenProfile}
            aria-label="প্রোফাইল"
            className="relative w-11 h-11 flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
            type="button"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#9cf5c1]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9X89WjudIWL-sqPutqW9qhGB65SGrssppqwTll6rO7Nrm7bIDt9fq0CoqhN6QNxQDPJ3lovEXOFkQ_9qBkg47J33VksoAVsDFEy3Xr6KC40kOAYabVlMAz6ibLFWB2m1M-Uygo_FW3UPDOJ1nNXB_wl9X7QZ6sedaoCyhMkC8zw9__xFf-xDittEl7EFmXagUTCoYWWYnFWe9DC5DN4Ei35gOTTyH-h7TEqE9iM7s243tsqtl5XrhWg"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
