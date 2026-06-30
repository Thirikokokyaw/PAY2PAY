import React, { useState } from 'react';
import { LayoutDashboard, ArrowLeftRight, Users, Settings, Bell, Search, Check, X, RefreshCw, LogOut } from 'lucide-react';
import '../App.css'; 
import logo from '../assets/logo.png';

//  give from Parent Component , accept onLogout prop 
export default function AdminDashboard({ onLogout }) {
  // Sample Data for Real-time testing
  const [transactions, setTransactions] = useState([
    { id: "TXN-1042", name: "Kyaw Kyaw", from: "Wave Pay", to: "KBZPay", amount: 50000, fee: 1000, receive: 49000, status: "Pending", phone: "09777123456" },
    { id: "TXN-1041", name: "Su Su", from: "KBZPay", to: "Wave Pay", amount: 150000, fee: 3000, receive: 147000, status: "Success", phone: "09965432100" },
    { id: "TXN-1040", name: "Aung Myo", from: "CB Pay", to: "AYA Pay", amount: 80000, fee: 1600, receive: 78400, status: "Cancelled", phone: "09254112233" },
  ]);

  const updateStatus = (id, newStatus) => {
    setTransactions(transactions.map(txn => txn.id === id ? { ...txn, status: newStatus } : txn));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex w-full">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between hidden md:flex flex-shrink-0">
        <div className="flex flex-col">
          {/* Logo Area */}
          <div className="p-4 border-b border-slate-800 flex justify-center items-center">
            <img src={logo} alt="PAY2PAY Admin Logo" className="h-20 md:h-24 w-auto object-contain transform hover:scale-105 transition duration-300" />
          </div>
        
          <nav className="px-4 mt-6 space-y-1.5">
            <a href="#" className="flex items-center space-x-3 bg-yellow-400 text-slate-950 font-bold px-4 py-3 rounded-xl transition shadow-lg">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-900 hover:text-white px-4 py-3 rounded-xl transition font-semibold">
              <ArrowLeftRight size={18} />
              <span>Transactions</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-900 hover:text-white px-4 py-3 rounded-xl transition font-semibold">
              <Users size={18} />
              <span>Users</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-900 hover:text-white px-4 py-3 rounded-xl transition font-semibold">
              <Settings size={18} />
              <span>Settings</span>
            </a>
          </nav>
        </div>

        {/*  SIDEBAR FOOTER - LOGOUT & MANAGER INFO */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-3 bg-slate-950/50">
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Logged in as Manager
          </div>
          
          {/* Logout Button ,return User Main View  */}
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white py-2.5 rounded-xl transition font-bold text-xs shadow-sm"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* TOP BAR */}
        <header className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 w-64 md:w-80">
            <Search size={16} className="text-slate-500 mr-2" />
            <input type="text" placeholder="Search transactions..." className="bg-transparent text-sm w-full focus:outline-none text-slate-200" />
          </div>
          <div className="flex items-center space-x-4">
            {/* Mobile Logout  */}
            <button onClick={onLogout} className="md:hidden p-2 text-rose-400 hover:text-rose-500 transition" title="Logout">
              <LogOut size={20} />
            </button>

            <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
              A
            </div>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <div className="p-6 flex-grow space-y-6 overflow-y-auto">
          
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Overview Dashboard</h1>
            <button className="flex items-center space-x-2 text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl transition font-semibold text-slate-300">
              <RefreshCw size={14} />
              <span>Refresh Data</span>
            </button>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Volume Today</p>
              <h3 className="text-2xl font-black text-yellow-400">280,000 <span className="text-xs font-normal text-slate-400">MMK</span></h3>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Fees Earned</p>
              <h3 className="text-2xl font-black text-emerald-400">5,600 <span className="text-xs font-normal text-slate-400">MMK</span></h3>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Requests</p>
              <h3 className="text-2xl font-black text-amber-500">1 <span className="text-xs font-normal text-slate-400">order</span></h3>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Success Rate</p>
              <h3 className="text-2xl font-black text-blue-400">96.8%</h3>
            </div>
          </div>

          {/* RECENT TRANSACTIONS TABLE */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-400">Recent Exchange Requests</h2>
              <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-lg font-medium">Live Feed</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 text-xs uppercase font-bold">
                    <th className="p-4">Txn ID</th>
                    <th className="p-4">Customer / Phone</th>
                    <th className="p-4">Route</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-right">Payout (Net)</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-900/30 transition">
                      <td className="p-4 font-mono text-xs text-slate-400">{txn.id}</td>
                      <td className="p-4">
                        <div className="text-slate-200">{txn.name}</div>
                        <div className="text-xs text-slate-500">{txn.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5 text-xs">
                          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">{txn.from}</span>
                          <span className="text-slate-600">→</span>
                          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-yellow-400">{txn.to}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right text-slate-300">{txn.amount.toLocaleString()}</td>
                      <td className="p-4 text-right text-emerald-400 font-bold">{txn.receive.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-bold border ${
                          txn.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          txn.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2">
                          {txn.status === 'Pending' ? (
                            <>
                              <button onClick={() => updateStatus(txn.id, 'Success')} className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition shadow-md" title="Approve">
                                <Check size={14} strokeWidth={3} />
                              </button>
                              <button onClick={() => updateStatus(txn.id, 'Cancelled')} className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg transition shadow-md" title="Reject">
                                <X size={14} strokeWidth={3} />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-600">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}