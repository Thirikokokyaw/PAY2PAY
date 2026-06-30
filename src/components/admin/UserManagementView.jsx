import React from 'react';
import { Search } from 'lucide-react';

export function UserManagementView({
  activeView,
  theme = {},
  userSearch = '',
  setUserSearch,
  users = [],
  isDarkMode = false,
  handleToggleUserStatus,
  handleToggleBlacklist
}) {
  // Only render if this specific view is active
  if (activeView !== 'users') return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle || ''}`}>
            User Ledger Registry
          </h2>
          <p className={`text-xs mt-1 ${theme.textMuted || ''}`}>
            Manage network access limitations and account standing status
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by phone index number..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none placeholder-slate-400 ${theme.input || ''}`}
          />
        </div>
      </div>

      <div className={`border rounded-2xl overflow-hidden ${theme.tableBg || ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className={`font-extrabold border-b uppercase tracking-wider ${theme.th || ''}`}>
                <th className="p-4">Account Holder Name</th>
                <th className="p-4">Phone Matrix</th>
                <th className="p-4 text-center">Platform Status</th>
                <th className="p-4 text-center">Transactions Count</th>
                <th className="p-4 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
              {users
                .filter((u) => u.phone && u.phone.includes(userSearch))
                .map((user) => (
                  <tr 
                    key={user.id} 
                    className={`${isDarkMode ? 'hover:bg-slate-800/20' : 'hover:bg-slate-50'} ${user.isBlacklisted ? 'bg-rose-500/5' : ''}`}
                  >
                    <td className={`p-4 font-bold flex items-center gap-2 ${theme.textTitle || ''}`}>
                      {user.name}
                      {user.isBlacklisted && (
                        <span className="text-[9px] bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded border border-rose-500/30 uppercase font-black tracking-widest">
                          Blacklisted
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-slate-400">{user.phone}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-200 text-slate-500 border border-slate-300'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className={`p-4 text-center font-bold ${theme.textTitle || ''}`}>
                      {user.totalTxns || 0} Orders
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button 
                        onClick={() => handleToggleUserStatus && handleToggleUserStatus(user.id)} 
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${user.status === 'Active' ? 'bg-slate-500/10 text-slate-600 border-slate-300' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}
                      >
                        {user.status === 'Active' ? 'Block Access' : 'Unblock Account'}
                      </button>
                      <button 
                        onClick={() => handleToggleBlacklist && handleToggleBlacklist(user.id)} 
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${user.isBlacklisted ? 'bg-rose-600 text-white' : 'bg-rose-500/10 text-rose-500'}`}
                      >
                        {user.isBlacklisted ? 'Remove Flag' : 'Add Blacklist'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}