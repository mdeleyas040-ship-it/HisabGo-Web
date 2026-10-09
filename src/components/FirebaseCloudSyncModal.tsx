import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { toBnNum } from '../utils/formatters';

interface FirebaseCloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseCloudSyncModal: React.FC<FirebaseCloudSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    isCloudSyncing,
    cloudSyncStatus,
    cloudSyncError,
    lastCloudSyncTime,
    firebaseConfigStatus,
    signInWithGoogle,
    signOutFirebase,
    syncWithCloud,
    uploadLocalToCloud,
    downloadCloudToLocal,
    transactions,
    bankLoans,
    personalDebts,
    monthlyBudget,
    downloadBackup,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'status' | 'migration' | 'setup'>('status');
  const [migrationConfirmed, setMigrationConfirmed] = useState(false);
  const [hasDownloadedBackupBeforeMigrate, setHasDownloadedBackupBeforeMigrate] = useState(false);

  if (!isOpen) return null;

  const handleBackupFirst = () => {
    downloadBackup();
    setHasDownloadedBackupBeforeMigrate(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-[#eaefeb]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#eaefeb] flex items-center justify-between bg-[#eff5f1]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#005232] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">cloud_sync</span>
            </div>
            <div>
              <h3 className="text-[1.125rem] font-bold text-[#171d1b]">ক্লাউড সিঙ্ক ও ব্যাকআপ</h3>
              <p className="text-[12px] text-[#3f4942]">ল্যাপটপ ও মোবাইলে একাউন্ট সিঙ্ক্রোনাইজেশন</p>
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

        {/* Tab navigation */}
        <div className="flex border-b border-[#eaefeb] bg-white px-5 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 text-[14px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'status'
                ? 'border-[#005232] text-[#005232]'
                : 'border-transparent text-[#707973] hover:text-[#171d1b]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
            সিঙ্ক স্ট্যাটাস
          </button>
          <button
            onClick={() => setActiveTab('migration')}
            className={`pb-2.5 text-[14px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'migration'
                ? 'border-[#005232] text-[#005232]'
                : 'border-transparent text-[#707973] hover:text-[#171d1b]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">drive_file_move</span>
            মাইগ্রেশন উইজার্ড
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`pb-2.5 text-[14px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'setup'
                ? 'border-[#005232] text-[#005232]'
                : 'border-transparent text-[#707973] hover:text-[#171d1b]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            সেটআপ নির্দেশিকা
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4">
          {activeTab === 'status' && (
            <div className="flex flex-col gap-4">
              {/* Firebase Config Banner */}
              {!firebaseConfigStatus.isConfigured ? (
                <div className="p-4 bg-[#fef3c7] border border-[#f59e0b] rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#92400e] font-bold text-[13px]">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                    ফায়ারবেস এনভায়রনমেন্ট ভ্যারিয়েবল কনফিগারেশন প্রয়োজন
                  </div>
                  <p className="text-[12px] text-[#78350f]">
                    ক্লাউড সিঙ্ক সক্রিয় করতে আপনার Firebase কনসোল থেকে প্রজেক্ট তৈরি করে <code>.env</code> ফাইলে ভ্যারিয়েবলগুলো যুক্ত করতে হবে।
                  </p>
                  <div className="text-[11px] bg-white/70 p-2 rounded border border-[#fde68a] text-[#78350f]">
                    <span className="font-bold block">অনুপস্থিত কি (Keys):</span>
                    {firebaseConfigStatus.missingKeys.join(', ')}
                  </div>
                  <button
                    onClick={() => setActiveTab('setup')}
                    type="button"
                    className="self-start text-[12px] font-bold text-[#005232] underline cursor-pointer mt-1"
                  >
                    সেটআপ করার নিয়ম দেখুন →
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-[#e8f5e9] border border-[#81c784] rounded-xl flex items-center gap-2 text-[#1b5e20] text-[12px]">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>ফায়ারবেস এনভায়রনমেন্ট সংযোগ সক্রিয় রয়েছে।</span>
                </div>
              )}

              {/* User Authentication Status */}
              <div className="bg-[#eff5f1] border border-[#dee4e0] rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#171d1b]">অ্যাকাউন্ট স্ট্যাটাস:</span>
                  {currentUser ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#9cf5c1] text-[#002111] text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#005232]"></span>
                      লগইন সক্রিয়
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e5e7eb] text-[#374151] text-[11px] font-bold">
                      লগআউট / অফলাইন
                    </span>
                  )}
                </div>

                {currentUser ? (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#eaefeb]">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-11 h-11 rounded-full object-cover border border-[#bbf0cb]"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#005232] text-white flex items-center justify-center font-bold text-[16px]">
                        {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[13px] font-bold text-[#171d1b] truncate">
                        {currentUser.displayName || 'ব্যবহারকারী'}
                      </span>
                      <span className="text-[11px] text-[#707973] truncate">{currentUser.email}</span>
                      <span className="text-[10px] text-[#006972] font-mono truncate">UID: {currentUser.uid}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[12px] text-[#707973] p-3 bg-white rounded-lg border border-[#eaefeb]">
                    গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন করলে আপনার সকল ডিভাইস থেকে একই আর্থিক খতিয়ান অ্যাক্সেস করতে পারবেন।
                  </div>
                )}

                {/* Auth action buttons */}
                <div>
                  {currentUser ? (
                    <button
                      onClick={signOutFirebase}
                      type="button"
                      className="w-full py-2.5 px-4 rounded-xl border border-[#d6dbd7] hover:bg-black/5 text-[#3f4942] font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      লগআউট করুন
                    </button>
                  ) : (
                    <button
                      onClick={signInWithGoogle}
                      type="button"
                      disabled={!firebaseConfigStatus.isConfigured}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        firebaseConfigStatus.isConfigured
                          ? 'bg-[#005232] text-white hover:bg-[#004227]'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      গুগল দিয়ে সাইন-ইন করুন
                    </button>
                  )}
                </div>
              </div>

              {/* Sync Actions */}
              {currentUser && (
                <div className="flex flex-col gap-3 bg-[#eff5f1] border border-[#dee4e0] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#171d1b]">ক্লাউড সিঙ্ক্রোনাইজেশন:</span>
                    <span className="text-[11px] text-[#707973]">
                      {cloudSyncStatus === 'syncing' ? (
                        <span className="text-[#005232] font-bold flex items-center gap-1">
                          <span className="animate-spin material-symbols-outlined text-[14px]">progress_activity</span>
                          সিঙ্ক চলছে...
                        </span>
                      ) : cloudSyncStatus === 'success' ? (
                        <span className="text-[#005232] font-bold">সিঙ্ক সফল</span>
                      ) : cloudSyncStatus === 'error' ? (
                        <span className="text-[#dc2626] font-bold">সিঙ্ক ত্রুটি</span>
                      ) : (
                        <span>প্রস্তুত</span>
                      )}
                    </span>
                  </div>

                  {lastCloudSyncTime && (
                    <div className="text-[11px] text-[#707973] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      সর্বশেষ সফল সিঙ্ক: {new Date(lastCloudSyncTime).toLocaleTimeString('bn-BD')}
                    </div>
                  )}

                  {cloudSyncError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[11px]">
                      {cloudSyncError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={uploadLocalToCloud}
                      disabled={isCloudSyncing}
                      type="button"
                      className="p-3 bg-white hover:bg-[#f6faf7] border border-[#eaefeb] rounded-xl flex flex-col items-center gap-1 text-[#005232] font-bold text-[12px] cursor-pointer transition-colors shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                      লোকাল থেকে ক্লাউডে তুলুন
                    </button>
                    <button
                      onClick={downloadCloudToLocal}
                      disabled={isCloudSyncing}
                      type="button"
                      className="p-3 bg-white hover:bg-[#f6faf7] border border-[#eaefeb] rounded-xl flex flex-col items-center gap-1 text-[#006972] font-bold text-[12px] cursor-pointer transition-colors shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[20px]">cloud_download</span>
                      ক্লাউড থেকে লোকাল আনুন
                    </button>
                  </div>

                  <button
                    onClick={syncWithCloud}
                    disabled={isCloudSyncing}
                    type="button"
                    className="w-full py-2.5 bg-[#005232] hover:bg-[#004227] text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">sync</span>
                    স্বয়ংক্রিয় দ্বিমুখী সিঙ্ক করুন
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'migration' && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#eff5f1] border border-[#d6dbd7] rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#005232] font-bold text-[14px]">
                  <span className="material-symbols-outlined text-[20px]">drive_file_move</span>
                  নিরাপদ প্রথমবার মাইগ্রেশন উইজার্ড
                </div>
                <p className="text-[12px] text-[#3f4942]">
                  আপনার বর্তমান ব্রাউজারে থাকা লোকাল ডাটা ক্লাউডে আপনার অ্যাকাউন্টে স্থানান্তরের পূর্বে নিরাপত্তা নিশ্চিত করতে নিচের ধাপগুলো অনুসরণ করুন।
                </p>

                {/* Local data preview */}
                <div className="p-3 bg-white rounded-lg border border-[#eaefeb] text-[12px] flex flex-col gap-1.5">
                  <span className="font-bold text-[#171d1b]">বর্তমানে লোকাল স্টোরেজে থাকা তথ্য:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#3f4942]">
                    <span>• মোট লেনদেন: {toBnNum(transactions.length)} টি</span>
                    <span>• ব্যাংক ঋণ: {toBnNum(bankLoans.length)} টি</span>
                    <span>• ব্যক্তিগত দেনা/পাওনা: {toBnNum(personalDebts.length)} টি</span>
                    <span>• বাজেট: ৳ {toBnNum(monthlyBudget)}</span>
                  </div>
                </div>

                {/* Step 1: Download backup */}
                <div className="p-3 bg-white rounded-lg border border-[#eaefeb] flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-[#171d1b]">ধাপ ১: অফলাইন ব্যাকআপ নিন (জরুরি)</span>
                    <span className="text-[11px] text-[#707973]">যেকোনো অনাকাঙ্ক্ষিত ক্ষতি এড়াতে প্রথমে ফাইল সংরক্ষণ করুন</span>
                  </div>
                  <button
                    onClick={handleBackupFirst}
                    type="button"
                    className="px-3 py-1.5 bg-[#005232] text-white rounded-lg text-[12px] font-bold hover:bg-[#004227] transition-colors cursor-pointer shrink-0"
                  >
                    ব্যাকআপ নিন
                  </button>
                </div>

                {/* Step 2: Confirm check */}
                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#eaefeb] bg-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={migrationConfirmed}
                    onChange={(e) => setMigrationConfirmed(e.target.checked)}
                    className="mt-0.5 text-[#005232] focus:ring-[#005232] rounded"
                  />
                  <span className="text-[12px] text-[#171d1b]">
                    আমি বুঝেছি যে এই লোকাল ডাটা ক্লাউডে আমার অ্যাকাউন্টে আপলোড হবে এবং আমার সকল ডিভাইস থেকে তা অ্যাক্সেসযোগ্য হবে।
                  </span>
                </label>

                {/* Step 3: Run migration */}
                <button
                  onClick={uploadLocalToCloud}
                  disabled={!currentUser || !migrationConfirmed || !hasDownloadedBackupBeforeMigrate}
                  type="button"
                  className={`w-full py-3 px-4 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    currentUser && migrationConfirmed && hasDownloadedBackupBeforeMigrate
                      ? 'bg-[#005232] text-white hover:bg-[#004227]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  মাইগ্রেশন সম্পন্ন করুন ও ক্লাউডে আপলোড করুন
                </button>
              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="flex flex-col gap-3 text-[12px] text-[#3f4942]">
              <div className="p-3 bg-[#eff5f1] border border-[#d6dbd7] rounded-xl flex flex-col gap-2">
                <span className="font-bold text-[13px] text-[#005232]">
                  ফায়ারবেস কনসোল কনফিগারেশন নির্দেশিকা (Firebase Console Steps):
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-[12px]">
                  <li>
                    <strong>Firebase Console</strong>-এ গিয়ে (console.firebase.google.com) একটি প্রজেক্ট তৈরি করুন বা নির্বাচন করুন।
                  </li>
                  <li>
                    <strong>Authentication</strong> সেকশনে গিয়ে Google Sign-in মেথড সক্রিয় (Enable) করুন।
                  </li>
                  <li>
                    <strong>Cloud Firestore</strong> ডাটাবেস তৈরি করুন (Production Mode বা Test Mode)।
                  </li>
                  <li>
                    প্রজেক্ট সেটিংসে গিয়ে একটি <strong>Web App</strong> তৈরি করুন এবং ফায়ারবেস কনফিগ কি-গুলো পান।
                  </li>
                  <li>
                    প্রজেক্টের <code>.env</code> ফাইলে নিচের ভ্যারিয়েবলগুলো যুক্ত করুন:
                  </li>
                </ol>
                <div className="p-2.5 bg-black/90 text-[#a7f3d0] rounded-lg font-mono text-[10px] overflow-x-auto">
                  VITE_FIREBASE_API_KEY="your-api-key"<br />
                  VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"<br />
                  VITE_FIREBASE_PROJECT_ID="your-project-id"<br />
                  VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"<br />
                  VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"<br />
                  VITE_FIREBASE_APP_ID="your-app-id"
                </div>
                <div className="pt-1">
                  <strong>সিকিউরিটি রুলস:</strong> প্রজেক্টে <code>firestore.rules</code> ফাইলটি অন্তর্ভুক্ত রয়েছে যা ব্যবহারকারীর ডাটা সম্পূর্ণ পৃথক ও সুরক্ষিত (users/uid) রাখে।
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
