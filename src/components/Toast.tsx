import React from 'react';
import { useFinance } from '../context/FinanceContext';

export const Toast: React.FC = () => {
  const { toast } = useFinance();

  if (!toast.visible) return null;

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#2c322f] text-[#edf2ee] text-[13px] font-medium px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 transition-all duration-300 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <span className="material-symbols-outlined text-[18px] text-[#9cf5c1]">
        {toast.icon || 'check_circle'}
      </span>
      <span>{toast.message}</span>
    </div>
  );
};
