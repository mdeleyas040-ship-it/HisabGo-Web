import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatBnCurrency, toBnNum } from '../utils/formatters';
import { SetBudgetModal } from './SetBudgetModal';
import { BackupRestoreModal } from './BackupRestoreModal';
import { FirebaseCloudSyncModal } from './FirebaseCloudSyncModal';

export const MoreView: React.FC = () => {
  const {
    monthExpense,
    monthlyBudget,
    budgetUsedPercent,
    isBudgetExceeded90,
    pushNotificationPermission,
    requestPushPermission,
    sendBudgetPushNotification,
    exportTransactionsCSV,
    downloadBackup,
    currentUser,
    firebaseConfigStatus,
    signOutFirebase,
    showToast,
    resetAllData,
  } = useFinance();

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [cloudSyncModalOpen, setCloudSyncModalOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('light');
  const [isBanglaDigits, setIsBanglaDigits] = useState(true);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [pinLockEnabled, setPinLockEnabled] = useState(true);
  const [bioUnlockEnabled, setBioUnlockEnabled] = useState(true);
  const [hideBalanceEnabled, setHideBalanceEnabled] = useState(false);
  const [emiAlertEnabled, setEmiAlertEnabled] = useState(true);

  const handleDriveBackup = () => {
    // Honest status disclosure for Google Drive:
    showToast('গুগল ড্রাইভ ইন্টিগ্রেশন এখনও কনফিগার করা হয়নি। নিরাপদ JSON ব্যাকআপ ব্যবহার করুন।', 'info');
    setBackupModalOpen(true);
  };

  const handleRestoreData = () => {
    setBackupModalOpen(true);
  };

  const handleLogout = () => {
    if (currentUser) {
      signOutFirebase();
    } else {
      showToast('অ্যাকাউন্ট থেকে সফলভাবে লগআউট করা হয়েছে', 'logout');
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 pb-8 select-none animate-in fade-in duration-300">
      {/* Top Profile Card */}
      <div className="relative overflow-hidden bg-white rounded-xl shadow-sm p-4 flex flex-col gap-4 border border-[#eaefeb]">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <img
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-[#9cf5c1]"
              src={currentUser?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuDe5Q1bXUyXE-gGUILEgsvwPCUTgvCqguCvvWCumX5x8k6ANCv5lFm6LVsv8N1t53ti1nHN_o7JP8O6iSdFt1ejUL6zaBhrlP1jr6tMpMidTlW2SOAjiQ0DRiQW_lHOVuGeA4rhVqNTqWGBFGgyNsw1GQE0QlqHuEsBHvOVu6yKkK79YwggV755qf_1Y5rfy3P3V-0-yE5xzBg2Pwa3JWB0dhgM2sANxuYKWjDxhljPDyMRqsJifQYrvA"}
            />
            <button
              onClick={() => showToast('প্রোফাইল ছবি পরিবর্তন ফিচার শীঘ্রই আসছে', 'photo_camera')}
              aria-label="ছবি পরিবর্তন করুন"
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#005232] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">photo_camera</span>
            </button>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h2 className="text-[1.125rem] font-bold text-[#171d1b] truncate">
                {currentUser?.displayName || 'তানভীর আহমেদ'}
              </h2>
              <span className="material-symbols-outlined text-[#005232] text-[18px]">verified</span>
            </div>
            <p className="text-[12px] text-[#3f4942] truncate">
              {currentUser?.email ? currentUser.email : '+৮৮০ ১৭ ১২৩৪ ৫৬৭৮ • tanvir.ahmed@email.com'}
            </p>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#9cf5c1] text-[#002111] text-[10px] font-bold">
                <span className="material-symbols-outlined text-[13px]">workspace_premium</span>
                {currentUser ? 'ক্লাউড সিঙ্কড সদস্য' : 'প্রিমিয়াম সদস্য'}
              </span>
              <span className="text-[10px] text-[#006972] font-semibold">
                {currentUser ? 'ল্যাপটপ ও মোবাইল সক্রিয়' : 'মেয়াদ: আজীবন'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Profile Action Banner */}
        <div className="flex items-center justify-between pt-1 border-t border-[#eaefeb]">
          <div className="flex items-center gap-1.5 text-[#3f4942]">
            <span className="material-symbols-outlined text-[18px] text-[#005232]">verified_user</span>
            <span className="text-[12px] font-medium">কেওয়াইসি ভেরিফিকেশন সম্পূর্ণ</span>
          </div>
          <button
            onClick={() => showToast('প্রোফাইল সম্পাদনা মোড সক্রিয়', 'edit')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#eaefeb] text-[#171d1b] text-[12px] font-bold active:bg-[#e4e9e5] transition-colors shadow-xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">edit</span>
            প্রোফাইল সম্পাদনা
          </button>
        </div>
      </div>

      {/* App Preferences Section */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 px-1">
          <span className="material-symbols-outlined text-[#005232] text-[20px]">tune</span>
          <h3 className="text-[1.125rem] font-bold text-[#171d1b]">অ্যাপের পছন্দসমূহ</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-[#eaefeb]">
          {/* Currency */}
          <button
            onClick={() => showToast('মুদ্রা হিসেবে বাংলাদেশি টাকা (৳ BDT) নির্ধারিত', 'payments')}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left active:bg-[#eff5f1] transition-colors cursor-pointer border-b border-[#eaefeb]"
            type="button"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#eaefeb] flex items-center justify-center text-[#005232] shrink-0">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[#171d1b]">মূদ্রা নির্বাচন (Currency)</span>
                <span className="text-[11px] text-[#3f4942]">বাংলাদেশি টাকা (৳ BDT)</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#3f4942] shrink-0">
              <span className="text-[11px] text-[#005232] font-bold">ডিফল্ট</span>
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </div>
          </button>

          {/* Language */}
          <button
            onClick={() => showToast('ভাষা বাংলা নির্ধারিত রয়েছে', 'translate')}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left active:bg-[#eff5f1] transition-colors cursor-pointer border-b border-[#eaefeb]"
            type="button"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#eaefeb] flex items-center justify-center text-[#005232] shrink-0">
                <span className="material-symbols-outlined text-[20px]">translate</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[#171d1b]">ভাষা (Language)</span>
                <span className="text-[11px] text-[#3f4942]">বাংলা (বাংলা লিপি সক্রিয়)</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#3f4942] shrink-0">
              <span className="text-[11px] text-[#005232] font-bold">বাংলা</span>
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </div>
          </button>

          {/* Monthly Budget Row */}
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#eaefeb]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#eff5f1] flex items-center justify-center text-[#005232] shrink-0">
                <span className="material-symbols-outlined text-[20px]">savings</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[#171d1b]">মাসিক খরচের বাজেট</span>
                <span className="text-[11px] text-[#3f4942]">
                  ব্যবহৃত: ৳ {formatBnCurrency(monthExpense)} ({toBnNum(budgetUsedPercent)}%)
                </span>
              </div>
            </div>
            <button
              onClick={() => setBudgetModalOpen(true)}
              className="flex items-center gap-1 bg-[#eff5f1] hover:bg-[#eaefeb] text-[#005232] px-3 py-1.5 rounded-full text-[12px] font-bold cursor-pointer transition-colors"
              type="button"
            >
              <span>৳ {formatBnCurrency(monthlyBudget)}</span>
              <span className="material-symbols-outlined text-[14px]">edit</span>
            </button>
          </div>

          {/* Theme Selector */}
          <div className="px-4 py-3.5 flex flex-col gap-2.5 border-b border-[#eaefeb]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#eaefeb] flex items-center justify-center text-[#005232] shrink-0">
                  <span className="material-symbols-outlined text-[20px]">palette</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-semibold text-[#171d1b]">অ্যাপ থিম (Theme)</span>
                  <span className="text-[11px] text-[#3f4942]">চোখের আরামদায়ক রঙ নির্বাচন করুন</span>
                </div>
              </div>
            </div>

            {/* 3-Way Segmented Control */}
            <div className="grid grid-cols-3 gap-1 bg-[#eaefeb] p-1 rounded-xl">
              <button
                onClick={() => {
                  setThemeMode('light');
                  showToast('লাইট থিম সক্রিয় করা হয়েছে', 'light_mode');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  themeMode === 'light'
                    ? 'bg-white text-[#005232] shadow-xs'
                    : 'text-[#3f4942] hover:text-[#171d1b]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">light_mode</span>
                লাইট
              </button>
              <button
                onClick={() => {
                  setThemeMode('dark');
                  showToast('ডার্ক মোড মোড সক্রিয় করা হয়েছে', 'dark_mode');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-white text-[#005232] shadow-xs'
                    : 'text-[#3f4942] hover:text-[#171d1b]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">dark_mode</span>
                ডার্ক
              </button>
              <button
                onClick={() => {
                  setThemeMode('system');
                  showToast('সিস্টেম থিম নির্বাচন করা হয়েছে', 'settings_brightness');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  themeMode === 'system'
                    ? 'bg-white text-[#005232] shadow-xs'
                    : 'text-[#3f4942] hover:text-[#171d1b]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">settings_brightness</span>
                সিস্টেম
              </button>
            </div>
          </div>

          {/* Number Format Toggle */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#eaefeb] flex items-center justify-center text-[#005232] shrink-0">
                <span className="material-symbols-outlined text-[20px]">pin</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[#171d1b]">সংখ্যার ধরণ (Number Format)</span>
                <span className="text-[11px] text-[#3f4942]">
                  {isBanglaDigits ? 'বাংলা সংখ্যা (১২,৩৪৫) সক্রিয়' : 'ইংরেজি সংখ্যা (12,345) সক্রিয়'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !isBanglaDigits;
                setIsBanglaDigits(next);
                showToast(next ? 'বাংলা সংখ্যা ফরম্যাট চালু হয়েছে' : 'ইংরেজি সংখ্যা ফরম্যাট চালু হয়েছে', 'pin');
              }}
              className={`w-12 h-7 rounded-full relative flex items-center px-1 transition-colors cursor-pointer ${
                isBanglaDigits ? 'bg-[#005232]' : 'bg-[#d6dbd7]'
              }`}
              type="button"
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  isBanglaDigits ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Backup & Cloud Sync */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 px-1">
          <span className="material-symbols-outlined text-[#005232] text-[20px]">cloud_sync</span>
          <h3 className="text-[1.125rem] font-bold text-[#171d1b]">ডাটা ব্যাকআপ ও সিঙ্ক</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3.5 border border-[#eaefeb]">
          {/* Sync Status Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                currentUser ? 'bg-[#9cf5c1] text-[#005232]' : 'bg-[#eaefeb] text-[#707973]'
              }`}>
                <span className="material-symbols-outlined text-[22px]">
                  {currentUser ? 'cloud_done' : 'cloud_off'}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-[#171d1b]">ক্লাউড সিঙ্ক (Firebase Firestore)</span>
                  {currentUser && (
                    <span className="w-2 h-2 rounded-full bg-[#005232] inline-block"></span>
                  )}
                </div>
                <span className="text-[11px] text-[#006972] font-semibold">
                  {currentUser
                    ? `অ্যাকাউন্ট: ${currentUser.email || currentUser.displayName} • সিঙ্ক সক্রিয়`
                    : firebaseConfigStatus.isConfigured
                    ? 'লগইনされていない • সিঙ্ক শুরু করতে সাইন-ইন করুন'
                    : 'ফায়ারবেস কনফিগ প্রয়োজন • সেটআপ করুন'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setCloudSyncModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-[#eff5f1] hover:bg-[#eaefeb] text-[#005232] text-[12px] font-bold cursor-pointer transition-colors shrink-0"
              type="button"
            >
              সিঙ্ক সেটিংস
            </button>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => setBackupModalOpen(true)}
              className="flex flex-col items-start gap-2 p-3 rounded-xl bg-[#eff5f1] hover:bg-[#eaefeb] active:bg-[#e4e9e5] transition-colors text-left shadow-xs cursor-pointer border border-[#dee4e0]"
              type="button"
            >
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#005232]">
                <span className="material-symbols-outlined text-[18px]">download</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#171d1b]">JSON ব্যাকআপ</span>
                <span className="text-[10px] text-[#3f4942]">অফলাইনে ফাইল ডাউনলোড</span>
              </div>
            </button>

            <button
              onClick={handleRestoreData}
              className="flex flex-col items-start gap-2 p-3 rounded-xl bg-[#eff5f1] hover:bg-[#eaefeb] active:bg-[#e4e9e5] transition-colors text-left shadow-xs cursor-pointer border border-[#dee4e0]"
              type="button"
            >
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#006972]">
                <span className="material-symbols-outlined text-[18px]">settings_backup_restore</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#171d1b]">ডাটা রিস্টোর</span>
                <span className="text-[10px] text-[#3f4942]">JSON ফাইল যাচাই ও লোড</span>
              </div>
            </button>
          </div>

          {/* Google Drive Status Note */}
          <div className="p-2.5 bg-[#fbfdfb] border border-[#eaefeb] rounded-xl flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-[#3f4942]">
              <span className="material-symbols-outlined text-[16px] text-[#005232]">add_to_drive</span>
              <span>গুগল ড্রাইভ ব্যাকআপ:</span>
              <span className="text-[#b45309] font-semibold">OAuth কনফিগারেশন অপেক্ষমাণ</span>
            </div>
            <button
              onClick={handleDriveBackup}
              type="button"
              className="text-[#005232] font-bold hover:underline cursor-pointer"
            >
              বিস্তারিত
            </button>
          </div>

          {/* Data Export Card */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#8feefc] text-[#006d77]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[24px]">description</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-bold">লেনদেন এক্সপোর্ট (CSV)</span>
                <span className="text-[10px] opacity-90 truncate">শুধুমাত্র আয় ও ব্যয়ের তালিকা স্প্রেডশিটে ডাউনলোড করুন</span>
              </div>
            </div>
            <button
              onClick={exportTransactionsCSV}
              className="px-3.5 py-1.5 rounded-full bg-white text-[#005232] text-[12px] font-bold shrink-0 shadow-sm active:scale-95 transition-transform cursor-pointer hover:bg-[#eff5f1]"
              type="button"
            >
              CSV এক্সপোর্ট
            </button>
          </div>
        </div>
      </div>

      {/* Security & Privacy */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 px-1">
          <span className="material-symbols-outlined text-[#005232] text-[20px]">security</span>
          <h3 className="text-[1.125rem] font-bold text-[#171d1b]">নিরাপত্তা ও গোপনীয়তা</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-[#eaefeb]">
          {/* App Lock / PIN */}
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#eaefeb]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#eaefeb] flex items-center justify-center text-[#005232] shrink-0">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[#171d1b]">অ্যাপ লক / ৪-সংখ্যার পিন</span>
                <span className="text-[11px] text-[#3f4942]">অ্যাপ চালু করার সময় পিন চাইবে</span>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !pinLockEnabled;
                setPinLockEnabled(next);
                showToast(next ? 'পিন লক সক্রিয় করা হয়েছে' : 'পিন লক নিষ্ক্রিয় করা হয়েছে', 'lock');
              }}
              className={`w-12 h-7 rounded-full relative flex items-center px-1 shrink-0 transition-colors cursor-pointer ${
                pinLockEnabled ? 'bg-[#005232]' : 'bg-[#d6dbd7]'
              }`}
              type="button"
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  pinLockEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></span>
            </button>
          </div>

          {/* Biometric Unlock */}
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#eaefeb]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#eaefeb] flex items-center justify-center text-[#005232] shrink-0">
                <span className="material-symbols-outlined text-[20px]">fingerprint</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[#171d1b]">ফিঙ্গারপ্রিন্ট / ফেস আইডি</span>
                <span className="text-[11px] text-[#3f4942]">বায়োমেট্রিক দিয়ে তাৎক্ষণিক আনলক</span>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !bioUnlockEnabled;
                setBioUnlockEnabled(next);
                showToast(next ? 'বায়োমেট্রিক আনলক সক্রিয়' : 'বায়োমেট্রিক আনলক বন্ধ', 'fingerprint');
              }}
              className={`w-12 h-7 rounded-full relative flex items-center px-1 shrink-0 transition-colors cursor-pointer ${
                bioUnlockEnabled ? 'bg-[#005232]' : 'bg-[#d6dbd7]'
              }`}
              type="button"
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  bioUnlockEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></span>
            </button>
          </div>

          {/* Hide Balance Toggle */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#eaefeb] flex items-center justify-center text-[#005232] shrink-0">
                <span className="material-symbols-outlined text-[20px]">visibility_off</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[#171d1b]">ব্যালেন্স আড়াল করুন</span>
                <span className="text-[11px] text-[#3f4942]">ড্যাশবোর্ডে মোট টাকা ঢেকে রাখা হবে</span>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !hideBalanceEnabled;
                setHideBalanceEnabled(next);
                showToast(next ? 'ব্যালেন্স গোপন মোড চালু হয়েছে' : 'ব্যালেন্স প্রদর্শন মোড সক্রিয়', 'visibility');
              }}
              className={`w-12 h-7 rounded-full relative flex items-center px-1 shrink-0 transition-colors cursor-pointer ${
                hideBalanceEnabled ? 'bg-[#005232]' : 'bg-[#d6dbd7]'
              }`}
              type="button"
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  hideBalanceEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications & Reminders */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 px-1">
          <span className="material-symbols-outlined text-[#005232] text-[20px]">notifications_active</span>
          <h3 className="text-[1.125rem] font-bold text-[#171d1b]">বিজ্ঞপ্তি ও অনুস্মারক</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-[#eaefeb]">
          {/* Daily Reminder */}
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#eaefeb]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#eaefeb] flex items-center justify-center text-[#005232] shrink-0">
                <span className="material-symbols-outlined text-[20px]">alarm</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[#171d1b]">দৈনিক হিসাব লেখার তাগিদ</span>
                <span className="text-[11px] text-[#006972] font-semibold">প্রতিদিন রাত ৯:০০ টায়</span>
              </div>
            </div>
            <button
              onClick={() => showToast('দৈনিক রিমাইন্ডার রাত ৯:০০ টায় সেট করা আছে', 'schedule')}
              className="px-3 py-1 rounded-lg bg-[#eaefeb] text-[#171d1b] text-[11px] font-bold shrink-0 flex items-center gap-1 active:bg-[#e4e9e5] transition-colors cursor-pointer"
              type="button"
            >
              সময় বদলান
              <span className="material-symbols-outlined text-[14px]">schedule</span>
            </button>
          </div>

          {/* Bill & EMI Alert */}
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#eaefeb]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#eaefeb] flex items-center justify-center text-[#005232] shrink-0">
                <span className="material-symbols-outlined text-[20px]">event_repeat</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[#171d1b]">মাসিক কিস্তি ও বিল অ্যালার্ট</span>
                <span className="text-[11px] text-[#3f4942]">পাওনা বা দেনার শেষ তারিখের আগে সতর্কবার্তা</span>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !emiAlertEnabled;
                setEmiAlertEnabled(next);
                showToast(next ? 'কিস্তি অ্যালার্ট সক্রিয় করা হয়েছে' : 'কিস্তি অ্যালার্ট বন্ধ করা হয়েছে', 'event_repeat');
              }}
              className={`w-12 h-7 rounded-full relative flex items-center px-1 shrink-0 transition-colors cursor-pointer ${
                emiAlertEnabled ? 'bg-[#005232]' : 'bg-[#d6dbd7]'
              }`}
              type="button"
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  emiAlertEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></span>
            </button>
          </div>

          {/* Budget 90% Push Notification Alert */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isBudgetExceeded90 ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#fef3c7] text-[#b45309]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">notification_important</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-[#171d1b]">
                    বাজেট সতর্কবার্তা (৯০%+ সীমা)
                  </span>
                  {isBudgetExceeded90 && (
                    <span className="text-[9px] bg-[#ba1a1a] text-white font-bold px-1.5 py-0.2 rounded-full">
                      সতর্কতা সক্রিয়
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#3f4942]">
                  {pushNotificationPermission === 'granted'
                    ? 'ব্রাউজার পুশ নোটিফিকেশন অনুমোদিত ও সক্রিয়'
                    : 'খরচ ৯০% অতিক্রম করলে পুশ নোটিফিকেশন আসবে'}
                </span>
              </div>
            </div>
            <button
              onClick={async () => {
                if (pushNotificationPermission !== 'granted') {
                  const ok = await requestPushPermission();
                  if (ok) sendBudgetPushNotification();
                } else {
                  sendBudgetPushNotification('বাজেট ৯০% নোটিফিকেশন টেস্ট সফল হয়েছে!');
                }
              }}
              className="px-3 py-1 rounded-lg bg-[#005232] text-white text-[11px] font-bold shrink-0 flex items-center gap-1 active:bg-[#003d24] transition-colors cursor-pointer shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">notifications_active</span>
              <span>{pushNotificationPermission === 'granted' ? 'টেস্ট পাঠান' : 'অনুমোদন দিন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* App Info & Support */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 px-1">
          <span className="material-symbols-outlined text-[#005232] text-[20px]">info</span>
          <h3 className="text-[1.125rem] font-bold text-[#171d1b]">সহায়তা ও তথ্য</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-[#eaefeb]">
          {/* Help & FAQ */}
          <button
            onClick={() => showToast('সহায়তা কেন্দ্র ও সাধারণ প্রশ্নোত্তর খোলা হচ্ছে', 'contact_support')}
            className="px-4 py-3.5 flex items-center justify-between active:bg-[#eff5f1] transition-colors border-b border-[#eaefeb] cursor-pointer text-left"
            type="button"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#eaefeb] flex items-center justify-center text-[#005232] shrink-0">
                <span className="material-symbols-outlined text-[20px]">contact_support</span>
              </div>
              <span className="text-[13px] font-semibold text-[#171d1b]">সহায়তা কেন্দ্র ও সাধারণ জিজ্ঞাসা (FAQ)</span>
            </div>
            <span className="material-symbols-outlined text-[#6f7a71] text-[20px]">chevron_right</span>
          </button>

          {/* Privacy Policy */}
          <button
            onClick={() => showToast('গোপনীয়তা নীতি প্রদর্শিত হচ্ছে', 'policy')}
            className="px-4 py-3.5 flex items-center justify-between active:bg-[#eff5f1] transition-colors border-b border-[#eaefeb] cursor-pointer text-left"
            type="button"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#eaefeb] flex items-center justify-center text-[#005232] shrink-0">
                <span className="material-symbols-outlined text-[20px]">policy</span>
              </div>
              <span className="text-[13px] font-semibold text-[#171d1b]">গোপনীয়তা নীতি ও ব্যবহারের শর্তাবলী</span>
            </div>
            <span className="material-symbols-outlined text-[#6f7a71] text-[20px]">chevron_right</span>
          </button>

          {/* About Hisab Go */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#eaefeb] flex items-center justify-center text-[#005232] shrink-0">
                <span className="material-symbols-outlined text-[20px]">stars</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[#171d1b]">&apos;Hisab Go&apos; সম্পর্কে</span>
                <span className="text-[11px] text-[#3f4942]">হালনাগাদ ভার্সন v২.৪.১ (লেটেস্ট)</span>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#9cf5c1] text-[#002111] text-[10px] font-bold">
              আপ-টু-ডেট
            </span>
          </div>
        </div>
      </div>

      {/* Reset & Logout Section */}
      <div className="pt-1 pb-4 flex flex-col gap-2.5">
        <button
          onClick={resetAllData}
          className="w-full h-11 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#ffb59a]/40 active:scale-[0.98] transition-all cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          ডেমো ডেটা রিসেট করুন
        </button>

        <button
          onClick={handleLogout}
          className="w-full h-12 rounded-xl bg-[#ffdad6] text-[#93000a] flex items-center justify-center gap-2 text-[14px] font-bold active:opacity-90 shadow-sm transition-all cursor-pointer hover:bg-[#ffb59a]/50"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          অ্যাকাউন্ট থেকে লগআউট
        </button>

        <p className="text-center text-[11px] text-[#6f7a71] mt-1">
          Hisab Go • নিরাপদ ও দ্রুত বাংলা হিসাব খাতা © ২০২৫
        </p>
      </div>

      {/* Set Budget Modal */}
      <SetBudgetModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
      />

      {/* Backup & Restore Modal */}
      <BackupRestoreModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
      />

      {/* Firebase Cloud Sync Modal */}
      <FirebaseCloudSyncModal
        isOpen={cloudSyncModalOpen}
        onClose={() => setCloudSyncModalOpen(false)}
      />
    </div>
  );
};
