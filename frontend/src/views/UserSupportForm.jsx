import React, { useState } from 'react';
import { Send, FileText, ArrowRight, Clock, MessageSquare } from 'lucide-react';

export default function UserSupportForm({ onSubmitTicket, darkMode }) {
  const [txnNo, setTxnNo] = useState('');
  const [fromPay, setFromPay] = useState('KBZPay');
  const [toPay, setToPay] = useState('Wave Pay');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const ticketData = {
      txnNo,
      fromPay,
      toPay,
      time,
      message
    };
    onSubmitTicket(ticketData);
    
    setTxnNo('');
    setTime('');
    setMessage('');
    alert("Your support ticket has been submitted to Admin node.");
  };

  return (
    <div className={`max-w-md w-full p-6 border rounded-2xl shadow-xl transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="text-amber-500" size={20} />
        <h3 className="text-sm font-black uppercase tracking-wide">Submit Support Ticket</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Transaction Number */}
        <div>
          <label className="block font-bold uppercase text-slate-400 mb-1">Transaction No</label>
          <div className={`flex items-center border rounded-xl px-3 py-2 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <FileText size={14} className="text-slate-400 mr-2" />
            <input required type="text" placeholder="e.g. TXN-10294" value={txnNo} onChange={(e) => setTxnNo(e.target.value)} className="bg-transparent w-full focus:outline-none" />
          </div>
        </div>

        {/* Transfer Grid (From -> To) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold uppercase text-slate-400 mb-1">From Provider</label>
            <select value={fromPay} onChange={(e) => setFromPay(e.target.value)} className={`w-full rounded-xl border px-3 py-2 focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <option>KBZPay</option>
              <option>Wave Pay</option>
              <option>CB Pay</option>
              <option>AYA Pay</option>
            </select>
          </div>
          <div>
            <label className="block font-bold uppercase text-slate-400 mb-1">To Provider</label>
            <select value={toPay} onChange={(e) => setToPay(e.target.value)} className={`w-full rounded-xl border px-3 py-2 focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <option>Wave Pay</option>
              <option>KBZPay</option>
              <option>AYA Pay</option>
              <option>CB Pay</option>
            </select>
          </div>
        </div>

        {/* Timestamp */}
        <div>
          <label className="block font-bold uppercase text-slate-400 mb-1">Transaction Time</label>
          <div className={`flex items-center border rounded-xl px-3 py-2 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <Clock size={14} className="text-slate-400 mr-2" />
            <input required type="text" placeholder="e.g. 15:30 PM" value={time} onChange={(e) => setTime(e.target.value)} className="bg-transparent w-full focus:outline-none" />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block font-bold uppercase text-slate-400 mb-1">Issue Description</label>
          <textarea required rows="3" placeholder="Tell us what happened..." value={message} onChange={(e) => setMessage(e.target.value)} className={`w-full rounded-xl border px-3 py-2 text-xs focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} />
        </div>

        <button type="submit" className="w-full bg-amber-500 hover:opacity-90 text-slate-950 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider shadow-md">
          <Send size={14} /> Send Ticket
        </button>
      </form>
    </div>
  );
}