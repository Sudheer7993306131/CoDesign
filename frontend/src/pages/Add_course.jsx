import React, { useState, useRef } from 'react';
import { 
  Upload, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Link as LinkIcon, 
  BookOpen, 
  Layers, 
  Tags 
} from 'lucide-react';

const AddCourse = () => {
  // 1. State Management
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    category: 'UI/UX',
    level: 'Beginner', // Matches your new backend field
    external_link: '',
    skills_covered: '',
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });
  
  const fileInputRef = useRef(null);

  // 2. Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    // IMPORTANT: FormData keys must match FastAPI Form(...) parameters
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('instructor', formData.instructor);
    data.append('category', formData.category);
    data.append('level', formData.level); // Sending the new field
    data.append('external_link', formData.external_link);
    data.append('skills_covered', formData.skills_covered);
    data.append('image', image);

    try {
      const response = await fetch('http://localhost:8000/api/courses/', {
        method: 'POST',
        body: data, // Browser sets Content-Type to multipart/form-data automatically
      });

      if (response.ok) {
        const result = await response.json();
        setStatus({ type: 'success', message: `Successfully published! Course ID: ${result.id}` });
        
        // Reset form on success
        setFormData({
          title: '',
          description: '',
          instructor: '',
          category: 'UI/UX',
          level: 'Beginner',
          external_link: '',
          skills_covered: '',
        });
        setImage(null);
        setImagePreview(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload course');
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Publish New Course</h1>
          <p className="text-slate-500">Add high-quality resources to the CoDesign database.</p>
        </div>

        {/* Status Toast */}
        {status.type && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center shadow-sm animate-in fade-in slide-in-from-top-4 ${
            status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="mr-3" /> : <XCircle className="mr-3" />}
            <span className="font-medium">{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-2xl shadow-slate-200/60 rounded-3xl overflow-hidden border border-slate-100">
          <div className="p-8 md:p-12 space-y-8">
            
            {/* Title Section */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Course Identity</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title}
                placeholder="Course Title (e.g., Master Figma Auto-Layout)"
                onChange={handleChange} 
                className="w-full text-xl font-semibold px-0 py-2 border-b-2 border-slate-200 focus:border-blue-500 outline-none transition-colors placeholder:text-slate-300"
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Instructor */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Instructor</label>
                <input 
                  type="text" 
                  name="instructor" 
                  value={formData.instructor}
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition outline-none" 
                  required 
                />
              </div>

              {/* External Link */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center">
                  <LinkIcon className="w-4 h-4 mr-2" /> Course URL
                </label>
                <input 
                  type="url" 
                  name="external_link" 
                  value={formData.external_link}
                  placeholder="https://..."
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition outline-none" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center">
                  <Tags className="w-4 h-4 mr-2" /> Category
                </label>
                <select 
                  name="category" 
                  value={formData.category}
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition outline-none appearance-none"
                >
                  <option value="UI/UX">UI/UX Design</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Full Stack">Full Stack Development</option>
                </select>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center">
                  <Layers className="w-4 h-4 mr-2" /> Difficulty Level
                </label>
                <select 
                  name="level" 
                  value={formData.level}
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition outline-none appearance-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Skills Covered (Comma Separated)</label>
              <input 
                type="text" 
                name="skills_covered" 
                value={formData.skills_covered}
                placeholder="Figma, Prototype, UX Research..."
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition outline-none" 
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Description</label>
              <textarea 
                name="description" 
                value={formData.description}
                onChange={handleChange} 
                rows="4"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition outline-none resize-none"
                placeholder="What is this course about?"
              ></textarea>
            </div>

            {/* Image Upload Area */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Course Thumbnail</label>
              <div 
                onClick={() => fileInputRef.current.click()}
                className={`relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-8
                  ${imagePreview ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
              >
                {imagePreview ? (
                  <div className="relative w-full flex flex-col items-center">
                    <img src={imagePreview} alt="Preview" className="h-48 w-full object-cover rounded-lg shadow-lg" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                      <p className="text-white font-medium flex items-center"><Upload className="mr-2" /> Change Image</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                      <Upload className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-slate-600 font-medium">Click to upload or drag & drop</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG or WebP (Max 10MB)</p>
                  </>
                )}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  required={!imagePreview}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-8 py-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center text-slate-500 text-sm">
              <BookOpen className="w-4 h-4 mr-2" />
              This course will be visible to all students instantly.
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full md:w-auto min-w-[200px] flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-white shadow-xl transition-all
                ${loading ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 active:scale-95'}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5 mr-3" />
                  Publish Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;