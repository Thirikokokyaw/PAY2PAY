import React, { useState, useEffect, useRef, useContext } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { ThemeContext } from '../App.jsx';

export default function AIChatBot() {
  const { darkMode } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! Welcome to PAY2PAY AI Support. How can I assist you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getAIResponse = (userText) => {
    const text = userText.toLowerCase();
    if (text.includes("wave")) return "Wave Pay asset settling transfers safely to other banking endpoints within 5 minutes completely free of external premiums.";
    if (text.includes("kpay") || text.includes("kbz")) return "All official KBZPay channels are operational. Settlement conversions are running smoothly at competitive rates.";
    if (text.includes("fee") || text.includes("rate") || text.includes("percent")) return "Our processing system utilizes a flat 2% overhead deduction fee per transaction executed.";
    if (text.includes("hello") || text.includes("hi") || text.includes("hey")) return "Greetings! Feel free to ask any questions regarding your digital asset remittance requests.";
    if (text.includes("time") || text.includes("long") || text.includes("duration")) return "Standard system processing clearing routinely settles within 10 minutes.";
    if (text.includes("open") || text.includes("service") || text.includes("hours")) return "Our digital asset routing gateway is running 24/7/365.";
    if (text.includes("pending") || text.includes("delay") || text.includes("wait")) return "Our administrative nodes are cross-checking current transactions. Please hold on momentarily.";
    if (text.includes("received") || text.includes("success") || text.includes("done")) return "Fantastic! Thank you for using PAY2PAY local exchange settlement networks.";
    if (text.includes("exchange") || text.includes("swap")) return "Immediate swapping and pool liquidations are available directly in the Exchange panel.";
    if (text.includes("thanks") || text.includes("thank you")) return "You are very welcome! Let us know if you need anything else.";
    if (text.includes("bye") || text.includes("goodbye")) return "Have an incredible day ahead! Goodbye.";
    if (text.includes("refund")) return "For remittance discrepancies, please keep your voucher code secure and contact our Main Administrators immediately.";
    if (text.includes("cancel")) return "Transactions pushed downstream into processing nodes cannot be revoked or canceled.";
    if (text.includes("error") || text.includes("bug")) return "In case of UI errors, please grab a screenshot and submit it directly to our customer support channels.";
    if (text.includes("lock")) return "If your account gets locked out, contact our system administration for account manual override.";
    if (text.includes("weekend") || text.includes("saturday") || text.includes("sunday")) return "Yes, we handle system transactions and clear payouts through the weekend without interruption.";
    if (text.includes("support") || text.includes("help")) return "Our support team can be reached anytime via the details listed at our page footer area.";

    return "We have recorded your inquiry. A support specialist will respond to your transaction case details shortly.";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botReply = {
        id: Date.now() + 1,
        text: getAIResponse(currentInput),
        isBot: true
      };
      setMessages(prev => [...prev, botReply]);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans antialiased">
      
      {/* CHAT TOGGLE BUTTON */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center p-4 rounded-2xl bg-slate-900 dark:bg-amber-400 text-amber-400 dark:text-slate-950 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-800 dark:border-amber-300/50 hover:scale-105 active:scale-95 transition-all duration-300 group"
        >
          <MessageSquare size={22} className="group-hover:rotate-6 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 dark:bg-rose-500 animate-pulse"></span>
        </button>
      )}

      {/* MODERN AI CHATBOX WINDOW */}
      {isOpen && (
        <div className={`w-[350px] md:w-[400px] h-[550px] flex flex-col rounded-3xl border backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-300 overflow-hidden ${
          darkMode 
            ? 'bg-slate-950/90 border-slate-800/60 shadow-black/40' 
            : 'bg-white/95 border-slate-100 shadow-slate-200'
        }`}>
          
          {/* Header */}
          <div className={`p-5 flex items-center justify-between border-b ${darkMode ? 'border-slate-800/40' : 'border-slate-100'}`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-amber-400/10 dark:bg-amber-400/20 text-amber-500 dark:text-amber-400">
                <Sparkles size={18} className="animate-pulse" />
              </div>
              <div>
                <h4 className={`text-sm font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  PAY2PAY Assistant
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">AI Node Active</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className={`p-1.5 rounded-xl transition-all duration-200 ${
                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-grow p-5 overflow-y-auto space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all ${
                  msg.isBot 
                    ? (darkMode 
                        ? 'bg-slate-900/60 text-slate-200 rounded-tl-none border border-slate-800/40' 
                        : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100') 
                    : 'bg-slate-900 dark:bg-amber-400 text-slate-100 dark:text-slate-950 font-medium rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className={`px-4 py-3.5 rounded-2xl rounded-tl-none flex items-center space-x-1.5 border ${
                  darkMode ? 'bg-slate-900/40 border-slate-800/40' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-duration:0.8s]"></div>
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className={`p-4 border-t flex items-center gap-2.5 ${darkMode ? 'border-slate-800/40 bg-slate-950/40' : 'border-slate-100 bg-white'}`}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..." 
              className={`flex-grow text-[13px] border rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none ${
                darkMode 
                  ? 'bg-slate-900/50 border-slate-800/80 text-white placeholder-slate-500 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10'
              }`}
            />
            <button 
              type="submit"
              className="p-3 rounded-xl bg-slate-900 dark:bg-amber-400 text-amber-400 dark:text-slate-950 hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-md"
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}