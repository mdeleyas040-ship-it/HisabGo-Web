import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatBnCurrency, parseBnNum, toBnNum } from '../utils/formatters';

interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetBudgetModal: React.FC<SetBudgetModalProps> = ({ isOpen, onClose }) => {
  const { monthlyBudget, setMonthlyBudget, monthExpense } = useFinance();
  const [budgetInput, setBudgetInput] = useState<string>(monthlyBudget.toString());

  useEffect(() => {
    if (isOpen) {
      setBudgetInput(monthlyBudget.toString());
    }
  }, [isOpen, monthlyBudget]);

  if (!isOpen) return null;

  const currentVal = parseBnNum(budgetInput) || 0;
  const previewPercent = currentVal > 0 ? Math.round((monthExpense / currentVal) * 100) : 0;
  const previewRemaining = currentVal - monthExpense;

  const presets = [35000, 40000, 45000, 50000, 60000, 75000, 100000];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentVal <= 0) return;
    setMonthlyBudget(currentVal);
    onClose();
  };

  const getStatusColor = (percent: number) => {
    if (percent > 100) return 'text-[#ba1a1a]';
    if (percent >= 80) return 'text-[#812a00]';
    return 'text-[#005232]';
  };

  const getProgressBg = (percent: number) => {
    if (percent > 100) return 'bg-[#ba1a1a]';
    if (percent >= 80) return 'bg-[#812a00]';
    return 'bg-[#005232]';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#171d1b]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 rounded-full bg-[#dee4e0] mx-auto mb-3"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#eaefeb]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#9cf5c1] text-[#005232] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="text-[1.125rem] font-bold text-[#171d1b]">মাসিক খরচের বাজেট</h3>
              <p className="text-[11px] text-[#3f4942]">বাজেট সীমা নির্ধারণ করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eaefeb] flex items-center justify-center text-[#3f4942] hover:bg-[#dee4e0] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-3">
          {/* Budget Input Field */}
          <div className="p-4 rounded-xl bg-[#eff5f1] border border-[#dee4e0] text-center">
            <label className="text-[11px] text-[#3f4942] font-semibold block uppercase tracking-wider mb-1">
              মাসিক বাজেট লক্ষ্যমাত্রা (৳)
            </label>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[2rem] font-extrabold text-[#005232]">৳</span>
              <input
                type="text"
                value={toBnNum(budgetInput)}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="৪৫,০০০"
                className="text-[2rem] font-extrabold tracking-tight text-[#005232] bg-transparent text-center outline-none w-48"
                autoFocus
              />
            </div>
            <span className="text-[11px] text-[#6f7a71] block mt-0.5">
              বাংলা বা ইংরেজি সংখ্যায় লিখুন
            </span>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="text-[11px] font-bold text-[#171d1b] block mb-1.5">
              দ্রুত নির্বাচন করুন
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => {
                const isSelected = currentVal === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBudgetInput(preset.toString())}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#005232] text-white shadow-xs'
                        : 'bg-[#eaefeb] text-[#171d1b] hover:bg-[#dee4e0]'
                    }`}
                  >
                    ৳ {formatBnCurrency(preset)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview & Progress Bar */}
          <div className="p-3.5 bg-[#f5fbf6] rounded-xl border border-[#bec9bf]/40 space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#3f4942]">চলতি মাসের খরচ:</span>
              <span className="font-bold text-[#171d1b]">৳ {formatBnCurrency(monthExpense)}</span>
            </div>

            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#3f4942]">বাজেট ব্যবহারের হার:</span>
              <span className={`font-bold ${getStatusColor(previewPercent)}`}>
                {toBnNum(previewPercent)}%
              </span>
            </div>

            {/* Progress Bar Preview */}
            <div className="w-full h-2 rounded-full bg-[#eaefeb] overflow-hidden">
              <div
                className={`h-full ${getProgressBg(previewPercent)} rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(100, Math.max(0, previewPercent))}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-[#6f7a71]">
                {previewRemaining >= 0 ? 'অবশিষ্ট বাজেট:' : 'বাজেট অতিরিক্ত:'}
              </span>
              <span
                className={`font-bold ${
                  previewRemaining >= 0 ? 'text-[#005232]' : 'text-[#ba1a1a]'
                }`}
              >
                {previewRemaining >= 0
                  ? `৳ ${formatBnCurrency(previewRemaining)}`
                  : `-৳ ${formatBnCurrency(Math.abs(previewRemaining))}`}
              </span>
            </div>

            {previewPercent >= 90 && (
              <div
                className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 font-medium ${
                  previewPercent >= 100
                    ? 'bg-[#ffdad6] text-[#ba1a1a]'
                    : 'bg-[#fef3c7] text-[#92400e]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] shrink-0">
                  {previewPercent >= 100 ? 'error' : 'warning'}
                </span>
                <span>
                  {previewPercent >= 100
                    ? 'বাজেট ১০০% সীমা অতিক্রম করবে এবং ড্যাশবোর্ডে জরুরি লাল সতর্কবার্তা দেখাবে।'
                    : 'বাজেট ৯০% সীমা অতিক্রম করবে এবং ড্যাশবোর্ডে হলুদ পুশ সতর্কবার্তা সক্রিয় হবে।'}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-[#eaefeb] text-[#171d1b] text-[13px] font-semibold hover:bg-[#dee4e0] cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={currentVal <= 0}
              className="flex-1 py-3 rounded-xl bg-[#005232] text-white text-[13px] font-bold shadow-md hover:bg-[#006d44] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>বাজেট সংরক্ষণ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
