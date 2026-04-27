import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, User, Mail, MessageCircle, ArrowUpRight, Zap, Sparkles } from 'lucide-react';
import ChatWindow from './ChatWindow';

const MentorSectionmentor = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);

  const mentorEmail = localStorage.getItem('user_email'); 

  const fetchRequests = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/mentorship/requests/${mentorEmail}`);
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mentorEmail) fetchRequests();
  }, [mentorEmail]);

  const handleAccept = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/mentorship/accept/${requestId}`, {
        method: 'POST',
      });
      if (response.ok) fetchRequests();
    } catch (error) { console.error(error); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#0F172A]">
      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] pb-24 selection:bg-indigo-500/30">
      
      {/* 1. LUXURY HERO SECTION */}
      <section className="relative pt-32 pb-20 px-8 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[30%] h-[40%] bg-fuchsia-600/5 blur-[100px] rounded-full"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-8">
            <Sparkles className="w-4 h-4" />
            Mentor Command Center
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-none">
            MANAGE <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">CONNECTIONS.</span>
          </h1>
          
          <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed">
            Review your incoming student requests and lead the next generation of CoDesign experts.
          </p>
        </div>
      </section>

      {/* 2. REQUESTS LIST */}
      <main className="max-w-5xl mx-auto px-8 relative z-20">
        <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
           <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Pending & Active Requests</h2>
           <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl">
              <Zap className="w-3 h-3 text-indigo-400 fill-current" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">{requests.length} Total</span>
           </div>
        </div>

        <div className="space-y-6">
          {requests.length > 0 ? (
            requests.map((req) => {
              const isAccepted = req.status === 'accepted';
              return (
                <div 
                  key={req._id} 
                  className={`group relative overflow-hidden p-8 rounded-[2.5rem] border transition-all duration-500 backdrop-blur-sm ${
                    isAccepted 
                    ? 'bg-slate-900/40 border-white/5 hover:border-white/10' 
                    : 'bg-indigo-600/5 border-indigo-500/20 shadow-[0_20px_50px_rgba(79,70,229,0.1)]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                    
                    {/* STUDENT INFO */}
                    <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl font-black transition-all duration-500 border ${
                            isAccepted 
                            ? 'bg-slate-800 border-white/10 text-slate-500' 
                            : 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                        }`}>
                            {req.learner_email.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-black text-white uppercase tracking-tight">
                                  {req.learner_email.split('@')[0]}
                                </span>
                                {isAccepted && <CheckCircle className="w-5 h-5 text-indigo-400" />}
                            </div>
                            <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">{req.learner_email}</p>
                            <div className="flex items-center gap-3 pt-3">
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <Clock className="w-3.5 h-3.5" /> 
                                    Requested: {new Date(req.requested_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ACTION AREA */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {!isAccepted ? (
                        <button
                          onClick={() => handleAccept(req._id)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5"
                        >
                          Review & Accept
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 w-full md:w-auto">
                           <button 
                            onClick={() => setActiveChat({ 
                              email: req.learner_email, 
                              name: req.learner_email.split('@')[0]
                            })}
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-indigo-500/20"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Open Chat
                          </button>
                          <span className="hidden sm:flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest bg-indigo-400/10 px-6 py-4 rounded-2xl border border-indigo-400/20">
                             Active Partner
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-32 bg-slate-900/50 rounded-[4rem] border-2 border-dashed border-white/5">
              <Mail className="w-16 h-16 text-slate-700 mx-auto mb-6 opacity-20" />
              <p className="text-slate-500 font-black text-xs uppercase tracking-[0.2em]">Queue is currently empty</p>
            </div>
          )}
        </div>
      </main>

      {/* --- FLOATING CHAT WINDOW --- */}
      {activeChat && (
        <ChatWindow 
          mentor={activeChat} 
          userEmail={mentorEmail} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
};

export default MentorSectionmentor;