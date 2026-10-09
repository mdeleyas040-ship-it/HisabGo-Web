import React from 'react';
import { useFinance, TabType } from '../context/FinanceContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();

  const navItems: { key: TabType; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'হোম', icon: 'dashboard' },
    { key: 'income', label: 'আয়', icon: 'trending_up' },
    { key: 'expense', label: 'খরচ', icon: 'trending_down' },
    { key: 'debts', label: 'ঋণ', icon: 'handshake' },
    { key: 'settings', label: 'আরও', icon: 'tune' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-[#f5fbf6]/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.05)] border-t border-[#dee4e0]/40">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              type="button"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all cursor-pointer ${
                isActive
                  ? 'text-[#005232]'
                  : 'text-[#3f4942] hover:text-[#171d1b]'
              }`}
            >
              <div
                className={`flex items-center justify-center w-16 h-8 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-[#8feefc] text-[#006d77] scale-105 shadow-sm'
                    : 'bg-transparent text-[#3f4942]'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              </div>
              <span
                className={`text-[11px] leading-tight mt-0.5 ${
                  isActive ? 'text-[#005232] font-bold' : 'text-[#3f4942] font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
