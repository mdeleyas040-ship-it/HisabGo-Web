import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ExpenseView } from './components/ExpenseView';
import { IncomeView } from './components/IncomeView';
import { DebtsView } from './components/DebtsView';
import { MoreView } from './components/MoreView';
import { QuickEntryModal } from './components/QuickEntryModal';
import { NotificationModal } from './components/NotificationModal';
import { ProfileModal } from './components/ProfileModal';
import { SetBudgetModal } from './components/SetBudgetModal';
import { Toast } from './components/Toast';

const AppContent: React.FC = () => {
  const { activeTab } = useFinance();
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  const [quickEntryType, setQuickEntryType] = useState<'income' | 'expense' | 'debt'>('expense');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  const handleOpenQuickEntry = (type: 'income' | 'expense' | 'debt' = 'expense') => {
    setQuickEntryType(type);
    setQuickEntryOpen(true);
  };

  return (
    <div className="bg-[#f5fbf6] min-h-screen text-[#171d1b] flex flex-col font-sans selection:bg-[#9cf5c1]">
      <Header
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <main className="flex flex-col relative w-full pt-22 pb-24 px-4 bg-[#f5fbf6] flex-1 max-w-lg mx-auto">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenQuickEntry={handleOpenQuickEntry}
            onOpenSetBudget={() => setBudgetModalOpen(true)}
          />
        )}
        {activeTab === 'expense' && (
          <ExpenseView onOpenQuickEntry={() => handleOpenQuickEntry('expense')} />
        )}
        {activeTab === 'income' && <IncomeView />}
        {activeTab === 'debts' && <DebtsView />}
        {activeTab === 'settings' && <MoreView />}
      </main>

      {/* Floating Action Button for Quick Entry */}
      <button
        onClick={() => handleOpenQuickEntry(activeTab === 'income' ? 'income' : activeTab === 'debts' ? 'debt' : 'expense')}
        type="button"
        className="fixed bottom-20 right-4 sm:right-[calc(50%-230px)] z-30 flex items-center gap-1.5 px-4 py-2.5 bg-[#006d44] hover:bg-[#005232] text-white rounded-full shadow-lg shadow-emerald-950/20 active:scale-95 transition-all cursor-pointer group"
        title="নতুন হিসাব যোগ করুন"
        aria-label="নতুন হিসাব যোগ করুন"
      >
        <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">add</span>
        <span className="text-[12px] font-bold">নতুন হিসাব</span>
      </button>

      <BottomNav />

      {/* Modals & Drawers */}
      <QuickEntryModal
        isOpen={quickEntryOpen}
        onClose={() => setQuickEntryOpen(false)}
        initialType={quickEntryType}
      />

      <NotificationModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      <SetBudgetModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
      />

      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
