import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
const AuthService = {
  logout: () => {
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
  }
};

const CourseList = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetails'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const MentorSection = lazy(() => import('./pages/MentorSection'));
const AddCourse = lazy(() => import('./pages/Add_course'));
const CommunityHome = lazy(() => import('./pages/CommunityHome'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ExploreFeed = lazy(() => import('./pages/ExploreFeed'));
const UserDirectory = lazy(() => import('./pages/UsersDirectory'));
const JobBoard = lazy(() => import('./pages/JobBoard'));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Initializing Protocol...</p>
  </div>
);

const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(() => {
    const name = localStorage.getItem('user_name');
    const role = localStorage.getItem('user_role');
    const email = localStorage.getItem('user_email');
    return (name && email) ? { name, role, email } : null;
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Sync state across multiple tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      // If user data is cleared in another tab, log out here too
      if ((e.key === 'user_email' || e.key === 'user_name') && !e.newValue) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  /**
   * FIXED LOGOUT HANDLER
   * We clear storage AND state simultaneously to trigger an immediate re-render.
   */
  const handleLogout = () => {
    try {
      AuthService.logout(); // Clear LocalStorage
    } catch (error) {
      console.error("Logout service failed:", error);
    }
    
    setUser(null); // Clear React State (This updates the UI instantly)
    setIsDropdownOpen(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm h-16 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center">
            
            {/* LEFT: LOGO & NAV LINKS */}
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-black italic uppercase tracking-tighter text-indigo-600 mr-12 transition-transform hover:scale-105">
                Co<span className="text-slate-900">Design</span>
              </Link>
              
              <div className="hidden md:flex space-x-8 items-center text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                <Link to="/" className="hover:text-indigo-800 transition-colors">Courses</Link>
                <Link to="/mentor" className="hover:text-indigo-800 transition-colors">Mentorship</Link>
                <Link to="/jobs" className="hover:text-indigo-800 transition-colors">Jobs</Link>
                <Link to="/community" className="hover:text-indigo-800 transition-colors">Community</Link>
                <Link to="/explore" className="hover:text-indigo-800 transition-colors">Explore</Link>
                <Link to="/users" className="hover:text-indigo-800 transition-colors">Connect</Link>
              </div>
            </div>

            {/* RIGHT: USER PROFILE DROPDOWN */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="relative flex items-center gap-4">
                  
                  <div className="hidden sm:flex flex-col items-end leading-none">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">
                      {user.name}
                    </span>
                    <span className="text-[8px] text-indigo-500 font-black uppercase tracking-widest mt-1">
                      {user.role}
                    </span>
                  </div>

                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 text-white font-black text-sm uppercase shadow-lg hover:bg-indigo-600 transition-all focus:outline-none"
                  >
                    {user.name ? user.name.charAt(0) : 'U'}
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                      <div className="absolute right-0 top-full mt-3 w-52 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 py-3">
                        <Link 
                          to={`/profile/${user.email}`} 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          My Profile
                        </Link>

                        {user?.role === 'admin' && (
                          <Link 
                            to="/add" 
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            Add Course
                          </Link>
                        )}

                        <button 
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Login</Link>
                  <Link to="/register" className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all">
                    Join
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        <main>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<CourseList />} />
              <Route path="/course/:id" element={<CourseDetail />} />
              <Route path="/login" element={<Login onLoginSuccess={handleLogin} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/mentor" element={<MentorSection />} />
              <Route path="/explore" element={<ExploreFeed />} />
              <Route path="/users" element={<UserDirectory />} />

              {/* Protected Routes */}
              <Route path="/jobs" element={<ProtectedRoute user={user}><JobBoard /></ProtectedRoute>} />
              <Route path="/profile/:email" element={<ProtectedRoute user={user}><ProfilePage /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute user={user}><CommunityHome /></ProtectedRoute>} />
              <Route path="/add" element={<ProtectedRoute user={user} allowedRoles={['admin']}><AddCourse /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <footer className="bg-white border-t border-slate-100 py-12 mt-20 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
            © 2026 CoDesign Academy • Establishing The Standard
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;