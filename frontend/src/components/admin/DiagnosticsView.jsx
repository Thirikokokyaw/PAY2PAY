import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Download, Search, TrendingUp, ArrowUpRight, ArrowDownRight, ShoppingCart } from 'lucide-react';

export default function DiagnosticsView({ theme, isDarkMode }) {
  const [stats, setStats] = useState({ totalOrders: 0, totalIn: 0, totalOut: 0, netProfit: 0 });
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Search state ထည့်ထားသည်
  const [dateRange, setDateRange] = useState({ start: '2026-07-01', end: '2026-07-31' });

  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard/diagnostics')
      .then(res => res.json())
      .then(res => { if (res.success) setStats(res.today); });
  }, []);

  useEffect(() => {
    fetch(`http://localhost:5000/api/dashboard/history?start=${dateRange.start}&end=${dateRange.end}`)
      .then(res => res.json())
      .then(res => { if (res.success) setHistory(res.data); });
  }, [dateRange.start, dateRange.end]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(history);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Settlement_History");
    XLSX.writeFile(wb, `Settlement_${dateRange.start}_to_${dateRange.end}.xlsx`);
  };

  // Search filter
  const filteredHistory = history.filter(h => 
    String(h.settlement_date).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-')}/10`}>
          <Icon size={22} className={color} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{title}</p>
          <h3 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value.toLocaleString()}</h3>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} color="text-blue-500" />
        <StatCard title="Today Cash In" value={stats.totalIn} icon={ArrowUpRight} color="text-emerald-500" />
        <StatCard title="Today Cash Out" value={stats.totalOut} icon={ArrowDownRight} color="text-rose-500" />
        <StatCard title="Net Profit" value={stats.netProfit} icon={TrendingUp} color="text-amber-500" />
      </div>

      {/* Header Section (Adjusted to match ApprovedTransactionsView) */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className={`text-xl font-extrabold uppercase ${theme.textTitle}`}>Settlement History</h2>
            <p className={`text-xs ${theme.textMuted}`}>Review financial performance logs</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className={`p-2.5 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
            <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className={`p-2.5 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input type="text" placeholder="Search date..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-32 text-xs pl-9 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
            </div>

            <button onClick={exportToExcel} className="p-2.5 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition">
              <Download size={16} />
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
              <tr className={`${isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'} border-b font-bold uppercase`}>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Orders</th>
                <th className="p-4 text-right">Cash In</th>
                <th className="p-4 text-right">Outflow</th>
                <th className="p-4 text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((row, i) => (
                <tr key={i} className={`border-b ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                  <td className="p-4 font-medium">{row.settlement_date}</td>
                  <td className="p-4 text-right">{row.total_orders}</td>
                  <td className="p-4 text-right font-mono">{row.total_cash_in.toLocaleString()}</td>
                  <td className="p-4 text-right font-mono text-rose-500">{row.total_outflow.toLocaleString()}</td>
                  <td className="p-4 text-right font-black text-amber-500">{row.profit_generated.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}