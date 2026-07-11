import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Swal from 'sweetalert2';


export function UserManagementView({ activeView, theme = {}, isDarkMode = false }) {
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users');
      const data = await response.json();
      if (response.ok) setUsers(data);
    } catch (error) {
      console.error("Failed to load user records:", error);
    }
  };

  useEffect(() => {
    if (activeView === 'users') {
      fetchUsers();
    }
  }, [activeView]);

  // Block / Unblock 
 const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'Blocked' ? 'Active' : 'Blocked';
    const result = await Swal.fire({
      html: `
        <div class="flex flex-col items-center">            
          <h2 class="text-sm font-bold text-slate-800 m-0 mb-5">
            ${currentStatus === 'Active' ? 'Block Account?' : 'Unblock Account?'}
          </h2>             
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: currentStatus === 'Active' ? '#e11d48' : '#10b981', 
      cancelButtonColor: '#64748b',  
      confirmButtonText: currentStatus === 'Active' ? 'Block' : 'Unblock',
      reverseButtons: true, 
      width: '260px', 
      customClass: {
        popup: '!p-4 !rounded-xl !h-auto',
        actions: '!mt-0 !mb-0 !gap-2',
        confirmButton: '!text-[11px] !px-3 !py-1.5 !m-0 !rounded-lg !font-semibold',
        cancelButton: '!text-[11px] !px-3 !py-1.5 !m-0 !rounded-lg !font-semibold'
      }
    });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });
    
    const data = await response.json();
    if (response.ok) {
      fetchUsers();
    } 
    else {
            Swal.fire({
        html: `
          <div class="flex flex-col items-center">            
            <h2 class="text-sm font-bold text-slate-800 m-0 mb-5">Error!</h2>             
            <p class="text-[11px] text-slate-500 m-0">${data.message}</p>
          </div>
        `,
        width: '260px',
        confirmButtonColor: '#64748b',
        customClass: {
          popup: '!p-4 !rounded-xl !h-auto',
          actions: '!mt-3 !mb-0',
          confirmButton: '!text-[11px] !px-4 !py-1.5 !m-0 !rounded-lg !font-semibold'
        }
      });
    }
  } 
  catch (error) {
    Swal.fire({
      html: `
        <div class="flex flex-col items-center">            
          <h2 class="text-sm font-bold text-slate-800 m-0 mb-5">Failed!</h2>             
          <p class="text-[11px] text-slate-500 m-0">Status modification failed.</p>
        </div>
      `,
      width: '260px',
      confirmButtonColor: '#64748b',
      customClass: {
        popup: '!p-4 !rounded-xl !h-auto',
        actions: '!mt-3 !mb-0',
        confirmButton: '!text-[11px] !px-4 !py-1.5 !m-0 !rounded-lg !font-semibold'
      }
    });
  }
};

//  Blacklist Toggle 
const handleToggleBlacklist = async (userId, userIsBlacklisted) => {
  // Confirm Box
  const result = await Swal.fire({
    html: `
      <div class="flex flex-col items-center">            
        <h2 class="text-sm font-bold text-slate-800 m-0 mb-5">
          ${userIsBlacklisted === 1 ? 'Remove Blacklist?' : 'Add Blacklist?'}
        </h2>             
      </div>
    `,
    showCancelButton: true,
    confirmButtonColor: userIsBlacklisted === 1 ? '#10b981' : '#e11d48',
    cancelButtonColor: '#64748b',
    confirmButtonText: userIsBlacklisted === 1 ? 'Unblacklist' : 'Blacklist',
    reverseButtons: true,
    width: '260px', 
    customClass: {
      popup: '!p-4 !rounded-xl !h-auto',
      actions: '!mt-0 !mb-0 !gap-2',
      confirmButton: '!text-[11px] !px-3 !py-1.5 !m-0 !rounded-lg !font-semibold',
      cancelButton: '!text-[11px] !px-3 !py-1.5 !m-0 !rounded-lg !font-semibold'
    }
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/toggle-blacklist`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Network response was not ok');
    fetchUsers(); 
  } 
  catch (error) { 
    Swal.fire({
      html: `
        <div class="flex flex-col items-center">            
          <h2 class="text-sm font-bold text-slate-800 m-0 mb-5">Error!</h2>             
          <p class="text-[11px] text-slate-500 m-0">Blacklist UI trigger failed.</p>
        </div>
      `,
      width: '260px',
      confirmButtonColor: '#64748b',
      customClass: {
        popup: '!p-4 !rounded-xl !h-auto',
        actions: '!mt-3 !mb-0',
        confirmButton: '!text-[11px] !px-4 !py-1.5 !m-0 !rounded-lg !font-semibold'
      }
    });
  }
};


  if (activeView !== 'users') return null;
    const filteredUsers = users.filter((u) => {
    const matchesRole = u.role === 'user' || !u.role; // role  default user 
    const searchLower = userSearch.toLowerCase();
    const matchesName = u.name && u.name.toLowerCase().includes(searchLower);
    const matchesPhone = u.phone && u.phone.includes(userSearch);
    const matchesSearch = matchesName || matchesPhone;
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle || ''}`}>
            User Directory & Access Control
          </h2>
          <p className={`text-xs mt-1 ${theme.textMuted || ''}`}>
            Manage user access permissions, block accounts, or handle blacklist status
          </p>
        </div>

        {/*  Phone Number search Input Box */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className={`w-full rounded-xl border border-slate-300 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 placeholder-slate-400 ${theme.input || ''}`}
            />
        </div>
      </div>

      {/*  Scroll */}
      <div className={`border rounded-2xl overflow-hidden ${theme.tableBg || ''}`}>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            {/* 💡 FIXED: Sticky top Background Color  */}
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className={`font-extrabold border-b uppercase tracking-wider ${theme.th || ''} ${isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
                <th className="p-4">Account Holder Name</th>
                <th className="p-4">Phone Matrix</th>
                <th className="p-4 text-center">Platform Status</th>
                <th className="p-4 text-center">Transactions Count</th>
                <th className="p-4 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className={`${isDarkMode ? 'hover:bg-slate-800/20' : 'hover:bg-slate-50'} ${user.isBlacklisted === 1 ? 'bg-rose-500/5' : ''}`}
                >
                  <td className={`p-4 font-bold flex items-center gap-2 ${theme.textTitle || ''}`}>
                    {user.name}
                    {user.isBlacklisted === 1 && (
                      <span className="text-[9px] bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded border border-rose-500/30 uppercase font-black tracking-widest">
                        Blacklisted
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-slate-400">{user.phone}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className={`p-4 text-center font-bold ${theme.textTitle || ''}`}>
                    {user.totalTxns || 0} Orders
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    
                    {/*  Block / Unblock Button */}
                    <button 
                      onClick={() => handleToggleUserStatus(user.id, user.status)} 
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${user.status === 'Active' ? 'bg-slate-500/10 text-slate-600 border-slate-300 dark:text-slate-300 dark:border-slate-700' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}
                    >
                      {user.status === 'Active' ? 'Block Account' : 'Unblock Account'}
                    </button>
                    
                    {/*  Blacklist Toggle Button */}
                    <button 
                    onClick={() => handleToggleBlacklist(user.id, user.isBlacklisted)} 
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${user.isBlacklisted === 1 ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700' : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20'}`}
                  >
                    {user.isBlacklisted === 1 ? 'Remove Blacklist' : 'Add Blacklist'}
                  </button>


                  </td>
                </tr>
              ))}              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-bold">
                    No matching phone registries located.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}