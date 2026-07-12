import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, CheckCircle } from 'lucide-react';
import io from 'socket.io-client';

// Connect to your backend
const socket = io('http://localhost:5000');

export default function DiagnosticsView({ theme, isDarkMode }) {
  const [dashboardData, setDashboardData] = useState({
    totalIn: 0,
    totalOut: 0,
    netProfit: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);

  // Function to fetch the processed data from the COBOL-powered API
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

  // Listen for socket events to refresh when an admin approves a transaction
  useEffect(() => {
    fetchDashboardData();
    socket.on('refreshDashboard', fetchDashboardData);
    return () => socket.off('refreshDashboard');
  }, [fetchDashboardData]);

  if (loading) return <div className="p-10 text-center text-slate-400">Processing with COBOL Engine...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Platform Diagnostics</h2>
          <p className="text-xs text-slate-400">Real-time calculations via COBOL Engine</p>
        </div>
      </div>

      {/* The 4 Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Today's Cash In" value={dashboardData.totalIn} color="text-sky-400" icon={<ArrowUpCircle size={20}/>} />
        <MetricCard title="Today's Cash Out" value={dashboardData.totalOut} color="text-rose-400" icon={<ArrowDownCircle size={20}/>} />
        <MetricCard title="Net Profit" value={dashboardData.netProfit} color="text-emerald-400" icon={<Wallet size={20}/>} />
        <MetricCard title="Approved Orders" value={dashboardData.totalOrders} color="text-amber-400" icon={<CheckCircle size={20}/>} />
      </div>
    </div>
  );
}

function MetricCard({ title, value, color, icon }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{title}</p>
        <span className={color}>{icon}</span>
      </div>
      <p className={`text-2xl font-black ${color}`}>
        {Number(value || 0).toLocaleString()}
      </p>
    </div>
  );
}