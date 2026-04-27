import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Sparkles, Loader2, ArrowRight, Briefcase, GraduationCap, Users } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    role: 'learner' // options: learner, mentor, recruiter
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('http://localhost:8000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      alert(`Account created successfully! Welcome to the CoDesign ecosystem.`);
      navigate('/login');
      
    } catch (err) {
      console.error("Registration Error:", err);
      const errorMessage = err.response?.data?.detail || "Registration failed. Please check your details.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[95vh] flex items-center justify-center bg-[#F8FAFC] px-4 py-16">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] right-[5%] w-[35%] h-[35%] rounded-full bg-emerald-50/60 blur-[120px]" />
        <div className="absolute bottom-[5%] left-[5%] w-[40%] h-[40%] rounded-full bg-indigo-50/60 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[550px]">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-emerald-200 mb-6 transform transition-hover hover:rotate-6 duration-300">
            <Sparkles className="text-white w-9 h-9" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic text-center leading-none">
            Co<span className="text-indigo-600">Design</span><br />
            <span className="text-[12px] tracking-[0.4em] not-italic text-slate-400 mt-2 block">Registration Protocol</span>
          </h1>
          <p className="text-slate-500 font-medium mt-4 text-center px-6">Identify your objective and join the creative frontier.</p>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-[3rem] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.06)] p-8 md:p-12 backdrop-blur-sm">
          <form onSubmit={handleRegister} className="space-y-7">
            
            {/* ROLE SELECTOR: 3-Column Grid */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Select Path</label>
              <div className="grid grid-cols-3 gap-3 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
                {[
                  { id: 'learner', icon: GraduationCap, label: 'Learner' },
                  { id: 'mentor', icon: Users, label: 'Mentor' },
                  { id: 'recruiter', icon: Briefcase, label: 'Recruiter' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({...formData, role: item.id})}
                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex flex-col items-center justify-center gap-2 border ${
                      formData.role === item.id 
                        ? 'bg-white text-emerald-600 shadow-sm border-slate-200 scale-[1.02]' 
                        : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-white/50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${formData.role === item.id ? 'text-emerald-500' : 'text-slate-300'}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name / Entity</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Alex Rivera or DesignCorp"
                    className="block w-full pl-12 pr-4 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Terminal</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    required
                    placeholder="name@nexus.com"
                    className="block w-full pl-12 pr-4 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••••••"
                    className="block w-full pl-12 pr-4 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="relative w-full group pt-4"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-400 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
              <div className={`relative flex items-center justify-center w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.4em] text-white transition-all ${
                isLoading ? 'bg-slate-400' : 'bg-slate-900 group-hover:bg-emerald-600'
              }`}>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Initialize Protocol
                    <ArrowRight className="ml-3 w-4 h-4 transition-transform group-hover:translate-x-2" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              Already an operative?{' '}
              <button 
                onClick={() => navigate('/login')} 
                className="text-emerald-600 hover:text-emerald-700 transition-colors ml-2 font-black border-b-2 border-emerald-100 hover:border-emerald-600"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;