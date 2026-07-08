import React, { useContext } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../App.jsx';

export default function Navigation({ 
  activeView, 
  setActiveView, 
  navigateToView,
  userRole, 
  userInfo, 
  setIsAuthOpen, 
  isMenuOpen, 
  setIsMenuOpen, 
  logo 
}) {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  // Black & White Theme Mapping
  const themeClass = darkMode 
    ? 'bg-zinc-950 border-zinc-900 text-white' 
    : 'bg-white border-zinc-200 text-zinc-900 shadow-sm';

  return (
    <nav className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors duration-200 ${themeClass}`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* 💳 LOGO AREA */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveView('home')}>
          {!logo || logo.includes('placehold.co') ? (
            <span className="text-xl md:text-2xl font-black tracking-wider text-amber-500">
              PAY<span className={darkMode ? 'text-white' : 'text-zinc-900'}>2</span>PAY
            </span>
          ) : (
            <img 
              src={logo} 
              alt="PAY2PAY Logo" 
              className="h-10 md:h-12 w-auto object-contain transition-all"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<span class="text-xl md:text-2xl font-black tracking-wider text-amber-500">PAY<span class="text-white">2</span>PAY</span>';
              }}
            />
          )}
        </div>

        {/* 🖥️ DESKTOP ROUTING LINKS & THEME SWITCHER */}
        <div className="hidden md:flex items-center space-x-8 font-medium">
          <button onClick={() => setActiveView('home')} className={`transition-all font-bold text-xs uppercase tracking-wider ${activeView === 'home' ? 'text-amber-500' : (darkMode ? 'text-zinc-400 hover:text-amber-500' : 'text-zinc-600 hover:text-zinc-900')}`}>Home</button>
          <button onClick={() => navigateToView?.('exchange') || setActiveView('exchange')} className={`transition-all font-bold text-xs uppercase tracking-wider ${activeView === 'exchange' ? 'text-amber-500' : (darkMode ? 'text-zinc-400 hover:text-amber-500' : 'text-zinc-600 hover:text-zinc-900')}`}>Exchange</button>
          <button onClick={() => setActiveView('about')} className={`transition-all font-bold text-xs uppercase tracking-wider ${activeView === 'about' ? 'text-amber-500' : (darkMode ? 'text-zinc-400 hover:text-amber-500' : 'text-zinc-600 hover:text-zinc-900')}`}>About</button>
          <button onClick={() => setActiveView('help')} className={`transition-all font-bold text-xs uppercase tracking-wider ${activeView === 'help' ? 'text-amber-500' : (darkMode ? 'text-zinc-400 hover:text-amber-500' : 'text-zinc-600 hover:text-zinc-900')}`}>Help</button>
          
          {/* INLINE THEME SWITCH PROTOCOL BUTTON (B&W Style) */}
          <button 
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl transition border group ${darkMode ? 'bg-zinc-900 border-zinc-800 text-amber-500 hover:bg-zinc-800' : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200'}`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={14} className="group-hover:rotate-45 transition-transform" /> : <Moon size={14} className="group-hover:-rotate-12 transition-transform" />}
          </button>

          {/* User Profile Info OR Admin Premium Gold Login Button */}
          {userRole === 'user' ? (
            <button onClick={() => setActiveView('profile')} className={`flex items-center space-x-2.5 border px-4 py-1.5 rounded-xl transition-all ${activeView === 'profile' ? 'border-amber-500 text-amber-500 shadow-sm' : (darkMode ? 'bg-zinc-900 border-zinc-800 text-white hover:border-amber-500' : 'bg-zinc-50 border-zinc-300 text-zinc-800 hover:bg-zinc-100 hover:border-amber-500')}`}>
              <img src={userInfo.avatar} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-amber-500" />
              <span className="text-xs font-bold">{userInfo.name}</span>
            </button>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black px-5 py-2.5 rounded-xl transition-all shadow-sm text-xs uppercase tracking-wider">
              Sign In
            </button>
          )}
        </div>

        {/* 📱 MOBILE MENU TOGGLE */}
        <div className="md:hidden flex items-center space-x-3">
          <button 
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border ${darkMode ? 'bg-zinc-900 border-zinc-800 text-amber-500' : 'bg-zinc-100 border-zinc-300 text-zinc-700'}`}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`transition-colors ${darkMode ? 'text-white hover:text-amber-500' : 'text-zinc-800 hover:text-zinc-900'}`}>
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* 📱 MOBILE EXPANDED MENU */}
      {isMenuOpen && (
        <div className={`md:hidden border-t px-4 py-5 space-y-4 flex flex-col shadow-inner animate-fadeIn ${darkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-200'}`}>
          <button onClick={() => { setActiveView('home'); setIsMenuOpen(false); }} className={`text-left font-bold text-xs uppercase tracking-wide py-1 ${activeView === 'home' ? 'text-amber-500' : (darkMode ? 'text-zinc-400' : 'text-zinc-600')}`}>Home</button>
          <button onClick={() => { (navigateToView?.('exchange') || setActiveView('exchange')); setIsMenuOpen(false); }} className={`text-left font-bold text-xs uppercase tracking-wide py-1 ${activeView === 'exchange' ? 'text-amber-500' : (darkMode ? 'text-zinc-400' : 'text-zinc-600')}`}>Exchange</button>
          <button onClick={() => { setActiveView('about'); setIsMenuOpen(false); }} className={`text-left font-bold text-xs uppercase tracking-wide py-1 ${activeView === 'about' ? 'text-amber-500' : (darkMode ? 'text-zinc-400' : 'text-zinc-600')}`}>About</button>
          <button onClick={() => { setActiveView('help'); setIsMenuOpen(false); }} className={`text-left font-bold text-xs uppercase tracking-wide py-1 ${activeView === 'help' ? 'text-amber-500' : (darkMode ? 'text-zinc-400' : 'text-zinc-600')}`}>Help</button>
          
          {userRole === 'user' ? (
            <button onClick={() => { setActiveView('profile'); setIsMenuOpen(false); }} className={`flex items-center space-x-3 p-3 rounded-xl text-left border ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-800'}`}>
              <img src={userInfo.avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-amber-500" />
              <span className="text-xs font-bold">{userInfo.name} (Profile)</span>
            </button>
          ) : (
            <button onClick={() => { setIsAuthOpen(true); setIsMenuOpen(false); }} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black py-3 rounded-xl w-full text-center text-xs uppercase tracking-wider shadow-sm">
              Login / Register
            </button>
          )}
        </div>
      )}
    </nav>
  );
}