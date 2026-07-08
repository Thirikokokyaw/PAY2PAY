import React, { useState } from 'react';
import { CornerDownLeft, Reply, Bell } from 'lucide-react'; // Imported Bell icon for notifications

export default function SupportTicketsView({ theme, isDarkMode, tickets, setTickets }) {
  const [replyText, setReplyText] = useState({});

  const handleSendReply = (ticketId) => {
    if (!replyText[ticketId]?.trim()) return;

    setTickets(prev => prev.map(t => 
      t.id === ticketId 
        ? { ...t, status: 'Resolved', adminReply: replyText[ticketId] } 
        : t
    ));
    
    // Clean reply input stream
    setReplyText(prev => ({ ...prev, [ticketId]: '' }));
    alert("✉️ Reply broadcasted to customer portal successfully.");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section: Uses flex, justify-between, and items-center to align title layout and notification bell */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-xl font-extrabold uppercase ${theme.textTitle}`}>Customer Support Inbound</h2>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>Review transfer discrepancies and transmit dispatch solutions</p>
        </div>

        {/* Notification Bell Button with hover transitions matching the desk alignment */}
        <button className={`p-2 rounded-xl border relative transition-colors shrink-0 ${theme.tableBg} hover:opacity-80`}>
          <Bell size={20} className={theme.textTitle} />
          {/* Notification Indicator Dot (Remove this span if an indicator is not required) */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
        </button>
      </div>

      <div className="space-y-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className={`border p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-4 transition-all ${theme.card} ${ticket.status === 'Pending' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-500 opacity-75'}`}>
            <div className="space-y-2 flex-grow">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-amber-500/10 text-amber-500 font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg border border-amber-500/20">{ticket.txnNo}</span>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  {ticket.fromPay} → {ticket.toPay}
                </span>
                <span className="text-[11px] font-mono text-slate-400">🕒 {ticket.time}</span>
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${ticket.status === 'Pending' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500/10 text-emerald-500'}`}>{ticket.status}</span>
              </div>
              
              <p className={`text-xs font-medium pl-1 ${theme.textTitle}`}>{ticket.message}</p>

              {ticket.adminReply && (
                <div className={`mt-3 p-3 rounded-xl border text-xs font-sans font-medium flex items-start gap-2 ${isDarkMode ? 'bg-slate-950/60 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-700'}`}>
                  <CornerDownLeft size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <span className="font-extrabold text-[10px] uppercase block text-slate-400 tracking-wider">Admin Response:</span>
                    {ticket.adminReply}
                  </div>
                </div>
              )}
            </div>

            {ticket.status === 'Pending' && (
              <div className="md:w-72 shrink-0 flex flex-col gap-2 justify-end">
                <input 
                  type="text" 
                  placeholder="Type reply message..." 
                  value={replyText[ticket.id] || ''} 
                  onChange={(e) => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none ${theme.input}`} 
                />
                <button onClick={() => handleSendReply(ticket.id)} className="w-full py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wider">
                  <Reply size={13} /> Dispatch Reply
                </button>
              </div>
            )}
          </div>
        ))}

        {tickets.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-12">No active customer tickets found in network queue.</p>
        )}
      </div>
    </div>
  );
}