import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Search, CheckCircle, Clock, Mail, 
  Star, MessageCircle, Globe, BarChart3, 
  ChevronRight, ArrowRight, Award, ShieldCheck 
} from 'lucide-react';
import MentorSectionmentor from './mentorsectiion_mentor'; 
import ChatWindow from './ChatWindow';

const MentorSection = () => {
  const [mentors, setMentors] = useState([]);
  const [acceptedMentors, setAcceptedMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);

  const userRole = localStorage.getItem('user_role');
  const userEmail = localStorage.getItem('user_email');

  useEffect(() => {
    if (userRole === 'learner' && userEmail) {
      const fetchData = async () => {
        try {
          const [availableRes, acceptedRes] = await Promise.all([
            axios.get('http://localhost:8000/api/mentorship/mentors'),
            axios.get(`http://localhost:8000/api/mentorship/my-mentors/${userEmail}`)
          ]);
          setMentors(availableRes.data);
          setFilteredMentors(availableRes.data);
          setAcceptedMentors(acceptedRes.data);
        } catch (err) {
          console.error("Data fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [userRole, userEmail]);

  useEffect(() => {
    const results = mentors.filter(m => 
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.keys(m.skills || {}).some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredMentors(results);
  }, [searchQuery, mentors]);

  const handleRequest = async (mentorEmail, mentorName) => {
    try {
      await axios.post(`http://localhost:8000/api/mentorship/request`, null, {
        params: { mentor_email: mentorEmail, learner_email: userEmail }
      });
      alert(`Request sent to ${mentorName}!`);
    } catch (err) {
      alert(err.response?.data?.detail || "Request already sent.");
    }
  };

  if (userRole === 'mentor') return <MentorSectionmentor />;
  if (!userRole) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authentication Required</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-900 font-sans">
      
      {/* 1. ACADEMIC HERO SECTION */}
      <section className="bg-[#00255c] pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <span className="hover:text-white transition-colors cursor-pointer">Academy</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Mentorship Hub</span>
          </nav>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div className="max-w-3xl space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Learn from industry <br/> leaders and practitioners.
              </h1>
              <p className="text-blue-100 text-lg max-w-xl font-medium opacity-80">
                Bridge the gap between theory and industry-standard proficiency with 1-on-1 guidance from verified experts.
              </p>
            </div>
            
            {/* Professional Search Bar */}
            <div className="w-full lg:w-[400px] relative">
              <div className="flex bg-white rounded-lg shadow-2xl overflow-hidden p-1">
                <input 
                  type="text"
                  placeholder="Search by expertise (e.g. Figma, React)..."
                  className="flex-1 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="bg-blue-600 p-3 rounded-md text-white hover:bg-blue-700 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* 2. ACTIVE PARTNERSHIPS (Horizontal List) */}
        {acceptedMentors.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" /> Active Guided Projects
                </h2>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {acceptedMentors.map((mentor) => (
                <div key={mentor.email} className="min-w-[320px] bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-blue-600 border border-slate-200">
                      {mentor.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{mentor.name}</h3>
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Verified Mentor</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveChat(mentor)}
                    className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    <MessageCircle className="w-4 h-4" /> Chat
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. MENTOR DIRECTORY */}
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Filters */}
            <aside className="hidden lg:block w-64 shrink-0 space-y-10">
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Expertise Level</h4>
                    <div className="space-y-4">
                        {['Senior Practitioner', 'Lead Designer', 'System Architect'].map(lvl => (
                            <label key={lvl} className="flex items-center gap-3 text-xs font-bold text-slate-600 cursor-pointer">
                                <input type="checkbox" className="rounded border-slate-300 text-blue-600" /> {lvl}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                    <ShieldCheck className="w-6 h-6 text-blue-600 mb-4" />
                    <h5 className="text-xs font-bold text-blue-900 mb-2">Verified Experts</h5>
                    <p className="text-[10px] text-blue-700 leading-relaxed">All mentors undergo a rigorous screening process to ensure high-quality professional guidance.</p>
                </div>
            </aside>

            {/* Content Grid */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-bold text-slate-900">Recommended for your track</h2>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredMentors.length} Profiles</span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                        {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-100 rounded-xl"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredMentors.map((mentor) => {
                        const isAccepted = acceptedMentors.some(m => m.email === mentor.email);
                        return (
                        <div key={mentor.email} className="bg-white border border-slate-200 rounded-xl p-8 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center font-bold text-xl border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        {mentor.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base">{mentor.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Award className="w-3 h-3 text-blue-600" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Verified Practitioner</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span className="text-xs font-bold text-slate-900">4.9</span>
                                </div>
                            </div>

                            <div className="mb-8 flex-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Competencies</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(mentor.skills || {}).slice(0, 3).map(skill => (
                                    <span key={skill} className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-md text-[10px] font-bold border border-slate-100 uppercase transition-colors group-hover:bg-white group-hover:border-blue-100">
                                        {skill.replace('_', ' ')}
                                    </span>
                                    ))}
                                </div>
                            </div>

                            {isAccepted ? (
                            <div className="flex gap-3">
                                <div className="flex-1 bg-slate-50 text-slate-500 py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-slate-100">
                                <CheckCircle className="w-4 h-4" /> Connected
                                </div>
                                <button 
                                    onClick={() => setActiveChat(mentor)}
                                    className="px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                            </div>
                            ) : (
                            <button 
                                onClick={() => handleRequest(mentor.email, mentor.name)}
                                className="w-full bg-white border border-blue-600 text-blue-600 py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3"
                            >
                                Request Mentorship
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            )}
                        </div>
                        );
                    })}
                    </div>
                )}
            </div>
        </div>
      </main>

      {/* 4. FOOTER TRUST STRIP */}
      <section className="bg-slate-50 py-12 border-t border-slate-200 mt-20">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Trusted by practitioners at</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale contrast-125">
               {['Google', 'Airbnb', 'Framer', 'Uber'].map(brand => (
                  <span key={brand} className="text-xl font-black italic text-slate-900 tracking-tighter">{brand}</span>
               ))}
            </div>
         </div>
      </section>

      {activeChat && (
        <ChatWindow 
          mentor={activeChat} 
          userEmail={userEmail} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
};

export default MentorSection;