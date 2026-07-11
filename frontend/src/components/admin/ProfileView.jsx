import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Mail, Edit2, Check, X, ShieldAlert, KeyRound, Camera } from 'lucide-react';

export default function ProfileView({ theme, isDarkMode, adminData, setAdminData }) {
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...adminData });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  {/*su*/}
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setEditForm({ ...adminData });
  }, [adminData]);
{/*su*/}

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
    
      reader.onloadend = () => {
        const base64String = reader.result;
        
        setEditForm(prev => ({ 
          ...prev, 
          avatar: base64String,
          profile_photo: base64String,
          avatarUrl: base64String 
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      if (typeof setAdminData === 'function') {
        // Build payload including the new password if it was filled in the modal
        const finalPayload = {
          ...editForm,
          password: passwordForm.newPassword || undefined
        };
        await setAdminData(finalPayload); 
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

 const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert("Please fill all password fields.");
      return;
    }
  
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long!");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match!");
      return;
    }

    try {
      if (typeof setAdminData === 'function') {
        // Gather all existing state data plus the new password to send to App.js
        const updatedPayload = {
          ...editForm,
          name: editForm.name || adminData.name,
          phone: editForm.phone || adminData.phone,
          email: editForm.email || adminData.email,
          profile_photo: editForm.profile_photo || adminData.profile_photo,
          password: passwordForm.newPassword
        };

        await setAdminData(updatedPayload); 
        
        setIsPasswordModalOpen(false);
        setPasswordError('');
        // Keep the newPassword state temporarily so handleSaveProfile can also access it if needed
      }
    } catch (err) {
      alert("Failed to change password in database.");
    }
  };
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6 px-1 sm:px-0 pb-4 relative overflow-x-hidden">
      {/* <div>
        <h2 className={`text-xl font-black tracking-tight ${theme.textTitle}`}>Admin Profile</h2>
      </div> */}

      <form onSubmit={handleSaveProfile} className={`p-3 sm:p-6 rounded-2xl border relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

        {/* Responsive Header: Ensures the edit button and profile content fit well on small screens */}
<div className="flex flex-col items-center gap-4 pb-6 pt-2 sm:flex-row sm:items-center sm:gap-6 sm:pt-0 border-b border-slate-500/10">
  
  {/* Relative Container: Profile */}
  <div className="relative group shrink-0">
    <div 
      onClick={handleAvatarClick}
      className={`h-24 w-24 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center border border-slate-500/20 shadow-lg shadow-amber-500/5 ${isEditing ? 'cursor-pointer ring-4 ring-amber-500/30' : ''}`}
    >
      {/*su*/}
      <img 
      src={isEditing ? (editForm.avatar || editForm.profile_photo || editForm.avatarUrl) : (adminData.avatar || adminData.profile_photo || adminData.avatarUrl)} 
      alt="Admin Avatar" 
      className="w-full h-full object-cover" 
    />
      {/*su*/}
    </div>

    {/* (Camera Overlap for Editing State) */}
    {isEditing && (
      <div onClick={handleAvatarClick} className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-[10px] text-white font-black opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer pointer-events-none">
        <Camera size={16} className="mb-0.5 text-amber-400" /> Change
      </div>
    )}
     {/*su*/}
    {/* Facebook Active Status Edit Icon */}
    {!isEditing && (
      
      <button
        type="button"
        
        onClick={() => { setEditForm({ ...adminData, avatar: adminData.avatar || adminData.profile_photo || adminData.avatarUrl }); setIsEditing(true); }}
        className="absolute bottom-0 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 transition-all border-2 border-white dark:border-slate-900 cursor-pointer"
        aria-label="Edit profile"
      >
        <Edit2 size={13} />
      </button>
    )}
  </div>
  
  <div className="w-full text-center sm:text-left space-y-1.5 min-w-0">
    <h3 className={`text-lg font-black break-words ${theme.textTitle}`}>{isEditing ? editForm.name : adminData.name}</h3>
    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
      {adminData.role}
    </span>
  </div>
</div>
        {/* Form Inputs */}
        <div className="grid grid-cols-1 gap-4 pt-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-500/5 min-w-0">
            <User size={16} className="text-amber-500 shrink-0" />
            <div className="w-full min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Full Name</p>
              {isEditing ? (
                <input type="text" name="name" value={editForm.name} onChange={handleInputChange} required className={`w-full bg-transparent border-b text-xs font-bold py-0.5 focus:outline-none focus:border-amber-500 ${isDarkMode ? 'border-slate-700 text-white' : 'border-slate-300 text-slate-900'}`} />
              ) : (
                <p className={`text-xs font-bold ${theme.textTitle}`}>{adminData.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-500/5 min-w-0">
            <Phone size={16} className="text-amber-500 shrink-0" />
            <div className="w-full min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Phone Number</p>
              {isEditing ? (
                <input type="tel" inputMode="tel" name="phone" value={editForm.phone} onChange={handleInputChange} required className={`w-full bg-transparent border-b text-xs font-bold py-0.5 focus:outline-none focus:border-amber-500 ${isDarkMode ? 'border-slate-700 text-white' : 'border-slate-300 text-slate-900'}`} />
              ) : (
                <p className={`text-xs font-bold break-all ${theme.textTitle}`}>{adminData.phone}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-500/5 min-w-0">
            <Mail size={16} className="text-amber-500 shrink-0" />
            <div className="w-full min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Email Address</p>
              {isEditing ? (
                <input type="email" name="email" value={editForm.email} onChange={handleInputChange} required className={`w-full bg-transparent border-b text-xs font-bold py-0.5 focus:outline-none focus:border-amber-500 ${isDarkMode ? 'border-slate-700 text-white' : 'border-slate-300 text-slate-900'}`} />
              ) : (
                <p className={`text-xs font-bold break-all ${theme.textTitle}`}>{adminData.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Responsive Footer Actions: Stacks on mobile viewports */}
        <div className="mt-6 pt-4 border-t border-slate-500/10 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <button type="button" onClick={() => setIsPasswordModalOpen(true)} className={`w-full sm:w-auto justify-center px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
            <KeyRound size={14} className="text-amber-500" /> Change Password
          </button>

          {isEditing && (
            <div className="flex gap-2 w-full sm:w-auto">
              <button type="button" onClick={() => setIsEditing(false)} className={`flex-1 sm:flex-none justify-center px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1 transition-all cursor-pointer ${isDarkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}><X size={14} /> Cancel</button>
              <button type="submit" className="flex-1 sm:flex-none justify-center px-4 py-2 text-xs font-extrabold rounded-xl bg-emerald-500 text-white hover:brightness-110 transition-all flex items-center gap-1 shadow-md shadow-emerald-500/15 cursor-pointer"><Check size={14} /> Save Changes</button>
            </div>
          )}
        </div>
      </form>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)} />
          <div className={`relative w-full max-w-md p-5 sm:p-6 rounded-2xl border shadow-2xl transition-all animate-in zoom-in-95 duration-150 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-500/10">
              <div className="flex items-center gap-2 text-amber-500"><ShieldAlert size={18} /><span className="text-sm font-black tracking-tight">Change Password</span></div>
              <button type="button" onClick={() => setIsPasswordModalOpen(false)} className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}><X size={16} /></button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${theme.textMuted}`}>Old Password</label>
                <input type="password" required value={passwordForm.oldPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))} className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-amber-500 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} placeholder="••••••••" />
              </div>
              <div>
  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${theme.textMuted}`}>New Password</label>
  <input type="password" required value={passwordForm.newPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))} className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-amber-500 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} placeholder="Minimum 8 characters" />
  
  {passwordError && (
    <p className="text-rose-500 text-[11px] font-semibold mt-1">
      {passwordError}
    </p>
  )}
</div>
              <div>
                <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${theme.textMuted}`}>Confirm New Password</label>
                <input type="password" required value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))} className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-amber-500 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} placeholder="Re-enter new password" />
                
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className={`px-4 py-2 text-xs font-bold rounded-xl border cursor-pointer ${isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}>Dismiss</button>
                <button type="submit" className="px-4 py-2 text-xs font-extrabold rounded-xl bg-amber-500 text-slate-950 hover:brightness-110 transition-all shadow-md shadow-amber-500/15 cursor-pointer">Change</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}