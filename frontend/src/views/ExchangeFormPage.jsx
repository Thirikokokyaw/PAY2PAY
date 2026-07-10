import React, { useState, useContext, useEffect } from 'react';
import { 
  ArrowRight, QrCode, AlertCircle, Info, CheckCircle, 
  ArrowLeft, Send, Wallet, RefreshCw
} from 'lucide-react';
import { ThemeContext } from '../App.jsx';
import '../App.css';

export default function ExchangeFormPage({ isLoggedIn, userInfo, setUserInfo, onRedirectToLogin = () => {} }) {
  const { darkMode } = useContext(ThemeContext);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Wallet Data State Pool (Populated dynamically from Database array)
  const [wallets, setWallets] = useState([]);
  const [fromWallet, setFromWallet] = useState('');
  const [toWallet, setToWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [feeRate, setFeeRate] = useState(0.02); // Fallback: 2% (0.02)

  // Transaction Input States
  const [senderAccountName, setSenderAccountName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [lastSixDigits, setLastSixDigits] = useState('');

  // SECURITY LAYER: Route Access Protection
  useEffect(() => {
    if (!isLoggedIn) {
      onRedirectToLogin();
    }
  }, [isLoggedIn, onRedirectToLogin]);

  // FETCH REAL-TIME WALLET DATA & RATES FROM DATABASE VIA API
  const fetchWalletBalances = async () => {
    if (!userInfo?.id) return;
    setIsLoading(true); 

    // LIVE USER STATUS CHECK LAYER 
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userInfo.id}`);
      if (res.ok) {
        const userData = await res.json();
        
        if (userData.isBlacklisted === 1 || userData.isBlacklisted === true || userData.isBlacklisted === "1") {
          alert("Access Denied: Your profile has been permanently blacklisted from our ledger network.");
          setIsLoading(false); 
          return; 
        }

        if (userData.status === 'Blocked') {
          alert("Account Suspended: This profile is temporarily frozen.");
          if (typeof setUserInfo === 'function') {
            setUserInfo(prev => ({ ...prev, status: 'Blocked' }));
          }
          setIsLoading(false); 
          return; 
        }
        
        if (userData.status === 'Active' && userInfo.status !== 'Active') {
          if (typeof setUserInfo === 'function') {
            setUserInfo(prev => ({ ...prev, status: 'Active' }));
          }
        }
      }
    } catch (e) {
      console.error("Live user status sync failed:", e);
    }

    // FETCH FEE RATE FROM RATES TABLE WHERE ID = 1
    try {
      const rateRes = await fetch('http://localhost:5000/api/rates/1');
      if (rateRes.ok) {
        const rateData = await rateRes.json();
        if (rateData && rateData.fee_rate !== undefined) {
          setFeeRate(Number(rateData.fee_rate));
        }
      }
    } catch (e) {
      console.error("Failed to fetch custom fee rate, using fallback:", e);
    }

    // ORIGINAL WALLET BALANCES FETCH LOGIC (Updated to parse SQL Table rows array)
    try {
      const response = await fetch('http://localhost:5000/api/wallets');
      const data = await response.json(); // Returns array from database SELECT
      
      if (Array.isArray(data) && data.length > 0) {
        setWallets(data);
        
        const activeWallets = data.filter(w => w.is_active === 'Y');
   
        if (activeWallets.length > 0) {
          setFromWallet(activeWallets[0].wallet_id);
          setToWallet(activeWallets[1]?.wallet_id || activeWallets[0].wallet_id);
        } else {
          setFromWallet(data[0].wallet_id);
          setToWallet(data[1]?.wallet_id || data[0].wallet_id);
        }
      }
    } catch (error) {
      console.error("Database connection failure, loading fallback profiles:", error);
      const mockData = [
        { wallet_id: 'KBZPAY', wallet_name: 'KBZPay Mobile Wallet', current_balance: 1000000, is_active: 'Y', account_holder: 'Pay2Pay Premium', account_number: '09 777 888 999', qr_code_path: null },
        { wallet_id: 'WAVEPAY', wallet_name: 'WavePay Mobile Wallet', current_balance: 300000, is_active: 'Y', account_holder: 'Pay2Pay Premium', account_number: '09 777 888 999', qr_code_path: null },
        { wallet_id: 'CBPAY', wallet_name: 'CBPay Mobile Banking', current_balance: 500000, is_active: 'N', account_holder: 'Pay2Pay Premium', account_number: '09 777 888 999', qr_code_path: null }
      ];
      setWallets(mockData);
      setFromWallet('KBZPAY');
      setToWallet('WAVEPAY');
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchWalletBalances();
    }
  }, [isLoggedIn]);

  // Helper selectors to get dynamic single wallet metadata from array
  const selectedFromWalletDetails = wallets.find(w => w.wallet_id === fromWallet);
  const selectedToWalletDetails = wallets.find(w => w.wallet_id === toWallet);

  // Dynamic UI colors
  const bgCard = darkMode 
    ? 'bg-slate-950 border border-amber-500/20 text-white shadow-[0_0_30px_rgba(212,175,55,0.15)]' 
    : 'bg-white border border-amber-500/30 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.05)]';

  const bgInner = darkMode ? 'bg-slate-900/90 border border-amber-500/20' : 'bg-amber-50/40 border border-amber-500/20';
  const bgInput = darkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const textTitle = darkMode ? 'text-amber-200' : 'text-amber-600 font-black';
  const bgBadge = darkMode ? 'bg-amber-300 text-slate-950' : 'bg-amber-500 text-white';

  const transferAmount = Number(amount) || 0;
  // Dynamic Fee Calculation based on database feeRate
const netReceivedAmount = transferAmount > 0 ? transferAmount * (1 - (feeRate / 100)) : 0;
  // USER ACCOUNT BLOCKED STATEMENT
  if (isLoggedIn && userInfo && userInfo.status === 'Blocked') {
    return (
      <div className={`max-w-md mx-auto border rounded-3xl p-8 text-center transition-all ${bgCard} bg-amber-500/5 backdrop-blur-sm animate-fadeIn`}>
        <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-base font-black uppercase tracking-wider text-amber-500">Exchange Service Suspended</h3>
        <p className={`text-[11px] mt-2 leading-relaxed max-w-xs mx-auto ${textMuted}`}>
          Your transaction capabilities have been temporarily suspended by the administration.
        </p>
      </div>
    );
  }

  // STEP 1 VALIDATION
  const handleWalletSubmit = (e) => {
    e.preventDefault();
    
    if (fromWallet === toWallet) {
      alert("Error: Source gateway and destination gateway cannot be identical.");
      return;
    }

    
    if (selectedToWalletDetails && selectedToWalletDetails.is_active === 'N') {
      alert(`Operation Denied: The destination network service (${selectedToWalletDetails.wallet_name}) is currently suspended.`);
      return;
    }

    const availableReserve = selectedToWalletDetails?.current_balance ?? 0;
    if (transferAmount > availableReserve) {
      alert(`Balance Error: Cannot exchange more than the available reserve. Maximum allowed for this wallet is ${availableReserve.toLocaleString()} MMK.`);
      return;
    }

    if (transferAmount < 1000 || transferAmount > 500000) {
      alert("Threshold Error: Allowed transfer range is 1,000 MMK to 500,000 MMK only.");
      return;
    }

    setStep(2);
  };

  // STEP 3 SUBMISSION HANDLER
  const handleExchangeSubmit = async (e) => {
    e.preventDefault();
    
    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(senderPhone) || !phoneRegex.test(receiverPhone)) {
      alert("Phone Number must be exactly 10 or 11 digits.");
      return;
    }
    if (lastSixDigits.length !== 6 || isNaN(lastSixDigits)) {
      alert("Verification Failed: Please input exactly the final 6 numerical characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/exchange/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromWallet: fromWallet,
          toWallet: toWallet,
          amount: Number(transferAmount),
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
        setStep(4); // Success and Pending view
      } else {
        alert(`Core Rejection: ${result.message || 'Transaction submission failed.'}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Network Failure: Cannot connect to the server database.");
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
            {step === 4 && "Pending Verification"}
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

      {/* STEP 1: INITIAL SELECTION */}
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
                value={fromWallet} 
                onChange={(e) => setFromWallet(e.target.value)}
                className={`w-full border rounded-xl px-2.5 py-3 text-xs focus:outline-none font-bold transition-all ${bgInput}`}
              >
                {wallets.map((w) => (
                 
                  <option key={w.wallet_id} value={w.wallet_id} className={darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}>
                    {w.wallet_name} {w.is_active !== 'Y' ? '' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="toWalletSelect" className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${darkMode ? 'text-amber-400/80' : 'text-amber-700'}`}>To Wallet</label>
              <select 
                id="toWalletSelect"
                value={toWallet} 
                onChange={(e) => setToWallet(e.target.value)}
                className={`w-full border rounded-xl px-2.5 py-3 text-xs focus:outline-none font-bold transition-all ${bgInput}`}
              >
                {wallets.map((w) => (
                  <option key={w.wallet_id} value={w.wallet_id} disabled={w.is_active !== 'Y'} className={darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}>
                    {w.wallet_name} {w.is_active !== 'Y' ? '(Disabled)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border text-[11px] font-bold flex justify-between items-center ${darkMode ? 'bg-black/30 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
            <span className={textMuted}>To Reserve Balance:</span>
            <span className="text-emerald-500 font-mono">
              {(selectedToWalletDetails?.current_balance ?? 0).toLocaleString()} MMK
            </span>
          </div>

          <div>
            <label htmlFor="transferAmountInput" className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${darkMode ? 'text-amber-400/80' : 'text-amber-700'}`}>Transfer Amount (MMK)</label>
            <input 
              id="transferAmountInput"
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

      {/* STEP 2: GATEWAY DEPOSIT */}
      {step === 2 && (
        <div className="space-y-4 text-center">
          <div className={`p-5 border rounded-2xl ${bgInner} flex flex-col items-center`}>
            {/* <span className={`text-[9px] font-black uppercase tracking-widest mb-2.5 flex items-center gap-1 border px-2 py-0.5 rounded-full ${darkMode ? 'text-amber-300 bg-amber-500/10 border-amber-500/20' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
              <CheckCircle size={10} /> Secure Vault Active
            </span> */}
            <p className={`text-xs font-medium mb-3 ${darkMode ? 'text-slate-100' : 'text-slate-700'}`}>
              Transmit funds to <span className="text-amber-500 font-bold">{selectedFromWalletDetails?.wallet_name}</span> 
            </p>

            <div className={`w-36 h-36 p-2.5 rounded-xl shadow-lg border flex items-center justify-center relative my-1 ${darkMode ? 'bg-slate-950 border-amber-500/30' : 'bg-white border-amber-500/20'}`}>
              {selectedFromWalletDetails?.qr_code_path ? (
                <img 
                  src={`http://localhost:5000/${selectedFromWalletDetails.qr_code_path}`} 
                  alt="Wallet Gateway QR" 
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <QrCode size={120} className={darkMode ? 'text-amber-300' : 'text-slate-900'} />
              )}
              <div className="absolute bottom-1 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide">
                {fromWallet} CLEARING
              </div>
            </div>
            
            <div className={`mt-4 text-left w-full space-y-1.5 p-3 border rounded-xl ${darkMode ? 'bg-black/30 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between text-[11px]">
                <span className={textMuted}>Receiver Title:</span> 
                <span className={`font-bold ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>
                  {selectedFromWalletDetails?.account_holder || "Pay2Pay Premium"}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className={textMuted}>Account / Phone:</span> 
                <span className={`font-mono font-bold ${darkMode ? 'text-amber-300' : 'text-slate-800'}`}>
                  {selectedFromWalletDetails?.account_number || "09 777 888 999"}
                </span>
              </div>
            </div>
          </div>

          <div className={`p-3.5 border rounded-2xl flex gap-2.5 text-left ${bgInner}`}>
            <AlertCircle size={18} className={`${darkMode ? 'text-amber-300' : 'text-amber-600'} shrink-0 mt-0.5`} />
            <div>
              <h5 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>Audit Notice</h5>
              <p className={`text-[10px] leading-relaxed mt-0.5 ${textMuted}`}>
                Retain your log and extract the <span className="font-black text-amber-500">concluding 6 digits</span> of the receipt ID.
              </p>
            </div>
          </div>

          <button onClick={() => setStep(3)} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 uppercase tracking-widest shadow-md transition-all">
            I Have Sent Money (Fill Form) <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* STEP 3: TRANSACTION METADATA COLLECTION */}
      {step === 3 && (
        <form onSubmit={handleExchangeSubmit} className="space-y-4">
          <div className={`p-3.5 rounded-2xl border ${bgInner} space-y-2.5`}>
            <div className={`flex items-center justify-between text-xs border-b pb-2 ${darkMode ? 'border-amber-500/10' : 'border-amber-500/20'}`}>
              <span className={`font-bold flex items-center gap-1.5 ${darkMode ? 'text-amber-100' : 'text-slate-800'}`}>
                <Wallet size={12} className="text-amber-500" /> Premium Ledger
              </span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-md border tracking-wider uppercase text-amber-500 bg-amber-500/10 border-amber-500/20">
                {(feeRate)}% Fee Applied
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className={`p-2 rounded-xl border ${darkMode ? 'bg-black/20 border-slate-800' : 'bg-white border-slate-100'}`}>
                <span className={`text-[9px] block uppercase tracking-wider ${textMuted}`}>You Send ({fromWallet})</span>
                <span className={`text-xs font-black ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>{transferAmount.toLocaleString()} MMK</span>
              </div>
              <div className={`p-2 rounded-xl border ${darkMode ? 'bg-black/20 border-slate-800' : 'bg-white border-slate-100'}`}>
                <span className={`text-[9px] block uppercase tracking-wider ${textMuted}`}>You Receive ({toWallet})</span>
                <span className={`text-xs font-black ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>{netReceivedAmount.toLocaleString()} MMK</span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <h4 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>1. Origin Account Details (From)</h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="senderAccountName" className={`block text-[10px] font-bold mb-1 ${textMuted}`}>Sender Account Name</label>
                <input id="senderAccountName" type="text" required placeholder="English text only" value={senderAccountName} onChange={(e) => setSenderAccountName(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-all ${bgInput}`} />
              </div>
              <div>
                <label htmlFor="senderPhone" className={`block text-[10px] font-bold mb-1 ${textMuted}`}>Sender Phone Number</label>
                <input id="senderPhone" type="tel" required placeholder="0912345678" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none font-mono transition-all ${bgInput}`} />
              </div>
            </div>

            <h4 className={`text-[10px] font-black uppercase tracking-widest pt-1 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>2. Target Destination Details (To)</h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="receiverName" className={`block text-[10px] font-bold mb-1 ${textMuted}`}>Receiver Account Name</label>
                <input id="receiverName" type="text" required placeholder="English text only" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-all ${bgInput}`} />
              </div>
              <div>
                <label htmlFor="receiverPhone" className={`block text-[10px] font-bold mb-1 ${textMuted}`}>Target Phone Number</label>
                <input id="receiverPhone" type="tel" required placeholder="0912345678" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none font-mono transition-all ${bgInput}`} />
              </div>
            </div>

            <div className={`border-t border-dashed pt-4 ${darkMode ? 'border-amber-500/10' : 'border-amber-500/20'}`}>
              <label htmlFor="lastSixDigits" className={`block text-[10px] font-black uppercase mb-1.5 tracking-widest flex items-center gap-1 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                <AlertCircle size={11} /> Last 6 Digits of Transaction ID
              </label>
              <input id="lastSixDigits" type="text" maxLength={6} required placeholder="e.g. 543210" value={lastSixDigits} onChange={(e) => setLastSixDigits(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none font-mono font-black tracking-widest text-center transition-all ${darkMode ? 'border-amber-500/30' : 'border-amber-500/50'} ${bgInput}`} />
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

      {/* STEP 4: SUCCESS & PENDING CONFIRMATION */}
      {step === 4 && (
        <div className="text-center py-6 space-y-5 animate-fadeIn">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto border shadow-sm bg-amber-500/10 text-amber-500 border-amber-500/30">
            <RefreshCw size={26} className="animate-spin text-amber-500" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase bg-amber-500/20 text-amber-500 font-mono tracking-widest border border-amber-500/30 animate-pulse">
              Status: PENDING
            </span>
            <h4 className={`text-xs font-black uppercase tracking-widest mt-3 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>Submission Successful</h4>
            <p className={`text-[11px] leading-relaxed px-4 ${textMuted}`}>
              Your dynamic exchange balance transfer execution will update upon processing approval within 20 minutes.
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
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-amber-500 hover:bg-amber-600 text-white shadow-md"
            >
              New Transaction
            </button>
          </div>
        </div>
      )}

    </div>
  );
}