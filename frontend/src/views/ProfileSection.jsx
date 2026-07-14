import React, { useState, useRef, useContext, useEffect } from 'react';
import { ThemeContext } from '../App'; 
import { 
  Clock, ArrowRight, Camera, User, Phone, Mail, LogOut, 
  Pencil, RefreshCw, ArrowUpRight, ArrowDownLeft, Calendar, 
  CheckCircle, Download, X, FileText, HelpCircle, Send, ShieldAlert, KeyRound
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { io } from 'socket.io-client';

export default function ProfileSection({ 
  userInfo = { id: 1, name: "Kyaw Kyaw", phone: "09123456789", profile_photo: "/uploads/default-avatar.png", email: "user@gmail.com" }, 
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

  // Local state to manage live transaction modifications
  const [liveTransactions, setLiveTransactions] = useState(userTransactions);

  // Voucher Modal States
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [showVoucher, setShowVoucher] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Form States (Edit Profile)
  const [editName, setEditName] = useState(userInfo.name);
  const [editPhone, setEditPhone] = useState(userInfo.phone);
  const [editEmail, setEditEmail] = useState(userInfo.email);
  const [tempAvatar, setTempAvatar] = useState(userInfo.profile_photo);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Support Helpdesk States
  const [fromPay, setFromPay] = useState('KPay');
  const [toPay, setToPay] = useState('WaveMoney');
  const [supportTxnNo, setSupportTxnNo] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [supportTickets, setSupportTickets] = useState([
    {
      id: "TKT-9941",
      status: "Pending Review",
      route: "KBZPay ➔ WavePay",
      txn: "TXN-00281",
      userMsg: "Transfer has taken over an hour and funds haven't arrived yet. Please check.",
      sysReply: "Currently experiencing network delays. Please wait patiently."
    }
  ]);

  // Securely format image source paths
  const formatImgSrc = (src) => {
    if (!src) return "/uploads/default-avatar.png";
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    return src.startsWith('/') ? src : `/${src}`;
  };

  // Synchronize dynamic updates from parent node data injection
  useEffect(() => {
    setLiveTransactions(userTransactions);
  }, [userTransactions]);

  // Initialize Socket.io-client connection listener for transaction mutations
  useEffect(() => {
    if (!userInfo?.id) return;

    // Establish WebSocket connection with backend core server
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true
    });

    // Authenticate and lock socket connection session to current user channel room
    socket.emit('join_user_room', { userId: userInfo.id });

    // Catch instant backend notifications when an operational admin alters any status
    socket.on('transaction_status_updated', (updatedTxn) => {
      setLiveTransactions((prevTxns) => 
        prevTxns.map((txn) => txn.txn_id === updatedTxn.txn_id ? { ...txn, status: updatedTxn.status } : txn)
      );

      // Refresh currently opened voucher viewport context if the user is reviewing it live
      setSelectedTxn((currentTxn) => {
        if (currentTxn && currentTxn.txn_id === updatedTxn.txn_id) {
          return { ...currentTxn, status: updatedTxn.status };
        }
        return currentTxn;
      });
    });

    // Gracefully terminate streaming listeners on component unmount lifecycle
    return () => {
      socket.off('transaction_status_updated');
      socket.disconnect();
    };
  }, [userInfo?.id]);

  // Sync state if userInfo updates from parent/database props
  
  useEffect(() => {
    setEditName(userInfo.name);
    setEditPhone(userInfo.phone);
    setEditEmail(userInfo.email);
    setTempAvatar(userInfo.profile_photo);
  }, [userInfo]);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if(setUserInfo) {
      setUserInfo({ 
        ...userInfo, 
        name: editName, 
        phone: editPhone, 
        email: editEmail, 
        profile_photo: tempAvatar 
      });
    }
    setIsEditing(false);
    
    setToast({ show: true, message: "Profile updated successfully.", type: "success" });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 1000);
  };
  
  // Add this inside your ProfileSection component
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setOldPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setToast({ show: true, message: "Please fill all password fields.", type: "error" });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 1000);
      return;
    }
      
    if (passwordForm.newPassword.length < 8) {
      setNewPasswordError("Password must be at least 8 characters long.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setConfirmPasswordError("Confirm password does not match new password.");
      return;
    }

    if (setUserInfo) {
      const res = await setUserInfo({
        ...userInfo,
        name: editName,
        phone: editPhone,
        email: editEmail,
        profile_photo: tempAvatar,
        oldPassword: passwordForm.oldPassword, 
        password: passwordForm.newPassword
      });

      if (res && res.success) {
        setIsPasswordModalOpen(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        
        setToast({ show: true, message: "Password changed successfully.", type: "success" });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 1000);
      } else {
        if (res.error && res.error.toLowerCase().includes("old password")) {
          setOldPasswordError(res.error);
        } else {
          setConfirmPasswordError(res.error || "An error occurred.");
        }
      }
    }
  };
