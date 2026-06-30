import React, { useState, useContext } from 'react';
import { Mail, Lock, User, Phone, X } from 'lucide-react';
import { ThemeContext } from '../App.jsx';
import '../App.css';

export default function AuthPage({ onLoginSuccess, onClose }) {
  const { darkMode } = useContext(ThemeContext);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isRegister) {
      if (password !== confirmPassword) {
        alert("⚠️ Passwords do not match! Please check and try again.");
        return;
      }

      alert("Registration Successful! Please login.");
      setIsRegister(false);
      setConfirmPassword('');
    } else {
      if (email.toLowerCase() === 'admin@pay2pay.com') {
        // onLoginSuccess('admin', { name: "System Admin", phone: "Official" });
        onLoginSuccess('admin', { name: "System Admin", phone: "Official" });
      } else {
        onLoginSuccess('user', { name: name || "User Account", phone: phone || "09xxxxxxxxx" });
      }
    }
  };

  return (
    <div className={`border rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative ${darkMode ? 'bg-slate-950 border-slate-800/60 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
      
      {/* CLOSE BUTTON*/}
      <button 
        type="button"
        onClick={onClose}
        className={`absolute right-4 top-4 transition-colors p-1 rounded-lg ${darkMode ? 'text-slate-300 hover:text-white hover:bg-slate-900/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
      >
        <X size={20} />
      </button>
      
      {/* Logo */}
      <div className="text-center mb-6">
        <span className="text-3xl font-black tracking-wider text-amber-500 dark:text-yellow-400">PAY<span className={darkMode ? 'text-white' : 'text-slate-900'}>2</span>PAY</span>
        <p className={`text-xs mt-2 ${darkMode ? 'text-slate-300/70' : 'text-slate-500'}`}>
          {isRegister ? 'Create a new account to start exchanging' : 'Secure Multi-Payment Exchange Portal'}
        </p>
      </div>

      {/* Tab Toggle */}
      <div className={`flex p-1 rounded-xl mb-6 border ${darkMode ? 'bg-slate-900/60 border-slate-800/40' : 'bg-slate-100 border-slate-200'}`}>
        <button 
          type="button"
          onClick={() => setIsRegister(false)}
          className={`flex-1 text-center py-2 text-sm font-bold rounded-lg transition ${!isRegister ? 'bg-amber-500 dark:bg-yellow-400 text-slate-950' : darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Sign In
        </button>
        <button 
          type="button"
          onClick={() => setIsRegister(true)}
          className={`flex-1 text-center py-2 text-sm font-bold rounded-lg transition ${isRegister ? 'bg-amber-500 dark:bg-yellow-400 text-slate-950' : darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Register
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {isRegister && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`block text-[10px] font-bold uppercase mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Full Name</label>
              <div className={`flex items-center border rounded-lg px-2.5 py-1.5 ${darkMode ? 'bg-slate-950/50 border-slate-800/60' : 'bg-slate-50 border-slate-300'}`}>
                <User size={14} className="text-slate-300 mr-1.5 flex-shrink-0" />
                <input required type="text" placeholder="Maung Maung" value={name} onChange={(e)=>setName(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none text-current placeholder-slate-400" />
              </div>
            </div>
            
            <div>
              <label className={`block text-[10px] font-bold uppercase mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Phone Number</label>
              <div className={`flex items-center border rounded-lg px-2.5 py-1.5 ${darkMode ? 'bg-slate-950/50 border-slate-800/60' : 'bg-slate-50 border-slate-300'}`}>
                <Phone size={14} className="text-slate-300 mr-1.5 flex-shrink-0" />
                <input required type="tel" placeholder="09xxxxxxxxx" value={phone} onChange={(e)=>setPhone(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none text-current placeholder-slate-400" />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className={`block text-[10px] font-bold uppercase mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Email Address</label>
          <div className={`flex items-center border rounded-lg px-2.5 py-1.5 ${darkMode ? 'bg-slate-950/50 border-slate-800/60' : 'bg-slate-50 border-slate-300'}`}>
            <Mail size={14} className="text-slate-300 mr-1.5 flex-shrink-0" />
            <input required type="email" placeholder="user@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none text-current placeholder-slate-400" />
          </div>
          {!isRegister && <span className="text-[9px] text-amber-600 dark:text-amber-300 mt-0.5 block">💡 Admin Test: admin@pay2pay.com</span>}
        </div>

        <div className={isRegister ? "grid grid-cols-2 gap-2" : "space-y-3"}>
          <div>
            <label className={`block text-[10px] font-bold uppercase mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Password</label>
            <div className={`flex items-center border rounded-lg px-2.5 py-1.5 ${darkMode ? 'bg-slate-900/60 border-slate-800/60' : 'bg-slate-50 border-slate-300'}`}>
              <Lock size={14} className="text-amber-300 mr-1.5 flex-shrink-0" />
              <input required type="password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none text-current placeholder-slate-400" />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className={`block text-[10px] font-bold uppercase mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Confirm Password</label>
              <div className={`flex items-center border rounded-lg px-2.5 py-1.5 ${darkMode ? 'bg-slate-900/60 border-slate-800/60' : 'bg-slate-50 border-slate-300'}`}>
                <Lock size={14} className="text-amber-300 mr-1.5 flex-shrink-0" />
                <input required type="password" placeholder="••••••••" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none text-current placeholder-slate-400" />
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="w-full bg-amber-500 dark:bg-yellow-400 text-slate-950 font-bold py-2.5 rounded-lg hover:opacity-90 transition text-xs shadow-md mt-1.5 tracking-wide uppercase">
          {isRegister ? 'Create Account' : 'Sign In'}
        </button>
      </form>

    </div>
  );
}