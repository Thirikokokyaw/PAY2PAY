// src/components/admin/DiagnosticsView.jsx
import React, { useState } from 'react';
import { Download } from 'lucide-react'; // <-- CRITICAL: Make sure this is here!

export default function DiagnosticsView({ theme, isDarkMode, feeRate, transactions }) {
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-06-24');

  // Safety fallback: If transactions array hasn't loaded yet, prevent crash
  const pendingOrdersCount = transactions ? transactions.filter(t => t.status === 'Pending').length : 0;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>Platform Diagnostics</h2>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>Real-time revenue clearance and ledger nodes evaluation</p>
        </div>
        
        <div className={`flex flex-wrap items-center gap-2 p-2 rounded-xl border ${theme.card}`}>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none ${theme.input}`} 
          />
          <span className="text-slate-400 text-xs font-bold">To</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none ${theme.input}`} 
          />
          <button className="bg-amber-500 hover:bg-amber-600 px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 transition-colors">
            Filter
          </button>
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
          <p className="text-2xl font-black text-amber-500 mt-1.5">
            {pendingOrdersCount} <span className="text-xs font-medium text-slate-400">Orders</span>
          </p>
        </div>
      </div>

      {/* Settlement Records Table */}
      <div className={`border rounded-2xl overflow-hidden ${theme.tableBg}`}>
        <div className={`p-5 border-b flex flex-col sm:flex-row gap-3 justify-between sm:items-center ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.textTitle}`}>Settlement Records</h3>
          <button className={`border rounded-xl px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
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
            <tbody className={`divide-y font-medium ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
              <tr className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                <td className={`p-4 font-mono font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Jun 24, 2026</td>
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
  );
}