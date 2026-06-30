import React, { useContext } from 'react';
import { Shield, Users, Award, Handshake, CheckCircle } from 'lucide-react';
import { ThemeContext } from '../App.jsx';

// Import your outside logos here
import waveLogo from '../assets/wave.jpg';
import kpayLogo from '../assets/kpay.jpg';
import cbpayLogo from '../assets/cbpay.jpg';
import truemoneyLogo from '../assets/truemoney.jpg';
import ayapayLogo from '../assets/ayapay.jpg';
import uabpayLogo from '../assets/uabpay.jpg';

export default function About() {
  const { darkMode } = useContext(ThemeContext);

  const partners = [
    { name: 'Wave Pay', logoImg: waveLogo, borderColor: 'hover:border-yellow-500/50' },
    { name: 'KBZPay', logoImg: kpayLogo, borderColor: 'hover:border-blue-500/50' },
    { name: 'CB Pay', logoImg: cbpayLogo, borderColor: 'hover:border-sky-500/50' },
    { name: 'TrueMoney', logoImg: truemoneyLogo, borderColor: 'hover:border-orange-500/50' },
    { name: 'AYA Pay', logoImg: ayapayLogo, borderColor: 'hover:border-red-500/50' },
    { name: 'uab pay', logoImg: uabpayLogo, borderColor: 'hover:border-pink-500/50' }
  ];

  return (
    <div className={`max-w-2xl mx-auto w-full animate-fadeIn border rounded-3xl p-5 md:p-6 shadow-2xl transition-colors duration-300 ${darkMode ? 'bg-slate-950 border-slate-800/40' : 'bg-white border-slate-200'}`}>
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-yellow-400/10 text-yellow-400' : 'bg-amber-500/10 text-amber-600'}`}>
            <Handshake size={18} />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-amber-500 dark:text-yellow-400 tracking-tight">About Pay2Pay Myanmar</h2>
        </div>
        
        <div className="self-start sm:self-auto bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide flex items-center gap-1 uppercase">
          <CheckCircle size={12} />
          Verified Partnerships
        </div>
      </div>

      {/* Main Narrative */}
      <p className={`text-xs md:text-sm leading-relaxed mb-5 ${darkMode ? 'text-slate-200/90' : 'text-slate-600'}`}>
        Founded in 2026, <strong className={darkMode ? 'text-white' : 'text-slate-900'}>Pay2Pay Exchange</strong> serves as Myanmar's premium digital liquidity bridge. Through strategic infrastructure partnerships, we securely synchronize independent wallet ecosystems—seamlessly linking major providers like <strong className={darkMode ? 'text-white' : 'text-slate-900'}>Wave Pay, KBZPay, CB Pay, TrueMoney, AYA Pay, and uab pay</strong>. Our platform helps merchants, freelancers, and small businesses rebalance local currency pools dynamically without traditional localized delays or friction.
      </p>

      {/* Core Operational Performance Badges */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className={`p-3 border rounded-xl text-center transition-colors duration-300 ${darkMode ? 'bg-slate-900/40 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-amber-500 dark:text-yellow-400 flex justify-center mb-1"><Users size={20} /></div>
          <h4 className={`font-bold text-xs ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>50K+ Users</h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Nationwide network</p>
        </div>
        <div className={`p-3 border rounded-xl text-center transition-colors duration-300 ${darkMode ? 'bg-slate-900/40 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-emerald-500 dark:text-emerald-400 flex justify-center mb-1"><Shield size={20} /></div>
          <h4 className={`font-bold text-xs ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Secured Node</h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">End-to-end safety</p>
        </div>
        <div className={`p-3 border rounded-xl text-center transition-colors duration-300 ${darkMode ? 'bg-slate-900/40 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-blue-500 dark:text-blue-400 flex justify-center mb-1"><Award size={20} /></div>
          <h4 className={`font-bold text-xs ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>99.8% Rate</h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Fast execution</p>
        </div>
      </div>

      {/* ================= OFFICIAL PARTNERS GRID ================= */}
      <div className={`pt-4 border-t ${darkMode ? 'border-slate-800/60' : 'border-slate-200'}`}>
        <div className="text-center mb-4">
          <h3 className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Official Wallet Partnerships
          </h3>
          <p className={`text-[9px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Directly connected to official enterprise merchant nodes</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {partners.map((partner) => (
            <div 
              key={partner.name} 
              className={`flex items-center justify-between border rounded-xl py-2 px-3.5 transition-all duration-300 ${darkMode ? 'bg-slate-900/20 border-slate-800/80' : 'bg-slate-50 border-slate-200'} ${partner.borderColor}`}
            >
              <div className="flex items-center gap-2">
                {/* Live Sync Pulse Dot */}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                <span className={`text-xs font-extrabold tracking-wide ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{partner.name}</span>
              </div>
              
              {/* Logo Box Container */}
              <div className={`w-14 h-9 flex items-center justify-center rounded-lg p-1 border select-none shadow-inner ${darkMode ? 'bg-slate-950/80 border-slate-800/60' : 'bg-white border-slate-200'}`}>
                <img 
                  src={partner.logoImg} 
                  alt={`${partner.name} Logo`} 
                  className="max-w-full max-h-full object-contain object-center transition duration-200"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <p className={`text-[9px] text-center mt-4 font-medium ${darkMode ? 'text-slate-400/60' : 'text-slate-400'}`}>
           Real-time multi-pool synchronization under secured structural network escrow nodes.
        </p>
      </div>

    </div>
  );
}