import React, { useState } from 'react';
import { UserMinus, PlusCircle } from 'lucide-react';

export default function AdminManagementView({ theme, isDarkMode = false }) {
  const [admins, setAdmins] = useState([
    { id: 1, name: 'Zayar Linn', email: 'zayar@pay2pay.com', phone: '09111222333', role: 'Super Admin', status: 'Active' },
    { id: 2, name: 'Htet Htet', email: 'htet@pay2pay.com', phone: '09444555666', role: 'Support', status: 'Active' }
  ]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', phone: '', password: '', role: 'Support' });

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email || !newAdmin.phone || !newAdmin.password) return;
    setAdmins(prev => [{ ...newAdmin, id: Date.now(), status: 'Active' }, ...prev]);
    setNewAdmin({ name: '', email: '', phone: '', password: '', role: 'Support' });
  };

  const handleRevokeAdmin = (id) => setAdmins(prev => prev.filter(a => a.id !== id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>Administrative Security Node</h2>
        <p className={`text-xs mt-1 ${theme.textMuted}`}>Provision access tokens and handle internal operations hierarchy roles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <form onSubmit={handleCreateAdmin} className={`border p-6 rounded-2xl space-y-4 ${theme.card}`}>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-500 flex items-center gap-2">
            <PlusCircle size={16} /> Assign Operator Token
          </h3>
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Full Name</label>
            <input required type="text" placeholder="Mg Mg" value={newAdmin.name} onChange={e=>setNewAdmin({...newAdmin, name: e.target.value})} className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none ${theme.input}`} />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Email Link Address</label>
            <input required type="email" placeholder="operator@pay2pay.com" value={newAdmin.email} onChange={e=>setNewAdmin({...newAdmin, email: e.target.value})} className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none ${theme.input}`} />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Phone Index</label>
            <input required type="text" placeholder="09xxxxxxxxx" value={newAdmin.phone} onChange={e=>setNewAdmin({...newAdmin, phone: e.target.value})} className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none ${theme.input}`} />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Password Key</label>
            <input required type="password" placeholder="Enter a strong password" value={newAdmin.password} onChange={e=>setNewAdmin({...newAdmin, password: e.target.value})} className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none ${theme.input}`} />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Authority Role Node</label>
            <select value={newAdmin.role} onChange={e=>setNewAdmin({...newAdmin, role: e.target.value})} className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none font-semibold ${theme.input}`}>
              <option value="Super Admin">Super Admin</option>
              <option value="Editor">Editor</option>
              <option value="Support">Support</option>
            </select>
          </div>
          <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-amber-500/15">
            Create Admin Account
          </button>
        </form>

        <div className={`lg:col-span-2 border rounded-2xl overflow-hidden ${theme.tableBg}`}>
          <div className="overflow-x-auto">
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
                {admins.map(admin => (
                  <tr key={admin.id} className={isDarkMode?'hover:bg-slate-800/20':'hover:bg-slate-50'}>
                    <td className="p-4">
                      <p className={`font-bold ${theme.textTitle}`}>{admin.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{admin.email} | {admin.phone}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] font-bold text-amber-500">{admin.role}</span>
                    </td>
                    <td className="p-4">
                      <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded font-black text-[10px] uppercase">{admin.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRevokeAdmin(admin.id)}
                        disabled={admin.role === 'Super Admin'}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 ml-auto transition-all ${admin.role === 'Super Admin' ? 'opacity-30 cursor-not-allowed border-slate-200 text-slate-400' : 'bg-rose-500/10 hover:bg-rose-600 border-rose-500/20 text-rose-500 hover:text-white'}`}
                      >
                        <UserMinus size={13} /> Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}