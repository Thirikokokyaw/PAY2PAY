import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, CheckCircle } from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function DiagnosticsView({ theme, isDarkMode }) {
  const [dashboardData, setDashboardData] = useState({
    totalIn: 0,
    totalOut: 0,
    netProfit: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/diagnostics');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.today);
      }
    } catch (err) {
      console.error("Error fetching COBOL-processed data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    socket.on('refreshDashboard', fetchDashboardData);
    return () => socket.off('refreshDashboard');
  }, [fetchDashboardData]);

  if (loading) return <div className={`p-10 text-center ${theme.textMuted}`}>Processing with COBOL Engine...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className={`text-2xl font-black uppercase tracking-tight ${theme.textTitle}`}>Platform Diagnostics</h2>
          <p className={`text-xs ${theme.textMuted}`}>Real-time calculations via COBOL Engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Today's Cash In" value={dashboardData.totalIn} color="text-sky-400" icon={<ArrowUpCircle size={20}/>} theme={theme} />
        <MetricCard title="Today's Cash Out" value={dashboardData.totalOut} color="text-rose-400" icon={<ArrowDownCircle size={20}/>} theme={theme} />
        <MetricCard title="Net Profit" value={dashboardData.netProfit} color="text-emerald-400" icon={<Wallet size={20}/>} theme={theme} />
        <MetricCard title="Approved Orders" value={dashboardData.totalOrders} color="text-amber-400" icon={<CheckCircle size={20}/>} theme={theme} />
      </div>
    </div>
  );
}

function MetricCard({ title, value, color, icon, theme }) {
  return (
    <div className={`border p-5 rounded-xl transition-colors ${theme.tableBg} ${isDarkMode ? 'border-slate-800 hover:border-slate-700' : 'border-slate-200 hover:border-slate-300'}`}>
      <div className="flex justify-between items-start mb-3">
        <p className={`text-[10px] uppercase tracking-wider font-bold ${theme.textMuted}`}>{title}</p>
        <span className={color}>{icon}</span>
      </div>
      <p className={`text-2xl font-black ${theme.textTitle}`}>
        {Number(value || 0).toLocaleString()}
      </p>
    </div>
  );
}