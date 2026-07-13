import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Download, Search, RefreshCw, CheckSquare } from 'lucide-react';

export default function ApprovedTransactionsView({ theme, isDarkMode }) {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Date range state
  const [dateRange, setDateRange] = useState({ 
    start: new Date().toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });
  const today = new Date().toISOString().split('T')[0];

  const fetchApproved = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:5000/api/admin/approved-transactions?startDate=${dateRange.start}&endDate=${dateRange.end}`;
      console.log("Calling API:", url); 
      const response = await fetch(url);
      const res = await response.json();
      console.log("API Response:", res); 
      
      if (res.success) {
        setTransactions(res.data);
      } else {
        console.error("API returned failure:", res.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
};

  useEffect(() => {
    fetchApproved();
  }, [dateRange]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Approved_Transactions");
    XLSX.writeFile(wb, `Approved_${dateRange.start}_to_${dateRange.end}.xlsx`);
  };

  const filtered = transactions.filter(t => 
    String(t.txn_id).toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(t.user_name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>Approved History</h2>
          <p className={`text-xs ${theme.textMuted}`}>Review the approved transaction details</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className={`p-2.5 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} /> */}
          <input 
            type="date" 
            max={today}
            value={dateRange.start} 
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})} 
            className={`p-2.5 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} 
          />
          <span className="text-slate-400">to</span>
          {/* <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className={`p-2.5 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} /> */}
          <input type="date" 
            max={today} 
            value={dateRange.end} 
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})} 
            className={`p-2.5 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} 
          />
          
          <div className="relative w-full md:w-52">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input type="text" placeholder="Search ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full text-xs pl-9 py-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} />
          </div>
          <button onClick={exportToExcel} className="p-2.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition"><Download size={16} strokeWidth={3} /></button>
        </div>
      </div>

      <div className={`overflow-x-auto rounded-xl border max-h-[440px] overflow-y-auto ${isDarkMode ? 'border-slate-800' : 'border-slate-200 shadow-sm'}`}>
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'} font-bold`}>
              <th className="p-4">Txn ID</th>
              <th className="p-4">User Name</th>
              <th className="p-4">From</th>
              <th className="p-4">To</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" className="p-12 text-center text-slate-400"><RefreshCw className="animate-spin inline mr-2" size={16}/>Loading...</td></tr> 
            : filtered.map((txn) => (
              <tr key={txn.txn_id} className={`border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} hover:bg-amber-500/5`}>
                <td className="p-4 font-bold">#{txn.txn_id}</td>
                <td className="p-4 font-semibold">{txn.user_name}</td>
                <td className="p-4">{txn.from_wallet}</td>
                <td className="p-4">{txn.to_wallet}</td>
                <td className="p-4 text-right font-black text-emerald-500">{Number(txn.send_amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}