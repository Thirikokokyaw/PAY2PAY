import React, { useState, useContext, useEffect } from 'react';
import { 
  ArrowRight, QrCode, AlertCircle, Info, CheckCircle, 
  ArrowLeft, Send, Wallet, RefreshCw
} from 'lucide-react';
import { ThemeContext } from '../App.jsx';
import '../App.css';

// 💡 Added 'setUserInfo' into the props destruction layer to prevent runtime crashes
export default function ExchangeFormPage({ isLoggedIn, userInfo, setUserInfo, onRedirectToLogin = () => {} }) {
  const { darkMode } = useContext(ThemeContext);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🛡️ SECURITY LAYER: Route Access Protection
  useEffect(() => {
    if (!isLoggedIn) {
      onRedirectToLogin();
    }
  }, [isLoggedIn, onRedirectToLogin]);

  // Wallet State Pool (Populated directly from Database)
  const [wallets, setWallets] = useState({});
  const [fromWallet, setFromWallet] = useState('');
  const [toWallet, setToWallet] = useState('');
  const [amount, setAmount] = useState('');

  // Transaction Input States
  const [senderAccountName, setSenderAccountName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [lastSixDigits, setLastSixDigits] = useState('');

  // 🔄 FETCH REAL-TIME WALLET DATA FROM DATABASE VIA API
  const fetchWalletBalances = async () => {
    if (!userInfo?.id) return;
    
    // Turn loading on
    setIsLoading(true); 

    // ─── 🛡️ LIVE USER STATUS CHECK LAYER ───
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userInfo.id}`);
      
      if (res.ok) {
        const userData = await res.json();
        
        // 1. Verify Blacklist State (Handles multiple data formats safely)
        if (userData.isBlacklisted === 1 || userData.isBlacklisted === true || userData.isBlacklisted === "1") {
          alert("Access Denied: Your profile has been permanently blacklisted from our ledger network.");
          setIsLoading(false); 
          return; 
        }

        // 2. Verify Blocked State
        if (userData.status === 'Blocked') {
          alert("Account Suspended: This profile is temporarily frozen.");
          if (typeof setUserInfo === 'function') {
            setUserInfo(prev => ({ ...prev, status: 'Blocked' }));
          } else {
            userInfo.status = 'Blocked';
          }
          setIsLoading(false); 
          return; 
        }
        
        // 3. Normalize Active Account States 
        if (userData.status === 'Active' && userInfo.status !== 'Active') {
          if (typeof setUserInfo === 'function') {
            setUserInfo(prev => ({ ...prev, status: 'Active' }));
          }
        }
      }
    } catch (e) {
      console.error("Live user status sync failed, bypassing checkpoint:", e);
    }

    // ─── 🔄 ORIGINAL WALLET BALANCES FETCH LOGIC ───
    try {
      const response = await fetch('http://localhost:5000/api/wallets');
      const data = await response.json();
      
      setWallets(data);
      
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const activeWallets = keys.filter(k => data[k].active);
        setFromWallet(activeWallets[0] || keys[0]);
        setToWallet(keys[1] || keys[0]);
      }
    } catch (error) {
      console.error("Database connection failure, loading fallback profiles:", error);
      const mockData = {
        KBZPay: { label: 'KBZPay Mobile Wallet', balance: 1000000.00, active: true },
        WavePay: { label: 'WavePay Mobile Wallet', balance: 1000000.00, active: true },
        CBPay: { label: 'CBPay Mobile Banking', balance: 1000000.00, active: true }, 
        AYAPay: { label: 'AYAPay Digital Wallet', balance: 1000000.00, active: true },
        UABPay: { label: 'uabpay Mobile Wallet', balance: 1000000.00, active: true },
      };
      setWallets(mockData);
      setFromWallet('KBZPay');
      setToWallet('WavePay');
    } finally {
      // 💡 Crucial execution hook: Ensures loading state turns OFF for regular users
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchWalletBalances();
    }
  }, [isLoggedIn]);

  // 🎨 DYNAMIC UI THEMING CONTEXT 
  const bgCard = darkMode 
    ? 'bg-slate-950 border border-amber-500/20 text-white shadow-[0_0_30px_rgba(212,175,55,0.15)]' 
    : 'bg-white border border-amber-500/30 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.05)]';

  const bgInner = darkMode 
    ? 'bg-slate-900/90 border border-amber-500/20' 
    : 'bg-amber-50/40 border border-amber-500/20';

  const bgInput = darkMode 
    ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-amber-400' 
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-500';

  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const textTitle = darkMode ? 'text-amber-200' : 'text-amber-600 font-black';
  const bgBadge = darkMode ? 'bg-amber-300 text-slate-950' : 'bg-amber-500 text-white';

  const transferAmount = Number(amount) || 0;
  const netReceivedAmount = transferAmount > 0 ? transferAmount * 0.98 : 0;

  // ─── 🛡️ USER ACCOUNT BLOCKED RETURN STATEMENT ───
  if (isLoggedIn && userInfo && userInfo.status === 'Blocked') {
    return (
      <div className={`max-w-md mx-auto border rounded-3xl p-8 text-center transition-all ${bgCard} bg-amber-500/5 backdrop-blur-sm animate-fadeIn`}>
        <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-base font-black uppercase tracking-wider text-amber-500">
          Exchange Service Suspended
        </h3>
        <p className={`text-[11px] mt-2 leading-relaxed max-w-xs mx-auto ${textMuted}`}>
          Your transaction capabilities have been temporarily suspended by the administration. Please contact our support desk to clear account limitations.
        </p>
      </div>
    );
  }

  // STEP 1 VALIDATION
  const handleWalletSubmit = (e) => {
    e.preventDefault();
    
    if (fromWallet === toWallet) {
      alert(" Error: Source gateway and destination gateway cannot be identical.");
      return;
    }
    if (!wallets[fromWallet]?.active) {
      alert(` Operation Denied: The ${wallets[fromWallet]?.label} network service is currently suspended.`);
      return;
    }
    if (transferAmount < 1000 || transferAmount > 500000) {
      alert(" Threshold Error: Allowed transfer range is 1,000 MMK to 500,000 MMK only.");
      return;
    }

    const targetWalletAvailableReserve = wallets[toWallet]?.balance || 0;
    if (netReceivedAmount > targetWalletAvailableReserve) {
      alert(` Liquidity Alert: Our ${wallets[toWallet]?.label} reserve currently only has ${targetWalletAvailableReserve.toLocaleString()} MMK available for payout. The maximum amount you can exchange right now from ${wallets[fromWallet]?.label} is ${Math.floor(targetWalletAvailableReserve / 0.98).toLocaleString()} MMK.`);
      return;
    }

    setStep(2);
  };

  // 💾 STEP 3 SUBMISSION HANDLER
  const handleExchangeSubmit = async (e) => {
    e.preventDefault();
    
    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(senderPhone)) {
      alert(" Sender Phone Number must be exactly 10 or 11 digits.");
      return;
    }
    if (!phoneRegex.test(receiverPhone)) {
      alert(" Receiver Phone Number must be exactly 10 or 11 digits.");
      return;
    }

    if (lastSixDigits.length !== 6 || isNaN(lastSixDigits)) {
      alert("Verification Failed: Please input exactly the final 6 numerical characters of your payment receipt code.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/exchange/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromWallet: fromWallet,
          toWallet: toWallet,
          amount: transferAmount,
          txnIdTail: lastSixDigits,
          senderPhone: senderPhone,
          receiverPhone: receiverPhone,
          senderName: senderAccountName,
          receiverName: receiverName,
          userId: userInfo?.id || 1
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStep(4);
      } else {
        alert(` Core Rejection: ${result.message || 'Transaction submission failed.'}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(" Network Failure: Cannot connect to the registration server database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) return null;
  if (isLoading) {
    return (
      <div className={`max-w-md mx-auto border rounded-3xl p-12 text-center transition-all ${bgCard} flex flex-col items-center justify-center gap-4`}>
        <RefreshCw size={32} className="animate-spin text-amber-500" />
        <p className="text-xs font-bold uppercase tracking-widest text-amber-500">Syncing Live Wallet Reserves...</p>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto border rounded-3xl p-6 transition-all duration-300 ${bgCard}`}>
      
      {/* Header Process Progress Tracker */}
      <div className={`flex items-center justify-between mb-6 border-b border-dashed pb-4 ${darkMode ? 'border-amber-500/10' : 'border-amber-500/20'}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${bgBadge}`}>
            {step}
          </div>
          <h3 className={`text-xs font-black tracking-widest uppercase ${textTitle}`}>
            {step === 1 && "Select Gateway"}
            {step === 2 && "Gateway Deposit"}
            {step === 3 && "Transfer Settlement"}
            {step === 4 && "Complete Execution"}
          </h3>
        </div>
        {step > 1 && step < 4 && (
          <button 
            type="button"
            onClick={() => setStep(step - 1)}
            className={`text-[10px] flex items-center gap-1 font-bold tracking-wider transition uppercase ${darkMode ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'}`}
          >
            <ArrowLeft size={12} /> Back
          </button>
        )}
      </div>

      {/*  STEP 1: INITIAL SELECTION & LIMIT ENFORCEMENT */}
      {step === 1 && (
        <form onSubmit={handleWalletSubmit} className="space-y-4">
          <div className={`p-3.5 rounded-2xl flex gap-2.5 ${bgInner}`}>
            <Info size={16} className={`${darkMode ? 'text-amber-300' : 'text-amber-600'} shrink-0 mt-0.5`} />
            <p className={`text-[11px] leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>
              Transactions range from a minimum of 1,000 MMK up to a maximum of 500,000 MMK. 
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="fromWalletSelect" className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${darkMode ? 'text-amber-400/80' : 'text-amber-700'}`}>From Wallet</label>
              <select 
                id="fromWalletSelect"
                name="fromWallet"
                value={fromWallet} 
                onChange={(e) => setFromWallet(e.target.value)}
                className={`w-full border rounded-xl px-2.5 py-3 text-xs focus:outline-none font-bold transition-all ${bgInput}`}
              >
                {Object.keys(wallets).map((key) => (
                  <option key={key} value={key} disabled={!wallets[key].active} className={darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}>
                    {wallets[key].label} {!wallets[key].active ? '(Out of Stock)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="toWalletSelect" className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${darkMode ? 'text-amber-400/80' : 'text-amber-700'}`}>To Wallet</label>
              <select 
                id="toWalletSelect"
                name="toWallet"
                value={toWallet} 
                onChange={(e) => setToWallet(e.target.value)}
                className={`w-full border rounded-xl px-2.5 py-3 text-xs focus:outline-none font-bold transition-all ${bgInput}`}
              >
                {Object.keys(wallets).map((key) => (
                  <option key={key} value={key} className={darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}>
                    {wallets[key].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {toWallet && wallets[toWallet] && (
            <div className={`p-2.5 rounded-xl border text-[11px] font-bold flex justify-between items-center ${darkMode ? 'bg-black/30 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              <span className={textMuted}>Max Payout Limit Right Now:</span>
              <span className={wallets[toWallet].balance < 50000 ? "text-red-500 animate-pulse font-mono" : "text-emerald-500 font-mono"}>
                {wallets[toWallet].balance.toLocaleString()} MMK
              </span>
            </div>
          )}

          <div>
            <label htmlFor="transferAmountInput" className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${darkMode ? 'text-amber-400/80' : 'text-amber-700'}`}>Transfer Amount (MMK)</label>
            <input 
              id="transferAmountInput"
              name="amount"
              type="number" 
              required 
              placeholder="Min: 1,000 - Max: 500,000" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              className={`w-full border rounded-xl px-3.5 py-3 text-xs focus:outline-none font-bold transition-all ${bgInput}`} 
            />
          </div>

          <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md uppercase tracking-widest transition-all">
            Proceed to Payment <ArrowRight size={14} />
          </button>
        </form>
      )}

      {/*  STEP 2: GATEWAY DEPOSIT AND INBOUND TRANSFER DETAILS */}
      {step === 2 && (
        <div className="space-y-4 text-center">
          <div className={`p-5 border rounded-2xl ${bgInner} flex flex-col items-center`}>
            <span className={`text-[9px] font-black uppercase tracking-widest mb-2.5 flex items-center gap-1 border px-2 py-0.5 rounded-full ${darkMode ? 'text-amber-300 bg-amber-500/10 border-amber-500/20' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
              <CheckCircle size={10} /> Secure Vault Active
            </span>
            <p className={`text-xs font-medium mb-3 ${darkMode ? 'text-slate-100' : 'text-slate-700'}`}>
              Transmit matching funds securely <span className={darkMode ? 'text-amber-300 font-bold' : 'text-amber-600 font-bold'}>{wallets[fromWallet]?.label}</span> node:
            </p>

            <div className={`w-36 h-36 p-2.5 rounded-xl shadow-lg border flex items-center justify-center relative my-1 ${darkMode ? 'bg-slate-950 border-amber-500/30' : 'bg-white border-amber-500/20'}`}>
              <QrCode size={120} className={darkMode ? 'text-amber-300' : 'text-slate-900'} />
              <div className="absolute bottom-1 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide">
                {fromWallet} CLEARING
              </div>
            </div>
            
            <div className={`mt-4 text-left w-full space-y-1.5 p-3 border rounded-xl ${darkMode ? 'bg-black/30 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between text-[11px]">
                <span className={textMuted}>Receiver Title</span> 
                <span className={`font-bold ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>Pay2Pay Premium</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className={textMuted}>Account Tag / Phone:</span> 
                <span className={`font-mono font-bold ${darkMode ? 'text-amber-300' : 'text-slate-800'}`}>09 777 888 999</span>
              </div>
            </div>
          </div>

          <div className={`p-3.5 border rounded-2xl flex gap-2.5 text-left ${bgInner}`}>
            <AlertCircle size={18} className={`${darkMode ? 'text-amber-300' : 'text-amber-600'} shrink-0 mt-0.5`} />
            <div>
              <h5 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>Audit Notice</h5>
              <p className={`text-[10px] leading-relaxed mt-0.5 ${textMuted}`}>
                Retain your transfer log and extract the <span className={`font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>concluding 6 digits</span> of the receipt ID for COBOL reconciliation checking.
              </p>
            </div>
          </div>

          <button onClick={() => setStep(3)} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 uppercase tracking-widest shadow-md transition-all">
            I Have Sent Money (Fill Form) <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/*  STEP 3: TRANSACTION METADATA COLLECTION */}
      {step === 3 && (
        <form onSubmit={handleExchangeSubmit} className="space-y-4">
          <div className={`p-3.5 rounded-2xl border ${bgInner} space-y-2.5`}>
            <div className={`flex items-center justify-between text-xs border-b pb-2 ${darkMode ? 'border-amber-500/10' : 'border-amber-500/20'}`}>
              <span className={`font-bold flex items-center gap-1.5 ${darkMode ? 'text-amber-100' : 'text-slate-800'}`}>
                <Wallet size={12} className={darkMode ? 'text-amber-400' : 'text-amber-600'} /> Premium Ledger
              </span>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border tracking-wider uppercase ${darkMode ? 'text-amber-300 bg-amber-500/10 border-amber-500/20' : 'text-amber-700 bg-amber-100 border-amber-300'}`}>
                2% Fee Applied
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className={`p-2 rounded-xl border ${darkMode ? 'bg-black/20 border-slate-800' : 'bg-white border-slate-100'}`}>
                <span className={`text-[9px] block uppercase tracking-wider ${textMuted}`}>You Send ({wallets[fromWallet]?.label})</span>
                <span className={`text-xs font-black ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>{transferAmount.toLocaleString()} MMK</span>
              </div>
              <div className={`p-2 rounded-xl border ${darkMode ? 'bg-black/20 border-slate-800' : 'bg-white border-slate-100'}`}>
                <span className={`text-[9px] block uppercase tracking-wider ${textMuted}`}>You Receive ({wallets[toWallet]?.label})</span>
                <span className={`text-xs font-black ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>{netReceivedAmount.toLocaleString()} MMK</span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <h4 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>1. Origin Account Details (From)</h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="senderAccountName" className={`block text-[10px] font-bold mb-1 ${textMuted}`}>Sender Account Name</label>
                <input id="senderAccountName" name="senderAccountName" type="text" required placeholder="English text only" value={senderAccountName} onChange={(e) => setSenderAccountName(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-all ${bgInput}`} />
              </div>
              <div>
                <label htmlFor="senderPhone" className={`block text-[10px] font-bold mb-1 ${textMuted}`}>{wallets[fromWallet]?.label} </label>
                <input id="senderPhone" name="senderPhone" type="tel" required placeholder="0912345678" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none font-mono transition-all ${bgInput}`} />
              </div>
            </div>

            <h4 className={`text-[10px] font-black uppercase tracking-widest pt-1 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>2. Target Destination Details (To)</h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="receiverName" className={`block text-[10px] font-bold mb-1 ${textMuted}`}>Receiver Account Name</label>
                <input id="receiverName" name="receiverName" type="text" required placeholder="English text only" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-all ${bgInput}`} />
              </div>
              <div>
                <label htmlFor="receiverPhone" className={`block text-[10px] font-bold mb-1 ${textMuted}`}>Target {wallets[toWallet]?.label}</label>
                <input id="receiverPhone" name="receiverPhone" type="tel" required placeholder="0912345678" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none font-mono transition-all ${bgInput}`} />
              </div>
            </div>

            <div className={`border-t border-dashed pt-4 ${darkMode ? 'border-amber-500/10' : 'border-amber-500/20'}`}>
              <label htmlFor="lastSixDigits" className={`block text-[10px] font-black uppercase mb-1.5 tracking-widest flex items-center gap-1 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                <AlertCircle size={11} /> Last 6 Digits of Transaction ID
              </label>
              <input id="lastSixDigits" name="lastSixDigits" type="text" maxLength={6} required placeholder="e.g. 543210" value={lastSixDigits} onChange={(e) => setLastSixDigits(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none font-mono font-black tracking-widest text-center transition-all ${darkMode ? 'border-amber-500/30' : 'border-amber-500/50'} ${bgInput}`} />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 uppercase tracking-widest shadow-lg transition-all">
            {isSubmitting ? (
              <>
                <RefreshCw size={12} className="animate-spin" /> Saving Transaction...
              </>
            ) : (
              <>
                <Send size={12} /> Submit Transfer Data
              </>
            )}
          </button>
        </form>
      )}

      {/* 🎉 STEP 4: SUCCESS QUEUE CONFIRMATION */}
      {step === 4 && (
        <div className="text-center py-6 space-y-5">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto border shadow-sm ${darkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
            <CheckCircle size={26} />
          </div>
          <div className="space-y-1.5">
            <h4 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>Submission Successful</h4>
            <p className={`text-[11px] leading-relaxed px-4 ${textMuted}`}>
              Our ledger system is verifying your 6-digit payment code. Your dynamic exchange balance transfer execution will update upon processing approval within 20 minutes.
            </p>
          </div>
          <div className="pt-2">
            <button 
              type="button"
              onClick={() => {
                setStep(1);
                setAmount('');
                setLastSixDigits('');
                setSenderAccountName('');
                setSenderPhone('');
                setReceiverPhone('');
                setReceiverName('');
                fetchWalletBalances(); 
              }}
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-amber-500 hover:bg-amber-600 text-white"
            >
              New Transaction
            </button>
          </div>
        </div>
      )}

    </div>
  );
}