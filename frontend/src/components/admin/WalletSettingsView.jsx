import React, { useState } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';

export default function WalletSettingsView({ theme, isDarkMode = false, wallets: propsWallets, handleToggleWallet: propsToggle }) {
  const [localWallets, setLocalWallets] = useState([
    { id: 1, name: 'KBZPay Account 1', number: '09777123456', holder: 'U Tun Tun Oo', status: 'Active', currentVolume: 4200000, limitWarning: 5000000 },
    { id: 2, name: 'Wave Pay Account 1', number: '09977123456', holder: 'Daw Hla Hla Nu', status: 'Active', currentVolume: 1500000, limitWarning: 5000000 },
    { id: 3, name: 'CB Pay Account 1', number: '09444123456', holder: 'Ko Kyaw Zin Win', status: 'Inactive', currentVolume: 0, limitWarning: 7000000 }
  ]);

  const wallets = propsWallets || localWallets;

  const handleToggle = (id) => {
    if (propsToggle) return propsToggle(id);
    setLocalWallets(prev => prev.map(w => w.id === id ? { ...w, status: w.status === 'Active' ? 'Inactive' : 'Active' } : w));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>Vault Liquidity & Threshold Configurations</h2>
        <p className={`text-xs mt-1 ${theme.textMuted}`}>Configure receiving gateway modules and adjust maximum tolerance caps to prevent banking blocks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wallets.map(wallet => {
          const isOverLimit = wallet.currentVolume >= (wallet.limitWarning || 0);
          return (
            <div key={wallet.id} className={`border rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-colors ${theme.card} ${isOverLimit && wallet.status === 'Active' ? 'border-amber-500/50 shadow-amber-500/5' : ''}`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider border ${wallet.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-slate-200 text-slate-400 border-slate-300'}`}>{wallet.status}</span>
                    <h3 className={`text-sm font-extrabold mt-2 ${theme.textTitle}`}>{wallet.name}</h3>
                  </div>
                  <button onClick={() => handleToggle(wallet.id)} className="text-slate-400 hover:text-amber-500 transition-colors">
                    {wallet.status === 'Active' ? <ToggleRight size={28} className="text-amber-500" /> : <ToggleLeft size={28} className="text-slate-400" />}
                  </button>
                </div>

                <div className="space-y-1.5 font-mono text-xs text-slate-400 mb-6">
                  <p><span className="text-slate-400 font-sans">No:</span> <span className={`font-bold ${theme.textTitle}`}>{wallet.number}</span></p>
                  <p><span className="text-slate-400 font-sans">Name:</span> {wallet.holder || ''}</p>
                </div>
              </div>

              <div className={`space-y-3 pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex justify-between text-xs font-semibold">
                  <span className={theme.textMuted}>Current Utilization:</span>
                  <span className={isOverLimit && wallet.status === 'Active' ? 'text-amber-500 font-bold' : theme.textTitle}>{(wallet.currentVolume || 0).toLocaleString()} MMK</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isOverLimit && wallet.status === 'Active' ? 'bg-amber-500' : 'bg-amber-500/30'}`} 
                    style={{ width: `${Math.min(((wallet.currentVolume || 0) / (wallet.limitWarning || 1)) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0%</span>
                  <span>Limit: {(wallet.limitWarning || 0).toLocaleString()} MMK</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}