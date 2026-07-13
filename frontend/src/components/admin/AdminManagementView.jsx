import React, { useState, useEffect, useCallback } from 'react';
import { UserMinus, PlusCircle, RefreshCw, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';


export default function AdminManagementView({ theme, isDarkMode = false }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', phone: '', password: '', role: 'admin' });
  const [errors, setErrors] = useState({ email: '', phone: '', password: '' });

  // Database Function
  const fetchAdmins = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admins');
      const data = await response.json();
      if (Array.isArray(data)) {
        setAdmins(data);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins(true);
  }, [fetchAdmins]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAdmins(false);
  };

  // Add  Table မှာ 
  const handleCreateAdmin = async (e) => {
  e.preventDefault();
  
  let currentErrors = { email: '', phone: '', password: '' };
  let hasError = false;

  if (!newAdmin.name || !newAdmin.email || !newAdmin.phone || !newAdmin.password) return;

  if (newAdmin.password.length < 8) {
    currentErrors.password = 'Password must be at least 8 characters long.';
    hasError = true;
  }

  const emailExists = admins.some(admin => admin.email.toLowerCase() === newAdmin.email.toLowerCase());
  const phoneExists = admins.some(admin => admin.phone === newAdmin.phone);

  if (emailExists) {
    currentErrors.email = 'This email address is already registered.';
    hasError = true;
  }

  if (phoneExists) {
    currentErrors.phone = 'This phone number is already registered.';
    hasError = true;
  }

  if (hasError) {
    setErrors(currentErrors);
    return;
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAdmin)
    });

    const resData = await response.json();

    if (response.ok) {
      setAdmins(prev => [resData, ...prev]);
      setNewAdmin({ name: '', email: '', phone: '', password: '', role: 'admin' });
      setErrors({ email: '', phone: '', password: '' }); // Clear errors
    } else {
      if (resData.message && resData.message.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: 'This email is already taken.' }));
      } else if (resData.message && resData.message.toLowerCase().includes('phone')) {
        setErrors(prev => ({ ...prev, phone: 'This phone number is already taken.' }));
      }
    }
  } catch (error) {
    console.error("Error creating admin:", error);
  }
};

  // Revoke
  const handleRevokeAdmin = async (id, name, currentStatus) => {
    const isRevoked = currentStatus === 'Revoked';

    const result = await Swal.fire({
      html: `
        <div class="flex flex-col items-center">            
          <h2 class="text-sm font-bold m-0 mb-5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}">
            ${isRevoked ? 'Activate Access?' : 'Revoke Access?'}
          </h2>             
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: isRevoked ? '#10b981' : '#ef4444', 
      cancelButtonColor: '#64748b', 
      confirmButtonText: isRevoked ? 'Activate' : 'Revoke',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      width: '260px',
      customClass: {
        popup: `!p-4 !rounded-xl !h-auto ${isDarkMode ? '!bg-slate-800 !text-slate-200' : '!bg-white !text-slate-800'}`,
        actions: '!mt-0 !mb-0 !gap-2',
        confirmButton: '!text-[11px] !px-3 !py-1.5 !m-0 !rounded-lg !font-semibold',
        cancelButton: '!text-[11px] !px-3 !py-1.5 !m-0 !rounded-lg !font-semibold'
      }
    });

    if (!result.isConfirmed) return; 

    try {
     const response = await fetch(`http://localhost:5000/api/admins/revoke/${id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: isRevoked ? 'Active' : 'Revoked',
    isBlacklisted: isRevoked ? 0 : 1
  })
});

      if (response.ok) {
        setAdmins(prev => prev.map(admin => {
          if (admin.id === id) {
            return isRevoked 
              ? { ...admin, status: 'Active', isBlacklisted: 0 }
              : { ...admin, status: 'Revoked', isBlacklisted: 1 };
          }
          return admin;
        }));
      }
    } catch (error) {
      console.error("Error updating admin access:", error);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>Administrator Security & Roles</h2>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>Control internal personnel access, assign roles, and toggle operational status routing.</p>
        </div>
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-210px)]">        
        <form onSubmit={handleCreateAdmin} className={`lg:col-span-4 border p-4 rounded-2xl flex flex-col justify-between h-full ${theme.card}`}>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-500 flex items-center gap-2 mb-1">
            <PlusCircle size={15} /> Create Admin
          </h3>
          
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Full Name</label>
            <input required type="text" placeholder="Mg Mg" value={newAdmin.name} onChange={e=>setNewAdmin({...newAdmin, name: e.target.value})} className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border border-slate-300 dark:border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${theme.input}`} />
          </div>
          
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Email Link Address</label>
            <input required type="email" placeholder="operator@pay2pay.com" value={newAdmin.email} onChange={e=>{setNewAdmin({...newAdmin, email: e.target.value}); setErrors(p=>({...p, email:''}))}} className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border ${errors.email ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'} ${theme.input}`} />
            {errors.email && <p className="text-[10px] text-rose-500 font-semibold mt-0.5 pl-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Phone Index</label>
            <input required type="text" placeholder="09xxxxxxxxx" value={newAdmin.phone} onChange={e=>{setNewAdmin({...newAdmin, phone: e.target.value}); setErrors(p=>({...p, phone:''}))}} className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border ${errors.phone ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'} ${theme.input}`} />
            {errors.phone && <p className="text-[10px] text-rose-500 font-semibold mt-0.5 pl-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Password Key</label>
            <input required type="password" placeholder="Enter a strong password" value={newAdmin.password} onChange={e=>{setNewAdmin({...newAdmin, password: e.target.value}); setErrors(p=>({...p, password:''}))}} className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border ${errors.password ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'} ${theme.input}`} />
            {errors.password && <p className="text-[10px] text-rose-500 font-semibold mt-0.5 pl-1">{errors.password}</p>}
          </div>


          <button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 rounded-xl text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-amber-500/15 mt-2">
            Create Admin Account
          </button>
        </form>


        <div className={`lg:col-span-8 border rounded-2xl flex flex-col h-full overflow-hidden ${theme.tableBg}`}>
          <div className="overflow-x-auto overflow-y-auto h-full scrollbar-thin">
            {loading ? (
              <div className={`lg:col-span-8 border rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-220px)] ${theme.tableBg}`}>

                <Loader2 className="animate-spin" size={24} />
                <p className="text-xs font-mono">Connecting Database Node...</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse min-w-[550px]">
                <thead>
                  <tr className={`font-extrabold border-b uppercase tracking-wider ${theme.th}`}>
                    <th className="p-4">Admin Profile Node</th>
                    <th className="p-4">Access Level</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Revoke Protocol</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-medium ${isDarkMode?'divide-slate-800/60':'divide-slate-200'}`}>
                  {admins.map(admin => {
                    const isSuperAdmin = admin.email === 'admin@pay2pay.com';
                    const isRevoked = admin.status === 'Revoked' || admin.isBlacklisted === 1;

                    return (
                      <tr key={admin.id} className={`${isDarkMode?'hover:bg-slate-800/20':'hover:bg-slate-50'} ${isRevoked ? 'opacity-60 bg-rose-500/5' : ''}`}>
                        <td className="p-4">
                          <p className={`font-bold ${theme.textTitle}`}>{admin.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{admin.email} | {admin.phone}</p>
                        </td>
                        <td className="p-4">
                          <span className={`text-[11px] font-bold ${isSuperAdmin ? 'text-purple-500' : 'text-amber-500'}`}>
                            {isSuperAdmin ? 'Super Admin' : 'Admin'}
                          </span>
                        </td>
                        <td className="p-4">
                          {isRevoked ? (
                            <span className="bg-rose-500/10 text-rose-600 border border-rose-500/20 px-2 py-0.5 rounded font-black text-[10px] uppercase">Revoked</span>
                          ) : (
                            <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded font-black text-[10px] uppercase">Active</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                          onClick={() => handleRevokeAdmin(admin.id, admin.name, admin.status)}
                          type="button"
                          disabled={isSuperAdmin}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 ml-auto transition-all ${
                            isSuperAdmin
                              ? 'opacity-30 cursor-not-allowed border-slate-200 text-slate-400' 
                              : isRevoked
                                ? 'bg-emerald-500/10 hover:bg-emerald-600 border-emerald-500/20 text-emerald-500 hover:text-white'
                                : 'bg-rose-500/10 hover:bg-rose-600 border-rose-500/20 text-rose-500 hover:text-white'
                          }`}
                        >
                          <UserMinus size={13} /> 
                          {isRevoked ? 'Activate' : 'Revoke'}
                        </button>

                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}