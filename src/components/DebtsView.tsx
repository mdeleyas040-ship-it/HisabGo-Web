import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatBnCurrency, toBnNum } from '../utils/formatters';
import { BankLoan, PersonalPartyDebt } from '../types/finance';

export const DebtsView: React.FC = () => {
  const {
    bankLoans,
    personalDebts,
    deleteBankLoan,
    payEmiInstallment,
    deletePersonalDebt,
    markDebtPaid,
    addBankLoan,
    addPersonalDebt,
    addNotification,
    showToast,
  } = useFinance();

  // Tab: 'loans' | 'receivable' | 'payable' | 'schedule'
  const [debtTab, setDebtTab] = useState<'loans' | 'receivable' | 'payable' | 'schedule'>('loans');
  const [extraPayment, setExtraPayment] = useState<number>(0);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: 'loan' | 'debt' } | null>(null);

  // Add new debt/loan modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLoanBank, setNewLoanBank] = useState('');
  const [newLoanAmount, setNewLoanAmount] = useState('');
  const [newLoanEmi, setNewLoanEmi] = useState('');

  // Personal party add modal
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyAmount, setNewPartyAmount] = useState('');
  const [newPartyType, setNewPartyType] = useState<'receivable' | 'payable'>('receivable');
  const [newPartyDesc, setNewPartyDesc] = useState('');

  // Calculations
  const totalLoanPrincipal = bankLoans.reduce((sum, l) => sum + l.originalAmount, 0);
  const totalLoanPaid = bankLoans.reduce((sum, l) => sum + l.paidAmount, 0);
  const totalLoanRemaining = bankLoans.reduce((sum, l) => sum + l.remainingAmount, 0);
  const totalMonthlyEmi = bankLoans.reduce((sum, l) => sum + l.monthlyEmi, 0);
  const overallRepaymentProgress = totalLoanPrincipal > 0
    ? Math.round((totalLoanPaid / totalLoanPrincipal) * 100)
    : 0;

  const receivables = personalDebts.filter((d) => d.type === 'receivable');
  const payables = personalDebts.filter((d) => d.type === 'payable');
  const totalReceivables = receivables.reduce((sum, d) => sum + d.amount, 0);
  const totalPayables = payables.reduce((sum, d) => sum + d.amount, 0);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'loan') {
      deleteBankLoan(deleteTarget.id);
    } else {
      deletePersonalDebt(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const handleAddLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoanBank || !newLoanAmount) return;
    const orig = parseFloat(newLoanAmount) || 50000;
    const emi = parseFloat(newLoanEmi) || Math.round(orig / 12);
    addBankLoan({
      bankName: newLoanBank,
      accountNumber: `#BN-${Math.floor(10000 + Math.random() * 90000)}`,
      icon: 'account_balance',
      originalAmount: orig,
      paidAmount: 0,
      remainingAmount: orig,
      monthlyEmi: emi,
      repaymentProgressPercent: 0,
      nextEmiDateBn: '১০ পরবর্তী মাস',
    });
    setShowAddModal(false);
    setNewLoanBank('');
    setNewLoanAmount('');
    setNewLoanEmi('');
  };

  const handleAddPartySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName || !newPartyAmount) return;
    addPersonalDebt({
      type: newPartyType,
      personName: newPartyName,
      initialChar: newPartyName.charAt(0),
      amount: parseFloat(newPartyAmount) || 1000,
      description: newPartyDesc || 'ব্যক্তিগত লেনদেন',
      dueDateBn: '১৫ চলতি মাস',
    });
    setShowAddPartyModal(false);
    setNewPartyName('');
    setNewPartyAmount('');
    setNewPartyDesc('');
  };

  const handleSendReminder = (person: string, amount: number) => {
    showToast(`${person}-কে ৳ ${formatBnCurrency(amount)} পরিশোধের তাগাদা এসএমএস পাঠানো হয়েছে`, 'forward_to_inbox');
  };

  const handleSetReminder = (title: string, dateBn: string, amount: number) => {
    addNotification(
      `কিস্তি পরিশোধের রিমাইন্ডার: ${title}`,
      `আসন্ন ${dateBn}-এ ৳ ${formatBnCurrency(amount)} কিস্তি পরিশোধের সময় হয়েছে।`,
      'alert'
    );
    showToast(`${title}-এর কিস্তির রিমাইন্ডার বিজ্ঞপ্তিতে যুক্ত হয়েছে`, 'notifications_active');
  };

  // Debt Payment Schedule Items (কিস্তির সময়সূচী তালিকা)
  const scheduleItems = [
    ...bankLoans.map((loan) => ({
      id: `loan-emi-${loan.id}`,
      originalId: loan.id,
      type: 'bank_loan' as const,
      title: loan.bankName,
      subtitle: `মাসিক ইএমআই • ${loan.accountNumber}`,
      amount: loan.monthlyEmi,
      dueDateBn: loan.nextEmiDateBn,
      dayNumber: loan.id === 'loan-1' ? 10 : 15,
      daysLeftBn: loan.id === 'loan-1' ? 'আর ১ দিন বাকি' : 'আর ৬ দিন বাকি',
      isUpcomingUrgent: loan.id === 'loan-1',
      icon: loan.icon,
      remainingDebt: loan.remainingAmount,
    })),
    ...payables.map((pay) => ({
      id: `pay-due-${pay.id}`,
      originalId: pay.id,
      type: 'payable' as const,
      title: pay.personName,
      subtitle: pay.description,
      amount: pay.amount,
      dueDateBn: pay.dueDateBn,
      dayNumber: pay.id === 'pay-1' ? 12 : 20,
      daysLeftBn: pay.id === 'pay-1' ? 'আর ৩ দিন বাকি' : 'আর ১১ দিন বাকি',
      isUpcomingUrgent: false,
      icon: 'call_made',
      remainingDebt: pay.amount,
    })),
  ].sort((a, b) => a.dayNumber - b.dayNumber);

  // Repayment Planner Projections
  const totalUpcomingInstallments = scheduleItems.reduce((acc, curr) => acc + curr.amount, 0);
  const totalDebtBalance = totalLoanRemaining + totalPayables;
  const baseMonthlyPayment = totalMonthlyEmi > 0 ? totalMonthlyEmi : 12500;
  const effectiveMonthlyPayment = baseMonthlyPayment + extraPayment;
  const standardMonthsRemaining = Math.max(1, Math.ceil(totalLoanRemaining / baseMonthlyPayment));
  const plannedMonthsRemaining = Math.max(1, Math.ceil(totalLoanRemaining / effectiveMonthlyPayment));
  const monthsSaved = Math.max(0, standardMonthsRemaining - plannedMonthsRemaining);

  return (
    <div className="flex flex-col w-full gap-4 pb-8 select-none animate-in fade-in duration-300">
      {/* Top Overall Debt Snapshot Banner */}
      <section className="bg-[#005232] text-white rounded-xl p-4 shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[140px]">account_balance</span>
        </div>

        <div className="flex justify-between items-start mb-2 relative z-10">
          <div>
            <span className="text-[11px] text-[#93ecb8] uppercase tracking-wider font-semibold">
              চলতি আর্থিক দায়
            </span>
            <h2 className="text-[1.75rem] leading-tight mt-0.5 font-bold">
              ৳ {formatBnCurrency(totalLoanOriginalOrRemaining(totalLoanPrincipal, totalLoanRemaining))}
            </h2>
          </div>
          <span className="bg-white/15 text-[#9cf5c1] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
            <span className="material-symbols-outlined text-[14px]">format_image_left</span>
            সক্রিয় হিসাব
          </span>
        </div>

        {/* Progress Meter */}
        <div className="mt-2 relative z-10">
          <div className="flex justify-between items-center text-[#93ecb8] text-[11px] mb-1.5 font-medium">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              {toBnNum(overallRepaymentProgress)}% ঋণ পরিশোধ সম্পন্ন
            </span>
            <span className="font-bold text-[#9cf5c1]">
              ৳ {formatBnCurrency(totalLoanPaid)} / {formatBnCurrency(totalLoanPrincipal)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-black/25 rounded-full overflow-hidden">
            <div
              className="bg-[#9cf5c1] h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${overallRepaymentProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-white/10 relative z-10">
          <div className="flex flex-col">
            <span className="text-[#93ecb8] text-[11px]">অবশিষ্ট মোট দেনা</span>
            <span className="text-[1.125rem] font-bold text-white">
              ৳ {formatBnCurrency(totalLoanRemaining)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#93ecb8] text-[11px]">আসন্ন মাসিক কিস্তি (EMI)</span>
            <span className="text-[1.125rem] font-bold text-[#9cf5c1]">
              ৳ {formatBnCurrency(totalMonthlyEmi)}
            </span>
            <span className="text-[#93ecb8]/80 text-[10px]">তারিখ: ১০ মার্চ</span>
          </div>
        </div>
      </section>

      {/* Quick Upcoming Installment Reminder Banner */}
      <div
        onClick={() => setDebtTab('schedule')}
        className="flex items-center justify-between p-3 rounded-xl bg-[#eff5f1] border border-[#9cf5c1] cursor-pointer hover:bg-[#e4e9e5] transition-colors shadow-xs"
        title="পরিশোধের সময়সূচী দেখুন"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#9cf5c1] text-[#005232] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">event_upcoming</span>
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-bold text-[#171d1b] block truncate">
              আসন্ন কিস্তি: ১০ মার্চ (ব্যাংক এশিয়া ৳ ৮,৫০০)
            </span>
            <span className="text-[11px] text-[#006972] font-medium">
              আর ১ দিন বাকি • মোট {toBnNum(scheduleItems.length)}টি কিস্তির সময়সূচী উপলব্ধ
            </span>
          </div>
        </div>
        <span className="text-[11px] font-bold text-[#005232] bg-white px-2.5 py-1 rounded-full shadow-xs shrink-0 flex items-center gap-0.5">
          <span>সময়সূচী</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        </span>
      </div>

      {/* Interactive Segmented Navigation */}
      <section className="bg-[#e4e9e5] p-1 rounded-full flex items-center justify-between shadow-xs">
        <button
          className={`flex-1 py-2 px-2.5 rounded-full text-[12px] transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
            debtTab === 'loans'
              ? 'bg-white text-[#005232] shadow-sm font-bold'
              : 'text-[#3f4942] hover:text-[#171d1b] font-medium'
          }`}
          onClick={() => setDebtTab('loans')}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">account_balance</span>
          আমার ঋণ
        </button>

        <button
          className={`flex-1 py-2 px-2.5 rounded-full text-[12px] transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
            debtTab === 'receivable'
              ? 'bg-white text-[#006972] shadow-sm font-bold'
              : 'text-[#3f4942] hover:text-[#171d1b] font-medium'
          }`}
          onClick={() => setDebtTab('receivable')}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">call_received</span>
          পাওনা
          <span className="bg-[#8feefc] text-[#006d77] px-1.5 py-0.2 rounded-full text-[10px] font-bold">
            {toBnNum(receivables.length)}
          </span>
        </button>

        <button
          className={`flex-1 py-2 px-2.5 rounded-full text-[12px] transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
            debtTab === 'payable'
              ? 'bg-white text-[#812a00] shadow-sm font-bold'
              : 'text-[#3f4942] hover:text-[#171d1b] font-medium'
          }`}
          onClick={() => setDebtTab('payable')}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">call_made</span>
          দেনা
          <span className="bg-[#ffdbcf] text-[#812a00] px-1.5 py-0.2 rounded-full text-[10px] font-bold">
            {toBnNum(payables.length)}
          </span>
        </button>

        <button
          className={`flex-1 py-2 px-2.5 rounded-full text-[12px] transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
            debtTab === 'schedule'
              ? 'bg-white text-[#005232] shadow-sm font-bold'
              : 'text-[#3f4942] hover:text-[#171d1b] font-medium'
          }`}
          onClick={() => setDebtTab('schedule')}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">event_repeat</span>
          সময়সূচী
          <span className="bg-[#9cf5c1] text-[#002111] px-1.5 py-0.2 rounded-full text-[10px] font-bold">
            {toBnNum(scheduleItems.length)}
          </span>
        </button>
      </section>

      {/* VIEW 1: Institutional Loans */}
      {(debtTab === 'loans' || debtTab === 'receivable' || debtTab === 'payable') && debtTab === 'loans' && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[1.125rem] font-bold text-[#171d1b] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#005232] text-[20px]">
                account_balance_wallet
              </span>
              ব্যাংক ও আর্থিক ঋণ
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-[#005232] hover:text-[#006d44] text-[12px] font-bold flex items-center gap-1 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              নতুন ঋণ যোগ
            </button>
          </div>

          {bankLoans.map((loan) => (
            <article
              key={loan.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-[#eaefeb] relative flex flex-col gap-2.5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-lg bg-[#eaefeb] flex items-center justify-center text-[#005232]">
                    <span className="material-symbols-outlined text-[24px]">{loan.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#171d1b]">{loan.bankName}</h4>
                    <span className="text-[11px] text-[#6f7a71]">ঋণ হিসাব: {loan.accountNumber}</span>
                  </div>
                </div>
                <button
                  aria-label="মুছে ফেলুন"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-[#6f7a71] hover:bg-[#eaefeb] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                  onClick={() =>
                    setDeleteTarget({ id: loan.id, name: loan.bankName, type: 'loan' })
                  }
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">delete_outline</span>
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="bg-[#eff5f1] rounded-lg p-3 grid grid-cols-2 gap-2 mt-1">
                <div>
                  <span className="text-[11px] text-[#6f7a71]">মূল পরিমাণ</span>
                  <p className="text-[1.125rem] font-bold text-[#171d1b]">
                    ৳ {formatBnCurrency(loan.originalAmount)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-[#6f7a71]">মাসিক কিস্তি (EMI)</span>
                  <p className="text-[1.125rem] font-bold text-[#005232]">
                    ৳ {formatBnCurrency(loan.monthlyEmi)}
                  </p>
                </div>
                <div className="mt-1">
                  <span className="text-[11px] text-[#006972] font-semibold">
                    পরিশোধিত: ৳ {formatBnCurrency(loan.paidAmount)}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-[11px] text-[#812a00] font-semibold">
                    অবশিষ্ট: ৳ {formatBnCurrency(loan.remainingAmount)}
                  </span>
                </div>
              </div>

              {/* Linear Repayment Bar */}
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between items-center text-[#3f4942] text-[11px]">
                  <span>পরিশোধের অগ্রগতি ({toBnNum(loan.repaymentProgressPercent)}%)</span>
                  <span className="font-semibold text-[#171d1b]">
                    পরবর্তী কিস্তি: {loan.nextEmiDateBn}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#eaefeb] rounded-full overflow-hidden">
                  <div
                    className="bg-[#005232] h-full rounded-full transition-all duration-500"
                    style={{ width: `${loan.repaymentProgressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Button Row */}
              <div className="flex items-center gap-2 pt-1 mt-1">
                <button
                  className="flex-1 py-2.5 px-3 bg-[#005232] text-white rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm active:opacity-90 hover:bg-[#006d44] transition-colors cursor-pointer"
                  onClick={() => payEmiInstallment(loan.id)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  কিস্তি পরিশোধ
                </button>
                <button
                  className="py-2.5 px-3 bg-[#eaefeb] text-[#171d1b] rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1 hover:bg-[#e4e9e5] transition-colors cursor-pointer"
                  onClick={() =>
                    showToast(`${loan.bankName} এর বিবরণী আপডেট মোডে রয়েছে`, 'edit')
                  }
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  সম্পাদনা
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* VIEW 2 & 3: Personal Receivables and Payables */}
      {(debtTab === 'receivable' || debtTab === 'payable' || debtTab === 'loans') && (
        <section className="flex flex-col gap-3 pt-2">
          {/* Header */}
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-[1.125rem] font-bold text-[#171d1b]">ব্যক্তিগত দেনা ও পাওনা</h3>
              <p className="text-[12px] text-[#3f4942]">বন্ধু, স্বজন ও দোকানের বাকি খাতা</p>
            </div>
            <button
              onClick={() => setShowAddPartyModal(true)}
              className="text-[11px] bg-[#eaefeb] text-[#171d1b] px-3 py-1 rounded-full font-bold hover:bg-[#dee4e0] cursor-pointer flex items-center gap-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              নতুন এন্ট্রি
            </button>
          </div>

          {/* Sub-section: পাওনা (Receivables) */}
          {(debtTab === 'receivable' || debtTab === 'loans') && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[13px] font-bold text-[#006972] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">arrow_circle_down</span>
                  আমার পাওনা (মোট: ৳ {formatBnCurrency(totalReceivables)})
                </span>
                <span className="text-[10px] bg-[#006d77] text-white px-2 py-0.5 rounded-full font-bold">
                  গ্রহীতা
                </span>
              </div>

              {receivables.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-xl p-3 shadow-sm border border-[#eaefeb] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#8feefc] text-[#006d77] flex items-center justify-center font-bold text-[1.125rem]">
                      {rec.initialChar}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h5 className="text-[14px] font-bold text-[#171d1b] truncate">
                        {rec.personName}
                      </h5>
                      <span className="text-[11px] text-[#6f7a71] truncate">{rec.description}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[14px] font-bold text-[#006972]">
                        + ৳ {formatBnCurrency(rec.amount)}
                      </span>
                      <span className="block text-[10px] text-[#6f7a71]">বাকি আছে</span>
                    </div>
                    <button
                      className="w-9 h-9 rounded-full bg-[#8feefc] text-[#006d77] flex items-center justify-center active:scale-95 transition-transform hover:bg-[#75d5e2] cursor-pointer"
                      onClick={() => handleSendReminder(rec.personName, rec.amount)}
                      title="রিমাইন্ডার বা কল"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </button>
                    <button
                      className="text-[#6f7a71] hover:text-[#ba1a1a] p-1"
                      onClick={() =>
                        setDeleteTarget({ id: rec.id, name: rec.personName, type: 'debt' })
                      }
                      title="মুছে ফেলুন"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete_outline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sub-section: দেনা (Payables) */}
          {(debtTab === 'payable' || debtTab === 'loans') && (
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[13px] font-bold text-[#812a00] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">arrow_circle_up</span>
                  আমার দেনা (মোট: ৳ {formatBnCurrency(totalPayables)})
                </span>
                <span className="text-[10px] bg-[#812a00] text-white px-2 py-0.5 rounded-full font-bold">
                  পরিশোধ্য
                </span>
              </div>

              {payables.map((pay) => (
                <div
                  key={pay.id}
                  className="bg-white rounded-xl p-3 shadow-sm border border-[#eaefeb] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#ffdbcf] text-[#812a00] flex items-center justify-center font-bold text-[1.125rem]">
                      {pay.initialChar}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h5 className="text-[14px] font-bold text-[#171d1b] truncate">
                        {pay.personName}
                      </h5>
                      <span className="text-[11px] text-[#6f7a71] truncate">{pay.description}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[14px] font-bold text-[#812a00]">
                        - ৳ {formatBnCurrency(pay.amount)}
                      </span>
                      <span className="block text-[10px] text-[#6f7a71]">বকেয়া</span>
                    </div>
                    <button
                      className="px-2.5 py-1.5 rounded-lg bg-[#812a00] text-white text-[12px] font-semibold active:scale-95 transition-transform hover:bg-[#a93900] cursor-pointer"
                      onClick={() => markDebtPaid(pay.id)}
                      type="button"
                    >
                      পরিশোধ
                    </button>
                    <button
                      className="text-[#6f7a71] hover:text-[#ba1a1a] p-1"
                      onClick={() =>
                        setDeleteTarget({ id: pay.id, name: pay.personName, type: 'debt' })
                      }
                      title="মুছে ফেলুন"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete_outline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* VIEW 4: ঋণ পরিশোধের সময়সূচী ও পরিকল্পনা (Debt Payment Schedule & Planner) */}
      {debtTab === 'schedule' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          {/* Section Header */}
          <div className="flex justify-between items-center px-1">
            <div>
              <h3 className="text-[1.125rem] font-bold text-[#171d1b] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#005232] text-[22px]">
                  event_repeat
                </span>
                ঋণ পরিশোধের সময়সূচী
              </h3>
              <p className="text-[12px] text-[#3f4942]">
                আসন্ন কিস্তির তারিখ, রিমাইন্ডার ও পরিকল্পনা
              </p>
            </div>
            <button
              onClick={() => handleSetReminder('সকল কিস্তি', 'চলতি মাস', totalUpcomingInstallments)}
              className="text-[11px] bg-[#eff5f1] hover:bg-[#dee4e0] text-[#005232] px-3 py-1.5 rounded-full font-bold flex items-center gap-1 cursor-pointer transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">notifications_active</span>
              সব রিমাইন্ডার চালু
            </button>
          </div>

          {/* 3 Summary Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-3 rounded-xl border border-[#eaefeb] shadow-xs flex flex-col justify-between">
              <span className="text-[10px] text-[#6f7a71] font-medium">মাসিক প্রদেয়</span>
              <p className="text-[13px] font-bold text-[#005232] mt-0.5 truncate">
                ৳ {formatBnCurrency(totalUpcomingInstallments)}
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#eaefeb] shadow-xs flex flex-col justify-between">
              <span className="text-[10px] text-[#6f7a71] font-medium">সক্রিয় কিস্তি</span>
              <p className="text-[13px] font-bold text-[#171d1b] mt-0.5">
                {toBnNum(scheduleItems.length)}টি প্রদেয়
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#eaefeb] shadow-xs flex flex-col justify-between">
              <span className="text-[10px] text-[#6f7a71] font-medium">ঋণমুক্তির লক্ষ্য</span>
              <p className="text-[13px] font-bold text-[#006972] mt-0.5">
                ~{toBnNum(standardMonthsRemaining)} মাস
              </p>
            </div>
          </div>

          {/* Timeline of Upcoming Due Dates */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[12px] font-bold text-[#171d1b] px-1">
              আসন্ন কিস্তির সময়রেখা (Upcoming Due Dates)
            </span>

            {scheduleItems.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl border border-dashed border-[#dee4e0]">
                <span className="material-symbols-outlined text-[36px] text-[#6f7a71]">task_alt</span>
                <p className="text-[13px] text-[#3f4942] mt-1 font-medium">
                  এই মুহূর্তে কোনো বকেয়া কিস্তি নেই!
                </p>
              </div>
            ) : (
              scheduleItems.map((item) => {
                const isBank = item.type === 'bank_loan';
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl p-3.5 shadow-sm border transition-all ${
                      item.isUpcomingUrgent
                        ? 'border-[#ffdad6] ring-1 ring-[#ba1a1a]/30'
                        : 'border-[#eaefeb]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isBank
                              ? 'bg-[#eff5f1] text-[#005232]'
                              : 'bg-[#ffdbcf] text-[#812a00]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[22px]">
                            {item.icon}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[14px] font-bold text-[#171d1b] truncate">
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-[#6f7a71] block truncate">
                            {item.subtitle}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-bold text-[#006972] bg-[#8feefc]/30 px-2 py-0.2 rounded-full">
                              তারিখ: {item.dueDateBn}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                                item.isUpcomingUrgent
                                  ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                  : 'bg-[#eff5f1] text-[#005232]'
                              }`}
                            >
                              {item.daysLeftBn}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[14px] font-extrabold text-[#005232] block">
                          ৳ {formatBnCurrency(item.amount)}
                        </span>
                        <span className="text-[10px] text-[#6f7a71]">
                          অবশিষ্ট: ৳ {formatBnCurrency(item.remainingDebt)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons row */}
                    <div className="flex items-center gap-2 pt-2.5 mt-2.5 border-t border-[#eaefeb]">
                      <button
                        onClick={() => {
                          if (isBank) {
                            payEmiInstallment(item.originalId);
                          } else {
                            markDebtPaid(item.originalId);
                          }
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-[#005232] hover:bg-[#006d44] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">payments</span>
                        <span>{isBank ? 'কিস্তি পরিশোধ করুন' : 'পরিশোধ চিহ্নিত করুন'}</span>
                      </button>

                      <button
                        onClick={() =>
                          handleSetReminder(item.title, item.dueDateBn, item.amount)
                        }
                        className="py-2 px-3 rounded-lg bg-[#eaefeb] hover:bg-[#dee4e0] text-[#171d1b] text-[12px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                        type="button"
                        title="রিমাইন্ডার সেট করুন"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#006972]">
                          notifications
                        </span>
                        <span>রিমাইন্ডার</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Interactive Accelerated Debt Repayment Planner (দ্রুত ঋণমুক্তির পরিকল্পনা সিমুলেটর) */}
          <div className="bg-[#eff5f1] rounded-2xl p-4 border border-[#dee4e0] shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#005232] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#171d1b]">
                  দ্রুত ঋণমুক্ত হওয়ার পরিকল্পনা সিমুলেটর
                </h4>
                <p className="text-[11px] text-[#3f4942]">
                  অতিরিক্ত কিস্তি দিয়ে ঋণমুক্তির সময় কমিয়ে আনুন
                </p>
              </div>
            </div>

            {/* Extra Payment Selector Chips */}
            <div>
              <label className="text-[11px] font-bold text-[#3f4942] block mb-1.5">
                মাসিক অতিরিক্ত কত টাকা দিতে চান?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[0, 1000, 2000, 3500, 5000].map((amt) => {
                  const isSelected = extraPayment === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setExtraPayment(amt)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#005232] text-white shadow-xs'
                          : 'bg-white text-[#171d1b] hover:bg-[#eaefeb]'
                      }`}
                    >
                      {amt === 0 ? 'নিয়মিত (৳ ০)' : `+ ৳ ${formatBnCurrency(amt)}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Projection Box */}
            <div className="bg-white rounded-xl p-3 border border-[#bec9bf]/40 space-y-2 text-[12px]">
              <div className="flex justify-between items-center">
                <span className="text-[#3f4942]">মাসিক মোট প্রদেয় হবে:</span>
                <span className="font-bold text-[#005232]">
                  ৳ {formatBnCurrency(effectiveMonthlyPayment)} / মাস
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#3f4942]">প্রত্যাশিত ঋণমুক্তির মেয়াদ:</span>
                <span className="font-extrabold text-[#171d1b]">
                  {toBnNum(plannedMonthsRemaining)} মাস
                </span>
              </div>

              {monthsSaved > 0 && (
                <div className="p-2 rounded-lg bg-[#9cf5c1]/30 border border-[#9cf5c1] text-[11px] text-[#002111] font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#005232]">
                    verified
                  </span>
                  <span>
                    অভিনন্দন! আপনি সাধারণ নিয়মের চেয়ে {toBnNum(monthsSaved)} মাস আগে সম্পূর্ণ ঋণমুক্ত হবেন!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Smart Debt Tips */}
          <div className="bg-white rounded-xl p-3.5 border border-[#eaefeb] text-[11px] space-y-1.5">
            <span className="font-bold text-[#171d1b] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#006972]">
                lightbulb
              </span>
              কিস্তি পরিশোধের দরকারি টিপস
            </span>
            <p className="text-[#3f4942] leading-relaxed">
              • কিস্তির নির্ধারিত তারিখের অন্তত ২ দিন আগে ব্যাংক বা বিকাশ একাউন্টে টাকা রাখুন।
            </p>
            <p className="text-[#3f4942] leading-relaxed">
              • বড় সুদের প্রাতিষ্ঠানিক লোনগুলো আগে পরিশোধ করলে মোট ব্যয়ের বোঝা দ্রুত কমে যায়।
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <aside className="fixed inset-0 z-50 bg-[#171d1b]/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <h4 className="text-[1.125rem] font-bold text-[#171d1b]">ঋণ মুছে ফেলার সতর্কতা</h4>
            <p className="text-[13px] text-[#3f4942] leading-relaxed">
              &quot;{deleteTarget.name}&quot; হিসাবটি মুছে ফেললে আপনার মোট আর্থিক হিসাব ও মাসিক কিস্তির খতিয়ান পরিবর্তিত হবে।
            </p>
            <div className="bg-[#eff5f1] p-2.5 rounded-lg flex items-center gap-2 border border-[#dee4e0]">
              <span className="material-symbols-outlined text-[#6f7a71] text-[18px]">info</span>
              <span className="text-[11px] text-[#6f7a71]">এটি হিসাবের ইতিহাস থেকে চিরতরে মুছে যাবে</span>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#eaefeb] text-[#171d1b] text-[13px] font-semibold hover:bg-[#e4e9e5] cursor-pointer"
                onClick={() => setDeleteTarget(null)}
                type="button"
              >
                বাতিল
              </button>
              <button
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#ba1a1a] text-white text-[13px] font-semibold shadow-sm hover:bg-[#93000a] transition-colors cursor-pointer"
                onClick={handleConfirmDelete}
                type="button"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Add New Bank Loan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#171d1b]/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <form
            onSubmit={handleAddLoanSubmit}
            className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl flex flex-col gap-3 animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-[1.125rem] font-bold text-[#171d1b]">নতুন ব্যাংক ঋণ যোগ</h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#6f7a71] hover:text-[#171d1b]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div>
              <label className="text-[11px] text-[#3f4942] font-semibold block mb-1">ব্যাংক বা ঋণের নাম</label>
              <input
                type="text"
                required
                placeholder="যেমন: সিটি ব্যাংক পার্সোনাল লোন"
                className="w-full bg-[#eff5f1] rounded-xl px-3 py-2 text-[13px] outline-none"
                value={newLoanBank}
                onChange={(e) => setNewLoanBank(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-[#3f4942] font-semibold block mb-1">মূল পরিমাণ (৳)</label>
                <input
                  type="number"
                  required
                  placeholder="১০০০০০"
                  className="w-full bg-[#eff5f1] rounded-xl px-3 py-2 text-[13px] outline-none"
                  value={newLoanAmount}
                  onChange={(e) => setNewLoanAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] text-[#3f4942] font-semibold block mb-1">মাসিক কিস্তি (৳)</label>
                <input
                  type="number"
                  placeholder="৮৫০০"
                  className="w-full bg-[#eff5f1] rounded-xl px-3 py-2 text-[13px] outline-none"
                  value={newLoanEmi}
                  onChange={(e) => setNewLoanEmi(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#eaefeb] text-[13px] font-semibold"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#005232] text-white text-[13px] font-semibold"
              >
                যোগ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New Personal Party Debt Modal */}
      {showAddPartyModal && (
        <div className="fixed inset-0 z-50 bg-[#171d1b]/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <form
            onSubmit={handleAddPartySubmit}
            className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl flex flex-col gap-3 animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-[1.125rem] font-bold text-[#171d1b]">ব্যক্তিগত খাতা এন্ট্রি</h4>
              <button
                type="button"
                onClick={() => setShowAddPartyModal(false)}
                className="text-[#6f7a71] hover:text-[#171d1b]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNewPartyType('receivable')}
                className={`py-2 rounded-xl text-[12px] font-bold cursor-pointer ${
                  newPartyType === 'receivable'
                    ? 'bg-[#8feefc] text-[#006d77]'
                    : 'bg-[#eaefeb] text-[#3f4942]'
                }`}
              >
                পাওনা (পাবো)
              </button>
              <button
                type="button"
                onClick={() => setNewPartyType('payable')}
                className={`py-2 rounded-xl text-[12px] font-bold cursor-pointer ${
                  newPartyType === 'payable'
                    ? 'bg-[#ffdbcf] text-[#812a00]'
                    : 'bg-[#eaefeb] text-[#3f4942]'
                }`}
              >
                দেনা (দিবো)
              </button>
            </div>
            <div>
              <label className="text-[11px] text-[#3f4942] font-semibold block mb-1">ব্যক্তির নাম</label>
              <input
                type="text"
                required
                placeholder="যেমন: জামাল সাহেব"
                className="w-full bg-[#eff5f1] rounded-xl px-3 py-2 text-[13px] outline-none"
                value={newPartyName}
                onChange={(e) => setNewPartyName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#3f4942] font-semibold block mb-1">টাকার পরিমাণ (৳)</label>
              <input
                type="number"
                required
                placeholder="৫০০০"
                className="w-full bg-[#eff5f1] rounded-xl px-3 py-2 text-[13px] outline-none"
                value={newPartyAmount}
                onChange={(e) => setNewPartyAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#3f4942] font-semibold block mb-1">বিবরণ</label>
              <input
                type="text"
                placeholder="যেমন: ব্যবসার ধার"
                className="w-full bg-[#eff5f1] rounded-xl px-3 py-2 text-[13px] outline-none"
                value={newPartyDesc}
                onChange={(e) => setNewPartyDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddPartyModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#eaefeb] text-[13px] font-semibold"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#005232] text-white text-[13px] font-semibold"
              >
                সংরক্ষণ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Helper function for display
function totalLoanOriginalOrRemaining(original: number, remaining: number) {
  return original > 0 ? original : 120000;
}
