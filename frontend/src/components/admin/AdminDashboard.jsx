import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  ShieldAlert, 
  Wallet, 
  Settings, 
  History, 
  MessageSquare, 
  ChevronLeft,  
  ChevronRight, 
  Menu,
  X,
  User,
  Sun, 
  Moon,
  LogOut,
  MoreHorizontal 
} from 'lucide-react';

import DiagnosticsView from './DiagnosticsView';
import VerificationView from './VerificationView';
import { UserManagementView } from './UserManagementView';
import AdminManagementView from './AdminManagementView';
import WalletSettingsView from './WalletSettingsView';
import MaintenanceView from './MaintenanceView';
import AuditLogsView from './AuditLogsView';
import SupportTicketsView from './SupportTicketsView';
import ProfileView from './ProfileView';

/*export default function AdminDashboard({ onLogout }) {
  const [adminData, setAdminData] = useState({
    name: "Zayar Linn",
    role: "Super Admin",
    phone: "09 777 123 456",
    email: "zayarlinn@pay2pay.com",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" // Sample Image
  });*/
//modified code
export default function AdminDashboard({ onLogout }) {
    const [adminData, setAdminData] = useState({
      name: "Loading...", 
      role: "Loading...",
      phone: "Loading...",
      
});
  useEffect(() => {
      setAdminData({
          name: localStorage.getItem('username') || "Admin",
          phone: localStorage.getItem('user_phone') || "No Phone",
          email: localStorage.getItem('user_email') || "No Email",
          role: "Super Admin",
          avatarUrl: "....."
      });
  }, []);
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  
  // Profile dropdown menu control
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Platform configuration states
  const [feeRate, setFeeRate] = useState(2); 
  const [isPlatformOnline, setIsPlatformOnline] = useState(true);
  const [maintenanceMessage, setMaintenanceMessage] = useState('Maintenance Active.');

  // User management records
  const [users, setUsers] = useState([
    { id: 1, name: 'Aung Htet', phone: '09770001111', status: 'Active', totalTxns: 12, isBlacklisted: false },
    { id: 2, name: 'Mya Thandar', phone: '09770002222', status: 'Blocked', totalTxns: 5, isBlacklisted: false },
    { id: 3, name: 'Ko Zaw', phone: '09770003333', status: 'Active', totalTxns: 0, isBlacklisted: true },
  ]);
  const [userSearch, setUserSearch] = useState('');

  //modified code
  const [tickets, setTickets] = useState([]);
  const loadTickets = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tickets');
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Error loading tickets:", error);
    }
  };

  // Transaction ledger logs
  const [transactions, setTransactions] = useState([
    { id: "TXN-9901", date: "2026-06-24 14:30", name: "Ko Min Thant", phone: "09777123456", from: "Wave Pay", to: "KBZPay", code: "542198", amount: 100000, status: "Pending" }
  ]);

  // System audit trail
  //modified code
  const [auditLogs, setAuditLogs] = useState([
        { id: 1, timestamp: "2026-06-25 10:14:22", admin: 'Authorized Admin', action: "Authorized Sync Matrix", ip: "192.168.1.45" }
  ]);

  const handleToggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } : u));
  };

  const handleToggleBlacklist = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isBlacklisted: !u.isBlacklisted } : u));
  };

  const theme = {
    bg: isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800',
    sidebar: isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900',
    header: isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm',
    dropdown: isDarkMode ? 'bg-slate-900 border-slate-800 text-white shadow-slate-950/50' : 'bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/50',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    textTitle: isDarkMode ? 'text-white' : 'text-slate-900',
    hoverMenu: 'hover:bg-slate-500/10 hover:text-amber-500'
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard & Reports', icon: <LayoutDashboard size={16} />, count: 0 },
    { id: 'verification', label: 'Txn Verification', icon: <CheckSquare size={16} />, count: transactions.filter(t => t.status === 'Pending').length },
    { id: 'support', label: 'Support Tickets', icon: <MessageSquare size={16} />, count: tickets.filter(t => t.status === 'Pending').length },
    { id: 'users', label: 'User Management', icon: <Users size={16} /> },
    { id: 'admins', label: 'Admin Management', icon: <ShieldAlert size={16} />, count: 0 },
    { id: 'wallets', label: 'Wallet & Limits', icon: <Wallet size={16} />, count: 0 },
    { id: 'maintenance', label: 'System Settings', icon: <Settings size={16} />, count: 0 },
    { id: 'audit', label: 'Immutable Audit Logs', icon: <History size={16} />, count: 0 },
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard': return <DiagnosticsView theme={theme} isDarkMode={isDarkMode} feeRate={feeRate} transactions={transactions} />;
      case 'verification': return <VerificationView theme={theme} transactions={transactions} setTransactions={setTransactions} />;
      case 'support': return <SupportTicketsView theme={theme} isDarkMode={isDarkMode} tickets={tickets} setTickets={setTickets} />;
      case 'users':
        return (
          <UserManagementView
            theme={theme} isDarkMode={isDarkMode} activeView={activeView}
            userSearch={userSearch} setUserSearch={setUserSearch} users={users}
            handleToggleUserStatus={handleToggleUserStatus} handleToggleBlacklist={handleToggleBlacklist}
          />
        );
      case 'admins': return <AdminManagementView theme={theme} />;
      case 'wallets': return <WalletSettingsView theme={theme} />; 
      case 'maintenance':
        return (
          <MaintenanceView 
            theme={theme} feeRate={feeRate} setFeeRate={setFeeRate} 
            isPlatformOnline={isPlatformOnline} setIsPlatformOnline={setIsPlatformOnline} 
            maintenanceMessage={maintenanceMessage} setMaintenanceMessage={setMaintenanceMessage} 
          />
        );
      case 'audit': return <AuditLogsView theme={theme} isDarkMode={isDarkMode} auditLogs={auditLogs} />;
      case 'profile': return <ProfileView theme={theme} isDarkMode={isDarkMode} adminData={adminData} setAdminData={setAdminData} />;
      default: return <DiagnosticsView theme={theme} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col md:flex-row transition-colors duration-500 ${theme.bg}`}>
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside className={`hidden md:flex flex-col justify-between shrink-0 transition-all duration-300 border-r relative ${theme.sidebar} ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div>
          {/* Logo area */}
          <div className={`px-6 h-[73px] border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            {!isSidebarCollapsed ? (
              <div className="flex items-center w-full">
                <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveView('dashboard')}>
                  <span className="text-xl md:text-2xl font-black tracking-wider text-amber-500">
                    PAY<span className={isDarkMode ? 'text-white' : 'text-zinc-900'}>2</span>PAY
                  </span>
                </div>
                {/* Collapse button with clean, subtle hover effect */}
                <div className="ml-auto">
                  <button
                    onClick={() => setIsSidebarCollapsed(true)}
                    className={`p-2 rounded-xl transition-all duration-200 cursor-pointer text-slate-400 ${
                      isDarkMode ? 'hover:bg-slate-400/5' : 'hover:bg-slate-500/10'
                    }`}
                    title="Collapse Sidebar"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="h-9 w-9 mx-auto rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xs select-none shadow-lg shadow-amber-500/15"
                title="PAY2PAY"
              >
                P2P
              </div>
            )}
          </div>
          
          {/* Main navigation */}
          <nav className="p-3 space-y-1.5">
            {navigationItems.map(item => {
              const isSelected = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  title={isSidebarCollapsed ? item.label : ''}
                  className={`w-full rounded-xl text-xs font-bold transition-all flex items-center relative cursor-pointer ${isSidebarCollapsed ? 'p-3 justify-center' : 'px-4 py-3 justify-between'} ${isSelected ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/15' : `${theme.textMuted} ${theme.hoverMenu}`}`}
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
      </aside>

      {/* 2. MOBILE TOPBAR */}
      <div className={`md:hidden flex items-center justify-between px-4 py-4 border-b ${theme.header}`}>
        <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => setActiveView('dashboard')}>
          <span className="text-lg font-black tracking-wider text-amber-500">
            PAY<span className={isDarkMode ? 'text-white' : 'text-slate-900'}>2</span>PAY
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('profile')}
            className={`p-2 rounded-xl border transition cursor-pointer ${isDarkMode ? 'border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 text-amber-600 shadow-sm hover:bg-slate-100'}`}
            aria-label="Open profile"
          >
            <User size={18} />
          </button>
          <button onClick={() => setIsMenuOpen(true)} className={`p-2 rounded-xl border transition cursor-pointer ${isDarkMode ? 'border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 text-amber-600 shadow-sm hover:bg-slate-100'}`}>
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* 3. MOBILE MENU DRAWER */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className={`relative w-4/5 max-w-sm flex flex-col justify-between h-full p-4 border-r transition-colors duration-300 ${theme.sidebar}`}>
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b">
                <span className="text-sm font-black tracking-wider text-amber-500">PAY2PAY CONTROL</span>
                <button onClick={() => setIsMenuOpen(false)} className={`p-2 rounded-xl border cursor-pointer ${isDarkMode ? 'border-slate-700 bg-slate-800 text-amber-400' : 'border-slate-200 bg-white text-amber-600'}`}>
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-1.5">
                {navigationItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveView(item.id); setIsMenuOpen(false); }}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer group ${activeView === item.id ? 'bg-amber-500 text-slate-950' : `${theme.textMuted} hover:bg-slate-500/10`}`}
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
                <button
                  onClick={() => { setActiveView('profile'); setIsMenuOpen(false); }}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${activeView === 'profile' ? 'bg-amber-500 text-slate-950' : `${theme.textMuted} hover:bg-slate-500/10`}`}
                >
                  <div className="flex items-center gap-3">
                    <User size={16} />
                    Profile
                  </div>
                </button>
              </nav>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-between mb-4 px-2 text-xs font-bold cursor-pointer">
                <span>Toggle Theme</span>
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                onClick={onLogout} 
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all hover:brightness-110 shadow-sm cursor-pointer"
              >
                Exit Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN WORKSPACE */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* DESKTOP HEADER */}
        <header className={`hidden md:flex items-center justify-between px-8 h-[73px] border-b transition-all duration-300 ${theme.header}`}>
          
          {/* Expand button with clean, subtle hover effect */}
          <div className="flex items-center h-full">
            {isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className={`p-2 rounded-xl transition-all duration-200 cursor-pointer text-slate-400 ${
                  isDarkMode ? 'hover:bg-slate-400/5' : 'hover:bg-slate-500/10'
                }`}
                title="Expand Sidebar"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Action layout */}
          <div className="flex items-center gap-4 ml-auto h-full" ref={profileRef}>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-amber-600 hover:bg-slate-100 shadow-sm'}`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Account layout split */}
            <div className={`flex items-center gap-1.5 pl-4 border-l h-12 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              
              {/* Profile Details Trigger */}
         <button 
                onClick={() => setActiveView('profile')}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer text-left focus:outline-none ${
                  isDarkMode ? 'hover:bg-slate-400/5' : 'hover:bg-slate-500/10'
                }`}
                title="View Profile Details"
              >
              
                <div className="h-8 w-8 rounded-full overflow-hidden border border-amber-500/30 flex items-center justify-center shrink-0">
                  <img src={adminData.avatarUrl} alt="Admin" className="w-full h-full object-cover" />
                </div>
                <div className="hidden lg:block">
                  <p className={`text-xs font-black tracking-tight leading-none ${theme.textTitle}`}>{adminData.name}</p>
                  <p className="text-[10px] text-amber-500 font-bold leading-none mt-1">{adminData.role}</p>
                </div>
              </button>

              {/* More Actions Toggle */}
              <div className="relative flex items-center">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`p-2 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none text-slate-400 ${
                    isDarkMode ? 'hover:bg-slate-400/5' : 'hover:bg-slate-500/10'
                  } ${isProfileOpen ? (isDarkMode ? 'bg-slate-400/5' : 'bg-slate-500/10') : ''}`}
                  title="Account Settings"
                >
                  <MoreHorizontal size={16} />
                </button>

                {/* Dropdown Box */}
                {isProfileOpen && (
                  <div className={`absolute right-0 top-[44px] w-48 rounded-xl border p-1.5 z-50 transition-all ${theme.dropdown}`}>
                    <div className={`px-3 py-2 text-[10px] font-bold tracking-wider uppercase border-b mb-1 ${isDarkMode ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-100'}`}>
                      Account Options
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all text-left cursor-pointer"
                    >
                      <LogOut size={14} className="shrink-0" />
                      <span>Exit Session</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </header>

        {/* Dynamic viewport panel */}
        <main className="flex-grow p-4 md:p-8 overflow-y-auto max-w-[1400px] mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

    </div>
  );
}