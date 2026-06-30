import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  ShieldAlert, 
  Wallet, 
  Settings, 
  History, 
  MessageSquare, 
  Menu, 
  X, 
  Sun, 
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Subcomponent Views Imports
import DiagnosticsView from './DiagnosticsView';
import VerificationView from './VerificationView';
import { UserManagementView } from './UserManagementView';
import AdminManagementView from './AdminManagementView';
import WalletSettingsView from './WalletSettingsView';
import MaintenanceView from './MaintenanceView';
import AuditLogsView from './AuditLogsView';
import SupportTicketsView from './SupportTicketsView';

export default function AdminDashboard({ onLogout }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  
  // Platform Configuration States
  const [feeRate, setFeeRate] = useState(2); 
  const [isPlatformOnline, setIsPlatformOnline] = useState(true);
  const [maintenanceMessage, setMaintenanceMessage] = useState('Maintenance Active.');

  // User Management Records State
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState([
    { id: 1, name: 'Aung Htet', phone: '09770001111', status: 'Active', totalTxns: 12, isBlacklisted: false },
    { id: 2, name: 'Mya Thandar', phone: '09770002222', status: 'Blocked', totalTxns: 5, isBlacklisted: false },
    { id: 3, name: 'Ko Zaw', phone: '09770003333', status: 'Active', totalTxns: 0, isBlacklisted: true },
  ]);

  // Customer Support Live Tracking State
  const [tickets, setTickets] = useState([
    { id: 1, txnNo: "TXN-9024", fromPay: "KBZPay", toPay: "Wave Pay", time: "Today 14:10", message: "Voucher uploaded but balance not credited yet.", status: "Pending", adminReply: null },
    { id: 2, txnNo: "TXN-8812", fromPay: "Wave Pay", toPay: "AYA Pay", time: "Yesterday 18:22", message: "Sent wrong amount by mistake.", status: "Resolved", adminReply: "We checked the log and adjusted your transfer logic wallet node." }
  ]);

  // Transaction Ledger Records State
  const [transactions, setTransactions] = useState([
    { id: "TXN-9901", date: "2026-06-24 14:30", name: "Ko Min Thant", phone: "09777123456", from: "Wave Pay", to: "KBZPay", code: "542198", amount: 100000, status: "Pending" }
  ]);

  // Immutable System Auditing Records
  const [auditLogs] = useState([
    { id: 1, timestamp: "2026-06-25 10:14:22", admin: "Zayar Linn", action: "Authorized Sync Matrix", ip: "192.168.1.45" }
  ]);

  // Action Handlers for Subviews
  const handleToggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } : u));
  };

  const handleToggleBlacklist = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isBlacklisted: !u.isBlacklisted } : u));
  };

  // Central Theme Matrix
  const theme = {
    bg: isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800',
    sidebar: isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900',
    card: isDarkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm',
    tableBg: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm',
    th: isDarkMode ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-500 border-slate-200',
    input: isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    textTitle: isDarkMode ? 'text-white' : 'text-slate-900'
  };

  // Navigation Config Matrix
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard & Reports', icon: <LayoutDashboard size={16} />, count: 0 },
    { id: 'verification', label: 'Txn Verification', icon: <CheckSquare size={16} />, count: transactions.filter(t => t.status === 'Pending').length },
    { id: 'support', label: 'Support Tickets', icon: <MessageSquare size={16} />, count: tickets.filter(t => t.status === 'Pending').length },
    { id: 'users', label: 'User Management', icon: <Users size={16} />, count: users.length },
    { id: 'admins', label: 'Admin Management', icon: <ShieldAlert size={16} />, count: 0 },
    { id: 'wallets', label: 'Wallet & Limits', icon: <Wallet size={16} />, count: 0 },
    { id: 'maintenance', label: 'System Settings', icon: <Settings size={16} />, count: 0 },
    { id: 'audit', label: 'Immutable Audit Logs', icon: <History size={16} />, count: 0 },
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DiagnosticsView theme={theme} isDarkMode={isDarkMode} feeRate={feeRate} transactions={transactions} />;
      case 'verification':
        return <VerificationView theme={theme} transactions={transactions} setTransactions={setTransactions} />;
      case 'support':
        return <SupportTicketsView theme={theme} isDarkMode={isDarkMode} tickets={tickets} setTickets={setTickets} />;
      case 'users':
        return (
          <UserManagementView
            theme={theme}
            isDarkMode={isDarkMode}
            activeView={activeView}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            users={users}
            handleToggleUserStatus={handleToggleUserStatus}
            handleToggleBlacklist={handleToggleBlacklist}
          />
        );
      case 'admins':
        return <AdminManagementView theme={theme} />;
      case 'wallets':
        return <WalletSettingsView theme={theme} />;
      case 'maintenance':
        return (
          <MaintenanceView 
            theme={theme} feeRate={feeRate} setFeeRate={setFeeRate} 
            isPlatformOnline={isPlatformOnline} setIsPlatformOnline={setIsPlatformOnline} 
            maintenanceMessage={maintenanceMessage} setMaintenanceMessage={setMaintenanceMessage} 
          />
        );
      case 'audit':
        return <AuditLogsView theme={theme} isDarkMode={isDarkMode} auditLogs={auditLogs} />;
      default:
        return <DiagnosticsView theme={theme} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col md:flex-row transition-colors duration-500 ${theme.bg}`}>
      
      {/* 1. DESKTOP SIDEBAR NAVIGATION */}
      <aside className={`hidden md:flex flex-col justify-between shrink-0 transition-all duration-300 border-r relative ${theme.sidebar} ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div>
          {/* LOGO MATRIX & INLINE THEME SWITCH */}
          <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            {!isSidebarCollapsed ? (
              <div className="flex items-center w-full">
                <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveView('dashboard')}>
                  <span className="text-xl md:text-2xl font-black tracking-wider text-amber-500">
                    PAY<span className={isDarkMode ? 'text-white' : 'text-zinc-900'}>2</span>PAY
                  </span>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300' : 'bg-slate-50 border-slate-200 text-amber-600 hover:bg-amber-100 shadow-sm'}`}
                    aria-label="Toggle theme"
                  >
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="h-9 w-9 mx-auto rounded-xl bg-amber-500 hover:bg-amber-600 transition-colors duration-200 flex items-center justify-center font-black text-slate-950 text-sm tracking-wider cursor-pointer shadow-lg shadow-amber-500/15" 
                onClick={() => setActiveView('dashboard')}
              >
                P2P
              </div>
            )}
          </div>
          
          {/* APP INTERFACE NAVIGATION NODE LINKS */}
          <nav className="p-3 space-y-1.5">
            {navigationItems.map(item => {
              const isSelected = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  title={isSidebarCollapsed ? item.label : ''}
                  className={`w-full rounded-xl text-xs font-bold transition-all flex items-center relative ${isSidebarCollapsed ? 'p-3 justify-center' : 'px-4 py-3 justify-between'} ${isSelected ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/15' : `${theme.textMuted} hover:bg-slate-500/10 hover:text-amber-500`}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className={isSelected ? 'text-amber-900' : 'text-slate-400 group-hover:text-amber-500 transition-colors'}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {item.count > 0 && (
                    <span className={`bg-slate-950 text-amber-400 text-[10px] rounded-full font-black ${isSidebarCollapsed ? 'absolute -top-1 -right-1 px-1.5 py-0.5 scale-90' : 'px-2 py-0.5'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SIDEBAR COLLAPSIBLE CONNECTOR BUTTON */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 rounded-full border items-center justify-center shadow-md bg-amber-500 text-slate-950 border-amber-500 hover:bg-amber-600 z-10"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* TERMINATION CONTROL DESK FOOTER */}
        <div className={`p-3 border-t ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
          {isSidebarCollapsed && (
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-8 h-8 mx-auto mb-3 flex items-center justify-center rounded-xl border border-slate-700 text-amber-400 bg-slate-800">
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}
          <div className="flex items-center gap-3 mb-3 justify-center md:justify-start overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-500 shrink-0">ZL</div>
            {!isSidebarCollapsed && (
              <div className="truncate">
                <p className={`text-xs font-bold ${theme.textTitle} truncate`}>Zayar Linn</p>
                <p className="text-[10px] text-amber-500 font-medium">Super Admin</p>
              </div>
            )}
          </div>
          <button 
            onClick={onLogout} 
            className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all hover:brightness-110 shadow-sm"
          >
            {isSidebarCollapsed ? 'Exit' : 'Exit Session'}
          </button>
        </div>
      </aside>

      {/* 2. MOBILE INTERFACE NAVIGATION BAR COMPONENT */}
      <div className={`md:hidden flex items-center justify-between px-4 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900'}`}>
        <div className="flex items-center gap-2 select-none" onClick={() => setActiveView('dashboard')}>
          <span className="text-lg font-black tracking-wider text-amber-500">
            PAY<span className={isDarkMode ? 'text-white' : 'text-slate-900'}>2</span>PAY
          </span>
        </div>
        <button onClick={() => setIsMenuOpen(true)} className={`p-2 rounded-xl border transition ${isDarkMode ? 'border-slate-700 bg-slate-800 text-amber-400' : 'border-slate-200 bg-white text-amber-600'}`}>
          <Menu size={20} />
        </button>
      </div>

      {/* 3. MOBILE SIDEBAR DRAWER SYSTEM */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className={`relative w-4/5 max-w-sm flex flex-col justify-between h-full p-4 border-r transition-colors duration-300 ${theme.sidebar}`}>
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b">
                <span className="text-sm font-black tracking-wider text-amber-500">PAY2PAY CONTROL</span>
                <button onClick={() => setIsMenuOpen(false)} className={`p-2 rounded-xl border ${isDarkMode ? 'border-slate-700 bg-slate-800 text-amber-400' : 'border-slate-200 bg-white text-amber-600'}`}>
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-1.5">
                {navigationItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveView(item.id); setIsMenuOpen(false); }}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${activeView === item.id ? 'bg-amber-500 text-slate-950' : `${theme.textMuted} hover:bg-slate-500/10`}`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </div>
                    {item.count > 0 && (
                      <span className="bg-slate-950 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-black">{item.count}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-between mb-4 px-2 text-xs font-bold">
                <span>Toggle Theme</span>
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                onClick={onLogout} 
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all hover:brightness-110 shadow-sm"
              >
                Exit Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. WORKSPACE VIEWPORT LAYER */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto max-w-[1400px] mx-auto w-full">
        {renderActiveView()}
      </main>

    </div>
  );
}