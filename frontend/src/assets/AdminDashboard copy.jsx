import React, { useState } from 'react';
import { 
  LayoutDashboard, CheckSquare, Users, ShieldAlert, Wallet, 
  Settings, History, Search, Download, Check, X, UserMinus, 
  PlusCircle, ToggleLeft, ToggleRight, AlertTriangle, Menu, Sun, Moon, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function AdminDashboard({ onLogout }) {
  // --- THEME & SIDEBAR STATES ---
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile drawer status
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop collapsed status
  
  // --- GLOBAL STATES (MOCK DATA) ---
  const [feeRate, setFeeRate] = useState(2); // Dynamic Fee %
  const [isPlatformOnline, setIsPlatformOnline] = useState(true);
  const [maintenanceMessage, setMaintenanceMessage] = useState('KBZPay is currently down for maintenance');
  const [userSearch, setUserSearch] = useState('');

  // 1. Transactions State
  const [transactions, setTransactions] = useState([
    { id: "TXN-9901", date: "2026-06-24 14:30", name: "Ko Min Thant", phone: "09777123456", from: "Wave Pay", to: "KBZPay", code: "542198", amount: 100000, status: "Pending" },
    { id: "TXN-9902", date: "2026-06-24 15:12", name: "Ma Su Mon", phone: "09444987654", from: "KBZPay", to: "Wave Pay", code: "883210", amount: 50000, status: "Pending" },
    { id: "TXN-9903", date: "2026-06-24 15:20", name: "U Ba Tin", phone: "09222555666", from: "CB Pay", to: "AYA Pay", code: "104952", amount: 250000, status: "Pending" }
  ]);

  // 2. Users State
  const [users, setUsers] = useState([
    { id: 1, name: "Ko Min Thant", phone: "09777123456", status: "Active", totalTxns: 14, isBlacklisted: false },
    { id: 2, name: "Ma Su Mon", phone: "09444987654", status: "Active", totalTxns: 8, isBlacklisted: false },
    { id: 3, name: "Aung Aung", phone: "09666888222", status: "Blocked", totalTxns: 2, isBlacklisted: true }
  ]);

  // 3. Admins State
  const [admins, setAdmins] = useState([
    { id: 1, name: "Zayar Linn", email: "zayar@pay2pay.com", phone: "09111222333", role: "Super Admin", status: "Active" },
    { id: 2, name: "Htet Htet", email: "htet@pay2pay.com", phone: "09444555666", role: "Support", status: "Active" }
  ]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', phone: '', password: '', role: 'Support' });

  // 4. Wallets State
  const [wallets, setWallets] = useState([
    { id: 1, name: "KBZPay Account 1", number: "09777123456", holder: "U Tun Tun Oo", status: "Active", currentVolume: 4200000, limitWarning: 5000000 },
    { id: 2, name: "Wave Pay Account 1", number: "09977123456", holder: "Daw Hla Hla Nu", status: "Active", currentVolume: 1500000, limitWarning: 5000000 },
    { id: 3, name: "CB Pay Account 1", number: "09444123456", holder: "Ko Kyaw Zin Win", status: "Inactive", currentVolume: 0, limitWarning: 7000000 }
  ]);

  // 5. Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, timestamp: "2026-06-24 15:01:23", admin: "Zayar Linn", action: "Approved Transaction TXN-9890", ip: "192.168.1.5" },
    { id: 2, timestamp: "2026-06-24 14:15:44", admin: "Htet Htet", action: "Updated System Fee to 2%", ip: "192.168.1.12" },
    { id: 3, timestamp: "2026-06-24 11:02:10", admin: "Zayar Linn", action: "Blocked User: Aung Aung (Reason: Fraud Suspicion)", ip: "192.168.1.5" }
  ]);

  // --- ACTIONS HANDLERS ---
  const handleVerifyTxn = (id, action) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: action === 'approve' ? 'Success' : 'Rejected' } : t));
    const target = transactions.find(t => t.id === id);
    const logMsg = `${action === 'approve' ? 'Approved' : 'Rejected'} transaction ${id} for ${target?.name} (${target?.amount.toLocaleString()} MMK)`;
    setAuditLogs(prev => [{ id: Date.now(), timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), admin: "Current Admin", action: logMsg, ip: "127.0.0.1" }, ...prev]);
  };

  const handleToggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } : u));
  };

  const handleToggleBlacklist = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isBlacklisted: !u.isBlacklisted } : u));
  };

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email || !newAdmin.phone || !newAdmin.password) return;
    setAdmins(prev => [...prev, { ...newAdmin, id: Date.now(), status: 'Active' }]);
    setNewAdmin({ name: '', email: '', phone: '', password: '', role: 'Support' });
  };

  const handleRevokeAdmin = (id) => {
    setAdmins(prev => prev.filter(a => a.id !== id));
  };

  const handleToggleWallet = (id) => {
    setWallets(prev => prev.map(w => w.id === id ? { ...w, status: w.status === 'Active' ? 'Inactive' : 'Active' } : w));
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard & Reports', icon: <LayoutDashboard size={18} /> },
    { id: 'verification', label: 'Txn Verification', icon: <CheckSquare size={18} />, count: transactions.filter(t => t.status === 'Pending').length },
    { id: 'users', label: 'User Management', icon: <Users size={18} /> },
    { id: 'admins', label: 'Admin Management', icon: <ShieldAlert size={18} /> },
    { id: 'wallets', label: 'Wallet & Limits', icon: <Wallet size={18} /> },
    { id: 'maintenance', label: 'System Settings & Rates', icon: <Settings size={18} /> },
    { id: 'audit', label: 'Audit Logs & Security', icon: <History size={18} /> },
  ];

  const theme = {
    bg: isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800',
    sidebar: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm',
    card: isDarkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200/80 shadow-sm',
    tableBg: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm',
    th: isDarkMode ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-500 border-slate-200',
    tdBorder: isDarkMode ? 'border-slate-800/60' : 'border-slate-200/80',
    input: isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    textTitle: isDarkMode ? 'text-white' : 'text-slate-900'
  };

  return (
    <div className={`flex flex-col md:flex-row min-h-screen font-sans antialiased transition-colors duration-300 ${theme.bg}`}>
      
      {/* SIDEBAR NAVIGATION (DESKTOP) */}
      <aside className={`hidden md:flex flex-col justify-between shrink-0 transition-all duration-300 border-r relative ${theme.sidebar} ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div>
          {/* LOGO ON LEFT | MODE ICON ON RIGHT */}
          <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            {!isSidebarCollapsed ? (
              <>
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
                      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-9 w-9 mx-auto rounded-xl bg-amber-500 hover:bg-amber-600 transition-colors duration-200 flex items-center justify-center font-black text-slate-950 text-sm tracking-wider cursor-pointer shadow-lg shadow-amber-500/15" onClick={() => setActiveView('dashboard')}>P2P</div>
            )}
          </div>
          
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
                    <span className={isSelected ? 'text-amber-300' : 'text-slate-400 group-hover:text-amber-500 transition-colors'}>{item.icon}</span>
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {item.count > 0 && (
                    <span className={`bg-amber-500 text-slate-950 text-[10px] rounded-full font-black ${isSidebarCollapsed ? 'absolute -top-1 -right-1 px-1.5 py-0.5 scale-90' : 'px-2 py-0.5'}`}>{item.count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SIDEBAR HINGE TOGGLE BUTTON */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 rounded-full border items-center justify-center shadow-md bg-amber-500 text-slate-950 border-amber-500 hover:bg-amber-600 z-10"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* BOTTOM PANEL */}
        <div className={`p-3 border-t ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
          {isSidebarCollapsed && (
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-8 h-8 mx-auto mb-3 flex items-center justify-center rounded-xl border border-slate-700 text-amber-400 bg-slate-800">
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}
          <div className="flex items-center gap-3 mb-3 justify-center md:justify-start overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-500 shrink-0">ZA</div>
            {!isSidebarCollapsed && (
              <div className="truncate">
                <p className={`text-xs font-bold ${theme.textTitle} truncate`}>Zayar Linn</p>
                <p className="text-[10px] text-amber-500 font-medium">Super Admin</p>
              </div>
            )}
          </div>
          <button onClick={onLogout} className={`w-full py-2 border rounded-xl text-xs font-bold transition-all text-center ${isSidebarCollapsed ? 'px-0 text-[10px]' : ''} ${'bg-amber-500 hover:bg-amber-600 border-amber-500 text-slate-950 shadow-sm'}`}>
            {isSidebarCollapsed ? 'Exit' : 'Exit Session'}
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER (LOGO ON LEFT | HAMBURGER ON RIGHT) */}
      <div className={`md:hidden flex items-center justify-between px-4 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900'}`}>
        <div className="flex items-center gap-2 select-none" onClick={() => setActiveView('dashboard')}>
          <span className="text-lg font-black tracking-wider text-yellow-400">
            PAY<span className="text-white">2</span>PAY
          </span>
        </div>
        <button onClick={() => setIsMenuOpen(true)} className={`p-2 rounded-xl border transition ${isDarkMode ? 'border-slate-700 bg-slate-800 text-amber-400' : 'border-slate-200 bg-white text-amber-600'}`}>
          <Menu size={20} />
        </button>
      </div>

      {/* MOBILE SIDEBAR PANEL (DRAWER OVERLAY) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
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
                  </button>
                ))}
              </nav>
            </div>
            <div className="pt-4 border-t">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-between mb-4 px-2 text-xs font-bold">
                <span>Toggle Theme</span>
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={onLogout} className="w-full py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">Exit Session</button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto max-w-[1400px] mx-auto w-full">
        {!isPlatformOnline && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-amber-500">
            <AlertTriangle className="shrink-0" size={20} />
            <div className="text-xs font-medium">
              <strong className="font-bold uppercase tracking-wider mr-2">Maintenance Active:</strong> 
              Platform is offline for users. Notice: "{maintenanceMessage}"
            </div>
          </div>
        )}

        {/* 1. DASHBOARD & PROFIT REPORTS VIEW */}
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>Platform Diagnostics</h2>
                <p className={`text-xs mt-1 ${theme.textMuted}`}>Real-time revenue clearance and ledger nodes evaluation</p>
              </div>
              
              <div className={`flex flex-wrap items-center gap-2 p-2 rounded-xl border ${theme.card}`}>
                <input type="date" defaultValue="2026-06-01" className={`rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none ${theme.input}`} />
                <span className="text-slate-400 text-xs font-bold">To</span>
                <input type="date" defaultValue="2026-06-24" className={`rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none ${theme.input}`} />
                <button className="bg-amber-500 hover:bg-amber-600 px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 transition-colors">Filter</button>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`border p-5 rounded-2xl ${theme.card}`}>
                <p className={`text-[10px] font-extrabold uppercase tracking-widest ${theme.textMuted}`}>Today's Total In</p>
                <p className={`text-2xl font-black mt-1.5 ${theme.textTitle}`}>3,450,000 <span className="text-xs font-medium text-slate-400">MMK</span></p>
              </div>
              <div className={`border p-5 rounded-2xl ${theme.card}`}>
                <p className={`text-[10px] font-extrabold uppercase tracking-widest ${theme.textMuted}`}>Total Paid Out</p>
                <p className={`text-2xl font-black mt-1.5 ${theme.textTitle}`}>3,381,000 <span className="text-xs font-medium text-slate-400">MMK</span></p>
              </div>
              <div className={`border bg-emerald-500/5 p-5 rounded-2xl ${isDarkMode ? 'border-emerald-500/20' : 'border-emerald-200'}`}>
                <p className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-widest">Net Profit ({feeRate}%)</p>
                <p className="text-2xl font-black text-emerald-600 mt-1.5">+69,000 <span className="text-xs font-medium text-emerald-600/70">MMK</span></p>
              </div>
              <div className={`border p-5 rounded-2xl ${theme.card}`}>
                <p className="text-[10px] font-extrabold uppercase text-amber-500 tracking-widest">Pending Verification</p>
                <p className="text-2xl font-black text-amber-500 mt-1.5">{transactions.filter(t=>t.status==='Pending').length} <span className="text-xs font-medium text-slate-400">Orders</span></p>
              </div>
            </div>

            {/* Profit Table */}
            <div className={`border rounded-2xl overflow-hidden ${theme.tableBg}`}>
              <div className={`p-5 border-b flex flex-col sm:flex-row gap-3 justify-between sm:items-center ${isDarkMode?'border-slate-800':'border-slate-200'}`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.textTitle}`}>Settlement Records</h3>
                <button className={`border rounded-xl px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200':'bg-white border-slate-200 text-slate-700'}`}>
                  <Download size={14} className="text-amber-500" /> Export to Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                  <thead>
                    <tr className={`font-extrabold border-b uppercase tracking-wider ${theme.th}`}>
                      <th className="p-4">Settlement Date</th>
                      <th className="p-4 text-center">Total Orders</th>
                      <th className="p-4">Total Cash In (MMK)</th>
                      <th className="p-4">Total Outflow (MMK)</th>
                      <th className="p-4 text-emerald-600">Profit Generated</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-medium ${isDarkMode?'divide-slate-800/60':'divide-slate-200'}`}>
                    <tr className={isDarkMode?'hover:bg-slate-800/30':'hover:bg-slate-50'}>
                      <td className={`p-4 font-mono font-bold ${isDarkMode?'text-slate-300':'text-slate-700'}`}>Jun 24, 2026</td>
                      <td className={`p-4 text-center font-bold ${theme.textTitle}`}>42</td>
                      <td className="p-4">3,450,000</td>
                      <td className="p-4">3,381,000</td>
                      <td className="p-4 text-emerald-600 font-bold">+69,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. TRANSACTION VERIFICATION VIEW */}
        {activeView === 'verification' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>Voucher Auditing Desk</h2>
              <p className={`text-xs mt-1 ${theme.textMuted}`}>Manual security review to approve or decline pending remits</p>
            </div>

            <div className={`border rounded-2xl overflow-hidden ${theme.tableBg}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                  <thead>
                    <tr className={`font-extrabold border-b uppercase tracking-wider ${theme.th}`}>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Customer Network</th>
                      <th className="p-4 text-amber-500">Txn Code</th>
                      <th className="p-4">Amount In</th>
                      <th className="p-4 text-amber-500">Payout (-{feeRate}%)</th>
                      <th className="p-4 text-right">Verification Logic</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode?'divide-slate-800/60':'divide-slate-200'}`}>
                    {transactions.filter(t => t.status === 'Pending').length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-400 font-bold">🎉 All transactions are fully verified and settled.</td>
                      </tr>
                    ) : (
                      transactions.filter(t => t.status === 'Pending').map(txn => {
                        const netPayout = txn.amount * (1 - (feeRate / 100));
                        return (
                          <tr key={txn.id} className={`font-medium ${isDarkMode?'hover:bg-slate-800/30':'hover:bg-slate-50'}`}>
                            <td className="p-4 font-mono text-slate-400">{txn.date}</td>
                            <td className="p-4">
                              <p className={`font-bold ${theme.textTitle}`}>{txn.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{txn.phone}</p>
                            </td>
                            <td className="p-4 font-mono font-bold text-sm text-amber-500 tracking-wider bg-amber-500/5">{txn.code}</td>
                            <td className={`p-4 font-bold ${theme.textTitle}`}>{txn.amount.toLocaleString()} <span className="text-[10px] text-slate-400 font-medium">MMK</span></td>
                            <td className="p-4 text-amber-500 font-black">{netPayout.toLocaleString()} <span className="text-[10px] text-slate-400 font-medium">MMK</span></td>
                            <td className="p-4 text-right space-x-2 whitespace-nowrap">
                              <button onClick={() => handleVerifyTxn(txn.id, 'reject')} className="bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-500 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1">
                                <X size={14} /> Reject
                              </button>
                              <button onClick={() => handleVerifyTxn(txn.id, 'approve')} className="bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 shadow-sm">
                                <Check size={14} /> Approve
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. USER MANAGEMENT VIEW */}
        {activeView === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>User Ledger Registry</h2>
                <p className={`text-xs mt-1 ${theme.textMuted}`}>Manage network access limitations and account standing status</p>
              </div>

              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by phone index number..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none placeholder-slate-400 ${theme.input}`}
                />
              </div>
            </div>

            <div className={`border rounded-2xl overflow-hidden ${theme.tableBg}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className={`font-extrabold border-b uppercase tracking-wider ${theme.th}`}>
                      <th className="p-4">Account Holder Name</th>
                      <th className="p-4">Phone Matrix</th>
                      <th className="p-4 text-center">Platform Status</th>
                      <th className="p-4 text-center">Transactions Count</th>
                      <th className="p-4 text-right">Access Controls</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-medium ${isDarkMode?'divide-slate-800/60':'divide-slate-200'}`}>
                    {users
                      .filter(u => u.phone.includes(userSearch))
                      .map(user => (
                        <tr key={user.id} className={`${isDarkMode?'hover:bg-slate-800/20':'hover:bg-slate-50'} ${user.isBlacklisted ? 'bg-rose-500/5' : ''}`}>
                          <td className={`p-4 font-bold flex items-center gap-2 ${theme.textTitle}`}>
                            {user.name}
                            {user.isBlacklisted && <span className="text-[9px] bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded border border-rose-500/30 uppercase font-black tracking-widest">Blacklisted</span>}
                          </td>
                          <td className="p-4 font-mono text-slate-400">{user.phone}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-200 text-slate-500 border border-slate-300'}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className={`p-4 text-center font-bold ${theme.textTitle}`}>{user.totalTxns} Orders</td>
                          <td className="p-4 text-right space-x-2 whitespace-nowrap">
                            <button onClick={() => handleToggleUserStatus(user.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${user.status === 'Active' ? 'bg-slate-500/10 text-slate-600 border-slate-300' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                              {user.status === 'Active' ? 'Block Access' : 'Unblock Account'}
                            </button>
                            <button onClick={() => handleToggleBlacklist(user.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${user.isBlacklisted ? 'bg-rose-600 text-white' : 'bg-rose-500/10 text-rose-500'}`}>
                              {user.isBlacklisted ? 'Remove Flag' : 'Add Blacklist'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. ADMIN MANAGEMENT VIEW */}
        {activeView === 'admins' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>Administrative Security Node</h2>
              <p className={`text-xs mt-1 ${theme.textMuted}`}>Provision access tokens and handle internal operations hierarchy roles</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <form onSubmit={handleCreateAdmin} className={`border p-6 rounded-2xl space-y-4 ${theme.card}`}>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                  <PlusCircle size={16} /> Assign Operator Token
                </h3>
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Full Name</label>
                  <input required type="text" placeholder="Mg Mg" value={newAdmin.name} onChange={e=>setNewAdmin({...newAdmin, name: e.target.value})} className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none ${theme.input}`} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Email Link Address</label>
                  <input required type="email" placeholder="operator@pay2pay.com" value={newAdmin.email} onChange={e=>setNewAdmin({...newAdmin, email: e.target.value})} className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none ${theme.input}`} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Phone Index</label>
                  <input required type="text" placeholder="09xxxxxxxxx" value={newAdmin.phone} onChange={e=>setNewAdmin({...newAdmin, phone: e.target.value})} className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none ${theme.input}`} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Password Key</label>
                  <input required type="password" placeholder="Enter a strong password" value={newAdmin.password} onChange={e=>setNewAdmin({...newAdmin, password: e.target.value})} className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none ${theme.input}`} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Authority Role Node</label>
                  <select value={newAdmin.role} onChange={e=>setNewAdmin({...newAdmin, role: e.target.value})} className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none font-semibold ${theme.input}`}>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-amber-500/15">
                  Create Admin Account
                </button>
              </form>

              <div className={`lg:col-span-2 border rounded-2xl overflow-hidden ${theme.tableBg}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[550px]">
                    <thead>
                      <tr className={`font-extrabold border-b uppercase tracking-wider ${theme.th}`}>
                        <th className="p-4">Admin Profile Node</th>
                        <th className="p-4">Access Level</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Revoke Protocol</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y font-medium ${isDarkMode?'divide-slate-800/60':'divide-slate-200'}`}>
                      {admins.map(admin => (
                        <tr key={admin.id} className={isDarkMode?'hover:bg-slate-800/20':'hover:bg-slate-50'}>
                          <td className="p-4">
                            <p className={`font-bold ${theme.textTitle}`}>{admin.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{admin.email} | {admin.phone}</p>
                          </td>
                          <td className="p-4">
                            <span className="text-[11px] font-bold text-amber-500">{admin.role}</span>
                          </td>
                          <td className="p-4">
                            <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded font-black text-[10px] uppercase">Active</span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleRevokeAdmin(admin.id)}
                              disabled={admin.role === 'Super Admin'}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 ml-auto transition-all ${admin.role === 'Super Admin' ? 'opacity-30 cursor-not-allowed border-slate-200 text-slate-400' : 'bg-rose-500/10 hover:bg-rose-600 border-rose-500/20 text-rose-500 hover:text-white'}`}
                            >
                              <UserMinus size={13} /> Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. WALLET & LIMIT SETTINGS VIEW */}
        {activeView === 'wallets' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>Vault Liquidity & Threshold Configurations</h2>
              <p className={`text-xs mt-1 ${theme.textMuted}`}>Configure receiving gateway modules and adjust maximum tolerance caps to prevent banking blocks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {wallets.map(wallet => {
                const isOverLimit = wallet.currentVolume >= wallet.limitWarning;
                return (
                  <div key={wallet.id} className={`border rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-colors ${theme.card} ${isOverLimit && wallet.status === 'Active' ? 'border-amber-500/50 shadow-amber-500/5' : ''}`}>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider border ${wallet.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-slate-200 text-slate-400 border-slate-300'}`}>{wallet.status}</span>
                          <h3 className={`text-sm font-extrabold mt-2 ${theme.textTitle}`}>{wallet.name}</h3>
                        </div>
                        <button onClick={() => handleToggleWallet(wallet.id)} className="text-slate-400 hover:text-amber-500 transition-colors">
                          {wallet.status === 'Active' ? <ToggleRight size={28} className="text-amber-500" /> : <ToggleLeft size={28} className="text-slate-400" />}
                        </button>
                      </div>

                      <div className="space-y-1.5 font-mono text-xs text-slate-400 mb-6">
                        <p><span className="text-slate-400 font-sans">No:</span> <span className={`font-bold ${theme.textTitle}`}>{wallet.number}</span></p>
                        <p><span className="text-slate-400 font-sans">Name:</span> {wallet.holder}</p>
                      </div>
                    </div>

                    <div className={`space-y-3 pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className={theme.textMuted}>Current Utilization:</span>
                        <span className={isOverLimit && wallet.status === 'Active' ? 'text-amber-500 font-bold' : theme.textTitle}>{wallet.currentVolume.toLocaleString()} MMK</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isOverLimit && wallet.status === 'Active' ? 'bg-amber-500' : 'bg-amber-500/30'}`} 
                          style={{ width: `${Math.min((wallet.currentVolume / wallet.limitWarning) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>0%</span>
                        <span>Limit: {wallet.limitWarning.toLocaleString()} MMK</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. SYSTEM SETTINGS & MAINTENANCE VIEW */}
        {activeView === 'maintenance' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>System Settings & Operational Control</h2>
              <p className={`text-xs mt-1 ${theme.textMuted}`}>Adjust commercial transactional rates and set public network availability gates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`border p-6 rounded-2xl space-y-4 ${theme.card}`}>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-500">Global Rate Margins</h3>
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Processing Fee %</label>
                  <div className="flex gap-2">
                    <input type="number" value={feeRate} onChange={e=>setFeeRate(Number(e.target.value))} className={`w-24 rounded-xl px-4 py-2 text-xs focus:outline-none ${theme.input}`} />
                    <span className="flex items-center text-xs font-bold text-slate-400">% Per Settlement</span>
                  </div>
                </div>
              </div>

              <div className={`border p-6 rounded-2xl space-y-4 ${theme.card}`}>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-rose-500">Emergency Maintenance Intercept</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">Platform Public Access</p>
                    <p className="text-[11px] text-slate-400">Toggle user client API traffic routing availability</p>
                  </div>
                  <button onClick={() => setIsPlatformOnline(!isPlatformOnline)}>
                    {isPlatformOnline ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-rose-500" />}
                  </button>
                </div>
                {!isPlatformOnline && (
                  <div>
                    <label className="block text-[10px] uppercase text-rose-400 font-bold mb-1.5">Public Banner Notice Message</label>
                    <input type="text" value={maintenanceMessage} onChange={e=>setMaintenanceMessage(e.target.value)} className={`w-full rounded-xl px-4 py-2 text-xs focus:outline-none border border-rose-500/30 ${theme.input}`} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 7. AUDIT LOGS VIEW */}
        {activeView === 'audit' && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>Immutable System Audit Logs</h2>
              <p className={`text-xs mt-1 ${theme.textMuted}`}>Cryptographic track record of action timestamps generated by master access nodes</p>
            </div>

            <div className={`border rounded-2xl overflow-hidden ${theme.tableBg}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                  <thead>
                    <tr className={`font-extrabold border-b uppercase tracking-wider ${theme.th}`}>
                      <th className="p-4">Timestamp Matrix</th>
                      <th className="p-4">Authorization Identity</th>
                      <th className="p-4">Operation Dispatched</th>
                      <th className="p-4 text-right">IP Network Node</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-mono text-xs ${isDarkMode?'divide-slate-800/60':'divide-slate-200'}`}>
                    {auditLogs.map(log => (
                      <tr key={log.id} className={isDarkMode?'hover:bg-slate-800/20':'hover:bg-slate-50'}>
                        <td className="p-4 text-slate-400">{log.timestamp}</td>
                        <td className={`p-4 font-bold ${theme.textTitle}`}>{log.admin}</td>
                        <td className="p-4 text-slate-300 font-sans font-medium">{log.action}</td>
                        <td className="p-4 text-right text-slate-400">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