useEffect(() => {
  const fetchTickets = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tickets');
      const data = await response.json();
      
      // Map database columns to match your UI expectation
      const formattedTickets = data.map(t => ({
        id: `TXN-${t.id}`, // Assuming your DB ID is a number
        status: t.status,
        route: t.route,
        txn: t.txn_no,
        userMsg: t.user_message,
        sysReply: t.admin_reply || "Awaiting response..."
      }));
      
      setSupportTickets(formattedTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  if (activeTab === 'support') {
    fetchTickets();
  }
}, [activeTab]); // Runs whenever the support tab is opened
//end modified code

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result); // Transform image file into base64 string
      }; 
      reader.readAsDataURL(file);
    }
  };


  //modified code
  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    
    const ticketData = {
      userId: userInfo.id, 
      fromPay,
      toPay,
      txnNo: supportTxnNo,
      message: supportMessage
    };

    try {
      const response = await fetch('http://localhost:5000/api/tickets/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });

      const result = await response.json();
      if (result.success) {
        const clientTicket = {
          id: `TKT-${result.ticketId || Math.floor(1000 + Math.random() * 9000)}`,
          status: "Pending Review",
          route: `${fromPay} ➔ ${toPay}`,
          txn: supportTxnNo,
          userMsg: supportMessage,
          sysReply: "Awaiting response..."
        };
        setSupportTickets(prev => [clientTicket, ...prev]);

        setSupportTxnNo('');
        setSupportMessage('');

        setToast({ show: true, message: "Support Ticket submitted successfully.", type: "success" });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 1500);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      setToast({ show: true, message: "Submission failed.", type: "error" });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 1500);
    }
  };

const downloadVoucherHandle = async () => {
    const element = voucherRef.current;
    if (!element) return;
    
    try {
      // Force inline styling rules temporarily to guarantee correct heights
      const originalStyle = element.style.cssText;
      element.style.transform = 'none';
      element.style.letterSpacing = 'normal';
      
      // Execute capture with strict formatting settings
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: false, // Set to false to avoid cross-origin tainted canvas locks
        scale: 2,
        backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY, // Negate scroll positions to prevent offset cutoff bugs
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
      });

      // Restore baseline component configurations
      element.style.cssText = originalStyle;

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      
      // Cross-platform compatible virtual pointer download event trigger
      link.setAttribute("href", image);
      link.setAttribute("download", `Voucher-TXN-${selectedTxn?.id || 'Receipt'}.png`);
      link.style.display = "none";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Critical rendering failure details:", error);
      alert("Failed to compile receipt image engine natively. Please take a screenshot of your screen to save this file.");
    }
  };

// Handle Card Clicks (Block Pending from opening)
  const handleTransactionClick = (txn) => {
    if (String(txn.status) === "0") {
      // Pending state -> Do nothing when clicked
      return; 
    }
    setSelectedTxn(txn);
    setShowVoucher(true);
  };

