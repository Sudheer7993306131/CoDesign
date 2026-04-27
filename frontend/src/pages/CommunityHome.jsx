import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Plus, ShieldCheck, Globe, Search, 
  ArrowRight, LayoutGrid, X, Sparkles, 
  ChevronRight, BookOpen, MessageSquare, BarChart 
} from 'lucide-react';
import CommunityChat from './CommunityChat';

const CommunityHome = () => {
  const [communities, setCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({ name: '', description: '', category: 'UI/UX' });
  
  const userEmail = localStorage.getItem('user_email');
  const userRole = localStorage.getItem('user_role');

  const fetchData = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        axios.get('http://localhost:8000/api/communities/'),
        axios.get(`http://localhost:8000/api/communities/my-communities/${userEmail}`)
      ]);
      setCommunities(allRes.data);
      setMyCommunities(myRes.data.map(c => c.id));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [userEmail]);

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8000/api/communities/create/${userEmail}`, formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', category: 'UI/UX' });
      fetchData();
    } catch (err) { alert(err.response?.data?.detail); }
  };

  const handleJoin = async (communityId) => {
    try {
      await axios.post(`http://localhost:8000/api/communities/${communityId}/join/${userEmail}`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (activeCommunity) {
    return <CommunityChat community={activeCommunity} onClose={() => setActiveCommunity(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 font-sans">
      
      {/* 1. ACADEMIC HERO SECTION */}
      <section className="bg-[#00255c] pt-24 pb-20 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-white">
          <nav className="flex items-center gap-2 text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <span className="hover:text-white transition-colors cursor-pointer">Academy</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Professional Networks</span>
          </nav>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div className="max-w-3xl space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Connect with professional <br/> learning communities.
              </h1>
              <p className="text-blue-100 text-lg max-w-xl font-medium opacity-80 leading-relaxed">
                Join peer-led networks to share insights, collaborate on projects, and stay updated with industry-standard practices.
              </p>
            </div>
            
            {/* Professional Search */}
            <div className="w-full lg:w-[450px]">
              <div className="flex bg-white rounded-xl shadow-2xl overflow-hidden p-1.5">
                <input 
                  type="text"
                  placeholder="Find a community (e.g. Design Systems)..."
                  className="flex-1 px-5 py-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="bg-blue-600 px-6 py-3 rounded-lg text-white hover:bg-slate-900 transition-all">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE INTERFACE GRID */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        
        {/* MENTOR MANAGEMENT SECTION */}
        {userRole === 'mentor' && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-blue-600" /> Managed Communities
                </h2>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create Community
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {communities.filter(c => c.mentor_owner === userEmail).map(c => (
                <div key={c.id} className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-blue-600">
                        <LayoutGrid className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                        Faculty Owner
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{c.name}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">{c.description}</p>
                  <button onClick={() => setActiveCommunity(c)} className="mt-auto w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-colors">
                    Manage Network
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DISCOVERY HUB */}
        <section>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Globe className="w-4 h-4 text-blue-600" /> Explore Global Networks
              </h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredCommunities.length} Active Hubs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCommunities.filter(c => c.mentor_owner !== userEmail).map((c) => {
              const isJoined = myCommunities.includes(c.id);
              return (
                <div key={c.id} className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col hover:border-blue-400 hover:shadow-2xl transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xl">
                        {c.name.charAt(0)}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {c.category}
                        </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {c.name}
                  </h3>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-10 flex-1 line-clamp-3">
                    {c.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <Users className="w-3.5 h-3.5" /> 
                            <span className="text-xs font-bold">{c.members?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <BarChart className="w-3.5 h-3.5" /> 
                            <span className="text-[10px] font-bold uppercase">High Activity</span>
                        </div>
                    </div>
                    
                    {isJoined ? (
                      <button onClick={() => setActiveCommunity(c)} className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest hover:text-blue-800">
                        Launch Chat <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => handleJoin(c.id)} className="px-6 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        Join Network
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 3. ACADEMIC CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-6">
            <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 p-12 relative shadow-2xl">
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="mb-10">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                        <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Create Professional Network</h3>
                    <p className="text-slate-500 text-sm font-medium">Establish a space for specialized academic exchange and peer collaboration.</p>
                </div>
                
                <form onSubmit={handleCreateCommunity} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Network Identifier</label>
                        <input 
                          type="text" required placeholder="e.g. Design Systems Research"
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-semibold outline-none focus:border-blue-500 transition-all"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Category</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-semibold outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                          <option value="UI/UX">UI/UX Specialization</option>
                          <option value="Graphic Design">Graphic Design Hub</option>
                          <option value="Web Design">Web Architecture</option>
                        </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Scope of Discussion</label>
                    <textarea 
                      required placeholder="Define the core learning objectives of this network..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium h-32 resize-none outline-none focus:border-blue-500"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-blue-100"
                  >
                    Confirm & Launch Network
                  </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default CommunityHome;