import React, { useState, useEffect } from 'react';
import { 
  Search, Briefcase, MapPin, DollarSign, 
  Clock, CheckCircle2, ShieldCheck, Filter, 
  ChevronRight, Plus, ExternalLink, X, 
  ArrowRight, Users, LayoutDashboard 
} from 'lucide-react';

const JobBoard = () => {
  const loggedInEmail = localStorage.getItem("user_email") || localStorage.getItem("userEmail");
  const loggedInRole = localStorage.getItem("user_role")?.toLowerCase();

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('all'); 
  const [activeModal, setActiveModal] = useState(null); 
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const API_BASE = "http://localhost:8000/api/jobs";

  // --- DATA FETCHING ---
  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/all`);
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchMyApplications = async () => {
    if (loggedInRole !== 'learner') return;
    try {
      const res = await fetch(`${API_BASE}/my-applications/${encodeURIComponent(loggedInEmail)}`);
      const data = await res.json();
      setMyApplications(data);
    } catch (err) { console.error(err); }
  };

  const fetchApplicants = async (jobId) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${jobId}?recruiter_email=${loggedInEmail}`);
      const data = await res.json();
      setApplicants(data);
      setActiveModal('view');
    } catch (err) { alert("Access Denied"); }
  };

  useEffect(() => { 
    fetchJobs(); 
    if (loggedInRole === 'learner') fetchMyApplications();
  }, [loggedInRole]);

  const recruiterJobs = jobs.filter(job => job.recruiter_email === loggedInEmail);

  // --- HANDLERS ---
  const handleUpdateStatus = async (mongoId, newStatus) => {
    if (!mongoId) return;
    try {
      const res = await fetch(`${API_BASE}/update-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_id: mongoId, new_status: newStatus, recruiter_email: loggedInEmail })
      });
      if (res.ok) fetchApplicants(selectedJob.job_id);
    } catch (err) { console.error(err); }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      job_id: selectedJob.job_id,
      learner_email: loggedInEmail,
      resume_link: formData.get("resume_link"),
      cover_letter: formData.get("cover_letter")
    };
    try {
      const res = await fetch(`${API_BASE}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setActiveModal(null);
        fetchJobs();
        fetchMyApplications();
      }
    } catch (err) { alert("Application failed."); }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      job: {
        title: formData.get("title"),
        company: formData.get("company"),
        location: formData.get("location"),
        job_type: formData.get("job_type"),
        salary_range: formData.get("salary_range"),
        description: formData.get("description"),
        skills_required: formData.get("skills").split(",").map(s => s.trim()),
      },
      recruiter_email: loggedInEmail,
      role: loggedInRole
    };
    try {
      const res = await fetch(`${API_BASE}/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) { setActiveModal(null); fetchJobs(); }
    } catch (err) { alert("Job post failed."); }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="w-12 h-12 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-4 font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Syncing Career Ecosystem</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20 pt-20">
      
      {/* --- ELITE HEADER --- */}
      <section className="bg-[#00255c] py-12 px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <nav className="flex items-center gap-2 text-blue-300 text-[10px] font-black uppercase tracking-widest mb-4">
                <span>Network</span> <ChevronRight className="w-3 h-3" /> <span>Career Marketplace</span>
              </nav>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Institutional <span className="italic text-blue-400">Opportunities.</span>
              </h1>
              <p className="text-blue-100/60 text-sm max-w-lg font-medium">
                Interfacing top-tier creative talent with industry-leading agencies and technical partners.
              </p>
            </div>

            <div className="flex bg-white/10 backdrop-blur-xl p-1.5 rounded-xl border border-white/20">
              <button onClick={() => setActiveTab('all')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'all' ? 'bg-white text-slate-900' : 'text-white hover:bg-white/5'}`}>
                <Search className="w-3.5 h-3.5" /> Explore
              </button>
              {loggedInRole === 'recruiter' && (
                <button onClick={() => setActiveTab('my-postings')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'my-postings' ? 'bg-white text-slate-900' : 'text-white hover:bg-white/5'}`}>
                  <LayoutDashboard className="w-3.5 h-3.5" /> Manage
                </button>
              )}
              {loggedInRole === 'learner' && (
                <button onClick={() => setActiveTab('my-apps')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'my-apps' ? 'bg-white text-slate-900' : 'text-white hover:bg-white/5'}`}>
                  <Clock className="w-3.5 h-3.5" /> Track
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT SIDEBAR: FILTERS --- */}
        <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-600" /> Filter Criteria
                </h3>
                <div className="space-y-4">
                    {['Full-time', 'Contract', 'Remote', 'Internship'].map(type => (
                        <label key={type} className="flex items-center gap-3 text-xs font-bold text-slate-600 cursor-pointer hover:text-blue-600 transition-colors">
                            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> {type}
                        </label>
                    ))}
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <ShieldCheck className="w-6 h-6 text-blue-600 mb-4" />
                <h4 className="text-xs font-black text-blue-900 uppercase mb-2">Verified Ecosystem</h4>
                <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                    All entities in this marketplace are verified members of the CoDesign professional standard.
                </p>
            </div>

            {loggedInRole === 'recruiter' && (
                <button onClick={() => setActiveModal('post')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Post Opportunity
                </button>
            )}
        </aside>

        {/* --- CENTER: LISTINGS --- */}
        <section className="lg:col-span-9">
            <div className="grid grid-cols-1 gap-4">
                {/* MARKETPLACE VIEW */}
                {activeTab === 'all' && jobs.map(job => (
                    <div key={job.job_id} className="group bg-white border border-slate-200 p-8 rounded-xl hover:shadow-[0_20px_50px_-12px_rgba(0,37,92,0.1)] hover:border-blue-200 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-blue-50 text-blue-600 text-[8px] font-black uppercase px-2 py-1 rounded tracking-widest border border-blue-100">{job.job_type}</span>
                                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{job.title}</h2>
                                <p className="text-sm font-semibold text-slate-500 mt-1">{job.company}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {job.skills_required?.slice(0, 3).map(skill => (
                                    <span key={skill} className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">{skill}</span>
                                ))}
                            </div>
                        </div>
                        <div className="text-right w-full md:w-auto pt-6 md:pt-0 border-t md:border-none border-slate-100 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                            <p className="font-black text-lg text-blue-600 tracking-tighter">{job.salary_range || "Negotiable"}</p>
                            {loggedInRole === 'learner' && (
                                <button onClick={() => { setSelectedJob(job); setActiveModal('apply'); }} className="bg-slate-900 text-white px-8 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10">Apply Now</button>
                            )}
                        </div>
                    </div>
                ))}

                {/* RECRUITER POSTINGS */}
                {activeTab === 'my-postings' && recruiterJobs.map(job => (
                    <div key={job.job_id} className="bg-white border-2 border-slate-100 p-8 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 hover:border-blue-500 transition-colors">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-2">{job.title}</h2>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full"><Users className="w-3.5 h-3.5" /> {job.applicants_count} Submissions</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pipeline Active</span>
                            </div>
                        </div>
                        <button onClick={() => { setSelectedJob(job); fetchApplicants(job.job_id); }} className="w-full md:w-auto bg-[#00255c] text-white px-8 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">Review Candidates</button>
                    </div>
                ))}

                {/* LEARNER HISTORY */}
                {activeTab === 'my-apps' && myApplications.map(app => (
                    <div key={app._id} className="bg-white border border-slate-200 p-8 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tighter mb-1">{app.job_details?.title}</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{app.job_details?.company}</p>
                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Applied Dated: {new Date(app.applied_at).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-none pt-4 md:pt-0">
                            <a href={app.resume_link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-600 uppercase underline decoration-2 underline-offset-4 hover:text-slate-900 transition-colors">View Portfolio</a>
                            <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${app.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : app.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                {app.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      </main>

      {/* --- MODALS: ACADEMIC VAULT STYLE --- */}
      {activeModal === 'view' && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl p-10 relative max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300 border border-slate-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors"><X className="w-5 h-5" /></button>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 italic text-slate-900">Applicant Archive</h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-10 border-b pb-4">Role: {selectedJob?.title}</p>
            
            <div className="space-y-4">
              {applicants.map((app, i) => {
                const isFinalized = app.status === 'accepted' || app.status === 'rejected';
                return (
                  <div key={i} className="p-8 bg-slate-50 rounded-xl border border-slate-100 transition-all hover:bg-white hover:border-blue-200">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-lg bg-[#00255c] flex items-center justify-center text-white font-black text-xl shadow-lg uppercase">
                          {app.learner_email.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 mb-1">{app.learner_email}</p>
                          <a href={app.resume_link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-600 uppercase underline decoration-2 underline-offset-4 flex items-center gap-1">Open Professional Portfolio <ExternalLink className="w-3 h-3" /></a>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          disabled={isFinalized}
                          onClick={() => handleUpdateStatus(app._id, 'accepted')} 
                          className={`px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isFinalized && app.status === 'accepted' ? 'bg-emerald-600 text-white' : isFinalized ? 'bg-slate-200 text-slate-400 hidden' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/10'}`}
                        >
                          {app.status === 'accepted' ? 'Accepted' : 'Accept Candidate'}
                        </button>
                        <button 
                          disabled={isFinalized}
                          onClick={() => handleUpdateStatus(app._id, 'rejected')} 
                          className={`px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isFinalized && app.status === 'rejected' ? 'bg-red-600 text-white' : isFinalized ? 'bg-slate-200 text-slate-400 hidden' : 'bg-white border-2 border-red-100 text-red-500 hover:bg-red-50'}`}
                        >
                          {app.status === 'rejected' ? 'Rejected' : 'Decline'}
                        </button>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-slate-100 italic text-slate-500 text-sm leading-relaxed font-medium shadow-inner">
                      "{app.cover_letter}"
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- FORM MODALS --- */}
      {activeModal === 'apply' && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <form onSubmit={handleApply} className="bg-white w-full max-w-lg rounded-2xl p-10 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-500">
            <button type="button" onClick={() => setActiveModal(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"><X className="w-5 h-5" /></button>
            <h2 className="text-3xl font-black uppercase italic mb-8 tracking-tighter">Submit Application</h2>
            <div className="space-y-5">
              <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Portfolio Endpoint</label>
                  <input name="resume_link" required placeholder="Figma, Behance, or GitHub link" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none text-xs font-bold focus:ring-2 ring-blue-500/20" />
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">The Professional Pitch</label>
                  <textarea name="cover_letter" required placeholder="Why are you the ideal candidate for this role?" className="w-full bg-slate-50 border border-slate-100 p-5 rounded-xl outline-none text-xs font-medium h-40 resize-none focus:ring-2 ring-blue-500/20 leading-relaxed" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-blue-900/20 hover:bg-[#00255c] transition-all">Transmit Credentials</button>
            </div>
          </form>
        </div>
      )}

      {activeModal === 'post' && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <form onSubmit={handlePostJob} className="bg-white w-full max-w-2xl rounded-2xl p-10 shadow-2xl relative animate-in zoom-in duration-300 border border-slate-100">
            <button type="button" onClick={() => setActiveModal(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"><X className="w-5 h-5" /></button>
            <h2 className="text-3xl font-black uppercase italic mb-8 tracking-tighter">Post Institutional Vacancy</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <input name="title" required placeholder="Role Identity (e.g. Lead UI Designer)" className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none text-xs font-bold focus:ring-2 ring-blue-500/20" />
                <input name="company" required placeholder="Agency/Organization Name" className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none text-xs font-bold focus:ring-2 ring-blue-500/20" />
                <input name="location" required placeholder="Operational Hub (e.g. Remote, NYC)" className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none text-xs font-bold focus:ring-2 ring-blue-500/20" />
                <select name="job_type" className="bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none text-xs font-bold focus:ring-2 ring-blue-500/20 appearance-none">
                    <option value="Full-time">Full-time Engagement</option>
                    <option value="Contract">Contractual Basis</option>
                    <option value="Internship">Academy Internship</option>
                </select>
            </div>
            <input name="salary_range" placeholder="Compensation (e.g. $120k - $150k)" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none text-xs font-bold mb-4 focus:ring-2 ring-blue-500/20" />
            <input name="skills" required placeholder="Required Technologies (comma separated)" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none text-xs font-bold mb-4 focus:ring-2 ring-blue-500/20" />
            <textarea name="description" required placeholder="Define the operational scope and expectations..." className="w-full bg-slate-50 border border-slate-100 p-5 rounded-xl outline-none text-xs font-medium h-32 resize-none mb-6 focus:ring-2 ring-blue-500/20 leading-relaxed" />
            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-blue-900/20 hover:bg-[#00255c] transition-all">Authorize & Publish</button>
          </form>
        </div>
      )}

    </div>
  );
};

export default JobBoard;