import React, { useState } from 'react';
import { Mail, Lock, User, Phone, X } from 'lucide-react';
import '../App.css';

export default function AuthPage({ onLoginSuccess, onClose }) {
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
        onLoginSuccess('admin', { name: "System Admin", phone: "Official" });
      } else {
        onLoginSuccess('user', { name: name || "User Account", phone: phone || "09xxxxxxxxx" });
      }
    }
  };

  return (
    <div className="bg-indigo-950 border border-indigo-800/60 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
      
      {/* CLOSE BUTTON*/}
      <button 
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 text-indigo-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-indigo-900/50"
      >
        <X size={20} />
      </button>
      
      {/* Logo */}
      <div className="text-center mb-6">
        <span className="text-3xl font-black tracking-wider text-yellow-400">PAY<span className="text-white">2</span>PAY</span>
        <p className="text-xs text-indigo-200/80 mt-2">
          {isRegister ? 'Create a new account to start exchanging' : 'Secure Multi-Payment Exchange Portal'}
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-indigo-900/60 p-1 rounded-xl mb-6 border border-indigo-800/40">
        <button 
          type="button"
          onClick={() => setIsRegister(false)}
          className={`flex-1 text-center py-2 text-sm font-bold rounded-lg transition ${!isRegister ? 'bg-yellow-400 text-slate-950' : 'text-indigo-200 hover:text-white'}`}
        >
          Sign In
        </button>
        <button 
          type="button"
          onClick={() => setIsRegister(true)}
          className={`flex-1 text-center py-2 text-sm font-bold rounded-lg transition ${isRegister ? 'bg-yellow-400 text-slate-950' : 'text-indigo-200 hover:text-white'}`}
        >
          Register
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {isRegister && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-indigo-300 uppercase mb-1">Full Name</label>
              <div className="flex items-center bg-indigo-900/50 border border-indigo-800/60 rounded-lg px-2.5 py-1.5">
                <User size={14} className="text-indigo-400 mr-1.5 flex-shrink-0" />
                <input required type="text" placeholder="Maung Maung" value={name} onChange={(e)=>setName(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none text-white placeholder-indigo-400/50" />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-indigo-300 uppercase mb-1">Phone Number</label>
              <div className="flex items-center bg-indigo-900/50 border border-indigo-800/60 rounded-lg px-2.5 py-1.5">
                <Phone size={14} className="text-indigo-400 mr-1.5 flex-shrink-0" />
                <input required type="tel" placeholder="09xxxxxxxxx" value={phone} onChange={(e)=>setPhone(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none text-white placeholder-indigo-400/50" />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-indigo-300 uppercase mb-1">Email Address</label>
          <div className="flex items-center bg-indigo-900/50 border border-indigo-800/60 rounded-lg px-2.5 py-1.5">
            <Mail size={14} className="text-indigo-400 mr-1.5 flex-shrink-0" />
            <input required type="email" placeholder="user@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none text-white placeholder-indigo-400/50" />
          </div>
          {!isRegister && <span className="text-[9px] text-amber-300/80 mt-0.5 block">💡 Admin Test: admin@pay2pay.com</span>}
        </div>

        <div className={isRegister ? "grid grid-cols-2 gap-2" : "space-y-3"}>
          <div>
            <label className="block text-[10px] font-bold text-indigo-300 uppercase mb-1">Password</label>
            <div className="flex items-center bg-indigo-900/50 border border-indigo-800/60 rounded-lg px-2.5 py-1.5">
              <Lock size={14} className="text-indigo-400 mr-1.5 flex-shrink-0" />
              <input required type="password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none text-white placeholder-indigo-400/50" />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-[10px] font-bold text-indigo-300 uppercase mb-1">Confirm Password</label>
              <div className="flex items-center bg-indigo-900/50 border border-indigo-800/60 rounded-lg px-2.5 py-1.5">
                <Lock size={14} className="text-indigo-400 mr-1.5 flex-shrink-0" />
                <input required type="password" placeholder="••••••••" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="bg-transparent text-xs w-full focus:outline-none text-white placeholder-indigo-400/50" />
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="w-full bg-yellow-400 text-slate-950 font-bold py-2.5 rounded-lg hover:bg-yellow-300 transition text-xs shadow-md shadow-yellow-400/5 mt-1.5 tracking-wide uppercase">
          {isRegister ? 'Create Account' : 'Sign In'}
        </button>
      </form>

    </div>
  );
}