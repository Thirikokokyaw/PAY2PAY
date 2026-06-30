import React, { useContext } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { ThemeContext } from '../App.jsx';

export default function DynamicModal({ selectedPayment, setSelectedPayment, paymentDetails, copiedField, handleCopy }) {
  const { darkMode } = useContext(ThemeContext);
  if (!selectedPayment) return null;
  const current = paymentDetails[selectedPayment];

  return (
    <div className={`fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn ${darkMode ? 'bg-slate-950/90' : 'bg-slate-900/40'}`}>
      <div className={`border rounded-3xl p-6 max-w-sm w-full text-center relative shadow-2xl transform scale-100 transition-colors ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
        
        <button 
          type="button" 
          onClick={() => setSelectedPayment(null)} 
          className={`absolute top-4 right-4 p-1.5 rounded-full transition ${darkMode ? 'text-slate-300 hover:text-white hover:bg-slate-900' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
        >
          <X size={18} />
        </button>

        <h3 className={`text-lg font-black tracking-wide uppercase mb-5 ${current.color}`}>
          {selectedPayment} QR Transfer
        </h3>

        <div className={`p-3 rounded-2xl inline-block shadow-inner mb-4 border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <img src={current.qr} alt={`${selectedPayment} QR`} className="w-44 h-44 object-contain rounded" />
        </div>

        <div className="flex items-center my-4 text-slate-500 px-6">
          <div className={`flex-grow border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}></div>
          <span className={`mx-3 text-[11px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full border ${darkMode ? 'text-slate-300 bg-slate-900/70 border-slate-800' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>OR</span>
          <div className={`flex-grow border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}></div>
        </div>

        <div className="space-y-2.5 text-left mb-2">
          <div className={`border p-3 rounded-xl flex items-center justify-between ${darkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
            <div>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Phone Number</span>
              <span className={`text-sm font-mono font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{current.phone}</span>
            </div>
            <button type="button" onClick={() => handleCopy(current.phone, 'phone')} className={`p-1.5 transition ${darkMode ? 'text-slate-200 hover:text-yellow-400' : 'text-slate-400 hover:text-amber-500'}`} title="Copy Number">
              {copiedField === 'phone' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
          </div>

          <div className={`border p-3 rounded-xl flex items-center justify-between ${darkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
            <div>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Account Name</span>
              <span className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{current.name}</span>
            </div>
            <button type="button" onClick={() => handleCopy(current.name, 'name')} className={`p-1.5 transition ${darkMode ? 'text-slate-200 hover:text-yellow-400' : 'text-slate-400 hover:text-amber-500'}`} title="Copy Name">
              {copiedField === 'name' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-amber-600 dark:text-amber-400/90 mt-4 font-medium bg-amber-500/5 py-2 px-3 rounded-lg border border-amber-500/10">
           Please ensure to securely save your transfer confirmation transaction screenshot.
        </p>
      </div>
    </div>
  );
}