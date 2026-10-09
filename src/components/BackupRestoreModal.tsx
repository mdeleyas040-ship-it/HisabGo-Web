import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { validateBackupFile } from '../utils/backupManager';
import { BackupValidationResult, RestoreStrategy } from '../types/backup';
import { formatBnCurrency, toBnNum } from '../utils/formatters';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({ isOpen, onClose }) => {
  const {
    transactions,
    bankLoans,
    personalDebts,
    notifications,
    monthlyBudget,
    downloadBackup,
    restoreFinancialData,
    rollbackToSnapshot,
    hasPreRestoreSnapshot,
    showToast,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'backup' | 'restore'>('backup');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<BackupValidationResult | null>(null);
  const [strategy, setStrategy] = useState<RestoreStrategy>('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRestored, setHasRestored] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    setValidationResult(null);

    try {
      const text = await file.text();
      const result = validateBackupFile(text, file.size);
      setValidationResult(result);
    } catch {
      setValidationResult({
        isValid: false,
        error: 'ফাইলটি পড়তে সমস্যা হয়েছে। সঠিক ফাইল নির্বাচন করুন।',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyRestore = () => {
    if (!validationResult || !validationResult.isValid || !validationResult.data) {
      showToast('বৈধ ব্যাকআপ ফাইল পাওয়া যায়নি', 'error');
      return;
    }

    const success = restoreFinancialData(validationResult.data, strategy);
    if (success) {
      setHasRestored(true);
      showToast(
        strategy === 'replace'
          ? 'সকল হিসাব সফলভাবে প্রতিস্থাপন (Replace) করা হয়েছে'
          : 'নতুন ও সংরক্ষিত হিসাব সফলভাবে একত্রিত (Merge) করা হয়েছে',
        'done_all'
      );
    } else {
      showToast('রিস্টোর সম্পন্ন হতে ব্যর্থ হয়েছে', 'error');
    }
  };

  const handleRollback = () => {
    const success = rollbackToSnapshot();
    if (success) {
      setHasRestored(false);
      setValidationResult(null);
      setSelectedFile(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-[#eaefeb]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#eaefeb] flex items-center justify-between bg-[#eff5f1]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#005232] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">settings_backup_restore</span>
            </div>
            <div>
              <h3 className="text-[1.125rem] font-bold text-[#171d1b]">ডাটা ব্যাকআপ ও রিস্টোর</h3>
              <p className="text-[12px] text-[#3f4942]">নিরাপদ অফলাইন JSON ব্যাকআপ ও পুনরুদ্ধার</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#3f4942] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#eaefeb] bg-white px-5 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 text-[14px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'backup'
                ? 'border-[#005232] text-[#005232]'
                : 'border-transparent text-[#707973] hover:text-[#171d1b]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            ব্যাকআপ ডাউনলোড
          </button>
          <button
            onClick={() => setActiveTab('restore')}
            className={`pb-2.5 text-[14px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'restore'
                ? 'border-[#005232] text-[#005232]'
                : 'border-transparent text-[#707973] hover:text-[#171d1b]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">upload</span>
            ডাটা রিস্টোর / ফিরিয়ে আনুন
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4">
          {activeTab === 'backup' ? (
            <div className="flex flex-col gap-4">
              <div className="bg-[#eff5f1] border border-[#d6dbd7] rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#005232] font-bold text-[14px]">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  বর্তমান সংরক্ষিত হিসাবের সারাংশ
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-[12px] pt-1">
                  <div className="p-2.5 bg-white rounded-lg border border-[#eaefeb]">
                    <span className="text-[#707973] block">মোট লেনদেন:</span>
                    <span className="font-bold text-[#171d1b] text-[14px]">{toBnNum(transactions.length)} টি</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#eaefeb]">
                    <span className="text-[#707973] block">ব্যাংক ঋণ:</span>
                    <span className="font-bold text-[#171d1b] text-[14px]">{toBnNum(bankLoans.length)} টি</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#eaefeb]">
                    <span className="text-[#707973] block">ব্যক্তিগত দেনা/পাওনা:</span>
                    <span className="font-bold text-[#171d1b] text-[14px]">{toBnNum(personalDebts.length)} টি</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#eaefeb]">
                    <span className="text-[#707973] block">মাসিক বাজেট:</span>
                    <span className="font-bold text-[#171d1b] text-[14px]">৳ {formatBnCurrency(monthlyBudget)}</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#3f4942] pt-1">
                  * ব্যাকআপে আপনার সকল লেনদেন, ব্যাংক লোন, ব্যক্তিগত দেনা/পাওনা ও বাজেট সেটিংস অন্তর্ভুক্ত থাকবে।
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={downloadBackup}
                  type="button"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#005232] hover:bg-[#004227] active:scale-[0.99] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  JSON ব্যাকআপ ফাইল ডাউনলোড করুন
                </button>
                <span className="text-[11px] text-center text-[#707973]">
                  ফাইলটি আপনার ডিভাইস বা ড্রাইভের যেকোনো নিরাপদ জায়গায় সংরক্ষণ করতে পারেন।
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Rollback safeguard banner if available */}
              {hasPreRestoreSnapshot() && (
                <div className="p-3 bg-[#e8f5e9] border border-[#a5d6a7] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[12px] text-[#1b5e20]">
                    <span className="material-symbols-outlined text-[18px]">history</span>
                    <span>রিস্টোরের পূর্বের অবস্থার স্ন্যাপশট সংরক্ষিত আছে</span>
                  </div>
                  <button
                    onClick={handleRollback}
                    type="button"
                    className="px-2.5 py-1 text-[11px] font-bold bg-[#1b5e20] text-white rounded-lg hover:bg-[#2e7d32] transition-colors cursor-pointer"
                  >
                    রোলব্যাক করুন
                  </button>
                </div>
              )}

              {/* File input box */}
              <div className="border-2 border-dashed border-[#c2c8c4] hover:border-[#005232] rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2 transition-colors bg-[#fbfdfb]">
                <span className="material-symbols-outlined text-[36px] text-[#005232]">upload_file</span>
                <div>
                  <label
                    htmlFor="backup-file-input"
                    className="cursor-pointer text-[13px] font-bold text-[#005232] hover:underline"
                  >
                    JSON ব্যাকআপ ফাইল নির্বাচন করুন
                  </label>
                  <input
                    id="backup-file-input"
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-[11px] text-[#707973]">অথবা ফাইলটি এখানে নির্বাচন করুন (সর্বোচ্চ ১০ এমবি)</p>
                </div>
                {selectedFile && (
                  <span className="text-[12px] font-semibold text-[#171d1b] bg-[#eff5f1] px-3 py-1 rounded-full border border-[#dee4e0]">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>

              {/* Validation Status */}
              {isProcessing && (
                <div className="p-3 text-[12px] text-center text-[#707973] flex items-center justify-center gap-2">
                  <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                  ফাইল যাচাই ও স্ক্যান করা হচ্ছে...
                </div>
              )}

              {validationResult && !validationResult.isValid && (
                <div className="p-3.5 bg-[#fde8e8] border border-[#f8b4b4] rounded-xl flex items-start gap-2.5 text-[#9b1c1c]">
                  <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
                  <div className="text-[12px]">
                    <span className="font-bold block">ফাইল যাচাই ব্যর্থ হয়েছে:</span>
                    <span>{validationResult.error}</span>
                  </div>
                </div>
              )}

              {validationResult && validationResult.isValid && validationResult.metadata && (
                <div className="bg-[#eff5f1] border border-[#bbf0cb] rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-[#dee4e0] pb-2">
                    <div className="flex items-center gap-1.5 text-[#005232] font-bold text-[13px]">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      বৈধ ব্যাকআপ ফাইল শনাক্ত হয়েছে
                    </div>
                    <span className="text-[10px] text-[#707973]">ভার্সন {validationResult.metadata.schemaVersion}</span>
                  </div>

                  {/* Summary of items in file */}
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div className="p-2 bg-white rounded-lg border border-[#eaefeb]">
                      <span className="text-[#707973] block text-[11px]">পাওয়া গেছে লেনদেন:</span>
                      <span className="font-bold text-[#171d1b]">
                        {toBnNum(validationResult.metadata.itemCounts.transactions)} টি
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#eaefeb]">
                      <span className="text-[#707973] block text-[11px]">ব্যাংক লোন:</span>
                      <span className="font-bold text-[#171d1b]">
                        {toBnNum(validationResult.metadata.itemCounts.bankLoans)} টি
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#eaefeb]">
                      <span className="text-[#707973] block text-[11px]">দেনা/পাওনা:</span>
                      <span className="font-bold text-[#171d1b]">
                        {toBnNum(validationResult.metadata.itemCounts.personalDebts)} টি
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#eaefeb]">
                      <span className="text-[#707973] block text-[11px]">তৈরির তারিখ:</span>
                      <span className="font-bold text-[#171d1b] text-[11px] truncate">
                        {new Date(validationResult.metadata.exportedAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </div>

                  {/* Strategy Choice */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[12px] font-bold text-[#171d1b]">রিস্টোর পদ্ধতি নির্বাচন করুন:</span>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#eaefeb] bg-white cursor-pointer hover:bg-[#f6faf7]">
                        <input
                          type="radio"
                          name="restore-strategy"
                          value="merge"
                          checked={strategy === 'merge'}
                          onChange={() => setStrategy('merge')}
                          className="mt-0.5 text-[#005232] focus:ring-[#005232]"
                        />
                        <div className="flex flex-col text-[12px]">
                          <span className="font-bold text-[#171d1b]">একত্রিত করুন (Merge - নিরাপদ ও প্রস্তাবিত)</span>
                          <span className="text-[11px] text-[#707973]">
                            বর্তমান হিসাব বজায় রেখে নতুন এন্ট্রিগুলো যুক্ত হবে। কোনো বর্তমান ডাটা মুছবে না।
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#f8b4b4] bg-[#fff8f8] cursor-pointer hover:bg-[#fde8e8]">
                        <input
                          type="radio"
                          name="restore-strategy"
                          value="replace"
                          checked={strategy === 'replace'}
                          onChange={() => setStrategy('replace')}
                          className="mt-0.5 text-[#e02424] focus:ring-[#e02424]"
                        />
                        <div className="flex flex-col text-[12px]">
                          <span className="font-bold text-[#9b1c1c]">সম্পূর্ণ প্রতিস্থাপন করুন (Replace)</span>
                          <span className="text-[11px] text-[#9b1c1c]/80">
                            বর্তমান সকল ডাটা ব্যাকআপ ফাইলের ডাটা দিয়ে প্রতিস্থাপিত হবে (স্বয়ংক্রিয় সেফগার резерв রাখা হবে)।
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Confirm Action Button */}
                  <button
                    onClick={handleApplyRestore}
                    type="button"
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-[#005232] hover:bg-[#004227] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">task_alt</span>
                    নিশ্চিত করুন ও রিস্টোর প্রয়োগ করুন
                  </button>
                </div>
              )}

              {hasRestored && (
                <div className="p-3 bg-[#e8f5e9] border border-[#81c784] rounded-xl flex items-center justify-between text-[#1b5e20] text-[12px]">
                  <span className="font-bold">ডাটা সফলভাবে রিস্টোর হয়েছে!</span>
                  <button
                    onClick={onClose}
                    type="button"
                    className="underline text-[12px] font-bold cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#eaefeb] bg-[#fbfdfb] flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-xl text-[13px] font-bold text-[#3f4942] hover:bg-[#eff5f1] transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
