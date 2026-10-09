import React from 'react';
import { useFinance } from '../context/FinanceContext';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useFinance();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-[#171d1b]/40 backdrop-blur-sm p-3">
      <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-2xl mt-12 sm:mt-0 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#eaefeb]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005232] text-[22px]">notifications</span>
            <h3 className="text-[1.125rem] font-bold text-[#171d1b]">বিজ্ঞপ্তি সমূহ</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={markAllNotificationsRead}
              className="text-[11px] text-[#006972] font-semibold hover:underline"
              type="button"
            >
              সব পড়া হয়েছে
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#eaefeb] flex items-center justify-center text-[#3f4942]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-2.5 max-h-[60vh] overflow-y-auto no-scrollbar">
          {notifications.length === 0 ? (
            <p className="text-center py-6 text-[#6f7a71] text-[13px]">কোনো নতুন বিজ্ঞপ্তি নেই</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                  n.read
                    ? 'bg-[#eff5f1] border-[#dee4e0] opacity-80'
                    : 'bg-white border-[#9cf5c1] shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        n.type === 'alert'
                          ? 'bg-[#ba1a1a]'
                          : n.type === 'success'
                          ? 'bg-[#005232]'
                          : 'bg-[#006972]'
                      }`}
                    ></span>
                    <h4 className="text-[13px] font-bold text-[#171d1b]">{n.title}</h4>
                  </div>
                  <span className="text-[10px] text-[#6f7a71]">{n.timeBn}</span>
                </div>
                <p className="text-[12px] text-[#3f4942] mt-1 leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
