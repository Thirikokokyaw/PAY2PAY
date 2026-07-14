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
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [errors, setErrors] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let valid = true;
    let newErrors = { phone: '', email: '', password: '' }; 

    if (isRegister) {
      const cleanedPhone = phone.replace(/\s+/g, '');
      if (cleanedPhone.length !== 10 && cleanedPhone.length !== 11) {
        newErrors.phone = "Phone number must be exactly 10 or 11 digits.";
        valid = false;
      }

      if (!email.includes('@') || !email.includes('.')) {
        newErrors.email = "Email must contain both '@' and '.' symbols.";
        valid = false;
      } else if (email.includes('@.') || email.includes('.@')) {
        newErrors.email = "Invalid Email: '@' and '.' cannot be adjacent.";
        valid = false;
      }

      if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long.";
        valid = false;
      } else if (password !== confirmPassword) {
        newErrors.password = "Comfirm Password do not match!";
        valid = false;
      }
    }

    setErrors(newErrors);
    if (!valid) return;

    if (isRegister) {
      try {
        const response = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, email, password })
        });
        const data = await response.json();
        
        if (response.ok) {
          setIsRegister(false);
          setConfirmPassword('');
          setErrors({ phone: '', email: '', password: '' });
        } else {
          if (data.message && data.message.toLowerCase().includes('email')) {
            setErrors(prev => ({ ...prev, email: data.message })); 
          } else {
            alert("❌ " + data.message);
          }
        }
      } catch (error) {
        alert("Server connection failed.");
      }
    } else {
   
      try {
        const response = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
          onLoginSuccess(data.role, {
            ...data.user,
            status: data.user.status,
            isBlacklisted: data.user.isBlacklisted
          });
        } else {
          if (data.message && data.message.toLowerCase().includes('blacklist')) {
            setShowBlacklistModal(true);
          } else {
            alert("Login Failed: " + data.message);
          }
        }
      } catch (error) {
        alert("Server connection failed.");
      }
    }
  };
  return (
    <div className={`border rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative ${darkMode ? 'bg-slate-950 border-slate-800/60 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
      
      {/* CLOSE BUTTON */}
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
          Sign Up
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
                <input required type="tel" placeholder="09xxxxxxxxx" value={phone} onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors(prev => ({ ...prev, phone: '' })); 
                  }} className="bg-transparent text-xs w-full focus:outline-none text-current placeholder-slate-400" />
                
              </div>
              {errors.phone && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.phone}</p>}
            </div>
          </div>
        )}

        <div>
          <label className={`block text-[10px] font-bold uppercase mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Email Address</label>
          <div className={`flex items-center border rounded-lg px-2.5 py-1.5 ${darkMode ? 'bg-slate-950/50 border-slate-800/60' : 'bg-slate-50 border-slate-300'}`}>
            <Mail size={14} className="text-slate-300 mr-1.5 flex-shrink-0" />
            <input required type="email" placeholder="user@example.com" value={email} onChange={(e) => {
                setEmail(e.target.value);
                setErrors(prev => ({ ...prev, email: '' }));
              }} className="bg-transparent text-xs w-full focus:outline-none text-current placeholder-slate-400" />
            
          </div>
          {errors.email && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.email}</p>}
          {!isRegister && <span className="text-[9px] text-amber-600 dark:text-amber-300 mt-0.5 block"></span>}
        </div>

        <div className={isRegister ? "grid grid-cols-2 gap-2" : "space-y-3"}>
         <div>
  <label className={`block text-[10px] font-bold uppercase mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Password</label>
  <div className={`flex items-center border rounded-lg px-2.5 py-1.5 ${darkMode ? 'bg-slate-950/50 border-slate-800/60' : 'bg-slate-50 border-slate-300'}`}>
    <Lock size={14} className="text-amber-300 mr-1.5 flex-shrink-0" />
    <input 
      required 
      type="password" 
      placeholder="••••••••" 
      value={password} 
      onChange={(e) => {
        setPassword(e.target.value);
        setErrors(prev => ({ ...prev, password: '' })); 
      }} 
      className="bg-transparent text-xs w-full focus:outline-none text-current placeholder-slate-400" 
    />
  </div>
</div>

          {isRegister && (
            <div>
              <label className={`block text-[10px] font-bold uppercase mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Confirm Password</label>
              <div className={`flex items-center border rounded-lg px-2.5 py-1.5 ${darkMode ? 'bg-slate-900/60 border-slate-800/60' : 'bg-slate-50 border-slate-300'}`}>
                <Lock size={14} className="text-amber-300 mr-1.5 flex-shrink-0" />
                <input required type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }} className="bg-transparent text-xs w-full focus:outline-none text-current placeholder-slate-400" />
               
              </div>
            </div>
          )}
          
        </div>
        {isRegister && errors.password && (
          <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.password}</p>
        )}

        <button type="submit" className="w-full bg-amber-500 dark:bg-yellow-400 text-slate-950 font-bold py-2.5 rounded-lg hover:opacity-90 transition text-xs shadow-md mt-1.5 tracking-wide uppercase">
          {isRegister ? 'Create Account' : 'Sign In'}
        </button>
      </form>
      {/*  CUSTOM BLACKLIST MODAL BOX */}
      {showBlacklistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl border transition-all transform scale-100 ${darkMode ? 'bg-slate-900 border-rose-500/20 text-white shadow-rose-950/20' : 'bg-white border-rose-100 text-slate-900 shadow-rose-100'}`}>
            
            
            <h3 className="text-base font-black uppercase tracking-widest text-rose-500 mb-2">
              Account Suspended
            </h3>
            
           
            <p className={`text-xs px-2 leading-relaxed mb-6 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Your account has been blacklisted due to a security violation.
            </p>
            
            {/* Premium Action Button */}
            <button
              type="button"
              onClick={() => setShowBlacklistModal(false)}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-3 rounded-xl transition-all duration-200 text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-[0.98]"
            >
              ok
            </button>
          </div>
        </div>
      )}

    </div>
  );
}