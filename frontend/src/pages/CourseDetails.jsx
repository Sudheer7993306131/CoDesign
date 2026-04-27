import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, UserCircle2, ExternalLink, Star, 
  Send, MessageCircle, Clock, Globe, BarChart3, 
  Award, CheckCircle2, Info, ChevronRight 
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');


  const [reviewForm, setReviewForm] = useState({ user_name: '', comment: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);

  const fetchDetail = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/courses/${id}`);
      if (!response.ok) throw new Error('Course not found');
      const data = await response.json();
      setCourse(data);
    } catch (error) { console.error("Fetch Error:", error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8000/api/courses/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      });
      if (response.ok) {
        setReviewForm({ user_name: '', comment: '', rating: 5 });
        fetchDetail();
      }
    } catch (err) { console.error("Review failed:", err); } finally { setSubmitting(false); }
  };

  if (loading || !course) return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Syllabus...</p>
    </div>
  );

  const avgRating = course.reviews?.length > 0 
    ? (course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length).toFixed(1) 
    : "0.0";

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* 1. ACADEMIC HEADER - REDUCED TOP PADDING */}
      <section className="bg-[#00255c] pt-12 pb-12 px-6 lg:pt-16 lg:pb-16 text-white relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          <div className="lg:col-span-8 space-y-6">
            <nav className="flex items-center gap-2 text-blue-200 text-[10px] font-black uppercase tracking-widest mb-4">
              <Link to="/" className="hover:text-white transition-colors">Courses</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/60">{course.category}</span>
            </nav>
            
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter">
              {course.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-black text-lg">{avgRating}</span>
                    <span className="text-blue-200 text-xs font-bold">({course.reviews?.length || 0} reviews)</span>
                </div>
                <div className="h-6 w-px bg-white/20 hidden sm:block"></div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-lg">
                        {course.instructor?.charAt(0) || 'E'}
                    </div>
                    <div>
                        <p className="text-[9px] text-blue-200 uppercase font-black tracking-widest leading-none">Instructor</p>
                        <p className="text-base font-bold text-white mt-1">{course.instructor || 'Industry Expert'}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
                <a 
                  href={course.external_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-white hover:text-blue-900 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 transition-all"
                >
                    Get Course
                </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SUB-NAVIGATION (TABS) */}
      <nav className="sticky top-16 bg-white border-b border-slate-200 z-40 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-10 h-16">
              {['about', 'skills', 'reviews'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-[10px] font-black uppercase tracking-widest h-full border-b-[3px] transition-all ${
                        activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                      {tab}
                  </button>
              ))}
          </div>
      </nav>

      {/* 3. MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-16">
          
          {/* TAB: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-10 animate-in fade-in duration-500">
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                        <span className="w-8 h-px bg-slate-200"></span> Executive Summary
                    </h3>
                    <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-line font-medium">
                        {course.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { icon: <Globe />, label: 'Format', value: '100% Online' },
                        { icon: <Clock />, label: 'Schedule', value: 'Flexible Deadlines' },
                        { icon: <Award />, label: 'Credential', value: 'Academy Certificate' },
                        { icon: <BarChart3 />, label: 'Difficulty', value: course.level || 'Beginner' }
                    ].map((item, i) => (
                        <div key={i} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-5">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{item.label}</p>
                                <p className="font-bold text-slate-900 text-sm">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {/* TAB: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Target Competencies</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {course.skills_covered?.map((skill, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                            {skill}
                        </div>
                    ))}
                </div>
            </div>
          )}

          {/* TAB: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-12 animate-in fade-in duration-500">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <h4 className="text-[10px] font-black uppercase text-blue-600 mb-6 tracking-[0.2em]">Contributor Feedback</h4>
                    <form onSubmit={handleReviewSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                required
                                className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-1 ring-blue-500 text-xs font-bold transition-all"
                                value={reviewForm.user_name}
                                onChange={(e) => setReviewForm({...reviewForm, user_name: e.target.value})}
                            />
                            <div className="flex items-center gap-2 px-4 bg-slate-50 rounded-xl">
                                <span className="text-[9px] font-black uppercase text-slate-400 mr-2">Score</span>
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                        type="button"
                                        key={num}
                                        onClick={() => setReviewForm({...reviewForm, rating: num})}
                                    >
                                        <Star className={`w-4 h-4 ${num <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea 
                            placeholder="Detail your learning trajectory..." 
                            required
                            className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-1 ring-blue-500 text-xs h-32 resize-none"
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                        />
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest py-4 px-10 rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                            {submitting ? 'Transmitting...' : <><Send className="w-3 h-3" /> Submit Feedback</>}
                        </button>
                    </form>
                </div>

                <div className="space-y-6">
                    {course.reviews?.length > 0 ? (
                        course.reviews.map((rev, idx) => (
                            <div key={idx} className="p-8 bg-white border border-slate-100 rounded-[2rem] hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-black text-lg shadow-inner">
                                            {rev.user_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase tracking-tighter text-slate-900">{rev.user_name}</p>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{new Date(rev.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-100'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium italic">"{rev.comment}"</p>
                            </div>
                        )).reverse()
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                             <p className="text-[10px] font-black uppercase tracking-widest">No peer insights found</p>
                        </div>
                    )}
                </div>
            </div>
          )}
        </div>

        {/* --- 4. SIDEBAR - STICKY --- */}
        <div className="lg:col-span-4">
          <div className="sticky top-40 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 space-y-8">
            <div className="space-y-4">
                <img src={course.image_url} className="w-full h-auto rounded-[1.5rem] shadow-md" alt={course.title} />
                <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tuition</span>
                    <span className="text-2xl font-black text-blue-600">FREE</span>
                </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 leading-relaxed px-2">
                    This curriculum is verified for industry proficiency. Master the concepts through project-led assessments.
                </p>
                <a href={course.external_link} target="_blank" rel="noopener noreferrer" 
                className="flex items-center justify-center gap-3 w-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-5 rounded-xl hover:bg-blue-600 transition-all shadow-lg">
                Get Course
                <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            <div className="space-y-4 bg-blue-50/50 p-6 rounded-2xl">
                <h5 className="text-[9px] font-black uppercase text-blue-600 tracking-widest">Core Features</h5>
                <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" /> Shareable Certificate
                    </li>
                    <li className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" /> Professional Grade
                    </li>
                </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;