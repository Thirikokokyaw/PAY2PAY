import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, QrCode, RefreshCw, Edit3, X, Save, Upload, Plus, Wallet } from 'lucide-react';

export default function WalletSettingsView({ theme, isDarkMode = false, onWalletUpdated }) {
  const [wallets, setWallets] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Backend Base URL for Images
  const BACKEND_URL = 'http://localhost:5000';

  // Modals States
  const [editingWallet, setEditingWallet] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Forms States
  const [createForm, setCreateForm] = useState({
    wallet_id: '', wallet_name: '', account_number: '', account_holder: '',
    qr_code_path: '', current_balance: 1500000, limit_warning: 5000000, is_active: 'Y'
  });
  
  const [editForm, setEditForm] = useState({
    wallet_id: '', wallet_name: '', account_number: '', account_holder: '',
    qr_code_path: '', current_balance: 0, limit_warning: 5000000, is_active: 'Y'
  });

  const fetchWalletsFromDatabase = async (showSpinner = true) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/wallets`); 
      const data = await response.json();
      if (Array.isArray(data)) {
        setWallets(data);
      }
    } catch (err) {
      console.error("Database Error!", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletsFromDatabase(true);
  }, []);

  const handleEditClick = (wallet) => {
    setEditingWallet(wallet.wallet_id);
    setEditForm({ ...wallet });
  };

  const handleInputChange = (e, isCreateForm = false) => {
    const { name, value } = e.target;
    if (isCreateForm) {
      setCreateForm(prev => ({ ...prev, [name]: value }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e, isCreateForm = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isCreateForm) {
          setCreateForm(prev => ({ ...prev, qr_code_path: reader.result }));
        } else {
          setEditForm(prev => ({ ...prev, qr_code_path: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateWalletSubmit = async (e) => {
    e.preventDefault();

    // Check if QR stream is present
    if (!createForm.qr_code_path) {
      alert("Please Upload Your QR Stream!");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/wallets/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await response.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        setCreateForm({
          wallet_id: '', wallet_name: '', account_number: '', account_holder: '',
          qr_code_path: '', current_balance: 1500000, limit_warning: 5000000, is_active: 'Y'
        });
        fetchWalletsFromDatabase(false);
      }
    } catch (err) {
      console.error("Error creating wallet:", err);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const responseDetails = await fetch(`${BACKEND_URL}/api/wallets/update-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      
      const resData = await responseDetails.json();
      
      if (resData.success) {
        setWallets(prev => prev.map(w => 
          w.wallet_id === editForm.wallet_id 
            ? { ...editForm, is_active: resData.is_active } 
            : w
        ));
        
        setEditingWallet(null);
        fetchWalletsFromDatabase(false);
      }
    } catch (err) {
      console.error("Database or COBOL updates failed:", err);
    }
  };

  const handleToggleActive = async (wallet) => {
    const nextActiveState = wallet.is_active === 'Y' ? 'N' : 'Y';
    setWallets(prev => prev.map(w => 
      w.wallet_id === wallet.wallet_id ? { ...w, is_active: nextActiveState } : w
    ));

    try {
      const response = await fetch(`${BACKEND_URL}/api/wallets/update-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...wallet,
          is_active: nextActiveState,
          isToggleAction: true
        }),
      });
      
      const resData = await response.json();
      if (!resData.success) {
        fetchWalletsFromDatabase(false);
        alert("The status change failed and was reverted to the original status.");
      }
    } catch (err) {
      console.error("Toggle API Error:", err);
      fetchWalletsFromDatabase(false);
    }
  };

  // Helper function to render correct image path
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('data:') || path.startsWith('http')) return path;
    return `${BACKEND_URL}/${path.replace(/^\/+/, '')}`; 
  };

  return (
    <div className="space-y-6 relative p-1 text-slate-700 dark:text-slate-300 w-full">
      
      {/* Header & Clean Action Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className={`text-xl font-extrabold tracking-tight uppercase ${theme.textTitle}`}>Wallet & Limits Framework</h2>
        </div>
        <div className="flex gap-2 w-full sm:w-auto items-center font-sans">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-md shadow-amber-500/10 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={15} strokeWidth={2.5} /> ADD NEW WALLET
          </button>
          
          <button 
            onClick={() => fetchWalletsFromDatabase(true)}
            disabled={isRefreshing}
            title="Refresh System Data"
            className={`flex items-center justify-center p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 transition-all active:scale-95 ${theme.card}`}
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-amber-500' : 'text-slate-500 dark:text-slate-400'} />
          </button>
        </div>
      </div>

      {/* Modified Layout: Vertical Scroll Box */}
      <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
          {wallets.map(wallet => {
            const isActive = wallet.is_active === 'Y';
            const balance = Number(wallet.current_balance) || 0;
            const limit = Number(wallet.limit_warning) || 5000000;
            const isLowBalance = balance < limit;
            const qrImageUrl = getImageUrl(wallet.qr_code_path);
            
            return (
              <div 
                key={wallet.wallet_id} 
                className={`border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all relative group w-full ${theme.card} ${!isActive ? 'border-rose-500/30 bg-rose-50/5 opacity-75' : isLowBalance ? 'border-amber-500/40 bg-amber-50/5' : 'border-slate-200 dark:border-slate-800'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4 gap-4">    
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      <div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${isActive ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
                          {isActive ? 'Active Route' : 'Frozen Buffer'}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate pt-1">
                        {wallet.wallet_name}
                      </h3>
                    </div>

                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handleEditClick(wallet)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-700 dark:hover:bg-slate-600 hover:text-white shadow-sm"
                        title="Edit"
                      >
                        <Edit3 size={13} />
                      </button>

                      {/* Toggle Button On Click Function */}
                      <div className="h-7 flex items-center">
                        {isActive ? (
                          <ToggleRight size={28} className="text-amber-500 cursor-pointer" onClick={() => handleToggleActive(wallet)} />
                        ) : (
                          <ToggleLeft size={28} className="text-slate-400 dark:text-slate-600 cursor-pointer" onClick={() => handleToggleActive(wallet)} />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 flex justify-center bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    {qrImageUrl ? (
                      <img src={qrImageUrl} alt="QR Storage Stream" className="w-24 h-24 object-contain rounded-lg" />
                    ) : (
                      <div className="w-24 h-24 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                        <QrCode size={32} strokeWidth={1.5} />
                        <span className="text-[10px] mt-2 text-slate-400">No QR Asset</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 font-mono text-xs text-slate-500 dark:text-slate-400 mb-5 bg-slate-50 dark:bg-slate-900/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    <p><span className="text-slate-400 font-sans text-[11px]">System ID:</span> <span className="font-bold text-slate-700 dark:text-slate-300">{wallet.wallet_id}</span></p>
                    <p><span className="text-slate-400 font-sans text-[11px]">Account No:</span> <span className="font-bold text-slate-700 dark:text-slate-300">{wallet.account_number}</span></p>
                    <p><span className="text-slate-400 font-sans text-[11px]">Holder:</span> <span className="text-slate-700 dark:text-slate-300 font-medium">{wallet.account_holder || 'N/A'}</span></p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Current Allocation:</span>
                    <span className={isLowBalance ? 'text-rose-500 font-bold' : 'text-slate-900 dark:text-white'}>
                      {balance.toLocaleString()} MMK
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isLowBalance ? 'bg-rose-500' : 'bg-amber-500'}`} 
                      style={{ width: `${Math.min((balance / (limit * 2 || 2000)) * 100, 100)}%` }}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE WALLET MODAL FORM */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xl rounded-2xl shadow-xl border-0 flex flex-col max-h-[92vh] overflow-hidden bg-white dark:bg-slate-900">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Wallet size={16} className="text-amber-500" /> Create New Wallet
                </h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-rose-500 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWalletSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <div className="w-20 h-20 bg-white dark:bg-slate-950 border rounded-xl flex items-center justify-center p-2 shadow-inner shrink-0 relative overflow-hidden">
                  {createForm.qr_code_path ? <img src={getImageUrl(createForm.qr_code_path)} alt="Preview" className="w-full h-full object-contain" /> : <QrCode size={24} className="text-slate-400" />}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Upload QR Stream <span className="text-rose-500 font-extrabold">* (Required)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold cursor-pointer transition-colors">
                    <Upload size={12} /> Choose Image
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, true)} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">Wallet Primary Code (ID)</label>
                  <input type="text" name="wallet_id" required placeholder="e.g., AYAPay" value={createForm.wallet_id} onChange={(e) => handleInputChange(e, true)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-mono uppercase focus:border-amber-500 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">Custom Display Name</label>
                  <input type="text" name="wallet_name" required placeholder="e.g., AYA Pay Main" value={createForm.wallet_name} onChange={(e) => handleInputChange(e, true)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:border-amber-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">Account / Phone Number</label>
                  <input type="text" name="account_number" required placeholder="09xxxxxxxx" value={createForm.account_number} onChange={(e) => handleInputChange(e, true)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-mono focus:border-amber-500 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">Registered Holder</label>
                  <input type="text" name="account_holder" required placeholder="U Thaw Thaw" value={createForm.account_holder} onChange={(e) => handleInputChange(e, true)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:border-amber-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">Initial Balance Allocation (MMK)</label>
                  <input type="number" step="0.01" name="current_balance" required value={createForm.current_balance} onChange={(e) => handleInputChange(e, true)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-mono focus:border-amber-500 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">Engine Deactivation Limit</label>
                  <input type="number" disabled value={createForm.limit_warning} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-mono text-slate-400 cursor-not-allowed" />
                </div>
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 justify-end">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl shadow-md">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL FORM */}
      {editingWallet && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xl rounded-2xl shadow-xl border-0 flex flex-col max-h-[92vh] overflow-hidden bg-white dark:bg-slate-900">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Edit3 size={16} className="text-amber-500" /> Edit Wallet
                </h3>
              </div>
              <button onClick={() => setEditingWallet(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-rose-500 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveChanges} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <div className="w-20 h-20 bg-white dark:bg-slate-950 border rounded-xl flex items-center justify-center p-2 shadow-inner shrink-0 relative overflow-hidden">
                  {editForm.qr_code_path ? <img src={getImageUrl(editForm.qr_code_path)} alt="Preview" className="w-full h-full object-contain" /> : <QrCode size={24} className="text-slate-400" />}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Modify QR Vector</label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold cursor-pointer transition-colors">
                    <Upload size={12} /> Replace Image
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, false)} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">Wallet Code (Locked)</label>
                  <input type="text" name="wallet_id" disabled value={editForm.wallet_id} className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-slate-400 font-mono cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">Display Router Name</label>
                  <input type="text" name="wallet_name" required value={editForm.wallet_name} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:border-amber-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">Account / Phone Mapping</label>
                  <input type="text" name="account_number" required value={editForm.account_number} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-mono focus:border-amber-500 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">Account Holder Title</label>
                  <input type="text" name="account_holder" required value={editForm.account_holder} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:border-amber-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">Balance Matrix Allocation (MMK)</label>
                  <input type="number" step="0.01" name="current_balance" required value={editForm.current_balance} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-mono focus:border-amber-500 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">Threshold Warning Boundary (MMK)</label>
                  <input type="number" step="0.01" name="limit_warning" required value={editForm.limit_warning} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-mono focus:border-amber-500 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-400">Router Pipeline Active Engine State</label>
                <select name="is_active" value={editForm.is_active} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-bold text-slate-700 dark:text-slate-200">
                  <option value="Y"> Y - ROUTE ACTIVE</option>
                  <option value="N"> N - ROUTE INACTIVE</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 justify-end">
                <button type="button" onClick={() => setEditingWallet(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200">Discard</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl shadow-md"><Save size={12} className="inline mr-1" /> Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}