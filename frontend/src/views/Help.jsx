import React, { useContext } from 'react';
import { ThemeContext } from '../App.jsx';

export default function Help() {
  const { darkMode } = useContext(ThemeContext);
  
  const faqs = [
    { q: "What is the processing time?", a: "Most exchanges are validated manually within 5 to 15 minutes of sending." },
    { q: "What if I input an incorrect transaction code?", a: "Please hold your payment screenshot tightly and contact our Support hotlines immediately." },
    { q: "Is there a limit on remittance exchanges?", a: "Standard limits scale between 1,000 MMK and 500,000 MMK dynamically based on current pool liquidity levels." }
  ];

  return (
    <div className={`max-w-3xl mx-auto w-full animate-fadeIn border rounded-3xl p-6 md:p-8 shadow-2xl transition-colors duration-300 ${darkMode ? 'bg-slate-950 border-slate-800/40' : 'bg-white border-slate-200'}`}>
      <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-amber-500 dark:text-yellow-400 tracking-tight">Help & FAQs Center</h2>
      
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className={`p-4 border rounded-xl transition-colors duration-300 ${darkMode ? 'bg-slate-900/40 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
            <h4 className="font-bold text-sm text-amber-600 dark:text-yellow-400/90 mb-1.5">💡 {faq.q}</h4>
            <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-200/80' : 'text-slate-600'}`}>{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}