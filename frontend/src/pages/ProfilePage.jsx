import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ShieldCheck, Globe, MessageSquare, Edit3, 
  Award, Camera, X, Send, Plus, Trash2, Zap,
  Layout, BookOpen, Image as ImageIcon, Link as LinkIcon, 
  AlignLeft, Type, Cpu, UploadCloud, Wrench 
} from 'lucide-react';

const ProfilePage = () => {
  const { email: urlEmail } = useParams();
  const loggedInEmail = localStorage.getItem("user_email") || localStorage.getItem("userEmail");
  const isOwner = loggedInEmail === urlEmail;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); 
  
  // --- FORM STATES ---
  const [editForm, setEditForm] = useState({ full_name: '', interested_role: '', bio: '', profile_image: '' });
  const [selectedFile, setSelectedFile] = useState(null); 
  
  const [postForm, setPostForm] = useState({ title: '', description: '', technologies: '' });
  const [selectedPostFile, setSelectedPostFile] = useState(null); 
  
  const [projectForm, setProjectForm] = useState({ title: '', description: '', live_link: '', technologies: '' });
  const [selectedProjectFile, setSelectedProjectFile] = useState(null); // State for project images
  
  const [skillInput, setSkillInput] = useState("");

  const API_BASE = "http://localhost:8000/api/profiles";

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/${encodeURIComponent(urlEmail)}`);
      if (!res.ok) throw new Error("Profile not found");
      const data = await res.json();
      setProfile(data);
      setEditForm({ 
        full_name: data.full_name || '', 
        interested_role: data.interested_role || '', 
        bio: data.bio || '',
        profile_image: data.profile_image || ''
      });
    } catch (err) { 
      console.error("Sync Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { if (urlEmail) fetchData(); }, [urlEmail]);

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  // --- HANDLERS ---

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      let finalImageUrl = editForm.profile_image;
      if (selectedFile) finalImageUrl = await toBase64(selectedFile);

      const res = await fetch(`${API_BASE}/${encodeURIComponent(loggedInEmail)}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, profile_image: finalImageUrl }),
      });
      if (res.ok) { 
        setProfile(await res.json()); 
        setActiveModal(null); 
        setSelectedFile(null);
      }
    } catch (err) { console.error("Profile update failed:", err); }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("title", projectForm.title);
    formData.append("description", projectForm.description);
    formData.append("author_email", loggedInEmail);
    formData.append("live_link", projectForm.live_link || "");
    formData.append("repo_link", ""); 
    
    // Convert tech string to formatted string or multiple appends based on backend needs
    formData.append("technologies", projectForm.technologies);
  
    if (selectedProjectFile) {
      formData.append("files", selectedProjectFile);
    }
  
    try {
      const res = await fetch(`${API_BASE}/projects/create`, {
        method: "POST",
        body: formData, 
      });
  
      if (res.ok) { 
        await fetchData(); 
        setActiveModal(null); 
        setProjectForm({ title: '', description: '', live_link: '', technologies: '' }); 
        setSelectedProjectFile(null);
      } else {
        const errData = await res.json();
        console.error("Project Error:", errData.detail);
      }
    } catch (err) { 
      console.error("Submission Error:", err); 
    }
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", postForm.title || "Growth Update");
    formData.append("description", postForm.description);
    formData.append("author_email", loggedInEmail);
    formData.append("technologies", postForm.technologies);
    if (selectedPostFile) formData.append("files", selectedPostFile);

    try {
      const res = await fetch(`${API_BASE}/posts/create`, { method: "POST", body: formData });
      if (res.ok) { 
        fetchData(); 
        setActiveModal(null); 
        setPostForm({ title: '', description: '', technologies: '' }); 
        setSelectedPostFile(null); 
      }
    } catch (err) { console.error("Post creation failed:", err); }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillInput.trim() || profile.skills?.includes(skillInput.trim())) return;
    const updatedSkills = [...(profile.skills || []), skillInput.trim()];
    try {
      const res = await fetch(`${API_BASE}/${encodeURIComponent(loggedInEmail)}/skills`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: updatedSkills }),
      });
      if (res.ok) { setProfile({ ...profile, skills: updatedSkills }); setSkillInput(""); }
    } catch (err) { console.error("Skill add failed:", err); }
  };

  const handleDeleteSkill = async (skillName) => {
    try {
      const res = await fetch(`${API_BASE}/${encodeURIComponent(loggedInEmail)}/skills/${encodeURIComponent(skillName)}`, {
        method: "DELETE",
      });
      if (res.ok) { setProfile({ ...profile, skills: profile.skills.filter(s => s !== skillName) }); }
    } catch (err) { console.error("Skill delete failed:", err); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F3F2EF]">
      <div className="animate-pulse font-bold text-slate-400">Syncing Identity...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F2EF] pb-12 pt-20">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- MAIN COLUMN --- */}
        <div className="lg:col-span-8 space-y-4">
          
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="h-40 bg-[#00255c] relative"></div>
            <div className="px-6 pb-6 relative">
              <img 
                src={profile?.profile_image || 'https://via.placeholder.com/150'} 
                className="w-36 h-36 rounded-full border-4 border-white object-cover -mt-16 shadow-md bg-white" 
                alt="avatar" 
              />
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mt-4">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
                  <p className="text-sm font-medium text-slate-600">{profile?.interested_role}</p>
                  <p className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Academy Ecosystem • <span className="text-blue-600 font-bold">{profile?.followers?.length || 0} followers</span>
                  </p>
                </div>
                {isOwner && (
                    <button onClick={() => setActiveModal('profile')} className="bg-blue-600 text-white px-6 py-1.5 rounded-full font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2">
                      <Edit3 className="w-4 h-4" /> Edit Profile
                    </button>
                )}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" /> Core Skills</h2>
                {isOwner && (
                    <button onClick={() => setActiveModal('skills')} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-widest px-3">
                        <Plus className="w-4 h-4" /> Manage
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.map((skill, i) => (
                <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 text-sm font-bold rounded-lg border border-slate-100">{skill}</span>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><Layout className="w-5 h-5 text-blue-600" /> Featured Projects</h2>
                {isOwner && (
                    <button onClick={() => setActiveModal('project')} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-widest px-3">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile?.projects?.map((proj, i) => (
                <div key={i} className="border border-slate-100 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col bg-white">
                  <div className="p-4 flex flex-col h-full">
                    <h3 className="font-bold text-sm uppercase tracking-tighter text-slate-900">{proj.title}</h3>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 mb-3 font-medium">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                        {proj.technologies?.map((tech, idx) => (
                            <span key={idx} className="bg-slate-50 text-slate-400 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-slate-100">{tech}</span>
                        ))}
                    </div>
                    {proj.live_link && (
                        <a href={proj.live_link} target="_blank" rel="noreferrer" className="mt-auto flex items-center gap-1 text-blue-600 font-bold text-[10px] uppercase hover:underline">
                            <LinkIcon className="w-3 h-3" /> Live Demo
                        </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-600" /> Activity</h2>
                {isOwner && (
                    <button onClick={() => setActiveModal('post')} className="bg-blue-50 text-blue-600 px-5 py-2 rounded-full font-bold text-xs hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest">
                        Start Post
                    </button>
                )}
            </div>
            <div className="space-y-6">
              {profile?.growth_posts?.slice().reverse().map((post, i) => (
                <div key={i} className="pb-6 border-b border-slate-50 last:border-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{new Date(post.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-600 font-medium">"{post.description}"</p>
                  {post.attachments?.[0] && <img src={post.attachments[0]} className="mt-4 rounded-xl max-h-80 w-full object-cover shadow-sm border" alt="attachment" />}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
             <h2 className="text-[10px] font-black mb-4 uppercase text-slate-400 tracking-[0.2em]">Dashboard</h2>
             <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-bold uppercase tracking-tighter">Profile Strength</span>
                <span className="font-black text-blue-600 text-lg">{(profile?.skills?.length || 0) * 10}%</span>
             </div>
          </section>
        </aside>
      </div>

      {/* --- MODAL ENGINE --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
            <header className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">
               <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900">
                  {activeModal === 'profile' ? "Identity Management" : activeModal === 'skills' ? "Skill Arsenal" : activeModal === 'post' ? "Growth Post" : "Project Archive"}
               </h2>
               <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-200 rounded-full transition-all"><X className="w-5 h-5 text-slate-500" /></button>
            </header>
            
            <div className="p-8">
                {/* 1. SKILLS */}
                {activeModal === 'skills' && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddSkill} className="flex gap-2">
                      <input type="text" placeholder="Skill name (e.g. React)..." value={skillInput} onChange={(e) => setSkillInput(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none" />
                      <button type="submit" className="bg-blue-600 text-white px-6 rounded-xl font-bold text-xs uppercase">Add</button>
                    </form>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {profile?.skills?.map((skill, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-sm font-bold">{skill}</span>
                                <button onClick={() => handleDeleteSkill(skill)} className="hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 2. PROFILE */}
                {activeModal === 'profile' && (
                   <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="flex flex-col items-center mb-4">
                        <label className="relative cursor-pointer group">
                           <img 
                            src={selectedFile ? URL.createObjectURL(selectedFile) : editForm.profile_image || 'https://via.placeholder.com/150'} 
                            className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 group-hover:opacity-80 transition-opacity" 
                            alt="preview"
                           />
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Camera className="text-white w-6 h-6" />
                           </div>
                           <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} />
                        </label>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Change Avatar</p>
                      </div>
                      <input type="text" placeholder="Full Name" value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 ring-blue-500/20" />
                      <input type="text" placeholder="Industry Role" value={editForm.interested_role} onChange={(e) => setEditForm({...editForm, interested_role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 ring-blue-500/20" />
                      <textarea placeholder="Professional Bio" value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm h-32 outline-none focus:ring-2 ring-blue-500/20 resize-none" />
                      <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">Save Identity</button>
                   </form>
                )}

                {/* 3. PROJECT */}
                {activeModal === 'project' && (
                   <form onSubmit={handleAddProject} className="space-y-4">
                      <input required type="text" placeholder="Project Title" value={projectForm.title} onChange={(e) => setProjectForm({...projectForm, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none" />
                      <input type="text" placeholder="Tech Stack (comma separated)" value={projectForm.technologies} onChange={(e) => setProjectForm({...projectForm, technologies: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none" />
                      <textarea required placeholder="Brief Outline" value={projectForm.description} onChange={(e) => setProjectForm({...projectForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm h-24 outline-none resize-none" />
                      
                      {/* NEW: Project File Upload */}
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-3 rounded-xl transition-colors border border-dashed border-slate-300">
                           <UploadCloud className="w-4 h-4 text-slate-500" />
                           <span className="text-[10px] font-bold uppercase text-slate-600">
                             {selectedProjectFile ? selectedProjectFile.name : "Upload Project Preview"}
                           </span>
                           <input type="file" className="hidden" onChange={(e) => setSelectedProjectFile(e.target.files[0])} />
                        </label>
                      </div>

                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Live Demo Link" value={projectForm.live_link} onChange={(e) => setProjectForm({...projectForm, live_link: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-xs font-bold outline-none" />
                      </div>
                      <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">Archive Project</button>
                   </form>
                )}

                {/* 4. POST */}
                {activeModal === 'post' && (
                   <form onSubmit={handleAddPost} className="space-y-4">
                      <input required placeholder="Headline" value={postForm.title} onChange={(e) => setPostForm({...postForm, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none" />
                      <textarea required placeholder="Share an insight or update..." value={postForm.description} onChange={(e) => setPostForm({...postForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm h-32 outline-none resize-none" />
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
                           <ImageIcon className="w-4 h-4 text-slate-500" />
                           <span className="text-[10px] font-bold uppercase text-slate-600">{selectedPostFile ? "Media Selected" : "Attach Media"}</span>
                           <input type="file" className="hidden" onChange={(e) => setSelectedPostFile(e.target.files[0])} />
                        </label>
                        {selectedPostFile && <span className="text-[10px] text-blue-500 font-bold truncate max-w-[150px]">{selectedPostFile.name}</span>}
                      </div>
                      <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-full font-black text-xs uppercase tracking-widest">Transmit Post</button>
                   </form>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;