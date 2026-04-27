import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, ThumbsUp, MessageSquare, Share2, 
  Send, MoreHorizontal, Globe, TrendingUp, Award 
} from 'lucide-react';

const ExploreFeed = () => {
  const [feed, setFeed] = useState([]);
  const [filteredFeed, setFilteredFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [commentInputs, setCommentInputs] = useState({});

  const categories = ["All", "UI/UX", "Full Stack", "Graphic", "Motion"];
  const userEmail = localStorage.getItem("user_email") || localStorage.getItem("userEmail");
  const API_BASE = "http://localhost:8000/api/profiles";

  const fetchGlobalFeed = async () => {
    try {
      const res = await fetch(`${API_BASE}/feed/explore`);
      const data = await res.json();
      setFeed(data);
      setFilteredFeed(data);
    } catch (err) { console.error("Sync Error:", err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchGlobalFeed(); }, []);

  useEffect(() => {
    let result = feed;
    if (searchQuery) {
      result = result.filter(item => 
        item.post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.post.technologies?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (activeCategory !== "All") {
      result = result.filter(item => 
        item.post.technologies?.some(t => t.toLowerCase().includes(activeCategory.toLowerCase()))
      );
    }
    setFilteredFeed(result);
  }, [searchQuery, activeCategory, feed]);

  // ✅ ENHANCED LIKE HANDLER
  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: userEmail }),
      });
      if (res.ok) fetchGlobalFeed();
    } catch (err) { console.error("Like failed:", err); }
  };

  // ✅ ENHANCED COMMENT HANDLER
  const handleCommentSubmit = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const formData = new FormData();
    formData.append("user_email", userEmail);
    formData.append("text", text);

    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/comment`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setCommentInputs(prev => ({ ...prev, [postId]: "" }));
        fetchGlobalFeed();
      }
    } catch (err) { console.error("Comment failed:", err); }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-[#F3F2EF]">
       <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Synchronizing Global Feed...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F2EF] pt-20 pb-12 font-sans text-slate-900">
      
      {/* --- TOP FIXED SEARCH BAR --- */}
      <div className="fixed top-16 left-0 right-0 z-50 bg-white border-b border-slate-200 py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search network insights..."
                className="w-full bg-[#EDF3F8] border-none rounded-md py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-1 ring-slate-300 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <div className="hidden md:flex gap-2">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)} 
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT SIDEBAR (USER CARD) --- */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-40">
             <div className="h-16 bg-[#00255c]"></div>
             <div className="px-4 pb-6 text-center">
                <div className="w-16 h-16 bg-white rounded-xl border-2 border-white -mt-8 mx-auto flex items-center justify-center font-black text-slate-900 text-2xl shadow-sm uppercase">
                   {userEmail?.charAt(0)}
                </div>
                <h4 className="mt-3 font-black text-sm uppercase tracking-tighter">{userEmail?.split('@')[0]}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Creative Hub Member</p>
                
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                   <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                      <span>Syncs</span>
                      <span className="text-blue-600">42</span>
                   </div>
                   <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                      <span>Network</span>
                      <span className="text-blue-600">812</span>
                   </div>
                </div>
             </div>
          </div>
        </aside>

        {/* --- MAIN STREAM --- */}
        <main className="lg:col-span-6 space-y-4">
          {filteredFeed.map((item, index) => {
            const isLiked = item.post.likes?.includes(userEmail);
            const postId = item.post.post_id;

            return (
              <article key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all hover:border-slate-300">
                
                {/* User Metadata */}
                <div className="p-4 flex items-center justify-between">
                  <Link to={`/profile/${item.post.author_email}`} className="flex items-center gap-3">
                    <img src={item.author_image} className="w-12 h-12 rounded-full object-cover border border-slate-100" alt="author" />
                    <div>
                      <h4 className="text-sm font-black hover:text-blue-600 transition-colors uppercase tracking-tight">{item.author_name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 tracking-widest mt-0.5">
                        <Award className="w-3 h-3 text-blue-600" /> Practitioner • {new Date(item.post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                  <button className="text-slate-400 hover:bg-slate-50 p-2 rounded-full"><MoreHorizontal className="w-5 h-5" /></button>
                </div>

                {/* Body Content */}
                <div className="px-4 pb-4">
                  <h3 className="text-sm font-black uppercase mb-1">{item.post.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.post.description}</p>
                </div>

                {/* Visual Attachment */}
                {item.post.attachments?.[0] && (
                  <div className="bg-slate-50 border-y border-slate-100">
                    <img src={item.post.attachments[0]} className="w-full h-auto max-h-[500px] object-contain mx-auto" alt="attachment" />
                  </div>
                )}

                {/* Social Stats */}
                <div className="px-4 py-2 flex items-center justify-between border-b border-slate-50">
                   <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[8px]">👍</span>
                      {item.post.likes?.length || 0} Likes
                   </div>
                   <span className="text-[10px] font-bold text-slate-400">{item.post.comments?.length || 0} Comments</span>
                </div>

                {/* Professional Action Bar */}
                <div className="flex items-center justify-around py-1 px-2">
                  <button 
                    onClick={() => handleLike(postId)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 hover:bg-slate-50 rounded-md transition-colors text-xs font-black uppercase tracking-widest ${isLiked ? 'text-blue-600' : 'text-slate-500'}`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-blue-600' : ''}`} /> Like
                  </button>
                  <button 
                    onClick={() => document.getElementById(`comment-${postId}`).focus()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-slate-50 rounded-md transition-colors text-xs font-black uppercase tracking-widest text-slate-500"
                  >
                    <MessageSquare className="w-4 h-4" /> Comment
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-slate-50 rounded-md transition-colors text-xs font-black uppercase tracking-widest text-slate-500">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>

                {/* Inline Comment Ecosystem */}
                <div className="bg-slate-50/50 p-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black uppercase">
                        {userEmail?.charAt(0)}
                    </div>
                    <div className="flex-1 relative">
                      <input 
                        id={`comment-${postId}`}
                        type="text" 
                        placeholder="Share a professional insight..."
                        className="w-full bg-white border border-slate-200 rounded-full py-2.5 px-5 text-xs font-bold outline-none focus:ring-1 ring-blue-500 shadow-sm"
                        value={commentInputs[postId] || ""}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [postId]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(postId)}
                      />
                      <button 
                        onClick={() => handleCommentSubmit(postId)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 font-black text-[9px] uppercase tracking-widest hover:text-slate-900 transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  </div>

                  {/* List of Peer Comments */}
                  <div className="space-y-4">
                    {item.post.comments?.map((c, i) => (
                      <div key={i} className="flex gap-3 animate-in fade-in duration-300">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                            {c.user_email?.charAt(0)}
                        </div>
                        <div className="bg-white p-3 rounded-2xl flex-1 border border-slate-100 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-tighter text-slate-900">{c.user_email.split('@')[0]}</p>
                          <p className="text-xs text-slate-600 mt-1 font-medium">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </main>

        {/* --- RIGHT SIDEBAR (TRENDING) --- */}
        <aside className="hidden lg:block lg:col-span-3">
           <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-40">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                 <TrendingUp className="w-4 h-4 text-blue-600" /> Professional Trends
              </h4>
              <div className="space-y-6">
                 {['#FigmaSystems', '#FastAPI_Design', '#UXResearch_2026', '#ReactProtocol'].map(tag => (
                    <div key={tag} className="group cursor-pointer">
                       <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">{tag}</p>
                       <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">12.5k Syncs</p>
                    </div>
                 ))}
              </div>
           </div>
        </aside>

      </div>
    </div>
  );
};

export default ExploreFeed;