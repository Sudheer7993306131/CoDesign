import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Globe, Clock, BarChart, CheckCircle, Star } from 'lucide-react';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevels, setSelectedLevels] = useState([]); // New state for multi-level filtering
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const url = activeFilter === 'All' 
          ? 'http://localhost:8000/api/courses/' 
          : `http://localhost:8000/api/courses/?category=${activeFilter}`;
        const response = await fetch(url);
        const data = await response.json();
        setCourses(data);
      } catch (error) { 
        console.error("Fetch error:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchCourses();
  }, [activeFilter]);

  // --- HELPER: TOGGLE LEVEL FILTERS ---
  const handleLevelChange = (level) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level) // Remove if already there
        : [...prev, level]             // Add if not there
    );
  };

  // --- HELPER: CALCULATE AVERAGE RATING ---
  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return { avg: "0.0", count: 0 };
    const total = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return {
      avg: (total / reviews.length).toFixed(1),
      count: reviews.length
    };
  };

  // --- COMBINED FILTER LOGIC ---
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(course.level);
    
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* 1. ACADEMIC HERO SECTION */}
      <section className="bg-[#00255c] py-16 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="md:w-3/5 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Start, switch, or advance <br/> your career with CoDesign
            </h1>
            <p className="text-lg text-slate-200 mb-8 max-w-xl">
              Learn professional skills from industry leaders. Master UI/UX, Graphic Design, and Digital Strategy.
            </p>
            
            <div className="flex w-full max-w-lg bg-white rounded-lg p-1 shadow-lg">
              <input 
                type="text" 
                placeholder="What do you want to learn?"
                className="flex-1 px-4 py-3 text-slate-700 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-bold transition-all">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FILTER STRIP */}
      <div className="border-b border-slate-200 sticky top-0 bg-white z-40">
        <div className="max-w-7xl mx-auto px-8 flex items-center gap-8 h-16 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {['All', 'UI/UX', 'Graphic Design', 'Web Design', 'Digital Marketing'].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveFilter(cat)}
              className={`text-sm font-semibold h-full px-2 border-b-2 transition-all ${
                activeFilter === cat ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-12 px-8 flex flex-col lg:flex-row gap-12">
        {/* SIDEBAR FILTERS */}
        <aside className="hidden lg:block w-64 shrink-0">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Filter By</h3>
              {selectedLevels.length > 0 && (
                <button 
                  onClick={() => setSelectedLevels([])}
                  className="text-[10px] text-blue-600 font-bold hover:underline"
                >
                  CLEAR ALL
                </button>
              )}
           </div>
           
           <div className="space-y-8">
              <div>
                 <h4 className="font-bold text-sm mb-4">Level</h4>
                 {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                    <label key={lvl} className="flex items-center gap-3 text-sm text-slate-600 mb-3 cursor-pointer hover:text-blue-600">
                       <input 
                         type="checkbox" 
                         className="rounded text-blue-600 focus:ring-blue-500" 
                         checked={selectedLevels.includes(lvl)}
                         onChange={() => handleLevelChange(lvl)}
                       /> 
                       {lvl}
                    </label>
                 ))}
              </div>
           </div>
        </aside>

        {/* 3. COURSE GRID */}
        <section className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-96 bg-slate-100 rounded-lg animate-pulse" />)}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredCourses.map((course) => {
                const { avg, count } = getAverageRating(course.reviews);
                return (
                  <Link 
                    to={`/course/${course._id}`} 
                    key={course._id} 
                    className="group bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-xl transition-all flex flex-col"
                  >
                    <div className="relative h-48">
                      <img src={course.image_url} className="w-full h-full object-cover" alt={course.title} />
                      <div className="absolute top-4 left-4 bg-white/95 px-2 py-1 rounded text-[10px] font-bold text-slate-900 flex items-center gap-1 shadow-sm">
                         <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 
                         <span>{avg}</span>
                         <span className="text-slate-400 font-medium">({count})</span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {course.category}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 text-sm mb-6 line-clamp-2">{course.description}</p>
                      
                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                         <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Self-Paced</span>
                            <span className="flex items-center gap-1">
                                <BarChart className={`w-3.5 h-3.5 ${course.level === 'Advanced' ? 'text-red-500' : 'text-blue-500'}`} /> 
                                {course.level}
                            </span>
                         </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-500">No courses match your current filters.</p>
              <button 
                onClick={() => {setSearchQuery(''); setSelectedLevels([]);}}
                className="mt-4 text-blue-600 font-bold text-sm"
              >
                Reset all filters
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CourseList;