import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const data = response.data;

      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('user_name', data.name);
        localStorage.setItem('user_email', formData.email);

        axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

        if (onLoginSuccess) {
            onLoginSuccess({ name: data.name, role: data.role, email: formData.email });
        }

        // Professional Toast/Alert would be better here, but keeping logic consistent
        if (data.role === 'mentor') {
          navigate('/mentor-dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error("Login Error:", err);
      // You could add a custom error state to display a red banner instead of an alert
      alert(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-[#F8FAFC] px-4">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-50 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-50 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[440px]">
        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 mb-4 transform transition-transform hover:rotate-12">
            <ShieldCheck className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
            Co<span className="text-indigo-600">Design</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Welcome back to the creative frontier.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 md:p-10 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
                Professional Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                  type="email" 
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  placeholder="name@company.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Secure Password
                </label>
                <button type="button" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider">
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                  type="password" 
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  placeholder="••••••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="relative w-full group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className={`relative flex items-center justify-center w-full py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] text-white transition-all ${
                isLoading ? 'bg-slate-400' : 'bg-slate-900 group-hover:bg-indigo-600'
              }`}>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign Into Account
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-white px-4 text-slate-400">New to CoDesign?</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/register')} 
            className="w-full py-4 border-2 border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all"
          >
            Create Professional Profile
          </button>
        </div>

        {/* Footer Security Note */}
        <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Protected by 256-bit AES Encryption
        </p>
      </div>
    </div>
  );
};

export default Login; 