import React, { useState, useEffect } from 'react';
import { CornerDownLeft, Reply } from 'lucide-react';

export default function SupportTicketsView({ theme, isDarkMode, tickets, setTickets }) {
  const [replyText, setReplyText] = useState({});

  // 1. Fetch tickets directly from backend storage configuration
  const fetchTickets = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tickets');
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets array payload:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // 2. Dispatch Reply Handler
  const handleSendReply = async (ticketId) => {
    if (!replyText[ticketId]?.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tickets/reply/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: replyText[ticketId] })
      });

      if (response.ok) {
        setReplyText(prev => ({ ...prev, [ticketId]: '' }));
        fetchTickets(); // Refresh state log automatically on response confirmation
      }
    } catch (error) {
      console.error("Error updating admin dispatch reply:", error);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header Meta info */}
      <div>
        <h2 className={`text-xl font-extrabold uppercase ${theme.textTitle}`}>Customer Support Inbound</h2>
        <p className={`text-xs mt-1 ${theme.textMuted}`}>Review transfer discrepancies and transmit dispatch solutions</p>
      </div>

      {/* Scrollable Container Module for handling high volume data tracking */}
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className={`border p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-4 transition-all ${theme.card} ${ticket.status === 'Pending' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-500 opacity-75'}`}
            >
              <div className="space-y-2 flex-grow">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-amber-500/10 text-amber-500 font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                    {ticket.txn_no}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{ticket.route}</span>
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${ticket.status === 'Pending' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {ticket.status}
                  </span>
                </div>
                
                <p className={`text-xs font-medium pl-1 ${theme.textTitle}`}>{ticket.user_message}</p>

                {/* Display Admin reply block state cleanly beneath message payload if exists */}
                {ticket.admin_reply && (
                  <div className={`mt-3 p-3 rounded-xl border text-xs font-sans font-medium flex items-start gap-2 ${isDarkMode ? 'bg-slate-950/60 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-700'}`}>
                    <CornerDownLeft size={14} className="mt-0.5 shrink-0" />
                    <div>
                      <span className="font-extrabold text-[10px] uppercase block text-slate-400 tracking-wider">Admin Response:</span>
                      {ticket.admin_reply}
                    </div>
                  </div>
                )}
              </div>

              {/* Only reveal active reply dispatcher input field if ticket is Pending state */}
              {ticket.status === 'Pending' && (
                <div className="md:w-72 shrink-0 flex flex-col gap-2 justify-end">
                  <input 
                    type="text" 
                    placeholder="Type reply message..." 
                    value={replyText[ticket.id] || ''} 
                    onChange={(e) => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none ${theme.input}`} 
                  />
                  <button 
                    onClick={() => handleSendReply(ticket.id)} 
                    className="w-full py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wider hover:opacity-90 transition-opacity"
                  >
                    <Reply size={13} /> Dispatch Reply
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-xs text-slate-400 py-12">No active customer tickets found.</p>
        )}
      </div>
    </div>
  );
}