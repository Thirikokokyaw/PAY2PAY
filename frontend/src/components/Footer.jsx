import React, { useContext } from 'react';
import { ThemeContext } from '../App.jsx';

export default function Footer() {
  const { darkMode } = useContext(ThemeContext);
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t mt-16 transition-colors duration-300 ${darkMode ? 'bg-black border-slate-800' : 'bg-amber-500 border-amber-600'}`}>
      <div className={`max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs ${darkMode ? 'text-slate-300' : 'text-slate-950'}`}>
        
        { }
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 w-full md:w-auto">
          <div>
            <p className={`font-bold mb-1.5 tracking-wide uppercase text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-950'}`}>Customer Support</p>
            <p className={`flex items-center gap-2 transition-colors ${darkMode ? 'hover:text-slate-200' : 'hover:text-slate-900'}`}>
              {  }
              <svg className="w-3.5 h-3.5 inline-block text-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.806-5.194-4.177-7-7l1.293-.97c.363-.271.527-.834.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              +95 9 969 977 034
            </p>
            <p className={`flex items-center gap-2 mt-1 transition-colors ${darkMode ? 'hover:text-slate-200' : 'hover:text-slate-900'}`}>
              { }
              <svg className="w-3.5 h-3.5 inline-block text-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0l-7.5-4.615a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              support@pay2paymm.com
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
              {  }
              <svg className="w-3.5 h-3.5 inline-block text-current" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
                <path d="M12 2a14.5 14.5 0 0 1 0 20 14.5 14.5 0 0 1 0-20" />
              </svg>
              pay2paymm.com
            </a>
            <a 
              href="https://www.youtube.com/@Pay2Pay-mm" 
              target="_blank" 
              rel="noreferrer" 
              className={`flex items-center gap-2 mt-1 ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-950 hover:text-slate-800'}`}
            >
              {  }
              <svg className="w-3.5 h-3.5 inline-block text-current" fill="currentColor" viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Pay2Pay-mm
            </a>
          </div>
        </div>

        { }
        <div className="text-left md:text-right font-medium pt-4 md:pt-0 border-t border-slate-700 md:border-none w-full md:w-auto text-[11px]">
          <p className={darkMode ? 'text-slate-400' : 'text-slate-950'}>&copy; {currentYear} PAY2PAY Myanmar. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
