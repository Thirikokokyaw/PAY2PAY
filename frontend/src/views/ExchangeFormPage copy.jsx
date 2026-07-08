import React, { useState, useContext, useEffect } from 'react';
import { 
  ArrowRight, QrCode, AlertCircle, Info, CheckCircle, 
  ArrowLeft, Send, Wallet
} from 'lucide-react';
import { ThemeContext } from '../App.jsx';
import '../App.css';

export default function ExchangeFormPage({ isLoggedIn, onRedirectToLogin = () => {}, onTransactionSubmit }) {
  const { darkMode } = useContext(ThemeContext);
  const [step, setStep] = useState(1);
  
  // 🛡️ SECURITY LAYER: Exchange Page 
  useEffect(() => {
    if (!isLoggedIn) {
      onRedirectToLogin();
    }
  }, [isLoggedIn, onRedirectToLogin]);

  // Wallet Configurations
  const [fromWallet, setFromWallet] = useState('KBZPay');
  const [toWallet, setToWallet] = useState('WavePay');
  const [amount, setAmount] = useState('');

  const walletStatuses = {
    KBZPay: { label: 'KBZPay', active: true, balanceStatus: 'Available' },
    WavePay: { label: 'WavePay', active: true, balanceStatus: 'Available' },
    CBPay: { label: 'CB Pay', active: false, balanceStatus: 'Out of Stock' }, 
    AYAPay: { label: 'AYA Pay', active: true, balanceStatus: 'Available' },
  };

  // Transaction Inputs
  const [senderAccountName, setSenderAccountName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [lastSixDigits, setLastSixDigits] = useState('');

  // 🎨 DYNAMIC THEMING: Dark Mode / Light Mode Support
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

  // 2% Fee Logic
  const transferAmount = Number(amount) || 0;
  const netReceivedAmount = transferAmount > 0 ? transferAmount * 0.98 : 0;

  const handleWalletSubmit = (e) => {
    e.preventDefault();
    if (fromWallet === toWallet) {
      alert("⚠️ Source wallet and destination wallet cannot be identical.");
      return;
    }
    if (!walletStatuses[fromWallet].active) {
      alert(`Our ${fromWallet} liquidity reserve is currently depleted.`);
      return;
    }
    if (transferAmount < 1000) {
      alert("⚠️ The base transitional floor limit is 1,000 MMK.");
      return;
    }
    setStep(2);
  };

  const handleExchangeSubmit = (e) => {
    e.preventDefault();
    if (lastSixDigits.length !== 6 || isNaN(lastSixDigits)) {
      alert("Verification Failed: Please provide precisely the terminal 6 numeric digits of your payment code.");
      return;
    }

    if (onTransactionSubmit) {
      onTransactionSubmit({
        from: fromWallet,
        to: toWallet,
        amount: transferAmount,
        receivedAmount: netReceivedAmount,
        txnIdTail: lastSixDigits,
        accountName: senderAccountName,
        sender: senderPhone,
        receiver: receiverPhone,
        receiverName: receiverName,
        date: new Date().toLocaleDateString()
      });
    }
    setStep(4);
  };

  if (!isLoggedIn) return null;

  return (
    <div className={`max-w-md mx-auto border rounded-3xl p-6 transition-all duration-300 ${bgCard}`}>
      
      {/* Premium Header Pipeline */}
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

      {/* 💳 STEP 1: INITIAL SELECTION */}
      {step === 1 && (
        <form onSubmit={handleWalletSubmit} className="space-y-4">
          <div className={`p-3.5 rounded-2xl flex gap-2.5 ${bgInner}`}>
            <Info size={16} className={`${darkMode ? 'text-amber-300' : 'text-amber-600'} shrink-0 mt-0.5`} />
            <p className={`text-[11px] leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>
              Transaction amounts range from a minimum of 1,000 MMK up to a maximum of 500,000 MMK per exchange.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${darkMode ? 'text-amber-400/80' : 'text-amber-700'}`}>From Wallet</label>
              <select 
                value={fromWallet} 
                onChange={(e) => setFromWallet(e.target.value)}
                className={`w-full border rounded-xl px-2.5 py-3 text-xs focus:outline-none font-bold transition-all ${bgInput}`}
              >
                {Object.keys(walletStatuses).map((key) => (
                  <option key={key} value={key} disabled={!walletStatuses[key].active} className={darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}>
                    {walletStatuses[key].label} {!walletStatuses[key].active ? `(${walletStatuses[key].balanceStatus})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${darkMode ? 'text-amber-400/80' : 'text-amber-700'}`}>To Wallet</label>
              <select 
                value={toWallet} 
                onChange={(e) => setToWallet(e.target.value)}
                className={`w-full border rounded-xl px-2.5 py-3 text-xs focus:outline-none font-bold transition-all ${bgInput}`}
              >
                {Object.keys(walletStatuses).map((key) => (
                  <option key={key} value={key} className={darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}>
                    {walletStatuses[key].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${darkMode ? 'text-amber-400/80' : 'text-amber-700'}`}>Transfer Amount (MMK)</label>
            <input 
              type="number" 
              required 
              placeholder="Min: 1,000 MMK" 
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

      {/* 💳 STEP 2: SHOW GATEWAY DETAILS & QR DIRECTLY */}
      {step === 2 && (
        <div className="space-y-4 text-center">
          <div className={`p-5 border rounded-2xl ${bgInner} flex flex-col items-center`}>
            <span className={`text-[9px] font-black uppercase tracking-widest mb-2.5 flex items-center gap-1 border px-2 py-0.5 rounded-full ${darkMode ? 'text-amber-300 bg-amber-500/10 border-amber-500/20' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
              <CheckCircle size={10} /> Secure Vault Active
            </span>
            <p className={`text-xs font-medium mb-3 ${darkMode ? 'text-slate-100' : 'text-slate-700'}`}>
              Transmit matching funds securely to our certified <span className={darkMode ? 'text-amber-300 font-bold' : 'text-amber-600 font-bold'}>{fromWallet}</span> node:
            </p>

            <div className={`w-36 h-36 p-2.5 rounded-xl shadow-lg border flex items-center justify-center relative my-1 ${darkMode ? 'bg-slate-950 border-amber-500/30' : 'bg-white border-amber-500/20'}`}>
              <QrCode size={120} className={darkMode ? 'text-amber-300' : 'text-slate-900'} />
              <div className="absolute bottom-1 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide">
                {fromWallet} CLEARING
              </div>
            </div>
            
            <div className={`mt-4 text-left w-full space-y-1.5 p-3 border rounded-xl ${darkMode ? 'bg-black/30 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between text-[11px]">
                <span className={textMuted}>Receiver Title:</span> 
                <span className={`font-bold ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>Pay2Pay Premium</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className={textMuted}>Account Tag:</span> 
                <span className={`font-mono font-bold ${darkMode ? 'text-amber-300' : 'text-slate-800'}`}>09 777 888 999</span>
              </div>
            </div>
          </div>

          <div className={`p-3.5 border rounded-2xl flex gap-2.5 text-left ${bgInner}`}>
            <AlertCircle size={18} className={`${darkMode ? 'text-amber-300' : 'text-amber-600'} shrink-0 mt-0.5`} />
            <div>
              <h5 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>Audit Notice</h5>
              <p className={`text-[10px] leading-relaxed mt-0.5 ${textMuted}`}>
                Retain your transfer log and extract the <span className={`font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>concluding 6 digits</span> of the receipt ID.
              </p>
            </div>
          </div>

          <button onClick={() => setStep(3)} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 uppercase tracking-widest shadow-md transition">
            I Have Sent Money (Fill Form) <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* 📝 STEP 3: INTERACTIVE FIELD ATTRIBUTES */}
      {step === 3 && (
        <form onSubmit={handleExchangeSubmit} className="space-y-4">
          {/* Fee Calculation Premium Card */}
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
                <span className={`text-[9px] block uppercase tracking-wider ${textMuted}`}>You Send ({fromWallet})</span>
                <span className={`text-xs font-black ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>{transferAmount.toLocaleString()} MMK</span>
              </div>
              <div className={`p-2 rounded-xl border ${darkMode ? 'bg-black/20 border-slate-800' : 'bg-white border-slate-100'}`}>
                <span className={`text-[9px] block uppercase tracking-wider ${textMuted}`}>You Receive ({toWallet})</span>
                <span className={`text-xs font-black ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>{netReceivedAmount.toLocaleString()} MMK</span>
              </div>
            </div>
          </div>

          {/* Form Inputs Fields */}
          <div className="space-y-3.5">
            <h4 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>1. Origin Account (From)</h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={`block text-[10px] font-bold mb-1 ${textMuted}`}>Sender Name</label>
                <input type="text" required placeholder="e.g. John Doe" value={senderAccountName} onChange={(e) => setSenderAccountName(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-all ${bgInput}`} />
              </div>
              <div>
                <label className={`block text-[10px] font-bold mb-1 ${textMuted}`}>{fromWallet} Phone No.</label>
                <input type="tel" required placeholder="09..." value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none font-mono transition-all ${bgInput}`} />
              </div>
            </div>

            <h4 className={`text-[10px] font-black uppercase tracking-widest pt-1 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>2. Target Destination (To)</h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={`block text-[10px] font-bold mb-1 ${textMuted}`}>Receiver Name</label>
                <input type="text" required placeholder="e.g. Jane Doe" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-all ${bgInput}`} />
              </div>
              <div>
                <label className={`block text-[10px] font-bold mb-1 ${textMuted}`}>Target {toWallet} No.</label>
                <input type="tel" required placeholder="09..." value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none font-mono transition-all ${bgInput}`} />
              </div>
            </div>

            <div className={`border-t border-dashed pt-4 ${darkMode ? 'border-amber-500/10' : 'border-amber-500/20'}`}>
              <label className={`block text-[10px] font-black uppercase mb-1.5 tracking-widest flex items-center gap-1 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                <AlertCircle size={11} /> Last 6 Digits of Transaction ID
              </label>
              <input type="text" maxLength={6} required placeholder="e.g. 543210" value={lastSixDigits} onChange={(e) => setLastSixDigits(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none font-mono font-black tracking-widest text-center transition-all ${darkMode ? 'border-amber-500/30' : 'border-amber-500/50'} ${bgInput}`} />
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 uppercase tracking-widest shadow-lg transition">
            <Send size={12} /> Submit Transfer Data
          </button>
        </form>
      )}

      {/* 🎉 STEP 4: SUCCESS PIPE */}
      {step === 4 && (
        <div className="text-center py-6 space-y-5">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto border shadow-sm ${darkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
            <CheckCircle size={26} />
          </div>
          <div className="space-y-1.5">
            <h4 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>Submission Successful</h4>
            <p className={`text-[11px] leading-relaxed px-4 ${textMuted}`}>
              Our team is verifying your 6-digit transaction ID. Your exchange will be completed within 20 minutes.
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