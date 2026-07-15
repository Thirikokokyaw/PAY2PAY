import React, { useState, useEffect } from 'react';
import { ShieldAlert, Terminal, Clock, User, Globe, Search } from 'lucide-react';

export default function AuditLogsView({ theme, isDarkMode }) {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/audit-logs', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    const interval = setInterval(() => { fetchAuditLogs(); }, 3000); 
    return () => clearInterval(interval);
  }, []);

  // Filter Area
  useEffect(() => {
    const filtered = logs.filter(log => {
      let logData = {};
     
      if (log.message && typeof log.message === 'string') {
        try {
          logData = JSON.parse(log.message);
        } catch (e) {
          logData = { action: log.message };
        }
      } else {
        logData = log.message || log;
      }

      const name = logData?.adminName || log?.adminName || 'System/Guest';
      const email = logData?.adminEmail || log?.adminEmail || 'N/A';
      const action = logData?.action || log?.action || '';

      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredLogs(filtered);
  }, [searchTerm, logs]);

  return (
    <div className="p-4 space-y-4 w-full h-auto flex flex-col flex-none">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h1 className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Security Audit Logs Registry
          </h1>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search credentials or actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none transition-all ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white focus:border-slate-600' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-500'
            }`}
          />
        </div>
      </div>

      {/* TABLE MAIN CONTAINER */}
      <div className={`border rounded-xl flex flex-col overflow-hidden ${
        isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
      }`}>

        <div className="overflow-y-auto max-h-[440px] scrollbar-thin">
          <table className="w-full text-left table-fixed border-collapse">
            
            {/* Sticky Header */}
            <thead className={`sticky top-0 z-10 ${
              isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}>
              <tr className="text-[10px] font-bold tracking-wider uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="py-2.5 px-4 w-[160px]"><div className="flex items-center gap-1"><Clock className="w-3 h-3" /> TIMESTAMP</div></th>
                <th className="py-2.5 px-4 w-[180px]"><div className="flex items-center gap-1"><User className="w-3 h-3" /> ADMINISTRATOR</div></th>
                <th className="py-2.5 px-4"><div className="flex items-center gap-1"><Terminal className="w-3 h-3" /> ACTION EXECUTION</div></th>
                <th className="py-2.5 px-4 w-[80px] text-center">STATUS</th>
                <th className="py-2.5 px-4 w-[130px] text-right"><div className="flex items-center gap-1 justify-end"><Globe className="w-3 h-3" /> IP ADDRESS</div></th>
              </tr>
            </thead>

            {/* Body Content */}
            <tbody className={`divide-y text-xs ${isDarkMode ? 'divide-slate-800 text-slate-200' : 'divide-slate-200 text-slate-800'}`}>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-500 italic tracking-wide">
                    No matching records found inside the log database.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  let logData = {};
                  
                  if (log.message && typeof log.message === 'string') {
                    try { logData = JSON.parse(log.message); } catch (e) { logData = { action: log.message }; }
                  } else {
                    logData = log.message || log;
                  }
                  
                  const logTimestamp = logData?.timestamp || log?.timestamp || 'N/A';
                  const displayAdminName = logData?.adminName || log?.adminName || 'System/Guest';
                  const displayAdminEmail = logData?.adminEmail || log?.adminEmail || 'N/A';
                  let rawAction = logData?.action || log?.action || '';

                  let readableAction = rawAction;
                  const cleanUrl = rawAction.toLowerCase();

                  if (cleanUrl.includes('settings/update') || cleanUrl.includes('settings')) {
                    readableAction = "Updated General Settings";
                  } else if (cleanUrl.includes('rate/update') || cleanUrl.includes('rate')) {
                    readableAction = "Updated Exchange Rates";
                  } else if (cleanUrl.includes('add-admin')) {
                    readableAction = "Added New Admin Account";
                  } else if (cleanUrl.includes('change-password')) {
                    readableAction = "Changed Admin Password";
                  } else if (cleanUrl.includes('user-node/update')) {
                    const userId = cleanUrl.split('/').pop() || '';
                    readableAction = `Updated User Profile (ID: ${userId})`;
                  } else if (cleanUrl.includes('audit-logs')) {
                    readableAction = "Viewed Security Audit Logs";
                  } else if (cleanUrl.includes('users')) {
                    readableAction = "Viewed Users List";
                  } else if (cleanUrl.includes('approved-transactions')) {
                    readableAction = "Viewed Approved Transactions";
                  } else if (cleanUrl.includes('pending-transactions')) {
                    readableAction = "Viewed Pending Transactions";
                  } else if (cleanUrl.includes('approve-transaction')) {
                    readableAction = "Approved Transaction";
                  } else if (cleanUrl.includes('wallets/update-details')) {
                    readableAction = "Updated Wallet Details";
                  } else if (cleanUrl.includes('tickets/reply')) {
                    readableAction = "Replied to Support Ticket";
                  } else if (cleanUrl.includes('tickets/close')) {
                    readableAction = "Closed Support Ticket";
                  } else if (cleanUrl.includes('login')) {
                    readableAction = "Logged Into System";
                  } else if (cleanUrl.includes('logout')) {
                    readableAction = "Logged Out From System";
                  } else if (cleanUrl.includes('delete-admin')) {
                    readableAction = "Deleted Admin Account";
                  } else if (cleanUrl.includes('ban-user')) {
                    readableAction = "Banned User Account";
                  } else if (cleanUrl.includes('deposit')) {
                    readableAction = "Processed Deposit Request";
                  } else if (cleanUrl.includes('withdraw')) {
                    readableAction = "Processed Withdrawal Request";
                  } else {
                    readableAction = rawAction.split('/').pop().replace(/-/g, ' ');
                  }

                  return (
                    <tr key={index} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-900/40 text-slate-100' : 'hover:bg-slate-50 text-slate-900'}`}>
                      <td className={`py-3 px-4 font-mono text-[11px] font-bold w-[160px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {logTimestamp}
                      </td>
                      <td className="py-3 px-4 w-[180px] truncate">
                        <div className="font-bold text-xs">{displayAdminName}</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">{displayAdminEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-medium tracking-wide truncate">
                        {readableAction} 
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[11px] w-[80px]">
                        <span className="text-emerald-500">✔</span>
                      </td>
                      <td className={`py-3 px-4 text-right font-mono text-[11px] w-[130px] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {logData?.ip || log?.ip || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}