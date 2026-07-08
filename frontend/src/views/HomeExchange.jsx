import React, { useContext } from 'react';
import { Zap, Shield, Percent, ArrowRight } from 'lucide-react';
import { ThemeContext } from '../App.jsx';
import shwedagonImg from '../assets/Shwedagon-Pagoda.jpg';

export default function HomeExchange({ navigateToView }) {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className="animate-fadeIn space-y-16 w-full -mt-8">
      
      {/* TRUE FULL-SCREEN HERO SECTION */}
      <div 
        className="relative w-full min-h-[calc(100vh-4rem)] flex items-center justify-center text-center px-4 shadow-2xl transition-all duration-500"
        style={{ 
          backgroundImage: darkMode 
            ? `linear-gradient(to bottom, rgba(16, 24, 48, 0.55), rgba(15, 21, 46, 0.9)), url(${shwedagonImg})`
            : `linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(241, 245, 249, 0.95)), url(${shwedagonImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-2xl space-y-5 py-12">
          <div className={`inline-block text-[11px] px-4 py-1.5 rounded-full font-bold uppercase tracking-wider animate-pulse backdrop-blur-sm ${darkMode ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-amber-500/20 text-amber-700 border border-amber-500/40'}`}>
            Myanmar's Premier Digital Asset Gateway
          </div>
          
          <h1 className={`text-2xl md:text-4xl font-extrabold tracking-normal leading-snug drop-shadow-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Fast, Transparent & Secure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-cyan-600 dark:from-amber-400 dark:via-yellow-300 dark:to-cyan-300">
              Local Payment Settlements
            </span>
          </h1>
          
          <p className={`text-xs md:text-base font-medium max-w-lg mx-auto leading-relaxed drop-shadow ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>
            Instantly swap resources across WavePay, KBZ Pay, CB Pay, AYA Pay, UAB Pay & TrueMoney with zero slippage.
          </p>
          
          <div className="pt-4">
            <button 
              onClick={() => navigateToView?.('exchange')}
              className="group bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold px-8 py-3.5 rounded-full hover:from-amber-400 hover:to-cyan-500 hover:scale-103 transition-all duration-300 shadow-xl active:scale-95 flex items-center gap-2 mx-auto text-sm tracking-wider"
            >
              START EXCHANGE NOW
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS + VIDEO SECTION */}
      <div className="max-w-6xl mx-auto px-4 w-full space-y-10 pb-16">
        <div className={`border rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md ${darkMode ? 'bg-slate-950/80 border-slate-800/40' : 'bg-white border-slate-200'}`}>
          <h3 className="text-xl font-bold text-amber-500 dark:text-yellow-400 mb-8 flex items-center gap-3">
            <span className="w-1.5 h-5 bg-amber-500 dark:bg-yellow-400 rounded-full inline-block"></span>
            How It Works
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className={`space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] ${darkMode ? 'before:bg-slate-600/30' : 'before:bg-slate-300'}`}>
              
              <div className="flex gap-5 relative items-start group">
                <div className="w-6 h-6 rounded-full bg-amber-500 dark:bg-yellow-400 text-slate-950 text-xs font-black flex items-center justify-center shrink-0 mt-0.5 z-10 shadow-md">1</div>
                <div>
                  <h4 className={`text-sm font-bold group-hover:text-amber-500 dark:group-hover:text-yellow-300 transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>Sign In/Sign Up First </h4>
                  <p className={`text-xs mt-1.5 leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                    Create a secure account using your phone number and email. If you already have an account, simply sign in.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 relative items-start group">
                <div className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 mt-0.5 z-10 border ${darkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-200 text-slate-700 border-slate-300'}`}>2</div>
                <div>
                  <h4 className={`text-sm font-bold group-hover:text-amber-500 dark:group-hover:text-yellow-300 transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>Set Gateway & Make Deposit</h4>
                  <p className={`text-xs mt-1.5 leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                    Select your source and destination wallets, enter your transfer amount, and click "Proceed to Payment." Then, simply scan the provided QR code or use the account details to transfer the funds from your wallet.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 relative items-start group">
                <div className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 mt-0.5 z-10 border ${darkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-200 text-slate-700 border-slate-300'}`}>3</div>
                <div>
                  <h4 className={`text-sm font-bold group-hover:text-amber-500 dark:group-hover:text-yellow-300 transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>Submit Settlement Details </h4>
                  <p className={`text-xs mt-1.5 leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                    Select your source and destination wallets, enter your transfer amount, and click "Proceed to Payment." Then, simply scan the provided QR code or use the account details to transfer the funds from your wallet.
                  </p>
                </div>
              </div>
            </div>


            <div className={`border rounded-2xl p-5 flex flex-col justify-center shadow-inner ${darkMode ? 'bg-slate-950/60 border-slate-800/60' : 'bg-slate-100 border-slate-200'}`}>
              <span className={`text-xs uppercase tracking-widest font-extrabold mb-3 block ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>🎬 User Guide Video</span>
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative shadow-2xl">
                <iframe 
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/pPx_1wIJLIo?autoplay=0&controls=1"
                  title="Pay2Pay Myanmar User Guide"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <span className={`text-xs mt-3 text-center font-medium ${darkMode ? 'text-slate-300/80' : 'text-slate-500'}`}>If you face any issues, please watch the video guide tutorial above.</span>
            </div>
          </div>
        </div>

        {/* WHY CHOOSE US */}
        <div className={`border rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md ${darkMode ? 'bg-slate-950/80 border-slate-800/40' : 'bg-white border-slate-200'}`}>
          <div className="mb-8">
            <h3 className="text-xl font-bold text-amber-500 dark:text-yellow-400 flex items-center gap-3">
              <span className="w-1.5 h-5 bg-amber-500 dark:bg-yellow-400 rounded-full inline-block"></span>
              Why Choose Us
            </h3>
            <p className={`text-xs mt-1 ${darkMode ? 'text-slate-200' : 'text-slate-500'}`}>Premium structural advantages running digital transactions over our nodes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className={`p-6 border rounded-2xl flex flex-col gap-4 transition-all duration-300 hover:border-amber-500 hover:-translate-y-1 shadow-md ${darkMode ? 'bg-slate-950/50 border-slate-800/40' : 'bg-slate-50 border-slate-200'}`}>
              <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl w-fit"><Zap size={22} /></div>
              <div>
                <h4 className={`text-sm font-bold uppercase tracking-wide ${darkMode ? 'text-white' : 'text-slate-800'}`}>Lightning Speed</h4>
                <p className={`text-xs mt-2 leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>Cross-checking algorithms are running constantly, executing clearing protocols within 10 minutes.</p>
              </div>
            </div>

            <div className={`p-6 border rounded-2xl flex flex-col gap-4 transition-all duration-300 hover:border-cyan-500 hover:-translate-y-1 shadow-md ${darkMode ? 'bg-slate-950/50 border-slate-800/40' : 'bg-slate-50 border-slate-200'}`}>
              <div className="p-3 bg-cyan-400/10 text-cyan-600 dark:text-cyan-400 rounded-xl w-fit"><Shield size={22} /></div>
              <div>
                <h4 className={`text-sm font-bold uppercase tracking-wide ${darkMode ? 'text-white' : 'text-slate-800'}`}>High Security</h4>
                <p className={`text-xs mt-2 leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>Backed with highly structured automated liquidity pools, keeping your digital transfers fully bulletproof.</p>
              </div>
            </div>

            <div className={`p-6 border rounded-2xl flex flex-col gap-4 transition-all duration-300 hover:border-emerald-500 hover:-translate-y-1 shadow-md ${darkMode ? 'bg-slate-950/50 border-slate-800/40' : 'bg-slate-50 border-slate-200'}`}>
              <div className="p-3 bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit"><Percent size={22} /></div>
              <div>
                <h4 className={`text-sm font-bold uppercase tracking-wide ${darkMode ? 'text-white' : 'text-slate-800'}`}>Minimal Overhead</h4>
                <p className={`text-xs mt-2 leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>Operating overhead structures are kept strictly flat at 2%, beating traditional offline P2P marketplace rates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}