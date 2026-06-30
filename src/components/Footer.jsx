import React, { useContext } from 'react';
import { ThemeContext } from '../App.jsx';

export default function Footer() {
  const { darkMode } = useContext(ThemeContext);
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t mt-16 transition-colors duration-300 ${darkMode ? 'bg-black border-slate-800' : 'bg-amber-500 border-amber-600'}`}>
      <div className={`max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs ${darkMode ? 'text-slate-300' : 'text-slate-950'}`}>
        
        {/* Support Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 w-full md:w-auto">
          <div>
            <p className={`font-bold mb-1.5 tracking-wide uppercase text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-950'}`}>Customer Support</p>
            <p className={`flex items-center gap-2 transition-colors ${darkMode ? 'hover:text-slate-200' : 'hover:text-slate-900'}`}>
              <span>📞</span> +95 9 969 977 034
            </p>
            <p className={`flex items-center gap-2 mt-1 transition-colors ${darkMode ? 'hover:text-slate-200' : 'hover:text-slate-900'}`}>
              <span>✉️</span> support@pay2paymm.com
            </p>
          </div>
          
          <div>
            <p className={`font-bold mb-1.5 tracking-wide uppercase text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-950'}`}>Official Channels</p>
            <a 
              href="https://pay2paymm.com" 
              target="_blank" 
              rel="noreferrer" 
              className={`flex items-center gap-2 font-semibold ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-950 hover:text-slate-800'}`}
            >
              <span>🌐</span> pay2paymm.com
            </a>
            <a 
              href="https://www.youtube.com/watch?v=MJIFV9E6vuE" 
              target="_blank" 
              rel="noreferrer" 
              className={`flex items-center gap-2 mt-1 ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-950 hover:text-slate-800'}`}
            >
              <span>🎬</span> YouTube Channel
            </a>
          </div>
        </div>

        {/* Metadata */}
        <div className="text-left md:text-right font-medium pt-4 md:pt-0 border-t border-slate-700 md:border-none w-full md:w-auto text-[11px]">
          <p className={darkMode ? 'text-slate-400' : 'text-slate-950'}>&copy; {currentYear} PAY2PAY Myanmar. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}