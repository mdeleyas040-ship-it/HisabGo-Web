import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatBnCurrency } from '../utils/formatters';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentBalance, monthIncome, monthExpense } = useFinance();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171d1b]/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-3 border-b border-[#eaefeb]">
          <h3 className="text-[1.125rem] font-bold text-[#171d1b]">ব্যবহারকারী প্রোফাইল</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eaefeb] flex items-center justify-center text-[#3f4942]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-col items-center py-4 text-center">
          <img
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover ring-4 ring-[#9cf5c1] shadow-md"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9X89WjudIWL-sqPutqW9qhGB65SGrssppqwTll6rO7Nrm7bIDt9fq0CoqhN6QNxQDPJ3lovEXOFkQ_9qBkg47J33VksoAVsDFEy3Xr6KC40kOAYabVlMAz6ibLFWB2m1M-Uygo_FW3UPDOJ1nNXB_wl9X7QZ6sedaoCyhMkC8zw9__xFf-xDittEl7EFmXagUTCoYWWYnFWe9DC5DN4Ei35gOTTyH-h7TEqE9iM7s243tsqtl5XrhWg"
          />
          <h4 className="text-[1.125rem] font-bold text-[#171d1b] mt-2">তানভীর আহমেদ</h4>
          <p className="text-[12px] text-[#3f4942]">tanvir.ahmed@example.com</p>
          <span className="mt-2 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#eff5f1] text-[#005232] text-[11px] font-bold border border-[#9cf5c1]">
            <span className="material-symbols-outlined text-[14px]">verified_user</span>
            যাচাইকৃত হিসাবধারী
          </span>
        </div>

        <div className="bg-[#eff5f1] rounded-xl p-3 space-y-2 text-[12px] border border-[#dee4e0]">
          <div className="flex justify-between">
            <span className="text-[#3f4942]">বর্তমান ব্যালেন্স:</span>
            <span className="font-bold text-[#005232]">৳ {formatBnCurrency(currentBalance)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#3f4942]">মার্চের মোট আয়:</span>
            <span className="font-bold text-[#005232]">+৳ {formatBnCurrency(monthIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#3f4942]">মার্চের মোট খরচ:</span>
            <span className="font-bold text-[#812a00]">-৳ {formatBnCurrency(monthExpense)}</span>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#005232] text-white text-[13px] font-bold shadow-md hover:bg-[#006d44]"
            type="button"
          >
            ঠিক আছে
          </button>
        </div>
      </div>
    </div>
  );
};
