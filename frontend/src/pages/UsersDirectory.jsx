import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, Search, ChevronRight, Users, Award } from 'lucide-react';

const UserDirectory = () => {
  const [data, setData] = useState({ mentors: [], learners: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/auth/directory")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const viewProfile = (email) => {
    navigate(`/profile/${email}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Mapping Global Network...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      
      {/* --- 1. DIRECTORY HERO --- */}
      <section className="bg-[#00255c] pt-20 pb-16 px-6 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div className="max-w-2xl space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Academy Network <br/> & Faculty Directory
              </h1>
              <p className="text-blue-100 text-lg opacity-80 font-medium">
                Connect with industry practitioners and a global community of rising creative talent.
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-8 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <div className="text-center">
                    <p className="text-2xl font-black text-white">{data.mentors.length}</p>
                    <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">Faculty</p>
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div className="text-center">
                    <p className="text-2xl font-black text-white">{data.learners.length}</p>
                    <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">Learners</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        
        {/* --- 2. FACULTY / MENTORS SECTION --- */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-10 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">Verified Faculty</h2>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry Practitioners</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.mentors.map((user, i) => (
              <div 
                key={i} 
                onClick={() => viewProfile(user.email)}
                className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative">
                    <img 
                      src={user.image || `https://ui-avatars.com/api/?name=${user.name}&background=00255c&color=fff&bold=true`} 
                      className="w-16 h-16 rounded-xl object-cover shadow-md" 
                      alt="mentor" 
                    />
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-1 rounded-md shadow-lg">
                       <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors leading-tight">{user.name}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Lead Practitioner</p>
                  </div>
                </div>
                
                <div className="flex-1">
                   <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">Expertise in System Architecture and High-Fidelity Interaction Design.</p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                   <span className="text-[10px] font-bold text-blue-600 uppercase">View Credentials</span>
                   <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- 3. LEARNERS SECTION --- */}
        <section>
          <div className="flex items-center justify-between mb-10 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">Rising Talent</h2>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CoDesign Alumni</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.learners.map((user, i) => (
              <div 
                key={i} 
                onClick={() => viewProfile(user.email)}
                className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
              >
                <div className="relative">
                    <img 
                      src={user.image || `https://ui-avatars.com/api/?name=${user.name}&background=f1f5f9&color=64748b&bold=true`} 
                      className="w-12 h-12 rounded-full object-cover border border-white shadow-sm" 
                      alt="learner" 
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate uppercase tracking-tighter group-hover:text-blue-600 transition-colors">{user.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">8 Synchronizations</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* --- 4. TRUST STRIP --- */}
      <section className="bg-slate-100/50 py-16 mt-24 border-t border-slate-200">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Establishing the creative standard</p>
            <div className="h-px w-20 bg-blue-600 mx-auto"></div>
         </div>
      </section>

    </div>
  );
};

export default UserDirectory;