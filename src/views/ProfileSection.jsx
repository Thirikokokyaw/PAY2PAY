import React, { useState, useRef } from 'react';
import { 
  Clock, ArrowRight, Camera, User, Phone, Mail, LogOut, 
  PlusCircle, Bell, Settings, Lock, Trash2,
  RefreshCw, ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle,
  Eye, EyeOff, Calendar, MessageSquare, Send, Pencil
} from 'lucide-react';

export default function ProfileSection({ userInfo, setUserInfo, userTransactions = [], onLogout, setActiveView, navigateToView, isDarkMode }) {
  const fileInputRef = useRef(null);
  
  // Active Navigation Panels
  const [activeTab, setActiveTab] = useState('profile'); 
  const [isEditing, setIsEditing] = useState(false);

  // Date Filtering Inputs
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Password Visibility Toggles
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Profile Edit Form States
  const [editName, setEditName] = useState(userInfo.name);
  const [editPhone, setEditPhone] = useState(userInfo.phone);
  const [editEmail, setEditEmail] = useState(userInfo.email || 'user@example.com');
  const [tempAvatar, setTempAvatar] = useState(userInfo.avatar);

  // Support Helpdesk Ticket States
  const [fromPay, setFromPay] = useState('KPay');
  const [toPay, setToPay] = useState('WaveMoney');
  const [supportTxnNo, setSupportTxnNo] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  // Local Chat Simulation Logs
  const [supportTickets, setSupportTickets] = useState([
    {
      id: "TKT-88402",
      route: "KPay ➔ WaveMoney",
      txn: "TXN-77210",
      userMsg: "I uploaded the voucher but the balance does not update. Please look into it.",
      sysReply: "Hello. We receive your request. Our admin team checks this transaction now. It takes about 10 minutes.",
      status: "In Progress",
      time: "2026-06-25 22:15"
    }
  ]);

  // Account Settings Checkboxes
  const [emailNotif, setEmailNotif] = useState(true);
  const [txAlerts, setTxAlerts] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [notifications] = useState([
    { id: 1, title: "Exchange Successful", desc: "Your transfer TXN-8801 is successful.", time: "10 mins ago", type: "success" },
    { id: 2, title: "System Maintenance", desc: "Wave Pay updates its system at midnight.", time: "4 hours ago", type: "info" }
  ]);

  // Calculations
  const totalExchanges = userTransactions.length;
  const pendingCount = userTransactions.filter(t => t.status === 'Pending').length;
  const totalSent = userTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalReceived = userTransactions.reduce((acc, curr) => acc + ((Number(curr.amount) || 0) * 0.98), 0);

  // Date Filter Logic Mapping
  const filteredTransactions = userTransactions.filter(txn => {
    if (!txn.date) return true;
    const txnDateTime = new Date(txn.date.replace(/\//g, '-')); 
    if (startDate && new Date(startDate) > txnDateTime) return false;
    if (endDate) {
      const endCondition = new Date(endDate);
      endCondition.setHours(23, 59, 59, 999);
      if (txnDateTime > endCondition) return false;
    }
    return true;
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleStartEdit = () => {
    setEditName(userInfo.name);
    setEditPhone(userInfo.phone);
    setEditEmail(userInfo.email || 'user@example.com');
    setTempAvatar(userInfo.avatar);
    setActiveTab('profile');
    setIsEditing(true);
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim() || !editEmail.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    setUserInfo(prev => ({
      ...prev,
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      avatar: tempAvatar
    }));
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) {
      alert("Please type your message.");
      return;
    }

    const newTicketId = "TKT-" + Math.floor(10000 + Math.random() * 90000);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    const newTicket = {
      id: newTicketId,
      route: `${fromPay} ➔ ${toPay}`,
      txn: supportTxnNo.trim() || "N/A",
      userMsg: supportMessage.trim(),
      sysReply: `We receive your ticket for the ${fromPay} to ${toPay} transfer. Our team fixes it now.`,
      status: "Open",
      time: timestamp
    };

    setSupportTickets([newTicket, ...supportTickets]);
    setSupportMessage('');
    setSupportTxnNo('');
    alert(`Ticket ${newTicketId} created successfully.`);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Password updated successfully!");
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Theme Mapping Configurations
  const themeClasses = {
    sidebarBg: isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800', 
    cardBg: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80', 
    innerCard: isDarkMode ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200', 
    inputBg: isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900', 
    textSub: isDarkMode ? 'text-slate-300' : 'text-slate-600',
    textMuted: isDarkMode ? 'text-slate-500' : 'text-slate-400',
    borderSeparator: isDarkMode ? 'border-slate-800/60' : 'border-slate-200',
    btnSecondary: isDarkMode ? 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-yellow-400' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-600'
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-4 flex flex-col md:grid md:grid-cols-4 gap-6 items-start">
      
      {/* 📱 MOBILE VIEW COMPACT NAVIGATION HARBOR (Visible on mobile, Hidden on Desktop) */}
      <div className={`w-full md:hidden rounded-2xl border p-3 flex items-center gap-2 overflow-x-auto scrollbar-none shadow-md backdrop-blur-md ${themeClasses.sidebarBg}`}>
        <button 
          onClick={() => { setActiveTab('profile'); setIsEditing(false); }} 
          className={`shrink-0 py-1.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'profile' && !isEditing ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600 border border-amber-100') : 'text-inherit opacity-70'}`}
        >
          <User size={13} /> Dashboard
        </button>
        
        <button 
          onClick={() => navigateToView?.('exchange') || setActiveView('exchange')} 
          className={`shrink-0 py-1.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-inherit opacity-70`}
        >
          <PlusCircle size={13} className="text-emerald-500" /> New
        </button>
        
        <button 
          onClick={() => { setActiveTab('history'); setIsEditing(false); }} 
          className={`shrink-0 py-1.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'history' ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600 border border-amber-100') : 'text-inherit opacity-70'}`}
        >
          <Clock size={13} /> History
        </button>

        <button 
          onClick={() => { setActiveTab('support'); setIsEditing(false); }} 
          className={`shrink-0 py-1.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'support' ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600 border border-amber-100') : 'text-inherit opacity-70'}`}
        >
          <MessageSquare size={13} className="text-amber-500" /> Support
        </button>
        
        <button 
          onClick={() => { setActiveTab('notifications'); setIsEditing(false); }} 
          className={`shrink-0 py-1.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'notifications' ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600 border border-amber-100') : 'text-inherit opacity-70'}`}
        >
          <Bell size={13} /> Notifications
        </button>
        
        <button 
          onClick={() => { setActiveTab('settings'); setIsEditing(false); }} 
          className={`shrink-0 py-1.5 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'settings' ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600 border border-amber-100') : 'text-inherit opacity-70'}`}
        >
          <Settings size={13} /> Settings
        </button>

        <button 
          onClick={onLogout} 
          className="shrink-0 py-1.5 px-3 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/10"
        >
          Logout
        </button>
      </div>

      {/* 🧭 DESKTOP VERTICAL SIDEBAR (Visible on Desktop, Hidden on Mobile) */}
      <div className={`hidden md:flex border rounded-3xl p-5 flex-col space-y-2 shadow-xl backdrop-blur-md transition-all duration-300 w-full ${themeClasses.sidebarBg}`}>
        <div className={`flex flex-col items-center text-center pb-4 border-b ${themeClasses.borderSeparator} mb-3`}>
          <div className="relative mb-2 mt-2">
            <img src={userInfo.avatar} alt="Avatar" className={`w-20 h-20 rounded-full object-cover border-2 p-0.5 ${isDarkMode ? 'border-yellow-400 bg-slate-950' : 'border-amber-500 bg-white'}`} />
          </div>
          <h3 className={`text-sm font-bold max-w-full truncate mb-0.5 ${themeClasses.textMain}`}>{userInfo.name}</h3>
          <span className={`text-[11px] font-mono block mb-2 ${themeClasses.textSub}`}>{userInfo.phone}</span>
          
          <button 
            onClick={handleStartEdit}
            className={`px-3 py-1 border rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
              isEditing ? 'bg-amber-500 text-slate-950 border-amber-500' : `${themeClasses.btnSecondary}`
            }`}
          >
            <Pencil size={10} /> Edit Profile
          </button>
        </div>

        <button onClick={() => { setActiveTab('profile'); setIsEditing(false); }} className={`w-full py-2.5 px-4 text-left rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeTab === 'profile' && !isEditing ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600 border border-amber-100') : (isDarkMode ? 'text-slate-300 hover:bg-slate-950/60 hover:text-white' : 'text-slate-600 hover:bg-slate-100')}`}>
          <User size={15} /> Dashboard
        </button>
        
        <button onClick={() => navigateToView?.('exchange') || setActiveView('exchange')} className={`w-full py-2.5 px-4 text-left rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${isDarkMode ? 'text-slate-300 hover:bg-slate-955/60 hover:text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          <PlusCircle size={15} className="text-emerald-500" /> New Exchange
        </button>
        
        <button onClick={() => { setActiveTab('history'); setIsEditing(false); }} className={`w-full py-2.5 px-4 text-left rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeTab === 'history' ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600 border border-amber-100') : (isDarkMode ? 'text-slate-300 hover:bg-slate-950/60 hover:text-white' : 'text-slate-600 hover:bg-slate-100')}`}>
          <Clock size={15} /> Transaction History
        </button>

        <button onClick={() => { setActiveTab('support'); setIsEditing(false); }} className={`w-full py-2.5 px-4 text-left rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeTab === 'support' ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600 border border-amber-100') : (isDarkMode ? 'text-slate-300 hover:bg-slate-950/60 hover:text-white' : 'text-slate-600 hover:bg-slate-100')}`}>
          <MessageSquare size={15} className="text-amber-500" /> Customer Support
        </button>
        
        <button onClick={() => { setActiveTab('notifications'); setIsEditing(false); }} className={`w-full py-2.5 px-4 text-left rounded-xl text-xs font-bold transition flex items-center justify-between ${activeTab === 'notifications' ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600 border border-amber-100') : (isDarkMode ? 'text-slate-300 hover:bg-slate-950/60 hover:text-white' : 'text-slate-600 hover:bg-slate-100')}`}>
          <div className="flex items-center gap-2.5"><Bell size={15} /> Notifications</div>
          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
        </button>
        
        <button onClick={() => { setActiveTab('settings'); setIsEditing(false); }} className={`w-full py-2.5 px-4 text-left rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeTab === 'settings' ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600 border border-amber-100') : (isDarkMode ? 'text-slate-300 hover:bg-slate-950/60 hover:text-white' : 'text-slate-600 hover:bg-slate-100')}`}>
          <Settings size={15} /> Settings
        </button>

        <div className={`pt-6 border-t ${themeClasses.borderSeparator} mt-4`}>
          <button onClick={onLogout} className="w-full text-xs bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-50 hover:text-white py-2.5 rounded-xl transition font-bold flex items-center justify-center gap-2">
            <LogOut size={14}/> Logout
          </button>
        </div>
      </div>

      {/* 📊 RIGHT MAIN VIEWPORT */}
      <div className="md:col-span-3 space-y-6 w-full">
        
        {/* MOBILE VIEW AVATAR BAR */}
        {activeTab === 'profile' && !isEditing && (
          <div className={`md:hidden flex items-center justify-between border rounded-2xl p-4 shadow-sm ${themeClasses.innerCard}`}>
            <div className="flex items-center gap-3">
              <img src={userInfo.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-amber-500" />
              <div>
                <h4 className={`text-xs font-bold ${themeClasses.textMain}`}>{userInfo.name}</h4>
                <p className={`text-[10px] font-mono ${themeClasses.textMuted}`}>{userInfo.phone}</p>
              </div>
            </div>
            <button onClick={handleStartEdit} className={`px-2.5 py-1.5 border rounded-lg text-[10px] font-bold flex items-center gap-1 ${themeClasses.btnSecondary}`}>
              <Pencil size={10} /> Edit
            </button>
          </div>
        )}

        {/* DASHBOARD SUMMARY MATRIX */}
        {activeTab === 'profile' && !isEditing && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`border rounded-2xl p-4 shadow-md flex items-center gap-3 transition-all duration-300 ${themeClasses.innerCard}`}>
              <div className={`p-2.5 rounded-xl text-amber-500 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`}><RefreshCw size={18} /></div>
              <div>
                <span className={`text-[10px] uppercase font-bold tracking-wider block ${themeClasses.textSub}`}>Exchanges</span>
                <span className={`text-sm lg:text-base font-black ${themeClasses.textMain}`}>{totalExchanges}</span>
              </div>
            </div>

            <div className={`border rounded-2xl p-4 shadow-md flex items-center gap-3 transition-all duration-300 ${themeClasses.innerCard}`}>
              <div className={`p-2.5 rounded-xl text-orange-500 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`}><ArrowUpRight size={18} /></div>
              <div>
                <span className={`text-[10px] uppercase font-bold tracking-wider block ${themeClasses.textSub}`}>Total Sent</span>
                <span className={`text-sm lg:text-base font-black ${themeClasses.textMain}`}>{totalSent.toLocaleString()} MMK</span>
              </div>
            </div>

            <div className={`border rounded-2xl p-4 shadow-md flex items-center gap-3 transition-all duration-300 ${themeClasses.innerCard}`}>
              <div className={`p-2.5 rounded-xl text-cyan-500 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`}><ArrowDownLeft size={18} /></div>
              <div>
                <span className={`text-[10px] uppercase font-bold tracking-wider block ${themeClasses.textSub}`}>Received</span>
                <span className={`text-sm lg:text-base font-black ${themeClasses.textMain}`}>{totalReceived.toLocaleString()} MMK</span>
              </div>
            </div>

            <div className={`border rounded-2xl p-4 shadow-md flex items-center gap-3 transition-all duration-300 ${themeClasses.innerCard}`}>
              <div className={`p-2.5 rounded-xl text-amber-500 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`}><AlertCircle size={18} /></div>
              <div>
                <span className={`text-[10px] uppercase font-bold tracking-wider block ${themeClasses.textSub}`}>Pending</span>
                <span className={`text-sm lg:text-base font-black ${themeClasses.textMain}`}>{pendingCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB MAIN */}
        {activeTab === 'profile' && (
          <>
            {!isEditing ? (
              <div className={`border backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-xl space-y-5 transition-all duration-300 ${themeClasses.cardBg}`}>
                <div className={`flex justify-between items-center pb-3 border-b ${themeClasses.borderSeparator}`}>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textSub}`}>Recent Transactions</h4>
                  <button onClick={() => setActiveTab('history')} className={`text-[10px] font-bold uppercase border px-3 py-1.5 rounded-lg transition-all tracking-wider ${themeClasses.btnSecondary}`}>View All</button>
                </div>

                <div className="space-y-3">
                  {userTransactions.length === 0 ? (
                    <div className={`text-center py-6 text-xs ${themeClasses.textSub}`}>No transactions found.</div>
                  ) : (
                    userTransactions.slice(0, 3).map((txn) => (
                      <div key={txn.id} className={`border p-4 rounded-xl flex justify-between items-center gap-2 hover:border-amber-500/40 transition shadow-sm ${themeClasses.innerCard}`}>
                        <div>
                          <span className={`text-[9px] font-mono ${themeClasses.textMuted}`}>{txn.id} • {txn.date}</span>
                          <div className="flex items-center space-x-1.5 mt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-700 border border-slate-200'}`}>{txn.from}</span>
                            <ArrowRight size={10} className={themeClasses.textMuted} />
                            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${isDarkMode ? 'bg-slate-950 text-yellow-400' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>{txn.to}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-black block ${themeClasses.textMain}`}>{txn.amount.toLocaleString()} MMK</span>
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded mt-1 ${txn.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>{txn.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* EDIT PROFILE FORM */
              <form onSubmit={handleSaveChanges} className={`border backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-xl space-y-5 transition-all duration-300 ${themeClasses.cardBg}`}>
                <div className={`flex justify-between items-center pb-3 border-b ${themeClasses.borderSeparator}`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">Edit Profile Details</h4>
                </div>

                <div className={`border p-4 rounded-2xl flex items-center gap-4 ${themeClasses.innerCard}`}>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                  <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current.click()}>
                    <img src={tempAvatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 p-0.5 bg-slate-400" />
                    <div className="absolute inset-0 bg-slate-950/40 rounded-full flex items-center justify-center">
                      <Camera size={14} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${themeClasses.textMain}`}>Change Profile Photo</span>
                    <span className={`text-[10px] ${themeClasses.textSub}`}>Click the icon to upload a new profile graphic.</span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1.5 tracking-wider ${themeClasses.textSub}`}>Full Name</label>
                    <div className={`flex items-center border rounded-xl px-3 py-2.5 ${themeClasses.inputBg}`}>
                      <User size={14} className={`${themeClasses.textMuted} mr-2 shrink-0`} />
                      <input type="text" required value={editName} onChange={(e)=>setEditName(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none font-medium text-inherit" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase mb-1.5 tracking-wider ${themeClasses.textSub}`}>Email Address</label>
                      <div className={`flex items-center border rounded-xl px-3 py-2.5 ${themeClasses.inputBg}`}>
                        <Mail size={14} className={`${themeClasses.textMuted} mr-2 shrink-0`} />
                        <input type="email" required value={editEmail} onChange={(e)=>setEditEmail(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none font-medium text-inherit" />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase mb-1.5 tracking-wider ${themeClasses.textSub}`}>Phone Number</label>
                      <div className={`flex items-center border rounded-xl px-3 py-2.5 ${themeClasses.inputBg}`}>
                        <Phone size={14} className={`${themeClasses.textMuted} mr-2 shrink-0`} />
                        <input type="tel" required value={editPhone} onChange={(e)=>setEditPhone(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none font-mono font-bold text-inherit" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className={`flex-1 border py-2.5 rounded-xl text-xs font-bold transition uppercase tracking-wider ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-900' : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'}`}>Cancel</button>
                  <button type="submit" className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-lg">
                    <CheckCircle size={14} /> Save Changes
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* 📜 TRANSACTION HISTORY LEDGER */}
        {activeTab === 'history' && (
          <div className={`border rounded-3xl p-5 md:p-6 shadow-xl space-y-4 transition-all duration-300 ${themeClasses.cardBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-dashed border-slate-700/20">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textSub}`}>Transaction History</h4>
              
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`flex items-center border rounded-lg px-2 py-1 gap-1.5 text-xs ${themeClasses.inputBg}`}>
                  <Calendar size={12} className={themeClasses.textMuted} />
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-[10px] focus:outline-none text-inherit" />
                </div>
                <span className={`text-[10px] font-bold ${themeClasses.textMuted}`}>to</span>
                <div className={`flex items-center border rounded-lg px-2 py-1 gap-1.5 text-xs ${themeClasses.inputBg}`}>
                  <Calendar size={12} className={themeClasses.textMuted} />
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-[10px] focus:outline-none text-inherit" />
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredTransactions.length === 0 ? (
                <div className={`text-center py-12 text-xs ${themeClasses.textSub}`}>No transactions match this date range.</div>
              ) : (
                filteredTransactions.map((txn) => (
                  <div key={txn.id} className={`border p-4 rounded-xl flex justify-between items-center ${themeClasses.innerCard}`}>
                    <div>
                      <span className={`text-[10px] font-mono ${themeClasses.textMuted}`}>{txn.id} • {txn.date}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs font-bold ${themeClasses.textMain}`}>{txn.from}</span>
                        <ArrowRight size={12} className={themeClasses.textMuted} />
                        <span className="text-xs font-bold text-amber-500">{txn.to}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black ${themeClasses.textMain}`}>{txn.amount.toLocaleString()} MMK</span>
                      <span className={`block text-[9px] font-bold px-2 py-0.5 rounded mt-1 w-fit ml-auto ${txn.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{txn.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 📨 CUSTOMER SUPPORT HELPDESK */}
        {activeTab === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-h-[580px] lg:max-h-none overflow-y-auto lg:overflow-visible pr-1">
            
            <div className={`lg:col-span-3 border rounded-3xl p-5 shadow-xl space-y-4 h-fit transition-all duration-300 ${themeClasses.cardBg}`}>
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textMain}`}>Support Helpdesk</h4>
                <p className={`text-[11px] ${themeClasses.textSub}`}>Fill in this simple form to report your issue.</p>
              </div>

              <form onSubmit={handleSupportSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[9px] font-bold uppercase mb-1 tracking-wider ${themeClasses.textSub}`}>From</label>
                    <select value={fromPay} onChange={(e) => setFromPay(e.target.value)} className={`w-full border rounded-lg px-2 py-2 text-xs focus:outline-none font-semibold ${themeClasses.inputBg}`}>
                      <option value="KPay">KBZPay</option>
                      <option value="WaveMoney">WavePay</option>
                      <option value="CBPay">CB Pay</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[9px] font-bold uppercase mb-1 tracking-wider ${themeClasses.textSub}`}>To</label>
                    <select value={toPay} onChange={(e) => setToPay(e.target.value)} className={`w-full border rounded-lg px-2 py-2 text-xs focus:outline-none font-semibold ${themeClasses.inputBg}`}>
                      <option value="WaveMoney">WavePay</option>
                      <option value="KPay">KBZPay</option>
                      <option value="CBPay">CB Pay</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-[9px] font-bold uppercase mb-1 tracking-wider ${themeClasses.textSub}`}>Transaction ID</label>
                  <input type="text" placeholder="e.g. TXN-77210" value={supportTxnNo} onChange={(e) => setSupportTxnNo(e.target.value)} className={`w-full border rounded-lg px-2 py-2 text-xs focus:outline-none font-mono ${themeClasses.inputBg}`} />
                </div>

                <div>
                  <label className={`block text-[9px] font-bold uppercase mb-1 tracking-wider ${themeClasses.textSub}`}>Describe Your Issue</label>
                  <textarea rows="2" required placeholder="Type details here..." value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none bg-transparent ${themeClasses.inputBg}`}></textarea>
                </div>

                <button type="submit" className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-md">
                  <Send size={12} /> Send Ticket
                </button>
              </form>
            </div>

            <div className={`lg:col-span-2 border rounded-3xl p-5 shadow-xl space-y-3 flex flex-col transition-all duration-300 ${themeClasses.cardBg}`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textSub}`}>Active Tickets Log</h4>
              
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 flex-1">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className={`border p-3 rounded-xl space-y-2.5 ${themeClasses.innerCard}`}>
                    <div className="flex items-center justify-between border-b border-slate-700/10 pb-1.5">
                      <span className="text-[10px] font-mono font-bold text-amber-500">{ticket.id}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${ticket.status === 'Open' ? 'bg-amber-500/10 text-amber-500' : 'bg-cyan-500/10 text-cyan-500'}`}>{ticket.status}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold block text-rose-400 uppercase">You:</span>
                      <p className={`text-[11px] p-2 rounded-lg font-medium ${isDarkMode ? 'bg-slate-900/60' : 'bg-white border border-slate-200'}`}>{ticket.userMsg}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold block text-emerald-400 uppercase">System:</span>
                      <p className={`text-[11px] p-2 rounded-lg font-medium border ${isDarkMode ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{ticket.sysReply}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* INBOX NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className={`border rounded-3xl p-5 md:p-6 shadow-xl space-y-4 transition-all duration-300 ${themeClasses.cardBg}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textSub}`}>Notifications</h4>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className={`border p-4 rounded-xl relative pl-10 ${themeClasses.innerCard}`}>
                  <div className={`absolute left-4 top-5 w-2 h-2 rounded-full ${notif.type === 'success' ? 'bg-emerald-500' : 'bg-cyan-500'}`}></div>
                  <div className="flex justify-between"><h5 className={`text-xs font-bold ${themeClasses.textMain}`}>{notif.title}</h5><span className={`text-[9px] ${themeClasses.textMuted}`}>{notif.time}</span></div>
                  <p className={`text-[11px] mt-1 ${themeClasses.textSub}`}>{notif.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS CONTROL CONFIGURATION */}
        {activeTab === 'settings' && (
          <div className={`border rounded-3xl p-5 md:p-6 shadow-xl space-y-6 transition-all duration-300 ${themeClasses.cardBg}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textSub}`}>Account Settings</h4>
            
            <div className={`border p-4 rounded-xl space-y-3 ${themeClasses.innerCard}`}>
              <div className="flex items-center justify-between">
                <div><span className={`text-xs font-bold block ${themeClasses.textMain}`}>Email Alerts</span><span className={`text-[10px] ${themeClasses.textSub}`}>Receive transaction news by email.</span></div>
                <input type="checkbox" checked={emailNotif} onChange={(e)=>setEmailNotif(e.target.checked)} className="w-4 h-4 accent-amber-500" />
              </div>
              <div className={`flex items-center justify-between border-t pt-3 ${themeClasses.borderSeparator}`}>
                <div><span className={`text-xs font-bold block ${themeClasses.textMain}`}>Push Alerts</span><span className={`text-[10px] ${themeClasses.textSub}`}>Receive real-time popup banners.</span></div>
                <input type="checkbox" checked={txAlerts} onChange={(e)=>setTxAlerts(e.target.checked)} className="w-4 h-4 accent-amber-500" />
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className={`border p-4 rounded-xl space-y-3 ${themeClasses.innerCard}`}>
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1"><Lock size={12} /> Update Security Password</h5>
              
              <div className="space-y-3">
                <div className={`flex items-center border rounded-lg px-3 py-2 ${themeClasses.inputBg}`}>
                  <input type={showOldPass ? "text" : "password"} required placeholder="Current Password" value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)} className="w-full text-xs focus:outline-none bg-transparent text-inherit" />
                  <button type="button" onClick={() => setShowOldPass(!showOldPass)} className={`ml-2 ${themeClasses.textMuted} hover:text-inherit`}>
                    {showOldPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`flex items-center border rounded-lg px-3 py-2 ${themeClasses.inputBg}`}>
                    <input type={showNewPass ? "text" : "password"} required placeholder="New Password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="w-full text-xs focus:outline-none bg-transparent text-inherit" />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className={`ml-2 ${themeClasses.textMuted} hover:text-inherit`}>
                      {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  <div className={`flex items-center border rounded-lg px-3 py-2 ${themeClasses.inputBg}`}>
                    <input type={showConfirmPass ? "text" : "password"} required placeholder="Confirm New Password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="w-full text-xs focus:outline-none bg-transparent text-inherit" />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className={`ml-2 ${themeClasses.textMuted} hover:text-inherit`}>
                      {showConfirmPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
              <button type="submit" className="text-[10px] font-bold uppercase bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg transition-all shadow-sm font-black">Change Password</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}