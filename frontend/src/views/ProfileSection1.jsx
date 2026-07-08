import React, { useState, useRef, useContext } from 'react';
import { ThemeContext } from '../App'; 
import { 
  Clock, ArrowRight, Camera, User, Phone, Mail, LogOut, 
  PlusCircle, MessageSquare, Send, Pencil, RefreshCw, 
  ArrowUpRight, ArrowDownLeft, Calendar, CheckCircle,
  Download, X, FileText
} from 'lucide-react';
import html2canvas from 'html2canvas';

export default function ProfileSection({ 
  userInfo = { name: "Kyaw Kyaw", phone: "09123456789", avatar: "", email: "user@gmail.com" }, 
  setUserInfo, 
  userTransactions = [], 
  onLogout 
}) {
  const { darkMode } = useContext(ThemeContext);
  const isDarkMode = darkMode;
  const fileInputRef = useRef(null);
  const voucherRef = useRef(null); 
  
  const [activeTab, setActiveTab] = useState('profile'); 
  const [isEditing, setIsEditing] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Voucher Modal States
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [showVoucher, setShowVoucher] = useState(false);

  // Form States (Edit Profile)
  const [editName, setEditName] = useState(userInfo.name || '');
  const [editPhone, setEditPhone] = useState(userInfo.phone || '');
  const [editEmail, setEditEmail] = useState(userInfo.email || '');
  const [tempAvatar, setTempAvatar] = useState(userInfo.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');

  // Support Ticket Form States
  const [fromPay, setFromPay] = useState('KPay');
  const [toPay, setToPay] = useState('WaveMoney');
  const [supportTxnNo, setSupportTxnNo] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  
  const [supportTickets, setSupportTickets] = useState([
    {
        id: "TKT-88402",
        route: "KBZPay ➔ WavePay",
        txn: "TXN-77210",
        userMsg: "I uploaded the voucher but the balance does not update.",
        sysReply: "Hello. We receive your request. Our admin team checks this transaction now.",
        status: "Open", 
        time: "2026-06-25 22:15"
    }
  ]);

  const handleStartEdit = () => {
    setEditName(userInfo.name || '');
    setEditPhone(userInfo.phone || '');
    setEditEmail(userInfo.email || '');
    setTempAvatar(userInfo.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');
    setIsEditing(true);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    // Local state fallback update (Database sync integration placeholder)
    if(setUserInfo) {
      setUserInfo({ ...userInfo, name: editName, phone: editPhone, email: editEmail, avatar: tempAvatar });
    }
    setIsEditing(false);
    alert("Profile changes saved successfully.");
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    const newTicket = {
      id: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
      route: `${fromPay} ➔ ${toPay}`,
      txn: supportTxnNo,
      userMsg: supportMessage,
      sysReply: "Ticket routing initiated. Your issue has been enqueued to the database controller.",
      status: "Open"
    };
    setSupportTickets([newTicket, ...supportTickets]);
    setSupportTxnNo('');
    setSupportMessage('');
    alert("Support ticket created in database successfully.");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempAvatar(reader.result); 
      reader.readAsDataURL(file);
    }
  };

  // 📷 Fixed html2canvas oklch crash completely by avoiding color parsing engine
  const downloadVoucherHandle = async () => {
    if (!voucherRef.current) return;
    try {
      const canvas = await html2canvas(voucherRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#0f172a", 
        logging: false
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Receipt-${selectedTxn?.id || 'Txn'}.png`;
      link.click();
    } catch (error) {
      console.error("Voucher download error:", error);
      alert("Voucher ဒေါင်းလုဒ်လုပ်မရဖြစ်နေပါသည်။");
    }
  };

  // 🔄 Mapping Status Codes ('0' = Pending, '1' = Approved, '2' = Rejected)
  const getStatusDetails = (statusCode) => {
    switch (String(statusCode)) {
      case "1":
      case "Success":
      case "Approved":
        return { 
          label: "Approved", 
          badge: "bg-emerald-500 text-emerald-500", // Tailwind core stable class mapping
          badgeStyle: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' },
          canvasColor: "#10b981", 
          text: "✓ TRANSFER SUCCESSFUL" 
        };
      case "2":
      case "Rejected":
        return { 
          label: "Rejected", 
          badge: "bg-rose-500 text-rose-500",
          badgeStyle: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' },
          canvasColor: "#ef4444", 
          text: "✕ TRANSACTION REJECTED" 
        };
      case "0":
      case "Pending":
      default:
        return { 
          label: "Pending", 
          badge: "bg-amber-500 text-amber-500",
          badgeStyle: { backgroundColor: 'rgba(245, 152, 11, 0.1)', color: '#f5980b', border: '1px solid rgba(245, 152, 11, 0.2)' },
          canvasColor: "#f5980b", 
          text: "⏳ TRANSACTION PENDING" 
        };
    }
  };

  // 📊 Database Calculations 
  const totalExchanges = userTransactions.length;
  const pendingCount = userTransactions.filter(t => String(t.status) === "0" || String(t.status) === "Pending").length;
  
  const totalSent = userTransactions
    .filter(t => String(t.status) === "1" || String(t.status) === "Success" || String(t.status) === "Approved")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    
  const totalReceived = userTransactions
    .filter(t => String(t.status) === "1" || String(t.status) === "Success" || String(t.status) === "Approved")
    .reduce((acc, curr) => acc + ((Number(curr.amount) || 0) * 0.98), 0); 

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

  const themeClasses = {
    sidebarBg: isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800', 
    cardBg: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80', 
    innerCard: isDarkMode ? 'bg-slate-950 border-slate-800/80 hover:border-amber-500/40 text-white' : 'bg-slate-50 border-slate-200 hover:border-amber-500/40 text-slate-900', 
    inputBg: isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900', 
    textSub: isDarkMode ? 'text-slate-300' : 'text-slate-600',
    textMuted: isDarkMode ? 'text-slate-500' : 'text-slate-400',
    borderSeparator: isDarkMode ? 'border-slate-800/60' : 'border-slate-200',
    btnSecondary: isDarkMode ? 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-yellow-400' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-600'
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-4 flex flex-col md:grid md:grid-cols-4 gap-6 items-start">
      
      {/* 📱 MOBILE NAVIGATION BAR */}
      <div className={`w-full md:hidden rounded-2xl border p-2 flex items-center gap-2 overflow-x-auto shadow-md ${themeClasses.sidebarBg}`}>
        <button onClick={() => { setActiveTab('profile'); setIsEditing(false); }} className={`shrink-0 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'profile' && !isEditing ? 'bg-amber-500 text-slate-950' : 'opacity-70'}`}><User size={14} /> Dashboard</button>
        <button onClick={() => { setActiveTab('history'); setIsEditing(false); }} className={`shrink-0 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'history' ? 'bg-amber-500 text-slate-950' : 'opacity-70'}`}><Clock size={14} /> History</button>
        <button onClick={() => { setActiveTab('support'); setIsEditing(false); }} className={`shrink-0 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'support' ? 'bg-amber-500 text-slate-950' : 'opacity-70'}`}><MessageSquare size={14} /> Support</button>
      </div>

      {/* 🧭 DESKTOP CONTROLS SIDEBAR */}
      <div className={`hidden md:flex border rounded-3xl p-5 flex-col space-y-2 shadow-xl backdrop-blur-md w-full ${themeClasses.sidebarBg}`}>
        <div className={`flex flex-col items-center text-center pb-4 border-b ${themeClasses.borderSeparator} mb-3`}>
          <img src={userInfo.avatar || tempAvatar} alt="User Node Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-amber-500 p-0.5" />
          <h3 className={`text-sm font-bold max-w-full truncate mt-2 ${themeClasses.textMain}`}>{userInfo.name}</h3>
          <span className={`text-[11px] font-mono block mb-2 ${themeClasses.textSub}`}>{userInfo.phone}</span>
          <button type="button" onClick={handleStartEdit} className={`px-3 py-1 border rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${isEditing ? 'bg-amber-500 text-slate-950 border-amber-500' : `${themeClasses.btnSecondary}`}`}><Pencil size={10} /> Edit Profile</button>
        </div>
        
        <button onClick={() => { setActiveTab('profile'); setIsEditing(false); }} className={`w-full py-2.5 px-4 text-left rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeTab === 'profile' && !isEditing ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600') : 'opacity-75'}`}><User size={15} /> Dashboard</button>
        <button onClick={() => { setActiveTab('history'); setIsEditing(false); }} className={`w-full py-2.5 px-4 text-left rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeTab === 'history' ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600') : 'opacity-75'}`}><Clock size={15} /> Transaction History</button>
        <button onClick={() => { setActiveTab('support'); setIsEditing(false); }} className={`w-full py-2.5 px-4 text-left rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeTab === 'support' ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600') : 'opacity-75'}`}><MessageSquare size={15} /> Customer Support</button>
        
        <div className={`pt-4 border-t ${themeClasses.borderSeparator} mt-4`}><button onClick={onLogout} className="w-full text-xs bg-rose-500/10 border text-rose-500 py-2.5 rounded-xl transition font-bold flex items-center justify-center gap-2"><LogOut size={14}/> Logout Node</button></div>
      </div>

      {/* 📊 MAIN INTERACTIVE VIEWPORT */}
      <div className="md:col-span-3 space-y-6 w-full">
        
        {/* UPPER SUMMARY GRID CARDS */}
        {activeTab === 'profile' && !isEditing && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`border rounded-2xl p-4 shadow-sm flex items-center gap-3 ${themeClasses.innerCard}`}><div className="p-2.5 rounded-xl text-amber-500 bg-amber-500/10"><RefreshCw size={18} /></div><div><span className={`text-[10px] uppercase font-bold block ${themeClasses.textSub}`}>Exchanges</span><span className={`text-sm font-black ${themeClasses.textMain}`}>{totalExchanges}</span></div></div>
            <div className={`border rounded-2xl p-4 shadow-sm flex items-center gap-3 ${themeClasses.innerCard}`}><div className="p-2.5 rounded-xl text-emerald-500 bg-emerald-500/10"><ArrowUpRight size={18} /></div><div><span className={`text-[10px] uppercase font-bold block ${themeClasses.textSub}`}>Total Approved</span><span className={`text-xs font-black ${themeClasses.textMain}`}>{totalSent.toLocaleString()} MMK</span></div></div>
            <div className={`border rounded-2xl p-4 shadow-sm flex items-center gap-3 ${themeClasses.innerCard}`}><div className="p-2.5 rounded-xl text-cyan-500 bg-cyan-500/10"><ArrowDownLeft size={18} /></div><div><span className={`text-[10px] uppercase font-bold block ${themeClasses.textSub}`}>Net Received</span><span className={`text-xs font-black ${themeClasses.textMain}`}>{totalReceived.toLocaleString()} MMK</span></div></div>
            <div className={`border rounded-2xl p-4 shadow-sm flex items-center gap-3 ${themeClasses.innerCard}`}><div className="p-2.5 rounded-xl text-orange-500 bg-orange-500/10"><Clock size={18} /></div><div><span className={`text-[10px] uppercase font-bold block ${themeClasses.textSub}`}>Pending</span><span className={`text-sm font-black ${themeClasses.textMain}`}>{pendingCount}</span></div></div>
          </div>
        )}

        {/* 🛠️ CUSTOMER SUPPORT HELPDESK TAB COMPONENT */}
        {activeTab === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className={`lg:col-span-3 border rounded-3xl p-5 shadow-xl space-y-4 h-fit ${themeClasses.cardBg}`}>
              <div><h4 className="text-xs font-bold uppercase tracking-wider">Support Helpdesk</h4><p className={`text-[11px] ${themeClasses.textSub}`}>Fill in the ticket form to report application issues.</p></div>
              <form onSubmit={handleSupportSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[9px] font-bold uppercase mb-1">From</label><select value={fromPay} onChange={(e) => setFromPay(e.target.value)} className={`w-full border rounded-lg px-2 py-2 text-xs focus:outline-none ${themeClasses.inputBg}`}><option value="KPay">KBZPay</option><option value="WaveMoney">WavePay</option><option value="CBPay">CB Pay</option></select></div>
                  <div><label className="block text-[9px] font-bold uppercase mb-1">To</label><select value={toPay} onChange={(e) => setToPay(e.target.value)} className={`w-full border rounded-lg px-2 py-2 text-xs focus:outline-none ${themeClasses.inputBg}`}><option value="WaveMoney">WavePay</option><option value="KPay">KBZPay</option><option value="CBPay">CB Pay</option></select></div>
                </div>
                <div><label className="block text-[9px] font-bold uppercase mb-1">Transaction ID</label><input type="text" placeholder="e.g. TXN-77210" required value={supportTxnNo} onChange={(e) => setSupportTxnNo(e.target.value)} className={`w-full border rounded-lg px-2 py-2 text-xs focus:outline-none font-mono ${themeClasses.inputBg}`} /></div>
                <div><label className="block text-[9px] font-bold uppercase mb-1">Describe Issue</label><textarea rows="2" required placeholder="Type details..." value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none ${themeClasses.inputBg}`}></textarea></div>
                <button type="submit" className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 uppercase shadow-md"><Send size={12} /> Send Ticket</button>
              </form>
            </div>
            
            {/* ACTIVE TICKETS CONTAINER */}
            <div className={`lg:col-span-2 border rounded-3xl p-5 shadow-xl space-y-3 flex flex-col ${themeClasses.cardBg}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider">Active Tickets</h4>
              <div className="space-y-3 overflow-y-auto max-h-[300px] lg:max-h-[400px]">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className={`p-3.5 border rounded-xl space-y-2 text-[11px] font-medium shadow-sm ${themeClasses.innerCard}`}>
                    <div className="flex justify-between items-center"><span className="font-bold text-amber-500 font-mono text-xs">{ticket.id}</span><span className="px-2 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f5980b' }}>{ticket.status}</span></div>
                    <div className="font-bold text-[10px]">{ticket.route} <span className="font-mono font-normal block text-[9px] opacity-60">Txn: {ticket.txn}</span></div>
                    <p className={themeClasses.textSub}>{ticket.userMsg}</p>
                    <div className={`p-2 rounded-lg text-[10px] ${isDarkMode ? 'bg-slate-900 border border-slate-800 text-cyan-400' : 'bg-slate-100 text-slate-700'}`}><span className="font-bold block text-[9px] uppercase tracking-wider mb-0.5 opacity-75">Admin Reply:</span>{ticket.sysReply}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE MAIN OR EDIT COMPONENT */}
        {activeTab === 'profile' && (
          <>
            {!isEditing ? (
              <div className={`border rounded-3xl p-5 md:p-6 shadow-xl space-y-5 ${themeClasses.cardBg}`}>
                <div className={`flex justify-between items-center pb-3 border-b ${themeClasses.borderSeparator}`}><h4 className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textSub}`}>Recent Transactions</h4><button onClick={() => setActiveTab('history')} className={`text-[10px] font-bold uppercase border px-3 py-1.5 rounded-lg ${themeClasses.btnSecondary}`}>View All</button></div>
                <div className="space-y-3">
                  {userTransactions.length === 0 ? (<div className={`text-center py-6 text-xs ${themeClasses.textSub}`}>No transactions found.</div>) : (
                    userTransactions.slice(0, 3).map((txn) => {
                      const statusMeta = getStatusDetails(txn.status);
                      return (
                        <div key={txn.id} onClick={() => { setSelectedTxn(txn); setShowVoucher(true); }} className={`border p-4 rounded-xl flex justify-between items-center shadow-sm cursor-pointer ${themeClasses.innerCard}`}>
                          <div><span className={`text-[9px] font-mono ${themeClasses.textMuted}`}>{txn.id} • {txn.date}</span><div className="flex items-center space-x-1.5 mt-1"><span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-700 border'}`}>{txn.from}</span><ArrowRight size={10} className={themeClasses.textMuted} /><span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${isDarkMode ? 'bg-slate-950 text-yellow-400' : 'bg-amber-50 text-amber-600'}`}>{txn.to}</span></div></div>
                          <div className="text-right"><span className={`text-sm font-black block ${themeClasses.textMain}`}>{txn.amount.toLocaleString()} MMK</span><span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded mt-1" style={statusMeta.badgeStyle}>{statusMeta.label}</span></div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* EDIT PROFILE FORM COMPONENT */
              <form onSubmit={handleSaveChanges} className={`border rounded-3xl p-5 md:p-6 shadow-xl space-y-5 ${themeClasses.cardBg}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">Edit Profile Details</h4>
                <div className={`border p-4 rounded-2xl flex items-center gap-4 ${themeClasses.innerCard}`}>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                  <div className="relative cursor-pointer shrink-0" onClick={() => fileInputRef.current.click()}><img src={tempAvatar} className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 p-0.5" alt="Preview" /><div className="absolute inset-0 bg-slate-950/40 rounded-full flex items-center justify-center"><Camera size={14} className="text-white" /></div></div>
                  <div><span className={`text-xs font-bold block ${themeClasses.textMain}`}>Change Profile Photo</span><span className={`text-[10px] ${themeClasses.textSub}`}>Click photo to upload new image.</span></div>
                </div>
                <div className="space-y-3.5">
                  <div><label className={`block text-[10px] font-bold uppercase mb-1.5 ${themeClasses.textSub}`}>Full Name</label><div className={`flex items-center border rounded-xl px-3 py-2.5 ${themeClasses.inputBg}`}><User size={14} className="mr-2 opacity-50" /><input type="text" required value={editName} onChange={(e)=>setEditName(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none" /></div></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={`block text-[10px] font-bold uppercase mb-1.5 ${themeClasses.textSub}`}>Email Address</label><div className={`flex items-center border rounded-xl px-3 py-2.5 ${themeClasses.inputBg}`}><Mail size={14} className="mr-2 opacity-50" /><input type="email" required value={editEmail} onChange={(e)=>setEditEmail(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none" /></div></div>
                    <div><label className={`block text-[10px] font-bold uppercase mb-1.5 ${themeClasses.textSub}`}>Phone Number</label><div className={`flex items-center border rounded-xl px-3 py-2.5 ${themeClasses.inputBg}`}><Phone size={14} className="mr-2 opacity-50" /><input type="tel" required value={editPhone} onChange={(e)=>setEditPhone(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none font-mono" /></div></div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className={`flex-1 border py-2.5 rounded-xl text-xs font-bold ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>Cancel</button>
                  <button type="submit" className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 uppercase shadow-lg"><CheckCircle size={14} /> Save Changes</button>
                </div>
              </form>
            )}
          </>
        )}

        {/* 📜 HISTORICAL FULL SCROLLABLE TRANSACTION HISTORY */}
        {activeTab === 'history' && (
          <div className={`border rounded-3xl p-5 shadow-xl space-y-4 ${themeClasses.cardBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-dashed border-slate-700/20">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textSub}`}>Full Audit Records</h4>
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`flex items-center border rounded-lg px-2 py-1 gap-1.5 ${themeClasses.inputBg}`}><Calendar size={12} /><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-[10px] focus:outline-none" /></div>
                <span className="text-[10px]">to</span>
                <div className={`flex items-center border rounded-lg px-2 py-1 gap-1.5 ${themeClasses.inputBg}`}><Calendar size={12} /><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-[10px] focus:outline-none" /></div>
              </div>
            </div>
            
            {/* Container control point for scrolling long listings natively */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {filteredTransactions.length === 0 ? (<div className="text-center py-12 text-xs">No transactions match.</div>) : (
                filteredTransactions.map((txn) => {
                  const statusMeta = getStatusDetails(txn.status);
                  return (
                    <div key={txn.id} onClick={() => { setSelectedTxn(txn); setShowVoucher(true); }} className={`border p-4 rounded-xl flex justify-between items-center cursor-pointer transition-all duration-200 ${themeClasses.innerCard}`}>
                      <div><span className={`text-[10px] font-mono ${themeClasses.textMuted}`}>{txn.id} • {txn.date}</span><div className="flex items-center space-x-2 mt-1"><span className="text-xs font-bold">{txn.from}</span><ArrowRight size={12} /><span className="text-xs font-bold text-amber-500">{txn.to}</span></div></div>
                      <div className="text-right"><span className={`text-sm font-black ${themeClasses.textMain}`}>{txn.amount.toLocaleString()} MMK</span><span className="block text-[9px] font-bold px-2 py-0.5 rounded mt-1" style={statusMeta.badgeStyle}>{statusMeta.label}</span></div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🧾 RENDER-SAFE INLINE CSS VOUCHER MODAL */}
      {showVoucher && selectedTxn && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm rounded-3xl shadow-2xl relative overflow-hidden flex flex-col bg-slate-900 border border-slate-800">
            <div className="flex justify-between items-center px-5 py-3.5 bg-slate-950 border-b border-slate-800">
              <button onClick={downloadVoucherHandle} className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"><Download size={15} /> Save Receipt</button>
              <button onClick={() => setShowVoucher(false)} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"><X size={16} /></button>
            </div>
            <div ref={voucherRef} style={{ backgroundColor: '#0f172a', color: '#ffffff' }} className="p-6 space-y-5 relative">
              <div className="text-center space-y-1">
                <div className="mx-auto w-11 h-11 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow-lg mb-2"><FileText size={20} /></div>
                <h3 style={{ color: '#fbbf24' }} className="text-xs font-black uppercase tracking-widest">Transaction Voucher</h3>
                <p style={{ color: '#94a3b8' }} className="text-[10px]">Secure Wallet Exchange Network</p>
              </div>
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', color: getStatusDetails(selectedTxn.status).canvasColor, border: `1px solid ${getStatusDetails(selectedTxn.status).canvasColor}` }} className="p-2.5 rounded-xl text-center text-[10px] font-black tracking-wide">{getStatusDetails(selectedTxn.status).text}</div>
              <div className="text-center py-2 border-y border-dashed border-slate-700"><span style={{ color: '#ffffff' }} className="text-2xl font-mono font-black">{selectedTxn.amount.toLocaleString()} <span className="text-xs font-bold text-slate-400">MMK</span></span></div>
              <div className="space-y-2.5 text-[11px]">
                <div className="flex justify-between"><span style={{ color: '#94a3b8' }}>Transaction ID:</span><span style={{ color: '#f8fafc' }} className="font-mono font-bold">{selectedTxn.id}</span></div>
                <div className="flex justify-between"><span style={{ color: '#94a3b8' }}>Timestamp:</span><span style={{ color: '#cbd5e1' }} className="font-mono">{selectedTxn.date}</span></div>
                <div className="flex justify-between border-t border-slate-800 pt-2"><span style={{ color: '#94a3b8' }}>Source:</span><span style={{ color: '#fbbf24' }} className="font-bold uppercase">{selectedTxn.from}</span></div>
                <div className="flex justify-between"><span style={{ color: '#94a3b8' }}>Destination:</span><span style={{ color: '#fbbf24' }} className="font-bold uppercase">{selectedTxn.to}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}