//end modified code

  const getStatusDetails = (statusCode) => {
    switch (String(statusCode)) {
      case "1":
        return { 
          label: "Approved", 
          badgeStyle: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' },
          heading: "TRANSACTION SUCCESSFUL",
          note: "Thank you for exchanging with us! Your funds have been successfully transferred to the target wallet.",
          colorClass: "text-emerald-500"
        };
      case "2":
        return { 
          label: "Rejected", 
          badgeStyle: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' },
          heading: "TRANSACTION REJECTED",
          note: "We are sorry, but this transaction was cancelled or declined. Please check your transaction details and try again.",
          colorClass: "text-rose-500"
        };
      case "0":
      default:
        return { 
          label: "Pending", 
          badgeStyle: { backgroundColor: 'rgba(245, 152, 11, 0.1)', color: '#f5980b', border: '1px solid rgba(245, 152, 11, 0.2)' },
          heading: "TRANSACTION PENDING",
          note: "Processing... Please wait a few moments.",
          colorClass: "text-amber-500"
        };
    }
  };

  const totalExchanges = liveTransactions.length; 
  const pendingCount = liveTransactions.filter(t => String(t.status) === "0").length; 
  
  const totalSent = liveTransactions
    .filter(t => String(t.status) === "1")
    .reduce((acc, curr) => acc + (Number(curr.send_amount) || 0), 0);
    
  const totalReceived = liveTransactions
    .filter(t => String(t.status) === "1")
    .reduce((acc, curr) => acc + (Number(curr.receive_amount) || 0), 0); 

  const todayStr = new Date().toISOString().split('T')[0]; 
  const checkIsToday = (createdAtStr) => {
    if (!createdAtStr) return false;
    return createdAtStr.startsWith(todayStr);
  };

  const recentTransactions = liveTransactions.filter(txn => checkIsToday(txn.created_at));

  const filteredHistoryTransactions = liveTransactions.filter(txn => {
    if (!txn.created_at) return false;
    const txnDateOnly = txn.created_at.split(' ')[0]; 
    if (!startDate && !endDate) {
      return !checkIsToday(txn.created_at);
    }
    if (startDate && txnDateOnly < startDate) return false;
    if (endDate && txnDateOnly > endDate) return false;
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
      
      {toast.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
          <div className={`transform transition-all duration-300 scale-100 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl border font-bold text-xs text-white animate-in fade-in zoom-in-95 ${
            toast.type === 'success' 
              ? 'bg-emerald-500 border-emerald-400' 
              : 'bg-rose-500 border-rose-400'
          }`}>
            <CheckCircle size={16} className="shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
      
      {/*  MOBILE NAVIGATION & QUICK PROFILE BAR */}
      <div className={`w-full md:hidden rounded-2xl border p-3 flex flex-col space-y-3 shadow-md ${themeClasses.sidebarBg}`}>
        <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-700/20">
          <div className="flex items-center gap-3">
            <img 
              src={formatImgSrc(userInfo.profile_photo)} 
              alt="User Avatar" 
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-500 p-0.5" 
              onError={(e) => { e.currentTarget.src = "/uploads/default-avatar.png"; }}
            />
            <div>
              <h3 className={`text-xs font-bold ${themeClasses.textMain}`}>{userInfo.name}</h3>
              <span className={`text-[10px] font-mono block ${themeClasses.textSub}`}>{userInfo.phone}</span>
            </div>
          </div>
          <button type="button" onClick={() => { setIsEditing(true); setActiveTab('profile'); }} className={`px-2.5 py-1 border rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${isEditing ? 'bg-amber-500 text-slate-950 border-amber-500' : `${themeClasses.btnSecondary}`}`}><Pencil size={10} /> Edit</button>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button onClick={() => { setActiveTab('profile'); setIsEditing(false); }} className={`shrink-0 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'profile' && !isEditing ? 'bg-amber-500 text-slate-950' : 'opacity-70'}`}><User size={14} /> Dashboard</button>
          <button onClick={() => { setActiveTab('history'); setIsEditing(false); }} className={`shrink-0 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'history' ? 'bg-amber-500 text-slate-950' : 'opacity-70'}`}><Clock size={14} /> History</button>
          <button onClick={() => { setActiveTab('support'); setIsEditing(false); }} className={`shrink-0 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'support' ? 'bg-amber-500 text-slate-950' : 'opacity-70'}`}><HelpCircle size={14} /> Support</button>
        </div>
      </div>

      {/* DESKTOP CONTROLS SIDEBAR */}
      <div className={`hidden md:flex border rounded-3xl p-5 flex-col space-y-2 shadow-xl backdrop-blur-md w-full ${themeClasses.sidebarBg}`}>
        <div className={`flex flex-col items-center text-center pb-4 border-b ${themeClasses.borderSeparator} mb-3`}>
          <img 
            src={formatImgSrc(userInfo.profile_photo)} 
            alt="User Node Avatar" 
            className="w-20 h-20 rounded-full object-cover border-2 border-amber-500 p-0.5" 
            onError={(e) => { e.currentTarget.src = "/uploads/default-avatar.png"; }}
          />
          <h3 className={`text-sm font-bold max-w-full truncate mt-2 ${themeClasses.textMain}`}>{userInfo.name}</h3>
          <span className={`text-[11px] font-mono block mb-2 ${themeClasses.textSub}`}>{userInfo.phone}</span>
          <button type="button" onClick={() => { setIsEditing(true); setActiveTab('profile'); }} className={`px-3 py-1 border rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${isEditing ? 'bg-amber-500 text-slate-950 border-amber-500' : `${themeClasses.btnSecondary}`}`}><Pencil size={10} /> Edit Profile</button>
        </div>
        
        <button onClick={() => { setActiveTab('profile'); setIsEditing(false); }} className={`w-full py-2.5 px-4 text-left rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeTab === 'profile' && !isEditing ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600') : 'opacity-75'}`}><User size={15} /> Dashboard</button>
        <button onClick={() => { setActiveTab('history'); setIsEditing(false); }} className={`w-full py-2.5 px-4 text-left rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeTab === 'history' ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600') : 'opacity-75'}`}><Clock size={15} /> Transaction History</button>
        <button onClick={() => { setActiveTab('support'); setIsEditing(false); }} className={`w-full py-2.5 px-4 text-left rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeTab === 'support' ? (isDarkMode ? 'bg-slate-950 text-yellow-400 border border-slate-800' : 'bg-amber-50 text-amber-600') : 'opacity-75'}`}><HelpCircle size={15} /> Support Helpdesk</button>
        
        <div className={`pt-4 border-t ${themeClasses.borderSeparator} mt-4`}><button onClick={() => setIsLogoutModalOpen(true)} className="w-full text-xs bg-rose-500/10 border text-rose-500 py-2.5 rounded-xl transition font-bold flex items-center justify-center gap-2"><LogOut size={14}/> Logout</button></div>
      </div>

      {/* MAIN INTERACTIVE VIEWPORT */}
      <div className="md:col-span-3 space-y-6 w-full">
        
        {/* UPPER SUMMARY GRID CARDS */}
        {activeTab === 'profile' && !isEditing && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`border rounded-2xl p-4 shadow-sm flex items-center gap-3 ${themeClasses.innerCard}`}><div className="p-2.5 rounded-xl text-amber-500 bg-amber-500/10"><RefreshCw size={18} /></div><div><span className={`text-[10px] uppercase font-bold block ${themeClasses.textSub}`}>Exchanges</span><span className={`text-sm font-black ${themeClasses.textMain}`}>{totalExchanges}</span></div></div>
            <div className={`border rounded-2xl p-4 shadow-sm flex items-center gap-3 ${themeClasses.innerCard}`}><div className="p-2.5 rounded-xl text-emerald-500 bg-emerald-500/10"><ArrowUpRight size={18} /></div><div><span className={`text-[10px] uppercase font-bold block ${themeClasses.textSub}`}>Total Sent</span><span className={`text-xs font-black ${themeClasses.textMain}`}>{totalSent.toLocaleString()} MMK</span></div></div>
            <div className={`border rounded-2xl p-4 shadow-sm flex items-center gap-3 ${themeClasses.innerCard}`}><div className="p-2.5 rounded-xl text-cyan-500 bg-cyan-500/10"><ArrowDownLeft size={18} /></div><div><span className={`text-[10px] uppercase font-bold block ${themeClasses.textSub}`}>Net Received</span><span className={`text-xs font-black ${themeClasses.textMain}`}>{totalReceived.toLocaleString()} MMK</span></div></div>
            <div className={`border rounded-2xl p-4 shadow-sm flex items-center gap-3 ${themeClasses.innerCard}`}><div className="p-2.5 rounded-xl text-orange-500 bg-orange-500/10"><Clock size={18} /></div><div><span className={`text-[10px] uppercase font-bold block ${themeClasses.textSub}`}>Pending</span><span className={`text-sm font-black ${themeClasses.textMain}`}>{pendingCount}</span></div></div>
          </div>
        )}

        {/* PROFILE MAIN OR EDIT COMPONENT */}
        {activeTab === 'profile' && (
          <>
            {!isEditing ? (
              <div className={`border rounded-3xl p-5 md:p-6 shadow-xl space-y-5 ${themeClasses.cardBg}`}>
                <div className={`flex justify-between items-center pb-3 border-b ${themeClasses.borderSeparator}`}><h4 className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textSub}`}>Recent Transactions (Today)</h4><button onClick={() => setActiveTab('history')} className={`text-[10px] font-bold uppercase border px-3 py-1.5 rounded-lg ${themeClasses.btnSecondary}`}>Older Records</button></div>
                <div className="space-y-3">
                  {recentTransactions.length === 0 ? (<div className={`text-center py-6 text-xs ${themeClasses.textSub}`}>No exchanges processed today.</div>) : (
                    recentTransactions.map((txn) => {
                      const statusMeta = getStatusDetails(txn.status);
                      return (
                        <div key={txn.txn_id} onClick={() => { setSelectedTxn(txn); setShowVoucher(true); }} className={`border p-4 rounded-xl flex justify-between items-center shadow-sm cursor-pointer ${themeClasses.innerCard}`}>
                          <div><span className={`text-[10px] font-mono ${themeClasses.textMuted}`}>ID: {txn.txn_id} • {txn.created_at}</span><div className="flex items-center space-x-1.5 mt-1"><span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-700 border'}`}>{txn.from_wallet}</span><ArrowRight size={10} className={themeClasses.textMuted} /><span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${isDarkMode ? 'bg-slate-950 text-yellow-400' : 'bg-amber-50 text-amber-600'}`}>{txn.to_wallet}</span></div></div>
                          <div className="text-right"><span className={`text-sm font-black block ${themeClasses.textMain}`}>{Number(txn.send_amount).toLocaleString()} MMK</span><span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded mt-1" style={statusMeta.badgeStyle}>{statusMeta.label}</span></div>
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
                  <div className="relative cursor-pointer shrink-0" onClick={() => fileInputRef.current.click()}>
                    <img 
                      src={formatImgSrc(tempAvatar)} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 p-0.5" 
                      alt="Preview" 
                      onError={(e) => { e.currentTarget.src = "/uploads/default-avatar.png"; }}
                    />
                    <div className="absolute inset-0 bg-slate-950/40 rounded-full flex items-center justify-center"><Camera size={14} className="text-white" /></div>
                  </div>
                  <div><span className={`text-xs font-bold block ${themeClasses.textMain}`}>Change Profile Photo</span><span className={`text-[10px] ${themeClasses.textSub}`}>Click photo to upload new image.</span></div>
                </div>
                <div className="space-y-3.5">
                  <div><label className={`block text-[10px] font-bold uppercase mb-1.5 ${themeClasses.textSub}`}>Full Name</label><div className={`flex items-center border rounded-xl px-3 py-2.5 ${themeClasses.inputBg}`}><User size={14} className="mr-2 opacity-50" /><input type="text" required value={editName} onChange={(e)=>setEditName(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none" /></div></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={`block text-[10px] font-bold uppercase mb-1.5 ${themeClasses.textSub}`}>Email Address</label><div className={`flex items-center border rounded-xl px-3 py-2.5 ${themeClasses.inputBg}`}><Mail size={14} className="mr-2 opacity-50" /><input type="email" required value={editEmail} onChange={(e)=>setEditEmail(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none" /></div></div>
                    <div><label className={`block text-[10px] font-bold uppercase mb-1.5 ${themeClasses.textSub}`}>Phone Number</label><div className={`flex items-center border rounded-xl px-3 py-2.5 ${themeClasses.inputBg}`}><Phone size={14} className="mr-2 opacity-50" /><input type="tel" required value={editPhone} onChange={(e)=>setEditPhone(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none font-mono" /></div></div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-500/10 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                    <button type="button" onClick={() => setIsPasswordModalOpen(true)} className={`w-full sm:w-auto justify-center px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                      <KeyRound size={14} className="text-amber-500" /> Change Password
                    </button>
                  </div>
                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className={`flex-1 border py-2.5 rounded-xl text-xs font-bold ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>Cancel</button>
                  <button type="submit" className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 uppercase shadow-lg"> Save Change</button>
                </div>
              </form>
           
            )}
          </>
        )}

        {/*  HISTORICAL TRANSACTION HISTORY */}
        {activeTab === 'history' && (
          <div className={`border rounded-3xl p-5 shadow-xl space-y-4 ${themeClasses.cardBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-dashed border-slate-700/20">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textSub}`}>Full Audit Records (Older)</h4>
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`flex items-center border rounded-lg px-2 py-1 gap-1.5 ${themeClasses.inputBg}`}><Calendar size={12} /><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-[10px] focus:outline-none" /></div>
                <span className="text-[10px]">to</span>
                <div className={`flex items-center border rounded-lg px-2 py-1 gap-1.5 ${themeClasses.inputBg}`}><Calendar size={12} /><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-[10px] focus:outline-none" /></div>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 overflow-x-hidden">
              {filteredHistoryTransactions.length === 0 ? (<div className="text-center py-12 text-xs">No older transactions match the filter.</div>) : (
                filteredHistoryTransactions.map((txn) => {
                  const statusMeta = getStatusDetails(txn.status);
                  return (
                    <div key={txn.txn_id} onClick={() => { setSelectedTxn(txn); setShowVoucher(true); }} className={`border p-4 rounded-xl flex justify-between items-center cursor-pointer transition-all duration-200 ${themeClasses.innerCard}`}>
                      <div><span className={`text-[10px] font-mono ${themeClasses.textMuted}`}>ID: {txn.txn_id} • {txn.created_at}</span><div className="flex items-center space-x-2 mt-1"><span className="text-xs font-bold">{txn.from_wallet}</span><ArrowRight size={12} /><span className="text-xs font-bold text-amber-500">{txn.to_wallet}</span></div></div>
                      <div className="text-right"><span className={`text-sm font-black ${themeClasses.textMain}`}>{Number(txn.send_amount).toLocaleString()} MMK</span><span className="block text-[9px] font-bold px-2 py-0.5 rounded mt-1" style={statusMeta.badgeStyle}>{statusMeta.label}</span></div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/*  CUSTOM SUPPORT HELPDESK VIEW */}
        {activeTab === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className={`lg:col-span-3 border rounded-3xl p-5 shadow-xl space-y-4 h-fit ${themeClasses.cardBg}`}>
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textMain}`}>Support Helpdesk</h4>
                <p className={`text-[11px] ${themeClasses.textSub}`}>Fill in the ticket form to report application issues.</p>
              </div>
              <form onSubmit={handleSupportSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[9px] font-bold uppercase mb-1 ${themeClasses.textSub}`}>From</label>
                    <select value={fromPay} onChange={(e) => setFromPay(e.target.value)} className={`w-full border rounded-lg px-2 py-2 text-xs focus:outline-none ${themeClasses.inputBg}`}>
                      <option value="KPay">KBZPay</option>
                      <option value="WaveMoney">WavePay</option>
                      <option value="CBPay">CB Pay</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[9px] font-bold uppercase mb-1 ${themeClasses.textSub}`}>To</label>
                    <select value={toPay} onChange={(e) => setToPay(e.target.value)} className={`w-full border rounded-lg px-2 py-2 text-xs focus:outline-none ${themeClasses.inputBg}`}>
                      <option value="WaveMoney">WavePay</option>
                      <option value="KPay">KBZPay</option>
                      <option value="CBPay">CB Pay</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-[9px] font-bold uppercase mb-1 ${themeClasses.textSub}`}>Transaction ID</label>
                  <input type="text" placeholder="e.g. TXN-77210" required value={supportTxnNo} onChange={(e) => setSupportTxnNo(e.target.value)} className={`w-full border rounded-lg px-2 py-2 text-xs focus:outline-none font-mono ${themeClasses.inputBg}`} />
                </div>
                <div>
                  <label className={`block text-[9px] font-bold uppercase mb-1 ${themeClasses.textSub}`}>Describe Issue</label>
                  <textarea rows="2" required placeholder="Type details..." value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none ${themeClasses.inputBg}`}></textarea>
                </div>
                <button type="submit" className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 uppercase shadow-md">
                  <Send size={12} /> Send Ticket
                </button>
              </form>
            </div>
            
            {/* ACTIVE TICKETS CONTAINER */}
            <div className={`lg:col-span-2 border rounded-3xl p-5 shadow-xl space-y-3 flex flex-col ${themeClasses.cardBg}`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textMain}`}>Active Tickets</h4>
              <div className="space-y-3 overflow-y-auto max-h-[300px] lg:max-h-[400px]">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className={`p-3.5 border rounded-xl space-y-2 text-[11px] font-medium shadow-sm ${themeClasses.innerCard}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-500 font-mono text-xs">{ticket.id}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f5980b' }}>{ticket.status}</span>
                    </div>
                    <div className="font-bold text-[10px]">{ticket.route} <span className="font-mono font-normal block text-[9px] opacity-60">Txn: {ticket.txn}</span></div>
                    <p className={themeClasses.textSub}>{ticket.userMsg}</p>
                    <div className={`p-2 rounded-lg text-[10px] ${isDarkMode ? 'bg-slate-900 border border-slate-800 text-cyan-400' : 'bg-slate-100 text-slate-700'}`}>
                      <span className="font-bold block text-[9px] uppercase tracking-wider mb-0.5 opacity-75">Admin Reply:</span>
                      {ticket.sysReply}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/*  DOWNLOADABLE VOUCHER MODAL */}
      {showVoucher && selectedTxn && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden flex flex-col border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            
            {/* Header / Download Button (Kept outside voucherRef so it won't render inside the image screenshot) */}
            <div className={`flex justify-between items-center px-5 py-3.5 border-b ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <button onClick={downloadVoucherHandle} className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition">
                <Download size={15} /> Save Receipt
              </button>
              <button onClick={() => setShowVoucher(false)} className={`p-1 rounded-full transition ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'}`}>
                <X size={16} />
              </button>
            </div>

            {/* Receipt Content Capture Target Area */}
            <div 
              ref={voucherRef} 
              className={`p-6 space-y-6 w-full block ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
            >
              {/* Status Header Block */}
              <div className="text-center space-y-2">
                {/* Lucide SVGs with clean CSS checkmarks to stop html2canvas from crashing */}
                <div className="flex justify-center">
                  {String(selectedTxn.status) === "1" ? (
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold text-lg">
                      ✓
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-rose-500/10 rounded-full border border-rose-500/30 flex items-center justify-center text-rose-500 font-bold text-lg">
                      ✕
                    </div>
                  )}
                </div>
                <h3 className={`text-sm font-black tracking-wider ${getStatusDetails(selectedTxn.status).colorClass}`}>
                  {getStatusDetails(selectedTxn.status).heading}
                </h3>
                <p className="text-[11px] max-w-xs mx-auto opacity-75">
                  {getStatusDetails(selectedTxn.status).note}
                </p>
              </div>

              {/* Transaction Meta Details */}
              <div className={`rounded-2xl p-4 space-y-3 text-xs border ${isDarkMode ? 'bg-slate-950 border-slate-800/60' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-700/20">
                  <span className="opacity-60">Transaction No</span>
                  <span className="font-mono font-bold">#{selectedTxn.id}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="opacity-60">Exchange Route</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>{selectedTxn.from_wallet}</span>
                    <span className="opacity-40">➔</span>
                    <span>{selectedTxn.to_wallet}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="opacity-60">Sender Details</span>
                  <div className="text-right">
                    <span className="font-bold block">{selectedTxn.sender_name || 'N/A'}</span>
                    <span className="font-mono text-[10px] opacity-60">{selectedTxn.sender_phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="opacity-60">Receiver Details</span>
                  <div className="text-right">
                    <span className="font-bold block">{selectedTxn.receiver_name || 'N/A'}</span>
                    <span className="font-mono text-[10px] opacity-60">{selectedTxn.receiver_phone || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-700/20">
                  <span className="opacity-60">Date & Time</span>
                  <span className="font-mono">{selectedTxn.created_at}</span>
                </div>
              </div>

              {/* Exchange Amount Summary */}
              <div className={`rounded-2xl p-4 flex justify-between items-center border ${isDarkMode ? 'bg-gradient-to-br from-slate-950 to-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <span className="text-[10px] uppercase font-bold opacity-50 block">Amount Sent</span>
                  <span className="text-sm font-black text-amber-500">{Number(selectedTxn.send_amount).toLocaleString()} MMK</span>
                </div>
                <span className="opacity-30 text-xs">➔</span>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold opacity-50 block">Amount Received</span>
                  <span className="text-sm font-black text-emerald-500">{Number(selectedTxn.receive_amount).toLocaleString()} MMK</span>
                </div>
              </div>
              
              {/* Simple Brand Footer inside receipt screenshot */}
              <div className="text-center text-[10px] opacity-40 font-mono">
                Generated securely via E-Wallet Exchange Platform
              </div>
            </div>

          </div>
        </div>
      )}
      {/* Password Modal */}
                {isPasswordModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)} />
                    <div className={`relative w-full max-w-md p-5 sm:p-6 rounded-2xl border shadow-2xl transition-all animate-in zoom-in-95 duration-150 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-500/10">
                        <div className="flex items-center gap-2 text-amber-500"><ShieldAlert size={18} /><span className="text-sm font-black tracking-tight">Change Password</span></div>
                        <button type="button" onClick={() => setIsPasswordModalOpen(false)} className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}><X size={16} /></button>
                      </div>
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                          <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${themeClasses.textMuted}`}>Old Password</label>
                          <input type="password" required value={passwordForm.oldPassword} onChange={(e) => {
                            setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }));
                            setOldPasswordError('');
                          }} className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-amber-500 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} placeholder="••••••••" />
                          {oldPasswordError && (
                            <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                              {oldPasswordError}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${themeClasses.textMuted}`}>New Password</label>
                          <input type="password" required value={passwordForm.newPassword} onChange={(e) => {
                            setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                            setNewPasswordError('');
                          }} className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-amber-500 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} placeholder="Minimum 8 characters" />
                          
                         {newPasswordError && (
                              <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{newPasswordError}</p>
                            )}
                        </div>
                        <div>
                          <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${themeClasses.textMuted}`}>Confirm New Password</label>
                          <input type="password" required value={passwordForm.confirmPassword} onChange={(e) => {
                            setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                            setConfirmPasswordError('');
                          }} className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-amber-500 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} placeholder="Re-enter new password" />
                          {confirmPasswordError && (
                              <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{confirmPasswordError}</p>
                            )}
                        </div>
                        <div className="pt-2 flex justify-end gap-2">
                          <button type="button" onClick={() => setIsPasswordModalOpen(false)} className={`px-4 py-2 text-xs font-bold rounded-xl border cursor-pointer ${isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}>Dismiss</button>
                          <button type="submit" className="px-4 py-2 text-xs font-extrabold rounded-xl bg-amber-500 text-slate-950 hover:brightness-110 transition-all shadow-md shadow-amber-500/15 cursor-pointer">Change</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                 {/*LOGOUT CONFIRMATION MODAL UI */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsLogoutModalOpen(false)} />
          
          {/* Modal Content Box */}
          <div className={`relative w-full max-w-sm rounded-2xl p-6 border shadow-2xl transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                <LogOut size={24} />
              </div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Confirm Logout</h3>
              <p className={`text-xs mt-2 ${themeClasses.textSub}`}>Are you sure you want to log out?</p>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
                  isDarkMode ? 'border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition shadow-lg shadow-rose-500/15 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}